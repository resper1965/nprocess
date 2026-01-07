# 🔍 Diagnosticar Problema de Redirect do Google

**Problema**: Após fazer login com Google, o sistema não detecta o usuário.

**Logs observados**:
```
handleGoogleRedirect: getRedirectResult returned { hasResult: false, ... }
handleGoogleRedirect: No redirect result and no currentUser
onAuthStateChanged: Coming from redirect but no user yet, waiting...
onAuthStateChanged: After wait (attempt X), checking user again { hasUser: false }
```

---

## 🔍 Diagnóstico

### Possíveis Causas

1. **Redirect URI Mismatch** ❌
   - O redirect URI configurado no Google OAuth não corresponde à URL atual
   - Firebase Auth não consegue processar o redirect

2. **Firebase Auth Domain Não Autorizado** ❌
   - O domínio não está em "Authorized domains" no Firebase Auth
   - Firebase bloqueia o redirect

3. **Tracking Prevention Bloqueando Storage** ⚠️
   - Edge/Safari bloqueando IndexedDB/localStorage
   - Firebase Auth não consegue salvar o estado

4. **Redirect Já Processado** ⚠️
   - O redirect foi processado em outra aba
   - `getRedirectResult` só pode ser chamado uma vez

5. **URL de Redirect Incorreta** ❌
   - A URL de retorno do Google não está correta
   - Firebase Auth não reconhece como redirect válido

---

## ✅ Verificações Necessárias

### 1. Verificar URL de Redirect no Console

Após fazer login com Google, verifique no console:

```
handleGoogleRedirect: Calling getRedirectResult... {
  fullUrl: 'https://...',
  urlParams: '...',
  ...
}
```

**O que verificar:**
- A `fullUrl` deve ser a URL da aplicação (não do Google)
- Os `urlParams` devem conter parâmetros do Firebase (ex: `__firebase_request_key`, `apiKey`)

**Se `urlParams` estiver vazio:**
- O redirect não está voltando corretamente
- Verificar configuração do OAuth

---

### 2. Verificar OAuth Configuration

**URL**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801

**Verificar:**

1. **Authorized JavaScript origins:**
   - ✅ `https://nprocess-8e801-4711d.web.app`
   - ✅ `https://nprocess-8e801-4711d.firebaseapp.com`
   - ✅ `https://nprocess.ness.com.br` (se usar custom domain)

2. **Authorized redirect URIs:**
   - ✅ `https://nprocess-8e801-4711d.web.app/__/auth/handler`
   - ✅ `https://nprocess-8e801-4711d.firebaseapp.com/__/auth/handler`
   - ✅ `https://nprocess.ness.com.br/__/auth/handler` (se usar custom domain)

**⚠️ IMPORTANTE:**
- As URLs devem ser EXATAS (sem barra no final, exceto `/__/auth/handler`)
- Não pode ter espaços ou caracteres especiais

---

### 3. Verificar Firebase Auth Authorized Domains

**URL**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings

**Verificar se estão autorizados:**
- ✅ `nprocess-8e801-4711d.web.app`
- ✅ `nprocess-8e801-4711d.firebaseapp.com`
- ✅ `nprocess.ness.com.br` (se usar custom domain)
- ✅ `localhost` (desenvolvimento)

---

### 4. Verificar Tracking Prevention

**Se estiver usando Edge ou Safari:**

1. **Verificar logs no console:**
   - Procure por: "Tracking Prevention blocked"
   - Procure por: "storage blocked"
   - Procure por: "IndexedDB"

2. **Desabilitar Tracking Prevention temporariamente:**
   - Edge: Configurações → Privacidade → Tracking Prevention → Desabilitar para o site
   - Safari: Preferências → Privacidade → Prevenção de rastreamento → Desabilitar

3. **Testar novamente**

---

## 🛠️ Soluções

### Solução 1: Verificar e Corrigir OAuth Configuration

1. **Acessar Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials?project=nprocess-8e801

2. **Editar OAuth 2.0 Client ID**

3. **Verificar Authorized redirect URIs:**
   ```
   https://nprocess-8e801-4711d.web.app/__/auth/handler
   https://nprocess-8e801-4711d.firebaseapp.com/__/auth/handler
   ```

4. **Se usar custom domain, adicionar:**
   ```
   https://nprocess.ness.com.br/__/auth/handler
   ```

5. **Salvar e aguardar 2-5 minutos para propagação**

---

### Solução 2: Verificar Firebase Auth Domains

1. **Acessar Firebase Console:**
   - https://console.firebase.google.com/project/nprocess-8e801/authentication/settings

2. **Verificar "Authorized domains"**

3. **Adicionar domínios se necessário:**
   - `nprocess-8e801-4711d.web.app`
   - `nprocess-8e801-4711d.firebaseapp.com`
   - `nprocess.ness.com.br` (se usar custom domain)

---

### Solução 3: Limpar Tudo e Tentar Novamente

1. **Limpar cache do navegador:**
   - `Ctrl+Shift+Delete`
   - Marcar tudo
   - Limpar

2. **Fechar todas as abas**

3. **Abrir nova aba em modo anônimo**

4. **Acessar aplicação e fazer login**

5. **Verificar logs no console**

---

## 📊 Logs Esperados (Funcionando)

Se tudo estiver funcionando, você verá:

```
handleGoogleRedirect: Calling getRedirectResult... {
  urlParams: '__firebase_request_key=...&apiKey=...',
  isRedirectUrl: true
}

handleGoogleRedirect: getRedirectResult returned {
  hasResult: true,
  hasUser: true,
  uid: 'hp9TADsRoHfJ4GgSIjQejmCDRCt2',
  email: 'resper@ness.com.br'
}

checkRedirectResult: Token claims {
  customClaims: { role: "super_admin" },
  roleFromClaim: "super_admin"
}

⭐ SUPER ADMIN DETECTED!
```

---

## 📋 Checklist de Diagnóstico

- [ ] URL de redirect contém parâmetros do Firebase (`__firebase_request_key`, `apiKey`)
- [ ] OAuth redirect URIs estão configurados corretamente
- [ ] Firebase Auth domains estão autorizados
- [ ] Tracking Prevention não está bloqueando (se Edge/Safari)
- [ ] Não há outras abas com a aplicação aberta
- [ ] Cache foi limpo
- [ ] Testado em modo anônimo

---

**Última Atualização**: 07 de Janeiro de 2026
