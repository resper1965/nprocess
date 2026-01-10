# Arquitetura Técnica & FinOps (GCP Native)

## 1. Princípios
- **Serverless First:** Escala a zero (Custo $0 quando ocioso).
- **Google Native:** Evitar serviços externos (Redis/Pinecone) em favor de nativos (Firestore/Tasks).
- **FinOps Driven:** Uso agressivo de cache e roteamento de modelos (Flash vs Pro).

## 2. Stack Tecnológico
- **Backend:** Python 3.11+ (FastAPI). Hospedagem: **Cloud Run**.
- **Async/Queue:** **Google Cloud Tasks**. (Substituto de Celery/Redis).
- **Database:** **Google Firestore** (Native Mode).
- **Vector Search:** **Firestore Vector Search** (Integrado no mesmo banco).
- **AI Models (Vertex AI):**
  - `Gemini 1.5 Flash`: Tarefas rápidas, chat, formatação.
  - `Gemini 1.5 Pro`: Raciocínio complexo, Compliance, BPMN.
  - `text-embedding-004`: Vetorização.
- **Frontend:** Next.js 14+ (App Router), TailwindCSS, Shadcn/UI.
- **Auth:** Firebase Auth (Identity Platform).

## 3. Integração
- **API REST:** Para consumidores tradicionais (ERPs).
- **MCP (Model Context Protocol):** Server SSE para integração com Agentes (Cursor/Claude).
