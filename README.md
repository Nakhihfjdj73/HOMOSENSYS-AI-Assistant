# Smart India Hackathon 2026 — SIH26174

## BAS Onboard AI Assistant — full-stack MVP

A demo-ready, end-to-end MVP for onboard human-activity recognition and deterministic experiment-sequence monitoring in microgravity environments. The original frontend design from the supplied Project Bolt ZIP is preserved; it now consumes the FastAPI backend instead of static mock data.

## What is included

- **React/Vite/Tailwind operations dashboard** — mission overview, live monitoring, experiments, experiment details, microgravity status, alerts, and audit logs.
- **FastAPI backend** — REST API, WebSocket live monitoring feed, SQLite-by-default persistence, PostgreSQL-compatible configuration, and automatic demo catalogue seeding.
- **AI engine** — mock object detection, pose estimation, hand/object tracking, temporal HAR heuristics, deterministic FSM validation, alert routing, and grounded template guidance.
- **Three demo scenarios** — `nominal`, `low_confidence`, and `violation` to exercise the CORRECT, WARNING, and SEQUENCE_VIOLATION paths.
- **No hardware or external AI keys required** — DEMO_MODE is enabled by default.

## Architecture

```
Camera/simulator
  -> object detection + pose + hand/object tracking
  -> frame buffer + temporal HAR
  -> deterministic experiment FSM
  -> validation + persistence + alerts
  -> grounded guidance + FastAPI WebSocket
  -> React aerospace operations dashboard
```

The FSM is the source of truth for progress and safety validation. The assistant receives only the FSM's structured state packet; user text is used for fixed response routing, not free-form generation.

## Run locally — no Docker required

### 1. Backend

From the repository root, create/activate a virtual environment and install dependencies:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install and start the API:

```bash
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --reload --port 8000
```

The default database is `storage/space_monitoring.db`, created automatically. The API docs are at <http://127.0.0.1:8000/docs>.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api`, `/health`, and `/ws` to the backend at `http://127.0.0.1:8000`.

### 3. Use the demo

1. Open **Live Monitoring**.
2. Choose **Nominal**, **Low Confidence**, or **Violation**.
3. Click **START SESSION**.
4. Watch the simulated camera boxes, FSM progress, guidance, logs, and alerts update live.
5. Open **Alerts & Events** to acknowledge generated alerts.

The nominal scenario completes the seeded `BAS-EXP-001` workflow automatically. Low-confidence and violation scenarios intentionally remain active so their warnings/critical alerts can be inspected; click **STOP SESSION** when finished.

## System Architecture 
<img width="3456" height="1944" alt="SIH26174_Pastel_Architecture" src="https://github.com/user-attachments/assets/68ac6aa1-2f98-4a06-a7b4-9c2336635c02" />

## Demo UI/UX 
<img width="1919" height="871" alt="Screenshot 2026-09-06 220200" src="https://github.com/user-attachments/assets/6b8e9ec8-4531-497e-b8b0-59c77cb7a109" />
<img width="1919" height="868" alt="Screenshot 2026-09-06 220316" src="https://github.com/user-attachments/assets/98d21dc3-fca8-4a4a-a0b9-3377f80fb59c" />
<img width="1919" height="869" alt="Screenshot 2026-09-06 213627" src="https://github.com/user-attachments/assets/367db155-76c4-4215-a6fc-b1bd6727194d" />


## Configuration

Copy `.env.example` to `.env` if overrides are needed. Important settings:

| Variable | Default | Purpose |
|---|---:|---|
| `DATABASE_URL` | SQLite in `storage/` | Set PostgreSQL URL for deployment |
| `DEMO_MODE` | `True` | Use deterministic simulated activities |
| `CONFIDENCE_THRESHOLD` | `0.70` | FSM warning threshold |
| `FRAME_BUFFER_SIZE` | `16` | Temporal feature window |
| `INFERENCE_INTERVAL_MS` | `1000` | Demo frame interval |
| `SECRET_KEY` | development placeholder | Replace before deployment |

## API highlights

- `GET /health`
- `GET /api/v1/dashboard`
- `GET /api/v1/experiments`
- `GET /api/v1/experiments/{id-or-code}`
- `POST /api/v1/monitoring/start`
- `POST /api/v1/monitoring/stop/{session_id}`
- `GET /api/v1/monitoring/activities/current`
- `GET /api/v1/monitoring/scenarios`
- `GET /api/v1/alerts`
- `GET /api/v1/alerts/summary`
- `POST /api/v1/alerts/{alert_id}/acknowledge`
- `GET /api/v1/logs`
- `POST /api/v1/assistant/chat`
- `GET /api/v1/system/environment`
- `WS /ws/monitoring`

## Validation completed

- Frontend TypeScript check: `npm run typecheck`
- Frontend production build: `npm run build`
- Backend import/compile checks
- API smoke checks across health, dashboard, experiments, system, alerts, logs, and assistant endpoints
- FSM assertions covering correct steps and duplicate frame detections
- End-to-end demo checks for nominal, low-confidence, and violation scenarios

## Deployment files

`backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`, and `database/schema.sql` are included for deployment environments, but Docker is not required for local development.

## License

See project documentation for licensing terms.

**Built for SIH26174 — Smart India Hackathon 2026**
