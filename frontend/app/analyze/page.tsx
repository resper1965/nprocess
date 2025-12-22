'use client';

import { useEffect, useState } from 'react';
import { apiClient, Process, ComplianceAnalyzeResponse } from '@/lib/api';
import Link from 'next/link';
import DiagramViewer from '@/components/DiagramViewer';

export default function AnalyzePage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState('');
  const [domain, setDomain] = useState('LGPD');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [result, setResult] = useState<ComplianceAnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  useEffect(() => {
    loadProcesses();
  }, []);

  useEffect(() => {
    if (selectedProcessId) {
      const process = processes.find(p => p.process_id === selectedProcessId);
      setSelectedProcess(process || null);
    }
  }, [selectedProcessId, processes]);

  const loadProcesses = async () => {
    setLoadingProcesses(true);
    try {
      const data = await apiClient.listProcesses(100);
      setProcesses(data);
      if (data.length > 0 && !selectedProcessId) {
        setSelectedProcessId(data[0].process_id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erro ao carregar processos');
    } finally {
      setLoadingProcesses(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcessId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiClient.analyzeCompliance({
        process_id: selectedProcessId,
        domain,
        additional_context: context || undefined,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erro ao analisar compliance');
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
          <h1 className="text-4xl font-display font-bold mb-2">Análise de Compliance</h1>
          <p className="text-[var(--foreground-secondary)]">
            Analise processos contra regulamentações (LGPD, SOX, GDPR)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label htmlFor="process" className="block text-sm font-medium mb-2">
                  Processo *
                </label>
                {loadingProcesses ? (
                  <div className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground-muted)]">
                    Carregando processos...
                  </div>
                ) : processes.length === 0 ? (
                  <div className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground-muted)]">
                    Nenhum processo disponível. <Link href="/generate" className="text-[var(--primary-400)]">Criar processo</Link>
                  </div>
                ) : (
                  <select
                    id="process"
                    value={selectedProcessId}
                    onChange={(e) => setSelectedProcessId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-500)] transition-colors"
                  >
                    {processes.map((p) => (
                      <option key={p.process_id} value={p.process_id}>
                        {p.name} ({p.domain})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium mb-2">
                  Domínio de Compliance *
                </label>
                <select
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-500)] transition-colors"
                >
                  <option value="LGPD">LGPD - Lei Geral de Proteção de Dados</option>
                  <option value="SOX">SOX - Sarbanes-Oxley Act</option>
                  <option value="GDPR">GDPR - General Data Protection Regulation</option>
                </select>
              </div>

              <div>
                <label htmlFor="context" className="block text-sm font-medium mb-2">
                  Contexto Adicional (opcional)
                </label>
                <textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Ex: Processo lida com dados pessoais de clientes"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary-500)] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedProcessId}
                className="w-full px-6 py-3 rounded-lg bg-[var(--primary-500)] text-white font-medium hover:bg-[var(--primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Analisando...' : 'Analisar Compliance'}
              </button>
            </form>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <p className="font-medium">Erro</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {selectedProcess && (
              <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
                <h3 className="text-sm font-medium mb-2">Processo Selecionado</h3>
                <p className="text-sm text-[var(--foreground-secondary)]">{selectedProcess.name}</p>
                {selectedProcess.mermaid_code && (
                  <div className="mt-4">
                    <DiagramViewer mermaidCode={selectedProcess.mermaid_code} className="max-h-64" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {result && (
              <>
                <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
                  <h2 className="text-2xl font-display font-semibold mb-4">Resultados da Análise</h2>
                  
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-[var(--foreground-muted)]">Score Geral:</span>
                      <span className={`text-3xl font-bold ${
                        result.overall_score >= 80 ? 'text-green-400' :
                        result.overall_score >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {result.overall_score.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--slate-800)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          result.overall_score >= 80 ? 'bg-green-400' :
                          result.overall_score >= 60 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${result.overall_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-display font-semibold mb-2">Resumo</h3>
                    <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap">
                      {result.summary}
                    </p>
                  </div>
                </div>

                {result.gaps.length > 0 && (
                  <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
                    <h3 className="text-lg font-display font-semibold mb-4">
                      Gaps Identificados ({result.gaps.length})
                    </h3>
                    <div className="space-y-4">
                      {result.gaps.map((gap) => (
                        <div
                          key={gap.gap_id}
                          className={`p-4 rounded-lg border ${
                            gap.severity === 'high' ? 'border-red-500/20 bg-red-500/10' :
                            gap.severity === 'medium' ? 'border-yellow-500/20 bg-yellow-500/10' :
                            'border-blue-500/20 bg-blue-500/10'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              gap.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              gap.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {gap.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-[var(--foreground-muted)]">
                              {gap.regulation} {gap.article && `- ${gap.article}`}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--foreground-secondary)] mb-2">
                            {gap.description}
                          </p>
                          <p className="text-xs text-[var(--primary-400)]">
                            💡 {gap.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestions.length > 0 && (
                  <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
                    <h3 className="text-lg font-display font-semibold mb-4">
                      Sugestões de Melhoria ({result.suggestions.length})
                    </h3>
                    <div className="space-y-3">
                      {result.suggestions.map((suggestion) => (
                        <div key={suggestion.suggestion_id} className="p-3 rounded-lg border border-[var(--border)]">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-medium">{suggestion.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--foreground-secondary)]">
                            {suggestion.description}
                          </p>
                          {suggestion.estimated_effort && (
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">
                              Esforço: {suggestion.estimated_effort}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!result && !loading && (
              <div className="p-12 text-center text-[var(--foreground-muted)] border border-[var(--border)] rounded-lg bg-[var(--background-secondary)]">
                <p>Os resultados da análise aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

