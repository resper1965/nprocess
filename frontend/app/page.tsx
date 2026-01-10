'use client';

/**
 * Console Home Page (Dashboard)
 * 
 * Main dashboard showing the status of the 4 engines.
 * Protected route - requires authenticated user with org_id.
 */

import { useAuth } from '@/components/providers/auth-provider';

export default function ConsolePage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-2 border-neutral-500 border-t-[#00ade8] rounded-full animate-spin" />
      </div>
    );
  }

  // The 4 Engines
  const engines = [
    {
      name: 'Process Engine',
      description: 'Gera diagramas BPMN 2.0 a partir de texto/áudio',
      status: 'idle',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      name: 'Compliance Guard',
      description: 'Audita processos contra leis (RAG)',
      status: 'online',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Document Factory',
      description: 'Gera PDFs/Manuais oficiais',
      status: 'idle',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Knowledge Store',
      description: 'O cérebro RAG + MCP compartilhado ou privado',
      status: 'online',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-montserrat font-medium text-2xl">
              n<span className="text-[#00ade8]">.</span>process
            </h1>
            <span className="text-neutral-500 font-mono text-xs uppercase tracking-wider">
              Console
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-neutral-400 text-sm">
                  {user.email}
                </span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded text-xs font-mono text-neutral-300">
                  {user.claims.role}
                </span>
              </div>
            )}
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-neutral-100 mb-2">
            Control Plane
          </h2>
          <p className="text-neutral-400">
            Status dos motores de inteligência
          </p>
        </div>

        {/* Engines Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engines.map((engine) => (
            <div
              key={engine.name}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-neutral-800 rounded-lg text-neutral-300">
                  {engine.icon}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    engine.status === 'online'
                      ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-900/20 text-amber-400 border border-amber-800'
                  }`}
                >
                  {engine.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-medium text-neutral-100 mb-1">
                {engine.name}
              </h3>
              <p className="text-neutral-400 text-sm">
                {engine.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg">
          <h3 className="text-lg font-medium text-neutral-100 mb-4">
            Quick Start
          </h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-[#00ade8] hover:bg-[#0099cc] text-white font-medium rounded-lg transition-colors">
              Novo Processo BPMN
            </button>
            <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors">
              Análise de Compliance
            </button>
            <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors">
              Gerar Documento
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-neutral-500 text-xs border-t border-neutral-800 bg-neutral-950">
        powered by <span className="font-medium">ness<span className="text-[#00ade8]">.</span></span>
      </footer>
    </div>
  );
}
