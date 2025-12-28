#!/bin/bash

# Fase 3: Script para criar Artifact Registry repository
# Usage: ./scripts/fase3-setup-artifact-registry.sh

set -e

PROJECT_ID="nprocess-prod"
REGION="us-central1"
REPOSITORY="nprocess-containers"
FORMAT="docker"

echo "📦 Criando Artifact Registry repository..."
echo "Projeto: $PROJECT_ID"
echo "Região: $REGION"
echo "Repository: $REPOSITORY"
echo ""

# Verificar se o repositório já existe
if gcloud artifacts repositories describe "$REPOSITORY" \
    --location="$REGION" \
    --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Repository $REPOSITORY já existe. Pulando criação..."
else
    echo "📦 Criando repository..."
    gcloud artifacts repositories create "$REPOSITORY" \
        --repository-format="$FORMAT" \
        --location="$REGION" \
        --description="Docker images para n.process produção" \
        --project="$PROJECT_ID" \
        --quiet

    echo "✅ Repository criado com sucesso!"
fi

# Obter URL do repository
REPO_URL="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY"

echo ""
echo "✅ Artifact Registry configurado!"
echo ""
echo "📋 Informações:"
echo "   Repository: $REPOSITORY"
echo "   Location: $REGION"
echo "   URL: $REPO_URL"
echo ""
echo "📝 Para fazer push de imagens:"
echo "   gcloud auth configure-docker $REGION-docker.pkg.dev"
echo "   docker tag IMAGE_NAME $REPO_URL/IMAGE_NAME:TAG"
echo "   docker push $REPO_URL/IMAGE_NAME:TAG"
echo ""

