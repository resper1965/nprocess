#!/bin/bash

# Script para configurar domínio customizado nprocess.ness.com.br
# Usage: ./scripts/configurar-dominio-customizado.sh

set -e

PROJECT_ID="nprocess-8e801"
SITE_ID="nprocess-8e801-4711d"
DOMAIN="nprocess.ness.com.br"

echo "🌐 Configurando domínio customizado: $DOMAIN"
echo "Projeto: $PROJECT_ID"
echo "Site: $SITE_ID"
echo ""

echo "📋 INSTRUÇÕES:"
echo ""
echo "O Firebase Hosting requer configuração manual via Console para domínios customizados."
echo "Siga os passos abaixo:"
echo ""
echo "1️⃣  Acesse o Firebase Console:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/hosting"
echo ""
echo "2️⃣  Clique em 'Add custom domain' ou 'Adicionar domínio personalizado'"
echo ""
echo "3️⃣  Digite o domínio: $DOMAIN"
echo ""
echo "4️⃣  O Firebase fornecerá registros DNS que você precisa adicionar"
echo "   no provedor de domínio (ness.com.br)"
echo ""
echo "5️⃣  Após adicionar os registros DNS, aguarde a verificação"
echo "   (pode levar alguns minutos a horas)"
echo ""
echo "6️⃣  O Firebase provisionará SSL/TLS automaticamente"
echo ""
echo "📄 Documentação completa: docs/CONFIGURAR_DOMINIO_CUSTOMIZADO.md"
echo ""

# Verificar se o domínio já está configurado (se possível)
echo "🔍 Verificando sites do Firebase Hosting..."
firebase hosting:sites:list --project=$PROJECT_ID

echo ""
echo "✅ Próximos passos:"
echo "   1. Configure o domínio via Firebase Console (link acima)"
echo "   2. Adicione os registros DNS fornecidos pelo Firebase"
echo "   3. Aguarde a verificação e provisionamento do SSL"
echo "   4. Atualize as configurações de OAuth e Firebase Auth"
echo ""
