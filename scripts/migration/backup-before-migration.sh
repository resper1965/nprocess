#!/bin/bash
# Script para fazer backup completo antes da migração para Firebase

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-nprocess}"
BACKUP_DIR="./backups/pre-migration-$(date +%Y%m%d-%H%M%S)"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🔄 Iniciando backup antes da migração..."
echo "📁 Diretório de backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 1. Backup do Firestore
echo "📊 Fazendo backup do Firestore..."
gcloud firestore export gs://${PROJECT_ID}-backups/firestore-backup-${TIMESTAMP} \
  --project=${PROJECT_ID} \
  --async

# 2. Backup do Cloud Storage
echo "📦 Fazendo backup do Cloud Storage..."
gsutil -m cp -r gs://${PROJECT_ID}-backups/* "$BACKUP_DIR/storage/" 2>/dev/null || echo "⚠️  Nenhum bucket encontrado"

# 3. Backup do PostgreSQL (se existir)
echo "🗄️  Fazendo backup do PostgreSQL..."
if command -v pg_dump &> /dev/null; then
  pg_dump $DATABASE_URL > "$BACKUP_DIR/postgres-backup-${TIMESTAMP}.sql" 2>/dev/null || echo "⚠️  PostgreSQL não acessível"
fi

# 4. Backup de configurações
echo "⚙️  Fazendo backup de configurações..."
cp -r admin-dashboard/.env* "$BACKUP_DIR/config/" 2>/dev/null || true
cp -r client-portal/.env* "$BACKUP_DIR/config/" 2>/dev/null || true
cp firebase.json "$BACKUP_DIR/config/" 2>/dev/null || true
cp .firebaserc "$BACKUP_DIR/config/" 2>/dev/null || true

# 5. Listar serviços Cloud Run
echo "🚀 Listando serviços Cloud Run..."
gcloud run services list --project=${PROJECT_ID} --format=json > "$BACKUP_DIR/cloud-run-services.json"

# 6. Criar arquivo de manifesto
cat > "$BACKUP_DIR/manifest.json" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "project_id": "${PROJECT_ID}",
  "backup_type": "pre-migration",
  "components": {
    "firestore": "gs://${PROJECT_ID}-backups/firestore-backup-${TIMESTAMP}",
    "storage": "${BACKUP_DIR}/storage/",
    "postgres": "${BACKUP_DIR}/postgres-backup-${TIMESTAMP}.sql",
    "config": "${BACKUP_DIR}/config/",
    "cloud_run": "${BACKUP_DIR}/cloud-run-services.json"
  }
}
EOF

echo "✅ Backup concluído!"
echo "📁 Localização: $BACKUP_DIR"
echo "📄 Manifesto: $BACKUP_DIR/manifest.json"

