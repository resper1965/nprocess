# ness. n.process

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-orange.svg)](https://firebase.google.com/)

**Plataforma SaaS para gestão inteligente de compliance** powered by Google Cloud Vertex AI e Gemini.

> 🎯 **Status**: Produção  
> 📅 **Última Atualização**: 06/01/2026  
> 🔗 **Deploy**: [nprocess-8e801-4711d.web.app](https://nprocess-8e801-4711d.web.app)

---

## 🎯 O Que é n.process?

n.process é uma plataforma API-first que permite organizações:

- ✅ **Mapear processos** de negócio em diagramas BPMN estruturados usando IA
- ✅ **Analisar compliance** com frameworks regulatórios (LGPD, ISO27001, GDPR, etc.)
- ✅ **Rastrear scores** de conformidade em tempo real
- ✅ **Gerenciar API keys** e monitorar uso
- ✅ **Controlar custos** com capacidades FinOps

---

## 🏗️ Arquitetura

### Stack Tecnológico

**Frontend** (web-portal)

- Next.js 16.1.1 (App Router) + React 19
- TypeScript 5.6
- Firebase Auth 12.7 (Email + Google OAuth)
- Radix UI + TailwindCSS
- Zustand (estado global)
- TanStack React Query

**Backend** (Core API)

- FastAPI 0.115 + Uvicorn
- Python 3.11+
- Google Cloud Firestore
- Vertex AI (Gemini 1.5 Pro)
- Vertex AI Search (RAG)
- Firebase Admin SDK

**Infraestrutura**

- Firebase Hosting (Frontend)
- Cloud Run (APIs)
- Firestore (Database)
- Redis (Cache - opcional)

### Componentes Principais

```
nprocess/
├── app/                    # Core API (FastAPI) - Port 8080
│   ├── routers/           # Endpoints modulares
│   ├── services/          # Lógica de negócio
│   └── middleware/        # Security, logging, rate limiting
│
├── web-portal/            # Frontend (Next.js 16) - Port 3001
│   ├── src/app/          # App Router pages
│   ├── src/components/   # UI components
│   └── src/lib/          # Auth, Firebase, utils
│
├── admin-control-plane/   # Admin API (Python) - Port 8008
│   └── app/              # Admin endpoints
│
└── mcp-servers/          # Model Context Protocol Servers
    └── ...               # MCP integrations
```

---

## 📦 Endpoints da API

### Core API (`app/main.py`)

#### Health Check

```http
GET  /              # Root health check
GET  /health        # Detailed health check
```

#### Modelagem BPMN

````http
POST /v1/modeling/generate
Content-Type: application/json

{
  "description": "Processo de compra de material...",
  "context": { "domain": "procurement" }
}

#### Análise de Compliance (Stateless)
```http
POST /v1/compliance/analyze
Content-Type: application/json

{
  "process_id": "proc_123",
  "process": {
    "name": "Processo de Aquisição",
    "description": "...",
    "activities": ["..."],
    "actors": ["..."]
  },
  "domain": "ISO27001"
}
````

#### Ingestion (Admin Only)

```http
POST /v1/admin/ingest
Authorization: Bearer <firebase_token>

{
  "source_type": "legal",
  "source": "https://...",
  "source_id": "lgpd_br"
}
```

---

## 🚀 Quick Start

### Pré-requisitos

- Python 3.11+
- Node.js 20+
- Google Cloud Project com billing
- Firebase Project

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/resper1965/nprocess.git
cd nprocess

# 2. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 3. Backend - Core API
cd /path/to/nprocess
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080

# 4. Frontend - Web Portal
cd web-portal
npm install
npm run dev  # Port 3001
```

### Acesso

- **API**: http://localhost:8080
- **API Docs**: http://localhost:8080/docs
- **Frontend**: http://localhost:3001

---

## 🔐 Autenticação

### Firebase Auth (Frontend)

**Métodos Suportados**:

- ✅ Email/Password
- ✅ Google OAuth (redirect-based)

**Proteção Tracking Prevention**:

- Detecção automática de bloqueio de storage
- Fallback em cascata: IndexedDB → localStorage → sessionStorage
- Banner visual com instruções para desabilitar Tracking Prevention

### Exemplo de Uso

```typescript
import { useAuth } from "@/lib/auth-context";

function LoginPage() {
  const { login, loginWithGoogle } = useAuth();

  // Login com email
  await login({ email, password });

  // Login com Google
  await loginWithGoogle();
}
```

---

## 🔌 Integração MCP (Model Context Protocol)

O n.process oferece integração via MCP para ferramentas como **Claude Desktop** e **Cursor IDE**, permitindo que assistentes de IA acessem diretamente as funcionalidades da plataforma.

### Servidores MCP Disponíveis

1. **Context7** - Documentação atualizada de bibliotecas (FastAPI, Vertex AI, Firestore, Next.js, etc.)
2. **n.process** - Ferramentas de compliance, modelagem BPMN e geração de documentos

### Configuração Rápida

**Claude Desktop:**
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "ctx7sk-1fb7a718-cf5c-4aa9-8ecd-dc6221cf68a0"]
    },
    "nprocess-b4b": {
      "command": "",
      "url": "https://nprocess-admin-api-prod-43006907338.us-central1.run.app/mcp/sse",
      "transport": "sse",
      "headers": {
        "X-API-Key": "SUA_API_KEY_AQUI"
      }
    }
  }
}
```

**Cursor IDE:**
Crie `.mcp/config.json` na raiz do projeto (veja `.mcp/config.json.example`)

📖 **Documentação completa**: [`docs/manuals/MCP_SETUP_GUIDE.md`](docs/manuals/MCP_SETUP_GUIDE.md)

---

## 🌐 Produção

### URLs

- **Frontend**: https://nprocess-8e801-4711d.web.app
- **Core API**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app
- **Admin API**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app

### Deploy

```bash
# Frontend (Firebase Hosting)
cd web-portal
npm run build
firebase deploy --only hosting:web-portal --project nprocess-8e801

# Backend (Cloud Run)
gcloud run deploy nprocess-api \
  --source app/ \
  --platform managed \
  --region us-central1
```

---

## 🧪 Testes

### Frontend

```bash
cd web-portal

# Testes E2E
npm run test:e2e

# Testes E2E com UI
npm run test:e2e:ui

# Type checking
npm run type-check

# Linting
npm run lint
```

### Backend

```bash
cd /path/to/nprocess

# Testes com coverage
pytest tests/ -v --cov=app --cov-report=html

# Linting
black app/ --check
isort app/ --check-only
```

---

## 📝 Configuração

### Variáveis de Ambiente (Frontend)

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-8e801.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-8e801

# API URLs
NEXT_PUBLIC_API_URL=https://...
NEXT_PUBLIC_ADMIN_API_URL=https://...
```

### Variáveis de Ambiente (Backend)

```bash
# GCP
GCP_PROJECT_ID=nprocess
GOOGLE_APPLICATION_CREDENTIALS=/.../service-account.json

# Vertex AI
VERTEX_AI_SEARCH_LOCATION=global
VERTEX_AI_DATA_STORE_ID=regulations-datastore

# Redis (opcional)
REDIS_URL=redis://localhost:6379/0
```

---

## 🛡️ Segurança

### Headers de Segurança

O Core API implementa automaticamente:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
```

### Middlewares

1. **TrustedHostMiddleware** - Previne Host Header Injection
2. **SecurityHeadersMiddleware** - Adiciona headers de segurança
3. **RateLimitMiddleware** - Rate limiting (Redis ou in-memory)
4. **StructuredLoggingMiddleware** - Logs estruturados
5. **TracingMiddleware** - Distributed tracing
6. **CORSMiddleware** - CORS configurado

---

## 🐛 Issues Conhecidos & Soluções

### ✅ Resolvido: Tracking Prevention Blocking

**Problema**: Firefox / Edge bloqueavam Firebase Auth  
**Solução**: Implementada cascata de persistência + detecção + UI warning  
**Status**: Deployed em produção (06/01/2026)

### ✅ Resolvido: Redirect Loop Após Login

**Problema**: Race condition entre useEffects  
**Solução**: Coordenação de redirects com verificação de role  
**Status**: Deployed em produção (06/01/2026)

---

## 📚 Documentação

- [Constitution](CONSTITUTION.md) - Regras de arquitetura
- [API Integration Guide](API_INTEGRATION_GUIDE.md) - Guia de integração completo
- [Issues Report](ISSUES_REPORT.md) - Relatório de problemas conhecidos
- [Contributing](CONTRIBUTING.md) - Como contribuir
- [Security](SECURITY.md) - Política de segurança

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

---

## 📄 Licença

Distribuído sob a licença MIT. Ver `LICENSE` para mais informações.

---

## 🔗 Links

- **Repositório**: https://github.com/resper1965/nprocess
- **Aplicação**: https://nprocess-8e801-4711d.web.app
- **Issues**: https://github.com/resper1965/nprocess/issues
- **Docs API**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app/docs

---

## 🆘 Suporte

- **Email**: security@ness.com.br
- **Issues**: GitHub Issues
- **Docs**: Ver `/docs` no repositório

---

**Built with ❤️ by [ness.](https://ness.com.br)**

**Última Atualização da Documentação**: 06/01/2026  
**Baseado em**: Análise real do código (não documentação antiga)
