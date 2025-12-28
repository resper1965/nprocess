#!/bin/bash

# Fase 2: Script para criar Cloud Storage buckets de produção
# Usage: ./scripts/fase2-setup-storage.sh

set -e

PROJECT_ID="nprocess-prod"
REGION="us-central1"
DOCUMENTS_BUCKET="nprocess-documents-prod"
ASSETS_BUCKET="nprocess-assets-prod"

echo "📦 Criando Cloud Storage buckets de produção..."
echo "Projeto: $PROJECT_ID"
echo ""

# Criar bucket para documentos
echo "📦 Criando bucket para documentos: $DOCUMENTS_BUCKET"
if gsutil ls -b "gs://$DOCUMENTS_BUCKET" &>/dev/null; then
    echo "⚠️  Bucket $DOCUMENTS_BUCKET já existe. Pulando criação..."
else
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$DOCUMENTS_BUCKET"
    echo "✅ Bucket $DOCUMENTS_BUCKET criado!"
fi

# Configurar CORS para documentos
echo "   → Configurando CORS..."
cat > /tmp/cors-documents.json <<EOF
[
  {
    "origin": ["https://nprocess.ness.com.br", "https://*.firebaseapp.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set /tmp/cors-documents.json "gs://$DOCUMENTS_BUCKET" 2>/dev/null || echo "   ⚠️  CORS já configurado ou erro ao configurar"
rm -f /tmp/cors-documents.json

# Configurar lifecycle para documentos (manter por 1 ano, depois arquivar)
echo "   → Configurando lifecycle policy..."
cat > /tmp/lifecycle-documents.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {"age": 90}
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {"age": 365}
      }
    ]
  }
}
EOF
gsutil lifecycle set /tmp/lifecycle-documents.json "gs://$DOCUMENTS_BUCKET" 2>/dev/null || echo "   ⚠️  Lifecycle já configurado ou erro ao configurar"
rm -f /tmp/lifecycle-documents.json

# Criar bucket para assets estáticos
echo "📦 Criando bucket para assets: $ASSETS_BUCKET"
if gsutil ls -b "gs://$ASSETS_BUCKET" &>/dev/null; then
    echo "⚠️  Bucket $ASSETS_BUCKET já existe. Pulando criação..."
else
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$ASSETS_BUCKET"
    echo "✅ Bucket $ASSETS_BUCKET criado!"
fi

# Configurar CORS para assets
echo "   → Configurando CORS..."
cat > /tmp/cors-assets.json <<EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set /tmp/cors-assets.json "gs://$ASSETS_BUCKET" 2>/dev/null || echo "   ⚠️  CORS já configurado ou erro ao configurar"
rm -f /tmp/cors-assets.json

# Configurar como público para assets (apenas leitura)
echo "   → Configurando acesso público (leitura)..."
gsutil iam ch allUsers:objectViewer "gs://$ASSETS_BUCKET" 2>/dev/null || echo "   ⚠️  Permissões já configuradas ou erro ao configurar"

echo ""
echo "✅ Cloud Storage buckets criados com sucesso!"
echo ""
echo "📋 Buckets criados:"
echo "   Documents: gs://$DOCUMENTS_BUCKET"
echo "   Assets: gs://$ASSETS_BUCKET"
echo ""
echo "📝 Próximos passos:"
echo "   1. Configurar IAM policies para Service Accounts:"
echo "      gsutil iam ch serviceAccount:API_SA:objectAdmin gs://$DOCUMENTS_BUCKET"
echo "      gsutil iam ch serviceAccount:API_SA:objectViewer gs://$ASSETS_BUCKET"
echo ""

