'use client';

import { CheckCircle2, AlertCircle, PanelLeft, Menu } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

interface AppHeaderProps {
  health?: {
    status: string;
    version?: string;
  } | null;
  loading?: boolean;
}

export default function AppHeader({ health, loading }: AppHeaderProps) {
  const { open, setOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-[60px] flex-shrink-0 items-center gap-4 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900/50 hover:text-slate-200"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Desktop sidebar trigger */}
      <SidebarTrigger className="hidden lg:flex">
        <PanelLeft className="w-5 h-5" strokeWidth={1.5} />
      </SidebarTrigger>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* API Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
          {loading ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
              <span className="text-xs text-slate-500 font-normal">Checking</span>
            </>
          ) : health?.status === 'healthy' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              <span className="text-xs text-slate-500 font-normal">
                API {health.version || 'Online'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-500" strokeWidth={2} />
              <span className="text-xs text-slate-500 font-normal">API Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
