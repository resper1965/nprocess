'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient, APIKeyInfo, APIKeyResponse, APIKeyUsage } from '@/lib/api';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Activity,
  DollarSign,
} from 'lucide-react';

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKey, setNewKey] = useState<APIKeyResponse | null>(null);
  const [usageData, setUsageData] = useState<Record<string, APIKeyUsage>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Form state
  const [keyName, setKeyName] = useState('');
  const [description, setDescription] = useState('');
  const [consumerAppId, setConsumerAppId] = useState('');
  const [creating, setCreating] = useState(false);

  // Stored API key (from localStorage)
  const [storedApiKey, setStoredApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Load stored API key from localStorage
    const stored = localStorage.getItem('compliance_engine_api_key');
    if (stored) {
      setStoredApiKey(stored);
    }
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const keys = await apiClient.listMyAPIKeys(storedApiKey || undefined);
      setApiKeys(keys);
      
      // Load usage for each key
      for (const key of keys) {
        try {
          const usage = await apiClient.getAPIKeyUsage(key.key_id, storedApiKey || undefined);
          setUsageData(prev => ({ ...prev, [key.key_id]: usage }));
        } catch (err) {
          console.error(`Error loading usage for ${key.key_id}:`, err);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error loading API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const result = await apiClient.createAPIKey(
        {
          name: keyName,
          description: description || undefined,
          consumer_app_id: consumerAppId || undefined,
        },
        storedApiKey || undefined
      );

      setNewKey(result);
      setKeyName('');
      setDescription('');
      setConsumerAppId('');
      setShowCreateDialog(false);
      
      // Store the new key in localStorage
      if (result.api_key) {
        localStorage.setItem('compliance_engine_api_key', result.api_key);
        setStoredApiKey(result.api_key);
      }

      // Reload keys
      await loadAPIKeys();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error creating API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.revokeAPIKey(keyId, 'Revoked by user', storedApiKey || undefined);
      await loadAPIKeys();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error revoking API key');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'revoked':
        return 'bg-red-500/20 text-red-400';
      case 'expired':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <AppLayout>
      <div className="mb-6 lg:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
            API Keys
          </h1>
          <p className="text-sm lg:text-base text-slate-500 font-normal">
            Manage your API keys, view usage, and monitor consumption
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
          Create API Key
        </Button>
      </div>

      {/* New Key Dialog */}
      {newKey && (
        <Alert className="mb-6 border-[#00ade8]/20 bg-[#00ade8]/10">
          <Key className="h-4 w-4 text-[#00ade8]" />
          <AlertTitle className="text-[#00ade8]">API Key Created</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-3">
              <p className="text-sm text-slate-300 font-normal">
                ⚠️ <strong>Save this key now!</strong> You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/50 text-sm text-slate-300 font-mono break-all">
                  {newKey.api_key}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopyKey(newKey.api_key)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setNewKey(null);
                  loadAPIKeys();
                }}
              >
                Done
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Create Dialog */}
      {showCreateDialog && !newKey && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key to access the ComplianceEngine API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name *</Label>
                <Input
                  id="key-name"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production App, Test Environment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this key will be used for"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumer-app-id">Consumer App ID (optional)</Label>
                <Input
                  id="consumer-app-id"
                  value={consumerAppId}
                  onChange={(e) => setConsumerAppId(e.target.value)}
                  placeholder="e.g., my-app-production"
                />
                <p className="text-xs text-slate-600 font-normal">
                  Leave empty to auto-generate from name
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create API Key'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

      {/* API Keys List */}
      {!loading && apiKeys.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Key className="w-10 h-10 text-slate-700 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slate-500 mb-4 font-normal text-sm">No API keys found</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Your First API Key
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && apiKeys.length > 0 && (
        <div className="space-y-4">
          {apiKeys.map((key) => {
            const usage = usageData[key.key_id];
            const expired = isExpired(key.expires_at);
            
            return (
              <Card key={key.key_id} className="hover:border-slate-700/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{key.name}</CardTitle>
                        <Badge className={getStatusColor(key.status)}>
                          {key.status}
                        </Badge>
                        {expired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      {key.description && (
                        <CardDescription>{key.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newSet = new Set(visibleKeys);
                          if (newSet.has(key.key_id)) {
                            newSet.delete(key.key_id);
                          } else {
                            newSet.add(key.key_id);
                          }
                          setVisibleKeys(newSet);
                        }}
                      >
                        {visibleKeys.has(key.key_id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevokeKey(key.key_id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Key Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 font-normal mb-1">Key ID</p>
                        <p className="text-slate-300 font-mono text-xs">{key.key_id}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-normal mb-1">Prefix</p>
                        <p className="text-slate-300 font-mono text-xs">{key.key_prefix}...</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-normal mb-1">Created</p>
                        <p className="text-slate-300 text-xs">{formatDate(key.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-normal mb-1">Expires</p>
                        <p className="text-slate-300 text-xs">
                          {key.expires_at ? formatDate(key.expires_at) : 'Never'}
                        </p>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    {usage && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-600 font-normal">Today</p>
                            <p className="text-sm text-slate-300 font-medium">
                              {usage.usage.requests_today.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-600 font-normal">This Month</p>
                            <p className="text-sm text-slate-300 font-medium">
                              {usage.usage.requests_this_month.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-600 font-normal">Total</p>
                            <p className="text-sm text-slate-300 font-medium">
                              {usage.usage.total_requests.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-600 font-normal">Cost</p>
                            <p className="text-sm text-slate-300 font-medium">
                              $0.00
                            </p>
                            <p className="text-xs text-slate-600 font-normal">(Coming soon)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quotas */}
                    <div className="pt-4 border-t border-slate-800/50">
                      <p className="text-xs text-slate-600 font-normal mb-2">Rate Limits</p>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-600">Per Minute: </span>
                          <span className="text-slate-400">{key.quotas.requests_per_minute}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Per Day: </span>
                          <span className="text-slate-400">{key.quotas.requests_per_day.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Per Month: </span>
                          <span className="text-slate-400">{key.quotas.requests_per_month.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

