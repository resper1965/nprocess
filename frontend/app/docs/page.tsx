'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { LinkIcon, ExternalLink } from 'lucide-react';

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://compliance-engine-5wqihg7s7a-uc.a.run.app'}/v1/docs/prompts`);
      const text = await response.text();
      setPrompts(text);
    } catch (err) {
      console.error('Error loading prompts:', err);
    } finally {
      setLoading({ ...loading, prompts: false });
    }
  };

  const loadIntegration = async () => {
    setLoading({ ...loading, integration: true });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://compliance-engine-5wqihg7s7a-uc.a.run.app'}/v1/docs/integration`);
      const text = await response.text();
      setIntegration(text);
    } catch (err) {
      console.error('Error loading integration:', err);
    } finally {
      setLoading({ ...loading, integration: false });
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
          Documentation
        </h1>
        <p className="text-sm lg:text-base text-slate-500 font-normal">
          Guides and examples for using the ComplianceEngine API
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'prompts' | 'integration')} className="space-y-6">
        <TabsList>
          <TabsTrigger value="prompts">Prompt Examples</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Examples</CardTitle>
              <CardDescription>
                Example prompts for AI development tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.prompts ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-500 font-mono leading-relaxed font-normal">
                    {prompts || 'Click "Prompt Examples" to load'}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>
                How to integrate ComplianceEngine API into your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.integration ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-500 font-mono leading-relaxed font-normal">
                    {integration || 'Click "Integration Guide" to load'}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* External Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" strokeWidth={1.5} />
            Useful Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-400 hover:border-[#00ade8]/50 hover:text-[#00ade8] transition-colors text-sm font-normal"
            >
              Swagger UI
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-400 hover:border-[#00ade8]/50 hover:text-[#00ade8] transition-colors text-sm font-normal"
            >
              ReDoc
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/resper1965/nprocess"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-400 hover:border-[#00ade8]/50 hover:text-[#00ade8] transition-colors text-sm font-normal"
            >
              GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
