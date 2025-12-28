# Deploy no Google Cloud Platform

Guia completo para fazer deploy de todos os serviços do n.process no GCP Cloud Run.

## 📋 Pré-requisitos

1. **Google Cloud SDK (gcloud CLI)**
   ```bash
   # Instalar gcloud CLI
   # https://cloud.google.com/sdk/docs/install
   
   # Verificar instalação
   gcloud --version
   ```

2. **Autenticação no GCP**
   ```bash
   # Fazer login
   gcloud auth login
   
   # Configurar projeto
   gcloud config set project nprocess
   ```

3. **Habilitar billing no projeto GCP**
   - O projeto precisa ter billing habilitado para usar Cloud Run

## 🚀 Deploy Rápido

### Opção 1: Deploy Automatizado (Recomendado)

```bash
# Tornar o script executável (se necessário)
chmod +x deploy-gcp.sh

# Fazer deploy de todos os serviços
./deploy-gcp.sh dev      # Ambiente de desenvolvimento
./deploy-gcp.sh staging  # Ambiente de staging
./deploy-gcp.sh prod     # Ambiente de produção
```

O script irá:
1. ✅ Habilitar APIs necessárias
2. ✅ Fazer deploy da n.process API
3. ✅ Fazer deploy do Admin Control Plane
4. ✅ Fazer deploy do Client Portal
5. ✅ Testar health checks
6. ✅ Exibir URLs dos serviços

### Opção 2: Deploy Individual

#### 1. Deploy n.process API

```bash
gcloud run deploy nprocess-api-dev \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --max-instances 3 \
    --min-instances 0 \
    --set-env-vars "GCP_PROJECT_ID=nprocess,GOOGLE_CLOUD_PROJECT=nprocess,APP_ENV=dev,VERTEX_AI_LOCATION=us-central1,VERTEX_AI_MODEL=gemini-1.5-pro-002,FIRESTORE_DATABASE=(default)"
```

#### 2. Deploy Admin Control Plane

```bash
cd admin-control-plane

gcloud run deploy nprocess-admin-api-dev \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --max-instances 3 \
    --min-instances 0 \
    --set-env-vars "GCP_PROJECT_ID=nprocess,GOOGLE_CLOUD_PROJECT=nprocess,APP_ENV=dev"
```

#### 3. Deploy Client Portal

```bash
cd client-portal

# Usar configuração para Cloud Run
cp next.config.cloudrun.js next.config.js

gcloud run deploy nprocess-client-portal-dev \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --max-instances 3 \
    --min-instances 0 \
    --set-env-vars "NEXT_PUBLIC_API_URL=<ADMIN_API_URL>,NEXT_PUBLIC_ADMIN_API_URL=<ADMIN_API_URL>,GCP_PROJECT_ID=nprocess,NODE_ENV=production"
```

## 🔧 Configuração de Ambientes

### Variáveis de Ambiente Necessárias

#### n.process API
- `GCP_PROJECT_ID` - ID do projeto GCP (ex: `nprocess`)
- `GOOGLE_CLOUD_PROJECT` - Mesmo que GCP_PROJECT_ID
- `VERTEX_AI_LOCATION` - Região do Vertex AI (ex: `us-central1`)
- `VERTEX_AI_MODEL` - Modelo do Gemini (ex: `gemini-1.5-pro-002`)
- `FIRESTORE_DATABASE` - Database do Firestore (ex: `(default)`)
- `APP_ENV` - Ambiente (dev/staging/prod)

#### Admin Control Plane
- `GCP_PROJECT_ID` - ID do projeto GCP
- `DATABASE_URL` - URL do PostgreSQL (se usar banco relacional)
- `REDIS_URL` - URL do Redis (se usar cache)
- `JWT_SECRET_KEY` - Chave secreta para JWT (produção)

#### Client Portal
- `NEXT_PUBLIC_API_URL` - URL da API principal
- `NEXT_PUBLIC_ADMIN_API_URL` - URL do Admin Control Plane
- `NEXT_PUBLIC_FIREBASE_*` - Configurações do Firebase
- `GCP_PROJECT_ID` - ID do projeto GCP

## 📊 Recursos por Ambiente

### Desenvolvimento (dev)
- **API**: 1Gi RAM, 1 CPU, 0-3 instâncias
- **Admin API**: 1Gi RAM, 1 CPU, 0-3 instâncias
- **Client Portal**: 512Mi RAM, 1 CPU, 0-3 instâncias
- **Acesso**: Público (--allow-unauthenticated)

### Staging
- **API**: 1Gi RAM, 1 CPU, 0-5 instâncias
- **Admin API**: 1Gi RAM, 1 CPU, 0-5 instâncias
- **Client Portal**: 512Mi RAM, 1 CPU, 0-5 instâncias
- **Acesso**: Público

### Produção (prod)
- **API**: 2Gi RAM, 2 CPU, 1-20 instâncias
- **Admin API**: 2Gi RAM, 2 CPU, 1-10 instâncias
- **Client Portal**: 1Gi RAM, 1 CPU, 0-10 instâncias
- **Acesso**: Autenticado (--no-allow-unauthenticated)

## 🔍 Verificação Pós-Deploy

### 1. Verificar Health Checks

```bash
# API
curl https://nprocess-api-dev-XXXXX.run.app/health

# Admin API
curl https://nprocess-admin-api-dev-XXXXX.run.app/health
```

### 2. Ver Logs

```bash
# Logs da API
gcloud run services logs read nprocess-api-dev --region us-central1 --limit 50

# Logs do Admin API
gcloud run services logs read nprocess-admin-api-dev --region us-central1 --limit 50

# Logs do Client Portal
gcloud run services logs read nprocess-client-portal-dev --region us-central1 --limit 50

# Stream de logs em tempo real
gcloud run services logs tail nprocess-api-dev --region us-central1
```

### 3. Listar Serviços

```bash
gcloud run services list --region us-central1
```

### 4. Obter URLs

```bash
# API
gcloud run services describe nprocess-api-dev --region us-central1 --format 'value(status.url)'

# Admin API
gcloud run services describe nprocess-admin-api-dev --region us-central1 --format 'value(status.url)'

# Client Portal
gcloud run services describe nprocess-client-portal-dev --region us-central1 --format 'value(status.url)'
```

## 🛠️ Troubleshooting

### Erro: "Project not found"
```bash
# Verificar projeto atual
gcloud config get-value project

# Configurar projeto correto
gcloud config set project nprocess
```

### Erro: "API not enabled"
```bash
# Habilitar APIs necessárias
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com \
    firestore.googleapis.com
```

### Erro: "Permission denied"
```bash
# Verificar permissões
gcloud projects get-iam-policy nprocess

# Adicionar permissões necessárias (se tiver acesso)
gcloud projects add-iam-policy-binding nprocess \
    --member="user:SEU_EMAIL@gmail.com" \
    --role="roles/run.admin"
```

### Erro no build do Client Portal
```bash
# Verificar se está usando a configuração correta
cd client-portal
cp next.config.cloudrun.js next.config.js
npm run build
```

## 📝 Notas Importantes

1. **Firestore**: Certifique-se de que o Firestore está habilitado e configurado no projeto
2. **Vertex AI**: O projeto precisa ter Vertex AI habilitado e billing ativo
3. **Custos**: Cloud Run cobra por uso. Configure limites de orçamento no GCP
4. **Domínios Customizados**: Para usar domínios customizados, configure no Cloud Run após o deploy
5. **Secrets**: Para produção, use Google Secret Manager para variáveis sensíveis

## 🔗 Links Úteis

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Firestore Documentation](https://cloud.google.com/firestore/docs)

## 📞 Suporte

Para problemas ou dúvidas:
- Issues: https://github.com/resper1965/nprocess/issues
- Email: suporte@ness.com.br

