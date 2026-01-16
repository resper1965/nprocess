'use client';

import { ExternalLink, Book, Server } from 'lucide-react';

export default function ApiReferenceCard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
  const docsUrl = `${apiUrl}/docs`;
  const redocUrl = `${apiUrl}/redoc`;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-neutral-800 rounded-lg">
          <Book className="w-5 h-5 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-white">API Reference</h3>
      </div>

      <p className="text-sm text-neutral-400">
        Comprehensive Open API (Swagger) documentation for all n.process endpoints.
        Includes interactive testing console.
      </p>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <a 
          href={docsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
        >
          <Server className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-medium text-neutral-200">Swagger UI</span>
          <ExternalLink className="w-3 h-3 text-neutral-500" />
        </a>

        <a 
          href={redocUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
        >
          <Book className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-neutral-200">ReDoc</span>
          <ExternalLink className="w-3 h-3 text-neutral-500" />
        </a>
      </div>

      <div className="pt-4 border-t border-neutral-800">
        <div className="flex justify-between items-center text-xs text-neutral-500 font-mono">
          <span>Backend URL</span>
          <span className="text-neutral-400">{apiUrl}</span>
        </div>
      </div>
    </div>
  );
}
