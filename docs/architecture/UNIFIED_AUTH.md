# Autenticação Unificada - n.process

**Data**: 27 de Dezembro de 2024  
**Status**: ✅ Implementado

## 🎯 Objetivo

Unificar todas as credenciais e autenticação do sistema para usar **Firebase Auth** em todos os serviços, eliminando sistemas de autenticação separados.

## ✅ Implementação

### 1. Admin Control Plane

**Antes:**
- Autenticação própria com PostgreSQL (email/password no banco)
- JWT mock (não implementado)
- Sistema separado do Client Portal

**Depois:**
- ✅ Firebase Admin SDK integrado
- ✅ Validação de Firebase ID tokens
- ✅ Middleware atualizado para usar Firebase Auth
- ✅ Router de auth atualizado (`/v1/auth/verify`, `/v1/auth/me`)

**Arquivos Modificados:**
- `admin-control-plane/requirements.txt` - Adicionado `firebase-admin==6.6.0`
- `admin-control-plane/app/services/firebase_service.py` - Novo serviço Firebase
- `admin-control-plane/app/middleware/auth.py` - Atualizado para Firebase Auth
- `admin-control-plane/app/routers/auth.py` - Endpoints unificados

### 2. Client Portal

**Antes:**
- Firebase Auth (já estava correto)
- Chamadas de API sem token automático

**Depois:**
- ✅ Cliente de API unificado (`api-client.ts`)
- ✅ Injeção automática de Firebase ID token
- ✅ Helpers para requisições autenticadas

**Arquivos Modificados:**
- `client-portal/src/lib/api-client.ts` - Cliente unificado com auth automática

### 3. n.process API

**Status:**
- ✅ Já usa Firebase Auth (sem mudanças necessárias)
- ✅ Valida tokens Firebase via `firebase_service.py`

## 🔐 Fluxo de Autenticação Unificado

```
┌─────────────────┐
│  Client Portal  │
│  (Firebase Auth)│
└────────┬────────┘
         │
         │ 1. Login (Email/Google)
         ▼
┌─────────────────┐
│  Firebase Auth  │
│  (ID Token)      │
└────────┬────────┘
         │
         │ 2. Firebase ID Token
         │
    ┌────┴────┬──────────────┐
    │         │              │
    ▼         ▼              ▼
┌────────┐ ┌──────────┐ ┌─────────┐
│ Admin  │ │ n.process│ │ Client  │
│ Control│ │   API    │ │ Portal  │
│ Plane  │ │          │ │ (SSR)   │
└────────┘ └──────────┘ └─────────┘
    │         │              │
    │         │              │
    └─────────┴──────────────┘
              │
              │ 3. Verificar Token
              ▼
      ┌───────────────┐
      │ Firebase Admin│
      │ SDK           │
      └───────────────┘
```

## 📋 Endpoints de Autenticação

### Admin Control Plane

#### Verificar Token
```http
POST /v1/auth/verify
Content-Type: application/json

{
  "id_token": "firebase_id_token_here"
}
```

**Resposta:**
```json
{
  "user": {
    "user_id": "uid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "status": "ACTIVE"
  },
  "valid": true
}
```

#### Obter Usuário Atual
```http
GET /v1/auth/me
Authorization: Bearer <firebase_id_token>
```

**Resposta:**
```json
{
  "user_id": "uid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "status": "ACTIVE"
}
```

## 🔧 Como Usar

### No Client Portal

#### Usando axios (recomendado)
```typescript
import { adminApi, nprocessApi } from '@/lib/api-client'

// Token é injetado automaticamente
const response = await adminApi.get('/v1/admin/apikeys')
const data = await nprocessApi.post('/v1/compliance/analyze', payload)
```

#### Usando fetch
```typescript
import { authenticatedFetch } from '@/lib/api-client'

const response = await authenticatedFetch(
  `${process.env.NEXT_PUBLIC_ADMIN_API_URL}/v1/admin/apikeys`
)
```

#### Obter token manualmente
```typescript
import { getCurrentUserToken } from '@/lib/api-client'

const token = await getCurrentUserToken()
// Usar token em requisições customizadas
```

### No Admin Control Plane

Todos os endpoints agora requerem Firebase ID token:

```python
from app.middleware.auth import get_current_user, require_admin_user

@router.get("/endpoint")
async def my_endpoint(current_user: dict = Depends(get_current_user)):
    # current_user contém: uid, email, name, role, etc.
    return {"user": current_user}
```

## 🔄 Migração

### Para Desenvolvedores

1. **Client Portal**: Já está usando Firebase Auth - sem mudanças necessárias
2. **Admin Control Plane**: Agora requer Firebase ID token em vez de credenciais PostgreSQL
3. **n.process API**: Já estava usando Firebase Auth - sem mudanças

### Para Usuários

- Login continua funcionando normalmente
- Login com Google funciona
- Todas as requisições usam o mesmo token Firebase

## 🔐 Segurança

### Tokens Firebase
- Tokens são verificados pelo Firebase Admin SDK
- Tokens expiram automaticamente (1 hora)
- Tokens podem ser revogados no Firebase Console

### Roles (Custom Claims)
- Roles são armazenadas como custom claims no Firebase
- Roles também podem ser consultadas no Firestore (`users/{uid}/role`)
- Roles: `user`, `admin`, `super_admin`

### Validação
- Todos os serviços verificam tokens via Firebase Admin SDK
- Tokens inválidos/expirados retornam 401
- Roles são verificadas para endpoints administrativos

## 📝 Notas Importantes

1. **PostgreSQL ainda é usado** para dados administrativos (não para autenticação)
2. **Firestore** é usado para perfis de usuário e roles
3. **Custom Claims** são preferidos para roles (mais rápido, sem leitura no Firestore)
4. **Backward Compatibility**: Funções antigas de API keys ainda funcionam

## 🧪 Testando

### 1. Testar Login
```bash
# Acesse o Client Portal
https://nprocess-33a44.web.app/login

# Faça login com Google ou email/password
```

### 2. Testar API
```bash
# Obter token (via Client Portal ou Firebase SDK)
TOKEN="seu_firebase_id_token"

# Testar Admin Control Plane
curl -H "Authorization: Bearer $TOKEN" \
  https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app/v1/auth/me

# Testar n.process API
curl -H "Authorization: Bearer $TOKEN" \
  https://nprocess-api-dev-5wqihg7s7a-uc.a.run.app/health
```

## ✅ Status Final

- ✅ **Client Portal**: Firebase Auth (já estava)
- ✅ **Admin Control Plane**: Firebase Auth (implementado)
- ✅ **n.process API**: Firebase Auth (já estava)
- ✅ **API Client**: Injeção automática de tokens
- ✅ **Deploy**: Todos os serviços atualizados

**Todas as credenciais estão unificadas usando Firebase Auth!** 🎉

