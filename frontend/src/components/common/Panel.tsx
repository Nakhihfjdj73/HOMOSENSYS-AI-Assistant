import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Panel({ title, action, children, className = '' }: PanelProps) {
  return (
    <div className={`panel ${className}`}>
      {title && (
        <div className="panel-header">
          <span className="panel-title">{title}</span>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
