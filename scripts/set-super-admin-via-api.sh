#!/bin/bash

# Script para definir usuário como super_admin via Admin Control Plane API
# Requer que você já seja admin para usar este endpoint

set -e

UID="hp9TADsRoHfJ4GgSIjQejmCDRCt2"
ADMIN_API_URL="https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app"

echo "🔐 Definindo usuário como super_admin via API..."
echo "   UID: $UID"
echo "   Admin API: $ADMIN_API_URL"
echo ""

# Obter token de autenticação (requer que você esteja autenticado)
echo "🔑 Obtendo token de autenticação..."
TOKEN=$(gcloud auth print-access-token 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
    echo "❌ Não foi possível obter token de autenticação"
    echo "   Execute: gcloud auth login"
    exit 1
fi

# Fazer requisição
echo "🚀 Enviando requisição..."
RESPONSE=$(curl -s -X POST \
    "${ADMIN_API_URL}/v1/admin/set-super-admin/${UID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    2>&1)

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# Verificar sucesso
if echo "$RESPONSE" | grep -q '"success":\s*true'; then
    echo ""
    echo "✅ Usuário definido como super_admin com sucesso!"
    echo "⚠️  O usuário precisa fazer logout e login novamente para obter o novo token."
else
    echo ""
    echo "❌ Falha ao definir usuário como super_admin"
    echo "   Verifique se você tem permissões de admin"
    exit 1
fi
