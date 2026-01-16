'use client';

import { useState } from 'react';
import { Database, Globe, Search } from 'lucide-react';
import DocumentUpload from '@/components/knowledge/document-upload';
import DocumentList from '@/components/knowledge/document-list';
import MarketplaceGrid from '@/components/knowledge/marketplace-grid';
import { useAuth } from '@/components/providers/auth-provider';

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<'private' | 'marketplace'>('private');
  const { user } = useAuth();
  
  if (!user) {
    return <div className="p-8 text-center text-neutral-500">Please log in to access Knowledge Ops.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Ops</h1>
          <p className="text-neutral-400 mt-2">Manage your AI&apos;s brain and compliance drivers.</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-500 uppercase tracking-widest">Environment</span>
          <div className="flex items-center space-x-2 text-green-500">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <span className="font-mono text-sm">PRODUCTION</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-neutral-900/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('private')}
          className={`
            flex items-center space-x-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all
            ${activeTab === 'private' 
              ? 'bg-neutral-800 text-white shadow-sm' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }
          `}
        >
          <Database className="w-4 h-4" />
          <span>Private Context</span>
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`
            flex items-center space-x-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all
            ${activeTab === 'marketplace' 
              ? 'bg-neutral-800 text-white shadow-sm' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }
          `}
        >
          <Globe className="w-4 h-4" />
          <span>Marketplace Drivers</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* PRIVATE TAB */}
        {activeTab === 'private' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Upload */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <span className="text-cyan-500">01.</span>
                  <span>Ingest New Documents</span>
                </h2>
                <DocumentUpload />
              </div>

               <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <span className="text-cyan-500">02.</span>
                  <span>Validation Playground</span>
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-neutral-500" />
                  <input 
                    type="text" 
                    placeholder="Ask a question to verify knowledge..."
                    className="w-full bg-black border border-neutral-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Use this to test if the AI can retrieve information from your uploaded documents.
                </p>
              </div>
            </div>

            {/* Right Col: List */}
            <div className="lg:col-span-1">
              <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl h-full">
                <DocumentList />
              </div>
            </div>
          </div>
        )}

        {/* MARKETPLACE TAB */}
        {activeTab === 'marketplace' && (
           <div className="space-y-6">
             <div className="p-8 bg-gradient-to-r from-cyan-950/20 to-purple-950/20 border border-neutral-800 rounded-xl">
               <h2 className="text-2xl font-bold mb-2">Knowledge Marketplace</h2>
               <p className="text-neutral-400 max-w-2xl">
                 Enable official compliance drivers to instantly empower your AI with specialized legal knowledge. 
                 Subscribed drivers are automatically kept up-to-date.
               </p>
             </div>
             <MarketplaceGrid />
           </div>
        )}

      </div>
    </div>
  );
}
