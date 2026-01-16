---
status: filled
generated: 2026-01-16
---

# Data Flow & Integrations

## High-level Flow

### API Request Flow
```
Client (ERP/CRM) → FastAPI Router → Service Layer → Firestore/AI → Response
```

### MCP Integration Flow
```
AI Agent (Cursor/Claude) → MCP SSE Endpoint → MCPServer → Tools (BPMN/Compliance/Knowledge) → SSE Response
```

### Frontend Flow
```
Next.js Page → API Call → Backend Router → Service → Firestore/AI → Response → UI Update
```

## Service Layer

### Core Services

**BPMNService** (`backend/app/services/process/bpmn.py`)
- Input: Text description or audio
- Process: Gemini Pro → BPMN 2.0 XML generation
- Output: BPMN diagram XML + JSON metadata

**KnowledgeService** (`backend/app/services/knowledge/service.py`)
- Input: Search query
- Process: Embedding → Vector Search (Firestore) → RAG retrieval
- Output: Relevant document chunks with scores

**ComplianceAuditService** (`backend/app/services/compliance/audit.py`)
- Input: Process description, compliance framework
- Process: RAG search → Gemini Pro analysis → Findings generation
- Output: Audit report with findings (compliance/non-compliance)

**DocumentGeneratorService** (`backend/app/services/documents/generator.py`)
- Input: Template type, data
- Process: Template rendering → PDF generation
- Output: PDF document

**IngestionService** (`backend/app/services/ingestion/service.py`)
- Input: Document (text, PDF, etc.)
- Process: Chunking Strategy → Embedding → Firestore storage
- Output: Document chunks with embeddings in Firestore

**GeminiService** (`backend/app/services/ai/gemini.py`)
- Model routing: Flash (fast tasks) vs Pro (complex reasoning)
- Caching: Aggressive caching for repeated queries

**EmbeddingService** (`backend/app/services/ai/embedding.py`)
- Model: `text-embedding-004` (Vertex AI)
- Purpose: Convert text to vectors for Vector Search

## Internal Movement

### Firestore Collections

**`tenants`**
- Multi-tenant isolation
- Structure: `{id, name, created_at, ...}`

**`api_keys`**
- Scoped to `tenant_id`
- Structure: `{id, tenant_id, name, key_hash, created_at}`

**`knowledge_base`**
- Scoped to `tenant_id`
- Vector Search enabled
- Structure: `{id, tenant_id, document_id, chunk_text, embedding, metadata}`

**`jobs`**
- Async job tracking (Cloud Tasks)
- Structure: `{id, tenant_id, type, status, result}`

**`users`**
- Firebase Auth integration
- Structure: `{uid, email, org_id, role, status, created_at}`

### Async Pipeline (Cloud Tasks)

Long-running jobs (compliance analysis, large document ingestion) are queued:
```
Router → Cloud Task → Worker Function → Firestore Update → Notification
```

## External Integrations

### Vertex AI (Gemini Models)
- **Authentication**: Service Account credentials
- **Models**:
  - `gemini-1.5-flash`: Fast responses, chat, formatting
  - `gemini-1.5-pro`: Complex reasoning, compliance, BPMN
  - `text-embedding-004`: Vector embeddings
- **Rate Limits**: GCP quotas, with retry logic

### Firebase Auth
- **Authentication**: JWT tokens with Custom Claims
- **Custom Claims**: `{uid, role, org_id, status}`
- **Purpose**: RBAC and tenant isolation

### Firestore
- **Mode**: Native Mode (not Datastore mode)
- **Vector Search**: Integrated for semantic search
- **Isolation**: All queries scoped by `tenant_id`

## Data Transformation Pipelines

### Document Ingestion Pipeline
```
Upload → Parse → Chunking Strategy → Embed → Store in Firestore → Index for Vector Search
```

### BPMN Generation Pipeline
```
Text/Audio → Gemini Pro → BPMN XML → Validation → Store → Return
```

### Compliance Audit Pipeline
```
Process Description → RAG Search (Laws) → Gemini Pro Analysis → Findings → Report
```

## Observability & Failure Modes

### Monitoring
- Cloud Run logs (structured logging)
- Firestore query metrics
- Vertex AI usage tracking (for FinOps)

### Failure Handling
- **Retry Logic**: Exponential backoff for AI API calls
- **Dead Letter**: Failed Cloud Tasks stored for manual review
- **Cache Failures**: Graceful degradation (direct API calls if cache unavailable)
