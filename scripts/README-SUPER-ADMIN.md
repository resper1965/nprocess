# Como Definir Super Admin

## Método 1: Via Firebase Console (Recomendado)

1. Acesse: https://console.firebase.google.com/project/nprocess-33a44/authentication/users
2. Selecione o usuário com UID: `V1CfZSmqLyYQtp2C3yqBgcSUq9h2`
3. Clique em **"Custom Claims"**
4. Adicione:
   - Key: `role`
   - Value: `super_admin`
5. Clique em **"Save"**

## Método 2: Via Admin Control Plane API

```bash
# Obter Firebase ID Token primeiro (faça login no Client Portal)
# Depois execute:
curl -X POST \
  https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app/v1/admin/utils/set-super-admin/V1CfZSmqLyYQtp2C3yqBgcSUq9h2 \
  -H "Authorization: Bearer <seu_firebase_id_token>" \
  -H "Content-Type: application/json"
```

## Método 3: Via Script Node.js

```bash
# Instalar dependência (se necessário)
cd client-portal
npm install firebase-admin

# Configurar credenciais
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Executar script
cd ..
node scripts/set-super-admin-firebase.js
```

## Método 4: Via Script Python (Admin Control Plane)

```bash
cd admin-control-plane
python3 -c "
import firebase_admin
from firebase_admin import auth, firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

uid = 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2'
auth.set_custom_user_claims(uid, {'role': 'super_admin'})
db = firestore.client()
db.collection('users').document(uid).set({'role': 'super_admin'}, merge=True)
print('✅ Super admin definido!')
"
```

## ⚠️ Importante

Após definir o super_admin, o usuário **DEVE**:
1. Fazer **logout** da aplicação
2. Fazer **login** novamente
3. O novo token JWT conterá o custom claim `role: 'super_admin'`

Isso acontece porque os custom claims são incluídos no token JWT apenas quando um novo token é emitido.

## Verificação

Para verificar se funcionou:

1. No Client Portal, após login, abra o console do navegador
2. Execute:
```javascript
import { auth } from '@/lib/firebase-config'
import { getIdTokenResult } from 'firebase/auth'

const user = auth.currentUser
if (user) {
  const tokenResult = await getIdTokenResult(user)
  console.log('Role:', tokenResult.claims.role)
  console.log('All claims:', tokenResult.claims)
}
```

Ou verifique na interface:
- Acesse `/dashboard/settings` - deve mostrar "Super Admin" no badge
- Acesse `/admin/overview` - deve ter acesso (se não tiver, o role não foi aplicado)

