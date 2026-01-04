import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Code, Terminal, Zap, FileJson, Activity, Cpu, Server } from "lucide-react";
import { Mermaid } from "@/components/mermaid";

export default function ManualPage() {
  const uploadFlowChart = `
    graph TD
      A[Usuário] -->|Upload PDF| B(Client Portal)
      B -->|Salva Arquivo| C{Armazenamento}
      C -->|Firebase Storage| D[Bucket Seguro]
      A -->|Solicita Análise| E(AI Agent)
      E -->|Lê Documento| D
      E -->|Processa com Gemini 1.5| F[Análise Contextual]
      F -->|Retorna Resposta| A
  `;

  const complianceFlowChart = `
    graph LR
      A[Regra de Compliance] -->|Define Critérios| B(Motor de Auditoria)
      C[Documento/Processo] -->|Input| B
      B -->|Validação Cruzada| D{Compliance?}
      D -->|Sim| E[Aprovado ✅]
      D -->|Não| F[Risco Identificado ⚠️]
      F -->|Sugere Correção| G(AI Recommendation)
  `;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manual do Usuário</h1>
        <p className="text-muted-foreground">
          Documentação técnica, fluxos de processo e guia de operabilidade do n.process.
        </p>
      </div>

      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="guide">Guia da Aplicação</TabsTrigger>
          <TabsTrigger value="architecture">Arquitetura & Fluxos</TabsTrigger>
          <TabsTrigger value="api">API & MCP (Devs)</TabsTrigger>
          <TabsTrigger value="prompts">Prompts Engineering</TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Funcionalidades Principais
              </CardTitle>
              <CardDescription>
                Visão geral da plataforma e como operar os módulos centrais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 border p-4 rounded-lg">
                  <strong className="flex items-center gap-2"><Activity className="h-4 w-4"/> Dashboard & Métricas</strong>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Visão unificada de todos os serviços. Monitore o consumo de tokens da IA e o status de conformidade dos seus projetos em tempo real.
                  </p>
                </div>
                <div className="space-y-2 border p-4 rounded-lg">
                  <strong className="flex items-center gap-2"><FileJson className="h-4 w-4"/> Gestão de Documentos</strong>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload seguro de NFs, contratos e relatórios. O sistema indexa automaticamente o conteúdo para busca semântica (RAG).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Análise com IA</CardTitle>
              <CardDescription>
                Como o n.process processa documentos utilizando o Google Gemini 1.5 Pro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Mermaid chart={uploadFlowChart} />
              <div className="mt-4 text-sm text-muted-foreground bg-muted/50 p-4 rounded">
                <p>
                  <strong>Nó E (AI Agent):</strong> Representa o backend serverless que orquestra a chamada para a Vertex AI.
                  A latência média de processamento é de 2-5 segundos para documentos de até 50 páginas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Motor de Auditoria de Compliance</CardTitle>
              <CardDescription>
                Lógica de validação automática de regras regulatórias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Mermaid chart={complianceFlowChart} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle flex items-center gap-2>
                <Server className="h-5 w-5 text-blue-500" />
                Guia de Uso Real: B4B & MCP
              </CardTitle>
              <CardDescription>
                Exemplos práticos de como utilizar as ferramentas em seu dia-a-dia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Bot className="h-4 w-4" /> 1. Chat de Compliance (Auditores & Gerentes)</h3>
                <p className="text-sm">
                  O módulo de chat (`/dashboard/chat`) não é apenas um chatbot. Ele tem acesso aos regulamentos (ISO27001, LGPD) e pode auditar textos colados.
                </p>
                <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm">
                  <strong>Exemplo Real:</strong><br/>
                  1. Vá para <a href="/dashboard/chat" className="text-blue-400 hover:underline">Chat</a>.<br/>
                  2. Cole o texto: "Nosso processo de RH envia planilhas de salário por email sem senha."<br/>
                  3. Pergunte: "Isso viola a LGPD? Se sim, como corrigir?"<br/>
                  4. Resultado: O agente citará os artigos específicos da lei e sugerirá criptografia.
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Cpu className="h-4 w-4" /> 2. MCP no Cursor IDE (Desenvolvedores)</h3>
                <p className="text-sm">
                  Conecte seu IDE para validar código enquanto digita.
                </p>
                <ol className="list-decimal pl-5 text-sm space-y-2">
                  <li>Gere sua chave em <a href="/dashboard/developers/api-keys" className="text-blue-400 hover:underline">API Keys</a>.</li>
                  <li>Configure o `claude_desktop_config.json` com o snippet abaixo:</li>
                  <div className="bg-slate-950 text-slate-50 p-3 rounded-md font-mono text-xs overflow-x-auto my-2">
                    <pre>{`{
  "mcpServers": {
    "nprocess-b4b": {
      "command": "",
      "url": "https://nprocess-admin-api-prod-43006907338.us-central1.run.app/mcp/sse",
      "transport": "sse",
      "headers": {
        "X-API-Key": "SUA_CHAVE_AQUI"
      }
    }
  }
}`}</pre>
                  </div>
                  <li>No Chat do Cursor, digite: <code>@nprocess audite esta função de login quanto a OWASP Top 10</code>.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4" /> 3. Monitoramento de Custos (FinOps)</h3>
                <p className="text-sm">
                  Evite surpresas na fatura da Cloud.
                </p>
                <ul className="list-disc pl-5 text-sm space-y-2">
                  <li>Acesse <a href="/dashboard/billing" className="text-blue-400 hover:underline">Billing</a> para ver o consumo de API Tokens.</li>
                  <li>Ative "Usage Alerts" para receber e-mail quando atingir 80% do plano.</li>
                </ul>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-500" />
                Biblioteca de Prompts (System Instructions)
              </CardTitle>
              <CardDescription>
                Use estes templates para calibrar o agente de IA para tarefas específicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-primary">Role: Auditor Sênior (SOX/LGPD)</h3>
                <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  "Você é um Auditor Sênior especializado em LGPD e SOX. Analise o documento em anexo em busca de: 
                  1. Dados Pessoais Sensíveis (CPF, Saúde, Biometria) expostos sem necessidade.
                  2. Falta de logs de auditoria em processos críticos.
                  Para cada risco encontrado, cite a cláusula da lei violada e sugira uma mitigação técnica."
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-primary">Role: Arquiteto de Software (Review)</h3>
                <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  "Atue como um Staff Engineer. Revise o código abaixo focando em:
                  - Complexidade Ciclomática (manter baixo)
                  - Uso eficiente de memória (evitar leaks)
                  - Segurança (Sanitize inputs, prepared statements)
                  Retorne apenas o 'diff' sugerido e uma breve explicação do 'porquê'."
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

