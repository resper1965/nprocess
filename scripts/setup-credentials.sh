#!/bin/bash
# Script para configurar credenciais do Admin Dashboard

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nprocess}"
PROJECT_NUMBER="273624403528"

echo "🔐 Configurando Credenciais do Admin Dashboard"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Escolha o método de autenticação:"
echo "1) Google OAuth (Recomendado para produção)"
echo "2) Credenciais Mock (Apenas desenvolvimento)"
echo ""
read -p "Opção [1-2]: " option

case $option in
  1)
    echo ""
    echo "${YELLOW}=== Configuração Google OAuth ===${NC}"
    echo ""
    echo "1. Acesse: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
    echo "2. Crie um OAuth 2.0 Client ID"
    echo "3. Configure os redirect URIs:"
    echo "   - https://nprocess.ness.com.br/api/auth/callback/google"
    echo "   - https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app/api/auth/callback/google"
    echo ""
    read -p "Client ID: " CLIENT_ID
    read -sp "Client Secret: " CLIENT_SECRET
    echo ""
    
    if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
      echo "❌ Client ID e Client Secret são obrigatórios"
      exit 1
    fi
    
    echo ""
    echo "📦 Criando secrets no Secret Manager..."
    
    # Criar google-client-id
    if gcloud secrets describe google-client-id --project=$PROJECT_ID &>/dev/null; then
      echo "Secret google-client-id já existe. Atualizando..."
      echo -n "$CLIENT_ID" | gcloud secrets versions add google-client-id \
        --data-file=- \
        --project=$PROJECT_ID
    else
      echo -n "$CLIENT_ID" | gcloud secrets create google-client-id \
        --data-file=- \
        --project=$PROJECT_ID \
        --replication-policy="automatic"
    fi
    
    # Criar google-client-secret
    if gcloud secrets describe google-client-secret --project=$PROJECT_ID &>/dev/null; then
      echo "Secret google-client-secret já existe. Atualizando..."
      echo -n "$CLIENT_SECRET" | gcloud secrets versions add google-client-secret \
        --data-file=- \
        --project=$PROJECT_ID
    else
      echo -n "$CLIENT_SECRET" | gcloud secrets create google-client-secret \
        --data-file=- \
        --project=$PROJECT_ID \
        --replication-policy="automatic"
    fi
    
    echo ""
    echo "🔑 Configurando permissões IAM..."
    
    gcloud secrets add-iam-policy-binding google-client-id \
      --project=$PROJECT_ID \
      --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor" \
      --quiet || true
    
    gcloud secrets add-iam-policy-binding google-client-secret \
      --project=$PROJECT_ID \
      --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor" \
      --quiet || true
    
    echo ""
    echo "${GREEN}✅ Google OAuth configurado com sucesso!${NC}"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. Atualize o cloudbuild.yaml para incluir os secrets"
    echo "2. Faça um novo deploy do Admin Dashboard"
    echo "3. Teste o login com Google OAuth"
    ;;
    
  2)
    echo ""
    echo "${YELLOW}=== Configuração Credenciais Mock ===${NC}"
    echo ""
    echo "Para modificar credenciais mock:"
    echo "1. Edite: admin-dashboard/src/app/api/auth/[...nextauth]/route.ts"
    echo "2. Modifique o array mockUsers"
    echo "3. Gere hash bcrypt da senha:"
    echo "   node -e \"const bcrypt = require('bcryptjs'); bcrypt.hash('sua-senha', 12).then(h => console.log(h))\""
    echo "4. Faça commit e deploy"
    echo ""
    echo "⚠️  ATENÇÃO: Credenciais mock são apenas para desenvolvimento!"
    ;;
    
  *)
    echo "❌ Opção inválida"
    exit 1
    ;;
esac

echo ""
echo "✅ Configuração concluída!"

