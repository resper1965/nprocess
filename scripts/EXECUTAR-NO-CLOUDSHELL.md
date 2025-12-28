# Executar no Cloud Shell - Comandos Diretos

## ✅ Opção 1: Script Inline (Copiar e Colar)

Cole este comando completo no Cloud Shell:

```bash
python3 << 'EOF'
import firebase_admin
from firebase_admin import auth, firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

uid = 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2'
auth.set_custom_user_claims(uid, {'role': 'super_admin'})

db = firestore.client()
db.collection('users').document(uid).set({
    'role': 'super_admin',
    'updated_at': firestore.SERVER_TIMESTAMP
}, merge=True)

user = auth.get_user(uid)
print(f'✅ Super admin definido!')
print(f'Email: {user.email}')
print(f'Custom Claims: {user.custom_claims}')
EOF
```

## ✅ Opção 2: Instalar e Executar

Se o firebase-admin não estiver instalado:

```bash
# 1. Instalar
pip3 install --user firebase-admin

# 2. Executar
python3 << 'EOF'
import firebase_admin
from firebase_admin import auth, firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

uid = 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2'
auth.set_custom_user_claims(uid, {'role': 'super_admin'})

db = firestore.client()
db.collection('users').document(uid).set({
    'role': 'super_admin',
    'updated_at': firestore.SERVER_TIMESTAMP
}, merge=True)

user = auth.get_user(uid)
print(f'✅ Super admin definido!')
print(f'Email: {user.email}')
print(f'Custom Claims: {user.custom_claims}')
EOF
```

## ✅ Opção 3: Baixar Script do Repositório

Se você tem acesso ao repositório:

```bash
# Clonar ou baixar o script
curl -o /tmp/set_super_admin.py https://raw.githubusercontent.com/SEU_REPO/nprocess/main/scripts/set-super-admin-simple.py

# Ou criar manualmente
cat > /tmp/set_super_admin.py << 'PYEOF'
import firebase_admin
from firebase_admin import auth, firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

uid = 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2'
auth.set_custom_user_claims(uid, {'role': 'super_admin'})

db = firestore.client()
db.collection('users').document(uid).set({
    'role': 'super_admin',
    'updated_at': firestore.SERVER_TIMESTAMP
}, merge=True)

user = auth.get_user(uid)
print(f'✅ Super admin definido!')
print(f'Email: {user.email}')
print(f'Custom Claims: {user.custom_claims}')
PYEOF

python3 /tmp/set_super_admin.py
```

## 🔍 Verificar se Funcionou

Após executar:

1. Faça logout e login no Client Portal
2. Acesse: https://nprocess-33a44.web.app/dashboard/settings
3. Deve mostrar "Super Admin" no badge

