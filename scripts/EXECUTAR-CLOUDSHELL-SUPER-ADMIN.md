# 🚀 Executar no Cloud Shell: Definir Super Admin

**UID**: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`

---

## 📋 Instruções

### 1. Abrir Cloud Shell

Acesse: https://shell.cloud.google.com

### 2. Executar o Script

```bash
# Copiar e colar no Cloud Shell:
cd ~
cat > set_super_admin.sh <<'EOF'
#!/bin/bash
set -e

UID="hp9TADsRoHfJ4GgSIjQejmCDRCt2"
PROJECT_ID="nprocess-prod"
FIREBASE_PROJECT="nprocess-8e801"

echo "🔐 Definindo usuário como super_admin..."
echo "   UID: $UID"

# Instalar firebase-admin se necessário
python3 -c "import firebase_admin" 2>/dev/null || pip3 install --user firebase-admin --quiet

# Criar script Python
python3 <<PYTHON
import json
import firebase_admin
from firebase_admin import auth, credentials, firestore
from google.cloud import secretmanager

PROJECT_ID = "nprocess-prod"
FIREBASE_PROJECT = "nprocess-8e801"
SECRET_ID = "nprocess-firebase-admin-sdk"
UID = "hp9TADsRoHfJ4GgSIjQejmCDRCt2"

# Inicializar Firebase
client = secretmanager.SecretManagerServiceClient()
name = f"projects/{PROJECT_ID}/secrets/{SECRET_ID}/versions/latest"
response = client.access_secret_version(request={"name": name})
service_account_info = json.loads(response.payload.data.decode("UTF-8"))

cred = credentials.Certificate(service_account_info)
firebase_admin.initialize_app(cred, {'projectId': FIREBASE_PROJECT})
print("✅ Firebase inicializado")

# Definir custom claims
auth.set_custom_user_claims(UID, {'role': 'super_admin', 'admin': True})
print(f"✅ Custom claims definidos para {UID}")

# Atualizar Firestore
db = firestore.client()
db.collection('users').document(UID).set({
    'role': 'super_admin',
    'updated_at': firestore.SERVER_TIMESTAMP
}, merge=True)
print("✅ Firestore atualizado")

# Verificar
user = auth.get_user(UID)
print(f"\n📋 Email: {user.email}")
print(f"   Custom Claims: {user.custom_claims}")
print("\n✅ Sucesso! Usuário precisa fazer logout/login.")
PYTHON
EOF

chmod +x set_super_admin.sh
bash set_super_admin.sh
```

---

## ✅ Resultado Esperado

```
✅ Firebase inicializado
✅ Custom claims definidos para hp9TADsRoHfJ4GgSIjQejmCDRCt2
✅ Firestore atualizado

📋 Email: [email do usuário]
   Custom Claims: {'role': 'super_admin', 'admin': True}

✅ Sucesso! Usuário precisa fazer logout/login.
```

---

## ⚠️ Importante

Após executar, o usuário `hp9TADsRoHfJ4GgSIjQejmCDRCt2` precisa:
1. **Fazer logout** no Client Portal
2. **Fazer login novamente** para obter novo token com custom claims
3. O role `super_admin` estará disponível no token JWT

---

**Última Atualização**: 27 de Dezembro de 2024

