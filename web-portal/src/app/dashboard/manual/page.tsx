import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Terminal, Bot, Cpu, CreditCard } from "lucide-react";

export default function ManualPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manual & Developer Resources</h1>
        <p className="text-muted-foreground">
          Technical resources for integrating and calibrating n.process.
        </p>
      </div>

      <Tabs defaultValue="mcp" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="mcp">MCP (Devs)</TabsTrigger>
          <TabsTrigger value="prompts">Prompts Library</TabsTrigger>
        </TabsList>

        <TabsContent value="mcp" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-blue-500" />
                Model Context Protocol (MCP) Integration
              </CardTitle>
              <CardDescription>
                Connect n.process directly to your IDE (Cursor, VS Code) or AI Assistant (Claude Desktop).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Cpu className="h-4 w-4" /> Setup for Cursor / Claude Desktop</h3>
                <p className="text-sm">
                  This allows your local AI assistant to call n.process audits and document generation tools.
                </p>
                <ol className="list-decimal pl-5 text-sm space-y-2">
                  <li>Download the `mcp-servers` directory from the repository.</li>
                  <li>Run `npm install && npm run build` inside `mcp-servers`.</li>
                  <li>Add this to your `claude_desktop_config.json`:</li>
                  <div className="bg-slate-950 text-slate-50 p-3 rounded-md font-mono text-xs overflow-x-auto my-2">
                    <pre>{`{
  "mcpServers": {
    "nprocess-engine": {
      "command": "node",
      "args": ["/absolute/path/to/nprocess/mcp-servers/dist/index.js"],
      "env": {
        "API_URL": "https://nprocess-api-prod-s7tmkmao2a-uc.a.run.app"
      }
    }
  }
}`}</pre>
                  </div>
                  <li>Restart your IDE. The tools `analyze_compliance` and `generate_document` will be available to the Agent.</li>
                </ol>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-500" />
                Prompts Library
              </CardTitle>
              <CardDescription>
                System prompts optimized for n.process capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                 <h3 className="font-semibold text-lg text-purple-400 flex items-center gap-2">
                    🤖 n.process Auditor Persona
                 </h3>
                 <p className="text-sm text-muted-foreground">
                    Use this system prompt to give your agent the context of a Senior Auditor.
                 </p>
                 <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`You are a Senior Compliance Auditor powered by the n.process Engine.
Your goal is to validate business processes against LGPD, GDPR, and ISO 27001.

Capabilities:
1. If the user describes a process, use 'analyze_compliance' to check for risks.
2. If the user asks for a document, use 'generate_document'.
3. Always cite specific articles of the law when finding a violation.

Tone: Professional, Objective, and Prescriptive.`}
                 </div>
              </div>

              <div className="space-y-2">
                 <h3 className="font-semibold text-lg text-blue-400 flex items-center gap-2">
                    📄 Document Generator Persona
                 </h3>
                 <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`You are a Legal Operations Assistant.
When asked to draft policies:
1. Ask clarifying questions about the company size and industry.
2. Use 'generate_document' to create the draft.
3. Review the generated draft and suggest improvements based on the user's specific context.`}
                 </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
