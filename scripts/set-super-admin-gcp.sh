#!/bin/bash
# Script para definir super_admin via Cloud Shell ou localmente
# Funciona no GCP Cloud Shell que já tem gcloud configurado

echo "🔧 Definindo usuário V1CfZSmqLyYQtp2C3yqBgcSUq9h2 como super_admin..."

# Método 1: Via gcloud (se estiver no Cloud Shell)
if command -v gcloud &> /dev/null; then
    echo "📝 Usando gcloud para definir custom claim..."
    
    # Criar um script Python temporário
    cat > /tmp/set_super_admin.py << 'EOF'
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

    # Executar no Cloud Shell
    python3 /tmp/set_super_admin.py
    rm /tmp/set_super_admin.py
    
else
    echo "❌ gcloud não encontrado. Use uma das opções abaixo:"
    echo ""
    echo "Opção 1: Firebase Console"
    echo "  1. Acesse: https://console.firebase.google.com/project/nprocess-33a44/authentication/users"
    echo "  2. Clique no usuário"
    echo "  3. Procure por 'Custom Claims' ou 'Add custom attribute'"
    echo ""
    echo "Opção 2: Cloud Shell do GCP"
    echo "  1. Acesse: https://console.cloud.google.com/cloudshell"
    echo "  2. Execute este script novamente"
    echo ""
    echo "Opção 3: Via API (se já tiver um admin)"
    echo "  curl -X POST https://nprocess-admin-api-dev-5wqihg7s7a-uc.a.run.app/v1/admin/utils/set-super-admin/V1CfZSmqLyYQtp2C3yqBgcSUq9h2 \\"
    echo "    -H 'Authorization: Bearer <token>'"
fi

