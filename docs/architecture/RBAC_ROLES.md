# RBAC - Roles e Permissões

**Data**: 27 de Dezembro de 2024

## 📋 Os 6 Roles Disponíveis

| Role | Descrição | Permissões |
|------|-----------|------------|
| **`super_admin`** | Super Administrador | Acesso total + gerenciamento de outros admins |
| **`admin`** | Administrador | Gerenciar usuários, API keys, acessar Admin Console |
| **`finops_manager`** | Gerente FinOps | Visualizar e gerenciar custos |
| **`auditor`** | Auditor | Apenas leitura de logs de auditoria |
| **`user`** | Usuário | Usar plataforma (dashboard do cliente) |
| **`viewer`** | Visualizador | Apenas leitura |

## 🔍 Como Verificar Seu Role

### No Client Portal (Frontend)

#### 1. Via Console do Navegador

Abra o console do navegador (F12) e execute:

```javascript
// Verificar role atual
const { useAuth } = require('@/lib/auth-context');
// Ou no console do navegador:
localStorage.getItem('firebase:authUser:...') // Ver token
```

#### 2. Via Código React

```typescript
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { role, isAdmin, user } = useAuth()
  
  console.log('Role:', role)
  console.log('Is Admin:', isAdmin)
  console.log('User:', user)
  
  return (
    <div>
      <p>Seu role: {role}</p>
      <p>É admin: {isAdmin ? 'Sim' : 'Não'}</p>
    </div>
  )
}
```

#### 3. Via Firebase Token

O role está armazenado como **Custom Claim** no Firebase ID Token:

```javascript
import { auth } from '@/lib/firebase-config'
import { getIdTokenResult } from 'firebase/auth'

const user = auth.currentUser
if (user) {
  const tokenResult = await getIdTokenResult(user)
  const role = tokenResult.claims.role || 'user'
  console.log('Role:', role)
}
```

### No Admin Control Plane (Backend)

#### Via API Endpoint

```bash
# Obter informações do usuário atual
curl -H "Authorization: Bearer <firebase_id_token>" \
  https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app/v1/auth/me
```

Resposta:
```json
{
  "user_id": "uid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin",
  "status": "ACTIVE"
}
```

## ✅ Como Saber Se Você É Admin

### Critério de Admin

Você é considerado **admin** se tiver um dos seguintes roles:
- `admin`
- `super_admin`

### Verificação no Código

```typescript
// No Client Portal
const { isAdmin, role } = useAuth()

if (isAdmin) {
  // Você tem acesso ao Admin Console
  // role será 'admin' ou 'super_admin'
}

// Verificação manual
const isAdmin = role === 'admin' || role === 'super_admin'
```

### Verificação no Backend

```python
# No Admin Control Plane
from app.services.firebase_service import is_admin

if is_admin(decoded_token):
    # Usuário é admin
    pass
```

## 🔐 Onde o Role é Armazenado

### 1. Firebase Custom Claims (Principal)

O role é armazenado como **Custom Claim** no Firebase ID Token:

```javascript
// Custom Claim no token
{
  "uid": "user123",
  "email": "user@example.com",
  "role": "admin",  // ← Custom Claim
  // ... outros claims
}
```

**Vantagens:**
- ✅ Incluído no token JWT (sem custo adicional)
- ✅ Disponível em todas as requisições
- ✅ Não requer leitura no Firestore

### 2. Firestore (Backup)

O role também é armazenado no Firestore em `users/{uid}/role`:

```javascript
// Firestore document
{
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin",  // ← Backup
  "created_at": "...",
  // ...
}
```

**Uso:**
- Fallback se custom claim não estiver disponível
- Consulta quando necessário

## 🎯 Como Atribuir Roles

### Via Firebase Admin SDK

```javascript
const admin = require('firebase-admin')

// Atribuir role de admin
await admin.auth().setCustomUserClaims(uid, { 
  role: 'admin' 
})

// Atribuir role de super_admin
await admin.auth().setCustomUserClaims(uid, { 
  role: 'super_admin' 
})
```

### Via Admin Control Plane API

```bash
# Atualizar role de usuário (requer admin)
PATCH /v1/admin/users/{user_id}
{
  "role": "admin"
}
```

### Via Firestore (Manual)

```javascript
// Atualizar no Firestore
await setDoc(doc(db, 'users', uid), {
  role: 'admin'
}, { merge: true })
```

**⚠️ Importante**: Sempre atualize tanto o Custom Claim quanto o Firestore para consistência.

## 📊 Permissões por Role

### `super_admin`
- ✅ Acesso total ao Admin Console
- ✅ Gerenciar outros admins
- ✅ Todas as permissões de `admin`
- ✅ Criar/atualizar/deletar qualquer usuário
- ✅ Gerenciar todas as API keys
- ✅ Acesso a todos os logs de auditoria

### `admin`
- ✅ Acesso ao Admin Console (`/admin/*`)
- ✅ Gerenciar usuários (exceto outros admins)
- ✅ Gerenciar API keys
- ✅ Visualizar custos (FinOps)
- ✅ Monitorar serviços
- ✅ Acessar logs de auditoria

### `finops_manager`
- ✅ Visualizar custos e métricas
- ✅ Gerenciar orçamentos
- ✅ Acessar relatórios de uso
- ❌ Não pode gerenciar usuários
- ❌ Não pode gerenciar API keys

### `auditor`
- ✅ Ler logs de auditoria
- ✅ Exportar relatórios
- ❌ Não pode modificar nada
- ❌ Não pode acessar Admin Console

### `user`
- ✅ Acessar Dashboard do Cliente (`/dashboard`)
- ✅ Gerenciar próprias API keys
- ✅ Executar análises de compliance
- ✅ Visualizar próprios processos
- ❌ Não pode acessar Admin Console

### `viewer`
- ✅ Apenas leitura de dados
- ❌ Não pode criar/modificar nada
- ❌ Não pode acessar Admin Console

## 🔍 Verificação de Acesso

### No Frontend (Client Portal)

```typescript
// Layout de Admin verifica automaticamente
// app/admin/layout.tsx
if (!isAdmin) {
  router.push('/dashboard') // Redireciona se não for admin
}
```

### No Backend (Admin Control Plane)

```python
# Middleware verifica role
@router.get("/admin/endpoint")
async def admin_endpoint(
    current_user: dict = Depends(require_admin_user)
):
    # Só executa se for admin
    pass
```

## 🛠️ Scripts Úteis

### Verificar Role Atual (Console do Navegador)

```javascript
// No console do navegador após login
import { auth } from '@/lib/firebase-config'
import { getIdTokenResult } from 'firebase/auth'

const user = auth.currentUser
if (user) {
  const tokenResult = await getIdTokenResult(user)
  console.log('Role:', tokenResult.claims.role)
  console.log('All claims:', tokenResult.claims)
}
```

### Atualizar Role (Firebase Console)

1. Acesse Firebase Console
2. Authentication → Users
3. Selecione o usuário
4. Custom Claims → Adicionar claim `role` com valor desejado

## 📝 Notas Importantes

1. **Custom Claims têm precedência**: O role no token JWT é verificado primeiro
2. **Firestore é fallback**: Se não houver custom claim, consulta Firestore
3. **Default é 'user'**: Se nenhum role for encontrado, assume 'user'
4. **Admin = admin OU super_admin**: Qualquer um dos dois dá acesso admin
5. **Tokens são cached**: Após atualizar role, usuário precisa fazer logout/login para obter novo token

## 🚀 Próximos Passos

Para verificar seu role na interface:
1. Acesse `/dashboard/settings` (em desenvolvimento)
2. Ou use o console do navegador
3. Ou verifique via API `/v1/auth/me`

