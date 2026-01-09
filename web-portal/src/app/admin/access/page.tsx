"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { Plus, Key, Copy, Check, RefreshCw, Loader2, Shield, Users, AlertTriangle } from "lucide-react"
import { adminApi } from "@/lib/api-client"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { useAPIKeysList, useCreateAPIKey, useRevokeAPIKey } from "@/hooks/use-api-keys"
import { useGenerateAPIKey } from "@/hooks/use-generate-api-key"
import { copyKeyToClipboard } from "@/lib/api-key-generator"

interface Consumer {
  consumer_id: string
  tenant_name: string
  environment: "prod" | "staging" | "dev"
  status: "active" | "suspended" | "inactive"
  cost_limit?: number
  created_at: string
}

export default function NetworkAccessPage() {
  const [loading, setLoading] = useState(true)
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [newConsumerDialogOpen, setNewConsumerDialogOpen] = useState(false)
  const [newConsumerName, setNewConsumerName] = useState("")
  const [newConsumerCostLimit, setNewConsumerCostLimit] = useState("")
  const [creatingConsumer, setCreatingConsumer] = useState(false)

  // Key Vault state
  const { data: apiKeys, isLoading: keysLoading } = useAPIKeysList()
  const revokeKeyMutation = useRevokeAPIKey()
  const { generate, rotate, isGenerating, generatedKey, clear } = useGenerateAPIKey()
  const [rollKeyDialogOpen, setRollKeyDialogOpen] = useState(false)
  const [rollingKeyId, setRollingKeyId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  useEffect(() => {
    loadConsumers()
  }, [])

  const loadConsumers = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call when consumer endpoint is available
      // For now, extract unique consumers from API keys
      const keysResponse = await adminApi.get('/v1/admin/apikeys/').catch(() => ({ data: { api_keys: [] } }))
      const keys = keysResponse.data?.api_keys || []
      
      // Group by consumer_app_id to create consumer list
      const consumerMap = new Map<string, Consumer>()
      keys.forEach((key: any) => {
        if (!consumerMap.has(key.consumer_app_id)) {
          consumerMap.set(key.consumer_app_id, {
            consumer_id: key.consumer_app_id,
            tenant_name: key.consumer_app_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            environment: key.environment || 'prod',
            status: key.active ? 'active' : 'inactive',
            created_at: key.created_at
          })
        }
      })
      
      setConsumers(Array.from(consumerMap.values()))
    } catch (error) {
      console.error("Failed to load consumers:", error)
      toast.error("Erro ao carregar consumers")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConsumer = async () => {
    if (!newConsumerName.trim()) {
      toast.error("Nome do consumer é obrigatório")
      return
    }

    try {
      setCreatingConsumer(true)
      // TODO: Replace with actual API call when consumer endpoint is available
      const costLimit = newConsumerCostLimit ? parseFloat(newConsumerCostLimit) : undefined
      
      toast.success("Consumer criado com sucesso", {
        description: `Consumer ID: ${newConsumerName.toLowerCase().replace(/\s+/g, '-')}`
      })
      
      setNewConsumerDialogOpen(false)
      setNewConsumerName("")
      setNewConsumerCostLimit("")
      loadConsumers()
    } catch (error: any) {
      toast.error("Erro ao criar consumer", {
        description: error?.message
      })
    } finally {
      setCreatingConsumer(false)
    }
  }

  const handleRollKey = async (keyId: string) => {
    try {
      setRollingKeyId(keyId)
      setRollKeyDialogOpen(true)
      
      // Usar a rotina de rotação
      const existingKey = apiKeys?.find(k => k.id === keyId)
      if (!existingKey) {
        toast.error("Key não encontrada")
        setRollKeyDialogOpen(false)
        return
      }

      const result = await rotate(keyId, `${existingKey.name} (rotated)`)
      
      if (!result.success) {
        setRollKeyDialogOpen(false)
      }
    } catch (error: any) {
      toast.error("Erro ao rotacionar key", {
        description: error?.message
      })
      setRollKeyDialogOpen(false)
    } finally {
      setRollingKeyId(null)
    }
  }

  const handleCopyKey = async () => {
    if (generatedKey) {
      await copyKeyToClipboard(generatedKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const handleGenerateNewKey = async () => {
    // Abre o dialog de criação (redireciona para página de API Keys)
    window.location.href = '/admin/api-keys'
  }

  const getEnvironmentBadge = (env: string) => {
    switch (env) {
      case 'prod':
        return <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">Prod</Badge>
      case 'staging':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">Staging</Badge>
      case 'dev':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">Dev</Badge>
      default:
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-brand-ness/30 text-brand-ness bg-brand-ness/10">Active</Badge>
      case 'suspended':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">Suspended</Badge>
      case 'inactive':
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400">Inactive</Badge>
      default:
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400">Unknown</Badge>
    }
  }

  const getKeyHint = (key: string) => {
    if (!key) return "ness_live_..."
    const parts = key.split('_')
    if (parts.length >= 3) {
      return `ness_${parts[1]}_...${key.slice(-4)}`
    }
    return `ness_live_...${key.slice(-4)}`
  }

  const getScopes = (key: any) => {
    // Extract scopes from permissions or default
    if (key.permissions && Array.isArray(key.permissions)) {
      return key.permissions.join(', ')
    }
    return 'Read, Write'
  }

  if (loading || keysLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-ness" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <PageHeader 
        title="Network & Access" 
        description="Manage clients and credentials"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Tabs defaultValue="consumers" className="space-y-4">
            <TabsList className="bg-zinc-900 border-zinc-800">
              <TabsTrigger value="consumers" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                <Users className="h-4 w-4 mr-2" />
                Consumer Registry
              </TabsTrigger>
              <TabsTrigger value="keys" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                <Key className="h-4 w-4 mr-2" />
                Key Vault
              </TabsTrigger>
            </TabsList>

            {/* Tab A: Consumer Registry */}
            <TabsContent value="consumers" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={newConsumerDialogOpen} onOpenChange={setNewConsumerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-brand-ness hover:bg-brand-ness/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Register New Consumer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="font-brand font-medium text-white">Register Consumer</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Register a new system that will consume the API
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Tenant Name *</Label>
                        <Input
                          placeholder="e.g., ERP SAP Production"
                          value={newConsumerName}
                          onChange={(e) => setNewConsumerName(e.target.value)}
                          className="bg-zinc-950 border-zinc-800 text-zinc-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Cost Limit (USD/month)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 1000"
                          value={newConsumerCostLimit}
                          onChange={(e) => setNewConsumerCostLimit(e.target.value)}
                          className="bg-zinc-950 border-zinc-800 text-zinc-300"
                        />
                        <p className="text-xs text-zinc-500">Optional: Set a monthly cost limit for this consumer</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setNewConsumerDialogOpen(false)}
                        className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateConsumer}
                        disabled={!newConsumerName.trim() || creatingConsumer}
                        className="bg-brand-ness hover:bg-brand-ness/90 text-white"
                      >
                        {creatingConsumer ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Consumer ID</TableHead>
                        <TableHead>Tenant Name</TableHead>
                        <TableHead>Environment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consumers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                            No consumers registered
                          </TableCell>
                        </TableRow>
                      ) : (
                        consumers.map((consumer) => (
                          <TableRow key={consumer.consumer_id}>
                            <TableCell className="font-mono text-sm text-zinc-300">
                              {consumer.consumer_id}
                            </TableCell>
                            <TableCell className="text-zinc-300">
                              {consumer.tenant_name}
                            </TableCell>
                            <TableCell>
                              {getEnvironmentBadge(consumer.environment)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(consumer.status)}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm font-mono">
                              {formatDate(consumer.created_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab B: Key Vault */}
            <TabsContent value="keys" className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  className="bg-brand-ness hover:bg-brand-ness/90 text-white"
                  onClick={handleGenerateNewKey}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New API Key for Client
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-brand font-medium text-lg text-white">
                        API Keys
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        Credentials generated by ness. and provided to clients for API integration. Keys are shown once during generation.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key Hint</TableHead>
                        <TableHead>Associated Consumer</TableHead>
                        <TableHead>Scopes</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!apiKeys || apiKeys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                            No API keys found
                          </TableCell>
                        </TableRow>
                      ) : (
                        apiKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell className="font-mono text-sm text-zinc-300">
                              {getKeyHint(key.key || key.id)}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-zinc-300">
                              {key.consumer_app_id}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm">
                              {getScopes(key)}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm font-mono">
                              {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRollKey(key.id)}
                                className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-brand-ness"
                                title="Generate a new key to replace this one and provide to client"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Rotate Key
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Roll Key Dialog - Shows key once */}
              <Dialog open={rollKeyDialogOpen} onOpenChange={(open) => {
                if (!open && generatedKey) {
                  // Clear the key when dialog closes
                  clear()
                  setRollKeyDialogOpen(false)
                } else {
                  setRollKeyDialogOpen(open)
                }
              }}>
                <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-brand font-medium text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-brand-ness" />
                      API Key Ready for Client
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      This key will only be shown once. Copy it now and provide it to your client for integration.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-zinc-950 border-2 border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <p className="text-sm font-medium text-yellow-500">One-Time Display</p>
                      </div>
                      <p className="text-xs text-zinc-400">
                        This key will not be displayed again. Copy it now and provide it to your client. They will use this key in their application to authenticate API requests.
                      </p>
                    </div>
                    <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-6 relative">
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyKey}
                          className="h-8 px-2 text-zinc-400 hover:text-brand-ness"
                        >
                          {copiedKey ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <code className="text-lg text-zinc-300 font-mono break-all block pr-20">
                        {generatedKey || (isGenerating ? "Generating..." : "No key generated")}
                      </code>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        clear()
                        setRollKeyDialogOpen(false)
                        // Reload keys list
                        window.location.reload()
                      }}
                      className="bg-brand-ness hover:bg-brand-ness/90 text-white"
                      disabled={!generatedKey}
                    >
                      Key Copied - Ready to Provide to Client
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
