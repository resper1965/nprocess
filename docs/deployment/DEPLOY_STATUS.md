# Status do Deploy - n.process

**Data**: 27 de Dezembro de 2024  
**Ambiente**: Desenvolvimento (dev)

## ✅ Serviços Deployados

### 1. n.process API (Cloud Run)
- **URL**: https://nprocess-api-dev-5wqihg7s7a-uc.a.run.app
- **Health Check**: https://nprocess-api-dev-5wqihg7s7a-uc.a.run.app/health
- **Documentação**: https://nprocess-api-dev-5wqihg7s7a-uc.a.run.app/docs
- **Status**: ✅ Funcionando
- **Região**: us-central1
- **Recursos**: 1Gi RAM, 1 CPU, 0-3 instâncias

### 2. Admin Control Plane (Cloud Run)
- **URL**: https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app
- **Health Check**: https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app/health
- **Documentação**: https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app/docs
- **Status**: ✅ Funcionando
- **Região**: us-central1
- **Recursos**: 1Gi RAM, 1 CPU, 0-3 instâncias
- **Database**: Cloud SQL PostgreSQL conectado

### 3. Client Portal (Firebase Hosting)
- **URL Principal**: https://nprocess-33a44.web.app
- **URL Alternativa**: https://nprocess-33a44.firebaseapp.com
- **Status**: ✅ Deployado
- **Build**: Export estático (247 arquivos)
- **Configuração**: Firebase Hosting com headers de segurança

## 🗄️ Infraestrutura

### Cloud SQL PostgreSQL
- **Instância**: nprocess-db-dev
- **Versão**: PostgreSQL 15
- **Região**: us-central1-c
- **Tier**: db-f1-micro
- **IP Público**: 34.60.255.52
- **Banco de Dados**: nprocess
- **Usuário**: nprocess_admin
- **Senha**: Salva no Secret Manager (nprocess-db-password)

## 🔧 Configurações

### Variáveis de Ambiente

#### n.process API
- `GCP_PROJECT_ID=nprocess`
- `GOOGLE_CLOUD_PROJECT=nprocess`
- `APP_ENV=dev`
- `VERTEX_AI_LOCATION=us-central1`
- `VERTEX_AI_MODEL=gemini-1.5-pro-002`
- `FIRESTORE_DATABASE=(default)`

#### Admin Control Plane
- `GCP_PROJECT_ID=nprocess`
- `GOOGLE_CLOUD_PROJECT=nprocess`
- `APP_ENV=dev`
- `DATABASE_URL=postgresql://nprocess_admin:***@34.60.255.52:5432/nprocess`

#### Client Portal (Firebase)
- `NEXT_PUBLIC_API_URL=https://nprocess-api-dev-5wqihg7s7a-uc.a.run.app`
- `NEXT_PUBLIC_ADMIN_API_URL=https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-33a44`
- Configurações Firebase (API Key, Auth Domain, etc.)

## 📋 Comandos Úteis

### Ver Logs
```bash
# API
gcloud run services logs read nprocess-api-dev --region us-central1 --limit 50

# Admin API
gcloud run services logs read nprocess-admin-api-dev --region us-central1 --limit 50

# Client Portal (Firebase)
firebase hosting:channel:list
```

### Atualizar Deploy

#### API e Admin API
```bash
./deploy-gcp.sh dev yes
```

#### Client Portal (Firebase)
```bash
cd client-portal
npm run build
cd ..
firebase deploy --only hosting:client-portal
```

### Verificar Status
```bash
# Cloud Run
gcloud run services list --region us-central1

# Firebase
firebase hosting:sites:list
```

## 🔐 Segurança

### Headers Configurados (Firebase Hosting)
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy

### Cloud Run
- Security Headers Middleware
- CORS configurado
- Trusted Host Middleware

## 📝 Próximos Passos

1. **Configurar Domínio Customizado**
   - Configurar DNS para Firebase Hosting
   - Configurar domínio para Cloud Run (se necessário)

2. **Produção**
   - Ajustar recursos (memória/CPU)
   - Configurar Cloud SQL com conexão privada
   - Habilitar autenticação nos serviços
   - Configurar limites de orçamento

3. **Monitoramento**
   - Configurar alertas no Cloud Monitoring
   - Configurar dashboards
   - Configurar uptime checks

## 🔗 Links Úteis

- **Firebase Console**: https://console.firebase.google.com/project/nprocess-33a44/overview
- **GCP Console**: https://console.cloud.google.com/
- **Cloud Run**: https://console.cloud.google.com/run?project=nprocess
- **Cloud SQL**: https://console.cloud.google.com/sql/instances?project=nprocess

## 📞 Suporte

Para problemas ou dúvidas:
- Issues: https://github.com/resper1965/nprocess/issues
- Email: suporte@ness.com.br

