interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'accent' | 'success' | 'warning';
  showLabel?: boolean;
  height?: string;
}

export default function ProgressBar({ value, max = 100, variant = 'accent', showLabel = false, height = 'h-2' }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor =
    variant === 'success' ? 'bg-tealx-500' :
    variant === 'warning' ? 'bg-amberx-500' :
    'bg-accent-500';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-space-300">Progress</span>
          <span className="text-xs font-mono font-semibold text-space-100">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-space-700/60 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
