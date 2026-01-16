'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Loader2, LogOut, RefreshCcw, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WaitingRoom() {
  const { user, signOut, loading } = useAuth();
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    // Reload window to force token refresh if approved
    window.location.reload();
  };

  useEffect(() => {
    if (user?.claims?.status === 'active') {
        window.location.href = '/dashboard';
    }
  }, [user]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-6">
        
        <div className="mx-auto w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-yellow-500" />
        </div>

        <div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Pending</h1>
            <p className="text-neutral-400">
                Hi <span className="text-white">{user?.displayName}</span>, your account has been created but requires administrator approval.
            </p>
        </div>

        <div className="bg-neutral-800/50 rounded-lg p-4 text-sm text-neutral-500">
            <p><strong>UID:</strong> {user?.uid}</p>
            <p><strong>Status:</strong> {user?.claims?.status || 'pending'}</p>
        </div>

        <div className="space-y-3 pt-4">
            <button
                onClick={checkStatus}
                disabled={checking}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
                {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                <span>Check Status</span>
            </button>

            <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition-colors border border-neutral-700"
            >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
            </button>
        </div>

        <p className="text-xs text-neutral-600">
            Contact your organization administrator if this takes too long.
        </p>

      </div>
    </div>
  );
}
