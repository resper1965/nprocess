"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { 
  Database, Loader2, Plus, Upload, Link as LinkIcon, 
  Copy, Check, FileText, Globe, Edit, Eye, Rocket,
  Trash2, RefreshCw
} from "lucide-react"
import { 
  listKnowledgeBases, createKnowledgeBase, ingestKnowledgeBaseDocuments,
  publishKnowledgeBase, updateKnowledgeBase, getKnowledgeBase,
  type KnowledgeBase, type KBCreate, type KBIngestDocument
} from "@/lib/api-client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function KnowledgeOpsPage() {
  const [loading, setLoading] = useState(true)
  const [kbs, setKbs] = useState<KnowledgeBase[]>([])
  const [privateKBs, setPrivateKBs] = useState<KnowledgeBase[]>([])
  const [marketplaceKBs, setMarketplaceKBs] = useState<KnowledgeBase[]>([])
  
  // Create KB Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState<Partial<KBCreate>>({
    name: "",
    description: "",
    category: "custom",
    price_monthly_cents: 0,
    update_frequency: "weekly",
    tags: [],
  })
  const [creating, setCreating] = useState(false)
  
  // Ingest Dialog
  const [ingestDialogOpen, setIngestDialogOpen] = useState(false)
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [sourceType, setSourceType] = useState<"file" | "url" | "text">("file")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlValue, setUrlValue] = useState("")
  const [textContent, setTextContent] = useState("")
  const [documentTitle, setDocumentTitle] = useState("")
  const [chunkingStrategy, setChunkingStrategy] = useState<"standard" | "legal">("standard")
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // View KB Dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingKB, setViewingKB] = useState<KnowledgeBase | null>(null)

  useEffect(() => {
    loadKBs()
  }, [])

  const loadKBs = async () => {
    try {
      setLoading(true)
      const response = await listKnowledgeBases()
      
      if (response.error) {
        toast.error("Erro ao carregar Knowledge Bases", {
          description: response.error
        })
        return
      }
      
      const allKBs = response.data || []
      setKbs(allKBs)
      
      // Separate by category
      const privateList = allKBs.filter(kb => 
        !['lgpd', 'gdpr', 'cvm', 'bpmn', 'sox', 'iso_27001', 'iso_27701', 'hipaa', 'aneel', 'bacen'].includes(kb.category)
      )
      const marketplaceList = allKBs.filter(kb => 
        ['lgpd', 'gdpr', 'cvm', 'bpmn', 'sox', 'iso_27001', 'iso_27701', 'hipaa', 'aneel', 'bacen'].includes(kb.category)
      )
      
      setPrivateKBs(privateList)
      setMarketplaceKBs(marketplaceList)
    } catch (err: any) {
      console.error('Error loading KBs:', err)
      toast.error('Erro ao carregar Knowledge Bases')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKB = async () => {
    if (!createForm.name || !createForm.description) {
      toast.error("Preencha nome e descrição")
      return
    }

    try {
      setCreating(true)
      const response = await createKnowledgeBase(createForm as KBCreate)
      
      if (response.error) {
        toast.error("Erro ao criar Knowledge Base", {
          description: response.error
        })
        return
      }
      
      toast.success("Knowledge Base criada", {
        description: `KB ${response.data?.name} criada com sucesso`
      })
      
      setCreateDialogOpen(false)
      setCreateForm({
        name: "",
        description: "",
        category: "custom",
        price_monthly_cents: 0,
        update_frequency: "weekly",
        tags: [],
      })
      
      await loadKBs()
    } catch (error: any) {
      toast.error("Erro ao criar Knowledge Base", {
        description: error?.message
      })
    } finally {
      setCreating(false)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      reader.onerror = reject
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.readAsText(file)
      } else {
        // For PDF/DOC, we'll need to extract text on backend
        // For now, just read as text and let backend handle it
        reader.readAsText(file)
      }
    })
  }

  const handleIngest = async () => {
    if (!selectedKB) {
      toast.error("Selecione uma Knowledge Base")
      return
    }

    let documents: KBIngestDocument[] = []

    try {
      setUploading(true)

      if (sourceType === "file" && selectedFile) {
        const content = await readFileContent(selectedFile)
        documents = [{
          content,
          source: selectedFile.name,
          metadata: {
            title: documentTitle || selectedFile.name,
            type: "file",
            uploaded_at: new Date().toISOString()
          }
        }]
      } else if (sourceType === "url" && urlValue) {
        // For URL, we'll need backend to crawl it
        // For now, create a placeholder document
        documents = [{
          content: `URL: ${urlValue}\n\n[Conteúdo será extraído pelo crawler]`,
          source: urlValue,
          metadata: {
            title: documentTitle || urlValue,
            type: "url",
            url: urlValue,
            uploaded_at: new Date().toISOString()
          }
        }]
      } else if (sourceType === "text" && textContent) {
        documents = [{
          content: textContent,
          source: documentTitle || "text_input.txt",
          metadata: {
            title: documentTitle || "Text Input",
            type: "text",
            uploaded_at: new Date().toISOString()
          }
        }]
      } else {
        toast.error("Preencha o conteúdo para ingestão")
        return
      }

      const response = await ingestKnowledgeBaseDocuments(selectedKB.kb_id, {
        documents,
        replace_existing: replaceExisting
      })

      if (response.error) {
        toast.error("Erro ao ingerir documentos", {
          description: response.error
        })
        return
      }

      toast.success("Documentos ingeridos", {
        description: `${response.data?.documents_ingested} documentos, ${response.data?.chunks_created} chunks criados`
      })

      setIngestDialogOpen(false)
      resetIngestForm()
      await loadKBs()
    } catch (error: any) {
      toast.error("Erro ao ingerir documentos", {
        description: error?.message
      })
    } finally {
      setUploading(false)
    }
  }

  const resetIngestForm = () => {
    setSelectedFile(null)
    setUrlValue("")
    setTextContent("")
    setDocumentTitle("")
    setSourceType("file")
    setChunkingStrategy("standard")
    setReplaceExisting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePublish = async (kb: KnowledgeBase) => {
    if (kb.document_count === 0) {
      toast.error("Não é possível publicar KB vazia", {
        description: "Ingira pelo menos um documento antes de publicar"
      })
      return
    }

    try {
      const response = await publishKnowledgeBase(kb.kb_id)
      
      if (response.error) {
        toast.error("Erro ao publicar Knowledge Base", {
          description: response.error
        })
        return
      }

      toast.success("Knowledge Base publicada", {
        description: `${kb.name} agora está disponível no marketplace`
      })
      
      await loadKBs()
    } catch (error: any) {
      toast.error("Erro ao publicar Knowledge Base", {
        description: error?.message
      })
    }
  }

  const handleViewKB = async (kb: KnowledgeBase) => {
    try {
      const response = await getKnowledgeBase(kb.kb_id)
      if (response.data) {
        setViewingKB(response.data)
        setViewDialogOpen(true)
      }
    } catch (error: any) {
      toast.error("Erro ao carregar detalhes", {
        description: error?.message
      })
    }
  }

  const openIngestDialog = (kb: KnowledgeBase) => {
    setSelectedKB(kb)
    setIngestDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-brand-ness/30 text-brand-ness bg-brand-ness/10">Active</Badge>
      case 'draft':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10">Draft</Badge>
      case 'archived':
        return <Badge variant="outline" className="border-zinc-500/30 text-zinc-500 bg-zinc-500/10">Archived</Badge>
      default:
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400">Unknown</Badge>
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      lgpd: "LGPD",
      gdpr: "GDPR",
      cvm: "CVM",
      bpmn: "BPMN",
      sox: "SOX",
      iso_27001: "ISO 27001",
      iso_27701: "ISO 27701",
      hipaa: "HIPAA",
      aneel: "ANEEL",
      bacen: "BACEN",
      custom: "Custom"
    }
    return labels[category] || category
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
      <div className="flex-1 overflow-auto px-3 py-4">
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-brand font-medium text-lg text-zinc-300 tracking-tight">Knowledge Bases</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Gerencie suas bases de conhecimento • Powered by <span className="text-brand-ness font-medium">Gemini RAG</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadKBs}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-brand-ness hover:bg-brand-ness/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create KB
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-brand font-medium text-white">Create Knowledge Base</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Crie uma nova Knowledge Base para o marketplace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Name *</Label>
                      <Input
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 text-zinc-300"
                        placeholder="LGPD Completa 2026"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Description *</Label>
                      <Textarea
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 text-zinc-300"
                        placeholder="Descrição completa da Knowledge Base..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Category</Label>
                        <Select
                          value={createForm.category}
                          onValueChange={(v) => setCreateForm({ ...createForm, category: v })}
                        >
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="custom" className="text-zinc-300">Custom</SelectItem>
                            <SelectItem value="lgpd" className="text-zinc-300">LGPD</SelectItem>
                            <SelectItem value="gdpr" className="text-zinc-300">GDPR</SelectItem>
                            <SelectItem value="cvm" className="text-zinc-300">CVM</SelectItem>
                            <SelectItem value="bpmn" className="text-zinc-300">BPMN</SelectItem>
                            <SelectItem value="sox" className="text-zinc-300">SOX</SelectItem>
                            <SelectItem value="iso_27001" className="text-zinc-300">ISO 27001</SelectItem>
                            <SelectItem value="iso_27701" className="text-zinc-300">ISO 27701</SelectItem>
                            <SelectItem value="hipaa" className="text-zinc-300">HIPAA</SelectItem>
                            <SelectItem value="aneel" className="text-zinc-300">ANEEL</SelectItem>
                            <SelectItem value="bacen" className="text-zinc-300">BACEN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Update Frequency</Label>
                        <Select
                          value={createForm.update_frequency}
                          onValueChange={(v: any) => setCreateForm({ ...createForm, update_frequency: v })}
                        >
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="daily" className="text-zinc-300">Daily</SelectItem>
                            <SelectItem value="weekly" className="text-zinc-300">Weekly</SelectItem>
                            <SelectItem value="monthly" className="text-zinc-300">Monthly</SelectItem>
                            <SelectItem value="on_demand" className="text-zinc-300">On Demand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Price (cents/month)</Label>
                      <Input
                        type="number"
                        value={createForm.price_monthly_cents}
                        onChange={(e) => setCreateForm({ ...createForm, price_monthly_cents: parseInt(e.target.value) || 0 })}
                        className="bg-zinc-950 border-zinc-800 text-zinc-300"
                        placeholder="0"
                      />
                      <p className="text-xs text-zinc-500">0 = Free</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateKB}
                      disabled={creating || !createForm.name || !createForm.description}
                      className="bg-brand-ness hover:bg-brand-ness/90 text-white"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="private" className="space-y-4">
            <TabsList className="bg-zinc-900 border-zinc-800">
              <TabsTrigger value="private" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                Private Contexts ({privateKBs.length})
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
                Marketplace Drivers ({marketplaceKBs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="space-y-4">
              {privateKBs.length === 0 ? (
                <Card className="bg-zinc-900/40 border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400">No private Knowledge Bases</p>
                      <p className="text-xs text-zinc-500 mt-2">Create a new KB to get started</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {privateKBs.map((kb) => (
                    <Card key={kb.kb_id} className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-base font-brand font-medium mb-1">
                              {kb.name}
                            </CardTitle>
                            <CardDescription className="text-zinc-500 text-xs line-clamp-2">
                              {kb.description}
                            </CardDescription>
                          </div>
                          {getStatusBadge(kb.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Documents</span>
                            <span className="text-zinc-300 font-mono">{kb.document_count}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Chunks</span>
                            <span className="text-zinc-300 font-mono">{kb.chunk_count.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Category</span>
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                              {getCategoryLabel(kb.category)}
                            </Badge>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-zinc-800">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewKB(kb)}
                              className="flex-1 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openIngestDialog(kb)}
                              className="flex-1 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Ingest
                            </Button>
                            {kb.status === 'draft' && kb.document_count > 0 && (
                              <Button
                                size="sm"
                                onClick={() => handlePublish(kb)}
                                className="flex-1 bg-brand-ness hover:bg-brand-ness/90 text-white text-xs"
                              >
                                <Rocket className="h-3 w-3 mr-1" />
                                Publish
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-4">
              {marketplaceKBs.length === 0 ? (
                <Card className="bg-zinc-900/40 border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Globe className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400">No marketplace Knowledge Bases</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {marketplaceKBs.map((kb) => (
                    <Card key={kb.kb_id} className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-base font-brand font-medium mb-1">
                              {kb.name}
                            </CardTitle>
                            <CardDescription className="text-zinc-500 text-xs line-clamp-2">
                              {kb.description}
                            </CardDescription>
                          </div>
                          {getStatusBadge(kb.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Documents</span>
                            <span className="text-zinc-300 font-mono">{kb.document_count}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Chunks</span>
                            <span className="text-zinc-300 font-mono">{kb.chunk_count.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Price</span>
                            <span className="text-zinc-300 font-mono">
                              {kb.price_monthly_cents === 0 ? 'Free' : `$${(kb.price_monthly_cents / 100).toFixed(2)}/mo`}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-zinc-800">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewKB(kb)}
                              className="flex-1 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openIngestDialog(kb)}
                              className="flex-1 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Update
                            </Button>
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

      {/* Ingest Dialog */}
      <Dialog open={ingestDialogOpen} onOpenChange={setIngestDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-brand font-medium text-white">
              Ingest Documents - {selectedKB?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Adicione documentos à Knowledge Base. Documentos serão indexados com <span className="text-brand-ness font-medium">Gemini embeddings</span> para busca semântica (RAG).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Source Type</Label>
              <Select value={sourceType} onValueChange={(v: "file" | "url" | "text") => setSourceType(v)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="file" className="text-zinc-300">Upload File</SelectItem>
                  <SelectItem value="url" className="text-zinc-300">URL Crawler</SelectItem>
                  <SelectItem value="text" className="text-zinc-300">Text Input</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sourceType === "file" && (
              <div className="space-y-2">
                <Label className="text-zinc-300">File</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-300"
                />
                {selectedFile && (
                  <p className="text-xs text-zinc-500">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            )}

            {sourceType === "url" && (
              <div className="space-y-2">
                <Label className="text-zinc-300">URL</Label>
                <Input
                  placeholder="https://example.com/document"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono text-sm"
                />
              </div>
            )}

            {sourceType === "text" && (
              <div className="space-y-2">
                <Label className="text-zinc-300">Content</Label>
                <Textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono text-sm"
                  rows={8}
                  placeholder="Cole o conteúdo do documento aqui..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-300">Document Title (optional)</Label>
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-300"
                placeholder="Título do documento"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Chunking Strategy</Label>
              <Select value={chunkingStrategy} onValueChange={(v: "standard" | "legal") => setChunkingStrategy(v)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="standard" className="text-zinc-300">Standard Rolling Window</SelectItem>
                  <SelectItem value="legal" className="text-zinc-300">Legal/Statute Structure</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">
                {chunkingStrategy === "legal" 
                  ? "Preserves Articles/Paragraphs structure for legal documents"
                  : "For general texts/manuals with rolling window approach"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="replace"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-950"
              />
              <Label htmlFor="replace" className="text-zinc-300 text-sm">
                Replace existing documents (removes all current documents before adding new ones)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIngestDialogOpen(false)
                resetIngestForm()
              }}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleIngest}
              disabled={uploading || (!selectedFile && !urlValue && !textContent)}
              className="bg-brand-ness hover:bg-brand-ness/90 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ingesting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Ingest
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View KB Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-brand font-medium text-white">
              {viewingKB?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Knowledge Base Details
            </DialogDescription>
          </DialogHeader>
          {viewingKB && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-500 text-xs">Description</Label>
                <p className="text-zinc-300 text-sm">{viewingKB.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-500 text-xs">Status</Label>
                  <div>{getStatusBadge(viewingKB.status)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-500 text-xs">Category</Label>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                    {getCategoryLabel(viewingKB.category)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-500 text-xs">Documents</Label>
                  <p className="text-zinc-300 font-mono">{viewingKB.document_count}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-500 text-xs">Chunks</Label>
                  <p className="text-zinc-300 font-mono">{viewingKB.chunk_count.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-500 text-xs">Update Frequency</Label>
                  <p className="text-zinc-300 capitalize">{viewingKB.update_frequency.replace('_', ' ')}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-500 text-xs">Price</Label>
                  <p className="text-zinc-300 font-mono">
                    {viewingKB.price_monthly_cents === 0 ? 'Free' : `$${(viewingKB.price_monthly_cents / 100).toFixed(2)}/mo`}
                  </p>
                </div>
              </div>
              {viewingKB.tags && viewingKB.tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-zinc-500 text-xs">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {viewingKB.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {viewingKB.last_updated_at && (
                <div className="space-y-2">
                  <Label className="text-zinc-500 text-xs">Last Updated</Label>
                  <p className="text-zinc-300 text-sm">{new Date(viewingKB.last_updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Close
            </Button>
            {viewingKB && viewingKB.status === 'draft' && viewingKB.document_count > 0 && (
              <Button
                onClick={() => {
                  setViewDialogOpen(false)
                  handlePublish(viewingKB)
                }}
                className="bg-brand-ness hover:bg-brand-ness/90 text-white"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
