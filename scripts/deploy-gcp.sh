#!/bin/bash

# n.process - Deploy completo para Google Cloud Platform
# Deploy de todos os serviços: API, Admin Control Plane, Client Portal
# Usage: ./deploy-gcp.sh [environment]
# Environments: dev, staging, prod (default: dev)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID=${GCP_PROJECT_ID:-nprocess-8e801}
REGION=${GCP_REGION:-us-central1}
ENVIRONMENT=${1:-dev}
DATASTORE_ID=${VERTEX_DATASTORE_ID}
GEMINI_KEY=${GEMINI_API_KEY}


# Nomes dos serviços
API_SERVICE="nprocess-api"
ADMIN_API_SERVICE="nprocess-admin-api"
CLIENT_PORTAL_SERVICE="nprocess-client-portal"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  n.process - Deploy GCP Completo${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Erro: gcloud CLI não encontrado.${NC}"
    echo "Instale: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar se está autenticado
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}Autenticando no GCP...${NC}"
    gcloud auth login
fi

# Configurar projeto
echo -e "${BLUE}Configurando projeto GCP...${NC}"
gcloud config set project "$PROJECT_ID" 2>/dev/null || {
    echo -e "${RED}Erro: Projeto '$PROJECT_ID' não encontrado ou sem acesso.${NC}"
    echo "Configure o projeto: gcloud config set project YOUR_PROJECT_ID"
    exit 1
}

echo -e "${YELLOW}Projeto:${NC} $PROJECT_ID"
echo -e "${YELLOW}Região:${NC} $REGION"
echo -e "${YELLOW}Ambiente:${NC} $ENVIRONMENT"
echo ""

# Confirmar deploy
if [ "$AUTO_CONFIRM" != "yes" ] && [ "$AUTO_CONFIRM" != "true" ]; then
    read -p "Continuar com o deploy? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deploy cancelado.${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}Confirmação automática ativada.${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Passo 1: Habilitando APIs necessárias${NC}"
echo -e "${GREEN}========================================${NC}"

gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com \
    firestore.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com \
    discoveryengine.googleapis.com \
    logging.googleapis.com \
    monitoring.googleapis.com \
    --quiet

echo -e "${GREEN}✓ APIs habilitadas${NC}"
echo ""

# Configurações por ambiente
case $ENVIRONMENT in
    prod)
        API_MEMORY="2Gi"
        API_CPU="2"
        API_MAX_INSTANCES="5"
        API_MIN_INSTANCES="1"
        ADMIN_MEMORY="2Gi"
        ADMIN_CPU="2"
        ADMIN_MAX_INSTANCES="5"
        ADMIN_MIN_INSTANCES="1"
        PORTAL_MEMORY="1Gi"
        PORTAL_CPU="1"
        PORTAL_MAX_INSTANCES="10"
        PORTAL_MIN_INSTANCES="0"
        ALLOW_UNAUTH_API="--allow-unauthenticated"
        ALLOW_UNAUTH_ADMIN="--allow-unauthenticated"
        ALLOW_UNAUTH_PORTAL="--allow-unauthenticated"
        ;;
    staging)
        API_MEMORY="1Gi"
        API_CPU="1"
        API_MAX_INSTANCES="5"
        API_MIN_INSTANCES="0"
        ADMIN_MEMORY="1Gi"
        ADMIN_CPU="1"
        ADMIN_MAX_INSTANCES="5"
        ADMIN_MIN_INSTANCES="0"
        PORTAL_MEMORY="512Mi"
        PORTAL_CPU="1"
        PORTAL_MAX_INSTANCES="5"
        PORTAL_MIN_INSTANCES="0"
        ALLOW_UNAUTH_API="--allow-unauthenticated"
        ALLOW_UNAUTH_ADMIN="--allow-unauthenticated"
        ALLOW_UNAUTH_PORTAL="--allow-unauthenticated"
        ;;
    *)
        API_MEMORY="1Gi"
        API_CPU="1"
        API_MAX_INSTANCES="3"
        API_MIN_INSTANCES="0"
        ADMIN_MEMORY="1Gi"
        ADMIN_CPU="1"
        ADMIN_MAX_INSTANCES="3"
        ADMIN_MIN_INSTANCES="0"
        PORTAL_MEMORY="512Mi"
        PORTAL_CPU="1"
        PORTAL_MAX_INSTANCES="3"
        PORTAL_MIN_INSTANCES="0"
        ALLOW_UNAUTH_API="--allow-unauthenticated"
        ALLOW_UNAUTH_ADMIN="--allow-unauthenticated"
        ALLOW_UNAUTH_PORTAL="--allow-unauthenticated"
        ;;
esac

# ============================================================================
# Deploy n.process API
# ============================================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Passo 2: Deploy n.process API${NC}"
echo -e "${GREEN}========================================${NC}"

cd "$(dirname "$0")/.."

echo -e "${BLUE}Construindo e fazendo deploy da API...${NC}"


# 2.1 Build Image explicitly using cloudbuild-api.yaml
echo -e "${BLUE}Construindo imagem Docker (nprocess-api)...${NC}"
gcloud builds submit . --config cloudbuild-api.yaml --substitutions=_ENV=$ENVIRONMENT --quiet

# 2.2 Deploy Image
echo -e "${BLUE}Fazendo deploy da imagem...${NC}"
gcloud run deploy "$API_SERVICE-$ENVIRONMENT" \
    --image "gcr.io/$PROJECT_ID/$API_SERVICE-$ENVIRONMENT:latest" \
    --platform managed \
    --region "$REGION" \
    $ALLOW_UNAUTH_API \
    --memory "$API_MEMORY" \
    --cpu "$API_CPU" \
    --timeout 300 \
    --concurrency 80 \
    --max-instances "$API_MAX_INSTANCES" \
    --min-instances "$API_MIN_INSTANCES" \
    --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,APP_ENV=$ENVIRONMENT,VERTEX_AI_LOCATION=$REGION,VERTEX_AI_MODEL=gemini-1.5-pro-002,FIRESTORE_DATABASE=(default)$([ -n "$DATASTORE_ID" ] && echo ",VERTEX_DATASTORE_ID=$DATASTORE_ID")$([ -n "$GEMINI_KEY" ] && echo ",GEMINI_API_KEY=$GEMINI_KEY")" \
    --labels "app=nprocess-api,environment=$ENVIRONMENT,managed-by=deploy-script" \
    --quiet


API_URL=$(gcloud run services describe "$API_SERVICE-$ENVIRONMENT" \
    --platform managed \
    --region "$REGION" \
    --format 'value(status.url)')

echo -e "${GREEN}✓ API deployada:${NC} $API_URL"
echo ""

# ============================================================================
# Deploy Admin Control Plane
# ============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Passo 3: Deploy Admin Control Plane${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${BLUE}Construindo e fazendo deploy do Admin Control Plane...${NC}"

gcloud run deploy "$ADMIN_API_SERVICE-$ENVIRONMENT" \
    --source ./admin-control-plane \
    --platform managed \
    --region "$REGION" \
    $ALLOW_UNAUTH_ADMIN \
    --memory "$ADMIN_MEMORY" \
    --cpu "$ADMIN_CPU" \
    --timeout 300 \
    --concurrency 80 \
    --max-instances "$ADMIN_MAX_INSTANCES" \
    --min-instances "$ADMIN_MIN_INSTANCES" \
    --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,APP_ENV=$ENVIRONMENT,FIRESTORE_DATABASE=(default)$([ -n "$DATASTORE_ID" ] && echo ",VERTEX_DATASTORE_ID=$DATASTORE_ID")$([ -n "$GEMINI_KEY" ] && echo ",GEMINI_API_KEY=$GEMINI_KEY")" \
    --labels "app=nprocess-admin-api,environment=$ENVIRONMENT,managed-by=deploy-script" \
    --quiet

ADMIN_API_URL=$(gcloud run services describe "$ADMIN_API_SERVICE-$ENVIRONMENT" \
    --platform managed \
    --region "$REGION" \
    --format 'value(status.url)')

echo -e "${GREEN}✓ Admin API deployada:${NC} $ADMIN_API_URL"
echo ""

# ============================================================================
# Deploy Client Portal (Legacy/Not in Scope)
# ============================================================================
# ... commented out ...
PORTAL_URL="not-deployed"


# ============================================================================
# Resumo do Deploy
# ============================================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deploy Concluído com Sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Serviços Deployados:${NC}"
echo ""
echo -e "${BLUE}n.process API:${NC}"
echo "  URL: $API_URL"
echo "  Health: $API_URL/health"
echo "  Docs: $API_URL/docs"
echo ""
echo -e "${BLUE}Admin Control Plane:${NC}"
echo "  URL: $ADMIN_API_URL"
echo "  Health: $ADMIN_API_URL/health"
echo ""
echo -e "${BLUE}Client Portal:${NC}"
echo "  URL: $PORTAL_URL"
echo ""
echo -e "${YELLOW}Comandos Úteis:${NC}"
echo ""
echo "# Ver logs da API"
echo "gcloud run services logs read $API_SERVICE-$ENVIRONMENT --region $REGION --limit 50"
echo ""
echo "# Ver logs do Admin API"
echo "gcloud run services logs read $ADMIN_API_SERVICE-$ENVIRONMENT --region $REGION --limit 50"
echo ""
echo "# Ver logs do Client Portal"
echo "gcloud run services logs read $CLIENT_PORTAL_SERVICE-$ENVIRONMENT --region $REGION --limit 50"
echo ""
echo "# Testar health check"
echo "curl $API_URL/health"
echo ""
echo "# Listar todos os serviços"
echo "gcloud run services list --region $REGION"
echo ""

# Testar health checks
echo -e "${GREEN}Testando health checks...${NC}"
echo ""

# Testar API
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" | grep -q "200"; then
    echo -e "${GREEN}✓ API health check: OK${NC}"
else
    echo -e "${RED}✗ API health check: FALHOU${NC}"
fi

# Testar Admin API
if curl -s -o /dev/null -w "%{http_code}" "$ADMIN_API_URL/health" | grep -q "200"; then
    echo -e "${GREEN}✓ Admin API health check: OK${NC}"
else
    echo -e "${YELLOW}⚠ Admin API health check: Verifique manualmente${NC}"
fi

echo ""
echo -e "${GREEN}Deploy finalizado!${NC}"

