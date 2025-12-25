# ⚠️ Ações Necessárias para Completar Deploy Firebase

**Status**: ⏳ **Aguardando ações manuais no Console**

---

## 🔴 Bloqueadores Atuais

### 1. Cloud Run Admin API não habilitada

**Erro**: `Cloud Run Admin API has not been used in project 406039759652 before or it is disabled`

**Solução**:
1. Acesse: https://console.developers.google.com/apis/api/run.googleapis.com/overview?project=406039759652
2. Clique em **"Enable"**
3. Aguarde 2-5 minutos para propagação
4. Execute novamente: `firebase deploy --only hosting`

### 2. Firestore Database não existe

**Erro**: `Project 'nprocess-33a44' or database '(default)' does not exist`

**Solução**:
1. Acesse: https://console.firebase.google.com/project/nprocess-33a44/firestore
2. Clique em **"Create database"**
3. Selecione **"Start in production mode"** (ou test mode)
4. Escolha localização: **us-central** (ou a mais próxima)
5. Clique em **"Enable"**
6. Execute novamente: `firebase deploy --only functions`

---

## ✅ Após Habilitar APIs e Criar Firestore

Execute os comandos de deploy:

```bash
cd /home/resper/nProcess/nprocess

# Deploy Hosting
firebase deploy --only hosting --project nprocess-33a44

# Deploy Functions
firebase deploy --only functions --project nprocess-33a44
```

---

## 📊 Status Atual

✅ **Pronto**:
- Código implementado
- Builds funcionando
- Configuração completa
- Runtime Node.js 20

⏳ **Pendente (Manual)**:
- Habilitar Cloud Run Admin API
- Criar Firestore Database

---

## 🔗 Links Diretos

- **Habilitar Cloud Run API**: https://console.developers.google.com/apis/api/run.googleapis.com/overview?project=406039759652
- **Criar Firestore**: https://console.firebase.google.com/project/nprocess-33a44/firestore
- **Firebase Console**: https://console.firebase.google.com/project/nprocess-33a44

---

## 💡 Notas

- O Cloud Run Admin API é necessário porque o Hosting usa rewrites para Cloud Run services
- O Firestore é necessário porque as Functions usam triggers do Firestore
- Após habilitar/criar, aguarde alguns minutos antes de tentar deploy novamente

