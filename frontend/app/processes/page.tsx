'use client';

import { useEffect, useState } from 'react';
import { apiClient, Process } from '@/lib/api';
import Link from 'next/link';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { useSidebar } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Folder, AlertCircle, ArrowRight } from 'lucide-react';

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string>('');
  const { state } = useSidebar();

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

  const contentPadding = state === 'expanded' ? 'lg:pl-64' : 'lg:pl-16';

  return (
    <div className="min-h-screen bg-slate-950">
      <AppSidebar />

      <div className={`${contentPadding} min-h-screen flex flex-col relative z-10 transition-all duration-300`}>
        <AppHeader />

        <main className="flex-1 p-4 lg:p-6 xl:p-8 relative z-10">
          <div className="mb-6 lg:mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
                Processes
              </h1>
              <p className="text-sm lg:text-base text-slate-500 font-normal">
                Manage your business processes
              </p>
            </div>
            <Link href="/generate">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
                New Process
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="domain-filter">Filter by Domain</Label>
              <Select
                id="domain-filter"
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
              >
                <option value="">All Domains</option>
                <option value="LGPD">LGPD</option>
                <option value="SOX">SOX</option>
                <option value="GDPR">GDPR</option>
                <option value="financeiro">Financial</option>
              </Select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && processes.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Folder className="w-10 h-10 text-slate-700 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-slate-500 mb-4 font-normal text-sm">No processes found</p>
                <Link href="/generate">
                  <Button variant="secondary">
                    Create First Process
                  </Button>
                </Link>
              </CardContent>
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
                  <Card className="hover:border-slate-700/50 transition-colors cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-display font-semibold text-slate-100 tracking-tight group-hover:text-[#00ade8] transition-colors">
                              {process.name}
                            </h3>
                            <Badge variant="outline">{process.domain}</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed font-normal">
                            {process.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-slate-600 font-normal">
                              {new Date(process.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            {process.nodes && (
                              <span className="text-slate-600 font-normal">
                                {process.nodes.length} nodes
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-700 ml-4 group-hover:text-[#00ade8] transition-colors" />
                      </div>
                    </CardContent>
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
