# 🔥 Configurações do Firebase - Produção

**Projeto Firebase**: `nprocess-8e801` (nProcess)  
**Data de Configuração**: 27 de Dezembro de 2024

---

## 📋 Credenciais do Firebase

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBmA2rJyawq83redy2d2BGjlgTog1_NXmM",
  authDomain: "nprocess-8e801.firebaseapp.com",
  projectId: "nprocess-8e801",
  storageBucket: "nprocess-8e801.firebasestorage.app",
  messagingSenderId: "43006907338",
  appId: "1:43006907338:web:f8666ae921f4a584fff533",
  measurementId: "G-34RLW0TPXS"
};
```

---

## 🔧 Arquivos Atualizados

### 1. `client-portal/src/lib/firebase-config.ts`
- ✅ Configurações padrão atualizadas para produção
- ✅ Valores de fallback configurados

### 2. `client-portal/next.config.js`
- ✅ Variáveis de ambiente `NEXT_PUBLIC_FIREBASE_*` atualizadas
- ✅ Valores padrão configurados para produção

### 3. `scripts/fase3-deploy-client-portal.sh`
- ✅ Script de deploy atualizado com credenciais
- ✅ `.env.production` gerado automaticamente

---

## 🌐 URLs de Produção

- **Client Portal**: https://nprocess-8e801.web.app
- **Firebase Console**: https://console.firebase.google.com/project/nprocess-8e801/overview
- **Firebase Hosting**: https://nprocess-8e801.firebaseapp.com

---

## ✅ Status

- ✅ Configurações aplicadas
- ✅ Client Portal redeployado
- ✅ Firebase Analytics configurado
- ✅ Firebase Authentication configurado
- ✅ Firebase Storage configurado
- ✅ Firebase Messaging configurado

---

## 📝 Notas

- As credenciais estão configuradas como valores padrão no código
- Variáveis de ambiente podem sobrescrever os valores padrão
- Todas as configurações estão sincronizadas entre os arquivos

---

**Última Atualização**: 27 de Dezembro de 2024

