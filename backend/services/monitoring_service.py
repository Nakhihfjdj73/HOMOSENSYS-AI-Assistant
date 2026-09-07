"""
Monitoring service — owns active inference sessions and the AI pipeline loop.

Each session runs an asyncio task that pushes frames through
CV -> HAR -> FSM -> persistence -> WebSocket broadcast. In DEMO_MODE the
activity labels come from a scripted scenario so demos are reproducible;
otherwise they come from the HAR model over the frame buffer.
"""
import asyncio
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Dict, List, Optional, Tuple

import numpy as np
from loguru import logger
from sqlalchemy.orm import Session

from ai_engine.activity_recognition.base import FrameBuffer
from ai_engine.activity_recognition.temporal_har import TemporalHAR
from ai_engine.computer_vision.object_detector import MockDetector
from ai_engine.computer_vision.pose_estimator import MockPoseEstimator
from ai_engine.computer_vision.tracker import MockTracker
from ai_engine.experiment_engine.fsm import ExperimentFSM
from ai_engine.experiment_engine.validator import ExperimentValidator
from ai_engine.nlp.template_fallback import TemplateLLM

from config import settings
from db import models
from db.session import SessionLocal
from schemas.dto import ValidationStatus, WebSocketPayload
from services.scenarios import SCENARIO_NAMES, build_scenario

# Placeholder frame: the mock CV components only read its shape.
MOCK_FRAME = np.zeros((480, 640, 3), dtype=np.uint8)

# Frames held per scripted step, so a demo viewer can read each transition.
FRAMES_PER_SCENARIO_STEP = 3

BroadcastCallback = Callable[[Dict[str, Any]], Awaitable[None]]


class ActiveSession:
    """Runtime state for one active monitoring session."""

    def __init__(
        self,
        session_id: int,
        experiment_id: int,
        expected_sequence: List[str],
        scenario: str = "nominal",
    ):
        self.session_id = session_id
        self.experiment_id = experiment_id
        self.scenario = scenario
        self.scenario_steps = build_scenario(expected_sequence, scenario)
        self.started_at = datetime.now(timezone.utc)
        self.frames_processed = 0
        self.activities_recorded = 0
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.latest_guidance: str = ""

        self.frame_buffer = FrameBuffer(max_size=settings.FRAME_BUFFER_SIZE)
        self.detector = MockDetector()
        self.pose_estimator = MockPoseEstimator()
        self.tracker = MockTracker()
        self.har = TemporalHAR(
            self.frame_buffer,
            confidence_threshold=settings.CONFIDENCE_THRESHOLD,
        )
        self.fsm = ExperimentFSM(
            expected_sequence,
            confidence_threshold=settings.CONFIDENCE_THRESHOLD,
        )
        self.validator = ExperimentValidator()
        self.llm = TemplateLLM()


class MonitoringService:
    """Starts and stops inference sessions; fans payloads out to WebSocket clients."""

    def __init__(self):
        self.active_sessions: Dict[int, ActiveSession] = {}
        self.broadcast_callbacks: List[BroadcastCallback] = []
        self.last_payload: Optional[WebSocketPayload] = None

    # ── broadcast plumbing ────────────────────────────────────────────────────

    def register_broadcast_callback(self, callback: BroadcastCallback) -> None:
        if callback not in self.broadcast_callbacks:
            self.broadcast_callbacks.append(callback)

    def unregister_broadcast_callback(self, callback: BroadcastCallback) -> None:
        if callback in self.broadcast_callbacks:
            self.broadcast_callbacks.remove(callback)

    async def _broadcast(self, payload: WebSocketPayload) -> None:
        self.last_payload = payload
        message = payload.model_dump()

        for callback in list(self.broadcast_callbacks):
            try:
                await callback(message)
            except Exception as exc:
                logger.warning(f"Dropping broadcast callback after failure: {exc}")
                self.unregister_broadcast_callback(callback)

    # ── session lifecycle ─────────────────────────────────────────────────────

    async def start_session(
        self,
        db: Session,
        experiment_id: int,
        astronaut_id: Optional[int],
        scenario: str = "nominal",
    ) -> models.ExperimentSession:
        """Create the session row and launch its inference loop."""
        steps = (
            db.query(models.ExperimentStep)
            .filter(models.ExperimentStep.experiment_id == experiment_id)
            .order_by(models.ExperimentStep.step_number)
            .all()
        )
        expected_sequence = [step.expected_activity for step in steps]

        db_session = models.ExperimentSession(
            experiment_id=experiment_id,
            astronaut_id=astronaut_id,
            status="IN_PROGRESS",
            started_at=datetime.now(timezone.utc),
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)

        active = ActiveSession(
            session_id=db_session.id,
            experiment_id=experiment_id,
            expected_sequence=expected_sequence,
            scenario=scenario,
        )
        self.active_sessions[db_session.id] = active

        active.running = True
        active.task = asyncio.create_task(self._inference_loop(active))

        logger.info(f"Session {db_session.id} started (scenario={scenario})")
        return db_session

    async def stop_session(
        self,
        db: Session,
        session_id: int,
    ) -> Optional[models.ExperimentSession]:
        """Cancel the inference loop and close out the session row."""
        active = self.active_sessions.pop(session_id, None)
        if active is None:
            return None

        active.running = False
        if active.task and not active.task.done():
            active.task.cancel()
            try:
                await active.task
            except asyncio.CancelledError:
                pass

        db_session = (
            db.query(models.ExperimentSession)
            .filter(models.ExperimentSession.id == session_id)
            .first()
        )
        if db_session:
            db_session.status = "COMPLETED" if active.fsm.is_complete() else "ABORTED"
            db_session.ended_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(db_session)

        logger.info(f"Session {session_id} stopped ({db_session.status if db_session else 'unknown'})")
        return db_session

    async def stop_all(self) -> None:
        """Cancel every running loop — used on application shutdown."""
        for session_id in list(self.active_sessions):
            active = self.active_sessions.pop(session_id)
            active.running = False
            if active.task and not active.task.done():
                active.task.cancel()
                try:
                    await active.task
                except asyncio.CancelledError:
                    pass

    # ── inference loop ────────────────────────────────────────────────────────

    async def _inference_loop(self, active: ActiveSession) -> None:
        """
        Drive frames at a fixed interval until the session is stopped.

        The loop owns its own DB session for its whole lifetime — a request-scoped
        session would be closed as soon as the start_session response returned.
        """
        interval = settings.INFERENCE_INTERVAL_MS / 1000.0
        db = SessionLocal()

        try:
            while active.running:
                try:
                    await self._process_frame(active, db)
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    db.rollback()
                    logger.error(f"Frame processing failed (session {active.session_id}): {exc}")

                await asyncio.sleep(interval)
        except asyncio.CancelledError:
            pass
        finally:
            db.close()

    async def _process_frame(self, active: ActiveSession, db: Session) -> None:
        """Run one frame through the pipeline and broadcast the result."""
        detections = active.detector.detect(MOCK_FRAME)
        poses = active.pose_estimator.estimate_pose(MOCK_FRAME)
        tracks = active.tracker.update(MOCK_FRAME, detections)

        active.frame_buffer.add_frame(
            detector_output=detections,
            pose_output=poses,
            tracker_output=tracks,
        )
        active.frames_processed += 1

        # Motion features need at least two frames to mean anything.
        if len(active.frame_buffer) < 2:
            return

        if settings.DEMO_MODE:
            activity, confidence = self._scripted_activity(active)
        else:
            activity, confidence = active.har.predict()

        result = active.validator.validate(active.fsm, activity, confidence)
        context = result["context"]

        guidance = await active.llm.generate_guidance(active.fsm.get_context())
        active.latest_guidance = guidance

        db_activity = models.Activity(
            session_id=active.session_id,
            detected_activity=activity,
            confidence=confidence,
        )
        db.add(db_activity)
        db.flush()

        db.add(models.ExperimentLog(
            session_id=active.session_id,
            step_number=context.get("step_number"),
            activity_id=db_activity.id,
            validation_status=result["status"],
        ))

        alert_payload = None
        if result["alert_required"]:
            db_alert = models.Alert(
                session_id=active.session_id,
                severity=result["severity"],
                message=result["message"],
            )
            db.add(db_alert)
            db.flush()
            alert_payload = {
                "id": db_alert.id,
                "severity": result["severity"],
                "message": result["message"],
            }

        db.commit()
        active.activities_recorded += 1

        payload = WebSocketPayload(
            timestamp=datetime.now(timezone.utc).isoformat(),
            session_id=active.session_id,
            experiment_id=active.experiment_id,
            detected_activity=activity,
            confidence=round(confidence, 3),
            expected_step=active.fsm.current_expected_activity(),
            step_number=context.get("step_number", 0),
            total_steps=context.get("total_steps", 0),
            status=ValidationStatus(result["status"]),
            bounding_boxes=[
                {
                    "bbox": d["bbox"],
                    "class_name": d["class_name"],
                    "confidence": d["confidence"],
                }
                for d in detections
            ],
            pose_keypoints=[{"keypoints": p["keypoints"]} for p in poses],
            alert=alert_payload,
            fsm_state=active.fsm.state.value,
            progress=round(active.fsm.progress() * 100, 1),
            guidance=guidance,
            completed_activities=list(active.fsm.completed_steps),
        )

        await self._broadcast(payload)

        if active.fsm.is_complete():
            # Mark the session complete in the DB, then stop driving frames.
            db_session = (
                db.query(models.ExperimentSession)
                .filter(models.ExperimentSession.id == active.session_id)
                .first()
            )
            if db_session:
                db_session.status = "COMPLETED"
                db_session.ended_at = datetime.now(timezone.utc)
                db.commit()

            active.running = False
            self.active_sessions.pop(active.session_id, None)
            logger.info(f"Session {active.session_id} completed its sequence")

    def _scripted_activity(self, active: ActiveSession) -> Tuple[str, float]:
        """Next (activity, confidence) from the scenario script."""
        steps = active.scenario_steps
        if not steps:
            return "IDLE", 0.0

        index = min(
            active.activities_recorded // FRAMES_PER_SCENARIO_STEP,
            len(steps) - 1,
        )
        return steps[index]

    # ── queries ───────────────────────────────────────────────────────────────

    def get_active_session_count(self) -> int:
        return len(self.active_sessions)

    def get_session(self, session_id: int) -> Optional[ActiveSession]:
        return self.active_sessions.get(session_id)

    def get_any_session(self) -> Optional[ActiveSession]:
        """Any active session — used when the UI has no explicit session id."""
        return next(iter(self.active_sessions.values()), None)

    def is_session_active(self, session_id: int) -> bool:
        return session_id in self.active_sessions

    @property
    def scenario_names(self) -> Tuple[str, ...]:
        return SCENARIO_NAMES


monitoring_service = MonitoringService()
