# Instruções para Finalizar Deploy Firebase

**Status Atual**: ⚠️ **Pendente criação do Firestore**

---

## ⚠️ Bloqueadores

### 1. Habilitar Cloud Run Admin API

O Hosting precisa da Cloud Run Admin API habilitada para os rewrites funcionarem.

1. Acesse: https://console.developers.google.com/apis/api/run.googleapis.com/overview?project=406039759652
2. Clique em **"Enable"**
3. Aguarde alguns minutos para propagação

### 2. Criar Firestore Database

O Firestore precisa ser criado **manualmente** no Firebase Console antes de fazer deploy das Functions.

### Passo 1: Criar Firestore Database

1. Acesse: https://console.firebase.google.com/project/nprocess-33a44/firestore
2. Clique em **"Create database"**
3. Selecione **"Start in production mode"** (ou test mode para desenvolvimento)
4. Escolha a localização: **us-central** (ou a mais próxima)
5. Clique em **"Enable"**

### Passo 2: Deploy das Functions

Após criar o Firestore, execute:

```bash
cd /home/resper/nProcess/nprocess
firebase deploy --only functions
```

---

## ✅ Deploy do Hosting (Pode fazer agora)

O Hosting não depende do Firestore e pode ser deployado:

### Opção 1: Deploy do site padrão

```bash
cd /home/resper/nProcess/nprocess
# Deploy do Admin Dashboard
cd admin-dashboard && npm run build
cd ..
firebase deploy --only hosting --project nprocess-33a44
```

### Opção 2: Deploy com targets (após configurar)

```bash
# Configurar targets (se ainda não configurado)
firebase target:apply hosting admin-dashboard nprocess-33a44
firebase target:apply hosting client-portal nprocess-33a44

# Deploy
firebase deploy --only hosting:admin-dashboard
firebase deploy --only hosting:client-portal
```

---

## 📋 Checklist Completo

- [ ] Criar Firestore Database no Console
- [ ] Deploy das Functions: `firebase deploy --only functions`
- [ ] Build Admin Dashboard: `cd admin-dashboard && npm run build`
- [ ] Build Client Portal: `cd client-portal && npm run build`
- [ ] Deploy Hosting: `firebase deploy --only hosting`
- [ ] Verificar URLs no Firebase Console
- [ ] Testar autenticação
- [ ] Configurar VAPID key para FCM (opcional)

---

## 🔗 Links Úteis

- [Firebase Console](https://console.firebase.google.com/project/nprocess-33a44)
- [Criar Firestore](https://console.firebase.google.com/project/nprocess-33a44/firestore)
- [Firebase Hosting](https://console.firebase.google.com/project/nprocess-33a44/hosting)
- [Firebase Functions](https://console.firebase.google.com/project/nprocess-33a44/functions)

---

## 📊 Status Atual

✅ **Completo**:
- Runtime Node.js 20 configurado
- Builds funcionando
- Código das Functions pronto
- Código do Hosting pronto

⏳ **Pendente**:
- Criar Firestore Database (manual)
- Deploy das Functions (após criar Firestore)
- Deploy do Hosting (pode fazer agora)

---

## 💡 Nota

O Firestore é necessário porque as Functions usam triggers do Firestore (`onProcessCreated`, `onAnalysisCompleted`). Sem o banco de dados, o deploy das Functions falha.

