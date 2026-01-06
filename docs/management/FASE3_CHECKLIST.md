# 🚀 Fase 3: Deploy dos Serviços - Checklist

**Data de Início**: 27 de Dezembro de 2024  
**Status**: 🟡 Em Progresso

---

## 📋 Checklist de Deploy

### n.process API (Cloud Run)
- [ ] Dockerfile validado
- [ ] Build da imagem testado localmente
- [ ] Imagem pushada para Artifact Registry
- [ ] Service criado no Cloud Run
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets vinculados
- [ ] Service Account configurado
- [ ] Cloud SQL connection configurada
- [ ] Health check validado
- [ ] URL de produção obtida

### Admin Control Plane (Cloud Run)
- [ ] Dockerfile validado
- [ ] Build da imagem testado localmente
- [ ] Imagem pushada para Artifact Registry
- [ ] Service criado no Cloud Run
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets vinculados (DATABASE_URL, Firebase Admin SDK)
- [ ] Service Account configurado
- [ ] Cloud SQL connection configurada
- [ ] Health check validado
- [ ] URL de produção obtida

### Client Portal (Firebase Hosting)
- [x] Build do Next.js testado localmente ✅
- [x] Variáveis de ambiente NEXT_PUBLIC_* configuradas ✅
- [x] Firebase configurado para o projeto ✅ (`nprocess-8e801`)
- [x] Deploy para Firebase Hosting ✅
- [x] URL de produção obtida ✅ (https://nprocess-8e801.web.app)
- [ ] Custom domain configurado (se necessário)
- [x] SSL/TLS validado ✅ (automático via Firebase)

---

## 🔐 Checklist de Configuração

### Variáveis de Ambiente

#### n.process API
- [ ] `GCP_PROJECT_ID=nprocess-prod`
- [ ] `GOOGLE_CLOUD_PROJECT=nprocess-prod`
- [ ] `APP_ENV=production`
- [ ] `VERTEX_AI_LOCATION=us-central1`
- [ ] `VERTEX_AI_MODEL=gemini-1.5-pro-002`
- [ ] `FIRESTORE_DATABASE=(default)`
- [ ] `CORS_ORIGINS=https://nprocess.ness.com.br`
- [ ] Secrets: `GEMINI_API_KEY` (via Secret Manager)

#### Admin Control Plane
- [ ] `GCP_PROJECT_ID=nprocess-prod`
- [ ] `GOOGLE_CLOUD_PROJECT=nprocess-prod`
- [ ] `APP_ENV=production`
- [ ] `DATABASE_URL` (via Secret Manager ou variável)
- [ ] `ALLOWED_ORIGINS=https://nprocess.ness.com.br`
- [ ] Secrets: `DATABASE_PASSWORD`, `FIREBASE_ADMIN_SDK` (via Secret Manager)

#### Client Portal
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-prod.firebaseapp.com`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-prod`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nprocess-prod.appspot.com`
- [ ] `NEXT_PUBLIC_API_URL` (URL do n.process API)
- [ ] `NEXT_PUBLIC_ADMIN_API_URL` (URL do Admin Control Plane)
- [ ] `NEXT_PUBLIC_GCP_PROJECT_ID=nprocess-prod`

---

## 🔗 Checklist de Conectividade

### Cloud SQL Connection
- [ ] Cloud SQL Proxy configurado (ou Private IP)
- [ ] Connection string testada
- [ ] Migrações de banco executadas
- [ ] Usuário de banco validado

### Firestore Connection
- [ ] Firestore database acessível
- [ ] Security Rules deployadas
- [ ] Indexes criados (se necessário)
- [ ] Teste de leitura/escrita realizado

### Vertex AI Connection
- [ ] Vertex AI API habilitada
- [ ] Service Account com permissões
- [ ] Teste de chamada à API realizado

---

## 📊 Checklist de Validação

### Health Checks
- [ ] n.process API: `/health` retorna 200
- [ ] Admin Control Plane: `/health` retorna 200
- [ ] Client Portal: Página inicial carrega

### Integração
- [ ] Client Portal → n.process API (autenticado)
- [ ] Client Portal → Admin Control Plane (autenticado)
- [ ] Admin Control Plane → Cloud SQL
- [ ] Admin Control Plane → Firestore
- [ ] n.process API → Vertex AI
- [ ] n.process API → Firestore

### Autenticação
- [ ] Firebase Auth funcionando
- [ ] Google Sign-In funcionando
- [ ] JWT tokens sendo gerados
- [ ] Custom claims (roles) funcionando

---

## 🔄 Próximos Passos

1. ⏳ Validar Dockerfiles
2. ⏳ Criar Artifact Registry repository
3. ⏳ Build e push das imagens
4. ⏳ Deploy n.process API
5. ⏳ Deploy Admin Control Plane
6. ⏳ Deploy Client Portal
7. ⏳ Configurar variáveis de ambiente
8. ⏳ Validar health checks
9. ⏳ Testar integrações

---

**Última Atualização**: 27 de Dezembro de 2024

