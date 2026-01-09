# 🚨 Correção Urgente: Erro `auth/unauthorized-domain`

**Erro**: `Firebase: Error (auth/unauthorized-domain)`  
**Domínio afetado**: `nprocess-frontend-43006907338.us-central1.run.app`  
**Data**: 08 de Janeiro de 2026

---

## ⚠️ Problema

O console do navegador mostra:
```
Firebase: Error (auth/unauthorized-domain)
The current domain is not authorized for OAuth operations.
Add your domain (nprocess-frontend-43006907338.us-central1.run.app) to the OAuth redirect domains list
```

**Causa**: O domínio do Cloud Run não está autorizado no Firebase Authentication.

---

## ✅ Solução Rápida

### 1. Adicionar Domínios no Firebase Authentication

**URL**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings

1. Acesse a URL acima
2. Vá na aba **"Authorized domains"**
3. Clique em **"Add domain"**
4. Adicione os seguintes domínios (um por vez):

   - ✅ `nprocess.ness.com.br`
   - ✅ `nprocess-frontend-43006907338.us-central1.run.app`

5. Clique em **"Add"** para cada domínio

---

### 2. Adicionar Domínios no Google Cloud OAuth

**URL**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801

1. Acesse a URL acima
2. Vá em **"OAuth 2.0 Client IDs"**
3. Clique no cliente OAuth (geralmente o primeiro da lista)
4. Em **"Authorized JavaScript origins"**, adicione:

   - ✅ `https://nprocess.ness.com.br`
   - ✅ `https://nprocess-frontend-43006907338.us-central1.run.app`

5. Em **"Authorized redirect URIs"**, adicione:

   - ✅ `https://nprocess.ness.com.br/__/auth/handler`
   - ✅ `https://nprocess-frontend-43006907338.us-central1.run.app/__/auth/handler`

6. Clique em **"Save"**

---

## 🔍 Verificar DNS (Opcional)

Para verificar se `nprocess.ness.com.br` está apontando para o Cloud Run correto:

```bash
# Verificar DNS
curl -I https://nprocess.ness.com.br

# Ou verificar diretamente
curl -I https://nprocess-frontend-43006907338.us-central1.run.app
```

**Esperado**: Ambos devem retornar `200 OK` ou `301/302` (redirect).

---

## ✅ Checklist

- [ ] Adicionar `nprocess.ness.com.br` no Firebase Authentication
- [ ] Adicionar `nprocess-frontend-43006907338.us-central1.run.app` no Firebase Authentication
- [ ] Adicionar `https://nprocess.ness.com.br` no Google OAuth (JavaScript origins)
- [ ] Adicionar `https://nprocess-frontend-43006907338.us-central1.run.app` no Google OAuth (JavaScript origins)
- [ ] Adicionar `https://nprocess.ness.com.br/__/auth/handler` no Google OAuth (Redirect URIs)
- [ ] Adicionar `https://nprocess-frontend-43006907338.us-central1.run.app/__/auth/handler` no Google OAuth (Redirect URIs)
- [ ] Testar login em `https://nprocess.ness.com.br/login`
- [ ] Verificar se o erro desapareceu do console

---

## ⏱️ Tempo de Propagação

- **Firebase Authentication**: Imediato (alguns segundos)
- **Google OAuth**: Pode levar até 5-10 minutos para propagar

**Recomendação**: Aguarde 5 minutos após adicionar os domínios antes de testar novamente.

---

## 🔗 Links Diretos

- **Firebase Auth Settings**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
- **Google Cloud OAuth**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
- **Cloud Run Services**: https://console.cloud.google.com/run?project=nprocess-8e801

---

**Última Atualização**: 08 de Janeiro de 2026
