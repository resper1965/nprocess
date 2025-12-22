'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.healthCheck()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao verificar saúde da API:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-semibold">
                ness<span className="text-[var(--primary-500)]">.</span>
              </h1>
              <span className="text-sm text-[var(--foreground-muted)]">ComplianceEngine</span>
            </div>
            <nav className="flex gap-6">
              <Link href="/generate" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary-400)] transition-colors">
                Gerar Diagrama
              </Link>
              <Link href="/processes" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary-400)] transition-colors">
                Processos
              </Link>
              <Link href="/analyze" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary-400)] transition-colors">
                Análise
              </Link>
              <Link href="/docs" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary-400)] transition-colors">
                Docs
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-display font-bold mb-4 leading-tight">
              ComplianceEngine
            </h1>
            <p className="text-xl text-[var(--foreground-secondary)] mb-8 max-w-2xl mx-auto">
              Mapeamento de processos e análise de compliance usando IA Generativa
            </p>
            
            {/* Status da API */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
              {loading ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[var(--foreground-muted)] animate-pulse"></div>
                  <span className="text-sm text-[var(--foreground-secondary)]">Verificando API...</span>
                </>
              ) : health ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-[var(--foreground-secondary)]">
                    API Online - {health.version}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm text-[var(--foreground-secondary)]">API Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Link href="/generate" className="group p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--primary-500)] transition-all">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-[var(--primary-400)] transition-colors">
                Gerar Diagramas
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Converta descrições textuais em diagramas BPMN usando IA
              </p>
            </Link>

            <Link href="/processes" className="group p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--primary-500)] transition-all">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-[var(--primary-400)] transition-colors">
                Gerenciar Processos
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Armazene e gerencie processos validados no Firestore
              </p>
            </Link>

            <Link href="/analyze" className="group p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--primary-500)] transition-all">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-[var(--primary-400)] transition-colors">
                Analisar Compliance
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)]">
                Identifique gaps de conformidade (LGPD, SOX, GDPR)
              </p>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-[var(--border)] pt-8">
            <h2 className="text-2xl font-display font-semibold mb-6">Ações Rápidas</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/generate"
                className="px-6 py-3 rounded-lg bg-[var(--primary-500)] text-white font-medium hover:bg-[var(--primary-600)] transition-colors"
              >
                Gerar Novo Diagrama
              </Link>
              <Link
                href="/processes"
                className="px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] font-medium hover:border-[var(--primary-500)] transition-colors"
              >
                Ver Processos
              </Link>
              <Link
                href="/docs"
                className="px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] font-medium hover:border-[var(--primary-500)] transition-colors"
              >
                Documentação
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--background-secondary)] mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
            <div>
              <span className="font-display font-medium">ness</span>
              <span className="text-[var(--primary-500)]">.</span>
              <span className="ml-2">ComplianceEngine API</span>
            </div>
            <div>
              <a
                href="https://compliance-engine-273624403528.us-central1.run.app/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--primary-400)] transition-colors"
              >
                API Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
