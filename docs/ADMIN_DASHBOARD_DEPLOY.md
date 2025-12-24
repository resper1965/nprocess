# Admin Dashboard - Deploy Guide

## 🎯 Objetivo

Fazer deploy do Admin Dashboard no Google Cloud Run.

## 📋 Pré-requisitos

1. **Secrets no Secret Manager** (ou variáveis de ambiente):
   - `NEXTAUTH_SECRET`: Secret para NextAuth.js (gerar com: `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID`: Client ID do Google OAuth (opcional, se usar Google login)
   - `GOOGLE_CLIENT_SECRET`: Client Secret do Google OAuth (opcional)

2. **URLs configuradas**:
   - API URL: `https://compliance-engine-5wqihg7s7a-uc.a.run.app`
   - NextAuth URL: Será definida após o deploy

## 🚀 Deploy

### Opção 1: Cloud Build (Recomendado)

```bash
cd admin-dashboard

# Configurar variáveis de substituição
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"

# Fazer deploy
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_NEXTAUTH_SECRET=$NEXTAUTH_SECRET,_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,_GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
```

### Opção 2: Manual (Local Build)

```bash
cd admin-dashboard

# Build da imagem
docker build -t gcr.io/nprocess/compliance-engine-admin-dashboard:latest .

# Push para Container Registry
docker push gcr.io/nprocess/compliance-engine-admin-dashboard:latest

# Deploy no Cloud Run
gcloud run deploy compliance-engine-admin-dashboard \
  --image=gcr.io/nprocess/compliance-engine-admin-dashboard:latest \
  --region=us-central1 \
  --platform=managed \
  --no-allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=5 \
  --timeout=300 \
  --port=8080 \
  --set-env-vars=NEXT_PUBLIC_API_URL=https://compliance-engine-5wqihg7s7a-uc.a.run.app \
  --set-env-vars=NEXTAUTH_URL=https://compliance-engine-admin-dashboard-XXXXX-uc.a.run.app \
  --set-env-vars=NEXTAUTH_SECRET=<your-secret> \
  --set-env-vars=GOOGLE_CLIENT_ID=<your-client-id> \
  --set-env-vars=GOOGLE_CLIENT_SECRET=<your-client-secret>
```

## 🔐 Configurar Secrets (Recomendado)

Para produção, usar Secret Manager:

```bash
# Criar secrets
echo -n "your-nextauth-secret" | gcloud secrets create nextauth-secret --data-file=-
echo -n "your-google-client-id" | gcloud secrets create google-client-id --data-file=-
echo -n "your-google-client-secret" | gcloud secrets create google-client-secret --data-file=-

# Conceder acesso ao Cloud Run
gcloud secrets add-iam-policy-binding nextauth-secret \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Atualizar cloudbuild.yaml para usar secrets:
# --set-secrets=NEXTAUTH_SECRET=nextauth-secret:latest
```

## 🔍 Verificar Deploy

```bash
# Listar serviços
gcloud run services list --region=us-central1

# Ver logs
gcloud run services logs read compliance-engine-admin-dashboard --region=us-central1

# Obter URL
gcloud run services describe compliance-engine-admin-dashboard --region=us-central1 --format='value(status.url)'
```

## 🌐 Configurar IAM

O Admin Dashboard está configurado com `--no-allow-unauthenticated`, então apenas usuários autenticados podem acessar.

Para permitir acesso:

```bash
# Adicionar usuário específico
gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
  --region=us-central1 \
  --member=user:admin@example.com \
  --role=roles/run.invoker

# Ou permitir acesso autenticado para todos (não recomendado para produção)
gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/run.invoker
```

## 📝 Notas

- O Admin Dashboard requer autenticação (NextAuth.js)
- Para desenvolvimento local, use as credenciais mock definidas em `src/app/api/auth/[...nextauth]/route.ts`
- Em produção, configure Google OAuth ou outro provedor de autenticação
- A URL do NextAuth URL deve ser atualizada após o primeiro deploy

## 🔗 Links

- **API Principal**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **Frontend Demo**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
- **Admin Dashboard**: A ser definido após deploy


