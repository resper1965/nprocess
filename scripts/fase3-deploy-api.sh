#!/bin/bash

# Fase 3: Script para fazer deploy do n.process API no Cloud Run
# Usage: ./scripts/fase3-deploy-api.sh
# Usa Cloud Build para build automático (não requer Docker local)

set -e

PROJECT_ID="nprocess-prod"
REGION="us-central1"
SERVICE_NAME="nprocess-api-prod"
SERVICE_ACCOUNT="nprocess-api-prod@$PROJECT_ID.iam.gserviceaccount.com"

echo "🚀 Deployando n.process API..."
echo "Projeto: $PROJECT_ID"
echo "Serviço: $SERVICE_NAME"
echo ""

# Deploy usando --source (Cloud Build faz o build automaticamente)
echo "🔨 Fazendo build e deploy (via Cloud Build)..."
gcloud run deploy "$SERVICE_NAME" \
    --source=. \
    --platform=managed \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --service-account="$SERVICE_ACCOUNT" \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1 \
    --timeout=300 \
    --concurrency=80 \
    --max-instances=10 \
    --min-instances=0 \
    --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,APP_ENV=production,VERTEX_AI_LOCATION=$REGION,VERTEX_AI_MODEL=gemini-1.5-pro-002,FIRESTORE_DATABASE=(default),LOG_LEVEL=INFO,CORS_ORIGINS=https://nprocess.ness.com.br" \
    --update-secrets="GEMINI_API_KEY=nprocess-gemini-api-key:latest" \
    --quiet

# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.url)")

echo ""
echo "✅ n.process API deployado com sucesso!"
echo ""
echo "📋 Informações:"
echo "   Serviço: $SERVICE_NAME"
echo "   URL: $SERVICE_URL"
echo "   Health Check: $SERVICE_URL/health"
echo "   Docs: $SERVICE_URL/docs"
echo ""

