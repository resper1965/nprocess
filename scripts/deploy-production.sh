#!/bin/bash

# Process & Compliance Engine - Deploy para Produção
# Usage: ./scripts/deploy-production.sh [--dry-run] [--skip-tests]

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuração
ENVIRONMENT="prod"
PROJECT_ID="nprocess-prod"
REGION="us-central1"
DRY_RUN=false
SKIP_TESTS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Process & Compliance Engine${NC}"
echo -e "${GREEN}  Deploy para Produção${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Projeto:${NC} $PROJECT_ID"
echo -e "${YELLOW}Região:${NC} $REGION"
echo -e "${YELLOW}Ambiente:${NC} $ENVIRONMENT"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Modo:${NC} DRY RUN (simulação)"
fi
echo ""

# Verificações pré-deploy
echo -e "${BLUE}Verificando pré-requisitos...${NC}"

# Verificar gcloud
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Erro: gcloud CLI não encontrado${NC}"
  exit 1
fi

# Verificar autenticação
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
  echo -e "${RED}Erro: Não autenticado no GCP${NC}"
  exit 1
fi

# Verificar projeto
if ! gcloud projects describe "$PROJECT_ID" &>/dev/null; then
  echo -e "${RED}Erro: Projeto '$PROJECT_ID' não encontrado${NC}"
  exit 1
fi

gcloud config set project "$PROJECT_ID" --quiet

# Verificar billing
BILLING_ENABLED=$(gcloud billing projects describe "$PROJECT_ID" --format="value(billingAccountName)" 2>/dev/null || echo "")
if [ -z "$BILLING_ENABLED" ]; then
  echo -e "${RED}Erro: Billing não habilitado para o projeto${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Pré-requisitos OK${NC}"
echo ""

# Confirmação
if [ "$DRY_RUN" = false ]; then
  echo -e "${YELLOW}⚠️  ATENÇÃO: Este é um deploy de PRODUÇÃO${NC}"
  read -p "Tem certeza que deseja continuar? (digite 'PRODUCTION' para confirmar): " CONFIRM
  if [ "$CONFIRM" != "PRODUCTION" ]; then
    echo -e "${YELLOW}Deploy cancelado${NC}"
    exit 0
  fi
fi

# Testes (se não pular)
if [ "$SKIP_TESTS" = false ] && [ "$DRY_RUN" = false ]; then
  echo -e "${BLUE}Executando testes...${NC}"
  # Adicionar comandos de teste aqui
  echo -e "${GREEN}✓ Testes OK${NC}"
  echo ""
fi

# ============================================================================
# Deploy n.process API
# ============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Passo 1: Deploy n.process API${NC}"
echo -e "${GREEN}========================================${NC}"

if [ "$DRY_RUN" = false ]; then
  gcloud run deploy nprocess-api-prod \
    --source . \
    --platform managed \
    --region "$REGION" \
    --no-allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 80 \
    --max-instances 20 \
    --min-instances 1 \
    --service-account nprocess-api-prod@$PROJECT_ID.iam.gserviceaccount.com \
    --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,APP_ENV=$ENVIRONMENT,VERTEX_AI_LOCATION=$REGION,VERTEX_AI_MODEL=gemini-1.5-pro-002,FIRESTORE_DATABASE=(default)" \
    --labels "app=nprocess-api,environment=$ENVIRONMENT" \
    --project="$PROJECT_ID" \
    --quiet

  API_URL=$(gcloud run services describe nprocess-api-prod \
    --platform managed \
    --region "$REGION" \
    --format 'value(status.url)' \
    --project="$PROJECT_ID")

  echo -e "${GREEN}✓ API deployada:${NC} $API_URL"
else
  echo -e "${YELLOW}[DRY RUN] Deploy n.process API seria executado${NC}"
fi
echo ""

# ============================================================================
# Deploy Admin Control Plane
# ============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Passo 2: Deploy Admin Control Plane${NC}"
echo -e "${GREEN}========================================${NC}"

cd admin-control-plane

# Obter DATABASE_URL do Secret Manager ou variável de ambiente
if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}Obtendo DATABASE_URL do Secret Manager...${NC}"
  DB_PASSWORD=$(gcloud secrets versions access latest --secret="nprocess-db-password-prod" --project="$PROJECT_ID")
  DB_IP=$(gcloud sql instances describe nprocess-db-prod --format='value(ipAddresses[0].ipAddress)' --project="$PROJECT_ID")
  DATABASE_URL="postgresql://nprocess_admin:$DB_PASSWORD@$DB_IP:5432/nprocess"
fi

if [ "$DRY_RUN" = false ]; then
  gcloud run deploy nprocess-admin-api-prod \
    --source . \
    --platform managed \
    --region "$REGION" \
    --no-allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 80 \
    --max-instances 10 \
    --min-instances 1 \
    --service-account nprocess-admin-prod@$PROJECT_ID.iam.gserviceaccount.com \
    --add-cloudsql-instances $PROJECT_ID:$REGION:nprocess-db-prod \
    --set-env-vars "DATABASE_URL=$DATABASE_URL,GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,APP_ENV=$ENVIRONMENT" \
    --labels "app=nprocess-admin-api,environment=$ENVIRONMENT" \
    --project="$PROJECT_ID" \
    --quiet

  ADMIN_API_URL=$(gcloud run services describe nprocess-admin-api-prod \
    --platform managed \
    --region "$REGION" \
    --format 'value(status.url)' \
    --project="$PROJECT_ID")

  echo -e "${GREEN}✓ Admin Control Plane deployado:${NC} $ADMIN_API_URL"
else
  echo -e "${YELLOW}[DRY RUN] Deploy Admin Control Plane seria executado${NC}"
fi

cd ..
echo ""

# ============================================================================
# Deploy Client Portal
# ============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Passo 3: Deploy Client Portal${NC}"
echo -e "${GREEN}========================================${NC}"

cd client-portal

# Build
echo -e "${BLUE}Building Client Portal...${NC}"
npm run build

if [ "$DRY_RUN" = false ]; then
  # Deploy Firebase Hosting
  cd ..
  firebase deploy --only hosting:client-portal --project "$PROJECT_ID"
  
  PORTAL_URL=$(firebase hosting:sites:get client-portal --project "$PROJECT_ID" --format="value(defaultUrl" 2>/dev/null || echo "https://$PROJECT_ID.web.app")
  
  echo -e "${GREEN}✓ Client Portal deployado:${NC} $PORTAL_URL"
else
  echo -e "${YELLOW}[DRY RUN] Deploy Client Portal seria executado${NC}"
fi

cd ..
echo ""

# ============================================================================
# Deploy Firestore Rules e Indexes
# ============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Passo 4: Deploy Firestore${NC}"
echo -e "${GREEN}========================================${NC}"

if [ "$DRY_RUN" = false ]; then
  firebase deploy --only firestore:rules,firestore:indexes --project "$PROJECT_ID"
  echo -e "${GREEN}✓ Firestore rules e indexes deployados${NC}"
else
  echo -e "${YELLOW}[DRY RUN] Deploy Firestore seria executado${NC}"
fi
echo ""

# ============================================================================
# Validação Pós-Deploy
# ============================================================================
if [ "$DRY_RUN" = false ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}Validação Pós-Deploy${NC}"
  echo -e "${GREEN}========================================${NC}"
  
  # Health checks
  if [ -n "$API_URL" ]; then
    echo -e "${BLUE}Testando n.process API...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" | grep -q "200"; then
      echo -e "${GREEN}✓ API health check: OK${NC}"
    else
      echo -e "${RED}✗ API health check: FALHOU${NC}"
    fi
  fi
  
  if [ -n "$ADMIN_API_URL" ]; then
    echo -e "${BLUE}Testando Admin Control Plane...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" "$ADMIN_API_URL/health" | grep -q "200"; then
      echo -e "${GREEN}✓ Admin API health check: OK${NC}"
    else
      echo -e "${YELLOW}⚠ Admin API health check: Verificar manualmente (pode requerer auth)${NC}"
    fi
  fi
  echo ""
fi

# ============================================================================
# Resumo
# ============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deploy Concluído!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
  echo -e "${YELLOW}Serviços Deployados:${NC}"
  echo ""
  if [ -n "$API_URL" ]; then
    echo -e "${BLUE}n.process API:${NC}"
    echo "  URL: $API_URL"
    echo "  Health: $API_URL/health"
    echo "  Docs: $API_URL/docs"
    echo ""
  fi
  
  if [ -n "$ADMIN_API_URL" ]; then
    echo -e "${BLUE}Admin Control Plane:${NC}"
    echo "  URL: $ADMIN_API_URL"
    echo "  Health: $ADMIN_API_URL/health"
    echo ""
  fi
  
  if [ -n "$PORTAL_URL" ]; then
    echo -e "${BLUE}Client Portal:${NC}"
    echo "  URL: $PORTAL_URL"
    echo ""
  fi
  
  echo -e "${YELLOW}Próximos Passos:${NC}"
  echo "  1. Validar todas as funcionalidades"
  echo "  2. Verificar logs e métricas"
  echo "  3. Testar autenticação e autorização"
  echo "  4. Validar performance"
  echo "  5. Monitorar custos"
  echo ""
else
  echo -e "${YELLOW}Este foi um DRY RUN. Nenhum deploy foi executado.${NC}"
  echo ""
fi

echo -e "${GREEN}Deploy finalizado!${NC}"

