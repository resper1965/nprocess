# 🌐 URLs de Produção - n.process

**Data**: 27 de Dezembro de 2024

---

## 🔗 URLs Principais

### Client Portal (Firebase Hosting)
- **URL Principal**: https://nprocess-8e801.web.app
- **URL Alternativa**: https://nprocess-8e801.firebaseapp.com
- **Custom Domain**: https://nprocess.ness.com.br (após configurar DNS)
- **Login**: https://nprocess-8e801.web.app/login
- **Dashboard**: https://nprocess-8e801.web.app/dashboard

### n.process API (Cloud Run)
- **URL**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app
- **Health Check**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app/health
- **Documentação**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app/docs
- **ReDoc**: https://nprocess-api-prod-fur76izi3a-uc.a.run.app/redoc

### Admin Control Plane (Cloud Run)
- **URL**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app
- **Health Check**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/health
- **Documentação**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/docs
- **ReDoc**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/redoc

---

## 🔐 Admin Console

- **Admin Overview**: https://nprocess-8e801.web.app/admin/overview
- **API Keys Management**: https://nprocess-8e801.web.app/admin/api-keys
- **Services**: https://nprocess-8e801.web.app/admin/services
- **FinOps**: https://nprocess-8e801.web.app/admin/finops

---

## 📊 Consoles

### Firebase Console
- **Projeto**: https://console.firebase.google.com/project/nprocess-8e801/overview
- **Authentication**: https://console.firebase.google.com/project/nprocess-8e801/authentication
- **Hosting**: https://console.firebase.google.com/project/nprocess-8e801/hosting
- **Firestore**: https://console.firebase.google.com/project/nprocess-8e801/firestore

### Google Cloud Console
- **Projeto**: https://console.cloud.google.com/home/dashboard?project=nprocess-prod
- **Cloud Run**: https://console.cloud.google.com/run?project=nprocess-prod
- **Cloud SQL**: https://console.cloud.google.com/sql/instances?project=nprocess-prod
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=nprocess-prod

---

## 🔧 APIs

### Endpoints Principais

#### n.process API
```
GET  /health
GET  /docs
GET  /redoc
POST /v1/analyze
POST /v1/generate
POST /v1/admin/ingest
```

#### Admin Control Plane
```
GET  /health
GET  /docs
GET  /v1/admin/stats
GET  /v1/admin/users
POST /v1/admin/set-super-admin/{uid}
```

---

## 📝 Notas

- **Client Portal**: Deployado no Firebase Hosting (`nprocess-8e801`)
- **APIs**: Deployadas no Cloud Run (`nprocess-prod`)
- **Custom Domain**: `nprocess.ness.com.br` (configurar no Firebase Console)
- **SSL/TLS**: Automático via Firebase e Cloud Run

---

**Última Atualização**: 27 de Dezembro de 2024

