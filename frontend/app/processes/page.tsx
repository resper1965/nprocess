'use client';

import { useEffect, useState } from 'react';
import { apiClient, Process } from '@/lib/api';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { PlusIcon, FolderIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string>('');

  useEffect(() => {
    loadProcesses();
  }, [domainFilter]);

  const loadProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.listProcesses(100, domainFilter || undefined);
      setProcesses(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error loading processes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header />

        <main className="px-6 py-12 max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-slate-100 mb-2">
                Processes
              </h1>
              <p className="text-lg text-slate-400">
                Manage your business processes
              </p>
            </div>
            <Link href="/generate">
              <Button size="lg">
                <PlusIcon className="w-5 h-5 mr-2" />
                New Process
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-300 focus:outline-none focus:border-[#00ade8] focus:ring-1 focus:ring-[#00ade8] transition-all"
            >
              <option value="">All Domains</option>
              <option value="LGPD">LGPD</option>
              <option value="SOX">SOX</option>
              <option value="GDPR">GDPR</option>
              <option value="financeiro">Financial</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <Card className="p-12 text-center">
              <div className="flex items-center justify-center gap-3 text-slate-500">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading processes...
              </div>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Card className="p-4 border-red-500/20 bg-red-500/10 mb-6">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Error</p>
                  <p className="text-sm text-red-400/80 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && processes.length === 0 && (
            <Card className="p-12 text-center">
              <FolderIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No processes found</p>
              <Link href="/generate">
                <Button variant="secondary">
                  Create First Process
                </Button>
              </Link>
            </Card>
          )}

          {/* Process List */}
          {!loading && !error && processes.length > 0 && (
            <div className="grid gap-4">
              {processes.map((process) => (
                <Link
                  key={process.process_id}
                  href={`/processes/${process.process_id}`}
                >
                  <Card hover className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-display font-semibold text-slate-100 mb-2">
                          {process.name}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                          {process.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="px-2 py-1 rounded bg-[#00ade8]/20 text-[#00ade8] font-medium">
                            {process.domain}
                          </span>
                          <span className="text-slate-500">
                            {new Date(process.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {process.nodes && (
                            <span className="text-slate-500">
                              {process.nodes.length} nodes
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-slate-600 ml-4">→</div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
