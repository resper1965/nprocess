#!/bin/bash

# Script para definir usuário como super_admin usando Cloud Shell
# O Cloud Shell já tem gcloud e Python configurados
# Usage: Execute no Google Cloud Shell

set -e

UID="hp9TADsRoHfJ4GgSIjQejmCDRCt2"
PROJECT_ID="nprocess-prod"
FIREBASE_PROJECT="nprocess-8e801"

echo "🔐 Definindo usuário como super_admin..."
echo "   UID: $UID"
echo "   Firebase Project: $FIREBASE_PROJECT"
echo ""

# Instalar firebase-admin se necessário
echo "📦 Verificando firebase-admin..."
python3 -c "import firebase_admin" 2>/dev/null || {
    echo "   Instalando firebase-admin..."
    pip3 install --user firebase-admin --quiet
}

# Criar script Python temporário
cat > /tmp/set_super_admin.py <<'PYTHON_SCRIPT'
import sys
import json
import firebase_admin
from firebase_admin import auth, credentials, firestore
from google.cloud import secretmanager

PROJECT_ID = "nprocess-prod"
FIREBASE_PROJECT = "nprocess-8e801"
SECRET_ID = "nprocess-firebase-admin-sdk"
UID = "hp9TADsRoHfJ4GgSIjQejmCDRCt2"

def main():
    # Inicializar Firebase Admin SDK
    try:
        # Tentar usar Secret Manager
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{PROJECT_ID}/secrets/{SECRET_ID}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        service_account_info = json.loads(response.payload.data.decode("UTF-8"))
        
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred, {'projectId': FIREBASE_PROJECT})
        print("✅ Firebase Admin SDK inicializado")
    except Exception as e:
        print(f"❌ Erro ao inicializar Firebase: {e}")
        sys.exit(1)
    
    try:
        # Definir custom claim
        auth.set_custom_user_claims(UID, {
            'role': 'super_admin',
            'admin': True
        })
        print(f"✅ Custom claims definidos para usuário: {UID}")
        
        # Atualizar Firestore
        db = firestore.client()
        db.collection('users').document(UID).set({
            'role': 'super_admin',
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        print(f"✅ Role atualizado no Firestore")
        
        # Verificar
        user = auth.get_user(UID)
        print(f"\n📋 Informações do usuário:")
        print(f"   Email: {user.email or 'N/A'}")
        print(f"   Display Name: {user.display_name or 'N/A'}")
        if user.custom_claims:
            print(f"   Custom Claims: {json.dumps(user.custom_claims, indent=2)}")
        
        print("\n✅ Usuário definido como super_admin com sucesso!")
        print("⚠️  O usuário precisa fazer logout e login novamente para obter o novo token.")
        
    except auth.UserNotFoundError:
        print(f"❌ Usuário não encontrado: {UID}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
PYTHON_SCRIPT

# Executar script
echo "🚀 Executando script..."
python3 /tmp/set_super_admin.py

# Limpar
rm -f /tmp/set_super_admin.py
