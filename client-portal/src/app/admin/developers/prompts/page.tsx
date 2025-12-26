"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Terminal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function IntegrationGuidesPage() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Prompt copiado para a área de transferência.",
    });
  };

  const frontendPrompt = `# Role: Senior Frontend Architect
Você deve construir a camada de cliente para o motor 'nProcess'.

# 1. Gestão de Estado (CRÍTICO)
- O nprocess é STATELESS. Você DEVE persistir o histórico de chat e versões do diagrama no Firestore do seu lado.
- Todo request para \`/v1/compliance/analyze\` precisa enviar o objeto 'process' COMPLETO (nodes, flows, mermaid), e não apenas o delta.

# 2. UI/UX Requirements
- **Drafting:** Renderize o \`mermaid_code\` retornado em tempo real.
- **Reviewing:** Ao receber o array \`gaps\` da API, desenhe bordas vermelhas nos nós afetados (\`affected_nodes\`) no diagrama visual.
- **Async Feedback:** A auditoria demora. Implemente 'Optimistic UI' ou mostre um esqueleto de carregamento ("Auditor analisando..."). NÃO bloqueie a tela.

# 3. Payload da API
Siga estritamente este JSON para a auditoria:
{
  "process": { "mermaid_code": "...", "nodes": [...] },
  "domain": "LGPD",
  "additional_context": "..."
}`;

  const mcpPrompt = `# Role: AI Systems Engineer (MCP)
Sua missão é criar um MCP Server para o nProcess, permitindo que IAs (Claude/Cursor) o usem como ferramenta.

# Tools a Implementar

1. \`audit_compliance(process_json: dict, standard: str)\`
   - **Desc:** "Audita um processo de negócio contra uma norma exigida."
   - **Input:** Deve receber o objeto ProcessDefinition completo conforme schema Pydantic, não apenas string.
   - **Output:** Retorna lista textual de Gaps e Sugestões.

2. \`generate_diagram(text: str)\`
   - **Desc:** "Cria um diagrama BPMN a partir de texto."
   - **Output:** Retorna código Mermaid.

# Regras
- As tools devem ser wrappers stateless para a API REST (\`http://localhost:8000\`).
- Valide os inputs com Zod/Pydantic antes de chamar a API.
- Se a API retornar erro 422, formate uma mensagem amigável explicando qual campo faltou.`;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Developer Center</h2>
        <div className="flex items-center space-x-2">
          {/* Add actions if needed */}
        </div>
      </div>

      <Tabs defaultValue="frontend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frontend">Frontend & Client App</TabsTrigger>
          <TabsTrigger value="mcp">MCP & AI Agents</TabsTrigger>
          <TabsTrigger value="specs">API Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frontend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integração Client App</CardTitle>
              <CardDescription>
                Use este prompt para instruir desenvolvedores Frontend a consumir a API nProcess corretamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-md bg-muted p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => copyToClipboard(frontendPrompt)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="overflow-x-auto text-sm text-foreground whitespace-pre-wrap">
                  {frontendPrompt}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mcp" className="space-y-4">
          <Card>
            <CardHeader>
               <CardTitle>Integração MCP (AI Agents)</CardTitle>
               <CardDescription>
                 Use este prompt para criar ferramentas compatíveis com Claude Desktop, Cursor e outros agentes.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="relative rounded-md bg-muted p-4">
                 <Button
                   variant="outline"
                   size="icon"
                   className="absolute right-4 top-4"
                   onClick={() => copyToClipboard(mcpPrompt)}
                 >
                   <Copy className="h-4 w-4" />
                 </Button>
                 <pre className="overflow-x-auto text-sm text-foreground whitespace-pre-wrap">
                   {mcpPrompt}
                 </pre>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Especificação Técnica</CardTitle>
                    <CardDescription>Endpoints e Contratos de Dados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Modeling API</CardTitle>
                                <Terminal className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">POST</div>
                                <p className="text-xs text-muted-foreground">/v1/modeling/generate</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Compliance API</CardTitle>
                                <Terminal className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">POST</div>
                                <p className="text-xs text-muted-foreground">/v1/compliance/analyze</p>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="rounded-md border p-4">
                        <h4 className="mb-2 font-semibold">Exemplo de Payload (Compliance)</h4>
                        <pre className="text-xs text-muted-foreground overflow-x-auto bg-slate-950 p-4 rounded text-white">
{`{
  "process": {
    "name": "Nome",
    "mermaid_code": "graph TD...",
    "nodes": [...],
    "flows": [...]
  },
  "domain": "LGPD",
  "additional_context": "..."
}`}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
