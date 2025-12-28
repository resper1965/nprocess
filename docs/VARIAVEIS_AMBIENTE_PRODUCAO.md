# 🔐 Variáveis de Ambiente - Produção

**Data**: 27 de Dezembro de 2024  
**Ambiente**: Produção (`nprocess-prod`)

---

## 📋 Índice

1. [n.process API](#nprocess-api)
2. [Admin Control Plane](#admin-control-plane)
3. [Client Portal](#client-portal)
4. [Firebase](#firebase)
5. [Cloud SQL](#cloud-sql)
6. [Secrets Manager](#secrets-manager)

---

## 🚀 n.process API

### Variáveis Obrigatórias

```bash
# Google Cloud Platform
GCP_PROJECT_ID=nprocess-prod
GOOGLE_CLOUD_PROJECT=nprocess-prod
APP_ENV=production

# Vertex AI
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro-002

# Firestore
FIRESTORE_DATABASE=(default)
FIRESTORE_PROJECT_ID=nprocess-prod

# Logging
LOG_LEVEL=INFO

# CORS (Produção - apenas domínios permitidos)
CORS_ORIGINS=https://nprocess.ness.com.br,https://app.nprocess.ness.com.br
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization

# Performance
MAX_REQUEST_SIZE=10000000  # 10 MB
AI_TIMEOUT_SECONDS=120
DB_TIMEOUT_SECONDS=30

# AI Configuration
AI_TEMPERATURE=0.2
AI_TOP_P=0.95
AI_TOP_K=40
AI_MAX_OUTPUT_TOKENS=8192
```

### Variáveis Opcionais

```bash
# Server
HOST=0.0.0.0
PORT=8080
DEBUG=false
```

---

## 🛠️ Admin Control Plane

### Variáveis Obrigatórias

```bash
# Google Cloud Platform
GCP_PROJECT_ID=nprocess-prod
GOOGLE_CLOUD_PROJECT=nprocess-prod
APP_ENV=production

# Database
DATABASE_URL=postgresql://nprocess_admin:***@/nprocess?host=/cloudsql/nprocess-prod:us-central1:nprocess-db-prod
# OU (se usando IP público)
DATABASE_URL=postgresql://nprocess_admin:***@DB_IP:5432/nprocess

# Firebase Admin SDK (via Secret Manager)
GOOGLE_APPLICATION_CREDENTIALS=/secrets/firebase-admin-key.json
# OU usar Application Default Credentials

# CORS (Produção)
ALLOWED_ORIGINS=https://nprocess.ness.com.br,https://app.nprocess.ness.com.br

# API Configuration
API_V1_PREFIX=/v1
```

### Variáveis Opcionais

```bash
# Redis (se usar cache)
REDIS_URL=redis://REDIS_IP:6379/1

# Logging
LOG_LEVEL=INFO
```

---

## 🌐 Client Portal (Next.js)

### Variáveis Obrigatórias (NEXT_PUBLIC_*)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=*** # Do Firebase Console
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nprocess-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=*** # Do Firebase Console
NEXT_PUBLIC_FIREBASE_APP_ID=*** # Do Firebase Console
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-*** # Do Firebase Console

# API URLs
NEXT_PUBLIC_API_URL=https://nprocess-api-prod-XXXXX.run.app
NEXT_PUBLIC_ADMIN_API_URL=https://nprocess-admin-api-prod-XXXXX.run.app

# Google Cloud
NEXT_PUBLIC_GCP_PROJECT_ID=nprocess-prod
```

### Variáveis Opcionais

```bash
# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

---

## 🔥 Firebase

### Configuração do Projeto

```bash
# Firebase Project ID
FIREBASE_PROJECT_ID=nprocess-prod

# Firebase Admin SDK
# Credenciais via Secret Manager ou Application Default Credentials
```

### Firestore

```bash
# Database
FIRESTORE_DATABASE=(default)
FIRESTORE_PROJECT_ID=nprocess-prod
FIRESTORE_LOCATION=us-central1
```

### Firebase Auth

```bash
# Configurado via Firebase Console
# Não requer variáveis de ambiente adicionais
```

---

## 🗄️ Cloud SQL

### Configuração da Instância

```bash
# Instance
CLOUD_SQL_INSTANCE=nprocess-db-prod
CLOUD_SQL_REGION=us-central1
CLOUD_SQL_CONNECTION_NAME=nprocess-prod:us-central1:nprocess-db-prod

# Database
DB_NAME=nprocess
DB_USER=nprocess_admin
DB_PASSWORD=*** # Via Secret Manager

# Connection String (Unix Socket - Cloud Run)
DATABASE_URL=postgresql://nprocess_admin:***@/nprocess?host=/cloudsql/nprocess-prod:us-central1:nprocess-db-prod

# Connection String (IP Público - Desenvolvimento)
DATABASE_URL=postgresql://nprocess_admin:***@DB_IP:5432/nprocess
```

---

## 🔑 Secrets Manager

### Secrets a Criar

```bash
# Database
nprocess-db-password-prod          # Senha do PostgreSQL
nprocess-db-root-password-prod     # Senha root (se necessário)

# API Keys
gemini-api-key-prod               # Chave da API Gemini
google-api-key-prod               # Chave da API Google (se necessário)

# Firebase
firebase-admin-key-prod           # Service Account Key do Firebase Admin SDK

# JWT (se usar)
jwt-secret-key-prod               # Chave secreta para JWT

# Outros
redis-password-prod               # Senha do Redis (se usar)
```

### Como Criar Secrets

```bash
# Exemplo: Criar secret de senha do banco
echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create nprocess-db-password-prod \
  --data-file=- \
  --replication-policy="automatic" \
  --project=nprocess-prod

# Exemplo: Criar secret de API key
echo -n "YOUR_API_KEY" | \
  gcloud secrets create gemini-api-key-prod \
  --data-file=- \
  --replication-policy="automatic" \
  --project=nprocess-prod
```

---

## 📝 Template de .env.production

### n.process API

```bash
# .env.production (n.process API)
GCP_PROJECT_ID=nprocess-prod
GOOGLE_CLOUD_PROJECT=nprocess-prod
APP_ENV=production
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro-002
FIRESTORE_DATABASE=(default)
LOG_LEVEL=INFO
CORS_ORIGINS=https://nprocess.ness.com.br,https://app.nprocess.ness.com.br
```

### Admin Control Plane

```bash
# .env.production (Admin Control Plane)
GCP_PROJECT_ID=nprocess-prod
GOOGLE_CLOUD_PROJECT=nprocess-prod
APP_ENV=production
DATABASE_URL=postgresql://nprocess_admin:***@/nprocess?host=/cloudsql/nprocess-prod:us-central1:nprocess-db-prod
ALLOWED_ORIGINS=https://nprocess.ness.com.br,https://app.nprocess.ness.com.br
```

### Client Portal

```bash
# .env.production (Client Portal)
NEXT_PUBLIC_FIREBASE_API_KEY=***
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nprocess-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=***
NEXT_PUBLIC_FIREBASE_APP_ID=***
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-***
NEXT_PUBLIC_API_URL=https://nprocess-api-prod-XXXXX.run.app
NEXT_PUBLIC_ADMIN_API_URL=https://nprocess-admin-api-prod-XXXXX.run.app
NEXT_PUBLIC_GCP_PROJECT_ID=nprocess-prod
NODE_ENV=production
```

---

## ⚠️ Segurança

### Boas Práticas

1. **Nunca commitar** arquivos `.env` no Git
2. **Usar Secret Manager** para todos os secrets sensíveis
3. **Rotacionar secrets** regularmente (mensalmente)
4. **Usar Application Default Credentials** quando possível
5. **Limitar acesso** aos secrets via IAM
6. **Auditar** acesso aos secrets regularmente

### Checklist de Segurança

- [ ] Todos os secrets no Secret Manager
- [ ] `.env` files no `.gitignore`
- [ ] Secrets rotacionados antes do deploy
- [ ] IAM roles configurados corretamente
- [ ] CORS configurado apenas para domínios permitidos
- [ ] Rate limiting configurado

---

## 🔄 Como Obter Valores

### Firebase

1. Acessar [Firebase Console](https://console.firebase.google.com)
2. Selecionar projeto `nprocess-prod`
3. Ir em Project Settings > General
4. Copiar valores de configuração

### Cloud SQL

1. Acessar [Cloud SQL Console](https://console.cloud.google.com/sql)
2. Selecionar instância `nprocess-db-prod`
3. Verificar connection name e IP

### Cloud Run URLs

1. Após deploy, obter URLs:
   ```bash
   gcloud run services describe nprocess-api-prod \
     --region us-central1 \
     --format='value(status.url)' \
     --project=nprocess-prod
   ```

---

**Última Atualização**: 27 de Dezembro de 2024  
**Versão**: 1.0.0

