'use client';

import { useEffect, useState } from 'react';
import { apiClient, Process } from '@/lib/api';
import Link from 'next/link';

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string>('');

  useEffect(() => {
    loadProcesses();
  }, [domainFilter]);

  const loadProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.listProcesses(100, domainFilter || undefined);
      setProcesses(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erro ao carregar processos');
    } finally {
      setLoading(false);
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Processos</h1>
            <p className="text-[var(--foreground-secondary)]">
              Gerencie seus processos de negócio
            </p>
          </div>
          <Link
            href="/generate"
            className="px-6 py-3 rounded-lg bg-[var(--primary-500)] text-white font-medium hover:bg-[var(--primary-600)] transition-colors"
          >
            + Novo Processo
          </Link>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-500)] transition-colors"
          >
            <option value="">Todos os domínios</option>
            <option value="LGPD">LGPD</option>
            <option value="SOX">SOX</option>
            <option value="GDPR">GDPR</option>
            <option value="financeiro">Financeiro</option>
          </select>
        </div>

        {/* Lista de Processos */}
        {loading && (
          <div className="text-center py-12 text-[var(--foreground-muted)]">
            Carregando processos...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
            <p className="font-medium">Erro</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && processes.length === 0 && (
          <div className="text-center py-12 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)]">
            <p className="text-[var(--foreground-muted)] mb-4">Nenhum processo encontrado</p>
            <Link
              href="/generate"
              className="text-[var(--primary-400)] hover:text-[var(--primary-500)] transition-colors"
            >
              Criar primeiro processo →
            </Link>
          </div>
        )}

        {!loading && !error && processes.length > 0 && (
          <div className="grid gap-4">
            {processes.map((process) => (
              <Link
                key={process.process_id}
                href={`/processes/${process.process_id}`}
                className="block p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--primary-500)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-semibold mb-2">{process.name}</h3>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-4 line-clamp-2">
                      {process.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                      <span className="px-2 py-1 rounded bg-[var(--primary-500)]/20 text-[var(--primary-400)]">
                        {process.domain}
                      </span>
                      <span>
                        {new Date(process.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {process.nodes && (
                        <span>{process.nodes.length} nós</span>
                      )}
                    </div>
                  </div>
                  <div className="text-[var(--foreground-muted)]">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


