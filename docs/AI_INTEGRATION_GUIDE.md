# Guia de Integração para IAs de Desenvolvimento

> **Para IAs**: Este documento foi criado especificamente para você (Cursor, Claude Code, Antigravity, GitHub Copilot, etc.) entender como integrar o ComplianceEngine API em aplicações que você está desenvolvendo.

## 🎯 O Que é o ComplianceEngine API?

O **ComplianceEngine API** é um microsserviço REST que fornece três capacidades principais:

1. **Geração de Diagramas BPMN**: Converte descrições textuais de processos em diagramas Mermaid.js
2. **Gestão de Processos**: Armazena e gerencia processos de negócio no Firestore
3. **Análise de Compliance**: Identifica gaps de conformidade regulatória (LGPD, SOX, GDPR, etc.) usando IA

## 🔑 Autenticação e Chaves de Controle

### ⚠️ IMPORTANTE: API Keys Obrigatórias

**SIM, há chaves de controle!** O ComplianceEngine API **requer autenticação via API Key** para todos os endpoints (exceto health check).

### Como Obter uma API Key

1. **Via Admin Dashboard** (recomendado):
   - Acesse o Admin Dashboard
   - Vá para a seção "API Keys"
   - Crie uma nova API key
   - **IMPORTANTE**: A chave é mostrada apenas uma vez - guarde imediatamente!

2. **Via API** (requer autenticação admin):
   ```bash
   POST /v1/api-keys
   Authorization: Bearer admin_token
   {
     "name": "Minha Aplicação",
     "environment": "live",
     "permissions": ["diagrams:generate", "processes:create", "compliance:analyze"]
   }
   ```

### Formato das API Keys

- **Formato**: `ce_live_<64 caracteres hexadecimais>`
- **Exemplo**: `ce_live_a1b2c3d4e5f6...`
- **Segurança**: Chaves são hasheadas com bcrypt antes de armazenar

### Como Usar a API Key

Todas as requisições devem incluir o header:

```
Authorization: Bearer ce_live_<sua-chave>
```

## 🚀 Integração Rápida

### Passo 1: Obter URL da API

A API pode estar em:
- **Local**: `http://localhost:8080`
- **Produção**: `https://compliance-engine-273624403528.us-central1.run.app`

### Passo 2: Verificar Saúde

```bash
curl https://sua-api-url.com/health
```

### Passo 3: Fazer Requisições Autenticadas

```bash
curl -X POST https://sua-api-url.com/v1/diagrams/generate \
  -H "Authorization: Bearer ce_live_sua_chave_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Processo de onboarding de funcionários",
    "context": "RH, TI e gestor participam"
  }'
```

## 📝 Exemplos de Código para Integração

### Python

```python
import httpx
import os

class ComplianceEngineClient:
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def generate_diagram(self, description: str, context: str = ""):
        """Gera diagrama BPMN a partir de descrição textual."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/v1/diagrams/generate",
                headers=self.headers,
                json={
                    "description": description,
                    "context": context
                },
                timeout=120.0  # 2 minutos para análises longas
            )
            response.raise_for_status()
            return response.json()
    
    async def create_process(self, process_data: dict):
        """Cria um processo no Firestore."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/v1/processes",
                headers=self.headers,
                json=process_data
            )
            response.raise_for_status()
            return response.json()
    
    async def analyze_compliance(self, process_id: str, domain: str, context: str = ""):
        """Analisa compliance de um processo."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/v1/compliance/analyze",
                headers=self.headers,
                json={
                    "process_id": process_id,
                    "domain": domain,
                    "additional_context": context
                },
                timeout=180.0  # 3 minutos para análises
            )
            response.raise_for_status()
            return response.json()

# Uso
client = ComplianceEngineClient(
    api_url="https://compliance-engine-273624403528.us-central1.run.app",
    api_key=os.getenv("COMPLIANCE_ENGINE_API_KEY")
)

# Gerar diagrama
diagram = await client.generate_diagram(
    description="Processo de aprovação de compras",
    context="Até R$ 10.000"
)

# Criar processo
process = await client.create_process({
    "name": "Aprovação de Compras",
    "description": "Processo completo...",
    "domain": "financeiro",
    "mermaid_code": diagram["mermaid_code"],
    "nodes": [...],
    "flows": [...]
})

# Analisar compliance
analysis = await client.analyze_compliance(
    process_id=process["process_id"],
    domain="LGPD",
    context="Processo lida com dados pessoais"
)
```

### JavaScript/TypeScript

```typescript
class ComplianceEngineClient {
  constructor(
    private apiUrl: string,
    private apiKey: string
  ) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async generateDiagram(description: string, context: string = ''): Promise<any> {
    const response = await fetch(`${this.apiUrl}/v1/diagrams/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ description, context })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createProcess(processData: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/v1/processes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(processData)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async analyzeCompliance(
    processId: string,
    domain: string,
    context: string = ''
  ): Promise<any> {
    const response = await fetch(`${this.apiUrl}/v1/compliance/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        process_id: processId,
        domain,
        additional_context: context
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Uso
const client = new ComplianceEngineClient(
  'https://compliance-engine-273624403528.us-central1.run.app',
  process.env.COMPLIANCE_ENGINE_API_KEY!
);

// Gerar diagrama
const diagram = await client.generateDiagram(
  'Processo de onboarding',
  'RH, TI e gestor'
);

// Criar processo
const process = await client.createProcess({
  name: 'Onboarding',
  description: '...',
  domain: 'rh',
  mermaid_code: diagram.mermaid_code,
  nodes: [...],
  flows: [...]
});

// Analisar compliance
const analysis = await client.analyzeCompliance(
  process.process_id,
  'LGPD',
  'Dados pessoais de funcionários'
);
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

type ComplianceEngineClient struct {
    APIURL string
    APIKey string
    Client *http.Client
}

func NewClient(apiURL, apiKey string) *ComplianceEngineClient {
    return &ComplianceEngineClient{
        APIURL: apiURL,
        APIKey: apiKey,
        Client: &http.Client{
            Timeout: 120 * time.Second,
        },
    }
}

func (c *ComplianceEngineClient) GenerateDiagram(description, context string) (map[string]interface{}, error) {
    reqBody := map[string]string{
        "description": description,
        "context":     context,
    }
    
    jsonData, _ := json.Marshal(reqBody)
    
    req, _ := http.NewRequest("POST", c.APIURL+"/v1/diagrams/generate", bytes.NewBuffer(jsonData))
    req.Header.Set("Authorization", "Bearer "+c.APIKey)
    req.Header.Set("Content-Type", "application/json")
    
    resp, err := c.Client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    body, _ := io.ReadAll(resp.Body)
    var result map[string]interface{}
    json.Unmarshal(body, &result)
    
    return result, nil
}
```

## 🔐 Segurança e MCP

### MCP (Model Context Protocol)

O ComplianceEngine oferece integração via MCP para ferramentas como Claude Desktop, Cursor, VS Code.

#### MCP Desktop (STDIO)

Para uso em ferramentas desktop, o MCP server **NÃO requer API key** se configurado localmente, mas **recomenda-se usar** para produção.

**Configuração em Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "compliance-engine": {
      "command": "node",
      "args": ["/path/to/mcp-servers/compliance-engine/dist/index.js"],
      "env": {
        "API_BASE_URL": "https://compliance-engine-273624403528.us-central1.run.app",
        "API_KEY": "ce_live_..."  // OPCIONAL mas RECOMENDADO
      }
    }
  }
}
```

#### MCP Gateway (HTTP)

O **MCP Gateway HTTP requer API key obrigatória** para todas as requisições.

```typescript
import { MCPClient } from '@compliance-engine/mcp-client';

const client = new MCPClient({
  gatewayUrl: 'https://mcp-gateway-xxx.run.app',
  apiKey: 'ce_live_...'  // OBRIGATÓRIO
});

// Todas as chamadas requerem autenticação
const diagram = await client.generateBPMNDiagram('...');
```

### Resumo de Segurança

| Componente | API Key Obrigatória? | Notas |
|------------|---------------------|-------|
| **API REST Principal** | ✅ SIM | Todos os endpoints (exceto `/health`) |
| **MCP Desktop (local)** | ⚠️ Opcional | Recomendado para produção |
| **MCP Gateway (HTTP)** | ✅ SIM | Todas as requisições |
| **RegulatoryRAG API** | ✅ SIM | Integrado com ComplianceEngine |

## 📋 Checklist de Integração

Quando integrar o ComplianceEngine em uma aplicação, siga estes passos:

- [ ] **1. Obter API Key**
  - Via Admin Dashboard ou API
  - Guardar em variável de ambiente segura

- [ ] **2. Configurar URL da API**
  - Local: `http://localhost:8080`
  - Produção: URL do Cloud Run

- [ ] **3. Implementar Cliente**
  - Usar exemplos acima como base
  - Adicionar tratamento de erros
  - Implementar retry logic

- [ ] **4. Testar Conexão**
  - Chamar `/health` primeiro
  - Testar com API key válida

- [ ] **5. Implementar Funcionalidades**
  - Geração de diagramas
  - Criação de processos
  - Análise de compliance

- [ ] **6. Tratamento de Erros**
  - 401: API key inválida/expirada
  - 403: Permissões insuficientes
  - 429: Rate limit excedido
  - 503: Serviço de IA indisponível

## 🎯 Casos de Uso Comuns

### 1. Adicionar Análise de Compliance a um ERP

```python
# No seu ERP, quando criar um processo de negócio:
async def create_business_process(process_description: str):
    # 1. Gerar diagrama
    diagram = await compliance_client.generate_diagram(process_description)
    
    # 2. Criar processo
    process = await compliance_client.create_process({
        "name": "Processo do ERP",
        "description": process_description,
        "mermaid_code": diagram["mermaid_code"],
        # ...
    })
    
    # 3. Analisar compliance
    analysis = await compliance_client.analyze_compliance(
        process["process_id"],
        domain="LGPD"
    )
    
    # 4. Salvar no seu sistema
    save_to_erp(process, analysis)
```

### 2. Dashboard de Compliance em Tempo Real

```typescript
// Atualizar dashboard periodicamente
setInterval(async () => {
  const processes = await fetchProcesses();
  
  for (const process of processes) {
    const analysis = await client.analyzeCompliance(
      process.id,
      'LGPD'
    );
    
    updateDashboard(process.id, analysis.overall_score);
  }
}, 300000); // A cada 5 minutos
```

### 3. Integração com Workflow Engine

```python
# Quando um workflow é criado/modificado
async def sync_workflow_to_compliance(workflow_id: str):
    workflow = get_workflow(workflow_id)
    
    # Converter workflow para processo
    process_data = convert_workflow_to_process(workflow)
    
    # Criar/atualizar no ComplianceEngine
    await compliance_client.create_process(process_data)
    
    # Analisar compliance
    analysis = await compliance_client.analyze_compliance(
        process_data["process_id"],
        domain="SOX"  # ou outro domínio relevante
    )
    
    # Notificar se houver gaps críticos
    if analysis.overall_score < 70:
        send_alert(f"Processo {workflow_id} com baixa conformidade")
```

## ⚠️ Limitações e Considerações

1. **API Keys são sensíveis**: Nunca commite chaves no código
2. **Rate Limits**: Implemente retry com backoff exponencial
3. **Timeouts**: Análises podem levar até 3 minutos
4. **IA Opcional**: API pode rodar sem IA (apenas CRUD de processos)
5. **Custos**: Vertex AI tem custos por uso

## 📚 Recursos Adicionais

- **Documentação Completa**: [docs/INTEGRATION.md](INTEGRATION.md)
- **Exemplos de Código**: Pasta `examples/`
- **API Swagger**: `/docs` quando API estiver rodando
- **Prompts para IAs**: [docs/PROMPTS_EXAMPLES.md](PROMPTS_EXAMPLES.md)

## 🤔 Perguntas Frequentes

**Q: Posso usar sem API key?**  
A: Não. Todos os endpoints (exceto `/health`) requerem autenticação.

**Q: O MCP funciona sem API key?**  
A: MCP Desktop local pode funcionar sem, mas MCP Gateway HTTP sempre requer.

**Q: Como revogo uma API key?**  
A: Via Admin Dashboard ou API: `POST /v1/api-keys/{id}/revoke`

**Q: Posso usar em produção sem IA?**  
A: Sim! Configure `ENABLE_AI=false` e use apenas gestão de processos.

**Q: Há rate limits?**  
A: Sim, configuráveis por API key. Implemente retry logic.

---

**Última atualização**: 2025-12-23  
**Versão da API**: 1.0.0

