#!/usr/bin/env python3
"""
Script para definir um usuário como super_admin no Firebase
Usa o Firebase Admin SDK do Secret Manager
"""
import os
import sys
import json
import subprocess
from pathlib import Path

# Adicionar o diretório admin-control-plane ao path (já tem firebase-admin)
admin_plane_path = str(Path(__file__).parent.parent / "admin-control-plane")
sys.path.insert(0, admin_plane_path)

try:
    import firebase_admin
    from firebase_admin import auth, credentials, firestore
except ImportError:
    print("❌ Firebase Admin SDK não instalado")
    print("   Tentando usar Admin Control Plane...")
    # Tentar usar o ambiente do admin-control-plane
    admin_plane_path = Path(__file__).parent.parent / "admin-control-plane"
    if (admin_plane_path / "venv").exists():
        python_path = admin_plane_path / "venv" / "bin" / "python3"
        if python_path.exists():
            print(f"   Usando: {python_path}")
            subprocess.run([str(python_path), __file__] + sys.argv[1:])
            sys.exit(0)
    print("   Execute: cd admin-control-plane && pip install firebase-admin")
    sys.exit(1)

def initialize_firebase():
    """Inicializa Firebase Admin SDK usando credenciais do Secret Manager"""
    try:
        # Tentar usar credenciais do Secret Manager (produção)
        import google.auth
        from google.cloud import secretmanager
        
        project_id = "nprocess-prod"
        secret_id = "nprocess-firebase-admin-sdk"
        
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        service_account_info = json.loads(response.payload.data.decode("UTF-8"))
        
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred, {
            'projectId': 'nprocess-8e801'  # Projeto Firebase
        })
        print("✅ Firebase Admin SDK inicializado (Secret Manager)")
        return True
    except Exception as e:
        print(f"⚠️  Erro ao inicializar do Secret Manager: {e}")
        print("   Tentando usar variável de ambiente...")
        
        # Fallback: tentar usar variável de ambiente
        if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK inicializado (variável de ambiente)")
            return True
        else:
            print("❌ Não foi possível inicializar Firebase Admin SDK")
            return False

def set_super_admin(uid: str):
    """Define um usuário como super_admin usando custom claims"""
    try:
        # Definir custom claim
        auth.set_custom_user_claims(uid, {
            'role': 'super_admin',
            'admin': True
        })
        
        print(f"✅ Custom claims definidos para usuário: {uid}")
        print(f"   Role: super_admin")
        print(f"   Admin: True")
        
        # Atualizar Firestore como backup
        db = firestore.client()
        db.collection('users').document(uid).set({
            'role': 'super_admin',
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        print(f"✅ Role atualizado no Firestore")
        
        # Verificar se foi aplicado
        user = auth.get_user(uid)
        print(f"\n📋 Informações do usuário:")
        print(f"   Email: {user.email or 'N/A'}")
        print(f"   Display Name: {user.display_name or 'N/A'}")
        if user.custom_claims:
            print(f"   Custom Claims: {json.dumps(user.custom_claims, indent=2)}")
        else:
            print("⚠️  Custom claims não encontrados (pode levar alguns minutos para propagar)")
        
        return True
    except auth.UserNotFoundError:
        print(f"❌ Usuário não encontrado: {uid}")
        return False
    except Exception as e:
        print(f"❌ Erro ao definir custom claims: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    uid = "hp9TADsRoHfJ4GgSIjQejmCDRCt2"
    
    print("🔐 Definindo usuário como super_admin...")
    print(f"   UID: {uid}")
    print("")
    
    if not initialize_firebase():
        sys.exit(1)
    
    if set_super_admin(uid):
        print("\n✅ Usuário definido como super_admin com sucesso!")
        print("\n📝 Nota: O usuário precisa fazer logout e login novamente")
        print("   para que os custom claims sejam aplicados ao token.")
    else:
        print("\n❌ Falha ao definir usuário como super_admin")
        sys.exit(1)

if __name__ == "__main__":
    main()

