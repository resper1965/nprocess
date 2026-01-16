# Architecture Notes

## System Architecture Overview

The **n.process** platform follows a **Serverless First** architecture with **GCP Native** services, organized in **Clean Architecture** layers.

### Topology
- **Backend**: FastAPI (Python 3.11+) running on Cloud Run (serverless)
- **Frontend**: Next.js 14+ (App Router) with TailwindCSS and Shadcn/UI
- **Database**: Firestore (Native Mode) with integrated Vector Search
- **Queue**: Google Cloud Tasks (asynchronous job processing)
- **AI**: Vertex AI (Gemini 1.5 Flash/Pro, text-embedding-004)

### Request Flow
1. **API Requests**: FastAPI routers → Services → Firestore/AI
2. **MCP Integration**: SSE endpoint → MCP Server → Tools (BPMN, Compliance, Knowledge)
3. **Frontend**: Next.js pages → API calls → Backend endpoints

## Architectural Layers

### Config (2 symbols)
Configuration and constants
- **Location**: `backend/app/core`, `frontend/lib`
- **Key Exports**: `Settings`, `get_settings`

### Utils (9 symbols)
Shared utilities and helpers
- **Location**: `frontend/lib`
- **Key Exports**: `cn`, `CustomClaims`, `AuthUser`, auth functions

### Components (23 symbols)
UI components and views
- **Location**: `frontend/app`, `frontend/components`
- **Key Exports**: `ConsolePage`, `AuthProvider`, `WaitingRoom`, admin pages

### Models (27 symbols)
Data structures and domain objects
- **Location**: `backend/app/schemas`, `frontend/components/process`
- **Key Exports**: Pydantic schemas (Tenant, BPMN, Knowledge, Compliance, Documents)

### Generators (1 symbol)
Content and object generation
- **Location**: `frontend/components/developer`
- **Key Exports**: `McpConfigGenerator`

### Controllers (29 symbols)
Request handling and routing
- **Location**: `backend/app/routers`, `backend/scripts`
- **Key Exports**: FastAPI route handlers (system, process, knowledge, compliance, documents, mcp)

### Repositories (1 symbol)
Data access and persistence
- **Location**: `backend/scripts`
- **Key Exports**: Data ingestion scripts

### Services (17 symbols)
Business logic and orchestration
- **Location**: `backend/app/services`
- **Key Exports**: 
  - `BPMNService` (Process Engine)
  - `KnowledgeService` (Knowledge Store)
  - `ComplianceAuditService` (Compliance Guard)
  - `DocumentGeneratorService` (Document Factory)
  - `MCPServer` (MCP Protocol)
  - `GeminiService`, `EmbeddingService` (AI)

## Detected Design Patterns

### Service Layer Pattern (85% confidence)
Encapsulates business logic in service classes:
- `BPMNService` — Process diagram generation
- `KnowledgeService` — RAG search and retrieval
- `ComplianceAuditService` — Compliance auditing
- `DocumentGeneratorService` — PDF/Manual generation
- `GeminiService` — AI model interactions
- `EmbeddingService` — Vector embeddings
- `IngestionService` — Document ingestion with chunking strategies

### Strategy Pattern (Chunking)
- `ChunkingStrategy` (base class)
- `SlidingWindowStrategy` (standard documents)
- `LegalDocumentStrategy` (legal documents with structure parsing)

## External Service Dependencies

### Google Cloud Platform
- **Cloud Run**: Serverless container hosting
- **Firestore**: NoSQL database with Vector Search
- **Cloud Tasks**: Asynchronous job queue
- **Vertex AI**: Gemini models (Flash, Pro, embeddings)
- **Firebase Auth**: Identity Platform with Custom Claims

### Integration Protocols
- **REST API**: Standard HTTP endpoints for ERPs/CRMs
- **MCP (Model Context Protocol)**: SSE-based server for AI agents

## Key Decisions & Trade-offs

### Serverless First
- **Why**: Zero cost when idle, automatic scaling
- **Trade-off**: Cold starts, but acceptable for API workloads

### GCP Native vs External Services
- **Why**: Avoid vendor lock-in, reduce latency, FinOps control
- **Decision**: Use Firestore Vector Search instead of Pinecone, Cloud Tasks instead of Redis/Celery

### FinOps Driven
- **Why**: Cost optimization critical for middleware platform
- **Implementation**: Aggressive caching, model routing (Flash vs Pro), vector search optimization

## Related Resources

- [Project Overview](./project-overview.md)
- [Data Flow & Integrations](./data-flow.md)
- [Security & Compliance](./security.md)
- Update [agents/README.md](../agents/README.md) when architecture changes.
