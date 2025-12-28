# 🔐 Definir Super Admin via Firebase Console

**UID**: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`  
**Método**: Firebase Console (Mais Simples)

---

## 📋 Passos no Firebase Console

### 1. Acessar Firebase Console

Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/users

### 2. Encontrar o Usuário

1. Na lista de usuários, procure pelo UID: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`
2. Ou procure pelo email do usuário
3. Clique no usuário para abrir os detalhes

### 3. Definir Custom Claims

**Opção A: Via Firebase Console (se disponível)**
- Na página do usuário, procure por "Custom Claims" ou "Claims personalizados"
- Adicione: `role: super_admin`
- Adicione: `admin: true`
- Salve

**Opção B: Via Cloud Functions (Recomendado)**

Se o Firebase Console não permitir editar custom claims diretamente, use uma Cloud Function:

1. Acesse: https://console.cloud.google.com/functions?project=nprocess-8e801
2. Crie uma nova função ou use o Cloud Shell

---

## 🚀 Método Alternativo: Cloud Shell

Execute no Cloud Shell (https://shell.cloud.google.com):

```bash
# Instalar firebase-admin
pip3 install --user firebase-admin --quiet

# Executar script
python3 <<'PYTHON'
import json
import firebase_admin
from firebase_admin import auth, credentials
from google.cloud import secretmanager

# Obter credenciais
client = secretmanager.SecretManagerServiceClient()
name = "projects/nprocess-prod/secrets/nprocess-firebase-admin-sdk/versions/latest"
response = client.access_secret_version(request={"name": name})
service_account = json.loads(response.payload.data.decode("UTF-8"))

# Inicializar Firebase
cred = credentials.Certificate(service_account)
firebase_admin.initialize_app(cred, {'projectId': 'nprocess-8e801'})

# Definir custom claims
UID = "hp9TADsRoHfJ4GgSIjQejmCDRCt2"
auth.set_custom_user_claims(UID, {'role': 'super_admin', 'admin': True})

# Verificar
user = auth.get_user(UID)
print(f"✅ Usuário {user.email} definido como super_admin")
print(f"   Custom Claims: {user.custom_claims}")
PYTHON
```

---

## ⚠️ Importante

Após definir os custom claims:

1. **O usuário precisa fazer logout** no Client Portal
2. **Fazer login novamente** para obter novo token
3. O role `super_admin` estará disponível no token JWT

---

## 🔗 Links Úteis

- **Firebase Console**: https://console.firebase.google.com/project/nprocess-8e801/authentication/users
- **Cloud Shell**: https://shell.cloud.google.com

---

**Última Atualização**: 27 de Dezembro de 2024

