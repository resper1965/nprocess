'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function DocsPage() {
  const [prompts, setPrompts] = useState<string>('');
  const [integration, setIntegration] = useState<string>('');
  const [loading, setLoading] = useState({ prompts: false, integration: false });
  const [activeTab, setActiveTab] = useState<'prompts' | 'integration'>('prompts');

  useEffect(() => {
    if (activeTab === 'prompts' && !prompts) {
      loadPrompts();
    } else if (activeTab === 'integration' && !integration) {
      loadIntegration();
    }
  }, [activeTab]);

  const loadPrompts = async () => {
    setLoading({ ...loading, prompts: true });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://compliance-engine-273624403528.us-central1.run.app'}/v1/docs/prompts`);
      const text = await response.text();
      setPrompts(text);
    } catch (err) {
      console.error('Erro ao carregar prompts:', err);
    } finally {
      setLoading({ ...loading, prompts: false });
    }
  };

  const loadIntegration = async () => {
    setLoading({ ...loading, integration: true });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://compliance-engine-273624403528.us-central1.run.app'}/v1/docs/integration`);
      const text = await response.text();
      setIntegration(text);
    } catch (err) {
      console.error('Erro ao carregar integração:', err);
    } finally {
      setLoading({ ...loading, integration: false });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-semibold">
                ness<span className="text-[var(--primary-500)]">.</span>
              </h1>
              <span className="text-sm text-[var(--foreground-muted)]">ComplianceEngine</span>
            </Link>
            <Link href="/" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary-400)] transition-colors">
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Documentação</h1>
          <p className="text-[var(--foreground-secondary)]">
            Guias e exemplos para usar a ComplianceEngine API
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'prompts'
                ? 'border-[var(--primary-500)] text-[var(--primary-400)]'
                : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            Exemplos de Prompts
          </button>
          <button
            onClick={() => setActiveTab('integration')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'integration'
                ? 'border-[var(--primary-500)] text-[var(--primary-400)]'
                : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            Manual de Integração
          </button>
        </div>

        {/* Content */}
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
          {activeTab === 'prompts' && (
            <div>
              {loading.prompts ? (
                <div className="text-center py-12 text-[var(--foreground-muted)]">
                  Carregando prompts...
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-[var(--foreground-secondary)] font-mono">
                    {prompts || 'Clique em "Exemplos de Prompts" para carregar'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'integration' && (
            <div>
              {loading.integration ? (
                <div className="text-center py-12 text-[var(--foreground-muted)]">
                  Carregando manual de integração...
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-[var(--foreground-secondary)] font-mono">
                    {integration || 'Clique em "Manual de Integração" para carregar'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Links Externos */}
        <div className="mt-8 p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
          <h3 className="text-lg font-display font-semibold mb-4">Links Úteis</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://compliance-engine-273624403528.us-central1.run.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary-500)] transition-colors text-sm"
            >
              Swagger UI
            </a>
            <a
              href="https://compliance-engine-273624403528.us-central1.run.app/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary-500)] transition-colors text-sm"
            >
              ReDoc
            </a>
            <a
              href="https://github.com/resper1965/nprocess"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary-500)] transition-colors text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

