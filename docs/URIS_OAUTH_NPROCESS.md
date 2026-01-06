# 🔐 URIs OAuth 2.0 - n.process

> **Client ID**: `43006907338-ltuf3rpii9sgku5240jsr0096hd86lsu.apps.googleusercontent.com`  
> **Projeto**: `nprocess-8e801`  
> **Última Atualização**: 2026-01-06

---

## 🔗 Link Direto para Editar

**URL**: https://console.cloud.google.com/auth/clients/43006907338-ltuf3rpii9sgku5240jsr0096hd86lsu.apps.googleusercontent.com?project=nprocess-8e801

---

## 📋 URIs que DEVEM estar configurados

### ✅ Authorized JavaScript origins (Origens JavaScript Autorizadas)

**⚠️ IMPORTANTE**: Apenas o domínio, SEM barra no final, SEM caminhos!

Adicione **TODAS** estas URLs (apenas o domínio, sem `/` no final):

```
https://nprocess-8e801.firebaseapp.com
https://nprocess-8e801-4711d.web.app
https://nprocess.ness.com.br
```

**❌ NÃO adicione:**
- `https://nprocess-8e801.firebaseapp.com/` (com barra)
- `https://nprocess-8e801.firebaseapp.com/login` (com caminho)
- `http://nprocess-8e801.firebaseapp.com` (sem HTTPS)

### ✅ Authorized redirect URIs (URIs de Redirecionamento Autorizados)

Adicione **TODAS** estas URLs (com `/__/auth/handler` no final):

```
https://nprocess-8e801.firebaseapp.com/__/auth/handler
https://nprocess-8e801-4711d.web.app/__/auth/handler
https://nprocess.ness.com.br/__/auth/handler
```

---

## 🚨 URI que está causando erro

**Erro atual**: `redirect_uri_mismatch`  
**URI faltando**: `https://nprocess-8e801.firebaseapp.com/__/auth/handler`

Este URI **DEVE** ser adicionado imediatamente!

---

## 📝 Instruções Rápidas

1. **Acesse o link direto acima** (ou navegue manualmente)
2. **Role até a seção "Authorized redirect URIs"**
3. **Clique em "+ ADD URI"**
4. **Adicione**: `https://nprocess-8e801.firebaseapp.com/__/auth/handler`
5. **Repita para os outros URIs** se não estiverem presentes
6. **Role até "Authorized JavaScript origins"**
7. **Adicione**: `https://nprocess-8e801.firebaseapp.com`
8. **Repita para as outras origens** se não estiverem presentes
9. **Clique em "SAVE"** no final da página
10. **Aguarde 2-3 minutos** para propagação

---

## ✅ Checklist

### Authorized JavaScript origins:
- [ ] `https://nprocess-8e801.firebaseapp.com`
- [ ] `https://nprocess-8e801-4711d.web.app`
- [ ] `https://nprocess.ness.com.br`

### Authorized redirect URIs:
- [ ] `https://nprocess-8e801.firebaseapp.com/__/auth/handler` ⚠️ **CRÍTICO - FALTANDO**
- [ ] `https://nprocess-8e801-4711d.web.app/__/auth/handler`
- [ ] `https://nprocess.ness.com.br/__/auth/handler`

---

## 🔍 Verificação

Após adicionar os URIs:

1. Aguarde 2-3 minutos
2. Limpe o cache do navegador
3. Tente fazer login novamente
4. O erro `redirect_uri_mismatch` deve desaparecer

---

## 📞 Informações Técnicas

- **Client ID**: `43006907338-ltuf3rpii9sgku5240jsr0096hd86lsu.apps.googleusercontent.com`
- **Project ID**: `nprocess-8e801`
- **Firebase Project**: `nprocess-8e801`
- **Site ID**: `nprocess-8e801-4711d`
