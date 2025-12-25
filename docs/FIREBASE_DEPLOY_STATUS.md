# Deploy Firebase - Status Atual

**Data**: 2025-01-XX  
**Status**: ✅ **Hosting Deployado** | ⏳ **Functions Parcialmente Deployadas**

---

## ✅ Deploy Concluído

### Firebase Hosting
- ✅ **Deployado com sucesso**
- ✅ URL: https://nprocess-33a44.web.app
- ✅ Admin Dashboard online

### Firebase Functions
- ✅ `dailyCrawler` - Deployado (scheduled, executa diariamente às 2h)
- ⏳ `deliverWebhook` - Aguardando propagação de permissões Eventarc
- ⏳ `onProcessCreated` - Aguardando propagação de permissões Eventarc
- ⏳ `onAnalysisCompleted` - Aguardando propagação de permissões Eventarc

---

## ⚠️ Status das Functions

As functions que usam **Firestore Triggers** (Eventarc) precisam aguardar alguns minutos para que as permissões do **Eventarc Service Agent** sejam propagadas.

**Mensagem do Firebase**:
> "Since this is your first time using 2nd gen functions, we need a little bit longer to finish setting everything up. Retry the deployment in a few minutes."

---

## 🔧 Solução

### Opção 1: Aguardar e tentar novamente (Recomendado)

Aguarde 5-10 minutos e execute:

```bash
firebase deploy --only functions --project nprocess-33a44
```

### Opção 2: Verificar permissões manualmente

1. Acesse: https://console.cloud.google.com/iam-admin/iam?project=nprocess-33a44
2. Procure por: `service-{PROJECT_NUMBER}@gcp-sa-eventarc.iam.gserviceaccount.com`
3. Verifique se tem a role: **Eventarc Service Agent**

---

## 📊 Status Atual

✅ **Funcionando**:
- Firebase Hosting
- Firebase Functions: `dailyCrawler`
- Firestore Database

⏳ **Aguardando**:
- Functions com Firestore Triggers (3 functions)
- Propagação de permissões Eventarc

---

## 🔗 URLs

- **Hosting**: https://nprocess-33a44.web.app
- **Firebase Console**: https://console.firebase.google.com/project/nprocess-33a44
- **Functions**: https://console.firebase.google.com/project/nprocess-33a44/functions

---

## 📝 Próximos Passos

1. Aguardar 5-10 minutos
2. Executar: `firebase deploy --only functions`
3. Verificar: `firebase functions:list`
4. Testar o site: https://nprocess-33a44.web.app

---

## ✅ Checklist

- [x] Hosting deployado
- [x] Firestore criado
- [x] Function `dailyCrawler` deployada
- [ ] Functions com triggers deployadas (aguardando permissões)
- [ ] Testar site
- [ ] Configurar VAPID key (opcional)
