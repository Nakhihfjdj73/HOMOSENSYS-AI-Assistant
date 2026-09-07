import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  FlaskConical,
  Globe,
  Bell,
  ScrollText,
  Activity,
  Camera,
  Bot,
  Satellite,
} from 'lucide-react';
import { api } from '@/services/api';
import { useQuery } from '@/hooks/useApi';

const STATUS_POLL_MS = 5000;

const navItems = [
  { to: '/', label: 'Mission Overview', icon: LayoutDashboard },
  { to: '/monitoring', label: 'Live Monitoring', icon: Radio },
  { to: '/experiments', label: 'Experiments', icon: FlaskConical },
  { to: '/microgravity', label: 'Microgravity Status', icon: Globe },
  { to: '/alerts', label: 'Alerts & Events', icon: Bell },
  { to: '/logs', label: 'Activity Logs', icon: ScrollText },
];

export default function Sidebar() {
  const { data: status } = useQuery(() => api.getSystemStatus(), {
    intervalMs: STATUS_POLL_MS,
  });

  const systemStatus = [
    { label: 'Monitoring Active', active: Boolean(status?.ai_engine_online) },
    { label: 'Camera Feed Connected', active: Boolean(status?.camera_stream_active) },
    { label: 'AI Assistant Ready', active: Boolean(status?.model_loaded) },
    { label: 'Onboard Mode', active: Boolean(status?.demo_mode) },
  ];

  return (
    <aside className="w-60 shrink-0 bg-space-900/80 border-r border-space-600/40 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-space-600/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-accent-500/15 border border-accent-400/30 flex items-center justify-center">
            <Satellite className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide leading-tight">ONBOARD AI</div>
            <div className="text-[10px] text-space-300 tracking-wider uppercase">Assistant</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-semibold tracking-[0.15em] text-space-400 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-space-600/40">
        <div className="px-1 py-1 text-[10px] font-semibold tracking-[0.15em] text-space-400 uppercase mb-3">
          System Status
        </div>
        <div className="space-y-2">
          {systemStatus.map((s) => {
            const icon = s.label.includes('Camera') ? Camera : s.label.includes('AI') ? Bot : s.label.includes('Onboard') ? Satellite : Activity;
            const Icon = icon;
            return (
              <div key={s.label} className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 text-space-400" />
                <span className="text-xs text-space-200 flex-1">{s.label}</span>
                <span
                  className={`status-dot ${
                    s.active ? 'bg-tealx-500 animate-pulse-slow' : 'bg-space-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
