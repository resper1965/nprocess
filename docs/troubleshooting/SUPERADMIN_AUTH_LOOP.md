# 🔧 Guia de Diagnóstico: Loop de Autenticação Superadmin

**Problema**: Usuário autentica mas a aplicação não carrega e volta para a tela de autenticação (loop infinito).

**Usuário Afetado**: `resper@ness.com.br` (superadmin)

---

## 🔍 Diagnóstico do Problema

### Causas Identificadas

O loop de autenticação ocorre quando:

1. ❌ **Custom claim não configurado**: O usuário não tem `role: 'super_admin'` no Firebase Auth
2. ❌ **Documento Firestore ausente**: O documento `/users/{uid}` não existe ou não tem o campo `role`
3. ❌ **UID incorreto**: O script de configuração foi executado com UID diferente do usuário atual
4. ⚠️ **Token desatualizado**: O usuário não fez logout/login após configurar o role

### Fluxo do Problema

```
1. Usuário autentica → ✅ Sucesso (Firebase Auth)
2. App busca role do custom claim → ❌ Não encontrado
3. App tenta buscar do Firestore → ❌ Documento não existe ou sem role
4. Role defaulta para 'user'
5. isAdmin = false
6. Tenta acessar /admin → Redirecionado para /dashboard
7. Dashboard valida permissão → Falha
8. Volta para /login → LOOP INFINITO
```

---

## 🛠️ Solução: Passo a Passo

### Etapa 1: Identificar o UID do Usuário

**Opção A: Via Firebase Console**

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/users
2. Busque pelo email `resper@ness.com.br`
3. Copie o **User UID**

**Opção B: Via Console do Navegador**

1. Abra a aplicação e tente fazer login
2. Abra o Console do Navegador (F12)
3. Procure nos logs por mensagens como:
   ```
   checkRedirectResult: Token claims { uid: "XXXXX", email: "resper@ness.com.br", ... }
   ```
4. Copie o UID

**Opção C: Via Script de Diagnóstico**

```bash
cd /home/user/nprocess
python scripts/diagnose-auth.py
```

O script irá mostrar:
- UID do usuário
- Custom claims configurados
- Documento no Firestore
- Sincronização entre Auth e Firestore

---

### Etapa 2: Configurar o Superadmin

**IMPORTANTE**: Execute apenas UM dos métodos abaixo.

#### Método 1: Via Cloud Shell (Recomendado para Produção) ✅

```bash
# 1. Abrir Cloud Shell
https://shell.cloud.google.com

# 2. Executar script
cd /home/resper/nProcess/nprocess
python3 scripts/set-super-admin-prod.py
```

**Antes de executar**, edite o arquivo `scripts/set-super-admin-prod.py` e atualize:
```python
USER_UID = 'SEU_UID_AQUI'  # Substitua pelo UID correto
```

#### Método 2: Via Script Local (Para Desenvolvimento)

```bash
cd /home/user/nprocess

# Instalar dependências (se necessário)
pip install firebase-admin

# Editar o script e atualizar o UID
nano scripts/set-super-admin.py
# Alterar linha 21: USER_UID = 'SEU_UID_AQUI'

# Executar
python scripts/set-super-admin.py
```

#### Método 3: Via Firebase Console (Manual)

**⚠️ ATENÇÃO**: Este método requer configuração manual em 2 lugares.

1. **Firebase Auth Custom Claims** (via Cloud Functions ou Admin SDK)
   ```javascript
   admin.auth().setCustomUserClaims(uid, { role: 'super_admin' });
   ```

2. **Firestore Document**
   - Navegue até: https://console.firebase.google.com/project/nprocess-8e801/firestore
   - Vá para: `users/{uid}`
   - Adicione/Edite o campo: `role: 'super_admin'`

---

### Etapa 3: Verificar Configuração

Execute o script de diagnóstico para confirmar:

```bash
python scripts/diagnose-auth.py
```

**Resultado Esperado:**

```
✅ Custom claims encontrados: {'role': 'super_admin'}
✅ Role definido: super_admin
✅ Usuário é admin/super_admin
✅ Documento encontrado em /users/{uid}
✅ Role no Firestore: super_admin
✅ Roles sincronizados: super_admin
```

---

### Etapa 4: Logout e Login

**CRÍTICO**: O usuário DEVE fazer logout e login novamente.

**Por quê?**
- Custom claims são armazenados no JWT token
- O token só é renovado após logout/login
- Até renovar, o token antigo (sem o role) continua sendo usado

**Como fazer:**

1. Na aplicação, clique em **Logout**
2. Aguarde 5 segundos
3. Faça **Login** novamente
4. Verifique se foi redirecionado para `/admin/overview`

---

## 📊 Verificação com Logs do Navegador

Após o login, abra o Console do Navegador (F12) e verifique os logs:

### ✅ Logs Corretos (Tudo Funcionando)

```
checkRedirectResult: Token claims {
  uid: "XXXXX",
  email: "resper@ness.com.br",
  customClaims: { role: "super_admin" },
  roleFromClaim: "super_admin"
}

checkRedirectResult: Using role from custom claim: super_admin

checkRedirectResult: Final role determined {
  uid: "XXXXX",
  email: "resper@ness.com.br",
  finalRole: "super_admin",
  isAdmin: true
}

checkRedirectResult: Google login successful, redirecting to: /admin/overview
```

### ❌ Logs com Problema (Custom Claim Ausente)

```
checkRedirectResult: Token claims {
  uid: "XXXXX",
  email: "resper@ness.com.br",
  customClaims: {},  ← VAZIO!
  roleFromClaim: undefined  ← SEM ROLE!
}

checkRedirectResult: No custom claim, checking Firestore...

checkRedirectResult: Firestore profile {
  uid: "XXXXX",
  profile: null,  ← DOCUMENTO NÃO EXISTE!
  hasProfile: false,
  roleFromFirestore: undefined
}

checkRedirectResult: No role in Firestore, defaulting to "user"

checkRedirectResult: Final role determined {
  finalRole: "user",  ← DEFAULTOU PARA USER!
  isAdmin: false  ← NÃO É ADMIN!
}
```

**Ação**: Execute o script de configuração (Etapa 2).

### ⚠️ Logs com Firestore Bloqueado

```
checkRedirectResult: No custom claim, checking Firestore...

onAuthStateChanged (normal): Error fetching user profile from Firestore:
FirebaseError: Missing or insufficient permissions.

checkRedirectResult: This might be due to Firestore rules or missing document
```

**Possíveis Causas:**
1. Documento não existe
2. Regras do Firestore estão bloqueando o acesso
3. Token expirado

**Ação**: Verifique se o documento existe no Firestore.

---

## 🔍 Checklist de Diagnóstico

Use este checklist para identificar o problema:

- [ ] **Usuário autentica com sucesso?**
  - [ ] Sim → Continuar
  - [ ] Não → Problema de credenciais ou Firebase Auth

- [ ] **Custom claim `role` está configurado?**
  - [ ] Sim → Qual valor? _______________
  - [ ] Não → **PROBLEMA IDENTIFICADO** → Execute Etapa 2

- [ ] **Documento `/users/{uid}` existe no Firestore?**
  - [ ] Sim → Continuar
  - [ ] Não → **PROBLEMA IDENTIFICADO** → Execute Etapa 2

- [ ] **Campo `role` no documento do Firestore?**
  - [ ] Sim → Qual valor? _______________
  - [ ] Não → **PROBLEMA IDENTIFICADO** → Execute Etapa 2

- [ ] **Role é `super_admin` ou `admin`?**
  - [ ] Sim → Continuar
  - [ ] Não → **PROBLEMA IDENTIFICADO** → Valor incorreto

- [ ] **Custom claim sincronizado com Firestore?**
  - [ ] Sim → Continuar
  - [ ] Não → **PROBLEMA IDENTIFICADO** → Execute Etapa 2

- [ ] **Usuário fez logout/login após configuração?**
  - [ ] Sim → Continuar
  - [ ] Não → **AÇÃO NECESSÁRIA** → Fazer logout/login

- [ ] **Logs do navegador mostram `isAdmin: true`?**
  - [ ] Sim → ✅ Configuração correta
  - [ ] Não → Revisar logs e identificar erro específico

---

## 🆘 Troubleshooting Avançado

### Problema: "User not found" no diagnóstico

**Causa**: O usuário nunca fez login na aplicação.

**Solução**:
1. Faça login pelo menos uma vez
2. O Firebase Auth criará o usuário automaticamente
3. Execute o script de configuração novamente

---

### Problema: Custom claims não aparecem após configuração

**Causa**: Token JWT ainda não foi renovado.

**Solução**:
1. Fazer logout
2. **Limpar cache do navegador** (Ctrl+Shift+Delete)
3. **Fechar todas as abas** da aplicação
4. Abrir nova aba
5. Fazer login novamente
6. Aguardar até 5 minutos para propagação

---

### Problema: Erro "Permission denied" ao buscar Firestore

**Causa**: Regras do Firestore podem estar muito restritivas.

**Solução**: Verificar regras em `firestore.rules`:

```javascript
// Linha 26: Regra de leitura de users
match /users/{userId} {
  allow read: if isOwner(userId) || isAdmin();
  // ...
}
```

**Verificar**:
- Função `isOwner()` permite que o usuário leia seu próprio documento
- Função `isAdmin()` verifica custom claims no token

**Se necessário**, temporariamente permitir leitura para diagnosticar:
```javascript
match /users/{userId} {
  allow read: if isAuthenticated();  // Temporário para diagnóstico
}
```

**⚠️ IMPORTANTE**: Reverter após diagnosticar!

---

### Problema: Loop continua mesmo com configuração correta

**Possíveis Causas**:
1. Cache do navegador
2. Token expirado mas não renovado
3. Problema de race condition no código
4. ServiceWorker antigo

**Solução**:
1. **Hard Refresh**: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
2. **Limpar cache**: Ctrl+Shift+Delete → Limpar cache e cookies
3. **Modo Anônimo**: Testar em aba anônima
4. **Desregistrar Service Worker**:
   - F12 → Application → Service Workers → Unregister
5. **Verificar outro navegador**: Testar em Chrome, Firefox, Edge

---

## 📝 UIDs Conhecidos

Para referência:

| Ambiente | Email | UID |
|----------|-------|-----|
| **Produção** | resper@ness.com.br | `hp9TADsRoHfJ4GgSIjQejmCDRCt2` |
| **Desenvolvimento** | resper@ness.com.br | `V1CfZSmqLyYQtp2C3yqBgcSUq9h2` |

**⚠️ IMPORTANTE**: Sempre verifique o UID correto usando o Firebase Console ou o script de diagnóstico!

---

## 📚 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `scripts/diagnose-auth.py` | Script de diagnóstico completo |
| `scripts/set-super-admin.py` | Configurar superadmin (local/dev) |
| `scripts/set-super-admin-prod.py` | Configurar superadmin (produção) |
| `web-portal/src/lib/auth-context.tsx` | Contexto de autenticação (melhorado com logs) |
| `firestore.rules` | Regras de segurança do Firestore |
| `docs/DEFINIR_SUPER_ADMIN_PRODUCAO.md` | Guia de configuração em produção |

---

## 🎯 Melhorias Implementadas

Esta versão inclui as seguintes melhorias no código:

### 1. **Diferenciação entre role undefined e role 'user'**

**Antes** (PROBLEMA):
```typescript
if (!userRole || userRole === 'user') {  // ❌ Trata 'user' como ausente!
  // Buscar do Firestore
}
```

**Depois** (CORRIGIDO):
```typescript
if (!userRole) {  // ✅ Só busca se realmente ausente (undefined/null)
  // Buscar do Firestore
}
```

### 2. **Logs Detalhados para Diagnóstico**

Agora todos os pontos de carregamento de role incluem logs detalhados:

```typescript
console.log('checkRedirectResult: Token claims', {
  uid: user.uid,
  email: user.email,
  customClaims: tokenResult.claims,
  roleFromClaim: userRole
});
```

Isso permite identificar exatamente onde o problema está ocorrendo.

### 3. **Mensagens de Erro Específicas**

```typescript
console.error("checkRedirectResult: Error fetching user profile from Firestore:", fsError);
console.error("checkRedirectResult: This might be due to Firestore rules or missing document");
```

### 4. **Tratamento Consistente em Todos os Fluxos**

A mesma lógica é aplicada em:
- `checkRedirectResult()` - Após redirect do Google
- `onAuthStateChanged()` - Quando detecta redirect
- `onAuthStateChanged()` (normal) - Para usuários já autenticados
- `handleLogin()` - Login com email/senha

---

## ✅ Próximos Passos

1. **Execute o script de diagnóstico**:
   ```bash
   python scripts/diagnose-auth.py
   ```

2. **Se necessário, configure o superadmin**:
   ```bash
   # Edite o UID primeiro!
   nano scripts/set-super-admin.py
   python scripts/set-super-admin.py
   ```

3. **Faça logout e login novamente**

4. **Verifique os logs do navegador** (F12 → Console)

5. **Se o problema persistir**, copie os logs do Console e compartilhe para análise mais detalhada

---

**Última Atualização**: 7 de Janeiro de 2026
**Versão do Código**: Inclui melhorias de diagnóstico e tratamento de role
