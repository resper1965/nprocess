#!/bin/bash
# Verify all services are working correctly

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nprocess}"
REGION="us-central1"

echo "🔍 Verificando deployment do ComplianceEngine..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local SERVICE_NAME=$1
    local URL=$2
    
    echo -n "Verificando $SERVICE_NAME... "
    
    # Try health endpoint first, then root
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/health" -L 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" != "200" ]; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" -L 2>/dev/null || echo "000")
    fi
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU (HTTP $HTTP_CODE)${NC}"
        return 1
    fi
}

# Check API
API_URL=$(gcloud run services describe compliance-engine \
    --project=$PROJECT_ID \
    --region=$REGION \
    --format="value(status.url)" 2>/dev/null || echo "")

if [ -n "$API_URL" ]; then
    check_service "ComplianceEngine API" "$API_URL"
    echo "  URL: $API_URL"
    echo "  Docs: $API_URL/docs"
else
    echo -e "${RED}❌ ComplianceEngine API não encontrado${NC}"
fi

echo ""

# Check Admin Dashboard
ADMIN_URL=$(gcloud run services describe compliance-engine-admin-dashboard \
    --project=$PROJECT_ID \
    --region=$REGION \
    --format="value(status.url)" 2>/dev/null || echo "")

if [ -n "$ADMIN_URL" ]; then
    check_service "Admin Dashboard" "$ADMIN_URL"
    echo "  URL: $ADMIN_URL"
else
    echo -e "${RED}❌ Admin Dashboard não encontrado${NC}"
fi

echo ""

# Check domain
DOMAIN="nprocess.ness.com.br"
echo -n "Verificando domínio $DOMAIN... "
DOMAIN_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null || echo "000")

if [ "$DOMAIN_CHECK" = "200" ] || [ "$DOMAIN_CHECK" = "403" ]; then
    echo -e "${GREEN}✅ OK (HTTP $DOMAIN_CHECK)${NC}"
    echo "  URL: https://$DOMAIN"
else
    echo -e "${YELLOW}⚠️ Domínio não acessível (HTTP $DOMAIN_CHECK)${NC}"
    echo "  Verifique a configuração DNS"
fi

echo ""

# Check Cloud Armor
echo -n "Verificando Cloud Armor WAF... "
WAF_POLICY=$(gcloud compute security-policies list \
    --project=$PROJECT_ID \
    --filter="name:compliance-engine-waf" \
    --format="value(name)" 2>/dev/null || echo "")

if [ -n "$WAF_POLICY" ]; then
    echo -e "${GREEN}✅ Configurado${NC}"
else
    echo -e "${YELLOW}⚠️ Não configurado${NC}"
    echo "  Execute: ./scripts/setup-waf.sh"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumo:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$API_URL" ] && [ -n "$ADMIN_URL" ]; then
    echo -e "${GREEN}✅ Serviços principais: OK${NC}"
else
    echo -e "${RED}❌ Alguns serviços não estão disponíveis${NC}"
fi

echo ""
echo "🔗 URLs de Produção:"
[ -n "$API_URL" ] && echo "  API: $API_URL"
[ -n "$ADMIN_URL" ] && echo "  Admin Dashboard: $ADMIN_URL"
[ "$DOMAIN_CHECK" = "200" ] || [ "$DOMAIN_CHECK" = "403" ] && echo "  Domínio: https://$DOMAIN"

echo ""
echo "✅ Verificação concluída!"

