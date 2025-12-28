#!/bin/bash

# Script para configurar domínio customizado no Firebase Hosting
# Usage: ./scripts/configurar-dominio.sh

set -e

FIREBASE_PROJECT="nprocess-8e801"
DOMAIN="nprocess.ness.com.br"
SITE_ID="nprocess-8e801"

echo "🌐 Configurando domínio customizado..."
echo "Projeto: $FIREBASE_PROJECT"
echo "Domínio: $DOMAIN"
echo "Site: $SITE_ID"
echo ""

echo "⚠️  IMPORTANTE: A configuração de domínio customizado deve ser feita no Firebase Console"
echo ""
echo "📋 Passos:"
echo "1. Acesse: https://console.firebase.google.com/project/$FIREBASE_PROJECT/hosting"
echo "2. Clique em 'Adicionar domínio customizado'"
echo "3. Digite: $DOMAIN"
echo "4. Siga as instruções para verificar o domínio"
echo "5. Configure os registros DNS conforme indicado pelo Firebase"
echo ""
echo "📝 Documentação completa em: docs/CONFIGURAR_DOMINIO.md"
echo ""

# Verificar se o site existe
if firebase hosting:sites:get "$SITE_ID" --project="$FIREBASE_PROJECT" &>/dev/null; then
    echo "✅ Site $SITE_ID encontrado"
    echo ""
    echo "🔗 URLs atuais:"
    firebase hosting:sites:get "$SITE_ID" --project="$FIREBASE_PROJECT" --format="value(defaultUrl)" 2>/dev/null || echo "   https://$SITE_ID.web.app"
else
    echo "❌ Site $SITE_ID não encontrado"
    exit 1
fi

