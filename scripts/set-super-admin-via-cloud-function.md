# Como Definir Super Admin - Guia Completo

## ⚠️ Custom Claims no Firebase Console

**Nota**: A interface do Firebase Console pode não mostrar a opção "Custom Claims" diretamente na página de usuários. Isso varia conforme a versão do console.

## ✅ Métodos Disponíveis

### Método 1: Script Python (Mais Fácil) ⭐

Execute diretamente no Admin Control Plane:

```bash
cd /home/resper/nProcess/nprocess
python3 scripts/set-super-admin-simple.py
```

Este script:
- Usa o firebase-admin já instalado no Admin Control Plane
- Define o custom claim automaticamente
- Atualiza o Firestore
- Mostra confirmação

### Método 2: Via Admin Control Plane API

Se você já tem um usuário admin, pode usar a API:

```bash
# 1. Faça login no Client Portal
# 2. Abra o console do navegador (F12)
# 3. Execute:
const user = auth.currentUser
const token = await user.getIdToken()
console.log('Token:', token)

# 4. Use o token na requisição:
curl -X POST \
  https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app/v1/admin/utils/set-super-admin/V1CfZSmqLyYQtp2C3yqBgcSUq9h2 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

### Método 3: Firebase Console (Se disponível)

1. Acesse: https://console.firebase.google.com/project/nprocess-33a44/authentication/users
2. Clique no usuário com UID: `V1CfZSmqLyYQtp2C3yqBgcSUq9h2`
3. Procure por:
   - **"Custom Claims"** (pode estar em uma aba ou seção)
   - **"Add custom attribute"**
   - **"Edit user"** → **"Custom claims"**
4. Se não encontrar, use o Método 1 (script Python)

### Método 4: Cloud Function (Avançado)

Crie uma Cloud Function temporária:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setSuperAdmin = functions.https.onCall(async (data, context) => {
  const uid = data.uid || 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2';
  
  await admin.auth().setCustomUserClaims(uid, { role: 'super_admin' });
  
  const db = admin.firestore();
  await db.collection('users').doc(uid).set({
    role: 'super_admin',
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  
  return { success: true, message: `User ${uid} set as super_admin` };
});
```

## 🔍 Verificar se Funcionou

Após definir o super_admin:

1. **Faça logout e login novamente** (importante!)
2. Abra o console do navegador
3. Execute:

```javascript
import { auth } from '@/lib/firebase-config'
import { getIdTokenResult } from 'firebase/auth'

const user = auth.currentUser
if (user) {
  const tokenResult = await getIdTokenResult(user)
  console.log('Role:', tokenResult.claims.role)
  // Deve mostrar: "super_admin"
}
```

Ou verifique na interface:
- Acesse `/dashboard/settings` - deve mostrar "Super Admin"
- Acesse `/admin/overview` - deve ter acesso

## 📝 Nota Importante

Os custom claims são incluídos no token JWT apenas quando um **novo token é emitido**. Por isso é necessário fazer logout e login novamente após definir o role.

