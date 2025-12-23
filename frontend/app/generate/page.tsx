'use client';

import { useState } from 'react';
import { apiClient, DiagramGenerateResponse } from '@/lib/api';
import DiagramViewer from '@/components/DiagramViewer';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Sparkles, AlertCircle } from 'lucide-react';

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
      setError(err.response?.data?.detail || err.message || 'Error generating diagram');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header />

        <main className="px-6 py-12 max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
              Generate BPMN Diagram
            </h1>
            <p className="text-base text-slate-500 font-normal">
              Describe a business process and receive an AI-generated BPMN diagram
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-2">
                      Process Description *
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Example: Purchase approval process: employee makes request, manager approves, finance processes payment"
                      required
                      minLength={10}
                      rows={10}
                      className="w-full px-4 py-3 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#00ade8]/50 focus:ring-1 focus:ring-[#00ade8]/20 transition-all resize-none font-normal text-sm"
                    />
                    <p className="text-xs text-slate-600 mt-2 font-normal">
                      Minimum 10 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="context" className="block text-sm font-medium text-slate-400 mb-2">
                      Additional Context (optional)
                    </label>
                    <textarea
                      id="context"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Example: Purchasing department, up to $10,000"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#00ade8]/50 focus:ring-1 focus:ring-[#00ade8]/20 transition-all resize-none font-normal text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !description.trim()}
                    loading={loading}
                    size="lg"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" strokeWidth={2} />
                    Generate Diagram
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
            </div>

            {/* Result */}
            <div className="space-y-6">
              {result ? (
                <>
                  <div>
                    <h2 className="text-2xl font-display font-semibold text-slate-100 mb-4 tracking-tight">
                      Generated Diagram
                    </h2>
                    <DiagramViewer mermaidCode={result.mermaid_code} />
                  </div>

                  <Card className="p-6">
                    <h3 className="text-base font-display font-semibold text-slate-100 mb-3 tracking-tight">
                      Normalized Text
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap font-normal">
                      {result.normalized_text}
                    </p>
                  </Card>

                  {result.metadata && (
                    <Card className="p-6">
                      <h3 className="text-base font-display font-semibold text-slate-100 mb-4 tracking-tight">
                        Metadata
                      </h3>
                      <div className="space-y-3 text-sm">
                        {result.metadata.actors && (
                          <div>
                            <span className="text-slate-600 font-normal">Actors: </span>
                            <span className="text-slate-400 font-normal">
                              {result.metadata.actors.join(', ')}
                            </span>
                          </div>
                        )}
                        {result.metadata.activities_count !== undefined && (
                          <div>
                            <span className="text-slate-600 font-normal">Activities: </span>
                            <span className="text-slate-400 font-normal">
                              {result.metadata.activities_count}
                            </span>
                          </div>
                        )}
                        {result.metadata.decision_points !== undefined && (
                          <div>
                            <span className="text-slate-600 font-normal">Decision Points: </span>
                            <span className="text-slate-400 font-normal">
                              {result.metadata.decision_points}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="p-12 text-center">
                  <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-slate-600 font-normal text-sm">
                    The diagram will appear here after generation
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
