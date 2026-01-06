# 🔴 CORRIGIR REDIRECT_URI_MISMATCH - URGENTE

> **Data**: 2026-01-06  
> **Erro**: `redirect_uri_mismatch`  
> **URI Faltando**: `https://nprocess-8e801.firebaseapp.com/__/auth/handler`

---

## 🚨 Problema

O Google OAuth está rejeitando o login porque o URI de redirecionamento não está registrado no Console do Google Cloud.

**Erro completo:**
```
Erro 400: redirect_uri_mismatch
redirect_uri=https://nprocess-8e801.firebaseapp.com/__/auth/handler
```

---

## ✅ Solução - Passo a Passo

### 1. Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto: **nprocess-8e801**
3. Navegue até: **APIs e Serviços** → **Credenciais**

### 2. Localizar OAuth 2.0 Client ID

1. Procure pelo OAuth 2.0 Client ID usado pelo Firebase
2. O ID do cliente deve ser: `905989981186-vpbehck2l1se9kn2jtco9om2ni1ogfq0.apps.googleusercontent.com`
3. Clique no nome do Client ID para editar

### 3. Adicionar URIs de Redirecionamento

Na seção **"URIs de redirecionamento autorizados"**, adicione **TODOS** os seguintes URIs:

```
https://nprocess-8e801.firebaseapp.com/__/auth/handler
https://nprocess-8e801-4711d.web.app/__/auth/handler
https://nprocess.ness.com.br/__/auth/handler
```

### 4. Adicionar Origens JavaScript Autorizadas

Na seção **"Origens JavaScript autorizadas"**, adicione **TODOS** os seguintes domínios:

```
https://nprocess-8e801.firebaseapp.com
https://nprocess-8e801-4711d.web.app
https://nprocess.ness.com.br
```

### 5. Salvar Alterações

1. Clique em **"Salvar"** no final da página
2. Aguarde alguns segundos para a propagação das mudanças

---

## 📋 Lista Completa de URIs Necessários

### URIs de Redirecionamento Autorizados:
```
https://nprocess-8e801.firebaseapp.com/__/auth/handler
https://nprocess-8e801-4711d.web.app/__/auth/handler
https://nprocess.ness.com.br/__/auth/handler
```

### Origens JavaScript Autorizadas:
```
https://nprocess-8e801.firebaseapp.com
https://nprocess-8e801-4711d.web.app
https://nprocess.ness.com.br
```

---

## ⚠️ Importante

- **Não remova** URIs existentes, apenas **adicione** os novos
- O Firebase usa automaticamente o domínio padrão (`firebaseapp.com`) quando o custom domain não está disponível
- Todos os domínios devem estar configurados para garantir compatibilidade

---

## 🔍 Verificação

Após adicionar os URIs:

1. Aguarde 2-3 minutos para propagação
2. Tente fazer login novamente
3. Se ainda falhar, verifique se todos os URIs foram adicionados corretamente

---

## 📞 Suporte

Se o problema persistir após seguir estes passos, verifique:
- Se o OAuth Client ID correto está sendo usado
- Se há múltiplos OAuth Client IDs no projeto
- Se as credenciais do Firebase estão corretas
