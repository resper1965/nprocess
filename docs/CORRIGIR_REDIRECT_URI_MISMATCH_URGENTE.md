# 🚨 Corrigir Erro: redirect_uri_mismatch - URGENTE

**Erro**: `Error 400: redirect_uri_mismatch`  
**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801`

---

## ❌ Problema

Ao tentar fazer login com Google, você recebe:
```
Acesso bloqueado: a solicitação desse app é inválida
Erro 400: redirect_uri_mismatch
```

**Causa**: A URL de redirecionamento não está autorizada no OAuth Client ID do Google.

---

## ✅ Solução: Adicionar URLs no Google Cloud Console

### Passo 1: Acessar Google Cloud Console

**URL Direta**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801

### Passo 2: Encontrar o OAuth 2.0 Client ID

1. Na página de **Credentials**, procure por **"OAuth 2.0 Client IDs"**
2. Encontre o Client ID usado pelo Firebase
   - Geralmente tem o nome: **"Web client (auto created by Google Service)"**
   - Ou pode ter o nome do projeto: **"nprocess-8e801"**
   - O Client ID geralmente termina com: `.apps.googleusercontent.com`
3. **Clique no Client ID** para editar

---

### Passo 3: Adicionar Authorized JavaScript origins

Na seção **"Authorized JavaScript origins"**, adicione as seguintes URLs:

**⚠️ IMPORTANTE**: Sem barra (`/`) no final!

```
https://nprocess-8e801-4711d.web.app
https://nprocess-8e801-4711d.firebaseapp.com
https://nprocess.ness.com.br
http://localhost:3000
http://localhost:3001
```

**Como adicionar:**
1. Clique em **"+ ADD URI"** ou **"Adicionar URI"**
2. Cole cada URL (uma por vez)
3. Clique em **"Add"** ou **"Adicionar"**

---

### Passo 4: Adicionar Authorized redirect URIs

Na seção **"Authorized redirect URIs"**, adicione as seguintes URLs:

**⚠️ IMPORTANTE**: 
- Com o caminho `/__/auth/handler` no final
- O Firebase usa este caminho para processar o callback do OAuth

```
https://nprocess-8e801-4711d.web.app/__/auth/handler
https://nprocess-8e801-4711d.firebaseapp.com/__/auth/handler
https://nprocess.ness.com.br/__/auth/handler
http://localhost:3000/__/auth/handler
http://localhost:3001/__/auth/handler
```

**Como adicionar:**
1. Clique em **"+ ADD URI"** ou **"Adicionar URI"**
2. Cole cada URL (uma por vez)
3. Clique em **"Add"** ou **"Adicionar"**

---

### Passo 5: Salvar

1. Role até o final da página
2. Clique em **"SAVE"** ou **"SALVAR"**
3. Aguarde alguns segundos para as alterações serem aplicadas

---

## 🔍 Verificar URLs Atuais

Para verificar quais URLs estão configuradas:

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
2. Abra o OAuth Client ID
3. Verifique as seções:
   - **Authorized JavaScript origins**
   - **Authorized redirect URIs**

---

## 📋 Checklist de URLs

Certifique-se de que **TODAS** estas URLs estão configuradas:

### ✅ Authorized JavaScript origins:
- [ ] `https://nprocess-8e801-4711d.web.app`
- [ ] `https://nprocess-8e801-4711d.firebaseapp.com`
- [ ] `https://nprocess.ness.com.br` (se configurado)
- [ ] `http://localhost:3000` (desenvolvimento)
- [ ] `http://localhost:3001` (desenvolvimento)

### ✅ Authorized redirect URIs:
- [ ] `https://nprocess-8e801-4711d.web.app/__/auth/handler`
- [ ] `https://nprocess-8e801-4711d.firebaseapp.com/__/auth/handler`
- [ ] `https://nprocess.ness.com.br/__/auth/handler` (se configurado)
- [ ] `http://localhost:3000/__/auth/handler` (desenvolvimento)
- [ ] `http://localhost:3001/__/auth/handler` (desenvolvimento)

---

## ⚠️ Importante

### URLs que NÃO funcionam:
- ❌ `https://nprocess-8e801.web.app` (site antigo)
- ❌ `https://nprocess-8e801.firebaseapp.com` (site antigo)
- ❌ URLs com barra no final: `https://nprocess-8e801-4711d.web.app/`
- ❌ URLs sem o caminho `/__/auth/handler` nos redirect URIs

### URLs que DEVEM estar configuradas:
- ✅ `https://nprocess-8e801-4711d.web.app` (site atual)
- ✅ `https://nprocess-8e801-4711d.firebaseapp.com` (site atual)
- ✅ `https://nprocess.ness.com.br` (se configurado)

---

## 🧪 Testar Após Configurar

1. **Aguarde 1-2 minutos** para as alterações serem aplicadas
2. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
3. **Acesse**: https://nprocess-8e801-4711d.web.app/login
4. **Clique em "Entrar com Google"**
5. **Deve funcionar sem erro!**

---

## 🆘 Se Ainda Não Funcionar

### Verificar qual URL está sendo usada

1. Abra o **Console do Navegador** (F12)
2. Vá para a aba **Network** (Rede)
3. Tente fazer login novamente
4. Procure por requisições para `accounts.google.com`
5. Verifique o parâmetro `redirect_uri` na URL
6. Certifique-se de que essa URL está na lista de **Authorized redirect URIs**

### Verificar Firebase Authentication

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
2. Vá em **"Authorized domains"**
3. Certifique-se de que o domínio está autorizado:
   - `nprocess-8e801-4711d.web.app`
   - `nprocess-8e801-4711d.firebaseapp.com`
   - `nprocess.ness.com.br` (se configurado)

---

## 🔗 Links Úteis

- **Google Cloud Console - Credentials**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
- **Firebase Authentication**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
- **Site Atual**: https://nprocess-8e801-4711d.web.app

---

**Última Atualização**: 06 de Janeiro de 2026
