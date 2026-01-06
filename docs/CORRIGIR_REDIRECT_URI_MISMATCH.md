# 🔧 Corrigir Erro: redirect_uri_mismatch

**Erro**: `Error 400: redirect_uri_mismatch`  
**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801`

---

## 🎯 Problema

Ao tentar fazer login com Google, o erro indica que a URL de redirecionamento não está autorizada no OAuth Client do Google.

---

## ✅ Solução: Adicionar URLs no Google OAuth

### 1. Acessar Google Cloud Console

**URL Direta**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801

### 2. Encontrar o OAuth 2.0 Client ID

1. Na lista de "OAuth 2.0 Client IDs", encontre o Client ID usado pelo Firebase
2. Geralmente tem o nome "Web client (auto created by Google Service)" ou similar
3. Clique no Client ID para editar

### 3. Adicionar Authorized JavaScript origins

Adicione as seguintes URLs (sem barra no final):

```
https://nprocess-8e801-4711d.web.app
https://nprocess-8e801-4711d.firebaseapp.com
https://nprocess.ness.com.br
http://localhost:3000
```

### 4. Adicionar Authorized redirect URIs

Adicione as seguintes URLs (com o caminho `/__/auth/handler`):

```
https://nprocess-8e801-4711d.web.app/__/auth/handler
https://nprocess-8e801-4711d.firebaseapp.com/__/auth/handler
https://nprocess.ness.com.br/__/auth/handler
http://localhost:3000/__/auth/handler
```

**Importante**: O Firebase usa o caminho `/__/auth/handler` para processar o callback do OAuth.

### 5. Salvar

Clique em **"Save"** para salvar as alterações.

---

## 🔍 Verificar URLs Atuais

Para verificar quais URLs estão configuradas atualmente:

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
2. Abra o OAuth Client ID
3. Verifique as seções:
   - **Authorized JavaScript origins**
   - **Authorized redirect URIs**

---

## 📋 Checklist de URLs

Certifique-se de que TODAS estas URLs estão configuradas:

### Authorized JavaScript origins:
- [ ] `https://nprocess-8e801-4711d.web.app`
- [ ] `https://nprocess-8e801-4711d.firebaseapp.com`
- [ ] `https://nprocess.ness.com.br` (se configurado)
- [ ] `http://localhost:3000` (desenvolvimento)

### Authorized redirect URIs:
- [ ] `https://nprocess-8e801-4711d.web.app/__/auth/handler`
- [ ] `https://nprocess-8e801-4711d.firebaseapp.com/__/auth/handler`
- [ ] `https://nprocess.ness.com.br/__/auth/handler` (se configurado)
- [ ] `http://localhost:3000/__/auth/handler` (desenvolvimento)

---

## 🛠️ Troubleshooting

### Erro persiste após adicionar URLs

1. **Aguarde alguns minutos**: Mudanças no OAuth podem levar alguns minutos para propagar
2. **Limpe o cache do navegador**: Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
3. **Teste em modo anônimo**: Para garantir que não há cache
4. **Verifique o Client ID correto**: Certifique-se de estar editando o Client ID usado pelo Firebase

### Como identificar o Client ID correto

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/settings/general
2. Role até "Your apps"
3. Clique no app web
4. Procure por "OAuth redirect URIs" - isso mostrará qual Client ID está sendo usado

### Verificar qual URL está sendo usada

1. Abra o DevTools do navegador (F12)
2. Vá para a aba "Network"
3. Tente fazer login com Google
4. Procure por requisições para `accounts.google.com` ou `oauth2.googleapis.com`
5. Verifique o parâmetro `redirect_uri` na requisição
6. Compare com as URLs configuradas no OAuth Client

---

## 🔗 Links Úteis

- **Google OAuth Console**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
- **Firebase Console**: https://console.firebase.google.com/project/nprocess-8e801
- **Firebase Auth Settings**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings

---

## ⚠️ Importante

- **Não adicione barra no final** das URLs em "Authorized JavaScript origins"
- **Sempre inclua o caminho completo** `/__/auth/handler` nas "Authorized redirect URIs"
- **Use HTTPS** para produção (exceto localhost)
- **Aguarde propagação** após salvar (pode levar alguns minutos)

---

**Última Atualização**: 06 de Janeiro de 2026
