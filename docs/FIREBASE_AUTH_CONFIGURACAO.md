# 🔐 Configurar Firebase Authentication - Google Sign-In

**Projeto Firebase**: `nprocess-8e801`  
**Data**: 27 de Dezembro de 2024

---

## ⚠️ Problema Identificado

Erro: `auth/configuration-not-found`  
Causa: Firebase Authentication não está configurado ou Google Sign-In não está habilitado

---

## 📋 Passos para Configurar

### 1. Habilitar Firebase Authentication

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication
2. Clique em **"Get Started"** ou **"Começar"** (se ainda não habilitado)
3. Na aba **"Sign-in method"** ou **"Métodos de login"**

### 2. Habilitar Google Sign-In

1. Na lista de provedores, encontre **"Google"**
2. Clique em **"Google"**
3. Ative o toggle **"Enable"** ou **"Habilitar"**
4. Configure:
   - **Project support email**: Seu email (ex: resper@ness.com.br)
   - **Project public-facing name**: nProcess (ou o nome desejado)

### 3. Configurar OAuth Credentials

O Firebase pode usar credenciais OAuth existentes ou criar novas:

#### Opção A: Usar Credenciais Existentes (Recomendado)

Se você já tem credenciais OAuth do Google Cloud:

1. No Firebase Console, ao habilitar Google Sign-In:
   - **Web client ID**: `[CONFIGURAR_NO_FIREBASE_CONSOLE]`
   - **Web client secret**: `[CONFIGURAR_NO_FIREBASE_CONSOLE]`

2. Cole essas credenciais nos campos apropriados

#### Opção B: Deixar Firebase Criar Automaticamente

- O Firebase pode criar credenciais OAuth automaticamente
- Essas credenciais serão gerenciadas pelo Firebase

### 4. Configurar OAuth Consent Screen (Google Cloud)

Se usar credenciais próprias, verifique o OAuth Consent Screen:

1. Acesse: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-prod
2. Configure:
   - **User Type**: Internal (se for organização) ou External
   - **App name**: nProcess
   - **User support email**: resper@ness.com.br
   - **Developer contact**: resper@ness.com.br
3. Adicione scopes:
   - `openid`
   - `profile`
   - `email`
4. Adicione authorized domains:
   - `nprocess.ness.com.br`
   - `nprocess-8e801.web.app`
   - `nprocess-8e801.firebaseapp.com`

### 5. Adicionar Authorized Redirect URIs

No Google Cloud Console (OAuth 2.0 Client):

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-prod
2. Encontre o OAuth 2.0 Client ID (configure no Firebase Console)
3. Adicione Authorized redirect URIs:
   ```
   https://nprocess-8e801.firebaseapp.com/__/auth/handler
   https://nprocess-8e801.web.app/__/auth/handler
   https://nprocess.ness.com.br/__/auth/handler
   ```

---

## ✅ Verificação

Após configurar:

1. Teste o login no Client Portal: https://nprocess-8e801.web.app/login
2. Clique em "Entrar com Google"
3. Deve abrir o popup de autenticação do Google
4. Após autenticar, deve redirecionar para o dashboard

---

## 🔧 Credenciais OAuth

### Client ID
```
[CONFIGURAR_NO_FIREBASE_CONSOLE]
```

### Client Secret
```
[CONFIGURAR_NO_FIREBASE_CONSOLE]
```

### Projeto Google Cloud
```
nprocess-prod ([CONFIGURAR_NO_FIREBASE_CONSOLE])
```

---

## 📝 Notas Importantes

- **Firebase Auth**: Deve estar habilitado no projeto `nprocess-8e801`
- **Google Sign-In**: Deve estar ativado como método de login
- **OAuth Credentials**: Podem ser gerenciadas pelo Firebase ou manualmente
- **Redirect URIs**: Devem incluir todos os domínios onde a aplicação está hospedada
- **OAuth Consent Screen**: Deve estar configurado no Google Cloud Console

---

## 🆘 Troubleshooting

### Erro: `auth/configuration-not-found`
- ✅ Verifique se Firebase Authentication está habilitado
- ✅ Verifique se Google Sign-In está ativado
- ✅ Verifique se as credenciais OAuth estão corretas

### Erro: `auth/unauthorized-domain`
- ✅ Adicione o domínio em Authorized domains no Firebase Console
- ✅ Adicione o domínio no OAuth Consent Screen

### Erro: `redirect_uri_mismatch`
- ✅ Verifique se os Redirect URIs estão corretos no Google Cloud Console
- ✅ Certifique-se de que inclui todos os domínios (web.app, firebaseapp.com, custom domain)

---

## 🔗 Links Úteis

- **Firebase Auth Console**: https://console.firebase.google.com/project/nprocess-8e801/authentication
- **Google Cloud OAuth**: https://console.cloud.google.com/apis/credentials?project=nprocess-prod
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-prod

---

**Última Atualização**: 27 de Dezembro de 2024

