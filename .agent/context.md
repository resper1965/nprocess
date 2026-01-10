# n.process - Agent Context

> Este arquivo mantém o contexto do projeto para sessões de LLM/Agentes.
> Atualize após mudanças significativas.

---

## 🎯 O Que É o n.process

**n.process** é um **Middleware de Inteligência (Control Plane)** que fornece capacidades de IA para sistemas externos via API e MCP.

- **NÃO é** um app para usuário final
- **É** infraestrutura "powered by ness."
- **Branding**: `n.process` (sempre minúsculo), ponto em `#00ade8` (ciano)

---

## 🔧 Stack Tecnológico

| Componente    | Tecnologia                                       |
| ------------- | ------------------------------------------------ |
| Backend       | Python 3.11+, FastAPI, Cloud Run                 |
| Frontend      | Next.js 14+, TypeScript, Tailwind                |
| Database      | Google Firestore (Native Mode)                   |
| Vector Search | Firestore Vector Search                          |
| Auth          | Firebase Auth (Custom Claims)                    |
| AI            | Vertex AI (Gemini Flash/Pro, text-embedding-004) |
| Queue         | Google Cloud Tasks                               |

---

## 📁 Estrutura do Projeto

```
nProcess/
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── core/           # Config, Security, deps.py
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic models
│   │   └── services/       # Business logic
│   │       ├── ai/         # Vertex AI (embeddings)
│   │       ├── ingestion/  # Chunking strategies
│   │       └── knowledge/  # RAG/Vector search
│   └── scripts/            # Admin scripts
├── frontend/               # Next.js
│   ├── app/               # Pages (App Router)
│   ├── components/        # React components
│   └── lib/               # Firebase, auth utils
└── docs/essential/        # Documentação fonte de verdade
```

---

## 🔐 Segurança (CRÍTICO)

### Firebase Custom Claims

Todas as decisões de auth são baseadas em claims no JWT:

```json
{
  "org_id": "tenant-uuid",
  "role": "super_admin | org_admin | developer | guest",
  "status": "active | pending | suspended"
}
```

### Tenant Isolation

- **OBRIGATÓRIO** filtrar por `tenant_id` em todas queries Firestore
- Documentos `private` pertencem a um tenant
- Documentos `marketplace` são públicos

### Roles

| Role          | Acesso                        |
| ------------- | ----------------------------- |
| `super_admin` | Tudo (Ness staff)             |
| `org_admin`   | Tenant próprio + manage       |
| `developer`   | Tenant próprio (read/execute) |
| `guest`       | Nada (waiting-room)           |

---

## 🚀 Os 4 Motores

| Motor            | Status          | API               |
| ---------------- | --------------- | ----------------- |
| Knowledge Store  | ✅ Implementado | `/v1/knowledge/`  |
| Process Engine   | ✅ Implementado | `/v1/process/`    |
| Compliance Guard | ✅ Implementado | `/v1/compliance/` |
| Document Factory | ✅ Implementado | `/v1/documents/`  |

---

## 📋 Convenções de Código

### Backend (Python)

- Clean Architecture: `routers → services → schemas`
- Dependency Injection via FastAPI `Depends()`
- Sempre usar `get_current_user` em endpoints protegidos
- Logs estruturados com `logging`

### Frontend (TypeScript)

- App Router (Next.js 14+)
- Componentes em `components/`
- Hooks em `lib/` ou `hooks/`
- `'use client'` explícito quando necessário

### Commits

- Formato: `feat:`, `fix:`, `docs:`, `refactor:`
- Mensagem clara do que foi feito

---

## ⚠️ NÃO FAZER

- ❌ Expor secrets em código
- ❌ Queries sem filtro de `tenant_id`
- ❌ Endpoints sem `get_current_user`
- ❌ Firebase init no server-side (SSR issues)
- ❌ Usar Redis/Pinecone (preferir nativos GCP)

---

## 🔗 Links Rápidos

- [Boot Prompt](file:///home/resper/nProcess/docs/essential/BOOT_PROMPT.md)
- [Security RBAC](file:///home/resper/nProcess/docs/essential/05_SECURITY_RBAC.md)
- [Backend Main](file:///home/resper/nProcess/backend/app/main.py)
- [Auth Provider](file:///home/resper/nProcess/frontend/components/providers/auth-provider.tsx)

---

**Última Atualização**: 10 de Janeiro de 2026
