import { Eye, Brain, CheckCircle2, Bot, ArrowDown } from 'lucide-react';

const steps = [
  { label: 'MONITOR', icon: Eye, color: 'text-accent-400', bg: 'bg-accent-500/15', border: 'border-accent-500/30' },
  { label: 'UNDERSTAND', icon: Brain, color: 'text-accent-300', bg: 'bg-accent-500/15', border: 'border-accent-500/30' },
  { label: 'VALIDATE', icon: CheckCircle2, color: 'text-tealx-400', bg: 'bg-tealx-500/15', border: 'border-tealx-500/30' },
  { label: 'ASSIST', icon: Bot, color: 'text-tealx-400', bg: 'bg-tealx-500/15', border: 'border-tealx-500/30' },
];

export default function WorkflowPipeline() {
  return (
    <div className="panel p-4">
      <div className="panel-title mb-4">AI Workflow Pipeline</div>
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-14 h-14 rounded-lg ${step.bg} border ${step.border} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-space-200 uppercase">{step.label}</span>
              {i < steps.length - 1 && (
                <div className="hidden sm:block">
                  <ArrowDown className="w-4 h-4 text-space-400 rotate-[-90deg] absolute" style={{ left: `${25 + i * 25}%`, top: '50%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Horizontal arrows for desktop */}
      <div className="hidden md:flex items-center justify-between mt-2 px-12">
        {steps.slice(0, -1).map((_, i) => (
          <div key={i} className="flex-1 flex items-center justify-center">
            <div className="h-px w-full bg-space-600/40 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-space-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
