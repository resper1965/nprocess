# Deployment Guide - ComplianceEngine Platform

Complete guide for deploying the ComplianceEngine Platform to Google Cloud Run.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Setup Google Cloud](#setup-google-cloud)
- [Deploy Services](#deploy-services)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (gcloud CLI)
- Docker (for local testing)
- Node.js 20+ (for dashboard development)
- Python 3.11+ (for API development)

### Google Cloud Setup

1. **Create GCP Project**:
   ```bash
   gcloud projects create nprocess --name="ComplianceEngine Platform"
   gcloud config set project nprocess
   ```

2. **Enable Billing**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable billing for the project

3. **Enable Required APIs**:
   ```bash
   gcloud services enable \
       run.googleapis.com \
       artifactregistry.googleapis.com \
       cloudbuild.googleapis.com \
       firestore.googleapis.com \
       aiplatform.googleapis.com \
       discoveryengine.googleapis.com \
       redis.googleapis.com
   ```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloud Run Services                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  Admin Dashboard │    │ ComplianceEngine │              │
│  │    (Next.js)     │───▶│       API        │              │
│  │   Port: 8080     │    │   (FastAPI)      │              │
│  └──────────────────┘    └────────┬─────────┘              │
│                                   │                         │
│                                   ▼                         │
│                          ┌──────────────────┐               │
│                          │ RegulatoryRAG    │               │
│                          │      API         │               │
│                          │   (FastAPI)      │               │
│                          └────────┬─────────┘               │
│                                   │                         │
└───────────────────────────────────┼─────────────────────────┘
                                    │
                    ┌───────────────┴──────────────┐
                    │                              │
                    ▼                              ▼
          ┌──────────────────┐         ┌──────────────────┐
          │   Firestore      │         │  Vertex AI       │
          │   (Database)     │         │  - Gemini 1.5    │
          └──────────────────┘         │  - Search        │
                                       └──────────────────┘
```

## Deploy Services

### Option 1: Deploy All Services (Automated)

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy all services
./deploy.sh all
```

### Option 2: Deploy Individual Services

#### 1. Deploy ComplianceEngine API

```bash
# From project root
gcloud run deploy compliance-engine-api \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "GCP_PROJECT_ID=nprocess" \
    --set-env-vars "FIRESTORE_DATABASE=(default)" \
    --set-env-vars "VERTEX_AI_LOCATION=us-central1" \
    --set-env-vars "VERTEX_AI_MODEL=gemini-1.5-pro-002"

# Get service URL
COMPLIANCE_URL=$(gcloud run services describe compliance-engine-api --region=us-central1 --format='value(status.url)')
echo "ComplianceEngine API: $COMPLIANCE_URL"
```

#### 2. Deploy RegulatoryRAG API

```bash
# From regulatory-rag-api directory
cd regulatory-rag-api

gcloud run deploy regulatory-rag-api \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "GCP_PROJECT_ID=nprocess" \
    --set-env-vars "VERTEX_AI_SEARCH_LOCATION=global" \
    --set-env-vars "VERTEX_AI_DATA_STORE_ID=regulations-datastore" \
    --set-env-vars "CACHE_ENABLED=true"

cd ..

# Get service URL
RAG_URL=$(gcloud run services describe regulatory-rag-api --region=us-central1 --format='value(status.url)')
echo "RegulatoryRAG API: $RAG_URL"
```

#### 3. Deploy Admin Dashboard

```bash
# From admin-dashboard directory
cd admin-dashboard

# Build environment variables
COMPLIANCE_URL=$(gcloud run services describe compliance-engine-api --region=us-central1 --format='value(status.url)')
RAG_URL=$(gcloud run services describe regulatory-rag-api --region=us-central1 --format='value(status.url)')

gcloud run deploy compliance-admin-dashboard \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --timeout 60 \
    --concurrency 80 \
    --min-instances 0 \
    --max-instances 5 \
    --set-env-vars "NEXT_PUBLIC_COMPLIANCE_API_URL=$COMPLIANCE_URL" \
    --set-env-vars "NEXT_PUBLIC_RAG_API_URL=$RAG_URL"

cd ..

# Get service URL
DASHBOARD_URL=$(gcloud run services describe compliance-admin-dashboard --region=us-central1 --format='value(status.url)')
echo "Admin Dashboard: $DASHBOARD_URL"
```

## Configuration

### Environment Variables

#### ComplianceEngine API

| Variable | Description | Default |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | `nprocess` |
| `FIRESTORE_DATABASE` | Firestore database name | `(default)` |
| `VERTEX_AI_LOCATION` | Vertex AI region | `us-central1` |
| `VERTEX_AI_MODEL` | Gemini model name | `gemini-1.5-pro-002` |

#### RegulatoryRAG API

| Variable | Description | Default |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | `nprocess` |
| `VERTEX_AI_SEARCH_LOCATION` | Search location | `global` |
| `VERTEX_AI_DATA_STORE_ID` | Data store ID | `regulations-datastore` |
| `CACHE_ENABLED` | Enable Redis cache | `true` |
| `REDIS_HOST` | Redis host | Cloud Memorystore IP |

#### Admin Dashboard

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_COMPLIANCE_API_URL` | ComplianceEngine API URL | `https://xxx.run.app` |
| `NEXT_PUBLIC_RAG_API_URL` | RegulatoryRAG API URL | `https://xxx.run.app` |
| `NEXTAUTH_URL` | Dashboard URL | `https://xxx.run.app` |
| `NEXTAUTH_SECRET` | NextAuth secret | Generate with `openssl rand -base64 32` |

### Setting Up Firestore

```bash
# Create Firestore database (if not exists)
gcloud firestore databases create --location=us-central1

# Create indexes (if needed)
gcloud firestore indexes composite create \
    --collection-group=processes \
    --field-config field-path=created_at,order=descending \
    --field-config field-path=category,order=ascending
```

### Setting Up Vertex AI Search

```bash
# Create data store
gcloud alpha discovery-engine data-stores create regulations-datastore \
    --location=global \
    --collection=default_collection \
    --industry-vertical=GENERIC

# Import regulatory documents
gcloud alpha discovery-engine documents import \
    --data-store=regulations-datastore \
    --location=global \
    --gcs-uri=gs://your-bucket/regulations/*.json
```

### Setting Up Redis (Optional)

```bash
# Create Cloud Memorystore instance
gcloud redis instances create regulatory-cache \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_7_0

# Get Redis host
REDIS_HOST=$(gcloud redis instances describe regulatory-cache --region=us-central1 --format='value(host)')

# Update RegulatoryRAG deployment with Redis host
gcloud run services update regulatory-rag-api \
    --region us-central1 \
    --set-env-vars "REDIS_HOST=$REDIS_HOST"
```

## Monitoring

### Cloud Run Metrics

View metrics in Cloud Console:
- **Latency**: P50, P95, P99 response times
- **Request Count**: Total requests per minute
- **Error Rate**: 4xx and 5xx errors
- **Instance Count**: Active instances
- **CPU/Memory**: Resource utilization

### Logging

```bash
# View logs for ComplianceEngine API
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=compliance-engine-api" --limit 50

# View logs for RegulatoryRAG API
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=regulatory-rag-api" --limit 50

# View logs for Admin Dashboard
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=compliance-admin-dashboard" --limit 50
```

### Alerts

Set up alerting policies:

```bash
# Example: Alert on high error rate
gcloud alpha monitoring policies create \
    --notification-channels=CHANNEL_ID \
    --display-name="High Error Rate - ComplianceEngine API" \
    --condition-display-name="Error rate > 5%" \
    --condition-threshold-value=0.05 \
    --condition-threshold-duration=300s
```

## Custom Domains (Optional)

### Map custom domain to services:

```bash
# Map domain to ComplianceEngine API
gcloud run services update compliance-engine-api \
    --region us-central1 \
    --add-domain api.complianceengine.com

# Map domain to Admin Dashboard
gcloud run services update compliance-admin-dashboard \
    --region us-central1 \
    --add-domain admin.complianceengine.com
```

## Security

### Service-to-Service Authentication

```bash
# Create service account for internal communication
gcloud iam service-accounts create compliance-internal \
    --display-name="ComplianceEngine Internal Service Account"

# Grant Cloud Run Invoker role
gcloud run services add-iam-policy-binding regulatory-rag-api \
    --region=us-central1 \
    --member="serviceAccount:compliance-internal@nprocess.iam.gserviceaccount.com" \
    --role="roles/run.invoker"
```

### API Key Management

API keys are managed through the ComplianceEngine API. See `app/services/apikey_service.py` for implementation.

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check logs
gcloud logs read "resource.type=cloud_run_revision" --limit 100

# Check build logs
gcloud builds list --limit 10
```

#### 2. Permission Denied

```bash
# Grant necessary permissions
gcloud projects add-iam-policy-binding nprocess \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/aiplatform.user"
```

#### 3. Firestore Connection Issues

```bash
# Verify Firestore is enabled
gcloud firestore databases list

# Check IAM permissions
gcloud projects get-iam-policy nprocess
```

#### 4. High Latency

- Check if cold starts are occurring (increase min-instances)
- Verify Vertex AI quotas
- Check Redis connection (if enabled)
- Review application logs for slow queries

### Health Checks

```bash
# Check ComplianceEngine API health
curl https://compliance-engine-api-xxx.run.app/health

# Check RegulatoryRAG API health
curl https://regulatory-rag-api-xxx.run.app/health

# Check Admin Dashboard health
curl https://compliance-admin-dashboard-xxx.run.app/api/health
```

## Cost Optimization

### Recommendations

1. **Min Instances**: Set to 0 for development, 1+ for production
2. **Max Instances**: Limit based on expected traffic
3. **CPU Allocation**: Use "CPU is only allocated during request processing"
4. **Memory**: Right-size based on actual usage
5. **Caching**: Enable Redis to reduce Vertex AI API calls

### Estimated Monthly Costs

- **ComplianceEngine API**: $50-200/month (depends on traffic)
- **RegulatoryRAG API**: $30-150/month
- **Admin Dashboard**: $10-50/month
- **Firestore**: $1-25/month (depends on reads/writes)
- **Vertex AI**: Variable (pay per request)
- **Cloud Memorystore**: $45/month (1GB instance)

**Total Estimated**: $136-470/month for moderate usage

## Rollback

If deployment fails or issues arise:

```bash
# Rollback to previous revision
gcloud run services update-traffic compliance-engine-api \
    --to-revisions PREVIOUS_REVISION=100 \
    --region us-central1
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS }}

      - name: Deploy to Cloud Run
        run: ./deploy.sh all
```

## Support

For issues or questions:
- Check logs using commands above
- Review [Google Cloud Run documentation](https://cloud.google.com/run/docs)
- Contact the ComplianceEngine team
