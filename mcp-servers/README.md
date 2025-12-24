# MCP Servers - ComplianceEngine Platform

Model Context Protocol (MCP) servers for the ComplianceEngine Platform, enabling both desktop and web applications to consume compliance and regulatory services.

## 🎯 Overview

This implementation provides **three ways** to consume the ComplianceEngine Platform:

1. **Direct API** - HTTP REST APIs (existing)
2. **MCP Servers** - For desktop apps (Claude Desktop, VS Code, Cursor, Windsurf)
3. **MCP Gateway** - HTTP bridge for web applications

## 📦 Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Client Applications                  │
├──────────────────┬──────────────────┬────────────────┤
│  Claude Desktop  │   VS Code/Cursor │   Web Apps     │
└────────┬─────────┴────────┬─────────┴────────┬───────┘
         │ (STDIO)          │ (STDIO)          │ (HTTP)
         │                  │                  │
    ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
    │  MCP    │        │  MCP    │       │  MCP    │
    │Compliance│        │  RAG   │       │ Gateway │
    │  Server │        │ Server  │       │  (HTTP) │
    └────┬────┘        └────┬────┘       └────┬────┘
         │                  │                  │
         └──────────┬───────┴──────────────────┘
                    │
         ┌──────────▼──────────┐
         │   Cloud Run APIs    │
         │  - ComplianceEngine │
         │  - RegulatoryRAG    │
         └─────────────────────┘
```

## 🚀 Quick Start

### For Desktop Apps (Claude Desktop, VS Code, etc.)

#### 1. Install MCP Servers

```bash
# Install ComplianceEngine MCP Server
cd mcp-servers/compliance-engine
npm install
npm run build

# Install RegulatoryRAG MCP Server
cd ../regulatory-rag
npm install
npm run build

# Install Document Generator MCP Server
cd ../document-generator
npm install
npm run build

# Install Regulatory Crawler MCP Server
cd ../regulatory-crawler
npm install
npm run build
```

#### 2. Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "compliance-engine": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-servers/compliance-engine/build/index.js"],
      "env": {
        "COMPLIANCE_API_URL": "https://compliance-engine-api-xxx.run.app",
        "API_KEY": "ce_live_..."
      }
    },
    "regulatory-rag": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-servers/regulatory-rag/build/index.js"],
      "env": {
        "RAG_API_URL": "https://regulatory-rag-api-xxx.run.app",
        "API_KEY": "ce_live_..."
      }
    },
    "document-generator": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-servers/document-generator/build/index.js"],
      "env": {
        "DOC_GEN_API_URL": "https://document-generator-xxx.run.app",
        "API_KEY": "ce_live_..."
      }
    },
    "regulatory-crawler": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-servers/regulatory-crawler/build/index.js"],
      "env": {
        "CRAWLER_API_URL": "https://regulatory-crawler-xxx.run.app",
        "API_KEY": "ce_live_..."
      }
    }
  }
}
```

#### 3. Restart Claude Desktop

The tools will now be available!

### For Web Applications

#### 1. Start MCP Gateway

```bash
cd mcp-servers/gateway
npm install
npm run build

# Start gateway
export COMPLIANCE_API_URL=https://compliance-api.run.app
export RAG_API_URL=https://rag-api.run.app
export API_KEY=ce_live_...
export PORT=3100
npm start
```

Gateway runs on `http://localhost:3100`

#### 2. Use in Your Web App

```typescript
import { MCPClient } from './mcp-client';

const client = new MCPClient({
  gatewayUrl: 'http://localhost:3100',
  apiKey: 'ce_live_...'
});

// Generate BPMN diagram
const diagram = await client.generateBPMNDiagram(
  'Create a customer onboarding process with KYC verification'
);

// Search regulations
const regulations = await client.searchRegulations(
  'data protection requirements',
  { domain: 'banking', top_k: 5 }
);
```

## 🔧 Available Tools

### ComplianceEngine Tools

| Tool | Description |
|------|-------------|
| `generate_bpmn_diagram` | Generate BPMN diagram from text description |
| `create_process` | Create and store new business process |
| `list_processes` | List all business processes |
| `get_process` | Get detailed process information |
| `analyze_compliance` | Analyze process for compliance gaps |
| `list_compliance_analyses` | List all compliance analyses |
| `get_compliance_analysis` | Get detailed analysis results |

### RegulatoryRAG Tools

| Tool | Description |
|------|-------------|
| `search_regulations` | Semantic search for regulations using AI |
| `list_regulation_domains` | List available regulation domains |
| `get_regulation` | Get detailed regulation information |

## 💻 Web Client API

```typescript
class MCPClient {
  // ComplianceEngine methods
  async generateBPMNDiagram(description: string, context?: string)
  async createProcess(process: ProcessData)
  async listProcesses()
  async getProcess(processId: string)
  async analyzeCompliance(processId: string, domains: string[])

  // RegulatoryRAG methods
  async searchRegulations(query: string, options?: SearchOptions)
  async listRegulationDomains()
  async getRegulation(regulationId: string)

  // Utility
  async listTools()
}
```

## 📖 Usage Examples

### Claude Desktop

```
You: "Generate a BPMN diagram for customer onboarding with KYC,
     then check compliance with banking regulations"

Claude: [Uses MCP tools automatically]
        ✓ generate_bpmn_diagram
        ✓ create_process
        ✓ search_regulations (banking)
        ✓ analyze_compliance

        [Returns detailed analysis with recommendations]
```

### React Web App

```tsx
import { MCPClient } from '@compliance-platform/mcp-client';

function ComplianceChecker() {
  const client = new MCPClient({
    gatewayUrl: process.env.REACT_APP_MCP_GATEWAY_URL,
    apiKey: process.env.REACT_APP_API_KEY
  });

  const checkCompliance = async () => {
    const regulations = await client.searchRegulations(
      'LGPD data protection requirements',
      { domain: 'data_privacy' }
    );

    const analysis = await client.analyzeCompliance(
      processId,
      ['data_privacy']
    );

    return { regulations, analysis };
  };
}
```

### Vue.js Web App

```typescript
import { MCPClient } from './mcp-client';

export default {
  data() {
    return {
      client: new MCPClient({
        gatewayUrl: 'http://localhost:3100',
        apiKey: 'ce_live_...'
      })
    };
  },
  methods: {
    async searchRegulations() {
      const result = await this.client.searchRegulations(
        this.searchQuery,
        { domain: this.selectedDomain }
      );
      this.regulations = result.results;
    }
  }
};
```

## 🌐 Gateway API Endpoints

### Discovery
- `GET /health` - Health check
- `GET /v1/tools` - List all available tools

### ComplianceEngine
- `POST /v1/tools/compliance/generate_bpmn_diagram`
- `POST /v1/tools/compliance/create_process`
- `GET /v1/tools/compliance/list_processes`
- `POST /v1/tools/compliance/get_process`
- `POST /v1/tools/compliance/analyze_compliance`

### RegulatoryRAG
- `POST /v1/tools/rag/search_regulations`
- `GET /v1/tools/rag/list_regulation_domains`
- `POST /v1/tools/rag/get_regulation`

All endpoints require `Authorization: Bearer <api_key>` header.

## 🔐 Security

- **API Key Required**: All requests require valid API key
- **HTTPS Only**: Use HTTPS in production
- **CORS**: Gateway supports CORS for web apps
- **Rate Limiting**: Implement rate limiting on gateway

## 📦 Deployment

### Deploy MCP Gateway to Cloud Run

```bash
cd mcp-servers/gateway

gcloud run deploy mcp-gateway \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars COMPLIANCE_API_URL=https://compliance-api.run.app \
  --set-env-vars RAG_API_URL=https://rag-api.run.app
```

### Use Deployed Gateway

```typescript
const client = new MCPClient({
  gatewayUrl: 'https://mcp-gateway-xxx.run.app',
  apiKey: 'ce_live_...'
});
```

## 🧪 Testing

### Test Desktop MCP Server

```bash
cd mcp-servers/compliance-engine

# Test with mock stdin/stdout
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start
```

### Test Gateway

```bash
# Start gateway
cd mcp-servers/gateway
npm start

# Test endpoint
curl http://localhost:3100/health

# Test tool
curl -X POST http://localhost:3100/v1/tools/rag/search_regulations \
  -H "Authorization: Bearer ce_live_..." \
  -H "Content-Type: application/json" \
  -d '{"query":"LGPD requirements","domain":"data_privacy"}'
```

## 📚 Learn More

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/anthropics/mcp)
- [Claude Desktop Configuration](https://claude.ai/docs)

## 🤝 Contributing

Contributions welcome! Please ensure:
- TypeScript compilation passes
- Tools are properly documented
- Examples are included

## 📄 License

MIT License - see LICENSE file for details
