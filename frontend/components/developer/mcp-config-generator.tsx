'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getFirebaseAuth } from '@/lib/firebase';
import { Copy, Check, Terminal, Command } from 'lucide-react';

export default function McpConfigGenerator() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<'cursor' | 'claude'>('cursor');
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Auto-generate on mount/user change
  useEffect(() => {
    const generateConfig = async () => {
        if (!user) return;
        const auth = getFirebaseAuth();
        const t = await auth.currentUser?.getIdToken();
        setToken(t || null);
    };
    generateConfig();
  }, [user]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nprocess-api-1040576944774.us-central1.run.app';
  const sseUrl = `${apiUrl}/mcp/sse`;

  const cursorConfig = {
    "mcpServers": {
      "n.process": {
        "command": "curl",
        "args": [
          "-N", 
          "-H", `Authorization: Bearer ${token || 'YOUR_TOKEN'}`,
          sseUrl
        ]
      }
    }
  };
  
  // Claude Desktop uses a different format usually (stdio), but for SSE it might differ.
  // Actually Claude Desktop supports SSE now? 
  // Standardizing on the SSE format.
  
  const configString = JSON.stringify(cursorConfig, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(configString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-neutral-900/50 p-1 rounded-lg w-fit border border-neutral-800">
        <button
          onClick={() => setPlatform('cursor')}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${platform === 'cursor' ? 'bg-cyan-950/30 text-cyan-400' : 'text-neutral-400 hover:text-white'}
          `}
        >
          <Terminal className="w-4 h-4" />
          <span>Cursor IDE</span>
        </button>
        <button
          onClick={() => setPlatform('claude')}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${platform === 'claude' ? 'bg-purple-950/30 text-purple-400' : 'text-neutral-400 hover:text-white'}
          `}
        >
          <Command className="w-4 h-4" />
          <span>Claude Desktop</span>
        </button>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-black border border-neutral-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-neutral-300">
            {configString}
          </pre>
          
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-neutral-400" />}
          </button>
        </div>
      </div>

      <div className="text-xs text-neutral-500 flex items-start space-x-2">
        <div className="mt-0.5 min-w-4">ℹ️</div>
        <p>
          {platform === 'cursor' 
            ? "Paste this into your '.cursor/mcp.json' or Cursor Settings > MCP." 
            : "Paste this into your Claude Desktop config file."}
          <br/>
          <span className="text-red-400/80">Security Warning:</span> This token grants full access to your account. Do not share this JSON.
        </p>
      </div>
    </div>
  );
}
