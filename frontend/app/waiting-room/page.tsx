'use client';

/**
 * Waiting Room Page
 * 
 * Displayed for users with pending status or without org_id.
 * Shows a message asking them to wait for admin approval.
 */

import { useAuth } from '@/components/providers/auth-provider';

export default function WaitingRoomPage() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-2 border-neutral-500 border-t-[#00ade8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-full max-w-lg p-8">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-montserrat font-medium text-4xl tracking-tight">
            n<span className="text-[#00ade8]">.</span>process
          </h1>
          <p className="mt-2 text-neutral-400 font-mono text-sm">
            Control Plane
          </p>
        </div>

        {/* Waiting Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
          {/* Status Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-900/20 border border-amber-800 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-medium text-neutral-100 mb-2">
            Aguardando Aprovação
          </h2>
          
          <p className="text-neutral-400 text-sm mb-6">
            Sua conta foi criada com sucesso. Solicite acesso ao administrador 
            da sua organização para começar a usar o n.process.
          </p>

          {/* User Info */}
          {user && (
            <div className="bg-neutral-800/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                Conta
              </p>
              <p className="text-neutral-100 font-mono text-sm">
                {user.email}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2.5 bg-[#00ade8] hover:bg-[#0099cc] text-white font-medium rounded-lg transition-colors"
            >
              Verificar Status
            </button>
            
            <button
              onClick={signOut}
              className="w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-neutral-500 text-xs">
          powered by <span className="font-medium">ness<span className="text-[#00ade8]">.</span></span>
        </p>
      </div>
    </div>
  );
}
