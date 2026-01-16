'use client';

import { Blocks, Key, Plug } from 'lucide-react';
import McpConfigGenerator from '@/components/developer/mcp-config-generator';
import ApiReferenceCard from '@/components/developer/api-reference-card';
import { useAuth } from '@/components/providers/auth-provider';

export default function DeveloperPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div className="p-8 text-center text-neutral-500">Please log in to access Developer Hub.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
       {/* Header */}
       <div className="flex justify-between items-end border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Hub</h1>
          <p className="text-neutral-400 mt-2">Connect n.process to your external ecosystem via MCP and API.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutral-500 border border-neutral-800 rounded-full px-3 py-1">
          <Key className="w-3 h-3" />
          <span className="font-mono">TENANT: {user.displayName || 'SYSTEM'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* Main Content: MCP Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-neutral-900/30 border border-neutral-800 rounded-xl relative overflow-hidden">
             <div className="flex items-center space-x-3 mb-6 relative z-10">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                  <Plug className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">Model Context Protocol (MCP)</h2>
                   <p className="text-sm text-neutral-400">Connect to Cursor/Claude instantly.</p>
                </div>
             </div>
             
             <McpConfigGenerator />

             {/* Background Decoration */}
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center space-x-3 mb-4">
               <Blocks className="w-5 h-5 text-neutral-500" />
               <h3 className="text-lg font-medium text-white">Webhooks (Coming Soon)</h3>
             </div>
             <p className="text-sm text-neutral-500">
               Configure callbacks for BPMN generation events and Compliance Alerts.
             </p>
          </div>
        </div>

        {/* Right Sidebar: API & Status */}
        <div className="lg:col-span-1 space-y-6">
          <ApiReferenceCard />
        </div>
      </div>
    </div>
  );
}
