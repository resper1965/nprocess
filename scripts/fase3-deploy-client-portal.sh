#!/bin/bash

# Fase 3: Script para fazer deploy do Client Portal no Firebase Hosting
# Usage: ./scripts/fase3-deploy-client-portal.sh

set -e

FIREBASE_PROJECT_ID="nprocess-8e801"  # Projeto Firebase (nProcess)
FIREBASE_SITE_ID="nprocess-8e801"  # Site ID do Firebase Hosting
GCP_PROJECT_ID="nprocess-prod"  # Projeto GCP de produção
API_URL=""  # Será obtida após deploy da API
ADMIN_API_URL=""  # Será obtida após deploy do Admin

echo "🚀 Deployando Client Portal..."
echo "Firebase Projeto: $FIREBASE_PROJECT_ID"
echo "Firebase Site: $FIREBASE_SITE_ID"
echo "GCP Projeto: $GCP_PROJECT_ID"
echo ""

# Obter URLs das APIs (se já deployadas)
if gcloud run services describe nprocess-api-prod --region=us-central1 --project=$GCP_PROJECT_ID &>/dev/null; then
    API_URL=$(gcloud run services describe nprocess-api-prod \
        --region=us-central1 \
        --project=$GCP_PROJECT_ID \
        --format="value(status.url)")
    echo "✅ API URL: $API_URL"
fi

if gcloud run services describe nprocess-admin-api-prod --region=us-central1 --project=$GCP_PROJECT_ID &>/dev/null; then
    ADMIN_API_URL=$(gcloud run services describe nprocess-admin-api-prod \
        --region=us-central1 \
        --project=$GCP_PROJECT_ID \
        --format="value(status.url)")
    echo "✅ Admin API URL: $ADMIN_API_URL"
fi

# Verificar se Firebase está configurado
if ! firebase use $FIREBASE_PROJECT_ID &>/dev/null; then
    echo "⚠️  Configurando Firebase para $FIREBASE_PROJECT_ID..."
    firebase use $FIREBASE_PROJECT_ID
fi

# Configurar variáveis de ambiente para o build
cd client-portal

# Usar arquivo .env.production se existir, senão criar temporário
if [ ! -f .env.production ]; then
    echo "📝 Criando arquivo .env.production temporário..."
    cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=${API_URL:-https://nprocess-api-prod-fur76izi3a-uc.a.run.app}
NEXT_PUBLIC_ADMIN_API_URL=${ADMIN_API_URL:-https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app}
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBmA2rJyawq83redy2d2BGjlgTog1_NXmM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-8e801.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-8e801
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nprocess-8e801.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=43006907338
NEXT_PUBLIC_FIREBASE_APP_ID=1:43006907338:web:f8666ae921f4a584fff533
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-34RLW0TPXS
NEXT_PUBLIC_GCP_PROJECT_ID=$GCP_PROJECT_ID
NEXT_PUBLIC_RAG_API_URL=
NEXT_PUBLIC_FCM_VAPID_KEY=
NODE_ENV=production
EOF
else
    echo "✅ Usando arquivo .env.production existente"
    # Atualizar URLs das APIs se necessário
    if [ -n "$API_URL" ]; then
        sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$API_URL|" .env.production
    fi
    if [ -n "$ADMIN_API_URL" ]; then
        sed -i "s|NEXT_PUBLIC_ADMIN_API_URL=.*|NEXT_PUBLIC_ADMIN_API_URL=$ADMIN_API_URL|" .env.production
    fi
fi

echo "📦 Fazendo build do Next.js..."
npm run build

# Deploy para Firebase Hosting
echo "🚀 Fazendo deploy para Firebase Hosting..."
firebase deploy --only hosting:client-portal --project=$FIREBASE_PROJECT_ID

# Limpar arquivo temporário apenas se foi criado pelo script
# (não remover se já existia antes)
if [ -f .env.production ] && grep -q "temporário" .env.production 2>/dev/null; then
    rm -f .env.production
    echo "🧹 Arquivo .env.production temporário removido"
fi

cd ..

echo ""
echo "✅ Client Portal deployado com sucesso!"
echo ""
echo "📋 URLs:"
echo "   Client Portal: https://$FIREBASE_PROJECT_ID.web.app"
echo "   API: $API_URL"
echo "   Admin API: $ADMIN_API_URL"
echo ""

