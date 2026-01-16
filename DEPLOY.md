# Guia de Deploy - n.process

> ⚠️ **Pré-requisito**: O faturamento (Billing) deve estar ativo no projeto GCP.

## 1. Ativar Billing

[Passo a passo no Console GCP](https://console.cloud.google.com/billing)

## 2. Deploy do Backend (Cloud Run)

```bash
gcloud run deploy nprocess-api \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --set-env-vars "GCP_PROJECT_ID=nprocess-85f63,GCP_REGION=us-central1,DEBUG=false,CORS_ORIGINS=https://nprocess.ness.com.br;https://nprocess-web-1040576944774.us-central1.run.app"
```

## 3. Deploy do Frontend (Cloud Run)

```bash
gcloud run deploy nprocess-web \
  --source ./frontend \
  --region us-central1 \
  --allow-unauthenticated
```

## 4. Domínio Customizado

Para mapear `nprocess.ness.com.br` para o Frontend:

```bash
gcloud beta run domain-mappings create \
  --service nprocess-web \
  --domain nprocess.ness.com.br \
  --region us-central1
```

Siga as instruções do terminal para adicionar os registros DNS (CNAME/TXT) no seu provedor de domínio.
