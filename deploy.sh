#!/bin/bash

# Deploy script with local build validation
# This script ensures local builds pass before deploying to Cloud Build

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment process...${NC}"
echo ""

# Step 1: Validate Frontend Build Locally
echo -e "${YELLOW}📦 Step 1/3: Validating frontend build locally...${NC}"
cd web-portal

if ! npm run build; then
    echo -e "${RED}❌ Frontend build failed locally!${NC}"
    echo -e "${RED}   Please fix TypeScript/compilation errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build passed locally${NC}"
cd ..

# Step 2: Optional - Run Python tests
echo ""
echo -e "${YELLOW}🧪 Step 2/3: Running Python tests (optional)...${NC}"
if command -v pytest &> /dev/null; then
    if pytest tests/ --ignore=tests/integration -q; then
        echo -e "${GREEN}✅ Tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Some tests failed, but continuing...${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  pytest not found, skipping tests${NC}"
fi

# Step 3: Deploy to Cloud Build
echo ""
echo -e "${YELLOW}☁️  Step 3/3: Deploying to Google Cloud Build...${NC}"

if gcloud builds submit --config=cloudbuild.yaml --async; then
    echo ""
    echo -e "${GREEN}✅ Deployment initiated successfully!${NC}"
    echo -e "${GREEN}   Check the Cloud Build console for progress.${NC}"
else
    echo -e "${RED}❌ Failed to submit build to Cloud Build${NC}"
    exit 1
fi
