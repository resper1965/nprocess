#!/bin/bash

# Fase 1: Habilitar APIs Necessárias para Produção
# Usage: ./scripts/fase1-habilitar-apis.sh

set -e

PROJECT_ID="nprocess-prod"

echo "🚀 Habilitando APIs necessárias para produção..."
echo "Projeto: $PROJECT_ID"
echo ""

# Lista de APIs necessárias
APIS=(
  "run.googleapis.com"                    # Cloud Run
  "cloudbuild.googleapis.com"             # Cloud Build
  "artifactregistry.googleapis.com"       # Artifact Registry
  "aiplatform.googleapis.com"             # Vertex AI
  "firestore.googleapis.com"             # Firestore
  "storage.googleapis.com"                # Cloud Storage
  "secretmanager.googleapis.com"          # Secret Manager
  "logging.googleapis.com"                # Cloud Logging
  "monitoring.googleapis.com"             # Cloud Monitoring
  "sqladmin.googleapis.com"               # Cloud SQL Admin
  "billingbudgets.googleapis.com"         # Billing Budgets
  "cloudresourcemanager.googleapis.com"  # Cloud Resource Manager
  "servicenetworking.googleapis.com"      # Service Networking
  "vpcaccess.googleapis.com"               # VPC Access
  "compute.googleapis.com"                # Compute Engine (para VPC)
  "iam.googleapis.com"                    # Identity and Access Management
  "firebase.googleapis.com"                # Firebase
  "firebasehosting.googleapis.com"        # Firebase Hosting
)

echo "📋 APIs a habilitar:"
for api in "${APIS[@]}"; do
  echo "  - $api"
done
echo ""

# Habilitar APIs
echo "⏳ Habilitando APIs..."
for api in "${APIS[@]}"; do
  echo "  Habilitando $api..."
  gcloud services enable "$api" --project="$PROJECT_ID" 2>&1 | grep -v "already enabled" || true
done

echo ""
echo "✅ APIs habilitadas com sucesso!"
echo ""
echo "📊 Verificando APIs habilitadas..."
gcloud services list --enabled --project="$PROJECT_ID" --format="table(serviceName,serviceConfig.title)" | head -20

echo ""
echo "✅ Fase 1 - Habilitar APIs: CONCLUÍDA"

