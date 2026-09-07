import { Globe, Activity, Eye, Database, TrendingUp, Wind } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Panel from '@/components/common/Panel';
import KpiCard from '@/components/common/KpiCard';
import StatusDot from '@/components/common/StatusDot';
import Gauge from '@/components/charts/Gauge';
import MiniLineChart from '@/components/charts/MiniLineChart';
import { api } from '@/services/api';
import { useQuery } from '@/hooks/useApi';

const metricIcons: Record<string, typeof Globe> = {
  'Microgravity Status': Globe,
  'Experiment Stability': Activity,
  'Monitoring State': Eye,
  'Data Quality': Database,
};

const trendColors = ['#14b8a6', '#f59e0b', '#1a8cff', '#1a8cff'];

const ENVIRONMENT_POLL_MS = 5000;

export default function MicrogravityStatus() {
  const { data, error } = useQuery(() => api.getEnvironment(), {
    intervalMs: ENVIRONMENT_POLL_MS,
  });

  const metrics = data?.metrics ?? [];
  const trends = data?.trends ?? [];
  const gauges = data?.gauges ?? [];

  return (
    <AppLayout title="Microgravity Environment Status" subtitle="Environmental monitoring for onboard scientific experiments.">
      {error && (
        <div className="panel border-redx-500/30 p-3 mb-4">
          <p className="text-xs text-redx-400">Backend unreachable — {error}</p>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => {
          const Icon = metricIcons[m.label] ?? Globe;
          return (
            <KpiCard
              key={m.label}
              label={m.label}
              value={m.value}
              icon={<Icon className="w-4 h-4" />}
              variant="success"
            />
          );
        })}
      </div>

      {/* Large visual status panel */}
      <Panel
        title="Environmental Monitoring"
        action={
          <span className="badge bg-amberx-500/15 text-amberx-400 border border-amberx-500/30">
            SIMULATED DATA
          </span>
        }
      >
        {/* Gauges row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pb-6 border-b border-space-600/30">
          {gauges.map((g) => (
            <div key={g.label} className="panel bg-space-900/40 p-4 flex items-center justify-center">
              <Gauge label={g.label} value={g.value} max={g.max} unit={g.unit} status="nominal" />
            </div>
          ))}
        </div>

        {/* Trend cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {trends.map((trend, i) => (
            <div key={trend.label} className="panel bg-space-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                {i === 0 && <TrendingUp className="w-3.5 h-3.5 text-tealx-400" />}
                {i === 1 && <Wind className="w-3.5 h-3.5 text-amberx-400" />}
                {i >= 2 && <Activity className="w-3.5 h-3.5 text-accent-400" />}
                <span className="text-[10px] font-semibold tracking-wider text-space-300 uppercase">{trend.label}</span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-xl font-mono font-bold text-white">
                  {trend.value}<span className="text-sm text-space-300 ml-1">{trend.unit}</span>
                </span>
              </div>
              <MiniLineChart data={trend.data} color={trendColors[i % trendColors.length]} width={200} height={36} />
            </div>
          ))}
        </div>

        {/* Status indicators row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="panel bg-space-900/40 p-4">
            <div className="kpi-label mb-2">Environmental Stability</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-tealx-400">
                {data ? `${Math.round(data.environmental_stability)}%` : '—'}
              </span>
              <StatusDot variant="success" pulse />
            </div>
          </div>
          <div className="panel bg-space-900/40 p-4">
            <div className="kpi-label mb-2">Motion Disturbance</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-white">
                {data?.motion_disturbance ?? '—'}
              </span>
              <StatusDot variant="success" pulse />
            </div>
          </div>
          <div className="panel bg-space-900/40 p-4">
            <div className="kpi-label mb-2">Experiment Environment</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-tealx-400">
                {data?.experiment_environment ?? '—'}
              </span>
              <StatusDot variant="success" pulse />
            </div>
          </div>
        </div>
      </Panel>

      {/* Disclaimer */}
      <div className="mt-4 flex items-center gap-2 text-xs text-space-400">
        <span className="status-dot bg-amberx-500" />
        All values are simulated demo data. These are not real BAS measurements.
      </div>
    </AppLayout>
  );
}
