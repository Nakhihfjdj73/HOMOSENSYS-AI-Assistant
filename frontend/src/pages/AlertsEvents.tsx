import { useMemo, useState } from 'react';
import { AlertTriangle, Info, Bell, ShieldAlert, Check } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import KpiCard from '@/components/common/KpiCard';
import StatusBadge from '@/components/common/StatusBadge';
import { api } from '@/services/api';
import { useQuery } from '@/hooks/useApi';
import { toAlertEvent } from '@/services/adapters';
import type { AlertSeverity } from '@/types';

const filters = ['All', 'Info', 'Warning', 'Critical'] as const;

const ALERTS_POLL_MS = 4000;

const severityConfig: Record<AlertSeverity, { icon: typeof Info; variant: 'success' | 'warning' | 'critical' | 'info' | 'neutral'; label: string }> = {
  critical: { icon: ShieldAlert, variant: 'critical', label: 'CRITICAL' },
  warning: { icon: AlertTriangle, variant: 'warning', label: 'WARNING' },
  info: { icon: Info, variant: 'info', label: 'INFO' },
  system: { icon: Bell, variant: 'neutral', label: 'SYSTEM' },
};

export default function AlertsEvents() {
  const [filter, setFilter] = useState<typeof filters[number]>('All');
  const [acknowledging, setAcknowledging] = useState<number | null>(null);

  const { data: alertData, error, refetch } = useQuery(() => api.listAlerts(200), {
    intervalMs: ALERTS_POLL_MS,
  });
  const { data: summary, refetch: refetchSummary } = useQuery(() => api.getAlertSummary(), {
    intervalMs: ALERTS_POLL_MS,
  });

  const alerts = useMemo(() => (alertData ?? []).map((a) => toAlertEvent(a)), [alertData]);
  const acknowledgedIds = useMemo(
    () => new Set((alertData ?? []).filter((a) => a.acknowledged).map((a) => String(a.id))),
    [alertData],
  );

  const filtered = alerts.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Info') return a.severity === 'info' || a.severity === 'system';
    if (filter === 'Warning') return a.severity === 'warning';
    if (filter === 'Critical') return a.severity === 'critical';
    return true;
  });

  const handleAcknowledge = async (id: string) => {
    const numericId = Number(id);
    setAcknowledging(numericId);
    try {
      await api.acknowledgeAlert(numericId);
      refetch();
      refetchSummary();
    } finally {
      setAcknowledging(null);
    }
  };

  return (
    <AppLayout title="Alerts & Events" subtitle="Real-time event and alert center for onboard experiment monitoring.">
      {error && (
        <div className="panel border-redx-500/30 p-3 mb-4">
          <p className="text-xs text-redx-400">Backend unreachable — {error}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Events" value={summary?.total ?? 0} icon={<Bell className="w-4 h-4" />} />
        <KpiCard label="Active Alerts" value={summary?.active ?? 0} icon={<AlertTriangle className="w-4 h-4" />} variant="warning" />
        <KpiCard label="Warnings" value={summary?.warnings ?? 0} icon={<AlertTriangle className="w-4 h-4" />} variant="warning" />
        <KpiCard
          label="Critical"
          value={summary?.critical ?? 0}
          icon={<ShieldAlert className="w-4 h-4" />}
          variant={(summary?.critical ?? 0) > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
                : 'bg-space-800/60 text-space-300 border border-space-600/40 hover:bg-space-700/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          const isAcknowledged = acknowledgedIds.has(alert.id);

          return (
            <div
              key={alert.id}
              className="panel p-4 hover:border-space-500/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                  alert.severity === 'critical' ? 'bg-redx-500/15' :
                  alert.severity === 'warning' ? 'bg-amberx-500/15' :
                  alert.severity === 'info' ? 'bg-accent-500/15' :
                  'bg-space-700/40'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    alert.severity === 'critical' ? 'text-redx-400' :
                    alert.severity === 'warning' ? 'text-amberx-400' :
                    alert.severity === 'info' ? 'text-accent-400' :
                    'text-space-300'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
                    <span className="text-xs font-mono text-space-400">{alert.time}</span>
                    {isAcknowledged && (
                      <span className="badge bg-tealx-500/15 text-tealx-400 border border-tealx-500/30">
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{alert.title}</div>
                  {alert.action && (
                    <div className="text-xs text-space-300 mt-1">
                      <span className="text-space-400">Action:</span> {alert.action}
                    </div>
                  )}
                </div>

                {!isAcknowledged && (
                  <button
                    onClick={() => void handleAcknowledge(alert.id)}
                    disabled={acknowledging === Number(alert.id)}
                    className="btn-ghost shrink-0 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    ACK
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-space-500 mx-auto mb-3" />
          <p className="text-sm text-space-300">
            No alerts recorded. Run the low-confidence or violation scenario to generate some.
          </p>
        </div>
      )}
    </AppLayout>
  );
}
