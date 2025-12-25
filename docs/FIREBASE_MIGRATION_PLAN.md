# Plano Detalhado de Migração para Firebase

**Data de Criação**: 2025-01-XX  
**Status**: 📋 Planejamento  
**Estimativa Total**: 4-6 semanas  
**Prioridade**: Alta (85% economia de custos)

---

## 📊 Visão Geral

### Objetivo
Migrar componentes do nProcess para Firebase, reduzindo custos em ~85% e simplificando a infraestrutura.

### Escopo
- ✅ Firebase Hosting (Admin Dashboard + Client Portal)
- ✅ Firebase Authentication (Client Portal)
- ✅ Firebase Storage (Backups e documentos)
- ✅ Firebase Functions (Webhooks e scheduled tasks)
- ✅ Firebase Cloud Messaging (Notificações)
- ✅ Firebase Analytics (Métricas)
- ✅ Firebase Crashlytics (Error tracking)

### Fora do Escopo
- ❌ ComplianceEngine API (mantém Cloud Run)
- ❌ Admin Control Plane (mantém Cloud Run + PostgreSQL)
- ❌ Vertex AI (mantém)

---

## 🎯 Fases da Migração

### Fase 1: Preparação e Setup (Semana 1)
### Fase 2: Firebase Hosting (Semana 2)
### Fase 3: Firebase Authentication (Semana 2-3)
### Fase 4: Firebase Storage (Semana 3)
### Fase 5: Firebase Functions (Semana 4)
### Fase 6: Firebase Cloud Messaging (Semana 4-5)
### Fase 7: Observability (Semana 5)
### Fase 8: Testes e Validação (Semana 6)

---

## 📅 Timeline Detalhado

```
Semana 1: Preparação
├── Dia 1-2: Setup Firebase Project
├── Dia 3-4: Análise de dependências
└── Dia 5: Criação de scripts de migração

Semana 2: Hosting + Auth (Início)
├── Dia 1-2: Firebase Hosting (Admin Dashboard)
├── Dia 3-4: Firebase Hosting (Client Portal)
└── Dia 5: Firebase Auth (Setup)

Semana 3: Auth + Storage
├── Dia 1-2: Firebase Auth (Implementação)
├── Dia 3: Migração de usuários
└── Dia 4-5: Firebase Storage

Semana 4: Functions + FCM
├── Dia 1-2: Firebase Functions (Webhooks)
├── Dia 3: Firebase Functions (Scheduled)
└── Dia 4-5: Firebase Cloud Messaging

Semana 5: Observability
├── Dia 1-2: Firebase Analytics
├── Dia 3: Firebase Crashlytics
└── Dia 4-5: Firebase Performance

Semana 6: Testes e Deploy
├── Dia 1-2: Testes de integração
├── Dia 3: Testes de carga
├── Dia 4: Deploy em produção
└── Dia 5: Monitoramento e ajustes
```

---

## 🔧 Fase 1: Preparação e Setup (Semana 1)

### 1.1 Setup Firebase Project

**Tarefas**:
- [ ] Criar projeto Firebase no GCP Console
- [ ] Habilitar APIs necessárias:
  - [ ] Firebase Authentication API
  - [ ] Cloud Firestore API (já habilitado)
  - [ ] Cloud Storage for Firebase API
  - [ ] Cloud Functions for Firebase API
  - [ ] Firebase Cloud Messaging API
  - [ ] Firebase Analytics API
  - [ ] Firebase Crashlytics API
- [ ] Configurar billing (Blaze plan - pay as you go)
- [ ] Criar service account para deploy
- [ ] Configurar IAM permissions

**Comandos**:
```bash
# Criar projeto Firebase
firebase projects:create nprocess-firebase --display-name "nProcess Firebase"

# Selecionar projeto
firebase use nprocess-firebase

# Inicializar Firebase
firebase init

# Habilitar APIs via gcloud
gcloud services enable \
  firebase.googleapis.com \
  firestore.googleapis.com \
  storage-component.googleapis.com \
  cloudfunctions.googleapis.com \
  fcm.googleapis.com \
  analytics.googleapis.com \
  crashlytics.googleapis.com \
  --project=nprocess
```

**Arquivos a Criar**:
- `firebase.json` (configuração Firebase)
- `.firebaserc` (projeto selecionado)
- `firebase-adminsdk.json` (service account key)

**Estimativa**: 1 dia

---

### 1.2 Análise de Dependências

**Tarefas**:
- [ ] Mapear todas as dependências do Admin Dashboard
- [ ] Mapear todas as dependências do Client Portal
- [ ] Identificar APIs que precisam ser mantidas no Cloud Run
- [ ] Listar todas as variáveis de ambiente
- [ ] Documentar endpoints que precisam de rewrite

**Checklist**:
```markdown
## Admin Dashboard
- [ ] Next.js 14.2.0
- [ ] NextAuth.js 4.24.5
- [ ] React Query
- [ ] Dependências de UI (Radix, Tailwind)

## Client Portal
- [ ] Next.js 14.2.15
- [ ] Auth context (custom)
- [ ] React Query
- [ ] Dependências de UI

## APIs
- [ ] ComplianceEngine API (mantém Cloud Run)
- [ ] Admin Control Plane (mantém Cloud Run)
- [ ] RegulatoryRAG API (mantém Cloud Run)
```

**Estimativa**: 1 dia

---

### 1.3 Scripts de Migração

**Tarefas**:
- [ ] Criar script de migração de usuários (PostgreSQL → Firebase Auth)
- [ ] Criar script de migração de arquivos (Cloud Storage → Firebase Storage)
- [ ] Criar script de backup antes da migração
- [ ] Criar script de rollback

**Arquivos a Criar**:
- `scripts/migrate-users-to-firebase.js`
- `scripts/migrate-storage-to-firebase.js`
- `scripts/backup-before-migration.sh`
- `scripts/rollback-migration.sh`

**Estimativa**: 2 dias

---

## 🌐 Fase 2: Firebase Hosting (Semana 2)

### 2.1 Admin Dashboard

**Tarefas**:
- [ ] Instalar Firebase CLI
- [ ] Configurar `firebase.json` para Admin Dashboard
- [ ] Configurar `next.config.js` para export estático
- [ ] Criar rewrites para API routes (se necessário)
- [ ] Testar build local
- [ ] Deploy em staging
- [ ] Testar em staging
- [ ] Deploy em produção
- [ ] Configurar custom domain (`admin.nprocess.ness.com.br`)
- [ ] Configurar SSL automático

**Arquivos a Modificar**:
```json
// firebase.json
{
  "hosting": {
    "public": "admin-dashboard/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "compliance-engine-api",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

```javascript
// admin-dashboard/next.config.js
const nextConfig = {
  output: 'export', // Static export
  images: {
    unoptimized: true // Firebase Hosting doesn't support Next.js Image Optimization
  },
  trailingSlash: true,
  // ... resto da config
}
```

**Comandos**:
```bash
cd admin-dashboard

# Build estático
npm run build

# Deploy
firebase deploy --only hosting:admin-dashboard

# Custom domain
firebase hosting:sites:create admin-dashboard
firebase hosting:channel:deploy production --only admin-dashboard
```

**Testes**:
- [ ] Testar todas as páginas
- [ ] Testar autenticação
- [ ] Testar API calls
- [ ] Testar performance (Lighthouse)
- [ ] Testar em diferentes browsers

**Rollback Plan**:
```bash
# Se algo der errado, voltar para Cloud Run
gcloud run deploy compliance-engine-admin-dashboard \
  --image=gcr.io/nprocess/compliance-engine-admin-dashboard:previous-version \
  --region=us-central1
```

**Estimativa**: 2 dias

---

### 2.2 Client Portal

**Tarefas**:
- [ ] Configurar `firebase.json` para Client Portal
- [ ] Configurar `next.config.js` para export estático
- [ ] Testar build local
- [ ] Deploy em staging
- [ ] Testar em staging
- [ ] Deploy em produção
- [ ] Configurar custom domain (`app.nprocess.ness.com.br`)

**Arquivos a Modificar**:
```json
// firebase.json (adicionar segundo site)
{
  "hosting": [
    {
      "target": "admin-dashboard",
      "public": "admin-dashboard/out",
      // ... config anterior
    },
    {
      "target": "client-portal",
      "public": "client-portal/out",
      "rewrites": [
        {
          "source": "/api/**",
          "run": {
            "serviceId": "compliance-engine-api",
            "region": "us-central1"
          }
        },
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

**Comandos**:
```bash
cd client-portal

# Build estático
npm run build

# Deploy
firebase deploy --only hosting:client-portal
```

**Estimativa**: 2 dias

---

## 🔐 Fase 3: Firebase Authentication (Semana 2-3)

### 3.1 Setup Firebase Auth

**Tarefas**:
- [ ] Habilitar providers no Firebase Console:
  - [ ] Email/Password
  - [ ] Google
  - [ ] GitHub (opcional)
- [ ] Configurar OAuth consent screen
- [ ] Configurar authorized domains
- [ ] Configurar email templates
- [ ] Configurar password reset

**Configuração**:
```bash
# Firebase Console → Authentication → Sign-in method
# Habilitar:
# - Email/Password
# - Google (OAuth)
```

**Estimativa**: 0.5 dia

---

### 3.2 Implementação no Client Portal

**Tarefas**:
- [ ] Instalar Firebase SDK
- [ ] Criar `lib/firebase-config.ts`
- [ ] Criar `lib/firebase-auth.ts`
- [ ] Atualizar `lib/auth-context.tsx` para usar Firebase Auth
- [ ] Atualizar página de login
- [ ] Atualizar página de registro
- [ ] Implementar password reset
- [ ] Implementar email verification
- [ ] Testar fluxo completo

**Arquivos a Criar/Modificar**:
```typescript
// client-portal/src/lib/firebase-config.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app
```

```typescript
// client-portal/src/lib/firebase-auth.ts
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  User
} from 'firebase/auth'
import { auth } from './firebase-config'

export const loginWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const registerWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  return await signInWithPopup(auth, provider)
}

export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email)
}

export const logout = async () => {
  return await signOut(auth)
}
```

**Package.json**:
```json
{
  "dependencies": {
    "firebase": "^10.7.1"
  }
}
```

**Variáveis de Ambiente**:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-firebase.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-firebase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nprocess-firebase.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Estimativa**: 2 dias

---

### 3.3 Migração de Usuários

**Tarefas**:
- [ ] Criar script de migração
- [ ] Exportar usuários do PostgreSQL
- [ ] Importar para Firebase Auth
- [ ] Criar perfis no Firestore
- [ ] Validar migração
- [ ] Notificar usuários (opcional)

**Script de Migração**:
```javascript
// scripts/migrate-users-to-firebase.js
const admin = require('firebase-admin')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

admin.initializeApp({
  credential: admin.credential.cert('./firebase-adminsdk.json')
})

async function migrateUsers() {
  // 1. Buscar usuários do PostgreSQL
  const result = await pool.query(`
    SELECT user_id, email, name, role, is_active, created_at
    FROM users
    WHERE is_active = true
  `)

  // 2. Importar para Firebase Auth
  const users = result.rows.map(user => ({
    uid: user.user_id,
    email: user.email,
    displayName: user.name,
    emailVerified: false,
    disabled: !user.is_active,
    customClaims: {
      role: user.role
    }
  }))

  // Import em batch (máximo 1000 por vez)
  for (let i = 0; i < users.length; i += 1000) {
    const batch = users.slice(i, i + 1000)
    await admin.auth().importUsers(batch, {
      hash: {
        algorithm: 'BCRYPT',
        // Se tiver os hashes originais
      }
    })
  }

  // 3. Criar perfis no Firestore
  const firestore = admin.firestore()
  for (const user of result.rows) {
    await firestore.collection('users').doc(user.user_id).set({
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      migrated_from: 'postgresql',
      migrated_at: admin.firestore.FieldValue.serverTimestamp()
    })
  }

  console.log(`Migrated ${result.rows.length} users`)
}

migrateUsers().then(() => process.exit(0))
```

**Estimativa**: 1 dia

---

## 📦 Fase 4: Firebase Storage (Semana 3)

### 4.1 Setup Firebase Storage

**Tarefas**:
- [ ] Criar buckets no Firebase Console
- [ ] Configurar Security Rules
- [ ] Configurar CORS
- [ ] Configurar lifecycle policies

**Security Rules**:
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Backups - apenas autenticados podem ler/escrever
    match /backups/{backupId} {
      allow read, write: if request.auth != null;
    }
    
    // Documentos - apenas o dono pode acessar
    match /documents/{userId}/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Templates públicos - todos podem ler
    match /templates/{templateId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

**Estimativa**: 0.5 dia

---

### 4.2 Migração de Arquivos

**Tarefas**:
- [ ] Criar script de migração
- [ ] Listar arquivos no Cloud Storage
- [ ] Copiar para Firebase Storage
- [ ] Validar integridade
- [ ] Atualizar referências no Firestore

**Script de Migração**:
```javascript
// scripts/migrate-storage-to-firebase.js
const admin = require('firebase-admin')
const { Storage } = require('@google-cloud/storage')

admin.initializeApp({
  credential: admin.credential.cert('./firebase-adminsdk.json')
})

const gcs = new Storage({ projectId: 'nprocess' })
const firebaseStorage = admin.storage()

async function migrateStorage() {
  // 1. Listar arquivos no Cloud Storage
  const bucket = gcs.bucket('nprocess-backups')
  const [files] = await bucket.getFiles({ prefix: 'backups/' })

  // 2. Copiar para Firebase Storage
  const firebaseBucket = firebaseStorage.bucket('nprocess-firebase.appspot.com')
  
  for (const file of files) {
    const destination = firebaseBucket.file(file.name)
    await file.copy(destination)
    console.log(`Migrated: ${file.name}`)
  }

  console.log(`Migrated ${files.length} files`)
}

migrateStorage().then(() => process.exit(0))
```

**Estimativa**: 1 dia

---

### 4.3 Atualizar Código

**Tarefas**:
- [ ] Atualizar `app/services/backup_service.py` para usar Firebase Storage
- [ ] Atualizar upload de documentos no Client Portal
- [ ] Testar upload/download
- [ ] Testar Security Rules

**Código Python**:
```python
# app/services/backup_service.py
from firebase_admin import storage as firebase_storage

# Antes
bucket = self.storage_client.bucket(BACKUP_BUCKET)
blob = bucket.blob(f"backups/{backup_id}.json.gz")

# Depois
bucket = firebase_storage.bucket()
blob = bucket.blob(f"backups/{backup_id}.json.gz")
```

**Código TypeScript**:
```typescript
// client-portal/src/lib/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase-config'

export const uploadDocument = async (file: File, userId: string) => {
  const storageRef = ref(storage, `documents/${userId}/${file.name}`)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}
```

**Estimativa**: 1.5 dias

---

## ⚡ Fase 5: Firebase Functions (Semana 4)

### 5.1 Setup Firebase Functions

**Tarefas**:
- [ ] Instalar Firebase Functions SDK
- [ ] Configurar `functions/package.json`
- [ ] Configurar TypeScript
- [ ] Configurar deploy

**Estrutura**:
```
functions/
├── src/
│   ├── index.ts
│   ├── webhooks/
│   │   └── deliver.ts
│   ├── scheduled/
│   │   └── crawler.ts
│   └── triggers/
│       └── process-created.ts
├── package.json
└── tsconfig.json
```

**Estimativa**: 0.5 dia

---

### 5.2 Webhook Delivery Function

**Tarefas**:
- [ ] Criar function para delivery de webhooks
- [ ] Implementar retry logic
- [ ] Implementar signing (HMAC)
- [ ] Testar delivery

**Código**:
```typescript
// functions/src/webhooks/deliver.ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as crypto from 'crypto'

export const deliverWebhook = functions.firestore
  .document('webhooks/{webhookId}/deliveries/{deliveryId}')
  .onCreate(async (snap, context) => {
    const delivery = snap.data()
    const webhookRef = admin.firestore()
      .collection('webhooks')
      .doc(context.params.webhookId)
    
    const webhook = (await webhookRef.get()).data()
    
    if (!webhook || !webhook.active) {
      return
    }

    // Sign payload
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(delivery.payload))
      .digest('hex')

    // Deliver
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.event_type
        },
        body: JSON.stringify(delivery.payload)
      })

      // Update delivery status
      await snap.ref.update({
        status: response.ok ? 'delivered' : 'failed',
        delivered_at: admin.firestore.FieldValue.serverTimestamp(),
        response_status: response.status
      })
    } catch (error) {
      await snap.ref.update({
        status: 'failed',
        error: error.message
      })
    }
  })
```

**Estimativa**: 1 dia

---

### 5.3 Scheduled Functions

**Tarefas**:
- [ ] Criar function para crawler diário
- [ ] Configurar schedule (cron)
- [ ] Testar execução

**Código**:
```typescript
// functions/src/scheduled/crawler.ts
import * as functions from 'firebase-functions'

export const dailyCrawler = functions.pubsub
  .schedule('0 2 * * *') // 2 AM daily
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    // Chamar Regulatory Intelligence Crawler API
    const response = await fetch(
      'https://regulatory-api-xxx.run.app/v1/crawlers/run',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`
        }
      }
    )
    
    return response.json()
  })
```

**Estimativa**: 1 dia

---

### 5.4 Firestore Triggers

**Tarefas**:
- [ ] Criar trigger para `process.created`
- [ ] Criar trigger para `analysis.completed`
- [ ] Testar triggers

**Código**:
```typescript
// functions/src/triggers/process-created.ts
import * as functions from 'firebase-functions'

export const onProcessCreated = functions.firestore
  .document('processes/{processId}')
  .onCreate(async (snap, context) => {
    const process = snap.data()
    
    // Trigger webhook
    await admin.firestore()
      .collection('webhooks')
      .where('events', 'array-contains', 'process.created')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          admin.firestore()
            .collection('webhooks')
            .doc(doc.id)
            .collection('deliveries')
            .add({
              event_type: 'process.created',
              payload: process,
              status: 'pending',
              created_at: admin.firestore.FieldValue.serverTimestamp()
            })
        })
      })
  })
```

**Estimativa**: 0.5 dia

---

## 📱 Fase 6: Firebase Cloud Messaging (Semana 4-5)

### 6.1 Setup FCM

**Tarefas**:
- [ ] Gerar service account key
- [ ] Configurar FCM no Client Portal
- [ ] Criar service worker
- [ ] Solicitar permissão de notificação

**Código**:
```typescript
// client-portal/src/lib/fcm.ts
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { auth } from './firebase-config'

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    const messaging = getMessaging()
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY
    })
    return token
  }
  return null
}

export const onMessageListener = () => {
  const messaging = getMessaging()
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
}
```

**Service Worker**:
```javascript
// client-portal/public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'your-api-key',
  authDomain: 'nprocess-firebase.firebaseapp.com',
  projectId: 'nprocess-firebase',
  storageBucket: 'nprocess-firebase.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
```

**Estimativa**: 1.5 dias

---

### 6.2 Backend Integration

**Tarefas**:
- [ ] Criar function para enviar notificações
- [ ] Integrar com análise de compliance
- [ ] Testar delivery

**Código**:
```typescript
// functions/src/notifications/send.ts
import * as admin from 'firebase-admin'

export const sendComplianceNotification = async (
  userId: string,
  processId: string,
  score: number
) => {
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(userId)
    .get()
  
  const fcmToken = userDoc.data()?.fcmToken
  
  if (!fcmToken) {
    return
  }

  await admin.messaging().send({
    token: fcmToken,
    notification: {
      title: 'Análise de Compliance Concluída',
      body: `Processo ${processId} analisado com score ${score}%`
    },
    data: {
      processId,
      score: score.toString(),
      type: 'compliance_analysis'
    }
  })
}
```

**Estimativa**: 1 dia

---

## 📊 Fase 7: Observability (Semana 5)

### 7.1 Firebase Analytics

**Tarefas**:
- [ ] Instalar Firebase Analytics SDK
- [ ] Configurar eventos customizados
- [ ] Criar dashboards
- [ ] Configurar BigQuery export (opcional)

**Código**:
```typescript
// client-portal/src/lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics'
import { app } from './firebase-config'

const analytics = getAnalytics(app)

export const logProcessCreated = (processId: string) => {
  logEvent(analytics, 'process_created', {
    process_id: processId
  })
}

export const logAnalysisCompleted = (processId: string, score: number) => {
  logEvent(analytics, 'analysis_completed', {
    process_id: processId,
    score: score
  })
}
```

**Estimativa**: 1 dia

---

### 7.2 Firebase Crashlytics

**Tarefas**:
- [ ] Instalar Firebase Crashlytics SDK
- [ ] Configurar error boundaries
- [ ] Testar crash reporting
- [ ] Configurar alertas

**Código**:
```typescript
// client-portal/src/lib/crashlytics.ts
import { getAnalytics } from 'firebase/analytics'
import * as crashlytics from 'firebase/crashlytics'

export const logError = (error: Error, context?: Record<string, any>) => {
  crashlytics.log(error.message)
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      crashlytics.setCustomKey(key, String(value))
    })
  }
  crashlytics.recordError(error)
}
```

**Estimativa**: 1 dia

---

### 7.3 Firebase Performance

**Tarefas**:
- [ ] Instalar Firebase Performance SDK
- [ ] Criar custom traces
- [ ] Monitorar API calls
- [ ] Configurar alertas

**Código**:
```typescript
// client-portal/src/lib/performance.ts
import { getPerformance, trace } from 'firebase/performance'

const perf = getPerformance()

export const traceApiCall = async (name: string, fn: () => Promise<any>) => {
  const t = trace(perf, name)
  t.start()
  try {
    const result = await fn()
    t.putMetric('success', 1)
    return result
  } catch (error) {
    t.putMetric('error', 1)
    throw error
  } finally {
    t.stop()
  }
}
```

**Estimativa**: 1 dia

---

## ✅ Fase 8: Testes e Validação (Semana 6)

### 8.1 Testes de Integração

**Checklist**:
- [ ] Testar login/logout
- [ ] Testar registro
- [ ] Testar password reset
- [ ] Testar upload de arquivos
- [ ] Testar download de backups
- [ ] Testar webhooks
- [ ] Testar notificações push
- [ ] Testar scheduled functions
- [ ] Testar Firestore triggers

**Scripts de Teste**:
```bash
# scripts/test-firebase-integration.sh
#!/bin/bash

echo "Testing Firebase Integration..."

# Test Auth
echo "Testing Authentication..."
npm run test:auth

# Test Storage
echo "Testing Storage..."
npm run test:storage

# Test Functions
echo "Testing Functions..."
npm run test:functions

# Test FCM
echo "Testing FCM..."
npm run test:fcm

echo "All tests passed!"
```

**Estimativa**: 2 dias

---

### 8.2 Testes de Carga

**Tarefas**:
- [ ] Testar com 100 usuários simultâneos
- [ ] Testar upload de 100 arquivos
- [ ] Testar 1000 webhooks
- [ ] Monitorar performance
- [ ] Identificar gargalos

**Ferramentas**:
- Artillery.js
- k6
- Firebase Performance Monitoring

**Estimativa**: 1 dia

---

### 8.3 Deploy em Produção

**Tarefas**:
- [ ] Backup completo antes do deploy
- [ ] Deploy em horário de baixo tráfego
- [ ] Monitorar logs
- [ ] Validar funcionalidades críticas
- [ ] Comunicar usuários (se necessário)

**Checklist de Deploy**:
```markdown
## Pré-Deploy
- [ ] Backup completo do banco de dados
- [ ] Backup completo do Cloud Storage
- [ ] Testes passando em staging
- [ ] Documentação atualizada
- [ ] Rollback plan preparado

## Deploy
- [ ] Deploy Firebase Hosting (Admin Dashboard)
- [ ] Deploy Firebase Hosting (Client Portal)
- [ ] Deploy Firebase Functions
- [ ] Atualizar DNS (se necessário)
- [ ] Validar SSL

## Pós-Deploy
- [ ] Testar todas as funcionalidades
- [ ] Monitorar logs e métricas
- [ ] Validar custos
- [ ] Documentar issues encontrados
```

**Estimativa**: 1 dia

---

### 8.4 Monitoramento e Ajustes

**Tarefas**:
- [ ] Monitorar custos diários
- [ ] Monitorar performance
- [ ] Monitorar erros
- [ ] Ajustar configurações
- [ ] Otimizar Security Rules
- [ ] Otimizar Functions

**Estimativa**: 1 dia

---

## 🚨 Riscos e Mitigação

### Risco 1: Downtime durante migração
**Mitigação**:
- Deploy em horário de baixo tráfego
- Manter Cloud Run ativo durante migração
- Rollback plan preparado

### Risco 2: Perda de dados
**Mitigação**:
- Backup completo antes de cada fase
- Validação de integridade após migração
- Scripts de rollback testados

### Risco 3: Performance degradada
**Mitigação**:
- Testes de carga antes do deploy
- Monitoramento contínuo
- Otimizações baseadas em métricas

### Risco 4: Custos inesperados
**Mitigação**:
- Configurar budgets e alertas
- Monitorar custos diariamente
- Right-sizing baseado em uso real

---

## 📋 Checklist Final

### Pré-Migração
- [ ] Backup completo
- [ ] Testes em staging
- [ ] Documentação atualizada
- [ ] Rollback plan preparado
- [ ] Equipe treinada

### Pós-Migração
- [ ] Todas as funcionalidades testadas
- [ ] Performance validada
- [ ] Custos monitorados
- [ ] Documentação atualizada
- [ ] Usuários notificados (se necessário)

---

## 📊 Métricas de Sucesso

### Objetivos
- ✅ Redução de custos: 85% (de $115/mês para $17/mês)
- ✅ Tempo de deploy: < 5 minutos (vs 15-30 minutos no Cloud Run)
- ✅ Performance: Lighthouse score > 90
- ✅ Uptime: 99.9%
- ✅ Zero downtime durante migração

### KPIs
- Custo mensal
- Tempo de resposta (p50, p95, p99)
- Taxa de erro
- Uptime
- Satisfação do usuário

---

## 📚 Recursos e Referências

### Documentação
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

### Scripts
- `scripts/migrate-users-to-firebase.js`
- `scripts/migrate-storage-to-firebase.js`
- `scripts/backup-before-migration.sh`
- `scripts/rollback-migration.sh`
- `scripts/test-firebase-integration.sh`

---

**Próximo Passo**: Revisar este plano e começar pela Fase 1 (Preparação e Setup).

