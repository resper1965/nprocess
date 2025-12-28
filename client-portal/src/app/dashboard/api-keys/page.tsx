'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { useI18n } from '@/lib/i18n/context'
import { Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAPIKeysList, useCreateAPIKey, useRevokeAPIKey } from '@/hooks/use-api-keys'
import { formatDate } from '@/lib/utils'

export default function APIKeysPage() {
  const { t } = useI18n()
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  // Fetch API keys from API
  const { data: apiKeys, isLoading, error } = useAPIKeysList()
  const createKeyMutation = useCreateAPIKey()
  const revokeKeyMutation = useRevokeAPIKey()

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success(t.apiKeys.keyCopied)
  }

  const toggleKeyVisibility = (keyId: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev)
      if (next.has(keyId)) {
        next.delete(keyId)
      } else {
        next.add(keyId)
      }
      return next
    })
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error(t.apiKeys.enterKeyName)
      return
    }

    try {
      const result = await createKeyMutation.mutateAsync({
        name: newKeyName,
        consumer_app_id: 'default',
        quotas: {
          requests_per_day: 10000,
        },
        permissions: ['read', 'write'],
      })
      
      setNewKeyValue(result.api_key)
      toast.success(t.apiKeys.newKeyCreated)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key')
    }
  }

  const handleCloseDialog = () => {
    setShowNewKeyDialog(false)
    setNewKeyName('')
    setNewKeyValue(null)
  }

  const maskKey = (key: string) => {
    const prefix = key.slice(0, 12)
    const suffix = key.slice(-4)
    return `${prefix}${'•'.repeat(20)}${suffix}`
  }

  return (
    <>
      <PageHeader 
        title={t.apiKeys.title} 
        description={t.apiKeys.subtitle}
      >
        <Button
          onClick={() => setShowNewKeyDialog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.apiKeys.create}
        </Button>
      </PageHeader>
      <div className="p-6 lg:p-8 space-y-8">

      {/* Usage Info */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Key className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isLoading ? t.common.loading : `${apiKeys?.length || 0} / 1 ${t.apiKeys.used}`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.apiKeys.starterPlanAllows}
                </p>
              </div>
            </div>
            <button className="text-sm text-primary hover:underline font-medium">
              {t.apiKeys.upgradeForMore}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="glass border-red-500/50">
          <CardContent className="p-6">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.apiKeys.loading}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Key Dialog */}
      {showNewKeyDialog && (
        <Card className="glass border-2 border-primary/50">
          <CardHeader>
            <CardTitle>
              {newKeyValue ? t.apiKeys.createdSuccessfully : t.apiKeys.createNew}
            </CardTitle>
            <CardDescription>
              {newKeyValue 
                ? t.apiKeys.saveKeyNow
                : t.apiKeys.giveDescriptiveName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newKeyValue ? (
              <>
                <div className="p-4 bg-gray-100 dark:bg-gray-900/60 rounded-lg space-y-2">
                  <p className="text-sm font-medium">{t.apiKeys.yourNewApiKey}</p>
                  <code className="block p-3 bg-white dark:bg-gray-950 rounded text-xs font-mono break-all">
                    {newKeyValue}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(newKeyValue)
                      toast.success(t.apiKeys.keyCopied)
                    }}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    {t.apiKeys.copyToClipboard}
                  </Button>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    ⚠️ <strong>{t.apiKeys.important}:</strong> {t.apiKeys.keyShownOnce}
                  </p>
                </div>
                <Button onClick={handleCloseDialog} className="w-full">
                  {t.apiKeys.close}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.apiKeys.name}
                  </label>
                  <Input
                    className="glass"
                    placeholder="e.g., Production Key, Development Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                    disabled={createKeyMutation.isPending}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={handleCloseDialog}
                    disabled={createKeyMutation.isPending}
                  >
                    {t.common.cancel}
                  </Button>
                  <Button 
                    onClick={handleCreateKey}
                    disabled={!newKeyName.trim() || createKeyMutation.isPending}
                  >
                    {createKeyMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t.common.loading}
                      </>
                    ) : (
                      t.apiKeys.create
                    )}
                  </Button>
                </div>
                {createKeyMutation.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-500">
                      Error: {createKeyMutation.error.message}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {apiKeys && apiKeys.length > 0 ? apiKeys.map((apiKey) => {
          const isRevealed = revealedKeys.has(apiKey.id)

          return (
            <Card key={apiKey.id} className="glass">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {apiKey.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t.apiKeys.created} {formatDate(apiKey.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="text-xs">
                        {apiKey.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (confirm(t.apiKeys.revoke + '?')) {
                            try {
                              await revokeKeyMutation.mutateAsync(apiKey.id || apiKey.key_id || '')
                              toast.success(t.apiKeys.revoked)
                            } catch (error: any) {
                              toast.error(error.message || 'Failed to revoke API key')
                            }
                          }
                        }}
                        disabled={revokeKeyMutation.isPending || apiKey.status === 'revoked'}
                      >
                        {revokeKeyMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.apiKeys.title}
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-900/60 rounded-lg text-sm font-mono border border-gray-200 dark:border-gray-800">
                        {isRevealed ? (apiKey.key || apiKey.key_id || apiKey.id) : maskKey(apiKey.key || apiKey.key_id || apiKey.id)}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {isRevealed ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyKey(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Last used {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : 'Never'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
          }) : (
            <Card className="glass">
              <CardContent className="py-12">
                  <div className="text-center space-y-4">
                  <Key className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t.apiKeys.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t.apiKeys.create}
                    </p>
                  </div>
                  <Button onClick={() => setShowNewKeyDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t.apiKeys.create}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Documentation */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Using Your API Key</CardTitle>
          <CardDescription>
            Include your API key in the Authorization header of your requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-gray-100 dark:bg-gray-900/60 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <code className="text-sm font-mono text-gray-900 dark:text-white">
                curl https://api.compliance-engine.com/v1/analyze \<br />
                &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br />
                &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                &nbsp;&nbsp;-d '{"{"}"document": "..."{"}"}'
              </code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keep your API keys secure and never share them publicly. Treat them like passwords.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}
