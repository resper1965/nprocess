#!/bin/bash

# Fase 2: Script para criar Cloud SQL instance de produção
# Usage: ./scripts/fase2-setup-cloud-sql.sh

set -e

PROJECT_ID="nprocess-prod"
INSTANCE_NAME="nprocess-db-prod"
DATABASE_NAME="nprocess"
DB_USER="nprocess_admin"
REGION="us-central1"
TIER="db-f1-micro"
STORAGE_SIZE="100GB"

echo "🗄️  Criando Cloud SQL instance de produção..."
echo "Projeto: $PROJECT_ID"
echo "Instance: $INSTANCE_NAME"
echo ""

# Verificar se a instância já existe
if gcloud sql instances describe "$INSTANCE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Instância $INSTANCE_NAME já existe. Pulando criação..."
else
    echo "📦 Criando instância PostgreSQL..."
    gcloud sql instances create "$INSTANCE_NAME" \
        --database-version=POSTGRES_15 \
        --tier="$TIER" \
        --region="$REGION" \
        --storage-type=SSD \
        --storage-size="$STORAGE_SIZE" \
        --storage-auto-increase \
        --backup-start-time=02:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=03 \
        --database-flags=max_connections=200 \
        --project="$PROJECT_ID" \
        --quiet

    echo "✅ Instância criada com sucesso!"
fi

# Aguardar instância estar pronta
echo "⏳ Aguardando instância estar pronta..."
sleep 10

# Criar database
echo "📊 Criando database '$DATABASE_NAME'..."
if gcloud sql databases describe "$DATABASE_NAME" --instance="$INSTANCE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Database $DATABASE_NAME já existe. Pulando criação..."
else
    gcloud sql databases create "$DATABASE_NAME" \
        --instance="$INSTANCE_NAME" \
        --project="$PROJECT_ID" \
        --quiet
    echo "✅ Database criado com sucesso!"
fi

# Gerar senha aleatória
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Criar usuário
echo "👤 Criando usuário '$DB_USER'..."
if gcloud sql users describe "$DB_USER" --instance="$INSTANCE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo "⚠️  Usuário $DB_USER já existe. Atualizando senha..."
    gcloud sql users set-password "$DB_USER" \
        --instance="$INSTANCE_NAME" \
        --password="$DB_PASSWORD" \
        --project="$PROJECT_ID" \
        --quiet
else
    gcloud sql users create "$DB_USER" \
        --instance="$INSTANCE_NAME" \
        --password="$DB_PASSWORD" \
        --project="$PROJECT_ID" \
        --quiet
fi
echo "✅ Usuário criado/atualizado com sucesso!"

# Obter IP público
DB_IP=$(gcloud sql instances describe "$INSTANCE_NAME" \
    --format='value(ipAddresses[0].ipAddress)' \
    --project="$PROJECT_ID")

# Obter connection name
CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE_NAME" \
    --format='value(connectionName)' \
    --project="$PROJECT_ID")

echo ""
echo "✅ Cloud SQL configurado com sucesso!"
echo ""
echo "📋 Informações da Instância:"
echo "   Instance: $INSTANCE_NAME"
echo "   Database: $DATABASE_NAME"
echo "   User: $DB_USER"
echo "   IP: $DB_IP"
echo "   Connection Name: $CONNECTION_NAME"
echo ""
echo "🔐 Senha gerada (salvar no Secret Manager):"
echo "   $DB_PASSWORD"
echo ""
echo "📝 Connection String:"
echo "   postgresql://$DB_USER:$DB_PASSWORD@$DB_IP:5432/$DATABASE_NAME"
echo ""
echo "⚠️  IMPORTANTE: Salvar a senha no Secret Manager antes de continuar!"
echo "   gcloud secrets create nprocess-db-password-prod \\"
echo "     --data-file=- \\"
echo "     --replication-policy=automatic \\"
echo "     --project=$PROJECT_ID <<< '$DB_PASSWORD'"
echo ""

