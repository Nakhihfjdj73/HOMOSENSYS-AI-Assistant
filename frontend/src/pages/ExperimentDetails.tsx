import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Clock, Layers, Globe, ListOrdered, Percent } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Panel from '@/components/common/Panel';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import ExperimentStepper from '@/components/experiment/ExperimentStepper';
import { api } from '@/services/api';
import { useQuery } from '@/hooks/useApi';
import { toExperiment } from '@/services/adapters';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  Active: 'warning',
  Completed: 'success',
  Scheduled: 'info',
  Paused: 'neutral',
};

const DETAIL_POLL_MS = 3000;

export default function ExperimentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(() => api.getExperiment(id ?? ''), {
    intervalMs: DETAIL_POLL_MS,
    enabled: Boolean(id),
    deps: [id],
  });

  if (loading) {
    return (
      <AppLayout title="Loading experiment…" subtitle="">
        <div className="text-center py-16">
          <FlaskConical className="w-10 h-10 text-space-500 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-space-300">Fetching experiment details…</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout title="Experiment Not Found" subtitle="">
        <div className="text-center py-16">
          <FlaskConical className="w-10 h-10 text-space-500 mx-auto mb-3" />
          <p className="text-sm text-space-300 mb-4">{error ?? 'Experiment not found.'}</p>
          <button onClick={() => navigate('/experiments')} className="btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Experiments
          </button>
        </div>
      </AppLayout>
    );
  }

  const experiment = toExperiment(data);

  return (
    <AppLayout title={experiment.name} subtitle={`Experiment ${experiment.id}`}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/experiments')} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <StatusBadge status={experiment.status} variant={statusVariant[experiment.status] ?? 'neutral'}>
          {experiment.status}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Stepper */}
        <div className="lg:col-span-2">
          <Panel title="Experiment Workflow">
            <ExperimentStepper steps={experiment.steps} />
          </Panel>
        </div>

        {/* Right: Experiment Information */}
        <div>
          <Panel title="Experiment Information">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-space-600/20">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-space-400" />
                  <span className="text-sm text-space-300">Experiment ID</span>
                </div>
                <span className="text-sm font-mono text-white">{experiment.id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-space-600/20">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-space-400" />
                  <span className="text-sm text-space-300">Environment</span>
                </div>
                <span className="text-sm text-white">{experiment.environment}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-space-600/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-space-400" />
                  <span className="text-sm text-space-300">Duration</span>
                </div>
                <span className="text-sm font-mono text-white">{experiment.duration}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-space-600/20">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-space-400" />
                  <span className="text-sm text-space-300">Current Step</span>
                </div>
                <span className="text-sm text-white">{experiment.currentStep} of {experiment.totalSteps}</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-space-400" />
                  <span className="text-sm text-space-300">Completion Progress</span>
                </div>
                <ProgressBar value={experiment.progress} showLabel variant={experiment.status === 'Completed' ? 'success' : 'accent'} />
              </div>
            </div>
          </Panel>

          {/* Category badge */}
          <Panel title="Category" className="mt-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-white">{experiment.category}</span>
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}
