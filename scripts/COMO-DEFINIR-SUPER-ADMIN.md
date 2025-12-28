# Como Definir Super Admin - Guia Rápido

## ⚠️ Não encontrei "Custom Claims" no Firebase Console

A opção de Custom Claims pode não estar visível na interface atual do Firebase Console. Use uma das opções abaixo:

## ✅ Opção 1: Cloud Shell do GCP (Mais Fácil)

1. Acesse: https://console.cloud.google.com/cloudshell?project=nprocess-33a44
2. Execute:

```bash
cd /home/resper/nProcess/nprocess
bash scripts/set-super-admin-gcp.sh
```

## ✅ Opção 2: Via API (Se já tiver um admin)

1. Faça login no Client Portal: https://nprocess-33a44.web.app
2. Abra o console do navegador (F12)
3. Execute:

```javascript
// Obter token
const user = auth.currentUser
const token = await user.getIdToken()
console.log('Token:', token)
// Copie o token que aparecer
```

4. Execute no terminal:

```bash
curl -X POST \
  https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app/v1/admin/utils/set-super-admin/V1CfZSmqLyYQtp2C3yqBgcSUq9h2 \
  -H "Authorization: Bearer COLE_SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

## ✅ Opção 3: Firebase Console (Se encontrar a opção)

1. Acesse: https://console.firebase.google.com/project/nprocess-33a44/authentication/users
2. Clique no usuário com UID: `V1CfZSmqLyYQtp2C3yqBgcSUq9h2`
3. Procure por:
   - **"Custom Claims"** (pode estar em uma aba)
   - **"Add custom attribute"**
   - **"Edit user"** → procure por claims
4. Adicione:
   - Key: `role`
   - Value: `super_admin`

## ✅ Opção 4: Script Python Local

Se você tem o firebase-admin instalado localmente:

```bash
cd /home/resper/nProcess/nprocess
python3 scripts/set-super-admin-simple.py
```

## 🔍 Verificar se Funcionou

Após definir o super_admin:

1. **IMPORTANTE**: Faça logout e login novamente no Client Portal
2. Acesse: https://nprocess-33a44.web.app/dashboard/settings
3. Deve mostrar "Super Admin" no badge de role
4. Acesse: https://nprocess-33a44.web.app/admin/overview
5. Deve ter acesso (se não tiver, o role não foi aplicado)

## 📝 Por que fazer logout/login?

Os custom claims são incluídos no token JWT apenas quando um **novo token é emitido**. Por isso é necessário fazer logout e login novamente após definir o role.

## 🆘 Ainda não funcionou?

Se nenhuma opção funcionar, podemos criar uma Cloud Function temporária. Me avise!

