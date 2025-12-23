'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { FileText, Link as LinkIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header />

        <main className="px-6 py-12 max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
              Documentation
            </h1>
            <p className="text-base text-slate-500 font-normal">
              Guides and examples for using the ComplianceEngine API
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-800/50">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-6 py-3 font-normal border-b-2 transition-colors text-sm ${
                activeTab === 'prompts'
                  ? 'border-[#00ade8] text-[#00ade8]'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Prompt Examples
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`px-6 py-3 font-normal border-b-2 transition-colors text-sm ${
                activeTab === 'integration'
                  ? 'border-[#00ade8] text-[#00ade8]'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Integration Guide
            </button>
          </div>

          {/* Content */}
          <Card className="p-6">
            {activeTab === 'prompts' && (
              <div>
                {loading.prompts ? (
                  <div className="text-center py-12 text-slate-600">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <span className="text-sm font-normal">Loading prompts...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-slate-500 font-mono leading-relaxed font-normal">
                      {prompts || 'Click "Prompt Examples" to load'}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'integration' && (
              <div>
                {loading.integration ? (
                  <div className="text-center py-12 text-slate-600">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <span className="text-sm font-normal">Loading integration guide...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-slate-500 font-mono leading-relaxed font-normal">
                      {integration || 'Click "Integration Guide" to load'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* External Links */}
          <Card className="p-6 mt-6">
            <h3 className="text-base font-display font-semibold text-slate-100 mb-4 tracking-tight flex items-center gap-2">
              <LinkIcon className="w-4 h-4" strokeWidth={1.5} />
              Useful Links
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-400 hover:border-[#00ade8]/50 hover:text-[#00ade8] transition-colors text-sm font-normal"
              >
                Swagger UI
              </a>
              <a
                href="https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-400 hover:border-[#00ade8]/50 hover:text-[#00ade8] transition-colors text-sm font-normal"
              >
                ReDoc
              </a>
              <a
                href="https://github.com/resper1965/nprocess"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-400 hover:border-[#00ade8]/50 hover:text-[#00ade8] transition-colors text-sm font-normal"
              >
                GitHub
              </a>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
