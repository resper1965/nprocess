# ness. ComplianceEngine

Multi-tenant SaaS platform for intelligent compliance management powered by Google Cloud Vertex AI and Gemini.

![ness. ComplianceEngine](https://img.shields.io/badge/ness.-ComplianceEngine-00ade9)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![Python 3.11](https://img.shields.io/badge/Python-3.11-blue)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd nprocess

# 2. Copy environment variables
cp .env.example .env

# 3. Edit .env with your credentials
# - Add your GEMINI_API_KEY
# - Add your GCP credentials

# 4. Start all services
docker-compose up -d

# 5. Access the application
# Client Portal: http://localhost:3001
# Admin API: http://localhost:8008
# RAG API: http://localhost:8000
```

## 📦 Components

### 1. Client Portal (`:3001`)
- Next.js 14 + Tailwind + shadcn/ui
- JWT Auth + Protected Routes
- 10 pages: Dashboard, API Keys, Secrets, Integrations, Documents, Compliance, Chat, Billing, Team, Settings

### 2. Admin Control Plane (`:8008`)
- FastAPI + Gemini AI
- User/API Key/Secrets Management
- Audit Logs + FinOps

### 3. Regulatory RAG API (`:8000`)
- FastAPI + Vertex AI Search
- 23 regulatory frameworks

## 🔐 Demo Login

```
Email: demo@complianceengine.com
Password: demo123
```

## 🐳 Docker

```bash
# Start all
docker-compose up -d

# Logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build
```

## 📊 Architecture

```
Client Portal (Next.js)
       ↓
Admin API ← → RAG API
       ↓         ↓
   PostgreSQL  Vertex AI
       ↓
     Redis
```

---

**Built with ❤️ by ness.**
