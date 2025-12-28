# ✅ Checklist: Configurar Firebase Authentication

**Projeto**: `nprocess-8e801`  
**Data**: 27 de Dezembro de 2024

---

## 📋 Passos Obrigatórios

### 1. Habilitar Firebase Authentication ✅
- [ ] Acessar: https://console.firebase.google.com/project/nprocess-8e801/authentication
- [ ] Clicar em **"Get Started"** (se ainda não habilitado)
- [ ] Verificar se Authentication está ativo

### 2. Habilitar Google Sign-In ✅
- [ ] Ir para aba **"Sign-in method"** ou **"Métodos de login"**
- [ ] Encontrar **"Google"** na lista de provedores
- [ ] Clicar em **"Google"**
- [ ] Ativar toggle **"Enable"**
- [ ] Configurar:
  - **Project support email**: `resper@ness.com.br`
  - **Project public-facing name**: `nProcess`
- [ ] Salvar

### 3. Adicionar Authorized Domains ✅
- [ ] Ir para **Authentication > Settings > Authorized domains**
- [ ] Adicionar domínios:
  - [ ] `nprocess.ness.com.br`
  - [ ] `nprocess-8e801.web.app`
  - [ ] `nprocess-8e801.firebaseapp.com`
  - [ ] `localhost` (para desenvolvimento)

### 4. Configurar OAuth Redirect URIs (Google Cloud) ✅
- [ ] Acessar: https://console.cloud.google.com/apis/credentials?project=nprocess-prod
- [ ] Abrir OAuth 2.0 Client ID: `905989981186-vpbehck2l1se9kn2jtco9om2ni1ogfq0`
- [ ] Adicionar **Authorized redirect URIs**:
  - [ ] `https://nprocess-8e801.firebaseapp.com/__/auth/handler`
  - [ ] `https://nprocess-8e801.web.app/__/auth/handler`
  - [ ] `https://nprocess.ness.com.br/__/auth/handler`
- [ ] Salvar

---

## ✅ Verificação

Após configurar, teste:

1. Acesse: https://nprocess-8e801.web.app/login
2. Clique em **"Entrar com Google"**
3. Deve abrir popup de autenticação do Google
4. Após autenticar, deve redirecionar para `/dashboard`

---

## 🔧 Configurações Atualizadas

### Firebase Config (Atualizado)
```javascript
{
  apiKey: "AIzaSyBmA2rJyawq83redy2d2BGjlgTog1_NXmM",
  authDomain: "nprocess-8e801.firebaseapp.com",
  projectId: "nprocess-8e801",
  storageBucket: "nprocess-8e801.firebasestorage.app",
  messagingSenderId: "43006907338",
  appId: "1:43006907338:web:f8666ae921f4a584fff533",
  measurementId: "G-34RLW0TPXS"
}
```

### OAuth Credentials
- **Client ID**: `[CONFIGURAR_NO_FIREBASE_CONSOLE]`
- **Client Secret**: `[CONFIGURAR_NO_FIREBASE_CONSOLE]`
- **Project**: `nprocess-prod` (905989981186)

---

## 🆘 Troubleshooting

### Erro: `auth/configuration-not-found`
**Solução**: 
1. Verifique se Firebase Authentication está habilitado
2. Verifique se Google Sign-In está ativado
3. Aguarde alguns minutos após habilitar (pode levar tempo para propagar)

### Erro: `auth/unauthorized-domain`
**Solução**:
1. Adicione o domínio em **Authentication > Settings > Authorized domains**
2. Adicione o domínio no **OAuth Consent Screen** do Google Cloud

### Erro: `redirect_uri_mismatch`
**Solução**:
1. Verifique os **Authorized redirect URIs** no Google Cloud Console
2. Certifique-se de incluir todos os domínios (web.app, firebaseapp.com, custom domain)

---

## 🔗 Links Úteis

- **Firebase Auth Console**: https://console.firebase.google.com/project/nprocess-8e801/authentication
- **Google Cloud OAuth**: https://console.cloud.google.com/apis/credentials?project=nprocess-prod
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-prod

---

**Última Atualização**: 27 de Dezembro de 2024

