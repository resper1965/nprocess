# RegulatoryRAG API

Regulatory Knowledge Base with Semantic Search powered by Vertex AI Search.

## Overview

The RegulatoryRAG API is a microservice that provides semantic search capabilities over regulatory documents using Google Cloud Vertex AI Search. It includes Redis caching for improved performance and is designed to be consumed by the ComplianceEngine API for compliance analysis.

## Features

- **Semantic Search**: Natural language search over regulatory documents
- **Multi-Domain Support**: Search across different regulatory domains (banking, healthcare, etc.)
- **Quality Scoring**: AI-powered relevance and quality scores for search results
- **Redis Caching**: Intelligent caching for improved performance
- **Fast & Scalable**: Built with FastAPI and designed for Cloud Run deployment

## Architecture

```
┌──────────────────────┐
│  ComplianceEngine    │
│        API           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐      ┌─────────────────┐
│  RegulatoryRAG API   │◄─────┤  Redis Cache    │
└──────────┬───────────┘      └─────────────────┘
           │
           ▼
┌──────────────────────┐
│  Vertex AI Search    │
│  (Discovery Engine)  │
└──────────────────────┘
```

## Installation

### Prerequisites

- Python 3.11+
- Google Cloud Project with Vertex AI Search enabled
- Redis (optional, for caching)
- Service Account with appropriate permissions

### Setup

1. **Clone the repository**:
   ```bash
   cd regulatory-rag-api
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up Google Cloud credentials**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   ```

## Running Locally

### Development Server

```bash
uvicorn app.main:app --reload --port 8001
```

### With Docker

```bash
docker build -t regulatory-rag-api .
docker run -p 8001:8001 --env-file .env regulatory-rag-api
```

### With Docker Compose (includes Redis)

```bash
docker-compose up
```

## API Endpoints

### Health Check

```http
GET /health
```

### Search Regulations

```http
POST /v1/regulations/search
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "query": "What are the requirements for customer data protection?",
  "domain": "banking",
  "top_k": 5,
  "min_quality_score": 0.8
}
```

### Get Regulation Domains

```http
GET /v1/regulations/domains
Authorization: Bearer <api_key>
```

### Get Regulation by ID

```http
GET /v1/regulations/{regulation_id}
Authorization: Bearer <api_key>
```

### Clear Cache (Admin)

```http
DELETE /v1/admin/cache/clear
Authorization: Bearer <api_key>
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | `nprocess` |
| `VERTEX_AI_SEARCH_LOCATION` | Vertex AI Search location | `global` |
| `VERTEX_AI_DATA_STORE_ID` | Data store ID | `regulations-datastore` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `CACHE_ENABLED` | Enable caching | `true` |

## Vertex AI Search Setup

### 1. Create Data Store

```bash
# Create a data store in Vertex AI Search
gcloud alpha discovery-engine data-stores create regulations-datastore \
    --location=global \
    --collection=default_collection \
    --industry-vertical=GENERIC
```

### 2. Import Documents

```bash
# Import regulatory documents to the data store
gcloud alpha discovery-engine documents import \
    --data-store=regulations-datastore \
    --location=global \
    --gcs-uri=gs://your-bucket/regulations/*.json
```

### 3. Create Search App

```bash
# Create a search application
gcloud alpha discovery-engine apps create regulations-app \
    --data-store=regulations-datastore \
    --location=global \
    --display-name="Regulations Search"
```

## Testing

### Run Tests

```bash
pytest
```

### Run with Coverage

```bash
pytest --cov=app --cov-report=html
```

### Manual Testing

```bash
# Test search endpoint
curl -X POST http://localhost:8001/v1/regulations/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_key" \
  -d '{
    "query": "data protection requirements",
    "domain": "banking",
    "top_k": 3
  }'
```

## Deployment

### Cloud Run Deployment

```bash
# Build and deploy to Cloud Run
gcloud run deploy regulatory-rag-api \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars GCP_PROJECT_ID=nprocess,REDIS_HOST=your-redis-host
```

### Environment-Specific Configurations

- **Development**: Use local Redis, verbose logging
- **Staging**: Use Cloud Memorystore, moderate logging
- **Production**: Use Cloud Memorystore with replication, minimal logging

## Performance

### Caching Strategy

- **Cache TTL**: 1 hour for search results
- **Cache TTL**: 24 hours for individual regulations
- **Cache Key**: MD5 hash of query + filters

### Expected Performance

- **Cold Start** (no cache): 200-500ms
- **Warm Cache**: 10-30ms
- **Throughput**: 1000+ req/sec (with caching)

## Monitoring

### Health Endpoint

Monitor service health:
```bash
curl http://localhost:8001/health
```

### Cache Statistics

Get cache stats via admin endpoints (add in production):
```bash
curl http://localhost:8001/v1/admin/cache/stats
```

## Security

- **API Key Authentication**: All endpoints require valid API key
- **CORS**: Configure allowed origins in production
- **Rate Limiting**: Implement in Cloud Run or API Gateway
- **Data Encryption**: Enable in-transit and at-rest encryption

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, contact the ComplianceEngine team.
