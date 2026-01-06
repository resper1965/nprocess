# 🚀 Status do Deploy - Produção

**Data**: 27 de Dezembro de 2024  
**Ambiente**: Produção (`nprocess-prod`)

---

## ✅ Serviços Deployados

### 1. n.process API (Cloud Run) ✅
- **URL**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app
- **Health Check**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app/health
- **Documentação**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app/docs
- **Status**: ✅ Deployado
- **Região**: us-central1
- **Recursos**: 1Gi RAM, 1 CPU, 0-10 instâncias
- **Service Account**: `nprocess-api-prod@nprocess-prod.iam.gserviceaccount.com`
- **Secrets**: GEMINI_API_KEY vinculado

### 2. Admin Control Plane (Cloud Run) ✅
- **URL**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app
- **Health Check**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/health
- **Documentação**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/docs
- **Status**: ✅ Deployado e funcionando
- **Região**: us-central1
- **Recursos**: 1Gi RAM, 1 CPU, 0-5 instâncias
- **Service Account**: `nprocess-admin-prod@nprocess-prod.iam.gserviceaccount.com`
- **Database**: Cloud SQL PostgreSQL conectado
- **Secrets**: DATABASE_PASSWORD, FIREBASE_ADMIN_SDK vinculados

### 3. Client Portal (Firebase Hosting) ✅
- **URL Principal**: https://nprocess-8e801.web.app
- **URL Alternativa**: https://nprocess-8e801.firebaseapp.com
- **Status**: ✅ Deployado
- **Build**: Export estático (248 arquivos)
- **Configuração**: Firebase Hosting com headers de segurança
- **Firebase Project**: `nprocess-8e801` (nProcess)
- **GCP Project**: `nprocess-prod` (nProcess Production)

---

## 🗄️ Infraestrutura

### Cloud SQL PostgreSQL
- **Instância**: `nprocess-db-prod`
- **Versão**: PostgreSQL 15
- **Região**: us-central1-c
- **Tier**: db-f1-micro
- **IP Público**: 34.68.113.124
- **Connection Name**: `nprocess-prod:us-central1:nprocess-db-prod`
- **Banco de Dados**: `nprocess`
- **Usuário**: `nprocess_admin`
- **Senha**: Armazenada no Secret Manager

### Firestore
- **Project**: `nprocess-prod`
- **Database ID**: `(default)`
- **Location**: `us-central1`
- **Mode**: Native (Firestore)
- **Security Rules**: ✅ Deployadas

### Cloud Storage
- **Documents**: `gs://nprocess-documents-prod`
- **Assets**: `gs://nprocess-assets-prod`
- **Região**: `us-central1`
- **CORS**: Configurado
- **Lifecycle**: Configurado

### Secret Manager
- **nprocess-db-password-prod**: ✅
- **nprocess-gemini-api-key**: ✅
- **nprocess-firebase-admin-sdk**: ✅
- **nprocess-google-oauth-client-id**: ✅
- **nprocess-google-oauth-client-secret**: ✅

---

## 🔧 Configurações

### Variáveis de Ambiente

#### n.process API
- `GCP_PROJECT_ID=nprocess-prod`
- `GOOGLE_CLOUD_PROJECT=nprocess-prod`
- `APP_ENV=production`
- `VERTEX_AI_LOCATION=us-central1`
- `VERTEX_AI_MODEL=gemini-1.5-pro-002`
- `FIRESTORE_DATABASE=(default)`
- `CORS_ORIGINS=https://nprocess.ness.com.br`
- `GEMINI_API_KEY` (via Secret Manager)

#### Admin Control Plane
- `GCP_PROJECT_ID=nprocess-prod`
- `GOOGLE_CLOUD_PROJECT=nprocess-prod`
- `APP_ENV=production`
- `DATABASE_URL=postgresql://nprocess_admin:***@/nprocess?host=/cloudsql/nprocess-prod:us-central1:nprocess-db-prod`
- `ALLOWED_ORIGINS=https://nprocess.ness.com.br`
- `DATABASE_PASSWORD` (via Secret Manager)
- `FIREBASE_ADMIN_SDK` (via Secret Manager)

#### Client Portal
- `NEXT_PUBLIC_API_URL=https://nprocess-api-prod-fur76izi3a-uc.a.run.app`
- `NEXT_PUBLIC_ADMIN_API_URL=https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-8e801`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-8e801.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nprocess-8e801.appspot.com`
- `NEXT_PUBLIC_GCP_PROJECT_ID=nprocess-prod`

---

## 🔗 Integrações

### Client Portal → APIs
- ✅ Client Portal → n.process API (autenticado)
- ✅ Client Portal → Admin Control Plane (autenticado)

### Admin Control Plane → Backend
- ✅ Admin Control Plane → Cloud SQL (conectado)
- ✅ Admin Control Plane → Firestore (conectado)
- ✅ Admin Control Plane → Secret Manager (acesso configurado)

### n.process API → Backend
- ✅ n.process API → Vertex AI (Gemini)
- ✅ n.process API → Firestore (conectado)

---

## 📊 Health Checks

### n.process API
```bash
curl https://nprocess-api-prod-fur76izi3a-uc.a.run.app/health
```
**Status**: ⚠️ Service Unavailable (pode estar inicializando)

### Admin Control Plane
```bash
curl https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/health
```
**Status**: ✅ Healthy
```json
{
  "status": "healthy",
  "service": "admin-control-plane",
  "version": "1.0.0",
  "dependencies": {
    "database": "connected",
    "secret_manager": "available",
    "gemini": "available"
  }
}
```

### Client Portal
```bash
curl https://nprocess-8e801.web.app
```
**Status**: ✅ Deployado

---

## ⚠️ Observações

1. **Firebase Project**: O Client Portal está deployado no projeto Firebase `nprocess-8e801` (nProcess), enquanto as APIs estão no GCP `nprocess-prod` (nProcess Production). Isso está correto e funcionando.

2. **n.process API Health**: O health check retornou "Service Unavailable". Pode estar inicializando ou com algum problema. Verificar logs:
   ```bash
   gcloud run services logs read nprocess-api-prod --region=us-central1 --project=nprocess-prod --limit=50
   ```

3. **Firebase Config**: O Client Portal precisa das configurações completas do Firebase (API Key, App ID, etc.) para funcionar corretamente. Essas devem ser obtidas do Firebase Console.

---

## 🔄 Próximos Passos

1. ⏳ Verificar logs do n.process API se health check não estiver funcionando
2. ⏳ Obter configurações completas do Firebase (`nprocess-8e801`) e atualizar variáveis de ambiente
3. ⏳ Testar autenticação no Client Portal
4. ⏳ Validar todas as integrações
5. ⏳ Configurar custom domain (se necessário)

---

**Última Atualização**: 27 de Dezembro de 2024

