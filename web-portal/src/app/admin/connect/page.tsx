"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { Copy, Check, ExternalLink, Code, Terminal, Zap } from "lucide-react"
import { adminApi } from "@/lib/api-client"
import { toast } from "sonner"

const MCP_SERVER_URL = "https://nprocess-admin-api-prod-43006907338.us-central1.run.app/mcp/sse"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nprocess-api-prod-43006907338.us-central1.run.app"

interface SystemPrompt {
  id: string
  title: string
  description: string
  prompt: string
  useCase: string
}

export default function DeveloperHubPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const keysResponse = await adminApi.get('/v1/admin/apikeys/').catch(() => ({ data: { api_keys: [] } }))
        const keys = keysResponse.data?.api_keys || []
        const activeKey = keys.find((k: any) => k.active)
        if (activeKey) {
          setApiKey(activeKey.key || "YOUR_API_KEY")
        } else {
          setApiKey("YOUR_API_KEY")
        }
      } catch (error) {
        console.error("Failed to load API key:", error)
      }
    }
    loadApiKey()
  }, [])

  const systemPrompts: SystemPrompt[] = [
    {
      id: "process-modeling",
      title: "Process Modeling Workflow",
      description: "Estruturar processos brutos em BPMN usando o ness.",
      useCase: "Cursor, VSCode, ERPs",
      prompt: `Você tem acesso à tool \`@n.process\`. Ao receber uma descrição de processo bruta do usuário:

1. Use a tool \`process-modeling\` para estruturar o BPMN
2. Analise o diagrama gerado
3. Use a tool \`compliance-check\` cruzando com o contexto 'LGPD' para validar
4. Retorne o relatório final com:
   - Diagrama BPMN estruturado
   - Score de compliance
   - Gaps identificados
   - Sugestões de melhoria`
    },
    {
      id: "compliance-audit",
      title: "Compliance Audit Automation",
      description: "Automatizar auditorias de compliance em processos existentes",
      useCase: "Sistemas de GRC, ERPs",
      prompt: `Você é um assistente de compliance que usa o \`@n.process\` para:

1. Receber processos de negócio (texto ou BPMN)
2. Executar \`compliance-check\` para múltiplos frameworks (LGPD, SOX, GDPR)
3. Gerar relatório consolidado com:
   - Score por framework
   - Lista de gaps críticos
   - Plano de ação priorizado
4. Sugerir documentos necessários usando \`document-generator\``
    },
    {
      id: "knowledge-integration",
      title: "Knowledge Base Integration",
      description: "Integrar conhecimento regulatório em respostas",
      useCase: "Chatbots, Assistentes IA",
      prompt: `Ao responder perguntas sobre compliance ou processos:

1. Use \`@n.process\` para buscar contexto relevante
2. Use \`rag-search\` com queries semânticas
3. Cite as fontes regulatórias encontradas
4. Se necessário, gere diagramas com \`process-modeling\`
5. Sempre valide informações com \`compliance-check\``
    }
  ]

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedItems(prev => ({ ...prev, [id]: true }))
    toast.success("Copiado!")
    setTimeout(() => {
      setCopiedItems(prev => ({ ...prev, [id]: false }))
    }, 2000)
  }

  const mcpConfig = `{
  "servers": {
    "nprocess": {
      "url": "${MCP_SERVER_URL}",
      "transport": "sse",
      "headers": {
        "X-API-Key": "${apiKey}"
      }
    }
  }
}`

  const auditCurlExample = `curl -X POST ${API_BASE_URL}/v1/compliance/analyze \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "process_description": "Processo de onboarding de clientes",
    "domain": "LGPD",
    "process_bpmn": null
  }'`

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <PageHeader 
        title="Developer Hub" 
        description="Orchestration instructions for integrating ness. into your tools"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Section A: MCP Connection */}
          <div className="space-y-4">
            <div>
              <h2 className="font-brand font-medium text-xl text-white mb-2">MCP Connection</h2>
              <p className="text-sm text-zinc-400">Connect ness. to Claude Desktop or Cursor IDE</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-brand font-medium text-lg text-white mb-1">
                      Server SSE URL
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Model Context Protocol endpoint
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(MCP_SERVER_URL, "mcp-url")}
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-brand-ness"
                  >
                    {copiedItems["mcp-url"] ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                  <code className="text-sm text-zinc-300 font-mono break-all">
                    {MCP_SERVER_URL}
                  </code>
                </div>

                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 mb-2 font-mono">Configuration (.mcp/config.json):</p>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(mcpConfig, "mcp-config")}
                      className="absolute top-2 right-2 h-8 px-2 text-zinc-400 hover:text-brand-ness"
                    >
                      {copiedItems["mcp-config"] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <pre className="text-xs text-zinc-300 font-mono overflow-x-auto pr-12">
                      <code>{mcpConfig}</code>
                    </pre>
                  </div>
                </div>

                <a
                  href="/docs/manuals/MCP_SETUP_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-ness hover:text-brand-ness/80"
                >
                  <ExternalLink className="h-4 w-4" />
                  Setup Guide
                </a>
              </CardContent>
            </Card>

            {/* Prompt Guide Gallery */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-5 w-5 text-brand-ness" />
                  <CardTitle className="font-brand font-medium text-lg text-white">
                    System Prompts
                  </CardTitle>
                </div>
                <CardDescription className="text-zinc-500">
                  Copy-ready prompts to teach your AI how to use ness.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {systemPrompts.map((prompt) => (
                    <Card key={prompt.id} className="bg-zinc-900/50 border-zinc-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base text-white mb-1">
                              {prompt.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-zinc-500 mb-2">
                              {prompt.description}
                            </CardDescription>
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                              {prompt.useCase}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-zinc-950 rounded border border-zinc-800 p-3 relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(prompt.prompt, prompt.id)}
                            className="absolute top-2 right-2 h-7 px-2 text-zinc-400 hover:text-brand-ness"
                          >
                            {copiedItems[prompt.id] ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap pr-10">
                            <code>{prompt.prompt}</code>
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section B: API REST */}
          <div className="space-y-4">
            <div>
              <h2 className="font-brand font-medium text-xl text-white mb-2">API REST</h2>
              <p className="text-sm text-zinc-400">Direct HTTP integration endpoints</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-brand font-medium text-lg text-white mb-1">
                      Compliance Audit
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      POST /v1/compliance/analyze
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(auditCurlExample, "audit-curl")}
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-brand-ness"
                  >
                    {copiedItems["audit-curl"] ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy cURL
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                  <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
                    <code>{auditCurlExample}</code>
                  </pre>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href={`${API_BASE_URL}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-brand-ness hover:text-brand-ness/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Full API Documentation
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
