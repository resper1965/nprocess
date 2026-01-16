---
status: filled
generated: 2026-01-16
---

# Project Overview

## O que e n.process

O **n.process** e uma **Plataforma de Infraestrutura (Control Plane)** que fornece capacidades de IA (BPMN, Compliance, Docs) para outros sistemas (ERPs, CRMs) via API e MCP. Nao e um aplicativo final para usuario comum, mas sim um middleware de inteligencia que outros sistemas consomem.

**Marca:** `n.process` (sempre minusculo) powered by **ness.**

## Os 4 Motores (Core Value)

1. **Process Engine:** Gera diagramas BPMN 2.0 a partir de texto/audio.
2. **Compliance Guard:** Audita processos contra leis usando RAG.
3. **Document Factory:** Gera PDFs/Manuais oficiais.
4. **Knowledge Store:** Base de conhecimento RAG + MCP compartilhada ou privada.

## Tecnologias Principais

- **Backend:** Python 3.11+ (FastAPI) no Cloud Run
- **Frontend:** Next.js 14+ (App Router) com TailwindCSS e Shadcn/UI
- **Database:** Google Firestore (Native Mode) com Vector Search
- **AI:** Vertex AI (Gemini 1.5 Flash/Pro, text-embedding-004)
- **Auth:** Firebase Auth (Identity Platform) com Custom Claims
- **Async:** Google Cloud Tasks
- **Integration:** REST API + MCP (Model Context Protocol) Server SSE

## Publico-Alvo

- **Desenvolvedores** que integram ERPs/CRMs via API
- **Arquitetos de Software** que precisam de capacidades de IA (BPMN, Compliance, Docs)
- **Agentes de IA** (Cursor/Claude) via protocolo MCP

## Quick Facts

- Root path: `/home/resper/nProcess`
- Primary languages: TypeScript, Python
- Arquitetura: Serverless First (Cloud Run), GCP Native
- Principio: FinOps Driven (cache agressivo, roteamento de modelos)

## Entry Points

- **Backend API:** `backend/app/main.py` (FastAPI app)
- **Frontend:** `frontend/app/page.tsx` (Next.js App Router)
- **MCP Server:** `backend/app/routers/mcp.py` (SSE endpoint)

## Key Exports

**Classes:**
- [`TenantBase`](backend/app/schemas/system.py#L7)
- [`TenantCreate`](backend/app/schemas/system.py#L11)
- [`TenantResponse`](backend/app/schemas/system.py#L14)
- [`ApiKeyCreate`](backend/app/schemas/system.py#L21)
- [`ApiKeyResponse`](backend/app/schemas/system.py#L25)
- [`SystemUserResponse`](backend/app/schemas/system.py#L35)
- [`GenerateBPMNRequest`](backend/app/schemas/process.py#L12)
- [`GenerateBPMNResponse`](backend/app/schemas/process.py#L27)
- [`ProcessJob`](backend/app/schemas/process.py#L37)
- [`IngestRequest`](backend/app/schemas/knowledge.py#L13)
- [`IngestResponse`](backend/app/schemas/knowledge.py#L31)
- [`SearchRequest`](backend/app/schemas/knowledge.py#L42)
- [`SearchResult`](backend/app/schemas/knowledge.py#L53)
- [`SearchResponse`](backend/app/schemas/knowledge.py#L63)
- [`DocumentSummary`](backend/app/schemas/knowledge.py#L71)
- [`ListDocumentsResponse`](backend/app/schemas/knowledge.py#L81)
- [`DeleteDocumentResponse`](backend/app/schemas/knowledge.py#L88)
- [`GenerateDocumentRequest`](backend/app/schemas/documents.py#L12)
- [`GenerateDocumentResponse`](backend/app/schemas/documents.py#L41)
- [`Finding`](backend/app/schemas/compliance.py#L10)
- [`AuditRequest`](backend/app/schemas/compliance.py#L20)
- [`AuditResponse`](backend/app/schemas/compliance.py#L36)
- [`CurrentUser`](backend/app/schemas/auth.py#L8)
- [`ApproveUserRequest`](backend/app/schemas/auth.py#L43)
- [`UserResponse`](backend/app/schemas/auth.py#L53)
- [`ApproveUserResponse`](backend/app/schemas/auth.py#L64)
- [`Settings`](backend/app/core/config.py#L8)
- [`BPMNService`](backend/app/services/process/bpmn.py#L44)
- [`MCPServer`](backend/app/services/mcp/server.py#L26)
- [`KnowledgeService`](backend/app/services/knowledge/service.py#L22)
- [`IngestionService`](backend/app/services/ingestion/service.py#L20)
- [`Chunk`](backend/app/services/ingestion/chunking.py#L15)
- [`ChunkingStrategy`](backend/app/services/ingestion/chunking.py#L23)
- [`SlidingWindowStrategy`](backend/app/services/ingestion/chunking.py#L47)
- [`LegalDocumentStrategy`](backend/app/services/ingestion/chunking.py#L115)
- [`DocumentGeneratorService`](backend/app/services/documents/generator.py#L38)
- [`ComplianceAuditService`](backend/app/services/compliance/audit.py#L48)
- [`GeminiService`](backend/app/services/ai/gemini.py#L20)
- [`EmbeddingService`](backend/app/services/ai/embedding.py#L18)

**Interfaces:**
- [`CustomClaims`](frontend/lib/auth.ts#L19)
- [`AuthUser`](frontend/lib/auth.ts#L28)

## File Structure & Code Organization

- `backend/` — FastAPI backend, routers, services, schemas e scripts.
- `BACKUP_INFO.md` — registro de backups anteriores do repositorio.
- `DEPLOY.md` — notas e passos de deploy.
- `docs/` — documentacao essencial e guias do projeto.
- `frontend/` — Next.js app, UI e providers de auth.
- `LIMPEZA_COMPLETA.md` — registro de limpeza/reestruturacao local.
- `README.md` — overview e instrucoes iniciais.
- `tools/` — ferramentas auxiliares (Spec Kit).

## Technology Stack Summary

- **Runtimes:** Python 3.11+, Node 18+
- **Build/Test:** pytest no backend, ESLint no frontend
- **Infra:** Cloud Run, Firestore, Cloud Tasks, Vertex AI
- **Auth:** Firebase Auth com Custom Claims

## Core Framework Stack

- **Backend:** FastAPI com Clean Architecture (core, routers, services)
- **Frontend:** Next.js 14 App Router
- **Data:** Firestore Native Mode + Vector Search
- **AI:** Vertex AI (Gemini Flash/Pro, embeddings)
- **Async:** Cloud Tasks para jobs longos

## UI & Interaction Libraries

- **UI:** TailwindCSS + Shadcn/UI
- **Icons:** lucide-react
- **BPMN Viewer:** bpmn-js

## Development Tools Overview

- **Spec Kit:** `tools/spec-kit` (spec-driven development)
- **AI Context:** `.context/` (docs e playbooks)
- **Scripts:** `backend/scripts/*.py` para operacoes admin

## Getting Started Checklist

1. Instale dependencias do frontend: `cd frontend && npm install`
2. Configure backend: `cd backend && python3 -m venv .venv && .venv/bin/pip install -e .[dev]`
3. Rode backend: `.venv/bin/uvicorn app.main:app --reload --port 8000`
4. Rode frontend: `npm run dev`

## Next Steps

- Completar plano de hardening (testes, CI, observabilidade).
- Integrar ambiente real Firebase/GCP.
- Definir deploy baseline (Cloud Run + frontend hosting).
