# Guia de Deploy - n.process

> ⚠️ **Pré-requisito**: O faturamento (Billing) deve estar ativo no projeto GCP.

## 1. Ativar Billing

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/billing)
2. Selecione o projeto `nprocess-85f63`
3. Vincule uma conta de faturamento

## 2. Deploy do Backend (Cloud Run)

```bash
cd backend

# Deploy direto do código fonte
gcloud run deploy nprocess-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=nprocess-85f63,GCP_REGION=us-central1,DEBUG=false,CORS_ORIGINS=*"
```

## 3. Deploy do Frontend (Cloud Run)

```bash
cd frontend

# Deploy direto
gcloud run deploy nprocess-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

_Nota: Adicione a URL do backend (`nprocess-api`) nas variáveis de ambiente do frontend se necessário._

## 4. Configuração Pós-Deploy

1. Pegue a URL do Backend (ex: `https://nprocess-api-xyz.a.run.app`)
2. Atualize o Frontend com essa URL
3. Adicione a URL do Frontend no `CORS_ORIGINS` do Backend
