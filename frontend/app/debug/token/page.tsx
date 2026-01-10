'use client';

/**
 * Debug page to get Firebase ID Token
 * Access: http://localhost:3000/debug/token
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getFirebaseAuth } from '@/lib/firebase';

export default function TokenDebugPage() {
  const { user, loading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function getToken() {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        setToken(idToken);
      }
    }

    if (user) {
      getToken();
    }
  }, [user]);

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <p className="mb-4">Você precisa fazer login primeiro.</p>
          <a href="/login" className="text-cyan-400 underline">Ir para Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔑 Firebase ID Token</h1>
        
        <div className="bg-neutral-900 rounded-lg p-6 mb-6">
          <p className="text-neutral-400 mb-2">Usuário: {user.email}</p>
          <p className="text-neutral-400 mb-4">UID: {user.uid}</p>
          
          {token ? (
            <>
              <div className="bg-neutral-800 rounded p-4 mb-4 overflow-x-auto">
                <code className="text-xs text-green-400 break-all">
                  {token}
                </code>
              </div>
              
              <button
                onClick={copyToken}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {copied ? '✓ Copiado!' : '📋 Copiar Token'}
              </button>
            </>
          ) : (
            <p>Carregando token...</p>
          )}
        </div>

        <div className="bg-neutral-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Como usar:</h2>
          <ol className="list-decimal list-inside space-y-2 text-neutral-300">
            <li>Clique em "Copiar Token" acima</li>
            <li>Vá para <a href="http://localhost:8000/docs" target="_blank" className="text-cyan-400 underline">http://localhost:8000/docs</a></li>
            <li>Clique no botão "Authorize" 🔓</li>
            <li>Cole o token no campo "Value"</li>
            <li>Clique em "Authorize"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
