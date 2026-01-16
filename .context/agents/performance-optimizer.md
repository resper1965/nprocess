---
name: Performance Optimizer
description: Identify performance bottlenecks
status: filled
generated: 2026-01-16
---

# Performance Optimizer Agent Playbook

## Mission
Describe how the performance optimizer agent supports the team and when to engage it.

## Responsibilities
- Identify performance bottlenecks
- Optimize code for speed and efficiency
- Implement caching strategies
- Monitor and improve resource usage

## Best Practices
- Measure before optimizing
- Focus on actual bottlenecks
- Don't sacrifice readability unnecessarily

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `backend/` — FastAPI backend, routers, services e schemas.
- `docs/` — documentacao essencial e guias do projeto.
- `frontend/` — Next.js app, UI e providers de auth.
- `tools/` — ferramentas auxiliares (Spec Kit).

## Key Files
**Pattern Implementations:**
- Service Layer: [`BPMNService`](backend/app/services/process/bpmn.py), [`KnowledgeService`](backend/app/services/knowledge/service.py), [`IngestionService`](backend/app/services/ingestion/service.py), [`DocumentGeneratorService`](backend/app/services/documents/generator.py), [`ComplianceAuditService`](backend/app/services/compliance/audit.py), [`GeminiService`](backend/app/services/ai/gemini.py), [`EmbeddingService`](backend/app/services/ai/embedding.py)

**Service Files:**
- [`BPMNService`](backend/app/services/process/bpmn.py#L44)
- [`KnowledgeService`](backend/app/services/knowledge/service.py#L22)
- [`IngestionService`](backend/app/services/ingestion/service.py#L20)
- [`DocumentGeneratorService`](backend/app/services/documents/generator.py#L38)
- [`ComplianceAuditService`](backend/app/services/compliance/audit.py#L48)
- [`GeminiService`](backend/app/services/ai/gemini.py#L20)
- [`EmbeddingService`](backend/app/services/ai/embedding.py#L18)

## Architecture Context

### Config
Configuration and constants
- **Directories**: `frontend`, `backend/app/core`
- **Symbols**: 2 total
- **Key exports**: [`Settings`](backend/app/core/config.py#L8), [`get_settings`](backend/app/core/config.py#L37)

### Utils
Shared utilities and helpers
- **Directories**: `frontend/lib`
- **Symbols**: 9 total
- **Key exports**: [`cn`](frontend/lib/utils.ts#L4), [`CustomClaims`](frontend/lib/auth.ts#L19), [`AuthUser`](frontend/lib/auth.ts#L28), [`signInWithGoogle`](frontend/lib/auth.ts#L39), [`signOut`](frontend/lib/auth.ts#L49), [`getCustomClaims`](frontend/lib/auth.ts#L57), [`getIdToken`](frontend/lib/auth.ts#L69)

### Components
UI components and views
- **Directories**: `frontend/app`, `frontend/components/ui`, `frontend/components/providers`, `frontend/components/knowledge`, `frontend/app/waiting-room`, `frontend/app/login`, `frontend/app/debug/token`, `frontend/app/admin/system`, `frontend/app/admin/process`, `frontend/app/admin/network`, `frontend/app/admin/knowledge`, `frontend/app/admin/developer`
- **Symbols**: 23 total
- **Key exports**: [`ConsolePage`](frontend/app/page.tsx#L17), [`useAuth`](frontend/components/providers/auth-provider.tsx#L31), [`AuthProvider`](frontend/components/providers/auth-provider.tsx#L44), [`WaitingRoom`](frontend/app/waiting-room/page.tsx#L7), [`TokenDebugPage`](frontend/app/debug/token/page.tsx#L12), [`getToken`](frontend/app/debug/token/page.tsx#L18), [`DeveloperPage`](frontend/app/admin/developer/page.tsx#L8)

### Models
Data structures and domain objects
- **Directories**: `frontend/components/process`, `backend/app/schemas`
- **Symbols**: 27 total
- **Key exports**: [`TenantBase`](backend/app/schemas/system.py#L7), [`TenantCreate`](backend/app/schemas/system.py#L11), [`TenantResponse`](backend/app/schemas/system.py#L14), [`ApiKeyCreate`](backend/app/schemas/system.py#L21), [`ApiKeyResponse`](backend/app/schemas/system.py#L25), [`SystemUserResponse`](backend/app/schemas/system.py#L35), [`GenerateBPMNRequest`](backend/app/schemas/process.py#L12), [`GenerateBPMNResponse`](backend/app/schemas/process.py#L27), [`ProcessJob`](backend/app/schemas/process.py#L37), [`IngestRequest`](backend/app/schemas/knowledge.py#L13), [`IngestResponse`](backend/app/schemas/knowledge.py#L31), [`SearchRequest`](backend/app/schemas/knowledge.py#L42), [`SearchResult`](backend/app/schemas/knowledge.py#L53), [`SearchResponse`](backend/app/schemas/knowledge.py#L63), [`DocumentSummary`](backend/app/schemas/knowledge.py#L71), [`ListDocumentsResponse`](backend/app/schemas/knowledge.py#L81), [`DeleteDocumentResponse`](backend/app/schemas/knowledge.py#L88), [`GenerateDocumentRequest`](backend/app/schemas/documents.py#L12), [`GenerateDocumentResponse`](backend/app/schemas/documents.py#L41), [`Finding`](backend/app/schemas/compliance.py#L10), [`AuditRequest`](backend/app/schemas/compliance.py#L20), [`AuditResponse`](backend/app/schemas/compliance.py#L36), [`CurrentUser`](backend/app/schemas/auth.py#L8), [`ApproveUserRequest`](backend/app/schemas/auth.py#L43), [`UserResponse`](backend/app/schemas/auth.py#L53), [`ApproveUserResponse`](backend/app/schemas/auth.py#L64)

### Generators
Content and object generation
- **Directories**: `frontend/components/developer`
- **Symbols**: 1 total
- **Key exports**: [`McpConfigGenerator`](frontend/components/developer/mcp-config-generator.tsx#L8)

### Controllers
Request handling and routing
- **Directories**: `frontend/components/developer`, `backend/scripts`, `backend/app/routers`
- **Symbols**: 29 total
- **Key exports**: [`ApiReferenceCard`](frontend/components/developer/api-reference-card.tsx#L5), [`test_health`](backend/scripts/test_api.py#L16), [`test_protected_without_auth`](backend/scripts/test_api.py#L37), [`main`](backend/scripts/test_api.py#L60), [`get_db`](backend/app/routers/system.py#L26), [`approve_user`](backend/app/routers/system.py#L36), [`list_users`](backend/app/routers/system.py#L86), [`list_tenants`](backend/app/routers/system.py#L130), [`create_tenant`](backend/app/routers/system.py#L137), [`list_keys`](backend/app/routers/system.py#L156), [`create_key`](backend/app/routers/system.py#L186), [`get_bpmn_service`](backend/app/routers/process.py#L27), [`generate_bpmn`](backend/app/routers/process.py#L33), [`list_tools`](backend/app/routers/mcp.py#L25), [`call_tool`](backend/app/routers/mcp.py#L38), [`mcp_sse`](backend/app/routers/mcp.py#L67), [`mcp_health`](backend/app/routers/mcp.py#L110), [`get_ingestion_service`](backend/app/routers/knowledge.py#L36), [`ingest_document`](backend/app/routers/knowledge.py#L45), [`ingest_document_file`](backend/app/routers/knowledge.py#L96), [`search_knowledge`](backend/app/routers/knowledge.py#L167), [`list_documents`](backend/app/routers/knowledge.py#L216), [`delete_document`](backend/app/routers/knowledge.py#L255), [`health_check`](backend/app/routers/health.py#L9), [`root`](backend/app/routers/health.py#L24), [`get_document_service`](backend/app/routers/documents.py#L26), [`generate_document`](backend/app/routers/documents.py#L32), [`get_compliance_service`](backend/app/routers/compliance.py#L27), [`audit_compliance`](backend/app/routers/compliance.py#L33)

### Repositories
Data access and persistence
- **Directories**: `backend/scripts`
- **Symbols**: 1 total
- **Key exports**: [`ingest_samples`](backend/scripts/ingest_sample_data.py#L56)

### Services
Business logic and orchestration
- **Directories**: `backend/app/services`, `backend/app/services/process`, `backend/app/services/mcp`, `backend/app/services/knowledge`, `backend/app/services/ingestion`, `backend/app/services/documents`, `backend/app/services/compliance`, `backend/app/services/ai`
- **Symbols**: 17 total
- **Key exports**: [`BPMNService`](backend/app/services/process/bpmn.py#L44), [`MCPServer`](backend/app/services/mcp/server.py#L26), [`get_mcp_server`](backend/app/services/mcp/server.py#L251), [`KnowledgeService`](backend/app/services/knowledge/service.py#L22), [`get_knowledge_service`](backend/app/services/knowledge/service.py#L231), [`IngestionService`](backend/app/services/ingestion/service.py#L20), [`Chunk`](backend/app/services/ingestion/chunking.py#L15), [`ChunkingStrategy`](backend/app/services/ingestion/chunking.py#L23), [`SlidingWindowStrategy`](backend/app/services/ingestion/chunking.py#L47), [`LegalDocumentStrategy`](backend/app/services/ingestion/chunking.py#L115), [`get_chunking_strategy`](backend/app/services/ingestion/chunking.py#L278), [`DocumentGeneratorService`](backend/app/services/documents/generator.py#L38), [`ComplianceAuditService`](backend/app/services/compliance/audit.py#L48), [`GeminiService`](backend/app/services/ai/gemini.py#L20), [`get_gemini_service`](backend/app/services/ai/gemini.py#L140), [`EmbeddingService`](backend/app/services/ai/embedding.py#L18), [`get_embedding_service`](backend/app/services/ai/embedding.py#L103)
## Key Symbols for This Agent
- *No relevant symbols detected.*

## Documentation Touchpoints
- [Documentation Index](../docs/README.md)
- [Project Overview](../docs/project-overview.md)
- [Architecture Notes](../docs/architecture.md)
- [Development Workflow](../docs/development-workflow.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [Glossary & Domain Concepts](../docs/glossary.md)
- [Data Flow & Integrations](../docs/data-flow.md)
- [Security & Compliance Notes](../docs/security.md)
- [Tooling & Productivity Guide](../docs/tooling.md)

## Collaboration Checklist

1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above.
4. Capture learnings back in [docs/README.md](../docs/README.md).

## Hand-off Notes

Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.
