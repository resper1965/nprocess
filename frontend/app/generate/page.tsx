'use client';

import { useState } from 'react';
import { apiClient, DiagramGenerateResponse } from '@/lib/api';
import DiagramViewer from '@/components/DiagramViewer';
import Link from 'next/link';

export default function GeneratePage() {
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagramGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiClient.generateDiagram({
        description,
        context: context || undefined,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erro ao gerar diagrama');
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
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Gerar Diagrama BPMN</h1>
          <p className="text-[var(--foreground-secondary)]">
            Descreva um processo de negócio e receba um diagrama BPMN gerado por IA
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Descrição do Processo *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Processo de aprovação de compras: colaborador faz requisição, gestor aprova, financeiro processa pagamento"
                  required
                  minLength={10}
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary-500)] transition-colors"
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Mínimo 10 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="context" className="block text-sm font-medium mb-2">
                  Contexto Adicional (opcional)
                </label>
                <textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Ex: Departamento de compras, até R$ 10.000"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary-500)] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="w-full px-6 py-3 rounded-lg bg-[var(--primary-500)] text-white font-medium hover:bg-[var(--primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Gerando...' : 'Gerar Diagrama'}
              </button>
            </form>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <p className="font-medium">Erro</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}
          </div>

          {/* Resultado */}
          <div className="space-y-6">
            {result && (
              <>
                <div>
                  <h2 className="text-2xl font-display font-semibold mb-4">Diagrama Gerado</h2>
                  <DiagramViewer mermaidCode={result.mermaid_code} />
                </div>

                <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
                  <h3 className="text-lg font-display font-semibold mb-3">Texto Normalizado</h3>
                  <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap">
                    {result.normalized_text}
                  </p>
                </div>

                {result.metadata && (
                  <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
                    <h3 className="text-lg font-display font-semibold mb-3">Metadados</h3>
                    <div className="space-y-2 text-sm">
                      {result.metadata.actors && (
                        <div>
                          <span className="text-[var(--foreground-muted)]">Atores: </span>
                          <span className="text-[var(--foreground-secondary)]">
                            {result.metadata.actors.join(', ')}
                          </span>
                        </div>
                      )}
                      {result.metadata.activities_count !== undefined && (
                        <div>
                          <span className="text-[var(--foreground-muted)]">Atividades: </span>
                          <span className="text-[var(--foreground-secondary)]">
                            {result.metadata.activities_count}
                          </span>
                        </div>
                      )}
                      {result.metadata.decision_points !== undefined && (
                        <div>
                          <span className="text-[var(--foreground-muted)]">Pontos de Decisão: </span>
                          <span className="text-[var(--foreground-secondary)]">
                            {result.metadata.decision_points}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {!result && !loading && (
              <div className="p-12 text-center text-[var(--foreground-muted)] border border-[var(--border)] rounded-lg bg-[var(--background-secondary)]">
                <p>O diagrama aparecerá aqui após a geração</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

