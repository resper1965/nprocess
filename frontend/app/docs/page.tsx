'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline';

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
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-slate-100 mb-2">
              Documentation
            </h1>
            <p className="text-lg text-slate-400">
              Guides and examples for using the ComplianceEngine API
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'prompts'
                  ? 'border-[#00ade8] text-[#00ade8]'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Prompt Examples
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'integration'
                  ? 'border-[#00ade8] text-[#00ade8]'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
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
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading prompts...
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-slate-400 font-mono leading-relaxed">
                      {prompts || 'Click "Prompt Examples" to load'}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'integration' && (
              <div>
                {loading.integration ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading integration guide...
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-slate-400 font-mono leading-relaxed">
                      {integration || 'Click "Integration Guide" to load'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* External Links */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-display font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Useful Links
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-300 hover:border-[#00ade8] hover:text-[#00ade8] transition-colors text-sm"
              >
                Swagger UI
              </a>
              <a
                href="https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-300 hover:border-[#00ade8] hover:text-[#00ade8] transition-colors text-sm"
              >
                ReDoc
              </a>
              <a
                href="https://github.com/resper1965/nprocess"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-300 hover:border-[#00ade8] hover:text-[#00ade8] transition-colors text-sm"
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
