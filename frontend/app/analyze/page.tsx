'use client';

import { useEffect, useState } from 'react';
import { apiClient, Process, ComplianceAnalyzeResponse } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import DiagramViewer from '@/components/DiagramViewer';
import { BarChart3, AlertCircle } from 'lucide-react';

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
      setError(err.response?.data?.detail || err.message || 'Error loading processes');
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
      setError(err.response?.data?.detail || err.message || 'Error analyzing compliance');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-400';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header />

        <main className="px-6 py-12 max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
              Compliance Analysis
            </h1>
            <p className="text-base text-slate-500 font-normal">
              Analyze processes against regulatory frameworks (LGPD, SOX, GDPR)
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              <Card className="p-6">
                <form onSubmit={handleAnalyze} className="space-y-6">
                  <div>
                    <label htmlFor="process" className="block text-sm font-medium text-slate-400 mb-2">
                      Process *
                    </label>
                    {loadingProcesses ? (
                      <div className="px-4 py-3 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-600 text-sm font-normal">
                        Loading processes...
                      </div>
                    ) : processes.length === 0 ? (
                      <div className="px-4 py-3 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-600 text-sm font-normal">
                        No processes available. <a href="/generate" className="text-[#00ade8] hover:underline">Create process</a>
                      </div>
                    ) : (
                      <select
                        id="process"
                        value={selectedProcessId}
                        onChange={(e) => setSelectedProcessId(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-300 focus:outline-none focus:border-[#00ade8]/50 focus:ring-1 focus:ring-[#00ade8]/20 transition-all text-sm font-normal"
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
                    <label htmlFor="domain" className="block text-sm font-medium text-slate-400 mb-2">
                      Compliance Domain *
                    </label>
                    <select
                      id="domain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-300 focus:outline-none focus:border-[#00ade8]/50 focus:ring-1 focus:ring-[#00ade8]/20 transition-all text-sm font-normal"
                    >
                      <option value="LGPD">LGPD - General Data Protection Law</option>
                      <option value="SOX">SOX - Sarbanes-Oxley Act</option>
                      <option value="GDPR">GDPR - General Data Protection Regulation</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="context" className="block text-sm font-medium text-slate-400 mb-2">
                      Additional Context (optional)
                    </label>
                    <textarea
                      id="context"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Example: Process handles customer personal data"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#00ade8]/50 focus:ring-1 focus:ring-[#00ade8]/20 transition-all resize-none font-normal text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !selectedProcessId}
                    loading={loading}
                    size="lg"
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" strokeWidth={2} />
                    Analyze Compliance
                  </Button>
                </form>
              </Card>

              {error && (
                <Card className="p-4 border-red-500/20 bg-red-500/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <p className="font-medium text-red-400 text-sm">Error</p>
                      <p className="text-xs text-red-400/80 mt-1 font-normal">{error}</p>
                    </div>
                  </div>
                </Card>
              )}

              {selectedProcess && (
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Selected Process</h3>
                  <p className="text-sm text-slate-500 mb-4 font-normal">{selectedProcess.name}</p>
                  {selectedProcess.mermaid_code && (
                    <div className="mt-4">
                      <DiagramViewer mermaidCode={selectedProcess.mermaid_code} className="max-h-64" />
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Results */}
            <div className="space-y-6">
              {result ? (
                <>
                  <Card className="p-6">
                    <h2 className="text-2xl font-display font-semibold text-slate-100 mb-6 tracking-tight">
                      Analysis Results
                    </h2>
                    
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm text-slate-600 font-normal">Overall Score:</span>
                        <span className={`text-4xl font-bold ${getScoreColor(result.overall_score)}`}>
                          {result.overall_score.toFixed(1)}/100
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreBgColor(result.overall_score)} transition-all`}
                          style={{ width: `${result.overall_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-display font-semibold text-slate-100 mb-3 tracking-tight">Summary</h3>
                      <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap font-normal">
                        {result.summary}
                      </p>
                    </div>
                  </Card>

                  {result.gaps.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-base font-display font-semibold text-slate-100 mb-4 tracking-tight">
                        Identified Gaps ({result.gaps.length})
                      </h3>
                      <div className="space-y-3">
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
                              <span className="text-xs text-slate-600 font-normal">
                                {gap.regulation} {gap.article && `- ${gap.article}`}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-2 leading-relaxed font-normal">
                              {gap.description}
                            </p>
                            <p className="text-xs text-[#00ade8] mt-2 font-normal">
                              💡 {gap.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {result.suggestions.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-base font-display font-semibold text-slate-100 mb-4 tracking-tight">
                        Improvement Suggestions ({result.suggestions.length})
                      </h3>
                      <div className="space-y-3">
                        {result.suggestions.map((suggestion) => (
                          <div key={suggestion.suggestion_id} className="p-4 rounded-lg border border-slate-800/50 bg-slate-900/30">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-slate-200 font-normal">{suggestion.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {suggestion.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                              {suggestion.description}
                            </p>
                            {suggestion.estimated_effort && (
                              <p className="text-xs text-slate-600 mt-2 font-normal">
                                Effort: {suggestion.estimated_effort}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="p-12 text-center">
                  <BarChart3 className="w-10 h-10 text-slate-700 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-slate-600 font-normal text-sm">
                    Analysis results will appear here
                  </p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
