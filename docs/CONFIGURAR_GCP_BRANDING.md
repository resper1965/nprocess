# 🔐 Configurar Documentos Legais no GCP Branding (OAuth Consent Screen)

**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801` (Firebase) e `nprocess-prod` (GCP)

---

## 📋 URLs dos Documentos Legais

- **Privacy Policy**: https://nprocess-8e801-4711d.web.app/privacy
- **Terms of Service**: https://nprocess-8e801-4711d.web.app/terms

---

## 🔧 Passo a Passo - OAuth Consent Screen

### 1. Acessar OAuth Consent Screen

1. Acesse o Google Cloud Console:
   - **Projeto Firebase** (`nprocess-8e801`): https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801
   - **Projeto GCP** (`nprocess-prod`): https://console.cloud.google.com/apis/credentials/consent?project=nprocess-prod

2. Selecione o projeto correto (geralmente `nprocess-8e801` para Firebase Auth)

### 2. Configurar OAuth Consent Screen

#### User Type
- Selecione **External** (para usuários externos) ou **Internal** (apenas para organização)

#### App Information
- **App name**: `n.process` ou `Process & Compliance Engine`
- **User support email**: `resper@ness.com.br`
- **App logo**: (Opcional) Upload do logo da ness.
- **Application home page**: `https://nprocess-8e801-4711d.web.app`
- **Application privacy policy link**: `https://nprocess-8e801-4711d.web.app/privacy` ⭐
- **Application terms of service link**: `https://nprocess-8e801-4711d.web.app/terms` ⭐
- **Authorized domains**: 
  - `nprocess-8e801-4711d.web.app`
  - `nprocess-8e801-4711d.firebaseapp.com`
  - `nprocess.ness.com.br` (se usar domínio customizado)

#### Developer Contact Information
- **Email addresses**: `resper@ness.com.br`

### 3. Scopes

Adicione os seguintes scopes:
- `openid`
- `profile`
- `email`

### 4. Test Users (se necessário)

Se o app estiver em modo "Testing", adicione emails de usuários de teste.

### 5. Salvar

Clique em **"Save and Continue"** para salvar as configurações.

---

## 🔍 Verificação

Após configurar, verifique:

1. ✅ Privacy Policy link está funcionando
2. ✅ Terms of Service link está funcionando
3. ✅ Authorized domains incluem o domínio da aplicação
4. ✅ Scopes estão configurados corretamente

---

## 📝 Configuração via gcloud CLI (Alternativa)

Se preferir usar a linha de comando:

```bash
# Para o projeto Firebase (nprocess-8e801)
gcloud alpha iap oauth-brands create \
  --application_title="n.process" \
  --support_email="resper@ness.com.br" \
  --project=nprocess-8e801

# Nota: Links de Privacy Policy e Terms devem ser configurados via Console
```

---

## 🔗 Links Diretos

### Firebase Project (nprocess-8e801)
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801
- **OAuth Clients**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801

### GCP Project (nprocess-prod)
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-prod
- **OAuth Clients**: https://console.cloud.google.com/apis/credentials?project=nprocess-prod

---

## ⚠️ Importante

1. **Privacy Policy Link**: Obrigatório para apps externos
2. **Terms of Service Link**: Obrigatório para apps externos
3. **Authorized Domains**: Devem corresponder aos domínios onde a aplicação está hospedada
4. **Verification**: Apps externos podem precisar de verificação do Google (processo pode levar alguns dias)

---

## 📋 Checklist

- [ ] Acessar OAuth Consent Screen
- [ ] Preencher App Information
- [ ] Adicionar Privacy Policy URL: `https://nprocess-8e801-4711d.web.app/privacy`
- [ ] Adicionar Terms of Service URL: `https://nprocess-8e801-4711d.web.app/terms`
- [ ] Adicionar Authorized Domains
- [ ] Configurar Scopes (openid, profile, email)
- [ ] Salvar configurações
- [ ] Verificar links funcionando

---

**Última Atualização**: 06 de Janeiro de 2026
