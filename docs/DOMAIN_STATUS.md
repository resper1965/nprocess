# Status do Domínio Customizado

**Domínio**: `nprocess.ness.com.br`  
**Data**: 2025-12-25

---

## 📊 Status Atual

### Verificação HTTP
- ✅ **Domínio responde**: HTTP 307 (redirect)
- ⚠️ **Redireciona para**: `/api/auth/signin?callbackUrl=%2F`
- ⚠️ **Problema**: Está redirecionando para rota de autenticação que não existe no Firebase Hosting

### Configuração Firebase Hosting
- ❌ **Domínio customizado NÃO configurado** no Firebase Hosting
- ✅ Site padrão funcionando: `https://nprocess-33a44.web.app`

### Configuração Cloud Run (Antiga)
- ⚠️ Pode estar apontando para o serviço antigo `compliance-engine-admin-dashboard` no Cloud Run
- ⚠️ Isso explicaria o redirect para `/api/auth/signin`

---

## 🔧 Problema Identificado

O domínio `nprocess.ness.com.br` está configurado para apontar para o **Cloud Run service antigo** (`compliance-engine-admin-dashboard`), mas agora estamos usando **Firebase Hosting**.

O Cloud Run service está redirecionando para `/api/auth/signin`, que não existe no Firebase Hosting.

---

## ✅ Solução: Configurar Domínio no Firebase Hosting

### Passo 1: Adicionar Domínio Customizado no Firebase

1. Acesse: https://console.firebase.google.com/project/nprocess-33a44/hosting
2. Clique em **"Add custom domain"**
3. Digite: `nprocess.ness.com.br`
4. Siga as instruções para verificar o domínio

### Passo 2: Configurar DNS

Após adicionar o domínio, o Firebase fornecerá instruções DNS. Configure no provedor do domínio:

**Tipo**: A ou CNAME (conforme instruções do Firebase)  
**Nome**: `nprocess.ness.com.br`  
**Valor**: (fornecido pelo Firebase)

### Passo 3: Aguardar SSL

- DNS pode levar até 48 horas para propagar
- SSL certificate será provisionado automaticamente após DNS estar correto
- Verificar status no Firebase Console

---

## 🔄 Alternativa: Remover Mapeamento Antigo

Se o domínio ainda está mapeado para Cloud Run, você pode:

1. **Remover mapeamento antigo**:
   ```bash
   gcloud run domain-mappings delete nprocess.ness.com.br \
     --project=nprocess-33a44 \
     --region=us-central1
   ```

2. **Depois configurar no Firebase Hosting** (passo acima)

---

## 📋 Verificação

Após configurar, verifique:

```bash
# Verificar resposta HTTP
curl -I https://nprocess.ness.com.br

# Deve retornar HTTP 200 (não 307)
# Deve servir o conteúdo do Firebase Hosting
```

---

## ✅ Status Esperado Após Configuração

- ✅ HTTP 200 (não redirect)
- ✅ Conteúdo do Admin Dashboard
- ✅ SSL funcionando (HTTPS)
- ✅ Sem redirects para `/api/auth/signin`

---

## 🔗 Links Úteis

- [Firebase Hosting - Custom Domains](https://console.firebase.google.com/project/nprocess-33a44/hosting)
- [Cloud Run Domain Mappings](https://console.cloud.google.com/run/domains?project=nprocess-33a44)
