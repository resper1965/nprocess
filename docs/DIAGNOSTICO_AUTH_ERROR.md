# 🔍 Diagnóstico: Erro auth/configuration-not-found

**Erro**: `Firebase: Error (auth/configuration-not-found)`  
**Data**: 27 de Dezembro de 2024  
**Projeto**: `nprocess-8e801`

---

## 🔴 Problema Identificado

O erro `auth/configuration-not-found` ocorre quando o Firebase tenta buscar a configuração do projeto e não encontra o Firebase Authentication configurado ou o Google Sign-In habilitado.

### Erros na Console:
1. `identitytoolkit.googleapis.com/v1/projects?key=...` → **400 Bad Request**
2. `getProjectConfig?key=...` → **400 Bad Request**
3. `auth/configuration-not-found` → Configuração não encontrada

---

## 🔍 Causas Possíveis

### 1. Firebase Authentication Não Habilitado ❌
- O Firebase Authentication pode não estar habilitado no projeto `nprocess-8e801`
- **Solução**: Habilitar no Firebase Console

### 2. Google Sign-In Não Configurado ❌
- O Google Sign-In pode não estar ativado como método de login
- **Solução**: Ativar Google Sign-In no Firebase Console

### 3. API Key Sem Permissões ❌
- A API Key pode não ter permissões para acessar o Identity Toolkit API
- **Solução**: Verificar permissões da API Key no Google Cloud Console

### 4. Projeto/AppId Incompatível ⚠️
- O appId usado (`f8666ae921f4a584fff533`) pode estar associado a um site diferente
- O site `nprocess-8e801` está associado ao appId antigo (`fd2beb4a6871b0b3fff533`)
- **Solução**: Verificar qual appId está correto e usar o site correspondente

---

## ✅ Soluções Passo a Passo

### Passo 1: Verificar Firebase Authentication

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication
2. Se aparecer "Get Started", **clique para habilitar**
3. Se já estiver habilitado, vá para o Passo 2

### Passo 2: Habilitar Google Sign-In

1. Na aba **"Sign-in method"** ou **"Métodos de login"**
2. Encontre **"Google"** na lista
3. Clique em **"Google"**
4. **Ative o toggle "Enable"**
5. Configure:
   - **Project support email**: `resper@ness.com.br`
   - **Project public-facing name**: `nProcess`
6. **Salve**

### Passo 3: Verificar API Key

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
2. Encontre a API Key: `AIzaSyBmA2rJyawq83redy2d2BGjlgTog1_NXmM`
3. Verifique se está habilitada
4. Verifique se tem acesso ao **Identity Toolkit API**

### Passo 4: Habilitar Identity Toolkit API

1. Acesse: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=nprocess-8e801
2. Clique em **"Enable"** ou **"Habilitar"**
3. Aguarde alguns minutos para propagar

### Passo 5: Verificar AppId vs Site

**Situação Atual:**
- Site `nprocess-8e801` → AppId: `fd2beb4a6871b0b3fff533` (antigo)
- Site `nprocess-8e801-4711d` → AppId: `f8666ae921f4a584fff533` (novo)
- Configuração atual usa AppId novo, mas site antigo

**Opções:**

#### Opção A: Usar Site com AppId Novo
```bash
# Atualizar .firebaserc para usar nprocess-8e801-4711d
firebase target:apply hosting client-portal nprocess-8e801-4711d
```

#### Opção B: Usar AppId Antigo no Site Atual
- Atualizar `firebase-config.ts` para usar appId antigo
- Manter site `nprocess-8e801`

---

## 🔧 Verificação Rápida

Execute no console do navegador (na página do Client Portal):

```javascript
// Verificar configuração do Firebase
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

// Verificar se auth está inicializado
import { auth } from '@/lib/firebase-config';
console.log('Auth initialized:', !!auth);
```

---

## 📋 Checklist de Verificação

- [ ] Firebase Authentication habilitado no projeto `nprocess-8e801`
- [ ] Google Sign-In ativado como método de login
- [ ] Identity Toolkit API habilitada no Google Cloud
- [ ] API Key tem permissões corretas
- [ ] AppId corresponde ao site usado
- [ ] Authorized domains configurados
- [ ] OAuth redirect URIs configurados

---

## 🔗 Links Úteis

- **Firebase Auth Console**: https://console.firebase.google.com/project/nprocess-8e801/authentication
- **Identity Toolkit API**: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=nprocess-8e801
- **API Credentials**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801

---

## ⚠️ Ação Imediata Necessária

**O mais provável é que o Firebase Authentication não esteja habilitado ou o Google Sign-In não esteja configurado.**

**Acesse agora**: https://console.firebase.google.com/project/nprocess-8e801/authentication

1. Habilite Firebase Authentication (se não estiver)
2. Ative Google Sign-In
3. Configure os domínios autorizados

---

**Última Atualização**: 27 de Dezembro de 2024

