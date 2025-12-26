# Cost Optimization - GCP Services Cleanup

**Data**: 2025-12-26  
**Status**: ✅ Limpeza Concluída

---

## 🗑️ Recursos Deletados

### Cloud Run Services (Antigos - Não Utilizados)
- ✅ `compliance-engine` - Deletado
- ✅ `compliance-engine-admin-dashboard` - Deletado  
- ✅ `compliance-engine-frontend` - Deletado (agora no Firebase Hosting)

**Economia estimada**: ~$30-50/mês (3 serviços com min-instances=0, mas ainda gerando custos de cold start)

### Container Registry Images (Antigas)
- ✅ `gcr.io/nprocess/compliance-engine` - Todas as imagens deletadas
- ✅ `gcr.io/nprocess/compliance-engine-admin-dashboard` - Todas as imagens deletadas
- ✅ `gcr.io/nprocess/compliance-engine-frontend` - Todas as imagens deletadas

**Economia estimada**: ~$5-10/mês (armazenamento de imagens)  
**Status**: ✅ Todas as imagens antigas deletadas

### APIs Desabilitadas (Não Utilizadas)
- ✅ `bigquery.googleapis.com` e todas as APIs relacionadas (8 APIs)
- ✅ `dataform.googleapis.com`
- ✅ `dataplex.googleapis.com`
- ✅ `analyticshub.googleapis.com`
- ✅ `analytics.googleapis.com`

**Economia estimada**: Redução de overhead de APIs não utilizadas

---

## ✅ Recursos Mantidos (Em Uso)

### Cloud Run Services
- ✅ `compliance-engine-api` - **Em uso** (v2.0.0)
  - URL: https://compliance-engine-api-5wqihg7s7a-uc.a.run.app
  - Config: 2Gi RAM, 2 CPU, min=0, max=10

### Storage Buckets (Necessários)
- ✅ `gs://nprocess_cloudbuild` - Usado pelo Cloud Build
- ✅ `gs://run-sources-nprocess-us-central1` - Usado pelo Cloud Run source deploy

### APIs Mantidas (Em Uso)
- ✅ `run.googleapis.com` - Cloud Run
- ✅ `firebase.googleapis.com` - Firebase Hosting
- ✅ `firestore.googleapis.com` - Firestore Database
- ✅ `aiplatform.googleapis.com` - Vertex AI
- ✅ `cloudbuild.googleapis.com` - Cloud Build
- ✅ `artifactregistry.googleapis.com` - Container Registry
- ✅ `logging.googleapis.com` - Cloud Logging
- ✅ `monitoring.googleapis.com` - Cloud Monitoring
- ✅ `secretmanager.googleapis.com` - Secret Manager
- ✅ `storage.googleapis.com` - Cloud Storage
- ✅ `iam.googleapis.com` - IAM
- ✅ `cloudtrace.googleapis.com` - Cloud Trace
- ✅ `pubsub.googleapis.com` - Pub/Sub (usado por Firebase Functions)
- ✅ `fcm.googleapis.com` - Firebase Cloud Messaging

---

## 📊 Resumo de Economia

| Categoria | Recursos Deletados | Economia Estimada |
|-----------|-------------------|-------------------|
| Cloud Run Services | 3 serviços antigos | $30-50/mês |
| Container Images | 3 repositórios | $5-10/mês |
| APIs Desabilitadas | 11 APIs | Redução de overhead |
| **TOTAL** | - | **$35-60/mês** |

---

## 🎯 Próximos Passos Recomendados

1. **Configurar Lifecycle Policy** nos buckets de storage para deletar arquivos antigos automaticamente
2. **Monitorar custos** via Cloud Billing Dashboard
3. **Configurar alertas de billing** para evitar surpresas
4. **Revisar periodicamente** serviços não utilizados (mensalmente)

---

## 📝 Notas

- Os buckets `nprocess_cloudbuild` e `run-sources-nprocess-us-central1` são **necessários** e não devem ser deletados
- O serviço `compliance-engine-api` é o único Cloud Run service ativo e necessário
- Firebase Hosting substituiu os serviços Cloud Run para frontend/admin-dashboard

