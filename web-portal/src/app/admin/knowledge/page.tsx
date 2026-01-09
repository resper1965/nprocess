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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { Database, Loader2, Plus, Upload, Link as LinkIcon, Copy, Check, FileText } from "lucide-react"
import { adminApi } from "@/lib/api-client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Context {
  context_id: string
  name: string
  type: "file" | "url" | "marketplace"
  strategy: "standard" | "legal"
  status: "indexing" | "ready" | "failed"
  vector_count?: number
  created_at: string
  source?: string
}

export default function KnowledgeOpsPage() {
  const [loading, setLoading] = useState(true)
  const [privateContexts, setPrivateContexts] = useState<Context[]>([])
  const [marketplaceDrivers, setMarketplaceDrivers] = useState<Context[]>([])
  const [ingestDialogOpen, setIngestDialogOpen] = useState(false)
  const [sourceType, setSourceType] = useState<"file" | "url">("file")
  const [chunkingStrategy, setChunkingStrategy] = useState<"standard" | "legal">("standard")
  const [sourceValue, setSourceValue] = useState("")
  const [estimatedVectors, setEstimatedVectors] = useState(0)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadContexts()
  }, [])

  useEffect(() => {
    // Estimate vectors based on strategy
    if (sourceValue) {
      const base = sourceType === "file" ? 400 : 300
      const multiplier = chunkingStrategy === "legal" ? 1.2 : 1.0
      setEstimatedVectors(Math.round(base * multiplier))
    } else {
      setEstimatedVectors(0)
    }
  }, [sourceValue, sourceType, chunkingStrategy])

  const loadContexts = async () => {
    try {
      setLoading(true)
      
      // Load knowledge bases
      const response = await adminApi.get('/v1/admin/kbs/').catch(() => ({ data: [] }))
      const kbs = response.data || []
      
      // Separate private and marketplace
      const privateList: Context[] = kbs
        .filter((kb: any) => kb.category !== 'lgpd' && kb.category !== 'gdpr' && kb.category !== 'cvm')
        .map((kb: any) => ({
          context_id: kb.kb_id,
          name: kb.name,
          type: 'file' as const,
          strategy: 'standard' as const,
          status: kb.status === 'active' ? 'ready' as const : 'indexing' as const,
          vector_count: kb.chunk_count,
          created_at: kb.created_at
        }))
      
      const marketplaceList: Context[] = kbs
        .filter((kb: any) => ['lgpd', 'gdpr', 'cvm', 'bpmn'].includes(kb.category))
        .map((kb: any) => ({
          context_id: kb.kb_id,
          name: kb.name,
          type: 'marketplace' as const,
          strategy: 'legal' as const,
          status: 'ready' as const,
          vector_count: kb.chunk_count,
          created_at: kb.created_at
        }))
      
      setPrivateContexts(privateList)
      setMarketplaceDrivers(marketplaceList)
    } catch (err: any) {
      console.error('Error loading contexts:', err)
      toast.error('Erro ao carregar contexts')
    } finally {
      setLoading(false)
    }
  }

  const handleIngest = async () => {
    if (!sourceValue) {
      toast.error("Preencha o source")
      return
    }

    try {
      setUploading(true)
      
      // TODO: Implement actual ingestion API call
      toast.success("Ingestão iniciada", {
        description: `Estimated vectors: ~${estimatedVectors}`
      })
      
      setIngestDialogOpen(false)
      setSourceValue("")
      setSourceType("file")
      setChunkingStrategy("standard")
      
      // Reload contexts after a delay
      setTimeout(() => {
        loadContexts()
      }, 2000)
    } catch (error: any) {
      toast.error("Erro ao iniciar ingestão", {
        description: error?.message
      })
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="outline" className="border-brand-ness/30 text-brand-ness bg-brand-ness/10">Ready</Badge>
      case 'indexing':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10">Indexing</Badge>
      case 'failed':
        return <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">Failed</Badge>
      default:
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400">Unknown</Badge>
    }
  }

  const getStrategyLabel = (strategy: string) => {
    return strategy === 'legal' ? 'Legal/Statute Structure' : 'Standard Rolling Window'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-ness" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <PageHeader 
        title="Knowledge Ops" 
        description="Ingestion engine for context management"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Ingest Button */}
          <div className="flex justify-end">
            <Dialog open={ingestDialogOpen} onOpenChange={setIngestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-ness hover:bg-brand-ness/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Ingest New Context
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="font-brand font-medium text-white">Ingestion Engine</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Configure technical parameters for context ingestion
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Source Type */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Source</Label>
                    <Select value={sourceType} onValueChange={(v: "file" | "url") => setSourceType(v)}>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="file" className="text-zinc-300">
                          Upload Arquivo
                        </SelectItem>
                        <SelectItem value="url" className="text-zinc-300">
                          URL Crawler
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Value */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      {sourceType === "file" ? "File" : "URL"}
                    </Label>
                    {sourceType === "file" ? (
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => setSourceValue(e.target.files?.[0]?.name || "")}
                        className="bg-zinc-950 border-zinc-800 text-zinc-300"
                      />
                    ) : (
                      <Input
                        placeholder="https://example.com/document"
                        value={sourceValue}
                        onChange={(e) => setSourceValue(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono text-sm"
                      />
                    )}
                  </div>

                  {/* Chunking Strategy */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Chunking Strategy *</Label>
                    <Select value={chunkingStrategy} onValueChange={(v: "standard" | "legal") => setChunkingStrategy(v)}>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="standard" className="text-zinc-300">
                          Standard Rolling Window
                        </SelectItem>
                        <SelectItem value="legal" className="text-zinc-300">
                          Legal/Statute Structure
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-zinc-500">
                      {chunkingStrategy === "legal" 
                        ? "Preserves Articles/Paragraphs structure for legal documents"
                        : "For general texts/manuals with rolling window approach"}
                    </p>
                  </div>

                  {/* Simulation */}
                  {estimatedVectors > 0 && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">Simulation</p>
                      <p className="text-sm text-zinc-300 font-mono">
                        Estimated Vectors: ~{estimatedVectors.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIngestDialogOpen(false)}
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleIngest}
                    disabled={!sourceValue || uploading}
                    className="bg-brand-ness hover:bg-brand-ness/90 text-white"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Ingesting...
                      </>
                    ) : (
                      "Start Ingestion"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="private" className="space-y-4">
            <TabsList className="bg-zinc-900 border-zinc-800">
              <TabsTrigger value="private" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                Private Contexts
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                Marketplace Drivers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="space-y-4">
              {privateContexts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400">No private contexts</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs text-zinc-500 font-mono border-b border-zinc-800">
                    <div>Context ID</div>
                    <div>Type</div>
                    <div>Strategy Used</div>
                    <div>Status</div>
                    <div>Vectors</div>
                  </div>
                  {/* Table Rows */}
                  {privateContexts.map((context) => (
                    <Card key={context.context_id} className="hover:border-zinc-700 transition-colors">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div className="font-mono text-sm text-zinc-300 truncate">
                            {context.context_id}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {context.type}
                          </div>
                          <div className="text-sm text-zinc-400 font-mono">
                            {getStrategyLabel(context.strategy)}
                          </div>
                          <div>
                            {getStatusBadge(context.status)}
                          </div>
                          <div className="text-sm text-zinc-300 font-mono">
                            {context.vector_count?.toLocaleString() || '-'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-4">
              {marketplaceDrivers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400">No marketplace drivers</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs text-zinc-500 font-mono border-b border-zinc-800">
                    <div>Context ID</div>
                    <div>Type</div>
                    <div>Strategy Used</div>
                    <div>Status</div>
                    <div>Vectors</div>
                  </div>
                  {/* Table Rows */}
                  {marketplaceDrivers.map((context) => (
                    <Card key={context.context_id} className="hover:border-zinc-700 transition-colors">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div className="font-mono text-sm text-zinc-300 truncate">
                            {context.context_id}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {context.type}
                          </div>
                          <div className="text-sm text-zinc-400 font-mono">
                            {getStrategyLabel(context.strategy)}
                          </div>
                          <div>
                            {getStatusBadge(context.status)}
                          </div>
                          <div className="text-sm text-zinc-300 font-mono">
                            {context.vector_count?.toLocaleString() || '-'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
