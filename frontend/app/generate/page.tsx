'use client';

import { useState } from 'react';
import { apiClient, DiagramGenerateResponse } from '@/lib/api';
import DiagramViewer from '@/components/DiagramViewer';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    <AppLayout>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
          Generate BPMN Diagram
        </h1>
        <p className="text-sm lg:text-base text-slate-500 font-normal">
          Describe a business process and receive an AI-generated BPMN diagram
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Process Description</CardTitle>
              <CardDescription>
                Provide a detailed description of your business process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Process Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Example: Purchase approval process: employee makes request, manager approves, finance processes payment"
                    required
                    minLength={10}
                    rows={10}
                  />
                  <p className="text-xs text-slate-600 font-normal">
                    Minimum 10 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">
                    Additional Context (optional)
                  </Label>
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Example: Purchasing department, up to $10,000"
                    rows={4}
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
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Result */}
        <div className="space-y-6">
          {result ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Generated Diagram</CardTitle>
                  <CardDescription>
                    Your BPMN diagram visualization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DiagramViewer mermaidCode={result.mermaid_code} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Normalized Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap font-normal">
                    {result.normalized_text}
                  </p>
                </CardContent>
              </Card>

              {result.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-slate-600 font-normal text-sm">
                  The diagram will appear here after generation
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
