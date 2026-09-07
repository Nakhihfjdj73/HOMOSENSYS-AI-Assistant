import { useNavigate } from 'react-router-dom';
import { ChevronRight, FlaskConical } from 'lucide-react';
import type { Experiment } from '@/types';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  Active: 'warning',
  Completed: 'success',
  Scheduled: 'info',
  Paused: 'neutral',
};

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/experiments/${experiment.id}`)}
      className="panel p-4 cursor-pointer hover:border-accent-400/40 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-accent-500/15 border border-accent-400/20 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <div className="text-xs font-mono text-space-300">{experiment.id}</div>
            <div className="text-sm font-semibold text-white">{experiment.name}</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-space-400 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="badge bg-space-700/40 text-space-200 border border-space-600/40">{experiment.category}</span>
        <span className="badge bg-space-700/40 text-space-200 border border-space-600/40">{experiment.environment}</span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-space-300">Progress</span>
          <span className="text-xs font-mono font-semibold text-space-100">{experiment.progress}%</span>
        </div>
        <ProgressBar
          value={experiment.progress}
          variant={experiment.status === 'Completed' ? 'success' : 'accent'}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-space-300">Step {experiment.currentStep} of {experiment.totalSteps}</span>
        <StatusBadge status={experiment.status} variant={statusVariant[experiment.status] ?? 'neutral'}>
          {experiment.status}
        </StatusBadge>
      </div>
    </div>
  );
}
