# Admin Control Plane API

**Central administrative API for ComplianceEngine Platform**

Provides comprehensive administrative operations including:
- 💬 **Chat with Gemini** - Natural language admin interface
- 🔑 **API Keys Management** - Generate, rotate, revoke keys
- 👥 **User Management** - CRUD with RBAC
- 🤖 **AI Keys Vault** - Manage OpenAI, Claude, Gemini, Azure keys
- 💰 **FinOps** - Cost tracking with Cloud Billing integration
- 📊 **Services Monitoring** - Health and metrics via Cloud Monitoring
- 📝 **Audit Logs** - Complete audit trail via Cloud Logging

## Features

### 1. Chat with Gemini AI ⭐

Conversational interface for admin operations:

```bash
POST /v1/admin/chat
{
  "message": "Create an API key for contracts-app with 10000 daily quota"
}
```

Gemini can:
- Create/revoke API keys
- Manage users and roles
- Query costs and usage
- Generate audit reports
- Provide cost optimization recommendations

### 2. API Keys Management

```bash
POST   /v1/admin/apikeys              # Create API key
GET    /v1/admin/apikeys              # List all keys
POST   /v1/admin/apikeys/{id}/revoke  # Revoke key
POST   /v1/admin/apikeys/validate     # Validate key
```

**Security**:
- AES-256-GCM encryption
- bcrypt hashing (12 salt rounds)
- Show once during creation
- Automatic expiration

### 3. User Management (RBAC)

**Roles**:
- `super_admin` - Full access
- `admin` - Manage users, keys
- `finops_manager` - View/manage costs
- `auditor` - Read-only audit logs
- `user` - Use platform
- `viewer` - Read-only

```bash
POST   /v1/admin/users          # Create user
GET    /v1/admin/users          # List users
PATCH  /v1/admin/users/{id}     # Update role/status
```

### 4. AI Keys Vault

Securely manage AI provider keys in Google Secret Manager:

```bash
POST   /v1/admin/ai-keys              # Add AI key
GET    /v1/admin/ai-keys              # List keys (no values)
POST   /v1/admin/ai-keys/{id}/test    # Test validity
POST   /v1/admin/ai-keys/{id}/rotate  # Rotate key
```

**Supported providers**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini, Vertex AI)
- Azure (OpenAI)

### 5. FinOps Dashboard

Real-time cost tracking and optimization:

```bash
GET /v1/admin/finops/costs              # Cost summary
GET /v1/admin/finops/usage              # Usage metrics
GET /v1/admin/finops/forecast           # Cost forecast
GET /v1/admin/finops/recommendations    # AI-powered optimization
```

**Integrations**:
- Google Cloud Billing API (real costs)
- Cloud Monitoring (usage metrics)
- BigQuery (historical analytics)
- Gemini AI (cost optimization recommendations)

### 6. Services Monitoring

Monitor all ComplianceEngine services:

```bash
GET /v1/admin/services                  # List services
GET /v1/admin/services/{id}/health      # Health check
GET /v1/admin/services/{id}/metrics     # Latency, error rate
```

**Metrics tracked**:
- Uptime %
- Latency (P50, P95, P99)
- Error rate
- Request volume
- Availability

### 7. Audit Logs

Complete audit trail for compliance:

```bash
GET  /v1/admin/audit/logs               # Query logs
POST /v1/admin/audit/export             # Export report
```

**Logged actions**:
- All CRUD operations
- API key creation/revocation
- User role changes
- Cost threshold breaches
- Security events

---

## Installation

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Google Cloud Project with:
  - Vertex AI API enabled
  - Gemini API enabled
  - Cloud Billing API enabled
  - Cloud Monitoring API enabled
  - Cloud Logging API enabled
  - Secret Manager API enabled

### Setup

```bash
# Clone repository
cd admin-control-plane

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8008 --reload
```

## Configuration

### Google Cloud Setup

1. **Create Service Account**:
```bash
gcloud iam service-accounts create admin-control-plane \
  --display-name="Admin Control Plane Service Account"
```

2. **Grant Permissions**:
```bash
# Billing
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:admin-control-plane@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/billing.viewer"

# Monitoring
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:admin-control-plane@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/monitoring.viewer"

# Secret Manager
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:admin-control-plane@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

# Logging
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:admin-control-plane@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/logging.viewer"
```

3. **Download Service Account Key**:
```bash
gcloud iam service-accounts keys create service-account.json \
  --iam-account=admin-control-plane@${PROJECT_ID}.iam.gserviceaccount.com
```

### Gemini API Setup

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`:
```
GEMINI_API_KEY=your-api-key-here
```

---

## Usage

### Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload --port 8008

# Access API docs
open http://localhost:8008/docs
```

### Production (Docker)

```bash
# Build
docker build -t admin-control-plane .

# Run
docker run -d \
  -p 8008:8008 \
  -e GEMINI_API_KEY=your-key \
  -e DATABASE_URL=your-db-url \
  --name admin-control-plane \
  admin-control-plane
```

### Production (Cloud Run)

```bash
# Deploy
gcloud run deploy admin-control-plane \
  --image gcr.io/${PROJECT_ID}/admin-control-plane \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=${GEMINI_API_KEY} \
  --service-account admin-control-plane@${PROJECT_ID}.iam.gserviceaccount.com
```

---

## API Examples

### Chat with Gemini

```bash
curl -X POST http://localhost:8008/v1/admin/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all API keys for contracts-app"
  }'
```

Response:
```json
{
  "message": "Found 2 API keys for contracts-app:\n1. contracts-app-prod (active, 78% quota used)\n2. contracts-app-test (active, 12% quota used)",
  "actions_performed": [{
    "operation": "list_api_keys",
    "status": "success",
    "result": {"count": 2}
  }],
  "suggestions": [
    "Consider rotating contracts-app-prod key (90 days old)",
    "Test key usage is low - reduce quota to save costs"
  ],
  "session_id": "sess_abc123",
  "timestamp": "2024-12-24T10:30:00Z"
}
```

### Create API Key

```bash
curl -X POST http://localhost:8008/v1/admin/apikeys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "contracts-app-production",
    "consumer_app_id": "contracts-app",
    "quotas": {
      "requests_per_minute": 100,
      "requests_per_day": 10000
    },
    "permissions": ["read", "write"]
  }'
```

### Get Cost Summary

```bash
curl http://localhost:8008/v1/admin/finops/costs?period=current_month
```

Response:
```json
{
  "period": "2024-12",
  "total_cost": 1847.32,
  "cost_by_service": {
    "vertex_ai_search": 1234.56,
    "cloud_run": 412.76,
    "cloud_storage": 125.00
  },
  "cost_by_consumer": {
    "contracts-app": 923.45,
    "audit-portal": 654.32
  },
  "budget": 3000.00,
  "budget_used_percent": 61.58,
  "forecast_month_end": 2450.00
}
```

---

## Integration with Admin Dashboard

The admin-dashboard frontend (Next.js 14) consumes this API:

```typescript
// services/adminApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;

export const adminAPI = {
  chat: (message: string) =>
    post(`${API_BASE_URL}/v1/admin/chat`, { message }),

  createAPIKey: (data: APIKeyCreate) =>
    post(`${API_BASE_URL}/v1/admin/apikeys`, data),

  getCosts: (period: string) =>
    get(`${API_BASE_URL}/v1/admin/finops/costs?period=${period}`)
};
```

---

## Future Integrations

### NotebookLM Integration

```bash
POST /v1/admin/integrations/notebooklm/create
{
  "title": "Compliance Documentation Notebook",
  "sources": ["gdrive_doc_id_1", "gdrive_doc_id_2"]
}
```

### Google Drive Integration

```bash
POST /v1/admin/integrations/gdrive/upload
{
  "document_id": "doc_abc123",
  "folder_id": "gdrive_folder_id",
  "share_with": ["email@example.com"]
}
```

### SharePoint Integration

```bash
POST /v1/admin/integrations/sharepoint/upload
{
  "document_id": "doc_abc123",
  "site_id": "sharepoint_site_id",
  "library_name": "Compliance Documents"
}
```

---

## Development

### Run Tests

```bash
pytest tests/ -v --cov=app
```

### Lint

```bash
black app/
isort app/
mypy app/
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add users table"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Security

- **API Keys**: AES-256-GCM encryption + bcrypt hashing
- **AI Keys**: Stored in Google Secret Manager (encrypted at rest)
- **Authentication**: JWT tokens (HS256)
- **Authorization**: Role-based access control (RBAC)
- **Audit**: All operations logged to Cloud Logging
- **Network**: HTTPS only in production
- **Secrets**: Never logged or returned in responses

---

## Monitoring

### Health Check

```bash
curl http://localhost:8008/health
```

### Metrics

Available in Cloud Monitoring:
- Request rate (RPM)
- Latency (P50, P95, P99)
- Error rate
- Chat message processing time
- API key operations
- Cost query duration

---

## Support

- **Documentation**: `/docs` (Swagger UI)
- **Issues**: GitHub Issues
- **Logs**: Google Cloud Logging

---

## License

Proprietary - Internal use only
