#!/bin/bash

# Fase 2: Script para configurar IAM roles e permissões
# Usage: ./scripts/fase2-setup-iam.sh

set -e

PROJECT_ID="nprocess-prod"
API_SA="nprocess-api-prod@$PROJECT_ID.iam.gserviceaccount.com"
ADMIN_SA="nprocess-admin-prod@$PROJECT_ID.iam.gserviceaccount.com"

echo "🔐 Configurando IAM roles e permissões..."
echo "Projeto: $PROJECT_ID"
echo ""

# Roles para API Service Account
echo "📦 Configurando permissões para API Service Account..."

# Cloud SQL Client (para conectar ao banco)
echo "   → Cloud SQL Client"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$API_SA" \
    --role="roles/cloudsql.client" \
    --condition=None \
    --quiet

# Secret Manager Secret Accessor (para ler secrets)
echo "   → Secret Manager Secret Accessor"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$API_SA" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None \
    --quiet

# Firestore User (para ler/escrever no Firestore)
echo "   → Firestore User"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$API_SA" \
    --role="roles/datastore.user" \
    --condition=None \
    --quiet

# Storage Object User (para ler/escrever no Cloud Storage)
echo "   → Storage Object User"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$API_SA" \
    --role="roles/storage.objectUser" \
    --condition=None \
    --quiet

# Vertex AI User (para usar Gemini)
echo "   → Vertex AI User"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$API_SA" \
    --role="roles/aiplatform.user" \
    --condition=None \
    --quiet

# Roles para Admin Service Account
echo ""
echo "📦 Configurando permissões para Admin Service Account..."

# Cloud SQL Client
echo "   → Cloud SQL Client"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$ADMIN_SA" \
    --role="roles/cloudsql.client" \
    --condition=None \
    --quiet

# Secret Manager Secret Accessor
echo "   → Secret Manager Secret Accessor"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$ADMIN_SA" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None \
    --quiet

# Firestore User
echo "   → Firestore User"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$ADMIN_SA" \
    --role="roles/datastore.user" \
    --condition=None \
    --quiet

# Storage Object User
echo "   → Storage Object User"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$ADMIN_SA" \
    --role="roles/storage.objectUser" \
    --condition=None \
    --quiet

# Logging Writer (para escrever logs)
echo "   → Logging Writer"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$ADMIN_SA" \
    --role="roles/logging.logWriter" \
    --condition=None \
    --quiet

# Monitoring Metric Writer (para métricas)
echo "   → Monitoring Metric Writer"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$ADMIN_SA" \
    --role="roles/monitoring.metricWriter" \
    --condition=None \
    --quiet

echo ""
echo "✅ IAM roles configurados com sucesso!"
echo ""
echo "📋 Permissões atribuídas:"
echo ""
echo "API Service Account ($API_SA):"
echo "   - Cloud SQL Client"
echo "   - Secret Manager Secret Accessor"
echo "   - Firestore User"
echo "   - Storage Object User"
echo "   - Vertex AI User"
echo ""
echo "Admin Service Account ($ADMIN_SA):"
echo "   - Cloud SQL Client"
echo "   - Secret Manager Secret Accessor"
echo "   - Firestore User"
echo "   - Storage Object User"
echo "   - Logging Writer"
echo "   - Monitoring Metric Writer"
echo ""

