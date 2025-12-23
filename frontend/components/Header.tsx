'use client';

import { CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  health?: {
    status: string;
    version?: string;
  } | null;
  loading?: boolean;
}

export default function Header({ health, loading }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-display font-medium text-slate-100 tracking-tight">
              ness<span className="text-[#00ade8]">.</span>
            </h1>
            <span className="text-xs text-slate-600 font-normal">ComplianceEngine</span>
          </div>

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
      </div>
    </header>
  );
}
