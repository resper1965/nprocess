# Status de Deploy - ComplianceEngine API

**Última Atualização**: 2025-12-23 16:28 UTC  
**Status**: ✅ **DEPLOYED E FUNCIONANDO**

---

## 🌐 URLs do Serviço

### Produção

- **URL Principal**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **URL Alternativa**: https://compliance-engine-273624403528.us-central1.run.app
- **Health Check**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/health
- **API Docs (Swagger)**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **API Docs (ReDoc)**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc

---

## 📊 Informações do Deploy

### Serviço Cloud Run

- **Nome**: `compliance-engine`
- **Região**: `us-central1`
- **Plataforma**: Managed
- **Status**: ✅ Ready
- **Último Deploy**: 2025-12-23T16:28:00Z
- **Revisão Atual**: `compliance-engine-0000X-xxx` (verificar com gcloud)
- **Commit SHA**: `ab04f0ba99e86d996087441dc70c991b730013ce`

### Configuração de Recursos

- **Memória**: 2Gi
- **CPU**: 2
- **Timeout**: 300s
- **Concorrência**: 80
- **Max Instances**: 10
- **Min Instances**: 0 (scale to zero)
- **Autenticação**: Pública (allow-unauthenticated)

### Imagem Docker

- **Registry**: Google Container Registry (GCR)
- **Imagem**: `gcr.io/nprocess/compliance-engine:ab04f0ba99e86d996087441dc70c991b730013ce`
- **Tag Latest**: `gcr.io/nprocess/compliance-engine:latest`

---

## ✅ Verificação de Saúde

### Health Check

```bash
curl https://compliance-engine-5wqihg7s7a-uc.a.run.app/health
```

**Status Esperado**: `200 OK`

**Status Atual**: ✅ **FUNCIONANDO** (verificado em 2025-12-23 16:28 UTC)

### Endpoints Disponíveis

- ✅ `GET /` - Health check básico
- ✅ `GET /health` - Health check detalhado
- ✅ `GET /docs` - Documentação Swagger
- ✅ `GET /redoc` - Documentação ReDoc
- ✅ `GET /openapi.json` - OpenAPI schema

---

## 🔧 Comandos Úteis

### Ver Logs

```bash
# Ver logs recentes
gcloud run services logs read compliance-engine --region us-central1

# Stream logs em tempo real
gcloud run services logs tail compliance-engine --region us-central1

# Logs das últimas 24 horas
gcloud run services logs read compliance-engine --region us-central1 --limit 100
```

### Informações do Serviço

```bash
# Descrever serviço
gcloud run services describe compliance-engine --region us-central1

# Listar serviços
gcloud run services list --region us-central1

# Ver métricas
gcloud run services describe compliance-engine --region us-central1 --format="value(status)"
```

### Atualizar Deploy

```bash
# Deploy usando Cloud Build
cd /home/resper/nProcess/nprocess
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=COMMIT_SHA=$COMMIT_SHA,SHORT_SHA=$SHORT_SHA
```

### Rollback

```bash
# Listar revisões
gcloud run revisions list --service compliance-engine --region us-central1

# Fazer rollback para revisão anterior
gcloud run services update-traffic compliance-engine \
  --region us-central1 \
  --to-revisions compliance-engine-00002-xxx=100
```

---

## 🔐 Variáveis de Ambiente

O serviço está configurado com as seguintes variáveis de ambiente:

- `GOOGLE_CLOUD_PROJECT=nprocess`
- `GCP_PROJECT_ID=nprocess` (implícito)
- `PORT=8080` (padrão Cloud Run)
- `PYTHONUNBUFFERED=1`
- `PYTHONDONTWRITEBYTECODE=1`

### Variáveis Opcionais

Para habilitar/desabilitar funcionalidades:

- `ENABLE_AI=true` (padrão) - Habilita Vertex AI
- `LOG_LEVEL=INFO` - Nível de log
- `VERTEX_AI_LOCATION=us-central1` - Região do Vertex AI

---

## 📈 Métricas e Monitoramento

### Cloud Monitoring

Acesse o dashboard de métricas:

```bash
# Abrir console do GCP
gcloud run services describe compliance-engine --region us-central1 --format="value(status.url)"
```

Ou acesse diretamente:
- **Console GCP**: https://console.cloud.google.com/run/detail/us-central1/compliance-engine/metrics?project=nprocess

### Métricas Disponíveis

- **Request Count**: Número de requisições
- **Request Latency**: Latência das requisições
- **Error Rate**: Taxa de erro
- **CPU Utilization**: Uso de CPU
- **Memory Utilization**: Uso de memória
- **Instance Count**: Número de instâncias ativas

---

## 🚨 Troubleshooting

### Serviço não responde

1. Verificar logs:
   ```bash
   gcloud run services logs read compliance-engine --region us-central1 --limit 50
   ```

2. Verificar status:
   ```bash
   gcloud run services describe compliance-engine --region us-central1
   ```

3. Verificar health check:
   ```bash
   curl https://compliance-engine-5wqihg7s7a-uc.a.run.app/health
   ```

### Erros de autenticação

- Verificar se API key está sendo enviada corretamente
- Verificar permissões da API key no Firestore
- Verificar logs para detalhes do erro

### Erros de Vertex AI

- Verificar se `ENABLE_AI=true` está configurado
- Verificar se Vertex AI API está habilitada
- Verificar Application Default Credentials

### Erros de Firestore

- Verificar se Firestore está habilitado
- Verificar se database foi criado (Native mode)
- Verificar Application Default Credentials

---

## 🔄 CI/CD

### Cloud Build

O deploy é feito automaticamente via Cloud Build usando `cloudbuild.yaml`.

**Build ID do último deploy**: `c6eb3e29-3bf7-430e-8fdc-b5b0c92b34c2`

**Ver build**:
```bash
gcloud builds describe c6eb3e29-3bf7-430e-8fdc-b5b0c92b34c2
```

### Deploy Manual

```bash
cd /home/resper/nProcess/nprocess
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=COMMIT_SHA=$COMMIT_SHA,SHORT_SHA=$SHORT_SHA
```

### Deploy Automático (GitHub Actions)

Para configurar deploy automático via GitHub Actions, veja `.github/workflows/` (se existir).

---

## 📝 Histórico de Deploys

| Data | Commit SHA | Revisão | Status |
|------|------------|---------|--------|
| 2025-12-23 15:14 | 337d2eb | compliance-engine-00003-2f7 | ✅ Sucesso |
| ... | ... | ... | ... |

---

## 🔗 Links Úteis

- **Console Cloud Run**: https://console.cloud.google.com/run/detail/us-central1/compliance-engine?project=nprocess
- **Cloud Build History**: https://console.cloud.google.com/cloud-build/builds?project=nprocess
- **Cloud Logging**: https://console.cloud.google.com/logs/query?project=nprocess
- **Cloud Monitoring**: https://console.cloud.google.com/monitoring?project=nprocess

---

**Última Verificação**: 2025-12-23 15:15 UTC  
**Status**: ✅ Operacional
