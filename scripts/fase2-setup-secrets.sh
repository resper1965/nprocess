#!/bin/bash

# Fase 2: Script para criar secrets no Secret Manager
# Usage: ./scripts/fase2-setup-secrets.sh
# 
# NOTA: Este script cria os secrets, mas você precisa fornecer os valores
# Para secrets sensíveis, use interação manual ou variáveis de ambiente

set -e

PROJECT_ID="nprocess-prod"

echo "🔐 Criando secrets no Secret Manager..."
echo "Projeto: $PROJECT_ID"
echo ""

# Função para criar ou atualizar secret
create_or_update_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    local DESCRIPTION=$3

    if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" &>/dev/null; then
        echo "⚠️  Secret $SECRET_NAME já existe. Atualizando..."
        echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" \
            --data-file=- \
            --project="$PROJECT_ID" \
            --quiet
    else
        echo "📦 Criando secret: $SECRET_NAME"
        echo -n "$SECRET_VALUE" | gcloud secrets create "$SECRET_NAME" \
            --data-file=- \
            --replication-policy="automatic" \
            --project="$PROJECT_ID" \
            --quiet
    fi

    # Adicionar descrição se fornecida
    if [ -n "$DESCRIPTION" ]; then
        gcloud secrets update "$SECRET_NAME" \
            --update-labels="description=$DESCRIPTION" \
            --project="$PROJECT_ID" \
            --quiet 2>/dev/null || true
    fi

    echo "✅ Secret $SECRET_NAME criado/atualizado!"
}

# Verificar se a senha do banco já existe (deve ter sido criada no script anterior)
echo "📋 Secrets a serem criados:"
echo "   1. nprocess-db-password-prod (senha do Cloud SQL)"
echo "   2. nprocess-gemini-api-key (GEMINI_API_KEY)"
echo "   3. nprocess-firebase-admin-sdk (Firebase Admin SDK JSON)"
echo ""

# Secret 1: Senha do banco (se não existir, gerar uma)
if ! gcloud secrets describe nprocess-db-password-prod --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Secret nprocess-db-password-prod não encontrado."
    echo "   Execute primeiro: ./scripts/fase2-setup-cloud-sql.sh"
    echo "   Ou crie manualmente com a senha do banco."
    read -p "   Deseja criar agora com senha gerada? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        create_or_update_secret "nprocess-db-password-prod" "$DB_PASSWORD" "Senha do Cloud SQL database"
        echo "   Senha gerada: $DB_PASSWORD"
    fi
else
    echo "✅ Secret nprocess-db-password-prod já existe."
fi

# Secret 2: GEMINI_API_KEY
if ! gcloud secrets describe nprocess-gemini-api-key --project="$PROJECT_ID" &>/dev/null; then
    echo ""
    echo "📝 GEMINI_API_KEY:"
    read -p "   Forneça a GEMINI_API_KEY (ou pressione Enter para pular): " GEMINI_KEY
    if [ -n "$GEMINI_KEY" ]; then
        create_or_update_secret "nprocess-gemini-api-key" "$GEMINI_KEY" "API Key do Google Gemini (Vertex AI)"
    else
        echo "   ⚠️  Pulando criação de nprocess-gemini-api-key"
    fi
else
    echo "✅ Secret nprocess-gemini-api-key já existe."
fi

# Secret 3: Firebase Admin SDK
if ! gcloud secrets describe nprocess-firebase-admin-sdk --project="$PROJECT_ID" &>/dev/null; then
    echo ""
    echo "📝 Firebase Admin SDK JSON:"
    read -p "   Forneça o caminho do arquivo JSON do Firebase Admin SDK (ou pressione Enter para pular): " FIREBASE_JSON_PATH
    if [ -n "$FIREBASE_JSON_PATH" ] && [ -f "$FIREBASE_JSON_PATH" ]; then
        create_or_update_secret "nprocess-firebase-admin-sdk" "$(cat "$FIREBASE_JSON_PATH")" "Firebase Admin SDK credentials JSON"
    else
        echo "   ⚠️  Pulando criação de nprocess-firebase-admin-sdk"
        echo "   Você pode criar depois com:"
        echo "   gcloud secrets create nprocess-firebase-admin-sdk \\"
        echo "     --data-file=path/to/firebase-admin-sdk.json \\"
        echo "     --replication-policy=automatic \\"
        echo "     --project=$PROJECT_ID"
    fi
else
    echo "✅ Secret nprocess-firebase-admin-sdk já existe."
fi

echo ""
echo "✅ Secrets configurados!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Verificar todos os secrets criados:"
echo "      gcloud secrets list --project=$PROJECT_ID"
echo "   2. Adicionar permissões de acesso aos Service Accounts:"
echo "      gcloud secrets add-iam-policy-binding SECRET_NAME \\"
echo "        --member='serviceAccount:SERVICE_ACCOUNT' \\"
echo "        --role='roles/secretmanager.secretAccessor' \\"
echo "        --project=$PROJECT_ID"
echo ""

