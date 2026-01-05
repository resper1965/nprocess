#!/bin/bash

# Script para criar e configurar Cloud SQL para Admin Control Plane

set -e

PROJECT_ID=${GCP_PROJECT_ID:-nprocess}
REGION=${GCP_REGION:-us-central1}
INSTANCE_NAME="nprocess-db-dev"
DB_NAME="nprocess"
DB_USER="nprocess_admin"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo "🔧 Configurando Cloud SQL PostgreSQL..."

# Verificar se a instância já existe
if gcloud sql instances describe "$INSTANCE_NAME" --quiet >/dev/null 2>&1; then
    echo "✓ Instância Cloud SQL já existe: $INSTANCE_NAME"
    
    # Obter IP público
    PUBLIC_IP=$(gcloud sql instances describe "$INSTANCE_NAME" --format="value(ipAddresses[0].ipAddress)" 2>/dev/null || echo "")
    
    if [ -n "$PUBLIC_IP" ]; then
        echo "✓ IP Público: $PUBLIC_IP"
        DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$PUBLIC_IP:5432/$DB_NAME"
        echo ""
        echo "DATABASE_URL: $DATABASE_URL"
        echo ""
        echo "⚠️  Nota: A senha precisa ser configurada manualmente se não foi criada antes."
        echo "Para obter a senha atual, verifique o Secret Manager ou recrie o usuário:"
        echo "  gcloud sql users set-password $DB_USER --instance=$INSTANCE_NAME --password=NOVA_SENHA"
    fi
else
    echo "📦 Criando instância Cloud SQL..."
    
    # Criar instância Cloud SQL (PostgreSQL 15, tier pequeno para dev)
    gcloud sql instances create "$INSTANCE_NAME" \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region="$REGION" \
        --root-password="$DB_PASSWORD" \
        --storage-type=SSD \
        --storage-size=10GB \
        --storage-auto-increase \
        --backup-start-time=03:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=4 \
        --quiet
    
    echo "✓ Instância criada"
    
    # Criar banco de dados
    echo "📦 Criando banco de dados..."
    gcloud sql databases create "$DB_NAME" \
        --instance="$INSTANCE_NAME" \
        --quiet
    
    echo "✓ Banco de dados criado"
    
    # Criar usuário
    echo "👤 Criando usuário do banco..."
    gcloud sql users create "$DB_USER" \
        --instance="$INSTANCE_NAME" \
        --password="$DB_PASSWORD" \
        --quiet
    
    echo "✓ Usuário criado"
    
    # Obter IP público
    PUBLIC_IP=$(gcloud sql instances describe "$INSTANCE_NAME" --format="value(ipAddresses[0].ipAddress)")
    
    # Configurar autorização de rede (permitir Cloud Run)
    echo "🔐 Configurando autorização de rede..."
    gcloud sql instances patch "$INSTANCE_NAME" \
        --authorized-networks=0.0.0.0/0 \
        --quiet
    
    echo "✓ Rede configurada (0.0.0.0/0 para desenvolvimento)"
    
    # Salvar senha no Secret Manager
    echo "🔐 Salvando senha no Secret Manager..."
    echo -n "$DB_PASSWORD" | gcloud secrets create nprocess-db-password \
        --data-file=- \
        --replication-policy="automatic" \
        --quiet 2>/dev/null || \
    echo -n "$DB_PASSWORD" | gcloud secrets versions add nprocess-db-password \
        --data-file=- \
        --quiet
    
    echo "✓ Senha salva no Secret Manager"
    
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$PUBLIC_IP:5432/$DB_NAME"
    
    echo ""
    echo "✅ Cloud SQL configurado com sucesso!"
    echo ""
    echo "📋 Informações:"
    echo "  Instância: $INSTANCE_NAME"
    echo "  IP Público: $PUBLIC_IP"
    echo "  Banco: $DB_NAME"
    echo "  Usuário: $DB_USER"
    echo "  Senha: Salva no Secret Manager (nprocess-db-password)"
    echo ""
    echo "🔗 DATABASE_URL:"
    echo "  $DATABASE_URL"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "  - A senha está salva no Secret Manager"
    echo "  - Para produção, use Cloud SQL Proxy ou conexão privada"
    echo "  - Configure firewall adequadamente"
    echo ""
    
    # Exportar para uso no deploy
    export DATABASE_URL
    echo "export DATABASE_URL=\"$DATABASE_URL\"" >> .env.cloudsql
    echo "✓ DATABASE_URL salva em .env.cloudsql"
fi

