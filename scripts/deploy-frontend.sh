#!/bin/bash
set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"nprocess-prod"}
REGION="us-central1"
SERVICE_NAME="nprocess-frontend-prod"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "🚀 Deploying nProcess Frontend to GCP ($PROJECT_ID)..."

# 1. Build & Push Container (Cloud Run)
echo "📦 Building Docker Image..."
cd ../secure-starter-kit/frontend
npm install

# Build-time variables for Vite (Production URLs & Firebase Config)
export VITE_CORE_API_URL="https://nprocess-api-prod-905989981186.us-central1.run.app"
export VITE_ADMIN_API_URL="https://nprocess-admin-api-prod-905989981186.us-central1.run.app"
export VITE_USE_MOCK="false"

# Firebase Config (Rescued from docs/FIREBASE_CONFIG_PRODUCAO.md)
export VITE_FIREBASE_API_KEY="AIzaSyBmA2rJyawq83redy2d2BGjlgTog1_NXmM"
export VITE_FIREBASE_AUTH_DOMAIN="nprocess-8e801.firebaseapp.com"
export VITE_FIREBASE_PROJECT_ID="nprocess-8e801"
export VITE_FIREBASE_STORAGE_BUCKET="nprocess-8e801.firebasestorage.app"
export VITE_FIREBASE_MESSAGING_SENDER_ID="43006907338"
export VITE_FIREBASE_APP_ID="1:43006907338:web:f8666ae921f4a584fff533"

npm run build

echo "🐳 Building Container..."
gcloud builds submit --project $PROJECT_ID --tag $IMAGE_NAME .

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --project $PROJECT_ID \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --port 80 \
  --allow-unauthenticated

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
