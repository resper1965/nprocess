# 📚 Documentação Completa do Sistema n.process

**Versão**: 2.0.0  
**Data**: 07 de Janeiro de 2026  
**Status**: Produção  
**Deploy**: https://nprocess-8e801-4711d.web.app

---

## 📋 Índice

1. [Visão Geral e Propósito](#visão-geral-e-propósito)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Stack Tecnológico Detalhado](#stack-tecnológico-detalhado)
4. [Estrutura de Código](#estrutura-de-código)
5. [Componentes e Módulos](#componentes-e-módulos)
6. [Fluxos Principais](#fluxos-principais)
7. [Autenticação e Autorização](#autenticação-e-autorização)
8. [Configurações e Variáveis de Ambiente](#configurações-e-variáveis-de-ambiente)
9. [Integrações e APIs](#integrações-e-apis)
10. [Problemas Conhecidos e Soluções](#problemas-conhecidos-e-soluções)
11. [Deploy e Infraestrutura](#deploy-e-infraestrutura)

---

## 🎯 Visão Geral e Propósito

### O Que é n.process?

**n.process** é uma plataforma SaaS multi-tenant para gestão inteligente de compliance, que permite organizações:

- ✅ **Mapear processos** de negócio em diagramas BPMN usando IA Generativa
- ✅ **Analisar compliance** com frameworks regulatórios (LGPD, GDPR, SOX, ANEEL, ONS, ISO27001, etc.)
- ✅ **Rastrear scores** de conformidade em tempo real
- ✅ **Gerenciar API keys** e monitorar uso
- ✅ **Controlar custos** com capacidades FinOps
- ✅ **Busca semântica** em regulamentações (RAG - Retrieval Augmented Generation)
- ✅ **Geração de documentos** de compliance automatizada

### Modelo de Negócio

- **B2B SaaS**: Plataforma API-first para integração em sistemas ERP/CRM
- **Multi-tenant**: Isolamento completo de dados por cliente (tenant)
- **Freemium**: Plano Starter gratuito com limites, planos pagos para produção

### Público-Alvo

- Sistemas ERP/CRM que precisam de análise de compliance
- Plataformas de Gestão de Processos
- Ferramentas de Auditoria
- Aplicações de Governança
- Sistemas de Documentação

---

## 🏗️ Arquitetura do Sistema

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                       │
│              (ERP, CRM, Custom Apps via API Keys)                │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │ HTTPS / REST API
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    WEB PORTAL (Next.js)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Admin Panel  │  │ Client Portal │  │ Auth (Firebase)│         │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │ Firebase Auth Token
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│              CORE API (FastAPI - Python)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Process      │  │ Compliance   │  │ Documents     │            │
│  │ Engine       │  │ Engine        │  │ Engine        │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Admin Control│  │ RAG Search    │  │ API Key Mgmt  │            │
│  │ Plane        │  │ Service      │  │ Service       │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└────────────────────────────┬──────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  Firestore     │  │  Vertex AI      │  │  Cloud Storage   │
│  (Database)    │  │  (Gemini 1.5)   │  │  (Files)         │
└────────────────┘  └─────────────────┘  └──────────────────┘
```

### Componentes Principais

1. **Web Portal** (Next.js)
   - Interface administrativa e de cliente
   - Autenticação Firebase
   - Dashboard e visualizações

2. **Core API** (FastAPI)
   - Process Normalization Engine
   - Compliance Analysis Engine
   - Document Generator Engine
   - API Key Management

3. **Admin Control Plane** (FastAPI)
   - Gestão de conhecimento (RAG)
   - Ingestão de documentos
   - Configurações administrativas
   - Chat com Gemini

4. **Firestore Database**
   - Armazenamento de processos
   - Base de conhecimento (vetores)
   - Metadados de usuários
   - API Keys e quotas

5. **Vertex AI (Gemini 1.5 Pro)**
   - Geração de diagramas BPMN
   - Análise de compliance
   - Geração de documentos
   - Chat administrativo

---

## 💻 Stack Tecnológico Detalhado

### Frontend (web-portal)

#### Framework e Core
- **Next.js**: 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.6.2
- **Node.js**: 20+

#### UI e Estilização
- **TailwindCSS**: 3.4.13
- **Radix UI**: Componentes acessíveis
  - Dialog, Dropdown, Select, Tabs, Toast, etc.
- **Lucide React**: Ícones
- **next-themes**: Suporte a dark/light mode

#### Estado e Dados
- **Zustand**: 5.0.0 (Estado global)
- **TanStack React Query**: 5.59.0 (Cache e sincronização)
- **Axios**: 1.7.7 (HTTP client)

#### Autenticação
- **Firebase**: 12.7.0
  - Auth (Email + Google OAuth)
  - Firestore (leitura)
  - Storage (opcional)
  - Messaging (FCM - opcional)

#### Validação e Formulários
- **Zod**: 4.2.1 (Validação de schemas)
- **React Hook Form**: (implícito via Radix)

#### Visualização
- **Mermaid**: 11.12.2 (Diagramas BPMN)
- **Recharts**: 2.12.7 (Gráficos)

#### Utilitários
- **date-fns**: 4.1.0 (Manipulação de datas)
- **clsx**: 2.1.1 (Classes condicionais)
- **class-variance-authority**: 0.7.0 (Variantes de componentes)

### Backend (Core API)

#### Framework
- **FastAPI**: 0.115.0
- **Uvicorn**: 0.31.0 (ASGI server)
- **Gunicorn**: 23.0.0 (Production WSGI)

#### Validação e Schemas
- **Pydantic**: 2.9.2
- **Pydantic Settings**: 2.5.2

#### Google Cloud Platform
- **google-cloud-firestore**: 2.19.0
- **google-cloud-aiplatform**: 1.71.1
- **vertexai**: 1.71.1
- **google-cloud-storage**: 2.14.0
- **google-cloud-secret-manager**: 2.20.0
- **google-cloud-logging**: 3.11.0
- **google-cloud-monitoring**: 2.19.0

#### Firebase
- **firebase-admin**: 6.6.0 (Verificação de tokens)

#### IA e Processamento
- **langchain**: 0.3.0 (RAG e processamento de texto)
- **langchain-text-splitters**: 0.3.0
- **beautifulsoup4**: 4.12.3 (Parsing HTML)
- **pandas**: 2.2.0 (Processamento de dados)
- **openpyxl**: 3.1.2 (Excel)

#### Utilitários
- **httpx**: 0.27.2 (HTTP async)
- **python-multipart**: 0.0.12 (Upload de arquivos)
- **python-dotenv**: 1.0.1 (Variáveis de ambiente)
- **bcrypt**: 4.2.0 (Hashing)
- **redis**: 5.0.1 (Cache e rate limiting - opcional)
- **requests**: 2.31.0 (HTTP sync)

#### Observabilidade
- **opentelemetry-api**: 1.24.0
- **opentelemetry-sdk**: 1.24.0
- **opentelemetry-exporter-cloud-trace**: 0.10b1
- **opentelemetry-instrumentation-fastapi**: 0.45b0

### Infraestrutura

#### Hosting
- **Firebase Hosting**: Frontend estático
- **Cloud Run**: APIs (containerizado)

#### Database
- **Firestore**: NoSQL, multi-tenant
- **Vector Search**: Firestore (RAG)

#### Storage
- **Cloud Storage**: Arquivos e backups

#### CI/CD
- **Cloud Build**: Build e deploy automatizado
- **GitHub Actions**: (opcional)

#### Monitoramento
- **Cloud Logging**: Logs centralizados
- **Cloud Monitoring**: Métricas e alertas
- **Cloud Trace**: Distributed tracing

---

## 📁 Estrutura de Código

### Estrutura de Diretórios

```
nprocess/
├── app/                          # Core API (FastAPI)
│   ├── __init__.py
│   ├── main.py                  # Entry point da API
│   ├── config.py                # Configurações
│   ├── dependencies.py          # Dependency injection
│   ├── schemas.py               # Pydantic models
│   ├── routers/                 # Endpoints modulares
│   │   ├── process.py          # Process normalization
│   │   ├── compliance.py       # Compliance analysis
│   │   ├── documents.py        # Document generation
│   │   └── health.py           # Health checks
│   ├── services/                # Lógica de negócio
│   │   ├── ai_service.py       # Vertex AI integration
│   │   ├── process_service.py  # Process logic
│   │   ├── compliance_service.py
│   │   ├── document_service.py
│   │   ├── search_service.py   # RAG search
│   │   └── ingestion/         # Knowledge ingestion
│   │       ├── embedding_service.py
│   │       └── persistence_service.py
│   └── middleware/              # Middleware
│       ├── auth.py             # Authentication
│       └── logging.py           # Request logging
│
├── admin-control-plane/         # Admin API (FastAPI)
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── knowledge.py    # Knowledge base mgmt
│   │   │   ├── ingestion.py    # Document ingestion
│   │   │   ├── chat.py         # Gemini chat
│   │   │   └── secrets.py     # Secrets mgmt
│   │   └── services/
│   │       ├── kb_search_service.py
│   │       ├── document_service.py
│   │       ├── process_service.py
│   │       └── gemini_chat.py
│
├── web-portal/                   # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                 # App Router (Next.js 13+)
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── login/          # Login page
│   │   │   ├── dashboard/      # Client dashboard
│   │   │   │   ├── page.tsx
│   │   │   │   ├── chat/
│   │   │   │   ├── compliance/
│   │   │   │   ├── api-keys/
│   │   │   │   └── settings/
│   │   │   └── admin/          # Admin panel
│   │   │       ├── overview/
│   │   │       ├── api-keys/
│   │   │       ├── consumers/
│   │   │       ├── finops/
│   │   │       └── settings/
│   │   ├── components/          # React components
│   │   │   ├── ui/             # Radix UI components
│   │   │   ├── sidebar.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   └── ...
│   │   ├── lib/                 # Utilities
│   │   │   ├── firebase-config.ts
│   │   │   ├── firebase-auth.ts
│   │   │   ├── auth-context.tsx
│   │   │   ├── api-client.ts
│   │   │   └── i18n/
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── use-api-keys.ts
│   │   │   ├── use-audit-logs.ts
│   │   │   └── ...
│   │   └── types/               # TypeScript types
│   ├── public/                  # Static assets
│   ├── scripts/                 # Build scripts
│   └── package.json
│
├── mcp-servers/                  # MCP Servers (TypeScript)
│   └── ...
│
├── scripts/                      # Deployment scripts
│   ├── deploy-production.sh
│   ├── set-super-admin-prod.py
│   └── ...
│
├── tests/                        # Testes
│   ├── conftest.py
│   └── ...
│
├── docs/                        # Documentação
│   ├── architecture/
│   ├── deployment/
│   ├── troubleshooting/
│   └── ...
│
├── firebase.json                # Firebase config
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── requirements.txt            # Python dependencies
├── pyproject.toml             # Python project config
└── README.md
```

### Convenções de Código

#### Python (Backend)
- **Style**: PEP 8
- **Type Hints**: Obrigatórios
- **Async/Await**: Para operações I/O
- **Pydantic**: Todos os schemas de entrada/saída
- **Dependency Injection**: FastAPI `Depends`

#### TypeScript (Frontend)
- **Strict Mode**: Habilitado
- **ESLint**: Next.js config
- **Components**: Functional components com hooks
- **State Management**: Zustand para global, React Query para server state

---

## 🔧 Componentes e Módulos

### 1. Process Normalization Engine

**Localização**: `app/routers/process.py`, `app/services/process_service.py`

**Funcionalidade**:
- Converte descrições textuais em diagramas BPMN
- Normaliza processos para formato padrão
- Gera diagramas Mermaid.js para visualização

**Endpoints**:
- `POST /v1/modeling/generate`: Gera diagrama BPMN
- `POST /v1/modeling/feedback`: Aplica feedback do usuário
- `POST /v1/modeling/finalize`: Finaliza e persiste processo

**Fluxo**:
1. Recebe texto descritivo do processo
2. Chama Vertex AI (Gemini 1.5 Pro) com prompt estruturado
3. Extrai elementos: atividades, gateways, eventos, lanes
4. Gera BPMN XML e Mermaid code
5. Retorna resultado para validação do usuário

### 2. Compliance Analysis Engine

**Localização**: `app/routers/compliance.py`, `app/services/compliance_service.py`

**Funcionalidade**:
- Analisa processos contra frameworks regulatórios
- Identifica gaps de conformidade
- Calcula score de compliance (0-100)
- Gera sugestões de melhoria

**Endpoints**:
- `POST /v1/compliance/analyze`: Analisa processo
- `GET /v1/compliance/domains`: Lista domínios disponíveis

**Fluxo**:
1. Recebe processo (BPMN ou texto)
2. Busca regulamentações relevantes via RAG
3. Chama Vertex AI para análise comparativa
4. Identifica gaps e calcula score
5. Gera relatório com sugestões

### 3. Document Generator Engine

**Localização**: `app/routers/documents.py`, `app/services/document_service.py`

**Funcionalidade**:
- Gera documentos de compliance automatizados
- Preenche templates com dados do processo
- Exporta em múltiplos formatos

**Endpoints**:
- `POST /v1/documents/generate`: Gera documento
- `GET /v1/documents/templates`: Lista templates

### 4. RAG Search Service

**Localização**: `app/services/search_service.py`, `admin-control-plane/app/services/kb_search_service.py`

**Funcionalidade**:
- Busca semântica em base de conhecimento
- Suporta conhecimento global e privado (por tenant)
- Usa Firestore Vector Search

**Fluxo**:
1. Recebe query do usuário
2. Gera embedding via Vertex AI
3. Busca vetores similares no Firestore
4. Filtra por tenant_id e scope
5. Retorna documentos relevantes

### 5. Knowledge Ingestion Engine

**Localização**: `admin-control-plane/app/routers/ingestion.py`

**Funcionalidade**:
- Ingesta documentos (PDF, Word, Excel, HTML)
- Extrai texto e gera embeddings
- Armazena em Firestore com metadados

**Endpoints**:
- `POST /v1/admin/knowledge/ingest`: Ingesta documento
- `GET /v1/admin/knowledge/documents`: Lista documentos

### 6. API Key Management

**Localização**: `app/middleware/auth.py`, `web-portal/src/hooks/use-api-keys.ts`

**Funcionalidade**:
- Gera e revoga API keys
- Valida keys em requests
- Monitora uso e quotas
- Isolamento por tenant

**Estrutura de API Key**:
```json
{
  "key_id": "uuid",
  "key": "nprocess_xxx...",
  "consumer_app_id": "client_a",
  "tenant_id": "client_a",
  "active": true,
  "created_at": "timestamp",
  "last_used_at": "timestamp",
  "quotas": {
    "requests_per_day": 1000
  },
  "usage": {
    "requests_today": 150
  }
}
```

### 7. Admin Control Plane

**Localização**: `admin-control-plane/`

**Funcionalidades**:
- Gestão de base de conhecimento
- Chat com Gemini para operações administrativas
- Configurações do sistema
- Gestão de secrets

**Endpoints**:
- `POST /v1/admin/knowledge/ingest`: Ingesta documento
- `POST /v1/admin/chat`: Chat com Gemini
- `GET /v1/admin/knowledge/documents`: Lista documentos

---

## 🔄 Fluxos Principais

### Fluxo de Autenticação

1. **Login no Web Portal**:
   - Usuário acessa `/login`
   - Escolhe Email/Password ou Google OAuth
   - Firebase Auth processa autenticação
   - Token JWT é gerado com custom claims (role)

2. **Verificação de Role**:
   - Frontend verifica custom claim `role` no token
   - Se não houver, busca em Firestore como fallback
   - Roles: `super_admin`, `admin`, `user`

3. **Redirecionamento**:
   - `super_admin` ou `admin` → `/admin/overview`
   - `user` → `/dashboard`

4. **API Requests**:
   - Frontend envia token no header `Authorization: Bearer <token>`
   - Backend verifica token via Firebase Admin SDK
   - Extrai `uid` e `role` do token decodificado

### Fluxo de Análise de Compliance

1. **Cliente envia processo** (via API ou Web Portal):
   ```
   POST /v1/compliance/analyze
   {
     "process_id": "uuid",
     "domain": "lgpd"
   }
   ```

2. **Sistema busca regulamentações**:
   - RAG Search busca documentos relevantes
   - Filtra por tenant_id e scope
   - Retorna top N documentos

3. **Vertex AI analisa**:
   - Prompt estruturado com processo + regulamentações
   - Gemini 1.5 Pro compara e identifica gaps
   - Gera score e sugestões

4. **Resultado retornado**:
   ```json
   {
     "score": 75,
     "gaps": [...],
     "suggestions": [...],
     "report": "..."
   }
   ```

### Fluxo de Geração de Processo

1. **Cliente envia descrição**:
   ```
   POST /v1/modeling/generate
   {
     "text": "We buy things by emailing Bob..."
   }
   ```

2. **Vertex AI processa**:
   - Extrai elementos do processo
   - Normaliza para formato padrão
   - Gera BPMN XML e Mermaid

3. **Resultado retornado**:
   ```json
   {
     "process_id": "uuid",
     "mermaid": "graph TD...",
     "bpmn": "<bpmn:definitions>...",
     "summary": "..."
   }
   ```

4. **Feedback loop** (opcional):
   - Usuário revisa e fornece feedback
   - Sistema reprocessa com feedback
   - Gera nova versão

---

## 🔐 Autenticação e Autorização

### Firebase Authentication

**Configuração**:
- **Project**: `nprocess-8e801`
- **Auth Domain**: `nprocess-8e801.firebaseapp.com`
- **Métodos**: Email/Password, Google OAuth

**Custom Claims**:
- `role`: `super_admin`, `admin`, `user`
- `admin`: `true` (para admin/super_admin)

**Fallback**:
- Se custom claim não existir, busca em Firestore (`users/{uid}/role`)

### RBAC (Role-Based Access Control)

**Roles**:

1. **super_admin**:
   - Acesso total ao sistema
   - Pode configurar outros admins
   - Acesso a Admin Control Plane
   - Gestão de conhecimento

2. **admin**:
   - Acesso a Admin Panel
   - Gestão de API keys
   - Visualização de métricas
   - Não pode configurar outros admins

3. **user**:
   - Acesso ao Client Portal
   - Uso de API keys próprias
   - Visualização de processos e compliance
   - Não tem acesso administrativo

### API Key Authentication

**Validação**:
- Header: `X-API-Key: nprocess_xxx...`
- Backend valida key no Firestore
- Extrai `tenant_id` e `quotas`
- Verifica limites de uso

**Isolamento**:
- Cada API key pertence a um `tenant_id`
- Dados são filtrados por `tenant_id`
- Quotas são aplicadas por key

### Problema Conhecido: Redirect Loop no Google OAuth

**Status**: Em resolução

**Sintoma**:
- Após login com Google, usuário não é detectado
- `getRedirectResult` retorna `null`
- `onAuthStateChanged` não detecta usuário

**Soluções Implementadas**:
1. Forçar reload da página quando detectar redirect
2. Verificar usuário persistido após reload
3. Múltiplas camadas de detecção

**Arquivos Relacionados**:
- `web-portal/src/lib/auth-context.tsx`
- `web-portal/src/lib/firebase-auth.ts`
- `web-portal/src/app/login/page.tsx`

---

## ⚙️ Configurações e Variáveis de Ambiente

### Frontend (web-portal)

**Arquivo**: `.env.production` ou `.env.local`

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-8e801.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-8e801
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nprocess-8e801.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=43006907338
NEXT_PUBLIC_FIREBASE_APP_ID=1:43006907338:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...

# API
NEXT_PUBLIC_API_URL=https://api-nprocess-xxx.run.app
NEXT_PUBLIC_ADMIN_API_URL=https://admin-nprocess-xxx.run.app
```

### Backend (Core API)

**Arquivo**: `.env` ou Secret Manager

```bash
# GCP
GCP_PROJECT_ID=nprocess-8e801
GCP_REGION=us-central1

# Firestore
FIRESTORE_DATABASE_ID=default

# Vertex AI
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-pro

# Firebase Admin
FIREBASE_ADMIN_SDK_JSON=<JSON string ou path>

# API
NPROCESS_API_KEY=<internal service key>

# Optional
REDIS_URL=<redis connection string>
ENV=production
```

### Admin Control Plane

**Similar ao Core API**, com endpoints específicos para admin.

---

## 🔌 Integrações e APIs

### APIs Internas

#### Core API

**Base URL**: `https://api-nprocess-xxx.run.app`

**Endpoints Principais**:

1. **Process Modeling**:
   - `POST /v1/modeling/generate`
   - `POST /v1/modeling/feedback`
   - `POST /v1/modeling/finalize`

2. **Compliance**:
   - `POST /v1/compliance/analyze`
   - `GET /v1/compliance/domains`

3. **Documents**:
   - `POST /v1/documents/generate`
   - `GET /v1/documents/templates`

4. **Health**:
   - `GET /health`
   - `GET /v1/health`

#### Admin Control Plane

**Base URL**: `https://admin-nprocess-xxx.run.app`

**Endpoints Principais**:

1. **Knowledge Base**:
   - `POST /v1/admin/knowledge/ingest`
   - `GET /v1/admin/knowledge/documents`
   - `DELETE /v1/admin/knowledge/documents/{id}`

2. **Chat**:
   - `POST /v1/admin/chat`

3. **Secrets**:
   - `GET /v1/admin/secrets`
   - `POST /v1/admin/secrets`

### Integrações Externas

#### Google Cloud Platform

- **Vertex AI**: Gemini 1.5 Pro para IA
- **Firestore**: Database e vector search
- **Cloud Storage**: Arquivos
- **Secret Manager**: Secrets
- **Cloud Logging/Monitoring**: Observabilidade

#### Firebase

- **Authentication**: Email + Google OAuth
- **Hosting**: Frontend estático
- **Firestore**: Leitura de dados do frontend

---

## 🐛 Problemas Conhecidos e Soluções

### 1. Redirect Loop no Google OAuth

**Descrição**: Após login com Google, usuário não é detectado e fica em loop de redirect.

**Causa**: Firebase Auth não processa redirect corretamente após reload.

**Solução Implementada**:
- Forçar reload quando detectar parâmetros de redirect
- Verificar usuário persistido após reload
- Múltiplas camadas de detecção

**Status**: Em monitoramento

### 2. Tracking Prevention no Edge/Safari

**Descrição**: Edge/Safari bloqueiam IndexedDB/localStorage, impedindo Firebase Auth.

**Solução**:
- Usar `signInWithRedirect` em vez de popup
- Configurar persistência: IndexedDB → localStorage → sessionStorage
- Instruções para usuário desabilitar Tracking Prevention

**Status**: Resolvido

### 3. Firestore não inicializado

**Descrição**: Erro "404 The database (default) does not exist".

**Causa**: Firestore não foi criado no projeto.

**Solução**: Não crítico - custom claims são o método primário de armazenamento de roles.

**Status**: Aceito (não crítico)

### 4. Custom Claims não propagam imediatamente

**Descrição**: Após definir custom claim, usuário precisa fazer logout/login.

**Solução**: Documentado em `docs/troubleshooting/SUPERADMIN_AUTH_LOOP.md`.

**Status**: Documentado

---

## 🚀 Deploy e Infraestrutura

### Deploy do Frontend

```bash
cd web-portal
npm run build
cd ..
firebase deploy --only hosting
```

**URL**: https://nprocess-8e801-4711d.web.app

### Deploy do Backend

**Cloud Build**:
- `cloudbuild.yaml`: Core API
- `cloudbuild-admin.yaml`: Admin Control Plane

**Comandos**:
```bash
# Core API
gcloud builds submit --config=cloudbuild.yaml

# Admin Control Plane
gcloud builds submit --config=cloudbuild-admin.yaml
```

### Infraestrutura GCP

**Recursos**:
- **Cloud Run**: APIs (containerizado)
- **Firestore**: Database
- **Cloud Storage**: Arquivos
- **Secret Manager**: Secrets
- **Cloud Build**: CI/CD

**Região**: `us-central1`

### Monitoramento

- **Cloud Logging**: Logs centralizados
- **Cloud Monitoring**: Métricas e alertas
- **Cloud Trace**: Distributed tracing

---

## 📊 Métricas e Observabilidade

### Métricas Coletadas

1. **API Usage**:
   - Requests por endpoint
   - Latência
   - Taxa de erro

2. **Vertex AI**:
   - Tokens consumidos
   - Custo por request
   - Latência de resposta

3. **Firestore**:
   - Reads/Writes
   - Latência de queries

4. **API Keys**:
   - Uso por key
   - Quotas vs. uso real

### Dashboards

- **Admin Panel**: `/admin/finops`
- **Client Portal**: `/dashboard` (métricas próprias)

---

## 🔒 Segurança

### Firestore Security Rules

**Localização**: `firestore.rules`

**Regras Principais**:
- Usuários só podem ler/escrever seus próprios dados
- API keys isoladas por tenant
- Base de conhecimento: global (read-only) ou privada (owner only)

### Storage Security Rules

**Localização**: `storage.rules`

**Regras**: Apenas usuários autenticados podem fazer upload.

### API Security

- **Rate Limiting**: Por API key
- **CORS**: Configurado para domínios específicos
- **HTTPS**: Obrigatório em produção

---

## 📝 Próximos Passos

1. **Resolução do Redirect Loop**: Monitorar e ajustar se necessário
2. **Testes E2E**: Implementar com Playwright
3. **Documentação de API**: Swagger/OpenAPI
4. **Métricas Avançadas**: Dashboard mais detalhado
5. **Multi-região**: Expansão para outras regiões GCP

---

**Última Atualização**: 07 de Janeiro de 2026  
**Versão do Documento**: 2.0.0  
**Mantido por**: Equipe n.process
