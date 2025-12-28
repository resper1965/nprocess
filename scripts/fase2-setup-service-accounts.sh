#!/bin/bash

# Fase 2: Script para criar Service Accounts de produção
# Usage: ./scripts/fase2-setup-service-accounts.sh

set -e

PROJECT_ID="nprocess-prod"
API_SA="nprocess-api-prod"
ADMIN_SA="nprocess-admin-prod"

echo "🔐 Criando Service Accounts de produção..."
echo "Projeto: $PROJECT_ID"
echo ""

# Criar Service Account para API
echo "📦 Criando Service Account para API: $API_SA"
if gcloud iam service-accounts describe "$API_SA@$PROJECT_ID.iam.gserviceaccount.com" --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Service Account $API_SA já existe. Pulando criação..."
else
    gcloud iam service-accounts create "$API_SA" \
        --display-name="n.process API Production" \
        --description="Service Account para n.process API em produção" \
        --project="$PROJECT_ID" \
        --quiet
    echo "✅ Service Account $API_SA criado!"
fi

# Criar Service Account para Admin
echo "📦 Criando Service Account para Admin: $ADMIN_SA"
if gcloud iam service-accounts describe "$ADMIN_SA@$PROJECT_ID.iam.gserviceaccount.com" --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Service Account $ADMIN_SA já existe. Pulando criação..."
else
    gcloud iam service-accounts create "$ADMIN_SA" \
        --display-name="n.process Admin Production" \
        --description="Service Account para Admin Control Plane em produção" \
        --project="$PROJECT_ID" \
        --quiet
    echo "✅ Service Account $ADMIN_SA criado!"
fi

echo ""
echo "✅ Service Accounts criados com sucesso!"
echo ""
echo "📋 Service Accounts:"
echo "   API: $API_SA@$PROJECT_ID.iam.gserviceaccount.com"
echo "   Admin: $ADMIN_SA@$PROJECT_ID.iam.gserviceaccount.com"
echo ""
echo "⚠️  PRÓXIMO PASSO: Configurar IAM roles e permissões"
echo "   Ver: scripts/fase2-setup-iam.sh"
echo ""

