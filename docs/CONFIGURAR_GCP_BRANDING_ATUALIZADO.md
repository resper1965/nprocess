# 🔐 Configurar Documentos Legais no GCP Branding (OAuth Consent Screen)

**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801` (Firebase)  
**Domínio**: `nprocess.ness.com.br`

---

## 📋 URLs dos Documentos Legais

- **Homepage**: https://nprocess.ness.com.br
- **Privacy Policy**: https://nprocess.ness.com.br/privacy
- **Terms of Service**: https://nprocess.ness.com.br/terms

---

## ✅ Requisitos do Google Cloud (Conforme Documentação)

Conforme a [documentação oficial do Google Cloud](https://support.google.com/cloud/answer/13807376?hl=pt-BR), o App Homepage deve:

1. ✅ **Representar e identificar o app/brand** - Homepage identifica n.process e ness.
2. ✅ **Descrever completamente a funcionalidade** - Explica todas as funcionalidades do app
3. ✅ **Explicar transparência do uso de dados** - Seção 2.3 explica claramente o uso de dados do Google
4. ✅ **Hospedado em domínio verificado** - `nprocess.ness.com.br` (domínio próprio)
5. ✅ **Não hospedado em plataforma de terceiros** - Domínio próprio, não Google Sites/Facebook/etc
6. ✅ **Incluir link para Privacy Policy** - Link presente no footer e na homepage
7. ✅ **Visível sem login** - Homepage, Privacy Policy e Terms são públicos

---

## 🔧 Passo a Passo - OAuth Consent Screen

### 1. Acessar OAuth Consent Screen

**URL Direta**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801

### 2. Configurar App Information

#### User Type
- Selecione **External** (para usuários externos)

#### App Information
- **App name**: `n.process` ou `Process & Compliance Engine`
- **User support email**: `resper@ness.com.br`
- **Developer contact information**: `resper@ness.com.br`
- **App logo**: (Opcional) Upload do logo da ness.
- **Application home page**: `https://nprocess.ness.com.br` ⭐
- **Application privacy policy link**: `https://nprocess.ness.com.br/privacy` ⭐
- **Application terms of service link**: `https://nprocess.ness.com.br/terms` ⭐

#### Authorized domains
Adicione os seguintes domínios:
- `nprocess.ness.com.br` ⭐ (domínio principal)
- `nprocess-8e801-4711d.web.app` (backup)
- `nprocess-8e801-4711d.firebaseapp.com` (backup)

### 3. Scopes

Adicione os seguintes scopes:
- `openid` - Identificar o usuário
- `profile` - Acessar informações básicas do perfil
- `email` - Acessar endereço de email

### 4. Test Users (se app estiver em modo Testing)

Adicione emails de usuários de teste se necessário.

### 5. Salvar e Verificar

1. Clique em **"Save and Continue"**
2. Revise todas as informações
3. Se necessário, clique em **"Prepare for verification"** ou **"Submit for verification"**

---

## 📝 Conteúdo da Privacy Policy Atualizado

A Privacy Policy foi atualizada para atender aos requisitos do Google Cloud:

### Seções Adicionadas/Atualizadas:

1. **Seção 2.3 - Third-Party Authentication (Google Sign-In)**
   - ✅ Explica claramente o **propósito** da coleta de dados do Google
   - ✅ Lista **especificamente** quais dados são solicitados
   - ✅ Explica **como** os dados são usados
   - ✅ Informa sobre **compartilhamento** de dados
   - ✅ Explica como o usuário pode **controlar** o acesso

2. **Seção 15 - Google User Data**
   - ✅ Limited Use Disclosure
   - ✅ Data Use Restrictions
   - ✅ Data Access and Deletion

3. **URLs Atualizadas**
   - ✅ Todas as referências agora usam `nprocess.ness.com.br`
   - ✅ Links para Privacy Policy e Terms of Service atualizados

---

## 🔍 Verificação

Após configurar, verifique:

1. ✅ Homepage está acessível sem login: https://nprocess.ness.com.br
2. ✅ Privacy Policy está acessível: https://nprocess.ness.com.br/privacy
3. ✅ Terms of Service está acessível: https://nprocess.ness.com.br/terms
4. ✅ Homepage inclui link para Privacy Policy (no footer)
5. ✅ Privacy Policy explica claramente o uso de dados do Google
6. ✅ Domínio `nprocess.ness.com.br` está verificado no Google Search Console

---

## 🔗 Links Diretos

### OAuth Consent Screen
- **nprocess-8e801**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801
- **nprocess-prod**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-prod

### OAuth Clients
- **nprocess-8e801**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
- **nprocess-prod**: https://console.cloud.google.com/apis/credentials?project=nprocess-prod

### Google Search Console (Domain Verification)
- **Verificar domínio**: https://search.google.com/search-console

---

## ⚠️ Importante

### Requisitos Obrigatórios

1. **Privacy Policy Link**: Obrigatório e deve corresponder ao link no consent screen
2. **Terms of Service Link**: Obrigatório para apps externos
3. **Homepage**: Deve ser acessível sem login e descrever o app
4. **Domain Verification**: O domínio deve ser verificado no Google Search Console
5. **Transparency**: Deve explicar claramente o uso de dados do Google

### Problemas Comuns a Evitar

- ❌ Homepage atrás de login
- ❌ URLs encurtadas ou que redirecionam
- ❌ Domínio não verificado
- ❌ Privacy Policy sem explicação sobre uso de dados do Google
- ❌ Homepage sem link para Privacy Policy

---

## 📋 Checklist Final

- [ ] Acessar OAuth Consent Screen
- [ ] Configurar App Information
- [ ] Adicionar Homepage: `https://nprocess.ness.com.br`
- [ ] Adicionar Privacy Policy: `https://nprocess.ness.com.br/privacy`
- [ ] Adicionar Terms of Service: `https://nprocess.ness.com.br/terms`
- [ ] Adicionar Authorized Domains
- [ ] Configurar Scopes (openid, profile, email)
- [ ] Verificar domínio no Google Search Console
- [ ] Testar links funcionando
- [ ] Salvar configurações
- [ ] Submeter para verificação (se necessário)

---

**Última Atualização**: 06 de Janeiro de 2026
