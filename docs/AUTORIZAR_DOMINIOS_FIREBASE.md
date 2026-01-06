# 🔐 Como Autorizar Domínios no Firebase

**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801`

---

## 📋 Domínios que Precisam ser Autorizados

### Domínios do Firebase Hosting
- ✅ `nprocess-8e801-4711d.web.app` (URL principal)
- ✅ `nprocess-8e801-4711d.firebaseapp.com` (URL alternativa)
- ⚠️ `nprocess-8e801.web.app` (site antigo, se ainda em uso)

### Domínios Customizados (se configurados)
- `nprocess.ness.com.br` (domínio customizado)

### Desenvolvimento Local
- `localhost` (já vem por padrão)

---

## 🔧 Passo a Passo

### 1. Acessar Firebase Console

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
2. Ou navegue: **Firebase Console** > **Authentication** > **Settings** > **Authorized domains**

### 2. Adicionar Domínios

1. Na seção **"Authorized domains"**, clique em **"Add domain"**
2. Adicione cada domínio:
   - `nprocess-8e801-4711d.web.app`
   - `nprocess-8e801-4711d.firebaseapp.com`
   - `nprocess.ness.com.br` (se usar domínio customizado)

### 3. Verificar Domínios Existentes

Os seguintes domínios já devem estar autorizados por padrão:
- ✅ `localhost`
- ✅ `nprocess-8e801.firebaseapp.com`
- ✅ `nprocess-8e801.web.app`

---

## ⚠️ Importante

### Para OAuth (Google Sign-In)

Se você estiver usando **Google OAuth**, também precisa autorizar os domínios no **Google Cloud Console**:

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
2. Vá em **"OAuth 2.0 Client IDs"**
3. Edite o cliente OAuth
4. Em **"Authorized JavaScript origins"**, adicione:
   - `https://nprocess-8e801-4711d.web.app`
   - `https://nprocess-8e801-4711d.firebaseapp.com`
   - `https://nprocess.ness.com.br` (se usar domínio customizado)

5. Em **"Authorized redirect URIs"**, adicione:
   - `https://nprocess-8e801-4711d.web.app/__/auth/handler`
   - `https://nprocess-8e801-4711d.firebaseapp.com/__/auth/handler`
   - `https://nprocess.ness.com.br/__/auth/handler` (se usar domínio customizado)

---

## 🔍 Verificar Configuração Atual

### Via Firebase Console
1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
2. Verifique a lista de **"Authorized domains"**

### Via Google Cloud Console (OAuth)
1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
2. Verifique **"OAuth 2.0 Client IDs"** > **"Authorized JavaScript origins"**

---

## 📝 Checklist

- [ ] Adicionar `nprocess-8e801-4711d.web.app` no Firebase Authentication
- [ ] Adicionar `nprocess-8e801-4711d.firebaseapp.com` no Firebase Authentication
- [ ] Adicionar domínios no Google OAuth (se usar Google Sign-In)
- [ ] Testar autenticação na nova URL
- [ ] Verificar se redirecionamentos funcionam corretamente

---

## 🚨 Problemas Comuns

### Erro: "auth/unauthorized-domain"
- **Causa**: Domínio não autorizado no Firebase
- **Solução**: Adicionar domínio em **Authentication** > **Settings** > **Authorized domains**

### Erro: "redirect_uri_mismatch" (OAuth)
- **Causa**: URI de redirecionamento não autorizada no Google OAuth
- **Solução**: Adicionar URI em **Google Cloud Console** > **OAuth 2.0 Client IDs** > **Authorized redirect URIs**

### Erro: "origin_mismatch" (OAuth)
- **Causa**: Origem JavaScript não autorizada no Google OAuth
- **Solução**: Adicionar origem em **Google Cloud Console** > **OAuth 2.0 Client IDs** > **Authorized JavaScript origins**

---

## 🔗 Links Úteis

- **Firebase Authentication Settings**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
- **Google Cloud OAuth Credentials**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
- **Firebase Hosting**: https://console.firebase.google.com/project/nprocess-8e801/hosting

---

**Última Atualização**: 06 de Janeiro de 2026
