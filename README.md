# ness. ComplianceEngine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

**Multi-tenant SaaS platform for intelligent compliance management** powered by Google Cloud Vertex AI and Gemini.

## 🎯 Overview

ComplianceEngine is an API-first platform that enables organizations to:
- **Map business processes** into structured BPMN diagrams using AI
- **Analyze compliance** with regulatory frameworks (ANEEL, ONS, LGPD, GDPR, etc.)
- **Track compliance scores** in real-time
- **Manage API keys** and monitor usage
- **Control costs** with FinOps capabilities

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Admin Dashboard<br/>Next.js 16]
        B[Client Portal<br/>Next.js]
        C[External Apps<br/>API Consumers]
        D[MCP Clients<br/>Cursor/Claude/Antigravity]
    end

    subgraph "API Layer"
        E[ComplianceEngine API<br/>FastAPI - Core]
        F[Admin Control Plane<br/>Python API]
        G[Regulatory RAG API<br/>FastAPI]
        H[Document Generator Engine<br/>FastAPI]
    end

    subgraph "MCP Layer"
        I[MCP Gateway<br/>HTTP Gateway]
        J[ComplianceEngine MCP<br/>STDIO Server]
        K[Regulatory RAG MCP<br/>STDIO Server]
        L[Document Generator MCP<br/>STDIO Server]
        M[Regulatory Crawler MCP<br/>STDIO Server]
    end

    subgraph "Data & AI Layer"
        N[(Firestore<br/>NoSQL Database)]
        O[(PostgreSQL<br/>Relational DB)]
        P[(Redis<br/>Cache)]
        Q[Vertex AI Gemini<br/>AI Services]
        R[Vertex AI Search<br/>RAG Engine]
        S[Cloud Storage<br/>Backups]
    end

    A --> E
    A --> F
    B --> F
    B --> G
    C --> E
    D --> I
    
    I --> J
    I --> K
    I --> L
    I --> M
    
    J --> E
    K --> G
    L --> H
    M --> G
    
    E --> N
    E --> Q
    E --> P
    F --> O
    F --> P
    G --> R
    G --> P
    E --> S
```

### Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as ComplianceEngine API
    participant Auth as Auth Middleware
    participant RateLimit as Rate Limiter
    participant Service as Business Service
    participant AI as Vertex AI
    participant DB as Firestore
    participant Cache as Redis

    Client->>API: HTTP Request
    API->>Auth: Validate API Key
    Auth->>Cache: Check API Key
    Cache-->>Auth: API Key Valid
    Auth->>RateLimit: Check Rate Limit
    RateLimit->>Cache: Get Rate Limit
    Cache-->>RateLimit: Current Count
    RateLimit-->>API: Allowed
    
    API->>Service: Process Request
    Service->>Cache: Check Cache
    alt Cache Hit
        Cache-->>Service: Cached Data
    else Cache Miss
        Service->>DB: Query Data
        DB-->>Service: Data
        Service->>AI: AI Processing (if needed)
        AI-->>Service: AI Response
        Service->>Cache: Store in Cache
    end
    
    Service-->>API: Response
    API-->>Client: HTTP Response
```

### Services Architecture

```mermaid
graph LR
    subgraph "Core Services"
        A[ComplianceEngine API<br/>Port: 8080<br/>FastAPI]
        B[Admin Control Plane<br/>Port: 8008<br/>Python API]
        C[Regulatory RAG API<br/>Port: 8000<br/>FastAPI]
        D[Document Generator<br/>Port: 8001<br/>FastAPI]
    end

    subgraph "Frontend Services"
        E[Admin Dashboard<br/>Port: 3000<br/>Next.js]
        F[Client Portal<br/>Port: 3001<br/>Next.js]
    end

    subgraph "MCP Services"
        G[MCP Gateway<br/>HTTP Gateway]
        H[ComplianceEngine MCP<br/>STDIO]
        I[Regulatory RAG MCP<br/>STDIO]
        J[Document Generator MCP<br/>STDIO]
        K[Regulatory Crawler MCP<br/>STDIO]
    end

    subgraph "Infrastructure"
        L[(PostgreSQL<br/>Port: 5432)]
        M[(Redis<br/>Port: 6379)]
        N[(Firestore<br/>GCP)]
        O[Cloud Storage<br/>GCP]
    end

    E --> A
    E --> B
    F --> B
    F --> C
    G --> H
    G --> I
    G --> J
    G --> K
    H --> A
    I --> C
    J --> D
    K --> C
    
    A --> N
    A --> M
    B --> L
    B --> M
    C --> M
    A --> O
```

### MCP Integration Flow

```mermaid
flowchart TD
    A[AI Development Tool<br/>Cursor/Claude/Antigravity] -->|MCP Protocol| B[MCP Gateway<br/>HTTP Server]
    
    B -->|Route Request| C{Service Type}
    
    C -->|Compliance| D[ComplianceEngine MCP<br/>Server]
    C -->|Regulatory| E[Regulatory RAG MCP<br/>Server]
    C -->|Document| F[Document Generator MCP<br/>Server]
    C -->|Crawler| G[Regulatory Crawler MCP<br/>Server]
    
    D -->|HTTP/REST| H[ComplianceEngine API]
    E -->|HTTP/REST| I[Regulatory RAG API]
    F -->|HTTP/REST| J[Document Generator API]
    G -->|HTTP/REST| I
    
    H -->|Process| K[(Firestore)]
    H -->|AI| L[Vertex AI Gemini]
    I -->|Search| M[Vertex AI Search]
    I -->|Cache| N[(Redis)]
    J -->|Generate| O[Document Templates]
    
    K -->|Data| H
    L -->|AI Response| H
    M -->|RAG Results| I
    N -->|Cache| I
```

### Data Flow

```mermaid
flowchart LR
    subgraph "Input"
        A[Process Description<br/>Text/BPMN]
        B[Regulatory Query]
        C[API Request]
    end

    subgraph "Processing"
        D[AI Service<br/>Gemini 1.5 Pro]
        E[Compliance Analyzer]
        F[RAG Engine<br/>Vertex AI Search]
        G[Document Generator]
    end

    subgraph "Storage"
        H[(Firestore<br/>Processes)]
        I[(PostgreSQL<br/>Metadata)]
        J[(Redis<br/>Cache)]
        K[(Cloud Storage<br/>Backups)]
    end

    subgraph "Output"
        L[BPMN Diagram]
        M[Compliance Report]
        N[Regulatory Insights]
        O[Generated Documents]
    end

    A --> D
    A --> E
    B --> F
    C --> E
    
    D --> L
    E --> M
    F --> N
    G --> O
    
    E --> H
    E --> I
    F --> J
    H --> K
    I --> K
```

## 📦 Components

### 1. ComplianceEngine API (`app/`)

**Core REST API for compliance management**

```mermaid
graph TB
    subgraph "ComplianceEngine API"
        A[FastAPI Application]
        B[API Routers]
        C[Business Services]
        D[Middleware]
    end
    
    subgraph "Features"
        E[Process Management]
        F[Compliance Analysis]
        G[Diagram Generation]
        H[Versioning]
        I[Webhooks]
        J[API Key Auth]
    end
    
    subgraph "Integrations"
        K[Firestore]
        L[Vertex AI]
        M[Redis Cache]
        N[Cloud Storage]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
    
    E --> K
    F --> L
    G --> L
    C --> M
    H --> N
```

**Features:**
- ✅ FastAPI REST API
- ✅ Firestore for data persistence
- ✅ Vertex AI Gemini for AI features
- ✅ Rate limiting and monitoring
- ✅ API Key authentication
- ✅ Process versioning
- ✅ Webhook notifications
- ✅ Real-time compliance scoring

### 2. Admin Dashboard (`admin-dashboard/`)

**Human interface for platform management**

```mermaid
graph LR
    subgraph "Admin Dashboard"
        A[Next.js 16 App]
        B[NextAuth.js]
        C[shadcn/ui Components]
        D[API Client]
    end
    
    subgraph "Pages"
        E[Dashboard]
        F[API Keys]
        G[FinOps]
        H[Services]
        I[Analytics]
    end
    
    subgraph "Backend"
        J[ComplianceEngine API]
        K[Admin Control Plane]
    end
    
    A --> B
    A --> C
    A --> D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    
    D --> J
    D --> K
```

**Features:**
- ✅ Next.js 16 with TypeScript
- ✅ NextAuth.js for authentication
- ✅ shadcn/ui components
- ✅ API Key management
- ✅ Cost tracking (FinOps)
- ✅ Service monitoring
- ✅ Analytics dashboard

### 3. MCP Servers (`mcp-servers/`)

**Model Context Protocol servers for AI tool integration**

```mermaid
graph TB
    subgraph "MCP Gateway"
        A[HTTP Gateway Server]
        B[Request Router]
        C[Auth Validator]
    end
    
    subgraph "MCP Servers"
        D[ComplianceEngine MCP<br/>STDIO Server]
        E[Regulatory RAG MCP<br/>STDIO Server]
        F[Document Generator MCP<br/>STDIO Server]
        G[Regulatory Crawler MCP<br/>STDIO Server]
    end
    
    subgraph "Backend APIs"
        H[ComplianceEngine API]
        I[Regulatory RAG API]
        J[Document Generator API]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    
    D --> H
    E --> I
    F --> J
    G --> I
```

**Available MCP Servers:**
- ✅ **ComplianceEngine MCP** - Core compliance operations
- ✅ **Regulatory RAG MCP** - Regulatory intelligence search
- ✅ **Document Generator MCP** - BPMN to Mermaid conversion
- ✅ **Regulatory Crawler MCP** - Automated regulation crawling
- ✅ **MCP Gateway** - HTTP gateway for MCP servers

### 4. Additional Services

#### Admin Control Plane (`admin-control-plane/`)

```mermaid
graph LR
    A[Admin Control Plane<br/>Python API] --> B[PostgreSQL]
    A --> C[Redis]
    A --> D[JWT Auth]
    A --> E[API Key Encryption]
    
    F[Admin Dashboard] --> A
    G[Client Portal] --> A
```

**Features:**
- ✅ Admin API for platform management
- ✅ PostgreSQL for relational data
- ✅ JWT authentication
- ✅ API key encryption

#### Client Portal (`client-portal/`)

```mermaid
graph LR
    A[Client Portal<br/>Next.js] --> B[Admin Control Plane]
    A --> C[Regulatory RAG API]
    
    D[End Users] --> A
```

**Features:**
- ✅ Client-facing interface
- ✅ Process visualization
- ✅ Compliance reports
- ✅ Self-service API key management

#### Regulatory RAG API (`regulatory-rag-api/`)

```mermaid
graph TB
    A[Regulatory RAG API] --> B[Vertex AI Search]
    A --> C[Redis Cache]
    A --> D[PostgreSQL]
    
    E[Regulatory Queries] --> A
    A --> F[Regulatory Insights]
```

**Features:**
- ✅ Semantic search with Vertex AI Search
- ✅ Intelligent caching with Redis
- ✅ Quality scoring (relevância + recency)
- ✅ Domain-specific filtering
- ✅ Multiple regulatory frameworks (ANEEL, ONS, LGPD, GDPR, etc.)

#### Document Generator Engine (`document-generator-engine/`)

```mermaid
graph LR
    A[Document Generator] --> B[BPMN Parser]
    A --> C[Mermaid Converter]
    A --> D[Template Engine]
    
    E[BPMN XML] --> A
    A --> F[Mermaid Diagrams]
    A --> G[Document Templates]
```

**Features:**
- ✅ BPMN to Mermaid conversion
- ✅ Document template generation
- ✅ Process documentation automation

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Google Cloud Project with billing enabled
- Docker & Docker Compose (for local development)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/resper1965/nprocess.git
cd nprocess

# 2. Copy environment variables
cp .env.example .env

# 3. Configure .env with your credentials
# - GOOGLE_CLOUD_PROJECT=nprocess
# - GCP_PROJECT_ID=nprocess
# - Add Vertex AI credentials if using AI features

# 4. Install dependencies
make install
# or
pip install -r requirements.txt

# 5. Run locally
uvicorn app.main:app --reload --port 8080

# 6. Access API
# - API: http://localhost:8080
# - Docs: http://localhost:8080/docs
```

### Docker Development

```bash
# Start all services
make docker-up
# or
docker-compose up -d

# View logs
make docker-logs
# or
docker-compose logs -f

# Stop services
make docker-down
# or
docker-compose down
```

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started quickly
- **[Integration Guide](docs/INTEGRATION.md)** - Integrate the API
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture
- **[API Documentation](https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs)** - Interactive API docs
- **[Security](docs/SECURITY.md)** - Security practices
- **[Deployment](docs/DEPLOY_STATUS.md)** - Deployment guide

## 🔐 Authentication

### API Authentication
- **API Key** in header: `X-API-Key: <your-key>` or `Authorization: Bearer <your-key>`
- Create keys via Admin Dashboard or `/v1/my/api-keys` endpoint

### Admin Dashboard
- **URL**: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
- **Credentials**: `admin@company.com` / `admin123`

## 🌐 Production URLs

- **API**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **API Docs**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **Admin Dashboard**: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app

## 🧪 Testing

```bash
# Run all tests
make test

# Run with coverage
pytest tests/ -v --cov=app --cov-report=html

# Run specific test
pytest tests/test_api.py::test_endpoint -v
```

## 🔧 Development

```bash
# Format code
make format

# Lint code
make lint

# Run security scans
make security-scan

# Clean build artifacts
make clean
```

## 📋 Project Structure

```
nprocess/
├── app/                    # Main FastAPI application
│   ├── main.py            # Application entry point
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   ├── schemas/           # Pydantic models
│   └── middleware/       # Custom middleware
├── admin-dashboard/       # Admin interface (Next.js)
├── admin-control-plane/  # Admin API
├── client-portal/         # Client interface
├── mcp-servers/          # MCP protocol servers
├── regulatory-rag-api/   # RAG service
├── docs/                 # Documentation
├── tests/                # Test suite
├── scripts/              # Utility scripts
└── specs/                # Specifications
```

## 🤝 Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: https://github.com/resper1965/nprocess
- **API Docs**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **Admin Dashboard**: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app

## 🆘 Support

- **Issues**: https://github.com/resper1965/nprocess/issues
- **Security**: security@ness.com.br

---

**Built with ❤️ by [ness.](https://ness.com.br)**
