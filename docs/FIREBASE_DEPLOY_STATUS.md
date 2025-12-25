# Status do Deploy Firebase

**Data**: 2025-01-XX  
**Status**: 🔄 Deploy em Progresso

---

## 📊 Deploy Status

### Firebase Hosting

#### Admin Dashboard
- **Status**: ⏳ Pendente
- **Target**: `admin-dashboard`
- **Public**: `admin-dashboard/out`
- **URL**: Será gerada após deploy

#### Client Portal
- **Status**: ⏳ Pendente
- **Target**: `client-portal`
- **Public**: `client-portal/out`
- **URL**: Será gerada após deploy

### Firebase Functions

#### Functions Deployadas
- ⏳ `deliverWebhook` - Webhook delivery
- ⏳ `dailyCrawler` - Scheduled crawler
- ⏳ `onProcessCreated` - Firestore trigger
- ⏳ `onAnalysisCompleted` - Firestore trigger

---

## 🚀 Comandos de Deploy

### 1. Build dos Projetos
```bash
# Admin Dashboard
cd admin-dashboard
npm run build

# Client Portal
cd ../client-portal
npm run build
```

### 2. Deploy Firebase Hosting
```bash
# Deploy Admin Dashboard
firebase deploy --only hosting:admin-dashboard

# Deploy Client Portal
firebase deploy --only hosting:client-portal

# Ou deploy ambos
firebase deploy --only hosting
```

### 3. Deploy Firebase Functions
```bash
cd functions
npm run build
firebase deploy --only functions
```

---

## ⚙️ Configurações Necessárias

### 1. VAPID Key para FCM
1. Acesse: https://console.firebase.google.com/project/nprocess-33a44/settings/cloudmessaging
2. Gere VAPID key
3. Adicione como variável de ambiente: `NEXT_PUBLIC_FCM_VAPID_KEY`

### 2. Custom Domains (Opcional)
```bash
# Listar sites
firebase hosting:sites:list

# Adicionar custom domain
firebase hosting:channel:deploy preview --only hosting:admin-dashboard
```

### 3. Environment Variables para Functions
```bash
# Configurar variáveis de ambiente
firebase functions:config:set \
  regulatory.api_url="https://regulatory-api-5wqihg7s7a-uc.a.run.app" \
  regulatory.api_key="YOUR_API_KEY"
```

---

## 📋 Checklist Pós-Deploy

- [ ] Verificar URLs dos sites
- [ ] Testar autenticação
- [ ] Testar upload de arquivos
- [ ] Testar webhooks
- [ ] Verificar logs das functions
- [ ] Configurar alertas
- [ ] Testar Analytics
- [ ] Validar Security Rules

---

## 🔗 Links Úteis

- [Firebase Console](https://console.firebase.google.com/project/nprocess-33a44)
- [Firebase Hosting](https://console.firebase.google.com/project/nprocess-33a44/hosting)
- [Firebase Functions](https://console.firebase.google.com/project/nprocess-33a44/functions)
- [Firebase Analytics](https://console.firebase.google.com/project/nprocess-33a44/analytics)

