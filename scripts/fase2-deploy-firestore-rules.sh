#!/bin/bash

# Fase 2: Script para fazer deploy das Firestore Security Rules
# Usage: ./scripts/fase2-deploy-firestore-rules.sh

set -e

PROJECT_ID="nprocess-prod"

echo "🔥 Deployando Firestore Security Rules..."
echo "Projeto: $PROJECT_ID"
echo ""

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI não encontrado."
    echo "   Instale com: npm install -g firebase-tools"
    echo "   Ou use: gcloud firestore rules deploy"
    exit 1
fi

# Verificar se está logado no Firebase
if ! firebase projects:list &>/dev/null; then
    echo "⚠️  Não está logado no Firebase."
    echo "   Execute: firebase login"
    exit 1
fi

# Verificar se firestore.rules existe
if [ ! -f "firestore.rules" ]; then
    echo "⚠️  Arquivo firestore.rules não encontrado."
    echo "   Criando arquivo básico..."
    cat > firestore.rules <<'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && 
                      request.auth.uid == userId &&
                      !exists(/databases/$(database)/documents/users/$(userId));
    }
    
    // API Keys collection
    match /api_keys/{keyId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
  }
}
EOF
    echo "✅ Arquivo firestore.rules criado."
fi

# Fazer deploy das rules
echo "📦 Fazendo deploy das Firestore Rules..."
firebase deploy --only firestore:rules --project="$PROJECT_ID"

echo ""
echo "✅ Firestore Security Rules deployadas com sucesso!"
echo ""

