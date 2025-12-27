'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

interface APIKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed?: string
  status: string
}

export default function APIKeysPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchAPIKeys = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/api-keys')
        // const data = await response.json()
        // setApiKeys(data)

        // For now, return empty array
        setApiKeys([])
      } catch (err) {
        console.error('Failed to load API keys:', err)
        toast.error('Failed to load API keys')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAPIKeys()
    }
  }, [user])

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API key copied to clipboard')
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

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }

    // TODO: Call API to create key
    toast.success('API key created successfully')
    setShowNewKeyDialog(false)
    setNewKeyName('')
  }

  const maskKey = (key: string) => {
    const prefix = key.slice(0, 12)
    const suffix = key.slice(-4)
    return `${prefix}${'•'.repeat(20)}${suffix}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            API Keys
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your API keys for accessing the ComplianceEngine API
          </p>
        </div>
        <Button
          onClick={() => setShowNewKeyDialog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {/* Usage Info */}
      <Card glass>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Key className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {apiKeys.length} / 1 API Key Used
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Starter plan allows 1 active API key
                </p>
              </div>
            </div>
            <button className="text-sm text-primary hover:underline font-medium">
              Upgrade for more keys
            </button>
          </div>
        </CardContent>
      </Card>

      {/* New Key Dialog */}
      {showNewKeyDialog && (
        <Card glass className="border-2 border-primary/50">
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Give your API key a descriptive name to identify it later
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Key Name
              </label>
              <Input
                glass
                placeholder="e.g., Production Key, Development Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNewKeyDialog(false)
                  setNewKeyName('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateKey}>
                Create Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 && !showNewKeyDialog ? (
        <Card glass>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No API Keys Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
              Create your first API key to start using the n.process API in your applications
            </p>
            <Button onClick={() => setShowNewKeyDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => {
          const isRevealed = revealedKeys.has(apiKey.id)

          return (
            <Card key={apiKey.id} glass>
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
                          Created {apiKey.created}
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
                        onClick={() => {
                          // TODO: Implement delete
                          toast.success('API key revoked')
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      API Key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-900/60 rounded-lg text-sm font-mono border border-gray-200 dark:border-gray-800">
                        {isRevealed ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="glass"
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
                        variant="glass"
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
                      Last used {apiKey.lastUsed}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
          })}
        </div>
      )}

      {/* Documentation */}
      <Card glass>
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
  )
}
