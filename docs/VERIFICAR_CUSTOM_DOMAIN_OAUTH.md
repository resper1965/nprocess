# 🔍 Verificar Configuração OAuth para Custom Domain

**Domínio Customizado**: `nprocess.ness.com.br`  
**Projeto**: `nprocess-8e801`  
**Data**: 06 de Janeiro de 2026

---

## ⚠️ Problema

Se você está usando o custom domain `nprocess.ness.com.br` e o login com Google não funciona, pode ser porque:

1. O domínio não está autorizado no Firebase Authentication
2. O OAuth não tem o redirect URI correto para o custom domain
3. O JavaScript origin não está configurado

---

## ✅ Verificações Necessárias

### 1. Firebase Authentication - Authorized Domains

**URL**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings

1. Vá em **"Authorized domains"**
2. Verifique se `nprocess.ness.com.br` está na lista
3. Se não estiver, clique em **"Add domain"** e adicione: `nprocess.ness.com.br`
4. Clique em **"Add"**

**Domínios que devem estar autorizados:**
- ✅ `nprocess-8e801-4711d.web.app`
- ✅ `nprocess-8e801-4711d.firebaseapp.com`
- ✅ `nprocess.ness.com.br` ⭐ **OBRIGATÓRIO se usar custom domain**
- ✅ `localhost` (desenvolvimento)

---

### 2. Google Cloud Console - OAuth 2.0 Client ID

**URL**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801

1. Vá em **"OAuth 2.0 Client IDs"**
2. Abra o cliente OAuth (geralmente o primeiro da lista)
3. Verifique as seguintes configurações:

#### Authorized JavaScript origins

**DEVE incluir:**
- ✅ `https://nprocess-8e801-4711d.web.app`
- ✅ `https://nprocess-8e801-4711d.firebaseapp.com`
- ✅ `https://nprocess.ness.com.br` ⭐ **OBRIGATÓRIO se usar custom domain**

**Formato correto:**
- ✅ `https://nprocess.ness.com.br` (sem barra no final)
- ❌ `https://nprocess.ness.com.br/` (com barra - INCORRETO)

#### Authorized redirect URIs

**DEVE incluir:**
- ✅ `https://nprocess-8e801-4711d.web.app/__/auth/handler`
- ✅ `https://nprocess-8e801-4711d.firebaseapp.com/__/auth/handler`
- ✅ `https://nprocess.ness.com.br/__/auth/handler` ⭐ **OBRIGATÓRIO se usar custom domain**

**Formato correto:**
- ✅ `https://nprocess.ness.com.br/__/auth/handler` (com `/__/auth/handler`)
- ❌ `https://nprocess.ness.com.br` (sem handler - INCORRETO)
- ❌ `https://nprocess.ness.com.br/` (com barra - INCORRETO)

4. Clique em **"Save"** para salvar as alterações

---

### 3. Verificar Qual Domínio Está Sendo Usado

O código agora detecta automaticamente qual domínio está sendo usado. Verifique os logs no console do navegador:

```
handleGoogleRedirect: Calling getRedirectResult... { 
  path: '/login/', 
  fullUrl: 'https://nprocess.ness.com.br/login/' 
}
```

Se você ver `nprocess.ness.com.br` na URL, mas o OAuth não está configurado para esse domínio, o login falhará.

---

## 🔧 Como Corrigir

### Passo 1: Autorizar Domínio no Firebase

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
2. Role até **"Authorized domains"**
3. Clique em **"Add domain"**
4. Digite: `nprocess.ness.com.br`
5. Clique em **"Add"**

### Passo 2: Configurar OAuth no Google Cloud

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
2. Clique no **OAuth 2.0 Client ID** (geralmente o primeiro)
3. Em **"Authorized JavaScript origins"**, adicione:
   ```
   https://nprocess.ness.com.br
   ```
   (sem barra no final)

4. Em **"Authorized redirect URIs"**, adicione:
   ```
   https://nprocess.ness.com.br/__/auth/handler
   ```
   (com `/__/auth/handler` no final)

5. Clique em **"Save"**

### Passo 3: Aguardar Propagação

- As alterações podem levar alguns minutos para propagar
- Aguarde 2-5 minutos após salvar
- Limpe o cache do navegador
- Tente fazer login novamente

---

## 🧪 Teste

1. Acesse: https://nprocess.ness.com.br/login
2. Abra o console do navegador (F12)
3. Clique em "Entrar com Google"
4. Verifique os logs:
   - Deve mostrar `fullUrl: 'https://nprocess.ness.com.br/...'`
   - Se houver erro `redirect_uri_mismatch`, o OAuth não está configurado corretamente

---

## 📋 Checklist Completo

- [ ] Domínio `nprocess.ness.com.br` autorizado no Firebase Authentication
- [ ] `https://nprocess.ness.com.br` em Authorized JavaScript origins
- [ ] `https://nprocess.ness.com.br/__/auth/handler` em Authorized redirect URIs
- [ ] Alterações salvas no Google Cloud Console
- [ ] Aguardado 2-5 minutos para propagação
- [ ] Cache do navegador limpo
- [ ] Testado login com Google em https://nprocess.ness.com.br/login

---

## 🔗 Links Diretos

- **Firebase Auth - Authorized Domains**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
- **Google OAuth Console**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
- **Custom Domain Login**: https://nprocess.ness.com.br/login

---

**Última Atualização**: 06 de Janeiro de 2026
