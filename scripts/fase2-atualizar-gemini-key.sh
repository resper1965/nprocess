#!/bin/bash

# Fase 2: Script para atualizar a GEMINI_API_KEY no Secret Manager
# Usage: ./scripts/fase2-atualizar-gemini-key.sh [API_KEY]
# Se API_KEY não for fornecida, solicita ao usuário

set -e

PROJECT_ID="nprocess-prod"
SECRET_NAME="nprocess-gemini-api-key"

echo "🔑 Atualizando GEMINI_API_KEY no Secret Manager..."
echo "Projeto: $PROJECT_ID"
echo ""

# Verificar se a chave foi fornecida como argumento
if [ -n "$1" ]; then
    API_KEY="$1"
    echo "📝 Usando chave fornecida como argumento..."
else
    # Solicitar a chave ao usuário
    echo "📝 Por favor, forneça a GEMINI_API_KEY:"
    echo "   (Você pode obtê-la em: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID)"
    read -s API_KEY
    echo ""
fi

if [ -z "$API_KEY" ]; then
    echo "❌ Erro: API Key não fornecida."
    exit 1
fi

# Atualizar o secret
echo "📦 Atualizando secret $SECRET_NAME..."
echo -n "$API_KEY" | gcloud secrets versions add "$SECRET_NAME" \
    --data-file=- \
    --project="$PROJECT_ID" \
    --quiet

echo ""
echo "✅ Secret atualizado com sucesso!"
echo ""
echo "📋 Para verificar:"
echo "   gcloud secrets versions access latest --secret=$SECRET_NAME --project=$PROJECT_ID"
echo ""

