#!/usr/bin/env python3
"""
Script para definir usuário como super_admin
Uso: python scripts/set-super-admin.py
"""

import firebase_admin
from firebase_admin import auth, firestore
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Inicializar Firebase Admin
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

USER_UID = 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2'
ROLE = 'super_admin'

def set_super_admin():
    try:
        print(f'🔧 Definindo usuário {USER_UID} como {ROLE}...')

        # 1. Definir custom claim no Firebase Auth
        auth.set_custom_user_claims(USER_UID, {'role': ROLE})
        print('✅ Custom claim definido no Firebase Auth')

        # 2. Atualizar role no Firestore
        user_ref = db.collection('users').document(USER_UID)
        user_ref.set({
            'role': ROLE,
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        print('✅ Role atualizado no Firestore')

        # 3. Verificar usuário
        user = auth.get_user(USER_UID)
        print('\n📋 Informações do usuário:')
        print(f'   Email: {user.email}')
        print(f'   Display Name: {user.display_name or "N/A"}')
        print(f'   Custom Claims: {user.custom_claims}')
        
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            print(f'   Firestore Role: {user_data.get("role")}')

        print('\n✅ Usuário definido como super_admin com sucesso!')
        print('⚠️  O usuário precisa fazer logout e login novamente para obter o novo token.')
        
    except Exception as e:
        print(f'❌ Erro ao definir super_admin: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    set_super_admin()

