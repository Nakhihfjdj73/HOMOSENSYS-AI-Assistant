import type { ReactNode } from 'react';

interface StatusBadgeProps {
  status?: string;
  variant?: 'success' | 'warning' | 'critical' | 'info' | 'neutral';
  children?: ReactNode;
}

const variantStyles: Record<string, string> = {
  success: 'bg-tealx-500/15 text-tealx-400 border-tealx-500/30',
  warning: 'bg-amberx-500/15 text-amberx-400 border-amberx-500/30',
  critical: 'bg-redx-500/15 text-redx-400 border-redx-500/30',
  info: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
  neutral: 'bg-space-700/40 text-space-200 border-space-600/40',
};

export default function StatusBadge({ status, variant = 'neutral', children }: StatusBadgeProps) {
  const styles = variantStyles[variant];
  const dotColor =
    variant === 'success' ? 'bg-tealx-500' :
    variant === 'warning' ? 'bg-amberx-500' :
    variant === 'critical' ? 'bg-redx-500' :
    variant === 'info' ? 'bg-accent-400' :
    'bg-space-300';

  return (
    <span className={`badge ${styles} border`}>
      <span className={`status-dot ${dotColor}`} />
      {children ?? status}
    </span>
  );
}
