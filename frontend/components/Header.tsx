'use client';

import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  health?: {
    status: string;
    version?: string;
  } | null;
  loading?: boolean;
}

export default function Header({ health, loading }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-medium text-slate-100">
              ness<span className="text-[#00ade8]">.</span>
            </h1>
            <span className="text-xs text-slate-500 font-medium">ComplianceEngine</span>
          </div>

          {/* API Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            {loading ? (
              <>
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
                <span className="text-xs text-slate-400">Checking...</span>
              </>
            ) : health?.status === 'healthy' ? (
              <>
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-400">
                  API {health.version || 'Online'}
                </span>
              </>
            ) : (
              <>
                <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                <span className="text-xs text-slate-400">API Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

