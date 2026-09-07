import { useEffect, useState } from 'react';
import { Bell, User, Radio } from 'lucide-react';
import { api } from '@/services/api';
import { useQuery } from '@/hooks/useApi';

interface TopHeaderProps {
  title: string;
  subtitle: string;
}

const HEADER_POLL_MS = 5000;

function formatElapsed(startedAt: string | null): string {
  if (!startedAt) return 'T+ --:--:--';

  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return 'T+ --:--:--';

  const elapsed = Math.max(Date.now() - startMs, 0);
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `T+ ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Ticks every second off the earliest session start, so the clock is real. */
function useMissionTime(startedAt: string | null): string {
  const [time, setTime] = useState(() => formatElapsed(startedAt));

  useEffect(() => {
    setTime(formatElapsed(startedAt));
    if (!startedAt) return;

    const interval = setInterval(() => setTime(formatElapsed(startedAt)), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return time;
}

export default function TopHeader({ title, subtitle }: TopHeaderProps) {
  const { data: sessions } = useQuery(() => api.listSessions(), { intervalMs: HEADER_POLL_MS });
  const { data: status } = useQuery(() => api.getSystemStatus(), { intervalMs: HEADER_POLL_MS });
  const { data: alertSummary } = useQuery(() => api.getAlertSummary(), { intervalMs: HEADER_POLL_MS });

  // listSessions returns newest first, so the last entry is the earliest start.
  const earliestStart = sessions?.length ? sessions[sessions.length - 1].started_at : null;
  const missionTime = useMissionTime(earliestStart);

  const operational = status?.ai_engine_online && status?.database_connected;
  const hasAlerts = (alertSummary?.active ?? 0) > 0;

  return (
    <header className="h-16 shrink-0 bg-space-900/80 border-b border-space-600/40 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>
        <p className="text-xs text-space-300">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-space-800/60 border border-space-600/40">
          <Radio className="w-3.5 h-3.5 text-tealx-500" />
          <span className="text-[10px] font-semibold tracking-wider text-space-300 uppercase">Mission Time</span>
          <span className="text-sm font-mono font-semibold text-accent-300">{missionTime}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <span className={`status-dot ${operational ? 'bg-tealx-500 animate-pulse-slow' : 'bg-amberx-500'}`} />
          <span className="text-xs font-medium text-space-200">
            {operational ? 'System Operational' : 'System Degraded'}
          </span>
        </div>

        {status?.demo_mode && (
          <span className="badge bg-amberx-500/15 text-amberx-400 border border-amberx-500/30">
            Demo Mode
          </span>
        )}

        <button className="relative p-2 rounded-md hover:bg-space-700/50 transition-colors">
          <Bell className="w-4 h-4 text-space-200" />
          {hasAlerts && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-redx-500" />
          )}
        </button>

        <div className="w-9 h-9 rounded-full bg-accent-500/15 border border-accent-400/30 flex items-center justify-center">
          <User className="w-4 h-4 text-accent-300" />
        </div>
      </div>
    </header>
  );
}
