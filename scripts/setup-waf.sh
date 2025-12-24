#!/bin/bash
# Setup Cloud Armor WAF for ComplianceEngine

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nprocess}"
REGION="us-central1"

echo "🔒 Configurando Cloud Armor WAF para ComplianceEngine..."

# Enable required APIs
echo "📦 Habilitando APIs necessárias..."
gcloud services enable compute.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudarmor.googleapis.com --project=$PROJECT_ID

# Create security policy
echo "🛡️ Criando política de segurança..."
gcloud compute security-policies create compliance-engine-waf \
    --project=$PROJECT_ID \
    --description="WAF policy for ComplianceEngine API" \
    --default-action=deny-403

# Add rate limiting rule
echo "⚡ Adicionando regra de rate limiting..."
gcloud compute security-policies rules create 1000 \
    --project=$PROJECT_ID \
    --security-policy=compliance-engine-waf \
    --expression="true" \
    --action=rate-based-ban \
    --rate-limit-threshold-count=100 \
    --rate-limit-threshold-interval-sec=60 \
    --ban-duration-sec=300 \
    --conform-action=allow \
    --exceed-action=deny-429 \
    --enforce-on-key=IP

# Add allow rule for health checks
echo "✅ Adicionando regra para health checks..."
gcloud compute security-policies rules create 2000 \
    --project=$PROJECT_ID \
    --security-policy=compliance-engine-waf \
    --expression="request.path.matches('/health') || request.path.matches('/docs')" \
    --action=allow

# Add allow rule for API requests with valid API key
echo "🔑 Adicionando regra para requisições com API key..."
gcloud compute security-policies rules create 3000 \
    --project=$PROJECT_ID \
    --security-policy=compliance-engine-waf \
    --expression="request.headers['x-api-key'].exists() || request.headers['authorization'].exists()" \
    --action=allow

# Add SQL injection protection
echo "🛡️ Adicionando proteção contra SQL injection..."
gcloud compute security-policies rules create 4000 \
    --project=$PROJECT_ID \
    --security-policy=compliance-engine-waf \
    --expression="request.path.matches('.*(union|select|insert|delete|update|drop|exec|script).*')" \
    --action=deny-403

# Add XSS protection
echo "🛡️ Adicionando proteção contra XSS..."
gcloud compute security-policies rules create 5000 \
    --project=$PROJECT_ID \
    --security-policy=compliance-engine-waf \
    --expression="request.path.matches('.*(<script|javascript:|onerror=|onload=).*')" \
    --action=deny-403

echo "✅ Cloud Armor WAF configurado com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Anexar a política ao backend service do Cloud Run"
echo "2. Configurar alertas no Cloud Monitoring"
echo "3. Testar as regras de segurança"

