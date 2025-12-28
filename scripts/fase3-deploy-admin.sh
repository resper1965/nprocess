#!/bin/bash

# Fase 3: Script para fazer deploy do Admin Control Plane no Cloud Run
# Usage: ./scripts/fase3-deploy-admin.sh
# Usa Cloud Build para build automático (não requer Docker local)

set -e

PROJECT_ID="nprocess-prod"
REGION="us-central1"
SERVICE_NAME="nprocess-admin-api-prod"
SERVICE_ACCOUNT="nprocess-admin-prod@$PROJECT_ID.iam.gserviceaccount.com"
DB_INSTANCE="nprocess-db-prod"
DB_CONNECTION_NAME="$PROJECT_ID:$REGION:$DB_INSTANCE"

echo "🚀 Deployando Admin Control Plane..."
echo "Projeto: $PROJECT_ID"
echo "Serviço: $SERVICE_NAME"
echo ""

# Obter senha do banco do Secret Manager
echo "🔐 Obtendo senha do banco..."
DB_PASSWORD=$(gcloud secrets versions access latest \
    --secret=nprocess-db-password-prod \
    --project="$PROJECT_ID")

# Construir DATABASE_URL (usando Unix socket para Cloud SQL)
DATABASE_URL="postgresql://nprocess_admin:$DB_PASSWORD@/nprocess?host=/cloudsql/$DB_CONNECTION_NAME"

# Deploy usando --source (Cloud Build faz o build automaticamente)
echo "🔨 Fazendo build e deploy (via Cloud Build)..."
gcloud run deploy "$SERVICE_NAME" \
    --source=./admin-control-plane \
    --platform=managed \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --service-account="$SERVICE_ACCOUNT" \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1 \
    --timeout=300 \
    --concurrency=80 \
    --max-instances=5 \
    --min-instances=0 \
    --add-cloudsql-instances="$DB_CONNECTION_NAME" \
    --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,APP_ENV=production,DATABASE_URL=$DATABASE_URL,ALLOWED_ORIGINS=https://nprocess.ness.com.br,API_V1_PREFIX=/v1" \
    --update-secrets="DATABASE_PASSWORD=nprocess-db-password-prod:latest,FIREBASE_ADMIN_SDK=nprocess-firebase-admin-sdk:latest" \
    --quiet

# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.url)")

echo ""
echo "✅ Admin Control Plane deployado com sucesso!"
echo ""
echo "📋 Informações:"
echo "   Serviço: $SERVICE_NAME"
echo "   URL: $SERVICE_URL"
echo "   Health Check: $SERVICE_URL/health"
echo "   Docs: $SERVICE_URL/docs"
echo ""

