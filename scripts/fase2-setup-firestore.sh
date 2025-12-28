#!/bin/bash

# Fase 2: Script para criar Firestore database de produção
# Usage: ./scripts/fase2-setup-firestore.sh

set -e

PROJECT_ID="nprocess-prod"
LOCATION="us-central1"
DATABASE_ID="(default)"

echo "🔥 Criando Firestore database de produção..."
echo "Projeto: $PROJECT_ID"
echo "Location: $LOCATION"
echo ""

# Verificar se o database já existe
if gcloud firestore databases describe --database="$DATABASE_ID" --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Firestore database já existe. Verificando configuração..."
    gcloud firestore databases describe --database="$DATABASE_ID" --project="$PROJECT_ID"
else
    echo "📦 Criando Firestore database (native mode)..."
    gcloud firestore databases create \
        --location="$LOCATION" \
        --type=firestore-native \
        --project="$PROJECT_ID" \
        --quiet

    echo "✅ Firestore database criado com sucesso!"
fi

echo ""
echo "✅ Firestore configurado!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Deploy Security Rules:"
echo "      firebase deploy --only firestore:rules --project=$PROJECT_ID"
echo "   2. Criar indexes (se necessário):"
echo "      firebase deploy --only firestore:indexes --project=$PROJECT_ID"
echo ""

