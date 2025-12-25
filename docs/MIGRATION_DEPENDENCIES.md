# Análise de Dependências - Migração Firebase

**Data**: 2025-01-XX  
**Status**: ✅ Completo

---

## 📦 Admin Dashboard

### Dependências Principais
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "next-auth": "^4.24.5",
  "@tanstack/react-query": "^5.25.0",
  "axios": "^1.6.7"
}
```

### Variáveis de Ambiente
- `NEXT_PUBLIC_API_URL` - ComplianceEngine API
- `NEXT_PUBLIC_ADMIN_API_URL` - Admin Control Plane API
- `NEXTAUTH_URL` - URL do Admin Dashboard
- `NEXTAUTH_SECRET` - Secret do NextAuth
- `GOOGLE_CLIENT_ID` - Google OAuth (opcional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth (opcional)

### APIs Consumidas
1. **ComplianceEngine API** (`NEXT_PUBLIC_API_URL`)
   - `/v1/processes/*` - Gestão de processos
   - `/v1/compliance/*` - Análises de compliance
   - `/v1/diagrams/*` - Geração de diagramas
   - **Mantém**: Cloud Run (lógica complexa)

2. **Admin Control Plane API** (`NEXT_PUBLIC_ADMIN_API_URL`)
   - `/v1/admin/users/*` - Gestão de usuários
   - `/v1/admin/apikeys/*` - Gestão de API keys
   - `/v1/admin/finops/*` - FinOps
   - `/v1/auth/*` - Autenticação
   - **Mantém**: Cloud Run (PostgreSQL necessário)

### Endpoints que Precisam Rewrite
- `/api/auth/*` - NextAuth API routes (manter no mesmo domínio)
- `/api/*` - Outras API routes (se houver)

### Mudanças Necessárias para Firebase Hosting
1. ✅ Configurar `output: 'export'` no `next.config.js`
2. ✅ Desabilitar `next/image` optimization (usar `unoptimized: true`)
3. ✅ Adicionar `trailingSlash: true`
4. ✅ Configurar rewrites no `firebase.json`

---

## 📦 Client Portal

### Dependências Principais
```json
{
  "next": "14.2.15",
  "react": "^18.3.1",
  "@tanstack/react-query": "^5.59.0",
  "axios": "^1.7.7"
}
```

### Variáveis de Ambiente
- `NEXT_PUBLIC_API_URL` - ComplianceEngine API
- `NEXT_PUBLIC_RAG_API_URL` - RegulatoryRAG API
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase config (novo)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase config (novo)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase config (novo)
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase config (novo)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase config (novo)
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase config (novo)
- `NEXT_PUBLIC_FCM_VAPID_KEY` - FCM config (novo)

### APIs Consumidas
1. **ComplianceEngine API** (`NEXT_PUBLIC_API_URL`)
   - `/v1/processes/*` - Gestão de processos
   - `/v1/compliance/*` - Análises de compliance
   - **Mantém**: Cloud Run

2. **RegulatoryRAG API** (`NEXT_PUBLIC_RAG_API_URL`)
   - `/v1/regulatory/search` - Busca regulatória
   - **Mantém**: Cloud Run

3. **Firebase Services** (novo)
   - Firebase Auth - Autenticação
   - Firebase Storage - Upload de documentos
   - Firebase Cloud Messaging - Notificações

### Mudanças Necessárias para Firebase Hosting
1. ✅ Configurar `output: 'export'` no `next.config.js`
2. ✅ Desabilitar `next/image` optimization
3. ✅ Adicionar `trailingSlash: true`
4. ✅ Configurar rewrites no `firebase.json`

---

## 🔧 APIs que Serão Mantidas no Cloud Run

### 1. ComplianceEngine API
**Razão**: Lógica complexa de negócio, muitos endpoints, integração com Vertex AI

**Endpoints**:
- `/v1/processes/*` - CRUD de processos
- `/v1/compliance/*` - Análises de compliance
- `/v1/diagrams/*` - Geração de diagramas BPMN
- `/v1/webhooks/*` - Gestão de webhooks
- `/v1/apikeys/*` - Gestão de API keys (self-service)

**Configuração**:
- Mantém Cloud Run
- Rewrite no Firebase Hosting aponta para este serviço

### 2. Admin Control Plane API
**Razão**: Queries SQL complexas, PostgreSQL necessário

**Endpoints**:
- `/v1/admin/users/*` - Gestão de usuários admin
- `/v1/admin/apikeys/*` - Gestão de API keys
- `/v1/admin/finops/*` - FinOps
- `/v1/auth/*` - Autenticação (para Admin Dashboard)

**Configuração**:
- Mantém Cloud Run
- Rewrite no Firebase Hosting aponta para este serviço

### 3. RegulatoryRAG API
**Razão**: Integração com Vertex AI Search, lógica específica

**Endpoints**:
- `/v1/regulatory/search` - Busca regulatória
- `/v1/regulatory/domains` - Domínios disponíveis

**Configuração**:
- Mantém Cloud Run
- Rewrite no Firebase Hosting aponta para este serviço

---

## 📋 Resumo de Mudanças

### Admin Dashboard
- [x] Firebase Hosting configurado
- [ ] Atualizar `next.config.js` para export estático
- [ ] Testar build local
- [ ] Deploy em staging

### Client Portal
- [x] Firebase Hosting configurado
- [ ] Adicionar Firebase SDK
- [ ] Atualizar `next.config.js` para export estático
- [ ] Implementar Firebase Auth
- [ ] Implementar Firebase Storage
- [ ] Implementar Firebase Cloud Messaging
- [ ] Testar build local
- [ ] Deploy em staging

### APIs (Mantidas no Cloud Run)
- [ ] Configurar rewrites no Firebase Hosting
- [ ] Testar integração
- [ ] Validar CORS

---

## 🔗 Estrutura de Rewrites

```json
{
  "rewrites": [
    {
      "source": "/api/auth/**",
      "run": {
        "serviceId": "compliance-engine-admin-dashboard",
        "region": "us-central1"
      }
    },
    {
      "source": "/v1/**",
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
```

---

## ✅ Checklist de Dependências

### Admin Dashboard
- [x] Next.js 14.2.0
- [x] NextAuth.js 4.24.5
- [x] React Query
- [x] Axios
- [ ] Firebase SDK (não necessário - mantém NextAuth)

### Client Portal
- [x] Next.js 14.2.15
- [x] React Query
- [x] Axios
- [ ] Firebase SDK (adicionar)
- [ ] Firebase Auth
- [ ] Firebase Storage
- [ ] Firebase Cloud Messaging
- [ ] Firebase Analytics
- [ ] Firebase Crashlytics

### APIs (Cloud Run)
- [x] ComplianceEngine API
- [x] Admin Control Plane API
- [x] RegulatoryRAG API

---

## 📝 Próximos Passos

1. ✅ Análise de dependências completa
2. ⏭️ Fase 2: Firebase Hosting
3. ⏭️ Fase 3: Firebase Authentication
4. ⏭️ Fase 4: Firebase Storage
5. ⏭️ Fase 5: Firebase Functions
6. ⏭️ Fase 6: Firebase Cloud Messaging
7. ⏭️ Fase 7: Observability
8. ⏭️ Fase 8: Testes e Validação

