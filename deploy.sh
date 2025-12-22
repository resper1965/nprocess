#!/bin/bash

# ComplianceEngine API - Deployment Script for Google Cloud Run
# Usage: ./deploy.sh [environment]
# Environments: dev, staging, prod (default: dev)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
SERVICE_NAME="compliance-engine"
REGION="us-central1"

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}ComplianceEngine Deployment Script${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: No GCP project configured. Run 'gcloud config set project YOUR_PROJECT_ID'${NC}"
    exit 1
fi

echo -e "${YELLOW}Environment:${NC} $ENVIRONMENT"
echo -e "${YELLOW}Project ID:${NC} $PROJECT_ID"
echo -e "${YELLOW}Region:${NC} $REGION"
echo -e "${YELLOW}Service Name:${NC} $SERVICE_NAME-$ENVIRONMENT"
echo ""

# Confirm deployment
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Step 1: Enabling required APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com \
    firestore.googleapis.com

echo ""
echo -e "${GREEN}Step 2: Building container image...${NC}"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"
IMAGE_LATEST="gcr.io/$PROJECT_ID/$SERVICE_NAME:$ENVIRONMENT-latest"

gcloud builds submit --tag "$IMAGE_NAME" --tag "$IMAGE_LATEST"

echo ""
echo -e "${GREEN}Step 3: Deploying to Cloud Run...${NC}"

# Environment-specific configurations
case $ENVIRONMENT in
    prod)
        MEMORY="2Gi"
        CPU="2"
        MAX_INSTANCES="20"
        MIN_INSTANCES="1"
        ALLOW_UNAUTH="--no-allow-unauthenticated"
        ;;
    staging)
        MEMORY="1Gi"
        CPU="1"
        MAX_INSTANCES="5"
        MIN_INSTANCES="0"
        ALLOW_UNAUTH="--allow-unauthenticated"
        ;;
    *)
        MEMORY="1Gi"
        CPU="1"
        MAX_INSTANCES="3"
        MIN_INSTANCES="0"
        ALLOW_UNAUTH="--allow-unauthenticated"
        ;;
esac

gcloud run deploy "$SERVICE_NAME-$ENVIRONMENT" \
    --image "$IMAGE_NAME" \
    --platform managed \
    --region "$REGION" \
    $ALLOW_UNAUTH \
    --memory "$MEMORY" \
    --cpu "$CPU" \
    --timeout 300 \
    --concurrency 80 \
    --max-instances "$MAX_INSTANCES" \
    --min-instances "$MIN_INSTANCES" \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID,APP_ENV=$ENVIRONMENT" \
    --labels "app=compliance-engine,environment=$ENVIRONMENT,managed-by=script"

echo ""
echo -e "${GREEN}Step 4: Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME-$ENVIRONMENT" \
    --platform managed \
    --region "$REGION" \
    --format 'value(status.url)')

echo ""
echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
echo -e "${YELLOW}Service URL:${NC} $SERVICE_URL"
echo -e "${YELLOW}Health Check:${NC} $SERVICE_URL/health"
echo -e "${YELLOW}API Docs:${NC} $SERVICE_URL/docs"
echo ""

# Test health check
echo -e "${GREEN}Testing health check...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health" | grep -q "200"; then
    echo -e "${GREEN}✓ Health check passed!${NC}"
else
    echo -e "${RED}✗ Health check failed. Please check logs.${NC}"
    echo ""
    echo "View logs:"
    echo "gcloud run services logs read $SERVICE_NAME-$ENVIRONMENT --region $REGION"
fi

echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "View logs:     gcloud run services logs read $SERVICE_NAME-$ENVIRONMENT --region $REGION"
echo "Stream logs:   gcloud run services logs tail $SERVICE_NAME-$ENVIRONMENT --region $REGION"
echo "Describe:      gcloud run services describe $SERVICE_NAME-$ENVIRONMENT --region $REGION"
echo "Delete:        gcloud run services delete $SERVICE_NAME-$ENVIRONMENT --region $REGION"
