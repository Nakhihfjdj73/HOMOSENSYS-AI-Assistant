import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-space-950">
      {/* Mobile nav toggle */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-space-900/80 border-b border-space-600/40">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white tracking-wide">ONBOARD AI</span>
        </div>
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="p-2 rounded-md hover:bg-space-700/50">
          {mobileNavOpen ? <X className="w-5 h-5 text-space-200" /> : <Menu className="w-5 h-5 text-space-200" />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-60 h-full">
              <Sidebar />
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="hidden md:block">
            <TopHeader title={title} subtitle={subtitle} />
          </div>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
