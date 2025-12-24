#!/bin/bash
# Setup custom domain for ComplianceEngine Admin Dashboard

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nprocess}"
REGION="us-central1"
DOMAIN="nprocess.ness.com.br"
SERVICE_NAME="compliance-engine-admin-dashboard"

echo "🌐 Configurando domínio customizado: $DOMAIN"

# Check if domain mapping exists
echo "🔍 Verificando mapeamento existente..."
EXISTING_MAPPING=$(gcloud run domain-mappings list \
    --project=$PROJECT_ID \
    --region=$REGION \
    --filter="metadata.name=$DOMAIN" \
    --format="value(metadata.name)" 2>/dev/null || echo "")

if [ -n "$EXISTING_MAPPING" ]; then
    echo "✅ Mapeamento já existe: $DOMAIN"
    echo "📋 Obtendo informações do mapeamento..."
    gcloud run domain-mappings describe $DOMAIN \
        --project=$PROJECT_ID \
        --region=$REGION \
        --format="yaml"
else
    echo "📝 Criando novo mapeamento de domínio..."
    gcloud run domain-mappings create \
        --service=$SERVICE_NAME \
        --domain=$DOMAIN \
        --project=$PROJECT_ID \
        --region=$REGION || {
        echo "⚠️ Erro ao criar mapeamento. Tentando método alternativo..."
        echo ""
        echo "📋 Para configurar manualmente:"
        echo "1. Acesse: https://console.cloud.google.com/run/domains?project=$PROJECT_ID"
        echo "2. Clique em 'Create Domain Mapping'"
        echo "3. Domínio: $DOMAIN"
        echo "4. Serviço: $SERVICE_NAME"
        echo "5. Região: $REGION"
        echo ""
        echo "📝 Depois, configure os registros DNS conforme instruções exibidas."
    }
fi

# Get DNS instructions
echo ""
echo "📋 Instruções DNS:"
echo "Após criar o mapeamento, configure os seguintes registros DNS no provedor do domínio:"
echo ""
echo "Tipo: CNAME"
echo "Nome: nprocess.ness.com.br"
echo "Valor: (será fornecido após criar o mapeamento)"
echo ""
echo "Ou configure conforme as instruções exibidas no console do GCP."

