# Next Steps for ComplianceEngine Platform
## Plano Detalhado: Testing, Performance e Deployment

**Data**: 2024-12-24
**Status**: 🎯 Motor 100% Complete - Ready for Testing & Deployment
**Objetivo**: Detalhar (sem implementar) os próximos passos para levar o motor à produção

---

## 1. Visão Geral

Com o motor ComplianceEngine agora 100% completo, os próximos passos focam em:
- **Qualidade**: Garantir robustez através de testes abrangentes
- **Performance**: Otimizar para uso em produção com caching e rate limiting
- **Deployment**: Preparar infraestrutura Cloud Run com CI/CD e observabilidade

Este documento detalha COMO fazer cada etapa, sem implementar.

---

## 2. Testing e Validação

### 2.1 Unit Tests para MCP Servers

#### 2.1.1 MCP Server: Regulatory RAG (`mcp-servers/regulatory-rag/`)

**Arquivo**: `src/__tests__/index.test.ts`

**Framework**: Jest + ts-jest

**Testes necessários**:

```typescript
// 1. Tool Discovery Tests
describe('MCP Server - Tool Listing', () => {
  test('should expose regulatory_search tool', async () => {
    // Verificar que o servidor expõe a tool correta
    // Validar schema com datasets enum correto
  });

  test('should expose query_regulations tool', async () => {
    // Validar estrutura da tool query_regulations
  });
});

// 2. Input Validation Tests
describe('regulatory_search - Input Validation', () => {
  test('should reject invalid dataset names', async () => {
    // Testar com dataset inexistente "invalid_dataset"
    // Esperar erro descritivo
  });

  test('should require query parameter', async () => {
    // Testar chamada sem query
    // Esperar ValidationError
  });

  test('should validate max_results range', async () => {
    // Testar max_results < 1 ou > 50
    // Esperar erro de range
  });
});

// 3. API Integration Tests (Mock)
describe('Vertex AI Search Integration', () => {
  test('should call Vertex AI Search API with correct parameters', async () => {
    // Mock fetch() para Vertex AI Search endpoint
    // Verificar que a chamada contém:
    //   - Correct servingConfigId
    //   - Query formatting
    //   - Dataset filter
  });

  test('should handle API errors gracefully', async () => {
    // Mock API error (500, 401, etc)
    // Verificar que erro é capturado e formatado
  });

  test('should parse search results correctly', async () => {
    // Mock resposta bem-sucedida
    // Verificar parsing de chunks, citations, metadata
  });
});

// 4. Multi-dataset Search Tests
describe('Multi-dataset Queries', () => {
  test('should combine results from multiple datasets', async () => {
    // Testar query com datasets: ["lgpd", "anpd", "gdpr"]
    // Verificar que filtro OR é construído corretamente
  });

  test('should handle empty results gracefully', async () => {
    // Mock resposta vazia
    // Verificar mensagem adequada
  });
});
```

**Setup necessário**:
```json
// package.json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

#### 2.1.2 MCP Server: Document Generator (`mcp-servers/document-generator/`)

**Arquivo**: `src/__tests__/index.test.ts`

**Testes necessários**:

```typescript
// 1. Tool Exposure Tests
describe('Document Generator - Tools', () => {
  test('should expose generate_documents tool', async () => {
    // Verificar schema da tool
    // Validar parameters: process_id, process_name, bpmn_xml, etc
  });

  test('should expose download_document tool', async () => {
    // Verificar tool de download
  });
});

// 2. Document Generation Tests
describe('generate_documents - Core Functionality', () => {
  test('should generate all document types by default', async () => {
    // Chamar sem document_types especificado
    // Verificar que retorna: procedure, work_instruction, checklist
  });

  test('should generate only requested document types', async () => {
    // Chamar com document_types: ["procedure"]
    // Verificar que retorna apenas procedure
  });

  test('should validate BPMN XML format', async () => {
    // Testar com XML inválido
    // Esperar erro de parsing
  });
});

// 3. API Communication Tests
describe('Document Generator API Integration', () => {
  test('should call /v1/documents/generate endpoint', async () => {
    // Mock fetch() para Document Generator API
    // Verificar payload enviado
  });

  test('should handle API errors', async () => {
    // Mock API error (500)
    // Verificar tratamento de erro
  });

  test('should parse generated documents response', async () => {
    // Mock resposta com lista de GeneratedDocument
    // Verificar parsing correto
  });
});

// 4. BPMN to Mermaid Conversion Tests
describe('BPMN to Mermaid Conversion', () => {
  test('should convert valid BPMN XML to Mermaid', async () => {
    // Testar com BPMN XML válido
    // Verificar que Mermaid syntax é gerado
  });

  test('should handle missing process elements', async () => {
    // Testar BPMN sem <process>
    // Verificar fallback ou erro
  });
});
```

#### 2.1.3 MCP Server: Regulatory Intelligence Crawler (`mcp-servers/regulatory-intelligence-crawler/`)

**Arquivo**: `src/__tests__/index.test.ts`

**Testes necessários**:

```typescript
// 1. Tool Discovery
describe('Crawler - Tool Exposure', () => {
  test('should expose fetch_regulation tool', async () => {
    // Verificar schema
  });

  test('should expose list_sources tool', async () => {
    // Verificar listagem de sources
  });
});

// 2. Web Scraping Tests
describe('fetch_regulation - Scraping', () => {
  test('should fetch from ANPD website', async () => {
    // Mock fetch() para https://www.gov.br/anpd
    // Verificar headers, user-agent
  });

  test('should parse HTML content correctly', async () => {
    // Mock HTML response
    // Verificar extração de texto limpo
  });

  test('should handle HTTP errors', async () => {
    // Mock 404, 500, timeout
    // Verificar tratamento
  });
});

// 3. Rate Limiting Tests
describe('Rate Limiting', () => {
  test('should respect rate limits', async () => {
    // Verificar que múltiplas chamadas respeitam delays
    // Usar fake timers do Jest
  });
});

// 4. Content Extraction Tests
describe('Content Extraction', () => {
  test('should extract regulation metadata', async () => {
    // Testar extração de: título, data, número, ementa
  });

  test('should clean HTML tags', async () => {
    // Verificar remoção de <script>, <style>, etc
  });
});
```

### 2.2 Integration Tests

#### 2.2.1 End-to-End Workflow Tests

**Arquivo**: `tests/integration/e2e.test.ts`

**Cenário 1: Compliance Check Completo**

```typescript
describe('E2E: Compliance Check Workflow', () => {
  test('should complete full compliance workflow', async () => {
    // 1. Search for LGPD regulations via Regulatory RAG
    const searchResult = await mcpClient.callTool('regulatory_search', {
      query: 'direitos do titular de dados',
      datasets: ['lgpd', 'anpd']
    });

    // 2. Extract control requirements from search results
    // 3. Generate BPMN process for compliance
    // 4. Generate compliance documents
    const docs = await mcpClient.callTool('generate_documents', {
      process_id: 'proc_lgpd_001',
      process_name: 'Atendimento aos Direitos do Titular',
      bpmn_xml: bpmnXml,
      controls_addressed: ['LGPD:Art.18']
    });

    // 5. Verify all documents were generated
    expect(docs).toHaveLength(3); // POP, IT, Checklist

    // 6. Download documents and validate content
    // 7. Verify Mermaid diagrams are valid
  });
});
```

**Cenário 2: Multi-Regulatory Compliance**

```typescript
describe('E2E: Multi-Regulatory Scenario', () => {
  test('should handle compliance for financial + privacy regulations', async () => {
    // 1. Search CVM + BACEN for financial controls
    const financialRegs = await mcpClient.callTool('regulatory_search', {
      query: 'proteção de dados financeiros',
      datasets: ['cvm', 'bacen']
    });

    // 2. Search LGPD + GDPR for privacy controls
    const privacyRegs = await mcpClient.callTool('regulatory_search', {
      query: 'tratamento de dados pessoais',
      datasets: ['lgpd', 'gdpr']
    });

    // 3. Combine requirements
    // 4. Generate unified compliance process
    // 5. Verify controls from both domains are addressed
  });
});
```

**Cenário 3: Healthcare Compliance (ANS)**

```typescript
describe('E2E: Healthcare Compliance (ANS RN 623)', () => {
  test('should generate healthcare data protection compliance', async () => {
    // 1. Search ANS regulations
    const ansRegs = await mcpClient.callTool('regulatory_search', {
      query: 'proteção de dados de beneficiários',
      datasets: ['ans']
    });

    // 2. Generate healthcare-specific process
    // 3. Generate documents with ANS controls
    // 4. Verify RN 623 compliance items in checklist
  });
});
```

#### 2.2.2 MCP Server Communication Tests

**Arquivo**: `tests/integration/mcp-communication.test.ts`

```typescript
describe('MCP Server Communication', () => {
  test('should connect to all MCP servers', async () => {
    // Conectar a todos os 3 MCP servers
    // Verificar handshake bem-sucedido
  });

  test('should handle server unavailability', async () => {
    // Simular servidor offline
    // Verificar fallback ou erro adequado
  });

  test('should respect MCP protocol format', async () => {
    // Verificar formato JSON-RPC 2.0
    // Validar request/response structure
  });
});
```

### 2.3 Example Validation Tests

#### 2.3.1 Validate Existing Examples

**Arquivo**: `tests/examples/validate-examples.test.ts`

```typescript
describe('Example Validation', () => {
  test('should validate all JSON examples in examples/ directory', async () => {
    // 1. Listar todos os arquivos .json em examples/
    // 2. Para cada arquivo, validar contra schema Pydantic
    // 3. Verificar que todos os exemplos são válidos
  });

  test('should validate BPMN examples', async () => {
    // 1. Listar BPMNs em examples/bpmn/
    // 2. Validar XML structure
    // 3. Verificar conversão para Mermaid
  });

  test('should validate example workflows end-to-end', async () => {
    // Executar exemplos completos como integration tests
  });
});
```

**Exemplos a validar**:
- `examples/requests/generate-documents-lgpd.json`
- `examples/requests/regulatory-search-multi.json`
- `examples/bpmn/antivirus-installation.bpmn`
- `examples/bpmn/data-breach-response.bpmn`

### 2.4 Coverage Targets

**Metas de cobertura**:
- **MCP Servers**: ≥ 80% line coverage
- **Core Services** (document_generator.py, regulatory_search.py): ≥ 90% coverage
- **Schemas & Models**: 100% coverage (crítico para validação)
- **Integration Tests**: Todos os workflows principais

**Comandos**:
```bash
# MCP Servers (TypeScript)
cd mcp-servers/regulatory-rag && npm run test:coverage
cd mcp-servers/document-generator && npm run test:coverage
cd mcp-servers/regulatory-intelligence-crawler && npm run test:coverage

# Python APIs
cd regulatory-rag-api && pytest --cov=app --cov-report=html
cd document-generator-engine && pytest --cov=app --cov-report=html
```

---

## 3. Performance e Otimização

### 3.1 Caching em MCP Servers

#### 3.1.1 Cache para Regulatory Search Results

**Problema**: Queries idênticas fazem chamadas repetidas ao Vertex AI Search (custo + latência)

**Solução**: Implementar cache em memória com TTL

**Implementação sugerida** (em `mcp-servers/regulatory-rag/src/cache.ts`):

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SearchCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number = 15 * 60 * 1000; // 15 minutes

  constructor(defaultTTL?: number) {
    this.cache = new Map();
    if (defaultTTL) this.defaultTTL = defaultTTL;
  }

  // Generate cache key from query parameters
  private generateKey(query: string, datasets: string[], maxResults: number): string {
    return `${query}::${datasets.sort().join(',')}::${maxResults}`;
  }

  // Get cached result if valid
  get<T>(query: string, datasets: string[], maxResults: number): T | null {
    const key = this.generateKey(query, datasets, maxResults);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Set cache entry
  set<T>(query: string, datasets: string[], maxResults: number, data: T, ttl?: number): void {
    const key = this.generateKey(query, datasets, maxResults);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  // Clear expired entries (call periodically)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl
      }))
    };
  }
}

export const searchCache = new SearchCache();
```

**Uso no handler**:

```typescript
// In regulatory_search tool handler
async function handleRegulatorySearch(query: string, datasets: string[], maxResults: number) {
  // Try cache first
  const cached = searchCache.get(query, datasets, maxResults);
  if (cached) {
    console.log('Cache HIT for query:', query);
    return cached;
  }

  // Cache MISS - fetch from Vertex AI
  console.log('Cache MISS for query:', query);
  const results = await fetchFromVertexAI(query, datasets, maxResults);

  // Store in cache
  searchCache.set(query, datasets, maxResults, results);

  return results;
}

// Periodic cleanup (run every 5 minutes)
setInterval(() => {
  searchCache.cleanup();
}, 5 * 60 * 1000);
```

**Configuração**:
- **TTL padrão**: 15 minutos (regulações mudam raramente)
- **Cache size**: Sem limite inicial (monitorar memória)
- **Invalidação**: Manual via tool `clear_cache` ou automática por TTL

#### 3.1.2 Cache para Document Generator

**Problema**: BPMN → Mermaid conversion é computacionalmente cara

**Solução**: Cache de conversões BPMN → Mermaid baseado em hash do XML

```typescript
class BpmnConversionCache {
  private cache: Map<string, string>; // hash → mermaid

  // Generate MD5 hash of BPMN XML
  private hash(bpmnXml: string): string {
    return crypto.createHash('md5').update(bpmnXml).digest('hex');
  }

  get(bpmnXml: string): string | null {
    const key = this.hash(bpmnXml);
    return this.cache.get(key) || null;
  }

  set(bpmnXml: string, mermaid: string): void {
    const key = this.hash(bpmnXml);
    this.cache.set(key, mermaid);
  }
}
```

### 3.2 Timeout Optimization

#### 3.2.1 Configuração de Timeouts

**Problema atual**: Timeouts padrão podem ser muito curtos ou muito longos

**Timeouts recomendados**:

```typescript
// mcp-servers/*/src/config.ts
export const TIMEOUTS = {
  // Vertex AI Search pode demorar em queries complexas
  VERTEX_AI_SEARCH: 30000, // 30 seconds

  // Document generation pode ser lenta com muitos documentos
  DOCUMENT_GENERATION: 60000, // 60 seconds

  // Web scraping pode enfrentar sites lentos
  WEB_SCRAPING: 20000, // 20 seconds

  // MCP tool calls (default)
  TOOL_EXECUTION: 45000, // 45 seconds
};
```

**Implementação**:

```typescript
// Vertex AI Search with timeout
async function searchWithTimeout(query: string, timeout: number = TIMEOUTS.VERTEX_AI_SEARCH) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(vertexSearchEndpoint, {
      method: 'POST',
      body: JSON.stringify({ query }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Search timeout after ${timeout}ms`);
    }
    throw error;
  }
}
```

#### 3.2.2 Retry Logic com Backoff Exponencial

**Para chamadas a APIs externas**:

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Retry on 5xx errors
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      return response;

    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      if (isLastAttempt) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
```

### 3.3 Rate Limiting

#### 3.3.1 Rate Limiting para Vertex AI Search

**Problema**: Vertex AI Search tem quotas (QPM - Queries Per Minute)

**Quota típica**: 60 QPM (1 request/second)

**Implementação** (em `mcp-servers/regulatory-rag/src/rate-limiter.ts`):

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing: boolean = false;
  private requestsInWindow: number[] = [];
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequestsPerMinute: number = 60) {
    this.maxRequests = maxRequestsPerMinute;
    this.windowMs = 60000; // 1 minute
  }

  // Add request to queue
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  // Process queue respecting rate limits
  private async processQueue() {
    if (this.processing) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Clean old timestamps
      const now = Date.now();
      this.requestsInWindow = this.requestsInWindow.filter(
        timestamp => now - timestamp < this.windowMs
      );

      // Check if we can make another request
      if (this.requestsInWindow.length >= this.maxRequests) {
        const oldestRequest = Math.min(...this.requestsInWindow);
        const waitTime = this.windowMs - (now - oldestRequest);

        console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Execute next request
      const request = this.queue.shift();
      if (request) {
        this.requestsInWindow.push(Date.now());
        await request();
      }
    }

    this.processing = false;
  }
}

export const vertexAIRateLimiter = new RateLimiter(60); // 60 QPM
```

**Uso**:

```typescript
// Wrap Vertex AI calls with rate limiter
async function searchRegulations(query: string, datasets: string[]) {
  return await vertexAIRateLimiter.execute(async () => {
    return await callVertexAISearchAPI(query, datasets);
  });
}
```

#### 3.3.2 Rate Limiting para Web Scraping

**Problema**: Evitar ser bloqueado por rate limiting de sites governamentais

**Implementação**:

```typescript
// Rate limiter específico para cada domínio
class DomainRateLimiter {
  private limiters: Map<string, RateLimiter>;

  constructor() {
    this.limiters = new Map();

    // Configure rate limits per domain
    this.limiters.set('www.gov.br', new RateLimiter(30)); // 30 RPM
    this.limiters.set('www.aneel.gov.br', new RateLimiter(20)); // 20 RPM
    this.limiters.set('www.bcb.gov.br', new RateLimiter(30)); // 30 RPM
  }

  async execute(url: string, fn: () => Promise<any>) {
    const domain = new URL(url).hostname;
    const limiter = this.limiters.get(domain) || new RateLimiter(10); // Default: 10 RPM

    return await limiter.execute(fn);
  }
}

export const domainRateLimiter = new DomainRateLimiter();
```

### 3.4 Connection Pooling

#### 3.4.1 HTTP Connection Reuse

**Problema**: Criar nova conexão HTTP para cada request é custoso

**Solução**: Usar `http.Agent` com keepAlive

```typescript
import { Agent } from 'http';
import { Agent as HttpsAgent } from 'https';

// Create reusable agents
const httpAgent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

const httpsAgent = new HttpsAgent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

// Use in fetch calls
fetch(url, {
  agent: url.startsWith('https') ? httpsAgent : httpAgent
});
```

### 3.5 Lazy Loading & Streaming

#### 3.5.1 Stream Large Documents

**Para documentos grandes (> 1MB)**:

```typescript
// Em vez de retornar documento inteiro de uma vez
async function downloadDocument(documentId: string): Promise<string> {
  const response = await fetch(`/v1/documents/${documentId}/download`);
  return await response.text(); // Espera documento inteiro
}

// Usar streaming
async function* streamDocument(documentId: string): AsyncGenerator<string> {
  const response = await fetch(`/v1/documents/${documentId}/download`);
  const reader = response.body?.getReader();

  if (!reader) throw new Error('No readable stream');

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    yield decoder.decode(value, { stream: true });
  }
}
```

---

## 4. Deployment e Infraestrutura

### 4.1 Cloud Run Deployment

#### 4.1.1 Arquitetura de Deployment

**Componentes**:
```
┌─────────────────────────────────────────────────────────────┐
│                     Google Cloud Platform                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Cloud Run      │  │  Cloud Run      │  │  Cloud Run  │ │
│  │  Service #1     │  │  Service #2     │  │  Service #3 │ │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────┤ │
│  │ Regulatory RAG  │  │ Document Gen    │  │ Crawler     │ │
│  │ (FastAPI)       │  │ (FastAPI)       │  │ (FastAPI)   │ │
│  │ Port: 8002      │  │ Port: 8004      │  │ Port: 8006  │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │         │
│           └────────────────────┴───────────────────┘         │
│                               │                               │
│                    ┌──────────▼──────────┐                   │
│                    │  Vertex AI Search   │                   │
│                    │  (10 datastores)    │                   │
│                    └─────────────────────┘                   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Artifact Registry                         │  │
│  │  - regulatory-rag-api:latest                          │  │
│  │  - document-generator-engine:latest                   │  │
│  │  - regulatory-intelligence-crawler:latest             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Secret Manager                            │  │
│  │  - GOOGLE_CLOUD_PROJECT_ID                            │  │
│  │  - VERTEX_SEARCH_LOCATION                             │  │
│  │  - VERTEX_SEARCH_DATA_STORE_ID                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.2 Dockerfiles para Cloud Run

**Regulatory RAG API** (`regulatory-rag-api/Dockerfile`):

```dockerfile
# Multi-stage build para otimização
FROM python:3.11-slim as builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Copy wheels from builder
COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy application code
COPY app/ ./app/

# Non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8002/health')"

# Expose port
EXPOSE 8002

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
```

**Document Generator Engine** (`document-generator-engine/Dockerfile`):

```dockerfile
FROM python:3.11-slim as builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache /wheels/*

COPY app/ ./app/

# Create output directory for generated documents
RUN mkdir -p /tmp/documents

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app /tmp/documents
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8004/health')"

EXPOSE 8004

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]
```

**Regulatory Intelligence Crawler** (`regulatory-intelligence-crawler/Dockerfile`):

Similar structure, porta 8006.

#### 4.1.3 Cloud Run Service Configuration

**`cloud-run-regulatory-rag.yaml`**:

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: regulatory-rag-api
  namespace: default
  labels:
    cloud.googleapis.com/location: us-central1
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '0'
        autoscaling.knative.dev/maxScale: '10'
        run.googleapis.com/cpu-throttling: 'false'
        run.googleapis.com/startup-cpu-boost: 'true'
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      serviceAccountName: regulatory-rag-sa@PROJECT_ID.iam.gserviceaccount.com
      containers:
      - name: regulatory-rag-api
        image: us-central1-docker.pkg.dev/PROJECT_ID/compliance-engine/regulatory-rag-api:latest
        ports:
        - name: http1
          containerPort: 8002
        env:
        - name: GOOGLE_CLOUD_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: google-cloud-project-id
              key: latest
        - name: VERTEX_SEARCH_LOCATION
          value: "global"
        - name: VERTEX_SEARCH_DATA_STORE_ID
          value: "brazilian-regulations_*"
        - name: LOG_LEVEL
          value: "INFO"
        resources:
          limits:
            cpu: '2'
            memory: '1Gi'
          requests:
            cpu: '1'
            memory: '512Mi'
        livenessProbe:
          httpGet:
            path: /health
            port: 8002
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8002
          initialDelaySeconds: 5
          periodSeconds: 10
```

**Configuração similar para Document Generator e Crawler**, ajustando:
- `metadata.name`
- `containerPort`
- `image`
- `resources` (Document Generator pode precisar de mais memória)

#### 4.1.4 Deploy Commands

```bash
# 1. Build and push Docker images
gcloud builds submit --config=cloudbuild.yaml

# 2. Deploy to Cloud Run
gcloud run deploy regulatory-rag-api \
  --image=us-central1-docker.pkg.dev/${PROJECT_ID}/compliance-engine/regulatory-rag-api:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=10 \
  --cpu=2 \
  --memory=1Gi \
  --timeout=300 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=${PROJECT_ID}" \
  --set-secrets="VERTEX_SEARCH_CONFIG=vertex-search-config:latest"

gcloud run deploy document-generator-engine \
  --image=us-central1-docker.pkg.dev/${PROJECT_ID}/compliance-engine/document-generator-engine:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=5 \
  --cpu=1 \
  --memory=2Gi \
  --timeout=300

gcloud run deploy regulatory-intelligence-crawler \
  --image=us-central1-docker.pkg.dev/${PROJECT_ID}/compliance-engine/regulatory-intelligence-crawler:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=3 \
  --cpu=1 \
  --memory=512Mi \
  --timeout=300
```

### 4.2 CI/CD Configuration

#### 4.2.1 Cloud Build Configuration

**`cloudbuild.yaml`** (root do repositório):

```yaml
steps:
  # ============================================
  # 1. Run Tests
  # ============================================

  # Test MCP Servers
  - name: 'node:20'
    id: 'test-mcp-regulatory-rag'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd mcp-servers/regulatory-rag
        npm ci
        npm run test

  - name: 'node:20'
    id: 'test-mcp-document-generator'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd mcp-servers/document-generator
        npm ci
        npm run test

  - name: 'node:20'
    id: 'test-mcp-crawler'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd mcp-servers/regulatory-intelligence-crawler
        npm ci
        npm run test

  # Test Python APIs
  - name: 'python:3.11'
    id: 'test-regulatory-rag-api'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd regulatory-rag-api
        pip install -r requirements.txt pytest pytest-cov
        pytest --cov=app --cov-report=term

  - name: 'python:3.11'
    id: 'test-document-generator'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd document-generator-engine
        pip install -r requirements.txt pytest pytest-cov
        pytest --cov=app --cov-report=term

  - name: 'python:3.11'
    id: 'test-crawler-api'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd regulatory-intelligence-crawler
        pip install -r requirements.txt pytest pytest-cov
        pytest --cov=app --cov-report=term

  # ============================================
  # 2. Build Docker Images
  # ============================================

  - name: 'gcr.io/cloud-builders/docker'
    id: 'build-regulatory-rag'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/regulatory-rag-api:$SHORT_SHA'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/regulatory-rag-api:latest'
      - '-f'
      - 'regulatory-rag-api/Dockerfile'
      - 'regulatory-rag-api'
    waitFor: ['test-regulatory-rag-api']

  - name: 'gcr.io/cloud-builders/docker'
    id: 'build-document-generator'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/document-generator-engine:$SHORT_SHA'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/document-generator-engine:latest'
      - '-f'
      - 'document-generator-engine/Dockerfile'
      - 'document-generator-engine'
    waitFor: ['test-document-generator']

  - name: 'gcr.io/cloud-builders/docker'
    id: 'build-crawler'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/regulatory-intelligence-crawler:$SHORT_SHA'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/regulatory-intelligence-crawler:latest'
      - '-f'
      - 'regulatory-intelligence-crawler/Dockerfile'
      - 'regulatory-intelligence-crawler'
    waitFor: ['test-crawler-api']

  # ============================================
  # 3. Push Images to Artifact Registry
  # ============================================

  - name: 'gcr.io/cloud-builders/docker'
    id: 'push-regulatory-rag'
    args:
      - 'push'
      - '--all-tags'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/regulatory-rag-api'
    waitFor: ['build-regulatory-rag']

  - name: 'gcr.io/cloud-builders/docker'
    id: 'push-document-generator'
    args:
      - 'push'
      - '--all-tags'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/document-generator-engine'
    waitFor: ['build-document-generator']

  - name: 'gcr.io/cloud-builders/docker'
    id: 'push-crawler'
    args:
      - 'push'
      - '--all-tags'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/regulatory-intelligence-crawler'
    waitFor: ['build-crawler']

  # ============================================
  # 4. Deploy to Cloud Run (only on main branch)
  # ============================================

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    id: 'deploy-regulatory-rag'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        if [ "$BRANCH_NAME" == "main" ]; then
          gcloud run deploy regulatory-rag-api \
            --image=us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/regulatory-rag-api:$SHORT_SHA \
            --platform=managed \
            --region=us-central1 \
            --quiet
        fi
    waitFor: ['push-regulatory-rag']

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    id: 'deploy-document-generator'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        if [ "$BRANCH_NAME" == "main" ]; then
          gcloud run deploy document-generator-engine \
            --image=us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/document-generator-engine:$SHORT_SHA \
            --platform=managed \
            --region=us-central1 \
            --quiet
        fi
    waitFor: ['push-document-generator']

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    id: 'deploy-crawler'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        if [ "$BRANCH_NAME" == "main" ]; then
          gcloud run deploy regulatory-intelligence-crawler \
            --image=us-central1-docker.pkg.dev/$PROJECT_ID/compliance-engine/regulatory-intelligence-crawler:$SHORT_SHA \
            --platform=managed \
            --region=us-central1 \
            --quiet
        fi
    waitFor: ['push-crawler']

# Build options
options:
  machineType: 'E2_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY

# Timeout
timeout: '1800s' # 30 minutes

# Substitutions
substitutions:
  _DEPLOY_REGION: 'us-central1'
```

#### 4.2.2 GitHub Actions (Alternative)

**`.github/workflows/ci-cd.yml`**:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: us-central1
  REGISTRY: us-central1-docker.pkg.dev

jobs:
  test-mcp-servers:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        server: [regulatory-rag, document-generator, regulatory-intelligence-crawler]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: mcp-servers/${{ matrix.server }}/package-lock.json

      - name: Install dependencies
        run: |
          cd mcp-servers/${{ matrix.server }}
          npm ci

      - name: Run tests
        run: |
          cd mcp-servers/${{ matrix.server }}
          npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: mcp-servers/${{ matrix.server }}/coverage/lcov.info
          flags: mcp-${{ matrix.server }}

  test-python-apis:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        api: [regulatory-rag-api, document-generator-engine, regulatory-intelligence-crawler]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          cd ${{ matrix.api }}
          pip install -r requirements.txt pytest pytest-cov

      - name: Run tests
        run: |
          cd ${{ matrix.api }}
          pytest --cov=app --cov-report=xml --cov-report=term

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ${{ matrix.api }}/coverage.xml
          flags: ${{ matrix.api }}

  build-and-deploy:
    needs: [test-mcp-servers, test-python-apis]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}

      - uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGISTRY }}

      - name: Build and push images
        run: |
          # Build all images
          docker build -t ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/regulatory-rag-api:${{ github.sha }} \
            -t ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/regulatory-rag-api:latest \
            -f regulatory-rag-api/Dockerfile regulatory-rag-api

          docker build -t ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/document-generator-engine:${{ github.sha }} \
            -t ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/document-generator-engine:latest \
            -f document-generator-engine/Dockerfile document-generator-engine

          docker build -t ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/regulatory-intelligence-crawler:${{ github.sha }} \
            -t ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/regulatory-intelligence-crawler:latest \
            -f regulatory-intelligence-crawler/Dockerfile regulatory-intelligence-crawler

          # Push all images
          docker push --all-tags ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/regulatory-rag-api
          docker push --all-tags ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/document-generator-engine
          docker push --all-tags ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/regulatory-intelligence-crawler

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy regulatory-rag-api \
            --image=${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/regulatory-rag-api:${{ github.sha }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --quiet

          gcloud run deploy document-generator-engine \
            --image=${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/document-generator-engine:${{ github.sha }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --quiet

          gcloud run deploy regulatory-intelligence-crawler \
            --image=${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/compliance-engine/regulatory-intelligence-crawler:${{ github.sha }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --quiet
```

### 4.3 Monitoring e Observabilidade

#### 4.3.1 Cloud Logging

**Structured logging** em todas as APIs:

```python
# app/logging_config.py
import logging
import json
from datetime import datetime

class StructuredLogger(logging.Logger):
    """Custom logger that outputs structured JSON for Cloud Logging"""

    def _log_structured(self, level, msg, extra=None):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "severity": level,
            "message": msg,
            "service": "regulatory-rag-api",  # ou document-generator-engine, etc
        }

        if extra:
            log_entry.update(extra)

        print(json.dumps(log_entry))

    def info(self, msg, **kwargs):
        self._log_structured("INFO", msg, kwargs)

    def error(self, msg, **kwargs):
        self._log_structured("ERROR", msg, kwargs)

    def warning(self, msg, **kwargs):
        self._log_structured("WARNING", msg, kwargs)

# Usage
logger = StructuredLogger("regulatory-rag")
logger.info("Search performed", query="proteção de dados", datasets=["lgpd", "gdpr"], results_count=15)
```

**Log queries úteis no Cloud Logging**:

```
# Erros nos últimos 24h
resource.type="cloud_run_revision"
severity="ERROR"
timestamp>="2024-12-23T00:00:00Z"

# Searches lentas (> 5s)
resource.type="cloud_run_revision"
jsonPayload.search_duration_ms > 5000

# Rate limit hits
jsonPayload.message="Rate limit reached"
```

#### 4.3.2 Cloud Monitoring Dashboards

**Dashboard de Métricas**:

```yaml
# dashboard-compliance-engine.yaml
displayName: "ComplianceEngine Platform"
mosaicLayout:
  columns: 12
  tiles:
    # Request rate
    - width: 6
      height: 4
      widget:
        title: "Request Rate (RPM)"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count"'
                  aggregation:
                    alignmentPeriod: "60s"
                    perSeriesAligner: "ALIGN_RATE"

    # Latency
    - width: 6
      height: 4
      widget:
        title: "Request Latency (p95)"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_latencies"'
                  aggregation:
                    alignmentPeriod: "60s"
                    perSeriesAligner: "ALIGN_DELTA"
                    crossSeriesReducer: "REDUCE_PERCENTILE_95"

    # Error rate
    - width: 6
      height: 4
      widget:
        title: "Error Rate (%)"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.label.response_code_class="5xx"'

    # Container instances
    - width: 6
      height: 4
      widget:
        title: "Container Instances"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/container/instance_count"'

    # Vertex AI Search latency
    - width: 6
      height: 4
      widget:
        title: "Vertex AI Search Latency"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'metric.type="custom.googleapis.com/vertex_search_duration_ms"'

    # Document generation success rate
    - width: 6
      height: 4
      widget:
        title: "Document Generation Success Rate"
        scorecard:
          timeSeriesQuery:
            timeSeriesFilter:
              filter: 'metric.type="custom.googleapis.com/document_generation_success"'
              aggregation:
                alignmentPeriod: "60s"
                perSeriesAligner: "ALIGN_MEAN"
```

**Criar dashboard**:
```bash
gcloud monitoring dashboards create --config-from-file=dashboard-compliance-engine.yaml
```

#### 4.3.3 Custom Metrics

**Instrumentação customizada**:

```python
# app/metrics.py
from google.cloud import monitoring_v3
import time

class MetricsCollector:
    def __init__(self, project_id: str):
        self.client = monitoring_v3.MetricServiceClient()
        self.project_name = f"projects/{project_id}"

    def record_search_duration(self, duration_ms: float, datasets: list[str]):
        """Record Vertex AI search duration"""
        series = monitoring_v3.TimeSeries()
        series.metric.type = "custom.googleapis.com/vertex_search_duration_ms"
        series.resource.type = "cloud_run_revision"

        point = monitoring_v3.Point()
        point.value.double_value = duration_ms
        point.interval.end_time.seconds = int(time.time())

        series.points = [point]
        series.metric.labels["datasets"] = ",".join(datasets)

        self.client.create_time_series(name=self.project_name, time_series=[series])

    def record_document_generation(self, success: bool, doc_type: str):
        """Record document generation success/failure"""
        series = monitoring_v3.TimeSeries()
        series.metric.type = "custom.googleapis.com/document_generation_success"
        series.resource.type = "cloud_run_revision"

        point = monitoring_v3.Point()
        point.value.int64_value = 1 if success else 0
        point.interval.end_time.seconds = int(time.time())

        series.points = [point]
        series.metric.labels["document_type"] = doc_type

        self.client.create_time_series(name=self.project_name, time_series=[series])

# Usage in handlers
metrics = MetricsCollector(project_id=os.getenv("GOOGLE_CLOUD_PROJECT_ID"))

@app.post("/v1/search")
async def search(request: SearchRequest):
    start = time.time()
    results = await perform_search(request.query, request.datasets)
    duration_ms = (time.time() - start) * 1000

    metrics.record_search_duration(duration_ms, request.datasets)

    return results
```

#### 4.3.4 Alerting Policies

**Políticas de alerta críticas**:

```yaml
# alert-high-error-rate.yaml
displayName: "High Error Rate - ComplianceEngine"
conditions:
  - displayName: "Error rate > 5%"
    conditionThreshold:
      filter: 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.label.response_code_class="5xx"'
      aggregations:
        - alignmentPeriod: "300s"
          perSeriesAligner: "ALIGN_RATE"
      comparison: "COMPARISON_GT"
      thresholdValue: 0.05  # 5%
      duration: "60s"

notificationChannels:
  - projects/PROJECT_ID/notificationChannels/EMAIL_CHANNEL_ID

alertStrategy:
  autoClose: "1800s"  # Auto-close after 30 minutes
```

```yaml
# alert-high-latency.yaml
displayName: "High Latency - ComplianceEngine"
conditions:
  - displayName: "P95 latency > 10s"
    conditionThreshold:
      filter: 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_latencies"'
      aggregations:
        - alignmentPeriod: "60s"
          crossSeriesReducer: "REDUCE_PERCENTILE_95"
      comparison: "COMPARISON_GT"
      thresholdValue: 10000  # 10 seconds in ms
      duration: "300s"

notificationChannels:
  - projects/PROJECT_ID/notificationChannels/EMAIL_CHANNEL_ID
```

```yaml
# alert-vertex-search-failures.yaml
displayName: "Vertex AI Search Failures"
conditions:
  - displayName: "Search failures > 10 in 5 minutes"
    conditionThreshold:
      filter: 'metric.type="custom.googleapis.com/vertex_search_errors"'
      aggregations:
        - alignmentPeriod: "300s"
          perSeriesAligner: "ALIGN_SUM"
      comparison: "COMPARISON_GT"
      thresholdValue: 10
      duration: "60s"

notificationChannels:
  - projects/PROJECT_ID/notificationChannels/PAGERDUTY_CHANNEL_ID

alertStrategy:
  autoClose: "3600s"
```

**Criar alertas**:
```bash
gcloud alpha monitoring policies create --policy-from-file=alert-high-error-rate.yaml
gcloud alpha monitoring policies create --policy-from-file=alert-high-latency.yaml
gcloud alpha monitoring policies create --policy-from-file=alert-vertex-search-failures.yaml
```

#### 4.3.5 Distributed Tracing (Cloud Trace)

**OpenTelemetry integration**:

```python
# app/tracing.py
from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

def setup_tracing(app, project_id: str):
    """Setup OpenTelemetry tracing for Cloud Trace"""

    # Create tracer provider
    tracer_provider = TracerProvider()
    trace.set_tracer_provider(tracer_provider)

    # Configure Cloud Trace exporter
    cloud_trace_exporter = CloudTraceSpanExporter(project_id=project_id)
    tracer_provider.add_span_processor(
        BatchSpanProcessor(cloud_trace_exporter)
    )

    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)

    # Instrument requests library (for Vertex AI calls)
    RequestsInstrumentor().instrument()

# In main.py
from app.tracing import setup_tracing

app = FastAPI()
setup_tracing(app, project_id=os.getenv("GOOGLE_CLOUD_PROJECT_ID"))

# Manual tracing for specific operations
tracer = trace.get_tracer(__name__)

@app.post("/v1/search")
async def search(request: SearchRequest):
    with tracer.start_as_current_span("vertex_ai_search") as span:
        span.set_attribute("query", request.query)
        span.set_attribute("datasets", ",".join(request.datasets))

        results = await call_vertex_ai(request)

        span.set_attribute("results_count", len(results))

        return results
```

### 4.4 Segurança e IAM

#### 4.4.1 Service Accounts

**Criar service accounts específicas**:

```bash
# Regulatory RAG API
gcloud iam service-accounts create regulatory-rag-sa \
  --display-name="Regulatory RAG API Service Account"

# Document Generator
gcloud iam service-accounts create document-generator-sa \
  --display-name="Document Generator Service Account"

# Crawler
gcloud iam service-accounts create crawler-sa \
  --display-name="Regulatory Intelligence Crawler Service Account"
```

**Atribuir permissões mínimas**:

```bash
# Regulatory RAG - precisa acessar Vertex AI Search
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:regulatory-rag-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/discoveryengine.viewer"

# Document Generator - precisa escrever em Cloud Storage (para documentos)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:document-generator-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Crawler - precisa apenas ler Secret Manager (para credenciais)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:crawler-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 4.4.2 API Authentication

**Cloud Run com IAM authentication**:

```bash
# Deploy with authentication required
gcloud run deploy regulatory-rag-api \
  --no-allow-unauthenticated

# Grant access to specific service account
gcloud run services add-iam-policy-binding regulatory-rag-api \
  --member="serviceAccount:frontend-app@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --region=us-central1
```

**API Keys (alternative)**:

```python
# app/middleware/auth.py
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader

API_KEY_HEADER = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(API_KEY_HEADER)):
    """Verify API key from Secret Manager"""
    valid_keys = get_valid_api_keys_from_secret_manager()

    if api_key not in valid_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )

    return api_key

# Use in endpoints
@app.post("/v1/search")
async def search(request: SearchRequest, api_key: str = Depends(verify_api_key)):
    # Protected endpoint
    ...
```

---

## 5. Ordem de Implementação Recomendada

### Fase 1: Testing (Semana 1-2)
1. ✅ Setup de testes unitários para MCP servers
2. ✅ Setup de testes unitários para Python APIs
3. ✅ Implementar testes críticos primeiro (input validation, core functionality)
4. ✅ Atingir 70% de cobertura inicial
5. ✅ Integration tests básicos

### Fase 2: Performance (Semana 2-3)
1. ✅ Implementar caching em MCP servers
2. ✅ Configurar timeouts apropriados
3. ✅ Implementar rate limiting
4. ✅ Testes de performance/load testing
5. ✅ Otimizações baseadas em métricas

### Fase 3: Deployment (Semana 3-4)
1. ✅ Criar Dockerfiles otimizados
2. ✅ Setup de Cloud Build / GitHub Actions
3. ✅ Deploy inicial para ambiente de staging
4. ✅ Setup de monitoring e alerting
5. ✅ Deploy para produção

### Fase 4: Observabilidade (Semana 4-5)
1. ✅ Implementar structured logging
2. ✅ Configurar custom metrics
3. ✅ Criar dashboards
4. ✅ Configurar alertas críticos
5. ✅ Setup de distributed tracing

---

## 6. Métricas de Sucesso

### 6.1 Testing
- ✅ **Cobertura de código**: ≥ 80% em MCP servers, ≥ 90% em core services
- ✅ **Testes passando**: 100% dos testes unitários + integration
- ✅ **Tempo de execução**: Test suite completa < 5 minutos

### 6.2 Performance
- ✅ **Latência P95**: < 3s para regulatory search
- ✅ **Latência P95**: < 10s para document generation
- ✅ **Cache hit rate**: > 40% após warm-up
- ✅ **Error rate**: < 1%

### 6.3 Deployment
- ✅ **Build time**: < 10 minutos
- ✅ **Deploy time**: < 5 minutos
- ✅ **Zero downtime**: Rolling deployments
- ✅ **Rollback time**: < 2 minutos

### 6.4 Observabilidade
- ✅ **Alert response time**: < 5 minutos para P0 incidents
- ✅ **Log retention**: 30 dias
- ✅ **Trace sampling**: 10% das requests
- ✅ **Dashboard refresh**: Real-time (1 minuto)

---

## 7. Checklist de Pré-Produção

### 7.1 Testing
- [ ] Unit tests implementados para todos os MCP servers
- [ ] Unit tests implementados para todas as APIs Python
- [ ] Integration tests cobrindo workflows principais
- [ ] Example validation tests passando
- [ ] Cobertura de código ≥ 80%
- [ ] Nenhum test flaky (instável)

### 7.2 Performance
- [ ] Caching implementado em MCP servers
- [ ] Rate limiting configurado
- [ ] Timeouts ajustados
- [ ] Connection pooling ativo
- [ ] Load testing executado (simular 100 RPM)
- [ ] Perfis de performance analisados

### 7.3 Security
- [ ] Service accounts com least privilege
- [ ] Secrets em Secret Manager (não hardcoded)
- [ ] API authentication habilitada
- [ ] CORS configurado corretamente
- [ ] Dependencies sem vulnerabilidades (npm audit, pip check)
- [ ] Container images sem CVEs críticos

### 7.4 Deployment
- [ ] Dockerfiles otimizados (multi-stage build)
- [ ] CI/CD pipeline funcionando
- [ ] Staging environment testado
- [ ] Health checks configurados
- [ ] Auto-scaling testado
- [ ] Rollback procedure documentada

### 7.5 Observabilidade
- [ ] Structured logging implementado
- [ ] Custom metrics configuradas
- [ ] Dashboards criados
- [ ] Alertas configurados
- [ ] Distributed tracing ativo
- [ ] Runbooks de incidentes documentados

### 7.6 Documentação
- [ ] API documentation atualizada (OpenAPI)
- [ ] README com instruções de deploy
- [ ] Runbooks para operações comuns
- [ ] Architecture diagrams atualizados
- [ ] Troubleshooting guide

---

## 8. Recursos e Referências

### 8.1 Documentação Google Cloud
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Vertex AI Search API](https://cloud.google.com/generative-ai-app-builder/docs/apis)
- [Cloud Build](https://cloud.google.com/build/docs)
- [Cloud Monitoring](https://cloud.google.com/monitoring/docs)
- [Cloud Trace](https://cloud.google.com/trace/docs)

### 8.2 Testing Frameworks
- [Jest (TypeScript)](https://jestjs.io/)
- [pytest (Python)](https://docs.pytest.org/)
- [pytest-cov](https://pytest-cov.readthedocs.io/)

### 8.3 Performance
- [FastAPI Performance](https://fastapi.tiangolo.com/deployment/concepts/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling)

### 8.4 CI/CD
- [GitHub Actions](https://docs.github.com/en/actions)
- [Cloud Build Configuration](https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration)

---

**Documento criado**: 2024-12-24
**Versão**: 1.0
**Status**: ✅ Pronto para execução
**Próxima ação**: Começar Fase 1 - Testing (Unit Tests para MCP Servers)
