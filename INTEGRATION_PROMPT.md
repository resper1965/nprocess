# ComplianceEngine Motor - Integration Prompt
## Guia para IAs: Como Consumir o Motor ComplianceEngine

**Versão**: 1.0
**Data**: 2024-12-24
**Objetivo**: Orientar assistentes de IA (Claude Code, Cursor, Antigravity, etc.) sobre como integrar aplicações frontend/backend com o motor ComplianceEngine

---

## 📋 O Que É o ComplianceEngine Motor?

O **ComplianceEngine** é um motor backend completo para **automação de compliance regulatório**, composto por:

### Arquitetura do Motor

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLIANCEENGINE MOTOR                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Regulatory RAG   │  │ Document         │  │ Regulatory   │  │
│  │ API              │  │ Generator        │  │ Crawler      │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤  │
│  │ Port: 8002       │  │ Port: 8004       │  │ Port: 8006   │  │
│  │ FastAPI          │  │ FastAPI          │  │ FastAPI      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │           │
│           │        ┌────────────▼────────────┐       │           │
│           └───────►│  Vertex AI Search       │◄──────┘           │
│                    │  (10 datastores)        │                   │
│                    └─────────────────────────┘                   │
│                                                                   │
│  MCP SERVERS (opcional, para integração com LLMs):               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ regulatory-rag   │  │ document-        │  │ regulatory-  │  │
│  │ (MCP)            │  │ generator (MCP)  │  │ crawler (MCP)│  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Capacidades do Motor

1. **🔍 Busca Regulatória** (Regulatory RAG)
   - Busca semântica em 10 datasets regulatórios brasileiros e internacionais
   - Suporte a multi-dataset queries
   - Powered by Vertex AI Search (Google Cloud)

2. **📄 Geração de Documentação** (Document Generator)
   - POPs (Procedimentos Operacionais Padrão)
   - Instruções de Trabalho
   - Checklists de Auditoria
   - Diagramas Mermaid automáticos a partir de BPMN

3. **🕷️ Crawling de Regulações** (Regulatory Crawler)
   - Scraping de sites governamentais
   - Extração de normativas, resoluções, leis
   - Atualização de corpus regulatório

---

## 🎯 Quando Consumir o Motor?

Use o ComplianceEngine quando estiver desenvolvendo:

### ✅ Casos de Uso Principais

1. **Dashboards de Compliance**
   - Exibir status de conformidade por controle
   - Mostrar documentação gerada
   - Visualizar processos BPMN

2. **Chatbots de Compliance**
   - Responder perguntas sobre regulações
   - Buscar controles específicos
   - Gerar documentos on-demand

3. **Plataformas de GRC (Governance, Risk & Compliance)**
   - Integrar busca regulatória
   - Automatizar geração de evidências
   - Mapear processos → controles

4. **Ferramentas de Auditoria**
   - Gerar checklists customizados
   - Criar pacotes de auditoria
   - Validar conformidade

5. **Sistemas de Gestão de Processos**
   - Documentar processos BPMN
   - Gerar POPs automaticamente
   - Mapear controles atendidos

---

## 🚀 Como Consumir: Opções de Integração

Existem **2 formas principais** de consumir o motor:

### Opção 1: REST APIs (Recomendado para Frontends)

Consumir diretamente as APIs FastAPI via HTTP requests.

**Quando usar**:
- Aplicações web (React, Vue, Angular)
- Aplicações mobile (React Native, Flutter)
- Backends que precisam consumir o motor
- Integrações via webhooks

### Opção 2: MCP Servers (Recomendado para LLM Apps)

Consumir via Model Context Protocol para integração com LLMs.

**Quando usar**:
- Aplicações baseadas em Claude/OpenAI
- Chatbots com contexto regulatório
- Assistentes de compliance com IA
- Ferramentas que usam LLM como orquestrador

---

## 📡 REST APIs: Como Consumir

### 1️⃣ Regulatory RAG API

**Base URL**: `http://localhost:8002` (dev) ou `https://regulatory-rag-api-xxx.run.app` (prod)

#### Endpoint: Buscar Regulações

```http
POST /v1/search
Content-Type: application/json

{
  "query": "proteção de dados pessoais",
  "datasets": ["lgpd", "anpd", "gdpr"],
  "max_results": 10
}
```

**Response**:
```json
{
  "query": "proteção de dados pessoais",
  "results": [
    {
      "chunk_id": "lgpd_123",
      "text": "Art. 7º O tratamento de dados pessoais somente poderá ser realizado...",
      "source": "Lei 13.709/2018 (LGPD)",
      "relevance_score": 0.95,
      "metadata": {
        "article": "7",
        "law": "LGPD",
        "chapter": "Tratamento de Dados"
      }
    }
  ],
  "total_results": 15,
  "datasets_searched": ["lgpd", "anpd", "gdpr"]
}
```

**Datasets Disponíveis**:
- `aneel` - Agência Nacional de Energia Elétrica
- `ons` - Operador Nacional do Sistema Elétrico
- `bacen` - Banco Central do Brasil
- `cvm` - Comissão de Valores Mobiliários
- `susep` - Superintendência de Seguros Privados
- `ans` - Agência Nacional de Saúde Suplementar (RN 623)
- `lgpd` - Lei Geral de Proteção de Dados
- `anpd` - Autoridade Nacional de Proteção de Dados
- `gdpr` - General Data Protection Regulation (EU)
- `arcyber` - Framework de Cibersegurança do Setor Elétrico

#### Exemplo de Integração (React)

```typescript
// services/regulatorySearch.ts
import axios from 'axios';

const REGULATORY_RAG_URL = process.env.REACT_APP_REGULATORY_RAG_URL || 'http://localhost:8002';

export interface SearchRequest {
  query: string;
  datasets: string[];
  max_results?: number;
}

export interface SearchResult {
  chunk_id: string;
  text: string;
  source: string;
  relevance_score: number;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
  datasets_searched: string[];
}

export async function searchRegulations(request: SearchRequest): Promise<SearchResponse> {
  const response = await axios.post<SearchResponse>(`${REGULATORY_RAG_URL}/v1/search`, request);
  return response.data;
}

// Exemplo de uso em componente React
import { searchRegulations } from './services/regulatorySearch';

function ComplianceSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await searchRegulations({
        query,
        datasets: ['lgpd', 'anpd'],
        max_results: 10
      });
      setResults(response.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar regulações..." />
      {loading ? <Spinner /> : (
        <ul>
          {results.map(result => (
            <li key={result.chunk_id}>
              <strong>{result.source}</strong>
              <p>{result.text}</p>
              <span>Relevância: {(result.relevance_score * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 2️⃣ Document Generator API

**Base URL**: `http://localhost:8004` (dev) ou `https://document-generator-xxx.run.app` (prod)

#### Endpoint: Gerar Documentos

```http
POST /v1/documents/generate
Content-Type: application/json

{
  "process_id": "proc_001",
  "process_name": "Instalação de Antivírus Corporativo",
  "bpmn_xml": "<bpmn:definitions>...</bpmn:definitions>",
  "controls_addressed": ["ISO27001:A.8.7", "SOC2:CC6.1"],
  "company_context": {
    "company_name": "TechCorp",
    "sector": "technology"
  },
  "document_types": ["procedure", "checklist"],
  "export_format": "markdown"
}
```

**Response**:
```json
{
  "documents": [
    {
      "document_id": "doc_abc123",
      "document_type": "procedure",
      "process_id": "proc_001",
      "filename": "POP_InstalacaoAntivirus.md",
      "format": "markdown",
      "size_bytes": 12450,
      "download_url": "/v1/documents/doc_abc123/download",
      "generated_at": "2024-12-24T10:30:00Z",
      "controls_covered": ["ISO27001:A.8.7", "SOC2:CC6.1"]
    },
    {
      "document_id": "doc_def456",
      "document_type": "checklist",
      "process_id": "proc_001",
      "filename": "Checklist_InstalacaoAntivirus.md",
      "format": "markdown",
      "size_bytes": 8200,
      "download_url": "/v1/documents/doc_def456/download",
      "generated_at": "2024-12-24T10:30:02Z",
      "controls_covered": ["ISO27001:A.8.7", "SOC2:CC6.1"]
    }
  ]
}
```

#### Endpoint: Download de Documento

```http
GET /v1/documents/{document_id}/download
```

**Response**: Arquivo Markdown

#### Exemplo de Integração (React)

```typescript
// services/documentGenerator.ts
import axios from 'axios';

const DOCUMENT_GEN_URL = process.env.REACT_APP_DOCUMENT_GEN_URL || 'http://localhost:8004';

export interface GenerateDocumentsRequest {
  process_id: string;
  process_name: string;
  bpmn_xml: string;
  controls_addressed?: string[];
  company_context?: {
    company_name?: string;
    sector?: string;
  };
  document_types?: ('procedure' | 'work_instruction' | 'checklist')[];
  export_format?: 'markdown' | 'bundle';
}

export interface GeneratedDocument {
  document_id: string;
  document_type: string;
  process_id: string;
  filename: string;
  format: string;
  size_bytes: number;
  download_url: string;
  generated_at: string;
  controls_covered?: string[];
}

export async function generateDocuments(
  request: GenerateDocumentsRequest
): Promise<GeneratedDocument[]> {
  const response = await axios.post<GeneratedDocument[]>(
    `${DOCUMENT_GEN_URL}/v1/documents/generate`,
    request
  );
  return response.data;
}

export async function downloadDocument(documentId: string): Promise<Blob> {
  const response = await axios.get(
    `${DOCUMENT_GEN_URL}/v1/documents/${documentId}/download`,
    { responseType: 'blob' }
  );
  return response.data;
}

// Exemplo de uso em componente React
import { generateDocuments, downloadDocument } from './services/documentGenerator';

function DocumentGenerator() {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);

  const handleGenerate = async (processData: ProcessData) => {
    try {
      const docs = await generateDocuments({
        process_id: processData.id,
        process_name: processData.name,
        bpmn_xml: processData.bpmnXml,
        controls_addressed: ['ISO27001:A.8.7'],
        company_context: {
          company_name: 'Minha Empresa',
          sector: 'tecnologia'
        },
        document_types: ['procedure', 'checklist']
      });
      setDocuments(docs);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    const blob = await downloadDocument(docId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div>
      <button onClick={() => handleGenerate(processData)}>Gerar Documentos</button>
      <ul>
        {documents.map(doc => (
          <li key={doc.document_id}>
            {doc.filename} ({doc.document_type})
            <button onClick={() => handleDownload(doc.document_id, doc.filename)}>
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3️⃣ Regulatory Intelligence Crawler API

**Base URL**: `http://localhost:8006` (dev) ou `https://regulatory-crawler-xxx.run.app` (prod)

#### Endpoint: Buscar Regulação

```http
POST /v1/fetch
Content-Type: application/json

{
  "url": "https://www.gov.br/anpd/pt-br/assuntos/noticias/resolucao-cd-anpd-n-2-2022",
  "extract_metadata": true
}
```

**Response**:
```json
{
  "url": "https://www.gov.br/anpd/pt-br/assuntos/noticias/resolucao-cd-anpd-n-2-2022",
  "title": "Resolução CD/ANPD nº 2/2022",
  "content": "A Autoridade Nacional de Proteção de Dados aprova...",
  "metadata": {
    "regulation_number": "2/2022",
    "publish_date": "2022-01-27",
    "authority": "ANPD"
  },
  "fetched_at": "2024-12-24T10:30:00Z"
}
```

---

## 🔌 MCP Servers: Como Consumir

### O Que São MCP Servers?

**MCP (Model Context Protocol)** é um protocolo para integrar ferramentas externas com LLMs.

Os MCP Servers do ComplianceEngine expõem as mesmas funcionalidades das APIs REST, mas no formato de **tools** que LLMs podem chamar.

### Configuração MCP (Claude Desktop)

**Arquivo**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "regulatory-rag": {
      "command": "node",
      "args": ["/path/to/nprocess/mcp-servers/regulatory-rag/build/index.js"],
      "env": {
        "REGULATORY_RAG_API_URL": "http://localhost:8002"
      }
    },
    "document-generator": {
      "command": "node",
      "args": ["/path/to/nprocess/mcp-servers/document-generator/build/index.js"],
      "env": {
        "DOCUMENT_GENERATOR_API_URL": "http://localhost:8004"
      }
    },
    "regulatory-crawler": {
      "command": "node",
      "args": ["/path/to/nprocess/mcp-servers/regulatory-intelligence-crawler/build/index.js"]
    }
  }
}
```

### Tools Disponíveis via MCP

#### 1. `regulatory_search`

Busca regulações em datasets específicos.

**Input**:
```json
{
  "query": "direitos do titular de dados",
  "datasets": ["lgpd", "anpd"],
  "max_results": 10
}
```

**Output**: Lista de resultados com chunks de texto, source, relevance score

#### 2. `generate_documents`

Gera documentos de compliance a partir de processo BPMN.

**Input**:
```json
{
  "process_id": "proc_001",
  "process_name": "Gestão de Incidentes de Segurança",
  "bpmn_xml": "<bpmn:definitions>...</bpmn:definitions>",
  "controls_addressed": ["ISO27001:A.16.1"],
  "document_types": ["procedure", "checklist"]
}
```

**Output**: Lista de documentos gerados com download URLs

#### 3. `fetch_regulation`

Faz scraping de regulação de site governamental.

**Input**:
```json
{
  "url": "https://www.gov.br/anpd/pt-br/assuntos/noticias/resolucao-cd-anpd-n-2-2022",
  "extract_metadata": true
}
```

**Output**: Conteúdo da regulação + metadados

### Exemplo: Usando MCP em Aplicação Custom

```typescript
// app.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function setupMCPClient() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./mcp-servers/regulatory-rag/build/index.js'],
    env: {
      REGULATORY_RAG_API_URL: 'http://localhost:8002'
    }
  });

  const client = new Client({
    name: 'my-compliance-app',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  return client;
}

async function searchCompliance(query: string) {
  const client = await setupMCPClient();

  const result = await client.callTool('regulatory_search', {
    query,
    datasets: ['lgpd', 'anpd', 'gdpr'],
    max_results: 10
  });

  console.log('Search results:', result);
}

searchCompliance('proteção de dados pessoais');
```

---

## 🎨 Exemplos de UI/UX

### Dashboard de Compliance

```typescript
// ComplianceDashboard.tsx
import React, { useState, useEffect } from 'react';
import { searchRegulations } from './services/regulatorySearch';
import { generateDocuments } from './services/documentGenerator';

interface Control {
  id: string;
  name: string;
  framework: string;
  status: 'compliant' | 'non-compliant' | 'pending';
}

export function ComplianceDashboard() {
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [searchResults, setSearchResults] = useState([]);

  // Buscar regulações relacionadas ao controle selecionado
  const handleControlClick = async (control: Control) => {
    setSelectedControl(control);

    const results = await searchRegulations({
      query: control.name,
      datasets: getRelevantDatasets(control.framework),
      max_results: 5
    });

    setSearchResults(results.results);
  };

  // Gerar documentação para controle
  const handleGenerateDocs = async (control: Control) => {
    const bpmnXml = getBpmnForControl(control); // Sua lógica

    const docs = await generateDocuments({
      process_id: control.id,
      process_name: control.name,
      bpmn_xml: bpmnXml,
      controls_addressed: [control.id],
      document_types: ['procedure', 'checklist']
    });

    // Download automático
    for (const doc of docs) {
      await downloadDocument(doc.document_id, doc.filename);
    }
  };

  return (
    <div className="dashboard">
      <div className="controls-list">
        <h2>Controles de Compliance</h2>
        {controls.map(control => (
          <div
            key={control.id}
            onClick={() => handleControlClick(control)}
            className={`control-item ${control.status}`}
          >
            <span>{control.id}</span>
            <span>{control.name}</span>
            <span className={`badge ${control.status}`}>{control.status}</span>
          </div>
        ))}
      </div>

      {selectedControl && (
        <div className="control-details">
          <h3>{selectedControl.name}</h3>
          <button onClick={() => handleGenerateDocs(selectedControl)}>
            Gerar Documentação
          </button>

          <div className="regulations">
            <h4>Regulações Relacionadas</h4>
            {searchResults.map(result => (
              <div key={result.chunk_id} className="regulation-item">
                <strong>{result.source}</strong>
                <p>{result.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getRelevantDatasets(framework: string): string[] {
  const mapping = {
    'ISO27001': ['lgpd', 'anpd'],
    'SOC2': ['lgpd', 'gdpr'],
    'NIST': ['lgpd', 'anpd'],
    'PCI-DSS': ['bacen', 'lgpd']
  };
  return mapping[framework] || ['lgpd'];
}
```

### Chatbot de Compliance

```typescript
// ComplianceChat.tsx
import React, { useState } from 'react';
import { searchRegulations } from './services/regulatorySearch';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

export function ComplianceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    // Adicionar mensagem do usuário
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Buscar no motor
    const searchResults = await searchRegulations({
      query: input,
      datasets: ['lgpd', 'anpd', 'gdpr'],
      max_results: 3
    });

    // Gerar resposta baseada nos resultados
    const response = generateResponse(input, searchResults.results);

    const assistantMessage: Message = {
      role: 'assistant',
      content: response,
      sources: searchResults.results
    };

    setMessages(prev => [...prev, assistantMessage]);
    setInput('');
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
            {msg.sources && (
              <div className="sources">
                <strong>Fontes:</strong>
                {msg.sources.map((source, i) => (
                  <span key={i} className="source-tag">{source.source}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte sobre compliance..."
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
}

function generateResponse(query: string, results: any[]): string {
  if (results.length === 0) {
    return 'Não encontrei informações específicas sobre isso nas regulações.';
  }

  const topResult = results[0];
  return `De acordo com ${topResult.source}:\n\n${topResult.text}\n\nRelevância: ${(topResult.relevance_score * 100).toFixed(0)}%`;
}
```

---

## ⚙️ Configuração do Ambiente

### Variáveis de Ambiente Necessárias

```bash
# .env (para desenvolvimento local)

# Regulatory RAG API
REGULATORY_RAG_API_URL=http://localhost:8002

# Document Generator API
DOCUMENT_GENERATOR_API_URL=http://localhost:8004

# Regulatory Crawler API
REGULATORY_CRAWLER_API_URL=http://localhost:8006

# Google Cloud (se rodar o motor localmente)
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-gcp
VERTEX_SEARCH_LOCATION=global
VERTEX_SEARCH_DATA_STORE_ID=brazilian-regulations_*
```

### Iniciar o Motor (Desenvolvimento Local)

```bash
# Terminal 1: Regulatory RAG API
cd regulatory-rag-api
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8002

# Terminal 2: Document Generator
cd document-generator-engine
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8004

# Terminal 3: Regulatory Crawler
cd regulatory-intelligence-crawler
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8006

# Terminal 4: MCP Server (opcional)
cd mcp-servers/regulatory-rag
npm install
npm run build
npm start
```

### Docker Compose (Recomendado)

```yaml
# docker-compose.yml
version: '3.8'

services:
  regulatory-rag:
    build: ./regulatory-rag-api
    ports:
      - "8002:8002"
    environment:
      - GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID}
      - VERTEX_SEARCH_LOCATION=global
    volumes:
      - ./regulatory-rag-api:/app

  document-generator:
    build: ./document-generator-engine
    ports:
      - "8004:8004"
    volumes:
      - ./document-generator-engine:/app

  regulatory-crawler:
    build: ./regulatory-intelligence-crawler
    ports:
      - "8006:8006"
    volumes:
      - ./regulatory-intelligence-crawler:/app
```

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## 🧪 Testes de Integração

### Testar Regulatory Search

```bash
curl -X POST http://localhost:8002/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "tratamento de dados pessoais",
    "datasets": ["lgpd", "anpd"],
    "max_results": 5
  }'
```

### Testar Document Generation

```bash
# 1. Prepare BPMN XML file
cat > test_process.bpmn <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="Process_1">
    <bpmn:startEvent id="start" name="Início"/>
    <bpmn:task id="task1" name="Verificar Requisitos"/>
    <bpmn:endEvent id="end" name="Fim"/>
  </bpmn:process>
</bpmn:definitions>
EOF

# 2. Generate documents
curl -X POST http://localhost:8004/v1/documents/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"process_id\": \"test_001\",
    \"process_name\": \"Processo de Teste\",
    \"bpmn_xml\": \"$(cat test_process.bpmn | sed 's/"/\\"/g' | tr -d '\n')\",
    \"controls_addressed\": [\"ISO27001:A.8.7\"],
    \"document_types\": [\"procedure\"]
  }"
```

### Testar Regulatory Crawler

```bash
curl -X POST http://localhost:8006/v1/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.gov.br/anpd/pt-br",
    "extract_metadata": true
  }'
```

---

## 🔒 Autenticação (Produção)

### API Keys

```typescript
// Configure API key in headers
const api = axios.create({
  baseURL: 'https://regulatory-rag-api-xxx.run.app',
  headers: {
    'X-API-Key': process.env.COMPLIANCE_ENGINE_API_KEY
  }
});

// Use in requests
const results = await api.post('/v1/search', {
  query: 'proteção de dados',
  datasets: ['lgpd']
});
```

### OAuth 2.0 / Service Account (Google Cloud)

```typescript
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth();
const client = await auth.getClient();

const response = await client.request({
  url: 'https://regulatory-rag-api-xxx.run.app/v1/search',
  method: 'POST',
  data: {
    query: 'proteção de dados',
    datasets: ['lgpd']
  }
});
```

---

## 📊 Monitoramento

### Health Checks

Todos os serviços expõem endpoint `/health`:

```bash
curl http://localhost:8002/health
# {"status":"healthy","service":"regulatory-rag-api","version":"1.0.0"}

curl http://localhost:8004/health
# {"status":"healthy","service":"document-generator-engine","version":"1.0.0"}

curl http://localhost:8006/health
# {"status":"healthy","service":"regulatory-intelligence-crawler","version":"1.0.0"}
```

### Métricas

Em produção (Google Cloud), métricas disponíveis via Cloud Monitoring:

- Request rate (RPM)
- Latency (P50, P95, P99)
- Error rate
- Vertex AI Search duration
- Document generation success rate

---

## 🎯 Best Practices

### 1. Caching no Frontend

```typescript
// Implementar cache simples para queries frequentes
const searchCache = new Map<string, SearchResponse>();

async function cachedSearch(query: string, datasets: string[]) {
  const cacheKey = `${query}::${datasets.join(',')}`;

  if (searchCache.has(cacheKey)) {
    console.log('Cache HIT');
    return searchCache.get(cacheKey)!;
  }

  console.log('Cache MISS');
  const results = await searchRegulations({ query, datasets });
  searchCache.set(cacheKey, results);

  return results;
}
```

### 2. Retry Logic

```typescript
async function searchWithRetry(request: SearchRequest, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await searchRegulations(request);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 3. Streaming de Documentos Grandes

```typescript
async function downloadLargeDocument(documentId: string) {
  const response = await fetch(
    `${DOCUMENT_GEN_URL}/v1/documents/${documentId}/download`,
    { method: 'GET' }
  );

  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    chunks.push(value);
  }

  const blob = new Blob(chunks);
  return blob;
}
```

### 4. Error Handling

```typescript
interface ComplianceEngineError {
  code: string;
  message: string;
  details?: any;
}

async function handleSearch(query: string) {
  try {
    const results = await searchRegulations({ query, datasets: ['lgpd'] });
    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ComplianceEngineError;

      switch (apiError.code) {
        case 'INVALID_DATASET':
          console.error('Dataset inválido:', apiError.details);
          break;
        case 'VERTEX_AI_ERROR':
          console.error('Erro no Vertex AI Search:', apiError.message);
          break;
        case 'RATE_LIMIT_EXCEEDED':
          console.error('Rate limit excedido. Aguarde e tente novamente.');
          break;
        default:
          console.error('Erro desconhecido:', apiError);
      }
    }
    throw error;
  }
}
```

---

## 📚 Recursos Adicionais

### Documentação Completa

- **README.md**: Visão geral do projeto
- **SESSION_SUMMARY.md**: Histórico de evolução do motor
- **GOOGLE_AI_STACK.md**: Detalhes da integração Google Cloud
- **next-step2412.md**: Plano de testes, performance e deployment

### OpenAPI / Swagger

Acesse a documentação interativa das APIs:

- Regulatory RAG: `http://localhost:8002/docs`
- Document Generator: `http://localhost:8004/docs`
- Regulatory Crawler: `http://localhost:8006/docs`

### Exemplos de BPMN

Veja exemplos em `examples/bpmn/`:
- `antivirus-installation.bpmn`
- `data-breach-response.bpmn`
- `access-control-procedure.bpmn`

---

## 🚨 Troubleshooting Comum

### Problema: "Connection refused" ao chamar APIs

**Solução**:
```bash
# Verificar se serviços estão rodando
curl http://localhost:8002/health
curl http://localhost:8004/health
curl http://localhost:8006/health

# Se não estiverem, iniciar com Docker Compose
docker-compose up -d
```

### Problema: "Invalid dataset" ao buscar regulações

**Solução**: Verificar lista de datasets válidos:
```typescript
const VALID_DATASETS = [
  'aneel', 'ons', 'bacen', 'cvm', 'susep',
  'ans', 'lgpd', 'anpd', 'gdpr', 'arcyber'
];
```

### Problema: Timeout ao gerar documentos

**Solução**: Aumentar timeout no cliente HTTP:
```typescript
const api = axios.create({
  baseURL: DOCUMENT_GEN_URL,
  timeout: 60000 // 60 segundos
});
```

### Problema: MCP server não conecta

**Solução**: Verificar configuração do Claude Desktop:
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Verificar se paths estão corretos
# Verificar se build foi executado:
cd mcp-servers/regulatory-rag
npm run build
```

---

## ✅ Checklist de Integração

Ao integrar sua aplicação com o ComplianceEngine, verifique:

- [ ] Ambiente configurado (Docker Compose ou serviços locais rodando)
- [ ] Health checks passando em todos os serviços
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de busca regulatória funcionando
- [ ] Teste de geração de documentos funcionando
- [ ] Error handling implementado
- [ ] Retry logic implementado (se aplicável)
- [ ] Caching implementado (se aplicável)
- [ ] Autenticação configurada (em produção)
- [ ] Timeouts ajustados
- [ ] Logs e monitoramento configurados

---

## 🎓 Prompt de Exemplo para IA

**Prompt sugerido para Claude Code / Cursor / Antigravity**:

```
Você está desenvolvendo uma aplicação de compliance que consome o motor
ComplianceEngine. O motor fornece 3 APIs principais:

1. **Regulatory RAG** (porta 8002): Busca semântica em regulações brasileiras
   e internacionais (LGPD, GDPR, ANS, CVM, BACEN, etc.)

2. **Document Generator** (porta 8004): Gera POPs, Instruções de Trabalho e
   Checklists de Auditoria a partir de processos BPMN

3. **Regulatory Crawler** (porta 8006): Faz scraping de regulações de sites
   governamentais

Consulte /home/user/nprocess/INTEGRATION_PROMPT.md para detalhes completos de:
- Endpoints disponíveis
- Exemplos de request/response
- Código de integração (React/TypeScript)
- Best practices
- Troubleshooting

Ao desenvolver:
- Use os exemplos de código fornecidos no INTEGRATION_PROMPT.md
- Implemente error handling robusto
- Adicione retry logic para chamadas à API
- Considere caching para queries frequentes
- Teste com os curl examples fornecidos

O motor está 100% completo e pronto para uso. Todos os endpoints estão
documentados via OpenAPI em /docs de cada serviço.
```

---

**Documento criado**: 2024-12-24
**Versão**: 1.0
**Status**: ✅ Pronto para uso
**Mantenedor**: ComplianceEngine Team
