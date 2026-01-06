# 🎯 nprocess - Mapeamento Core vs Implementação Atual

**Data:** 2026-01-05
**Branch:** `claude/refocus-nprocess-backend-ewiwi`

---

## 📋 RESUMO EXECUTIVO

O **nprocess** foi desenvolvido para ser um **backend de processamento de rotinas** consumido via **API REST** ou **MCP (Model Context Protocol)**.

### ✅ STATUS: As 3 rotinas CORE estão 100% implementadas!

| Rotina | Objetivo | Status | Implementação |
|--------|----------|--------|---------------|
| **1. Regularização BPMN** | Texto → BPMN 2.0 → Mermaid (iterativo) | ✅ **100%** | API + MCP |
| **2. Confronto Standards** | Processo → RAG → Gaps + Riscos | ✅ **100%** | API + MCP |
| **3. Geração de Docs** | Standard → Documentação Markdown | ✅ **100%** | API + MCP |

### ⚠️ PROBLEMA: "Gordura" ao redor do core

- Portal web completo (Next.js)
- Dashboards admin
- Sistema de chat
- Múltiplas UIs

**Solução:** Refocus na API como produto principal.

---

## 🔌 COMO CONSUMIR O nprocess

### **1️⃣ ROTINA 1: Regularização de Processos BPMN**

#### Via API REST

**Endpoint:** `POST /v1/modeling/generate`
**Base URL:** `https://nprocess-api-dev-*.run.app` (Produção)
**Autenticação:** API Key via header `X-API-Key`

**Request:**
```json
POST /v1/modeling/generate
Content-Type: application/json
X-API-Key: YOUR_API_KEY

{
  "description": "Para comprar uma caneta, eu peço ao Bob que aprove. Bob analisa e se aprovado, envia para o financeiro. O financeiro emite a nota e envia para o fornecedor.",
  "context": {
    "domain": "procurement",
    "company": "Acme Corp"
  }
}
```

**Response:**
```json
{
  "mermaid_diagram": "graph TD\n    Start[Início] --> A[Solicitar Aprovação]\n    A --> B{Bob Aprova?}\n    ...",
  "bpmn_xml": "<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\">...",
  "summary": "Processo de aquisição com 3 etapas principais: solicitação, aprovação e emissão de nota fiscal.",
  "metadata": {
    "activities": ["Solicitar Aprovação", "Análise Bob", "Emissão Nota"],
    "actors": ["Solicitante", "Bob", "Financeiro"],
    "gateways": 1
  }
}
```

#### Via MCP (Model Context Protocol)

**Tool:** `normalize_process_workflow(description: str)`

**Exemplo (Claude Desktop/Cursor):**
```python
# No seu sistema cliente (ex: Claude, Cursor)
result = await mcp.call_tool(
    "normalize_process_workflow",
    description="Para comprar uma caneta..."
)

# result será JSON string:
# {"mermaid_code": "...", "bpmn_xml": "...", "summary": "..."}
```

**MCP Server URL:** `http://localhost:8008` (Dev) ou Cloud Run (Prod)

---

### **2️⃣ ROTINA 2: Confronto com Standards (RAG)**

#### Via API REST

**Endpoint:** `POST /v1/compliance/analyze`
**Base URL:** `https://nprocess-api-dev-*.run.app`

**Request:**
```json
POST /v1/compliance/analyze
Content-Type: application/json
X-API-Key: YOUR_API_KEY

{
  "process_id": "proc_12345",
  "process": {
    "name": "Processo de Onboarding de Fornecedores",
    "description": "Fornecedor preenche formulário → Análise de crédito → Aprovação jurídica → Cadastro no ERP",
    "activities": ["Preenchimento", "Análise", "Aprovação", "Cadastro"],
    "actors": ["Fornecedor", "Financeiro", "Jurídico"],
    "metadata": {}
  },
  "domain": "ISO27001",
  "additional_context": "Empresa do setor financeiro, sujeita a regulação CVM"
}
```

**Response:**
```json
{
  "analysis_id": "ana_xyz789",
  "process_id": "proc_12345",
  "domain": "ISO27001",
  "analyzed_at": "2026-01-05T10:30:00Z",
  "overall_score": 72.5,
  "summary": "O processo atende 72.5% dos requisitos da ISO27001. Identificados 3 gaps críticos relacionados à avaliação de risco de terceiros.",
  "gaps": [
    {
      "id": "gap_001",
      "title": "Ausência de Avaliação de Risco de Fornecedor",
      "description": "A ISO27001 (A.15.1.1) exige avaliação formal de riscos de segurança da informação antes de contratar fornecedores.",
      "severity": "critical",
      "reference": "ISO27001:2013 - A.15.1.1",
      "affected_activities": ["Análise de crédito"]
    },
    {
      "id": "gap_002",
      "title": "Falta de Due Diligence de Segurança",
      "description": "Não há verificação de conformidade do fornecedor com padrões de segurança.",
      "severity": "high",
      "reference": "ISO27001:2013 - A.15.1.2"
    }
  ],
  "suggestions": [
    {
      "id": "sug_001",
      "title": "Adicionar etapa de Security Assessment",
      "description": "Inserir atividade 'Avaliação de Risco de Segurança' após análise de crédito.",
      "priority": "high",
      "estimated_effort": "medium",
      "implementation_guide": "1. Criar formulário de avaliação\n2. Definir critérios de risco\n3. Integrar com aprovação jurídica"
    }
  ]
}
```

#### Via MCP

**Tool:** `audit_workflow_compliance(process_text: str, regulation: str)`

**Exemplo:**
```python
result = await mcp.call_tool(
    "audit_workflow_compliance",
    process_text="Fornecedor preenche formulário → Análise → Aprovação → Cadastro",
    regulation="ISO27001"
)

# Retorna JSON com: overall_score, gaps[], suggestions[], summary
```

**Standards Disponíveis (RAG Vetorizado):**
- LGPD (Lei Geral de Proteção de Dados - Brasil)
- GDPR (General Data Protection Regulation - EU)
- ISO27001, ISO20000, ISO9001
- SOX (Sarbanes-Oxley)
- PCI-DSS (Payment Card Industry)
- HIPAA (Health Insurance Portability)
- NIST Cybersecurity Framework
- CIS Controls
- COBIT, ITIL
- ANEEL, ONS (Brasil - Setor Elétrico)
- CVM (Brasil - Mercado de Capitais)

---

### **3️⃣ ROTINA 3: Geração de Documentação**

#### Via API REST (Admin Control Plane)

**Endpoints:**
1. **Sugerir Documentos Faltantes:**
   `POST /v1/admin/documents/analyze-gaps`

2. **Gerar Template de Documento:**
   `POST /v1/admin/documents/generate-template`

**Base URL:** `https://nprocess-admin-api-dev-*.run.app`

#### 3.1. Análise de Gaps de Documentação

**Request:**
```json
POST /v1/admin/documents/analyze-gaps
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "process_description": "Processo de onboarding de fornecedores com análise de crédito e aprovação jurídica",
  "audit_findings": "Gaps identificados: ausência de avaliação de risco de segurança (ISO27001 A.15.1.1)"
}
```

**Response:**
```json
{
  "missing_documents": [
    {
      "name": "Vendor Risk Assessment Form",
      "type": "Form",
      "reason": "Required by ISO27001 for new vendor onboarding (A.15.1.1)"
    },
    {
      "name": "Vendor Security Questionnaire",
      "type": "Questionnaire",
      "reason": "Needed to assess information security controls of suppliers"
    },
    {
      "name": "Third-Party Risk Management Policy",
      "type": "Policy",
      "reason": "Overarching governance document for vendor risk (ISO27001 A.15)"
    }
  ],
  "existing_documents_suggestions": [
    "Vendor Contract Template",
    "Credit Analysis Report"
  ]
}
```

#### 3.2. Geração de Template Markdown

**Request:**
```json
POST /v1/admin/documents/generate-template
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "document_type": "Vendor Risk Assessment Form",
  "context": "Processo de onboarding de fornecedores - Empresa do setor financeiro regulada por CVM e ISO27001"
}
```

**Response:**
```json
{
  "content": "# Vendor Risk Assessment Form\n\n## 1. Vendor Information\n- **Vendor Name:** [VENDOR_NAME]\n- **Contact:** [CONTACT_INFO]\n- **Service/Product:** [DESCRIPTION]\n\n## 2. Security Assessment\n### 2.1 Information Security Controls\n- Does the vendor have ISO27001 certification? [ ] Yes [ ] No\n- List security controls in place: [DESCRIPTION]\n\n### 2.2 Data Protection\n- How is customer data protected? [DESCRIPTION]\n- LGPD/GDPR compliance status: [YES/NO/PARTIAL]\n\n## 3. Risk Rating\n- Overall Risk Score: [LOW/MEDIUM/HIGH/CRITICAL]\n- Justification: [REASONING]\n\n## 4. Approval\n- Assessed by: [NAME] | Date: [DATE]\n- Approved by: [MANAGER] | Date: [DATE]\n\n---\n*Generated by n.process | ISO27001 Compliant*"
}
```

#### Via MCP

**Tools disponíveis:**

1. **`suggest_compliance_documents(process_description: str, audit_findings: str)`**
   ```python
   result = await mcp.call_tool(
       "suggest_compliance_documents",
       process_description="Onboarding de fornecedores com análise...",
       audit_findings="Gaps: ausência de avaliação de risco..."
   )
   # Retorna JSON com missing_documents[]
   ```

2. **`generate_document_template(document_type: str, context: str)`**
   ```python
   markdown = await mcp.call_tool(
       "generate_document_template",
       document_type="Vendor Risk Assessment Form",
       context="Setor financeiro, ISO27001, CVM"
   )
   # Retorna Markdown direto
   ```

---

## 🔐 BACKSTAGE: Gestão de API e Standards

### ✅ Funcionalidades Implementadas

#### 1. Gestão de API Keys

**Base URL:** `https://nprocess-admin-api-dev-*.run.app`
**Autenticação:** Firebase Auth JWT

**Endpoints:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/v1/admin/apikeys` | Criar nova API key |
| GET | `/v1/admin/apikeys` | Listar keys do cliente |
| GET | `/v1/admin/apikeys/{key_id}` | Detalhes de uma key |
| DELETE | `/v1/admin/apikeys/{key_id}` | Revogar key |
| POST | `/v1/admin/apikeys/{key_id}/validate` | Validar key |

**Exemplo - Criar API Key:**
```json
POST /v1/admin/apikeys
Authorization: Bearer YOUR_JWT
Content-Type: application/json

{
  "name": "Production API - Acme Corp",
  "environment": "production",
  "permissions": ["modeling:read", "modeling:write", "compliance:read", "compliance:write"],
  "quotas": {
    "requests_per_minute": 60,
    "requests_per_day": 10000,
    "requests_per_month": 300000
  },
  "expires_at": "2027-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "key_id": "key_abc123",
  "api_key": "nprc_live_Xk9p2Qs8vF3mN7hR4tY6wZ1cB5dE0aG8",
  "name": "Production API - Acme Corp",
  "environment": "production",
  "created_at": "2026-01-05T10:30:00Z",
  "expires_at": "2027-01-01T00:00:00Z",
  "warning": "Esta chave será exibida apenas uma vez. Armazene-a em local seguro."
}
```

**Segurança:**
- Armazenamento: AES-256-GCM
- Hash: bcrypt (12 rounds)
- Exibição única na criação
- Quotas configuráveis
- Expiração automática

#### 2. Gestão de RAGs (Standards)

**Endpoint de Ingestão:** `POST /v1/admin/ingest`
**Requer:** Autenticação Admin

**Estratégias de Ingestão:**

1. **Legal Strategy** (Documentos legais - PDFs, textos)
   ```json
   POST /v1/admin/ingest
   {
     "source_type": "legal",
     "source": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
     "source_id": "lgpd_br_2018",
     "metadata": {
       "title": "Lei Geral de Proteção de Dados",
       "jurisdiction": "Brasil",
       "year": 2018
     }
   }
   ```

2. **Technical Strategy** (Padrões técnicos - ISO, NIST)
   ```json
   POST /v1/admin/ingest
   {
     "source_type": "technical",
     "source": "/path/to/ISO27001_2013.pdf",
     "source_id": "iso27001_2013",
     "metadata": {
       "standard": "ISO27001",
       "version": "2013"
     }
   }
   ```

3. **Web Strategy** (Web scraping)
   ```json
   POST /v1/admin/ingest
   {
     "source_type": "web",
     "source": "https://www.nist.gov/cyberframework",
     "source_id": "nist_csf_v2",
     "metadata": {
       "framework": "NIST Cybersecurity Framework"
     }
   }
   ```

**Tecnologia RAG:**
- **Vector Store:** Firestore Vector Search
- **Embeddings:** Text-embedding-004 (Vertex AI)
- **Chunking:** Estratégico por tipo de documento
- **Caching:** Redis para otimização

**Standards Pré-carregados:**
✅ 20+ frameworks já vetorizados e prontos para uso

#### 3. FinOps (Controle de Gastos)

**Endpoints:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/v1/admin/finops/costs` | Custos por serviço |
| GET | `/v1/admin/finops/consumers` | Custos por consumidor/API key |
| GET | `/v1/admin/finops/budget` | Status de orçamento |
| GET | `/v1/admin/finops/forecast` | Previsão mensal |
| GET | `/v1/admin/finops/recommendations` | Recomendações de otimização (IA) |

**Dashboard Web:** `https://nprocess-33a44.web.app/admin/finops`

**Métricas Rastreadas:**
- Custos Vertex AI (Gemini, Embeddings)
- Cloud Run (CPU, Memory, Requests)
- Cloud SQL / Firestore
- Networking
- Taxa de erro e latência

---

## ❌ GAPS IDENTIFICADOS

### 1. **Gestão de Standards por Cliente**

**Status:** ❌ Não Implementado

**O que falta:**
- Vincular standards específicos a API keys
- Cliente A vê apenas LGPD + ISO27001
- Cliente B vê apenas HIPAA + SOX
- Controle granular de acesso ao RAG

**Solução proposta:**
```json
// Adicionar campo "allowed_standards" na API Key
{
  "key_id": "key_abc123",
  "allowed_standards": ["lgpd_br_2018", "iso27001_2013"],
  "denied_standards": []
}

// Modificar busca RAG para filtrar por allowed_standards
```

**Endpoints a criar:**
```
POST /v1/admin/apikeys/{key_id}/standards     # Adicionar standards
DELETE /v1/admin/apikeys/{key_id}/standards/{standard_id}  # Remover
GET /v1/admin/apikeys/{key_id}/standards      # Listar standards permitidos
```

### 2. **SOA (Statement of Applicability)**

**Status:** ❌ Não Implementado

**O que falta:**
- Sistema origem precisa informar qual SOA usar
- SOA define escopo de controles aplicáveis
- Reduz análise apenas a controles relevantes

**Exemplo de uso desejado:**
```json
POST /v1/compliance/analyze
{
  "process": {...},
  "domain": "ISO27001",
  "soa": {
    "applicable_controls": ["A.15.1.1", "A.15.1.2", "A.15.2.1"],
    "excluded_controls": ["A.18.*"],  // Compliance não aplicável
    "justification": "Empresa não processa dados de menores"
  }
}
```

### 3. **Workflow de Aprovação**

**Status:** ❌ Não Implementado

**O que falta:**
- Sistema de versionamento de processos
- Estados: draft → review → approved → published
- Histórico de alterações

**Uso desejado (ROTINA 1 iterativa):**
```
1. Cliente envia texto → nprocess retorna BPMN
2. Cliente revisa e rejeita → nprocess reprocessa
3. Ciclo repete até cliente aprovar
4. Cliente aprova → nprocess armazena versão final
```

---

## 🎯 COMPONENTES DESNECESSÁRIOS (Para Remover)

Se o objetivo é **backend puro**, os seguintes componentes são **gordura**:

### ❌ Remover:

```
client-portal/              # UI Web completa
├── admin/                  # Dashboard admin
├── dashboard/              # Dashboard cliente
├── components/             # Componentes React
└── ...

Funcionalidades extras:
├── Chat Gemini             # Interface conversacional
├── Sistema de Webhooks     # Notificações
├── Sistema de Usuários     # RBAC (6 roles)
└── Marketplace de templates
```

### ✅ Manter (Core):

```
app/                        # n.process Core API
├── main.py                 # Endpoints REST
├── services/
│   ├── modeling_service.py       # ROTINA 1
│   ├── compliance_service.py     # ROTINA 2
│   ├── ai_service.py             # IA
│   ├── search_service.py         # RAG
│   └── ingestion/                # Ingestão de standards

admin-control-plane/        # Backstage API
├── app/
│   ├── routers/
│   │   ├── apikeys.py            # Gestão de keys
│   │   ├── finops.py             # FinOps
│   │   └── documents.py          # ROTINA 3
│   ├── services/
│   │   ├── document_service.py   # Geração de docs
│   │   └── ...
│   └── mcp_server.py             # MCP Gateway

docs/                       # Documentação
compliance/                 # Segurança
```

---

## 🚀 PROPOSTA DE REFATORAÇÃO

### **OPÇÃO A: Simplificação Radical**

**Objetivo:** Backend minimalista, apenas APIs

**Ações:**
1. ✅ Remover `client-portal/` completamente
2. ✅ Remover chat, webhooks, RBAC
3. ✅ Consolidar APIs em único serviço
4. ✅ Focar documentação de API REST + MCP
5. ✅ Implementar gestão de standards por cliente
6. ✅ Implementar SOA

**Resultado:**
- 1 API REST (FastAPI)
- 1 MCP Server
- Backstage via API (sem UI)
- Documentação Swagger/OpenAPI completa

### **OPÇÃO B: Refatoração com Foco**

**Objetivo:** Manter estrutura, melhorar documentação do core

**Ações:**
1. ✅ Manter toda estrutura atual
2. ✅ Criar `/docs/API_CONSUMPTION.md` detalhado
3. ✅ Simplificar client-portal para gestão mínima (apenas API keys + FinOps)
4. ✅ Implementar gestão de standards por cliente
5. ✅ Implementar SOA
6. ✅ Marcar client-portal como opcional/demo

**Resultado:**
- API REST completa (produto principal)
- MCP Server (produto principal)
- Client Portal (opcional, apenas demo)
- Documentação focada em integração

---

## 📚 DOCUMENTAÇÃO NECESSÁRIA

### Para Consumo Externo:

1. **API Reference** (OpenAPI/Swagger)
   - ✅ Já existe em `/docs` e `/redoc`
   - ⚠️ Falta adicionar exemplos de uso

2. **MCP Integration Guide**
   - ❌ Não existe
   - Criar: `docs/MCP_INTEGRATION.md`

3. **Quick Start Guide**
   - ❌ Não existe
   - Criar: `docs/QUICK_START.md`

4. **Standards Catalog**
   - ❌ Não existe
   - Criar: `docs/AVAILABLE_STANDARDS.md`

5. **SDK Examples**
   - ❌ Não existe
   - Criar: `examples/` com Python, Node.js, curl

---

## 🔍 DECISÃO NECESSÁRIA

**Preciso que você escolha:**

### 🅰️ OPÇÃO A: Simplificar (remover gordura)
- Remover client-portal e frontends
- Manter apenas APIs REST + MCP
- Backstage minimalista (apenas APIs, sem UI)
- **Prazo:** ~3 dias
- **Impacto:** Breaking changes no deployment

### 🅱️ OPÇÃO B: Refatorar foco (manter estrutura)
- Manter toda estrutura atual
- Melhorar documentação das 3 rotinas
- Criar endpoints para gestão de standards por cliente
- Implementar SOA
- **Prazo:** ~2 dias
- **Impacto:** Sem breaking changes

---

## 📞 PRÓXIMOS PASSOS

Após sua decisão, vou:

1. ✅ Implementar gestão de standards por cliente
2. ✅ Implementar SOA na análise de compliance
3. ✅ Criar documentação de integração (API + MCP)
4. ✅ [OPÇÃO A] Remover componentes desnecessários
   **OU**
   [OPÇÃO B] Refatorar foco e documentação
5. ✅ Criar exemplos de código (Python, Node.js, curl)
6. ✅ Commit e push para branch

**Aguardando sua decisão: OPÇÃO A ou OPÇÃO B?**
