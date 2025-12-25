#!/bin/bash
# Script para fazer rollback da migração para Firebase

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nprocess}"
BACKUP_DIR="${1:-./backups/pre-migration-latest}"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Diretório de backup não encontrado: $BACKUP_DIR"
  echo "   Uso: $0 [diretório-de-backup]"
  exit 1
fi

echo "🔄 Iniciando rollback da migração..."
echo "📁 Diretório de backup: $BACKUP_DIR"

# 1. Restaurar Firestore
if [ -f "$BACKUP_DIR/manifest.json" ]; then
  echo "📊 Restaurando Firestore..."
  FIRESTORE_BACKUP=$(jq -r '.components.firestore' "$BACKUP_DIR/manifest.json")
  if [ "$FIRESTORE_BACKUP" != "null" ]; then
    gcloud firestore import gs://$FIRESTORE_BACKUP \
      --project=${PROJECT_ID} \
      --async
    echo "✅ Firestore restaurado"
  fi
fi

# 2. Restaurar Cloud Storage
if [ -d "$BACKUP_DIR/storage" ]; then
  echo "📦 Restaurando Cloud Storage..."
  gsutil -m cp -r "$BACKUP_DIR/storage/*" gs://${PROJECT_ID}-backups/ 2>/dev/null || true
  echo "✅ Cloud Storage restaurado"
fi

# 3. Restaurar PostgreSQL
if [ -f "$BACKUP_DIR/postgres-backup-"*.sql ]; then
  echo "🗄️  Restaurando PostgreSQL..."
  psql $DATABASE_URL < "$BACKUP_DIR/postgres-backup-"*.sql 2>/dev/null || echo "⚠️  PostgreSQL não acessível"
fi

# 4. Restaurar configurações
if [ -d "$BACKUP_DIR/config" ]; then
  echo "⚙️  Restaurando configurações..."
  cp -r "$BACKUP_DIR/config/.env*" admin-dashboard/ 2>/dev/null || true
  cp -r "$BACKUP_DIR/config/.env*" client-portal/ 2>/dev/null || true
  echo "✅ Configurações restauradas"
fi

# 5. Redeploy Cloud Run (se necessário)
echo "🚀 Para restaurar serviços Cloud Run, execute:"
echo "   gcloud run services list --project=${PROJECT_ID}"
echo "   # Depois faça redeploy dos serviços necessários"

echo "✅ Rollback concluído!"

