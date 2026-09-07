import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning';
}

const variantStyles: Record<string, { border: string; icon: string; value: string }> = {
  default: { border: 'border-space-600/40', icon: 'text-space-300', value: 'text-white' },
  accent: { border: 'border-accent-500/30', icon: 'text-accent-400', value: 'text-accent-300' },
  success: { border: 'border-tealx-500/30', icon: 'text-tealx-400', value: 'text-tealx-400' },
  warning: { border: 'border-amberx-500/30', icon: 'text-amberx-400', value: 'text-amberx-400' },
};

export default function KpiCard({ label, value, icon, variant = 'default' }: KpiCardProps) {
  const s = variantStyles[variant];
  return (
    <div className={`panel ${s.border} p-4 transition-colors hover:border-space-500/50`}>
      <div className="flex items-start justify-between mb-3">
        <span className="kpi-label">{label}</span>
        {icon && <span className={s.icon}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold font-mono ${s.value}`}>{value}</div>
    </div>
  );
}
