import { useEffect, useState } from 'react';
import { Bot, Activity, ListOrdered, CheckCircle2, ArrowRight, Crosshair, Play, Square, AlertTriangle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import CameraFeed from '@/components/monitoring/CameraFeed';
import WorkflowPipeline from '@/components/monitoring/WorkflowPipeline';
import AssistantPanel from '@/components/assistant/AssistantPanel';
import { api } from '@/services/api';
import { useQuery } from '@/hooks/useApi';
import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import { humanizeActivity } from '@/services/adapters';
import type { ScenarioName, ValidationStatus } from '@/types/api';

/** Procedure-status presentation per FSM validation status. */
const STATUS_PRESENTATION: Record<
  ValidationStatus,
  { label: string; color: string; icon: typeof CheckCircle2; note: string }
> = {
  CORRECT: {
    label: 'ON TRACK',
    color: 'text-tealx-400',
    icon: CheckCircle2,
    note: 'Current activity matches the expected experiment workflow.',
  },
  DUPLICATE: {
    label: 'IN PROGRESS',
    color: 'text-accent-300',
    icon: Activity,
    note: 'Step already confirmed — continue with the next activity.',
  },
  WARNING: {
    label: 'LOW CONFIDENCE',
    color: 'text-amberx-400',
    icon: AlertTriangle,
    note: 'Detection confidence is below threshold. Repeat the action in view of the camera.',
  },
  SEQUENCE_VIOLATION: {
    label: 'SEQUENCE VIOLATION',
    color: 'text-redx-400',
    icon: AlertTriangle,
    note: 'Detected activity does not match the expected step. Stop and resume the correct order.',
  },
};

const SCENARIO_LABELS: Record<ScenarioName, string> = {
  nominal: 'Nominal',
  low_confidence: 'Low Confidence',
  violation: 'Violation',
};

export default function LiveMonitoring() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [scenario, setScenario] = useState<ScenarioName>('nominal');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { frame, connection } = useMonitoringSocket();
  const { data: experiments } = useQuery(() => api.listExperiments());
  const { data: sessions } = useQuery(() => api.listSessions(), { intervalMs: 5000 });

  const experiment = experiments?.[0] ?? null;

  // Adopt an already-running session (e.g. after a page reload) so Stop works.
  useEffect(() => {
    if (sessionId !== null) return;
    const running = sessions?.find((s) => s.status === 'IN_PROGRESS');
    if (running) setSessionId(running.id);
  }, [sessions, sessionId]);

  // The backend ends a session on its own once the sequence completes, so drop
  // our handle to it — otherwise Stop would 404 on an already-closed session.
  const sequenceComplete = frame?.fsm_state === 'STEP_COMPLETED';
  useEffect(() => {
    if (sequenceComplete) setSessionId(null);
  }, [sequenceComplete]);

  const handleStart = async () => {
    if (!experiment) return;
    setBusy(true);
    setActionError(null);
    try {
      const response = await api.startMonitoring(experiment.id, scenario);
      setSessionId(response.session_id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not start session');
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    if (sessionId === null) return;
    setBusy(true);
    setActionError(null);
    try {
      await api.stopMonitoring(sessionId);
      setSessionId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not stop session');
    } finally {
      setBusy(false);
    }
  };

  const running = sessionId !== null;
  const presentation = frame ? STATUS_PRESENTATION[frame.status] : null;
  const StatusIcon = presentation?.icon ?? CheckCircle2;

  // Detection summary is grouped by class so each row reflects real confidence.
  const detectionSummary = (() => {
    if (!frame?.bounding_boxes.length) return [];
    const best = new Map<string, number>();
    for (const box of frame.bounding_boxes) {
      const current = best.get(box.class_name) ?? 0;
      if (box.confidence > current) best.set(box.class_name, box.confidence);
    }
    return [...best.entries()].slice(0, 3);
  })();

  return (
    <>
      <AppLayout title="Live Monitoring" subtitle="Real-time onboard camera feed and AI-assisted experiment monitoring.">
        {/* Session controls */}
        <div className="panel p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="kpi-label mb-1">Experiment</div>
              <div className="text-sm text-white">
                {experiment ? `${experiment.code} — ${experiment.title}` : 'Loading…'}
              </div>
            </div>

            <div>
              <div className="kpi-label mb-1">Demo Scenario</div>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as ScenarioName)}
                disabled={running}
                className="input-field appearance-none pr-8 disabled:opacity-50"
              >
                {(Object.keys(SCENARIO_LABELS) as ScenarioName[]).map((name) => (
                  <option key={name} value={name}>{SCENARIO_LABELS[name]}</option>
                ))}
              </select>
            </div>

            {running ? (
              <button onClick={handleStop} disabled={busy} className="btn-primary disabled:opacity-50">
                <Square className="w-3.5 h-3.5" />
                STOP SESSION
              </button>
            ) : (
              <button onClick={handleStart} disabled={busy || !experiment} className="btn-primary disabled:opacity-50">
                <Play className="w-3.5 h-3.5" />
                START SESSION
              </button>
            )}
          </div>
          {actionError && <p className="text-xs text-redx-400 mt-2">{actionError}</p>}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          {/* Left: Camera Feed - takes 2 columns */}
          <div className="xl:col-span-2">
            <Panel title="Live Monitoring Feed" action={
              <span className="badge bg-amberx-500/15 text-amberx-400 border border-amberx-500/30">
                SIMULATED
              </span>
            }>
              <CameraFeed boxes={frame?.bounding_boxes ?? []} connected={connection === 'open' && running} />
            </Panel>
          </div>

          {/* Right: Stacked info cards */}
          <div className="space-y-4">
            {/* Card 1: Current Activity */}
            <Panel title="Current Activity">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent-400" />
                  <span className="text-sm font-semibold text-white">
                    {frame ? humanizeActivity(frame.detected_activity).toUpperCase() : 'AWAITING DETECTION'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-space-300">Confidence</span>
                <span className="text-lg font-mono font-bold text-accent-300">
                  {frame ? `${Math.round(frame.confidence * 100)}%` : '—'}
                </span>
              </div>
            </Panel>

            {/* Card 2: Current Experiment Step */}
            <Panel title="Current Experiment Step">
              <div className="flex items-center gap-2 mb-2">
                <ListOrdered className="w-4 h-4 text-accent-400" />
                <span className="text-[10px] font-mono text-space-300 tracking-wider">
                  STEP {frame?.step_number ?? 0}
                </span>
              </div>
              <div className="text-sm font-semibold text-white mb-2">
                {/* expected_step is null once the FSM has no next step to await. */}
                {frame?.expected_step
                  ? humanizeActivity(frame.expected_step).toUpperCase()
                  : sequenceComplete
                    ? 'SEQUENCE COMPLETE'
                    : 'NOT STARTED'}
              </div>
              <div className="w-full h-1.5 bg-space-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${frame?.progress ?? 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-space-400">
                  Step {frame?.step_number ?? 0} of {frame?.total_steps ?? experiment?.total_steps ?? 0}
                </span>
                <span className="text-xs font-mono text-accent-300">{Math.round(frame?.progress ?? 0)}%</span>
              </div>
            </Panel>

            {/* Card 3: Procedure Status */}
            <Panel title="Procedure Status">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className={`w-5 h-5 ${presentation?.color ?? 'text-space-300'}`} />
                <span className={`text-sm font-bold ${presentation?.color ?? 'text-space-300'}`}>
                  {presentation?.label ?? 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-space-300 leading-relaxed">
                {presentation?.note ?? 'Start a monitoring session to begin validation.'}
              </p>
            </Panel>

            {/* Card 4: AI Assistant Guidance */}
            <Panel title="AI Assistant Guidance">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-accent-400" />
                <span className="text-[10px] font-semibold text-accent-400 tracking-wider">GUIDANCE</span>
              </div>
              <p className="text-xs text-space-200 leading-relaxed mb-3 whitespace-pre-line">
                {frame?.guidance ?? 'Guidance appears here once monitoring begins.'}
              </p>
              <button onClick={() => setAssistantOpen(true)} className="btn-primary w-full justify-center">
                ASK THE ASSISTANT
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Panel>
          </div>
        </div>

        {/* Workflow Pipeline */}
        <WorkflowPipeline />

        {/* Detection summary bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {detectionSummary.length > 0 ? (
            detectionSummary.map(([className, confidence]) => (
              <Panel key={className}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-accent-400" />
                    <span className="text-sm text-space-200">
                      {humanizeActivity(className)} Detection
                    </span>
                  </div>
                  <StatusBadge variant={confidence >= 0.7 ? 'success' : 'warning'}>
                    {Math.round(confidence * 100)}%
                  </StatusBadge>
                </div>
              </Panel>
            ))
          ) : (
            <Panel>
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-space-400" />
                <span className="text-sm text-space-300">No active detections</span>
              </div>
            </Panel>
          )}
        </div>

        {/* AI Assistant button */}
        <button
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full bg-accent-500 hover:bg-accent-400 text-white shadow-lg shadow-accent-500/20 transition-colors z-30"
        >
          <Bot className="w-5 h-5" />
          <span className="text-sm font-medium">AI Assistant</span>
        </button>
      </AppLayout>
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} sessionId={sessionId} />
    </>
  );
}
