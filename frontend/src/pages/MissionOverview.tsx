import { useState } from 'react';
import { Bot, Activity, FlaskConical, Gauge, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import KpiCard from '@/components/common/KpiCard';
import Panel from '@/components/common/Panel';
import ProgressBar from '@/components/common/ProgressBar';
import StatusDot from '@/components/common/StatusDot';
import AssistantPanel from '@/components/assistant/AssistantPanel';
import { api } from '@/services/api';
import { useQuery } from '@/hooks/useApi';
import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import { humanizeActivity } from '@/services/adapters';

const DASHBOARD_POLL_MS = 5000;

export default function MissionOverview() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { data: dashboard, error } = useQuery(() => api.getDashboard(), {
    intervalMs: DASHBOARD_POLL_MS,
  });
  const { frame } = useMonitoringSocket();

  // A live frame is fresher than the polled snapshot, so it wins when present.
  const currentActivity = frame
    ? humanizeActivity(frame.detected_activity)
    : dashboard?.current_activity ?? '—';
  const progress = frame?.progress ?? dashboard?.active_experiment_progress ?? 0;
  const experimentCode = dashboard?.active_experiment_code ?? '—';
  const experimentTitle = dashboard?.active_experiment_title ?? 'No experiment loaded';
  const status = dashboard?.system_status;
  const systemOperational = status?.ai_engine_online && status?.database_connected;

  const systemHealth = [
    { label: 'Monitoring System', status: status?.ai_engine_online ? 'Operational' : 'Offline' },
    { label: 'AI Assistant', status: status?.model_loaded ? 'Ready' : 'Unavailable' },
    { label: 'Experiment Workflow', status: (dashboard?.active_sessions ?? 0) > 0 ? 'Active' : 'Idle' },
    { label: 'Camera Feed', status: status?.camera_stream_active ? 'Connected' : 'Standby' },
  ];

  const stepLabel = frame
    ? `Step ${frame.step_number} of ${frame.total_steps}`
    : `${dashboard?.active_sessions ?? 0} active session(s)`;

  return (
    <>
      <AppLayout title="Mission Overview" subtitle="Real-time monitoring of onboard experiments and astronaut activity.">
        {error && (
          <div className="panel border-redx-500/30 p-3 mb-4">
            <p className="text-xs text-redx-400">Backend unreachable — {error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Active Experiment" value={experimentCode} icon={<FlaskConical className="w-4 h-4" />} variant="accent" />
          <KpiCard label="Current Activity" value={currentActivity} icon={<Activity className="w-4 h-4" />} />
          <KpiCard label="Experiment Progress" value={`${Math.round(progress)}%`} icon={<Gauge className="w-4 h-4" />} variant="success" />
          <KpiCard
            label="System Status"
            value={systemOperational ? 'Operational' : 'Degraded'}
            icon={<CheckCircle2 className="w-4 h-4" />}
            variant={systemOperational ? 'success' : 'warning'}
          />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Current Experiment */}
          <Panel title="Current Experiment">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="kpi-label mb-1">Experiment ID</div>
                  <div className="text-sm font-mono text-white">{experimentCode}</div>
                </div>
                <div>
                  <div className="kpi-label mb-1">Environment</div>
                  <div className="text-sm text-space-100">Microgravity</div>
                </div>
              </div>
              <div>
                <div className="kpi-label mb-1">Experiment</div>
                <div className="text-sm text-white">{experimentTitle}</div>
              </div>
              <div>
                <div className="kpi-label mb-1">Current Step</div>
                <div className="text-sm text-space-100">{stepLabel}</div>
              </div>
              <div className="pt-2">
                <ProgressBar value={Math.round(progress)} showLabel variant="accent" />
              </div>
            </div>
          </Panel>

          {/* System Health */}
          <Panel title="System Health">
            <div className="space-y-3">
              {systemHealth.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-space-600/20 last:border-0">
                  <span className="text-sm text-space-200">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="success" pulse />
                    <span className="text-sm font-medium text-tealx-400">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Recent Activity Timeline */}
        <Panel title="Recent Activity Timeline">
          {dashboard?.recent_timeline.length ? (
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-space-600/40" />
              {dashboard.recent_timeline.map((item, i) => (
                <div key={`${item.time}-${i}`} className="relative flex items-start gap-4 pb-4 last:pb-0">
                  <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full bg-accent-400 border-2 border-space-900" />
                  <span className="text-xs font-mono text-accent-300 shrink-0 w-20">{item.time}</span>
                  <span className="text-sm text-space-100">{item.event}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-space-300 py-4">
              No activity recorded yet. Start a monitoring session to populate the timeline.
            </p>
          )}
        </Panel>

        {/* AI Assistant button */}
        <button
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full bg-accent-500 hover:bg-accent-400 text-white shadow-lg shadow-accent-500/20 transition-colors z-30"
        >
          <Bot className="w-5 h-5" />
          <span className="text-sm font-medium">AI Assistant</span>
        </button>
      </AppLayout>
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}
