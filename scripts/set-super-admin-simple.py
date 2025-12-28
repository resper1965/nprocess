#!/usr/bin/env python3
"""
Script simples para definir super_admin usando Firebase Admin SDK
Funciona no Admin Control Plane que já tem firebase-admin instalado
"""

import sys
import os

# Adicionar o diretório do admin-control-plane ao path
admin_plane_path = os.path.join(os.path.dirname(__file__), '..', 'admin-control-plane')
sys.path.insert(0, admin_plane_path)

try:
    import firebase_admin
    from firebase_admin import auth, firestore
    
    # Inicializar Firebase Admin
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    
    USER_UID = 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2'
    
    print(f'🔧 Definindo usuário {USER_UID} como super_admin...')
    
    # Set custom claim - padrão Firebase Admin SDK
    auth.set_custom_user_claims(USER_UID, {'role': 'super_admin'})
    print('✅ Custom claim definido no Firebase Auth')
    
    # Atualizar Firestore
    db = firestore.client()
    db.collection('users').document(USER_UID).set({
        'role': 'super_admin',
        'updated_at': firestore.SERVER_TIMESTAMP
    }, merge=True)
    print('✅ Role atualizado no Firestore')
    
    # Verificar
    user = auth.get_user(USER_UID)
    print(f'\n📋 Usuário: {user.email}')
    print(f'   Custom Claims: {user.custom_claims}')
    
    print('\n✅ Super admin definido com sucesso!')
    print('⚠️  O usuário precisa fazer logout e login novamente para obter o novo token.')
    
except ImportError as e:
    print('❌ Erro: firebase-admin não está instalado')
    print('   Execute: cd admin-control-plane && pip install firebase-admin')
    sys.exit(1)
except Exception as e:
    print(f'❌ Erro: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)

