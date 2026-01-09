# Configurar Domínio Customizado para Firebase Auth

Este guia explica como configurar o domínio customizado `nprocess.ness.com.br` para funcionar corretamente com Firebase Authentication e Google OAuth.

## ⚠️ Problema

Quando você acessa a aplicação pelo domínio customizado `https://nprocess.ness.com.br`, o login com Google pode falhar com o erro:
- `auth/unauthorized-domain`
- Popup bloqueado
- Erro de CORS

## ✅ Solução: Configurar 3 Locais

### 1. Firebase Authentication - Authorized Domains

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `nprocess-8e801`
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Clique em **Add domain**
5. Adicione: `nprocess.ness.com.br`
6. Clique em **Add**

**Domínios que devem estar listados:**
- ✅ `localhost` (desenvolvimento)
- ✅ `nprocess-8e801.firebaseapp.com` (Firebase Hosting)
- ✅ `nprocess-8e801.web.app` (Firebase Hosting alternativo)
- ✅ `nprocess-frontend-43006907338.us-central1.run.app` (Cloud Run)
- ✅ `nprocess.ness.com.br` ⭐ **DOMÍNIO CUSTOMIZADO**

### 2. Google Cloud Console - OAuth 2.0 Client IDs

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto `nprocess-8e801` (ou o projeto correto)
3. Vá em **APIs & Services** → **Credentials**
4. Encontre o **OAuth 2.0 Client ID** usado pelo Firebase (geralmente tem "Web client" no nome)
5. Clique para editar

#### 2.1. Authorized JavaScript origins

Adicione as seguintes URLs (com `https://`):

```
https://nprocess.ness.com.br
https://nprocess-8e801.firebaseapp.com
https://nprocess-8e801.web.app
https://nprocess-frontend-43006907338.us-central1.run.app
```

#### 2.2. Authorized redirect URIs

Adicione as seguintes URLs:

```
https://nprocess.ness.com.br/__/auth/handler
https://nprocess-8e801.firebaseapp.com/__/auth/handler
https://nprocess-8e801.web.app/__/auth/handler
https://nprocess-frontend-43006907338.us-central1.run.app/__/auth/handler
```

6. Clique em **Save**

### 3. Verificar Configuração do Firebase Hosting (se aplicável)

Se o domínio customizado está apontando para Firebase Hosting:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Hosting**
3. Verifique se o domínio `nprocess.ness.com.br` está configurado
4. Se não estiver, adicione o domínio customizado

## 🔍 Como Verificar se Está Funcionando

1. Acesse `https://nprocess.ness.com.br/login`
2. Abra o Console do Navegador (F12)
3. Tente fazer login com Google
4. Verifique os logs:
   - ✅ Se aparecer `loginWithGoogle: signInWithPopup completed successfully` → Funcionando!
   - ❌ Se aparecer `auth/unauthorized-domain` → Domínio não está autorizado

## 🐛 Troubleshooting

### Erro: "auth/unauthorized-domain"

**Causa:** O domínio não está autorizado no Firebase Auth.

**Solução:**
1. Verifique se `nprocess.ness.com.br` está em **Firebase Auth → Authorized domains**
2. Aguarde alguns minutos após adicionar (pode levar tempo para propagar)
3. Limpe o cache do navegador e tente novamente

### Erro: "Popup bloqueado"

**Causa:** O navegador está bloqueando o popup do Google OAuth.

**Solução:**
1. Permita popups para `nprocess.ness.com.br`
2. Verifique se o domínio está em **Google OAuth → Authorized JavaScript origins**
3. Tente em modo anônimo/privado para descartar extensões

### Erro: CORS ou "Access-Control-Allow-Origin"

**Causa:** O domínio não está autorizado no Google OAuth.

**Solução:**
1. Verifique se `https://nprocess.ness.com.br` está em **Google OAuth → Authorized JavaScript origins**
2. Verifique se `https://nprocess.ness.com.br/__/auth/handler` está em **Google OAuth → Authorized redirect URIs**

## 📝 Checklist de Configuração

- [ ] `nprocess.ness.com.br` adicionado em **Firebase Auth → Authorized domains**
- [ ] `https://nprocess.ness.com.br` adicionado em **Google OAuth → Authorized JavaScript origins**
- [ ] `https://nprocess.ness.com.br/__/auth/handler` adicionado em **Google OAuth → Authorized redirect URIs**
- [ ] Aguardou alguns minutos após as configurações
- [ ] Limpou cache do navegador
- [ ] Testou em modo anônimo/privado

## 🔗 Links Úteis

- [Firebase Console - Authentication](https://console.firebase.google.com/project/nprocess-8e801/authentication/settings)
- [Google Cloud Console - OAuth Credentials](https://console.cloud.google.com/apis/credentials?project=nprocess-8e801)
- [Firebase Hosting - Custom Domains](https://console.firebase.google.com/project/nprocess-8e801/hosting)
