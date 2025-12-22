# Status do Deploy - ComplianceEngine API

## ✅ Concluído

### 1. Commit e Push para GitHub
- **Commit**: `8e3a57e` - "docs: Adicionar manual de integração, exemplos de prompts e spec-kit"
- **Branch**: `main`
- **Repositório**: `https://github.com/resper1965/nprocess.git`
- **Arquivos commitados**:
  - `.gitignore` (atualizado)
  - `README.md` (atualizado)
  - `docker-compose.yml` (atualizado)
  - `.specify/` (GitHub Spec-Kit completo)
  - `INTEGRATION.md` (Manual de integração)
  - `PROMPTS_EXAMPLES.md` (Exemplos de prompts)
  - `specs/` (Especificação baseline)

### 2. Configuração GCP
- **Projeto configurado**: `nprocess`
- **Project Number**: `273624403528`

## ⚠️ Pendente - Deploy no GCP

### Requisito: Billing Habilitado

O projeto GCP `nprocess` precisa ter **billing habilitado** para ativar as APIs necessárias:

```bash
# APIs que precisam ser habilitadas:
- aiplatform.googleapis.com (Vertex AI)
- firestore.googleapis.com (Firestore)
- run.googleapis.com (Cloud Run)
- cloudbuild.googleapis.com (Cloud Build)
- artifactregistry.googleapis.com (Artifact Registry)
```

### Como Habilitar Billing

1. Acesse o [Console do GCP](https://console.cloud.google.com/)
2. Vá em **Billing** → **Link a billing account**
3. Selecione ou crie uma conta de billing
4. Associe ao projeto `nprocess`

### Após Habilitar Billing

Execute os seguintes comandos:

```bash
# 1. Habilitar APIs
gcloud services enable \
    aiplatform.googleapis.com \
    firestore.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    --project=nprocess

# 2. Deploy usando Cloud Build
gcloud builds submit --config cloudbuild.yaml --project=nprocess

# OU usar o script de deploy
./deploy.sh dev
```

## 📋 Opções de Deploy

### Opção 1: Cloud Build (Recomendado)

```bash
gcloud builds submit --config cloudbuild.yaml --project=nprocess
```

Este comando:
- Builda a imagem Docker
- Faz push para Container Registry
- Faz deploy no Cloud Run automaticamente

### Opção 2: Script de Deploy

```bash
./deploy.sh dev    # Ambiente de desenvolvimento
./deploy.sh staging # Ambiente de staging
./deploy.sh prod    # Ambiente de produção
```

### Opção 3: Deploy Manual

```bash
# 1. Build e push da imagem
gcloud builds submit --tag gcr.io/nprocess/compliance-engine:latest

# 2. Deploy no Cloud Run
gcloud run deploy compliance-engine \
    --image gcr.io/nprocess/compliance-engine:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars GOOGLE_CLOUD_PROJECT=nprocess \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --project=nprocess
```

## 🔍 Verificar Status

Após o deploy, verifique:

```bash
# Listar serviços Cloud Run
gcloud run services list --project=nprocess --region=us-central1

# Obter URL do serviço
gcloud run services describe compliance-engine \
    --project=nprocess \
    --region=us-central1 \
    --format='value(status.url)'

# Ver logs
gcloud run services logs read compliance-engine \
    --project=nprocess \
    --region=us-central1
```

## 📝 Próximos Passos

1. ✅ **Habilitar billing** no projeto GCP
2. ✅ **Habilitar APIs** necessárias
3. ✅ **Criar Firestore Database** (Native mode)
4. ✅ **Configurar Application Default Credentials**
5. ✅ **Fazer deploy** usando Cloud Build ou script
6. ✅ **Testar API** após deploy
7. ✅ **Configurar domínio customizado** (opcional)

## 🚨 Notas Importantes

- O projeto está configurado para usar `nprocess` como Project ID
- Todas as configurações estão prontas no código
- O Dockerfile está configurado corretamente
- O cloudbuild.yaml está pronto para uso
- Apenas falta habilitar billing para prosseguir

---

**Última atualização**: 2025-12-22  
**Status**: Commit ✅ | Deploy ⏳ (Aguardando billing)

