"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Plus, Search, Copy, MoreVertical, Trash2, Key, Loader2, AlertCircle, Shield } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { useAPIKeysList, useCreateAPIKey, useRevokeAPIKey } from "@/hooks/use-api-keys"
import { APIKeyCreate } from "@/lib/api-client"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface MarketplaceStandard {
  standard_id: string
  name: string
  description: string
  category: string
  is_active: boolean
}

interface CustomStandard {
  id: string
  name: string
  description: string
  status: string
}

export default function APIKeysPage() {
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newKeyData, setNewKeyData] = useState<string | null>(null)

  // Form state
  const [keyName, setKeyName] = useState("")
  const [consumerAppId, setConsumerAppId] = useState("")
  const [dailyQuota, setDailyQuota] = useState("10000")
  const [description, setDescription] = useState("")

  // Standards state
  const [marketplaceStandards, setMarketplaceStandards] = useState<MarketplaceStandard[]>([])
  const [customStandards, setCustomStandards] = useState<CustomStandard[]>([])
  const [selectedMarketplace, setSelectedMarketplace] = useState<string[]>([])
  const [selectedCustom, setSelectedCustom] = useState<string[]>([])
  const [loadingStandards, setLoadingStandards] = useState(false)

  // Fetch API keys from backend
  const { data: apiKeys, isLoading, error } = useAPIKeysList()
  const createKeyMutation = useCreateAPIKey()
  const revokeKeyMutation = useRevokeAPIKey()

  // Load standards when dialog opens
  useEffect(() => {
    if (showNewKeyDialog) {
      loadStandards()
    }
  }, [showNewKeyDialog])

  const loadStandards = async () => {
    setLoadingStandards(true)
    try {
      const token = localStorage.getItem('auth_token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      // Load marketplace standards
      const marketplaceRes = await fetch(`${API_URL}/v1/admin/standards/marketplace`, { headers })
      if (marketplaceRes.ok) {
        const data = await marketplaceRes.json()
        setMarketplaceStandards(data.standards || [])
      }

      // Load custom standards (only completed ones)
      const customRes = await fetch(`${API_URL}/v1/admin/standards/custom`, { headers })
      if (customRes.ok) {
        const data = await customRes.json()
        const completedStandards = (data.standards || []).filter((s: CustomStandard) => s.status === 'completed')
        setCustomStandards(completedStandards)
      }
    } catch (error) {
      console.error('Error loading standards:', error)
      toast.error('Erro ao carregar standards')
    } finally {
      setLoadingStandards(false)
    }
  }

  const filteredKeys = apiKeys?.filter((key) =>
    key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.consumer_app_id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
  }

  const handleCreateKey = async () => {
    if (!keyName || !consumerAppId) return

    const request: APIKeyCreate = {
      name: keyName,
      description: description || undefined,
      consumer_app_id: consumerAppId,
      quotas: {
        requests_per_minute: 100,
        requests_per_day: parseInt(dailyQuota) || 10000,
        requests_per_month: (parseInt(dailyQuota) || 10000) * 30,
      },
      permissions: ["read", "write"],
      allowed_standards: {
        marketplace: selectedMarketplace,
        custom: selectedCustom,
      },
    }

    try {
      const result = await createKeyMutation.mutateAsync(request)
      setNewKeyData(result.api_key)
      // Reset form
      setKeyName("")
      setConsumerAppId("")
      setDailyQuota("10000")
      setDescription("")
      setSelectedMarketplace([])
      setSelectedCustom([])
    } catch (error) {
      console.error("Failed to create API key:", error)
      toast.error("Erro ao criar API key")
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return
    }

    try {
      await revokeKeyMutation.mutateAsync(keyId)
    } catch (error) {
      console.error("Failed to revoke API key:", error)
    }
  }

  const closeNewKeyDialog = () => {
    setShowNewKeyDialog(false)
    setNewKeyData(null)
    setKeyName("")
    setConsumerAppId("")
    setDailyQuota("10000")
    setDescription("")
    setSelectedMarketplace([])
    setSelectedCustom([])
  }

  const toggleMarketplaceStandard = (standardId: string) => {
    setSelectedMarketplace(prev =>
      prev.includes(standardId)
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    )
  }

  const toggleCustomStandard = (standardId: string) => {
    setSelectedCustom(prev =>
      prev.includes(standardId)
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys for consumer applications
          </p>
        </div>
        <Card className="border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load API keys. Please check your connection and try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys for consumer applications
          </p>
        </div>
        <Button onClick={() => setShowNewKeyDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search API keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              All Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Loading API keys...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredKeys.map((apiKey) => {
            const usagePercent = apiKey.usage && apiKey.quotas?.requests_per_day
              ? ((apiKey.usage.requests_today || 0) / apiKey.quotas.requests_per_day) * 100
              : 0

            // Extract prefix from key for display
            const keyPrefix = apiKey.key.substring(0, 12)

            return (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {keyPrefix}...
                        </code>
                        <span>•</span>
                        <span>{apiKey.consumer_app_id}</span>
                        <span>•</span>
                        <Badge variant="outline" className="capitalize">
                          {apiKey.status || (apiKey.active ? 'active' : 'revoked')}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={apiKey.status === "active" ? "success" : "default"}>
                        {apiKey.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium mt-1">
                        {formatDate(apiKey.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Used</p>
                      <p className="font-medium mt-1">
                        {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Requests Today</p>
                      <p className="font-medium mt-1">
                        {(apiKey.usage?.requests_today || 0).toLocaleString()} / {(apiKey.quotas?.requests_per_day || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Usage</p>
                      <div className="mt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              usagePercent > 80 ? "bg-red-500" :
                              usagePercent > 50 ? "bg-yellow-500" :
                              "bg-green-500"
                            )}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {usagePercent.toFixed(1)}% of quota
                        </p>
                      </div>
                    </div>
                  </div>

                  {apiKey.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">{apiKey.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyKey(apiKey.key_id || apiKey.key)}
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy ID
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRevokeKey(apiKey.key_id || apiKey.id)}
                      disabled={revokeKeyMutation.isPending || apiKey.status === "revoked"}
                    >
                      {revokeKeyMutation.isPending ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3 mr-2" />
                      )}
                      Revoke
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredKeys.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Key className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">No API keys found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search" : "Create your first API key to get started"}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => setShowNewKeyDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Key Dialog (Modal) */}
      {showNewKeyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>
                {newKeyData ? "API Key Created Successfully" : "Create New API Key"}
              </CardTitle>
              <CardDescription>
                {newKeyData
                  ? "Save this key now - you won't be able to see it again!"
                  : "Generate a new API key for a consumer application"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {newKeyData ? (
                <>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-sm font-medium">Your new API key:</p>
                    <code className="block p-3 bg-background rounded text-xs font-mono break-all">
                      {newKeyData}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopyKey(newKeyData)}
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">
                      ⚠️ <strong>Important:</strong> This key will only be shown once. Make sure to copy and store it securely.
                    </p>
                  </div>
                  <Button onClick={closeNewKeyDialog} className="w-full">
                    Close
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key Name *</label>
                    <Input
                      placeholder="e.g., Contracts App - Production"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Consumer App ID *</label>
                    <Input
                      placeholder="e.g., contracts-app"
                      value={consumerAppId}
                      onChange={(e) => setConsumerAppId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Optional description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Daily Request Quota</label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={dailyQuota}
                      onChange={(e) => setDailyQuota(e.target.value)}
                    />
                  </div>

                  {/* Standards Selection */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Allowed Standards</label>
                    </div>

                    {loadingStandards ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        {/* Marketplace Standards */}
                        {marketplaceStandards.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Marketplace Standards</Label>
                            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                              {marketplaceStandards.map((standard) => (
                                <div key={standard.standard_id} className="flex items-start space-x-2">
                                  <Checkbox
                                    id={`marketplace-${standard.standard_id}`}
                                    checked={selectedMarketplace.includes(standard.standard_id)}
                                    onCheckedChange={() => toggleMarketplaceStandard(standard.standard_id)}
                                  />
                                  <div className="grid gap-1 leading-none">
                                    <label
                                      htmlFor={`marketplace-${standard.standard_id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {standard.name}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      {standard.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Custom Standards */}
                        {customStandards.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Custom Standards</Label>
                            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                              {customStandards.map((standard) => (
                                <div key={standard.id} className="flex items-start space-x-2">
                                  <Checkbox
                                    id={`custom-${standard.id}`}
                                    checked={selectedCustom.includes(standard.id)}
                                    onCheckedChange={() => toggleCustomStandard(standard.id)}
                                  />
                                  <div className="grid gap-1 leading-none">
                                    <label
                                      htmlFor={`custom-${standard.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {standard.name}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      {standard.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {marketplaceStandards.length === 0 && customStandards.length === 0 && (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            Nenhum standard disponível. Crie standards primeiro.
                          </div>
                        )}

                        {(selectedMarketplace.length > 0 || selectedCustom.length > 0) && (
                          <div className="text-xs text-muted-foreground">
                            {selectedMarketplace.length + selectedCustom.length} standard(s) selecionado(s)
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={handleCreateKey}
                      disabled={!keyName || !consumerAppId || createKeyMutation.isPending}
                    >
                      {createKeyMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Generate Key
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeNewKeyDialog}
                      disabled={createKeyMutation.isPending}
                    >
                      Cancel
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
        </div>
      )}
    </div>
  )
}
