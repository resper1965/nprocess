#!/bin/bash
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"nprocess-8e801"}
REGION="us-central1"
SERVICE_NAME="nprocess-frontend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "🚀 Deploying nProcess Frontend to GCP..."

# 1. Build & Push Container (Cloud Run)
echo "📦 Building Docker Image..."
cd ../secure-starter-kit/frontend
npm install

# Build-time variables for Vite
export VITE_CORE_API_URL="https://nprocess-api-prod-s7tmkmao2a-uc.a.run.app"
export VITE_ADMIN_API_URL="https://nprocess-admin-api-prod-s7tmkmao2a-uc.a.run.app"
export VITE_USE_MOCK="false"

npm run build

echo "🐳 Building Container..."
gcloud builds submit --tag $IMAGE_NAME .

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --port 80 \
  --allow-unauthenticated \
  --set-env-vars VITE_CORE_API_URL="https://nprocess-api-prod-uc.a.run.app",VITE_ADMIN_API_URL="https://nprocess-admin-api-prod-uc.a.run.app"

# 2. Deploy to Firebase Hosting (Optional Static)
if [ -f "../../firebase.json" ]; then
    echo "🔥 Deploying to Firebase Hosting..."
    cd ../..
    firebase deploy --only hosting:nprocess-frontend
else
    echo "⚠️ firebase.json not found, skipping Firebase Hosting."
fi

echo "✅ Deployment Complete!"
echo "   - Cloud Run: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"
