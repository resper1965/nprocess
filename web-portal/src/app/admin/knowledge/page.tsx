"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { HelpDialog, pageHelpContent } from "@/components/help-dialog"
import { 
  Database, 
  FileText, 
  Globe, 
  Table2, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface IngestionSource {
  id: string
  name: string
  type: "legal" | "technical" | "web"
  status: "ready" | "ingesting" | "completed" | "error"
  lastUpdated?: string
  chunksCount?: number
}

export default function KnowledgePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [webUrl, setWebUrl] = useState("")
  const [ingestionResult, setIngestionResult] = useState<{
    status: string
    message: string
  } | null>(null)

  // Pre-defined sources for ingestion
  const [sources, setSources] = useState<IngestionSource[]>([
    { id: "lgpd_br", name: "LGPD (Lei 13.709/2018)", type: "legal", status: "ready" },
    { id: "gdpr_eu", name: "GDPR (EU 2016/679)", type: "legal", status: "ready" },
    { id: "cis_controls", name: "CIS Controls v8", type: "technical", status: "ready" },
    { id: "nist_csf", name: "NIST Cybersecurity Framework", type: "technical", status: "ready" },
  ])

  const handleIngest = async (sourceId: string, sourceType: string, sourceUrl?: string) => {
    setLoading(true)
    setIngestionResult(null)

    // Update source status
    setSources(prev => prev.map(s => 
      s.id === sourceId ? { ...s, status: "ingesting" as const } : s
    ))

    try {
      // Get auth token
      const token = await user?.getIdToken()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          source_type: sourceType,
          source: sourceUrl || `https://placeholder/${sourceId}`,
          source_id: sourceId,
          metadata: { name: sources.find(s => s.id === sourceId)?.name || sourceId }
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSources(prev => prev.map(s => 
          s.id === sourceId ? { 
            ...s, 
            status: "completed" as const,
            lastUpdated: new Date().toISOString(),
            chunksCount: result.chunks_saved
          } : s
        ))
        setIngestionResult({ status: "success", message: `${result.chunks_saved} chunks saved` })
      } else {
        throw new Error(result.detail || "Ingestion failed")
      }
    } catch (error: any) {
      setSources(prev => prev.map(s => 
        s.id === sourceId ? { ...s, status: "error" as const } : s
      ))
      setIngestionResult({ status: "error", message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleWebIngest = async () => {
    if (!webUrl) return
    
    const sourceId = webUrl.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
    
    // Add temporary source
    setSources(prev => [...prev, {
      id: sourceId,
      name: webUrl,
      type: "web",
      status: "ingesting"
    }])

    await handleIngest(sourceId, "web", webUrl)
    setWebUrl("")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "legal": return <FileText className="h-5 w-5 text-blue-500" />
      case "technical": return <Table2 className="h-5 w-5 text-green-500" />
      case "web": return <Globe className="h-5 w-5 text-purple-500" />
      default: return <Database className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="outline">Ready</Badge>
      case "ingesting":
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 animate-spin mr-1" />Ingesting</Badge>
      case "completed":
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "error":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Knowledge Base" 
        description="Manage the RAG knowledge base for compliance analysis"
      >
        <HelpDialog title="Ajuda - Knowledge Base">
          <div className="space-y-4">
            <section>
              <h3 className="font-semibold text-lg">O que é a Knowledge Base?</h3>
              <p className="text-muted-foreground">
                É a base de conhecimento que alimenta o motor de compliance. 
                Documentos regulatórios são processados (chunking + embedding) e 
                armazenados para consulta via RAG.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-lg">Tipos de Fonte</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Legal</strong>: Leis e regulamentos (LGPD, GDPR)</li>
                <li><strong>Technical</strong>: Frameworks e padrões (CIS, NIST, ISO)</li>
                <li><strong>Web</strong>: Páginas de órgãos reguladores (CVM, ANEEL)</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-lg">Como funciona?</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Clique em "Ingest" na fonte desejada</li>
                <li>O sistema baixa, processa e vetoriza o conteúdo</li>
                <li>Os chunks são salvos no Firestore com embeddings</li>
                <li>O motor de compliance pode consultar via busca vetorial</li>
              </ol>
            </section>
          </div>
        </HelpDialog>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Web URL Ingestion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Ingest from Web URL
            </CardTitle>
            <CardDescription>
              Add a regulatory page to the knowledge base (e.g., CVM resolutions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.gov.br/cvm/pt-br/..."
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleWebIngest} disabled={loading || !webUrl}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Ingest
              </Button>
            </div>
            {ingestionResult && (
              <div className={`mt-3 p-3 rounded-md text-sm ${
                ingestionResult.status === "success" 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}>
                {ingestionResult.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pre-defined Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Knowledge Sources
            </CardTitle>
            <CardDescription>
              Standard regulatory documents and frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sources.map((source) => (
                <div 
                  key={source.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(source.type)}
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.type} • {source.id}
                        {source.chunksCount && ` • ${source.chunksCount} chunks`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(source.status)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleIngest(source.id, source.type)}
                      disabled={source.status === "ingesting"}
                    >
                      {source.status === "ingesting" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : source.status === "completed" ? (
                        <><RefreshCw className="h-4 w-4 mr-1" /> Re-ingest</>
                      ) : (
                        <><Upload className="h-4 w-4 mr-1" /> Ingest</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
