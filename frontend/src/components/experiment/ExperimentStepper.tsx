import { Check, Loader2, Circle } from 'lucide-react';
import type { ExperimentStep } from '@/types';

interface ExperimentStepperProps {
  steps: ExperimentStep[];
}

const statusConfig: Record<string, { icon: typeof Check; color: string; bg: string; border: string; label: string }> = {
  Completed: { icon: Check, color: 'text-tealx-400', bg: 'bg-tealx-500/15', border: 'border-tealx-500/40', label: 'COMPLETED' },
  'In Progress': { icon: Loader2, color: 'text-amberx-400', bg: 'bg-amberx-500/15', border: 'border-amberx-500/40', label: 'IN PROGRESS' },
  Pending: { icon: Circle, color: 'text-space-400', bg: 'bg-space-700/40', border: 'border-space-600/40', label: 'PENDING' },
};

export default function ExperimentStepper({ steps }: ExperimentStepperProps) {
  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const config = statusConfig[step.status];
        const Icon = config.icon;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-4">
            {/* Vertical line and step circle */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color} ${step.status === 'In Progress' ? 'animate-spin' : ''}`} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 ${steps[i + 1].status === 'Completed' ? 'bg-tealx-500/40' : 'bg-space-600/40'} min-h-[2rem]`} />
              )}
            </div>

            {/* Step content */}
            <div className={`pb-6 ${isLast ? 'pb-0' : ''} flex-1`}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-mono font-semibold text-space-400 tracking-wider">STEP {step.id}</span>
                <span className={`badge ${config.bg} ${config.color} border ${config.border}`}>
                  {config.label}
                </span>
              </div>
              <h3 className={`text-sm font-semibold mb-1 ${step.status === 'Pending' ? 'text-space-300' : 'text-white'}`}>
                {step.title}
              </h3>
              <p className="text-xs text-space-400 leading-relaxed">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
