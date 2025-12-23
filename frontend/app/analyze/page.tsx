'use client';

import { useEffect, useState } from 'react';
import { apiClient, Process, ComplianceAnalyzeResponse } from '@/lib/api';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { useSidebar } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import DiagramViewer from '@/components/DiagramViewer';
import { BarChart3, AlertCircle, Lightbulb } from 'lucide-react';

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
  const { state } = useSidebar();

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
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const contentPadding = state === 'expanded' ? 'lg:pl-64' : 'lg:pl-16';

  return (
    <div className="min-h-screen bg-slate-950">
      <AppSidebar />

      <div className={`${contentPadding} min-h-screen flex flex-col relative z-10 transition-all duration-300`}>
        <AppHeader />

        <main className="flex-1 p-4 lg:p-6 xl:p-8 relative z-10">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
              Compliance Analysis
            </h1>
            <p className="text-sm lg:text-base text-slate-500 font-normal">
              Analyze processes against regulatory frameworks (LGPD, SOX, GDPR)
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Configuration</CardTitle>
                  <CardDescription>
                    Select a process and compliance domain to analyze
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAnalyze} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="process">Process *</Label>
                      {loadingProcesses ? (
                        <Skeleton className="h-10 w-full" />
                      ) : processes.length === 0 ? (
                        <div className="px-4 py-3 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-600 text-sm font-normal">
                          No processes available. <a href="/generate" className="text-[#00ade8] hover:underline">Create process</a>
                        </div>
                      ) : (
                        <Select
                          id="process"
                          value={selectedProcessId}
                          onChange={(e) => setSelectedProcessId(e.target.value)}
                          required
                        >
                          {processes.map((p) => (
                            <option key={p.process_id} value={p.process_id}>
                              {p.name} ({p.domain})
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domain">Compliance Domain *</Label>
                      <Select
                        id="domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        required
                      >
                        <option value="LGPD">LGPD - General Data Protection Law</option>
                        <option value="SOX">SOX - Sarbanes-Oxley Act</option>
                        <option value="GDPR">GDPR - General Data Protection Regulation</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="context">Additional Context (optional)</Label>
                      <Textarea
                        id="context"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Example: Process handles customer personal data"
                        rows={4}
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
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {selectedProcess && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Process</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500 mb-4 font-normal">{selectedProcess.name}</p>
                    {selectedProcess.mermaid_code && (
                      <div className="mt-4">
                        <DiagramViewer mermaidCode={selectedProcess.mermaid_code} className="max-h-64" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results */}
            <div className="space-y-6">
              {result ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                      <CardDescription>
                        Compliance score and summary
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>

                  {result.gaps.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Identified Gaps ({result.gaps.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
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
                                <Badge
                                  variant={
                                    gap.severity === 'high' ? 'destructive' :
                                    gap.severity === 'medium' ? 'secondary' : 'default'
                                  }
                                >
                                  {gap.severity.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-slate-600 font-normal">
                                  {gap.regulation} {gap.article && `- ${gap.article}`}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 mb-2 leading-relaxed font-normal">
                                {gap.description}
                              </p>
                              <div className="flex items-start gap-2 mt-2">
                                <Lightbulb className="w-4 h-4 text-[#00ade8] flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-[#00ade8] font-normal">
                                  {gap.recommendation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.suggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Improvement Suggestions ({result.suggestions.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {result.suggestions.map((suggestion) => (
                            <div key={suggestion.suggestion_id} className="p-4 rounded-lg border border-slate-800/50 bg-slate-900/30">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-slate-200 font-normal">{suggestion.title}</h4>
                                <Badge
                                  variant={
                                    suggestion.priority === 'high' ? 'destructive' :
                                    suggestion.priority === 'medium' ? 'secondary' : 'default'
                                  }
                                >
                                  {suggestion.priority}
                                </Badge>
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
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="w-10 h-10 text-slate-700 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-slate-600 font-normal text-sm">
                      Analysis results will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
