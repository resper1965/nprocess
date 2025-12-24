#!/bin/bash
# Script para configurar Google OAuth no Secret Manager
# Uso: ./scripts/setup-google-oauth.sh <CLIENT_ID> <CLIENT_SECRET>

set -e

PROJECT_ID="nprocess"
PROJECT_NUMBER="273624403528"

if [ $# -lt 2 ]; then
  echo "❌ Erro: Forneça Client ID e Client Secret"
  echo ""
  echo "Uso:"
  echo "  ./scripts/setup-google-oauth.sh <CLIENT_ID> <CLIENT_SECRET>"
  echo ""
  echo "Exemplo:"
  echo "  ./scripts/setup-google-oauth.sh 123456789.apps.googleusercontent.com abc123xyz"
  exit 1
fi

CLIENT_ID=$1
CLIENT_SECRET=$2

echo "🔐 Configurando Google OAuth no Secret Manager..."
echo ""

# Criar ou atualizar secrets
echo "📝 Criando/atualizando google-client-id..."
echo -n "$CLIENT_ID" | gcloud secrets create google-client-id \
  --data-file=- \
  --project=$PROJECT_ID 2>/dev/null || \
  echo -n "$CLIENT_ID" | gcloud secrets versions add google-client-id \
  --data-file=- \
  --project=$PROJECT_ID

echo "📝 Criando/atualizando google-client-secret..."
echo -n "$CLIENT_SECRET" | gcloud secrets create google-client-secret \
  --data-file=- \
  --project=$PROJECT_ID 2>/dev/null || \
  echo -n "$CLIENT_SECRET" | gcloud secrets versions add google-client-secret \
  --data-file=- \
  --project=$PROJECT_ID

# Configurar permissões IAM
echo ""
echo "🔑 Configurando permissões IAM..."

gcloud secrets add-iam-policy-binding google-client-id \
  --project=$PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" 2>/dev/null || echo "Permissão já existe para google-client-id"

gcloud secrets add-iam-policy-binding google-client-secret \
  --project=$PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" 2>/dev/null || echo "Permissão já existe para google-client-secret"

# Verificar
echo ""
echo "✅ Verificando secrets criados..."
gcloud secrets list --project=$PROJECT_ID | grep google

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure OAuth no Google Console: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "2. Adicione as URIs de redirecionamento:"
echo "   - https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app/api/auth/callback/google"
echo "   - http://localhost:3000/api/auth/callback/google (para desenvolvimento)"
echo "3. Faça um novo deploy do Admin Dashboard"


