#!/usr/bin/env python3
"""
Script para diagnosticar problemas de autenticação do superadmin
Uso: python scripts/diagnose-auth.py
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

# Email do superadmin
SUPERADMIN_EMAIL = 'resper@ness.com.br'

def diagnose_auth():
    print('🔍 Diagnosticando autenticação do superadmin...\n')

    try:
        # 1. Buscar usuário por email
        print(f'1️⃣ Buscando usuário com email: {SUPERADMIN_EMAIL}')
        try:
            user = auth.get_user_by_email(SUPERADMIN_EMAIL)
            print(f'   ✅ Usuário encontrado!')
            print(f'   📋 UID: {user.uid}')
            print(f'   📋 Email: {user.email}')
            print(f'   📋 Email Verificado: {user.email_verified}')
            print(f'   📋 Display Name: {user.display_name or "N/A"}')
            print(f'   📋 Desabilitado: {user.disabled}')
            print()

            # 2. Verificar custom claims
            print('2️⃣ Verificando custom claims no Firebase Auth:')
            if user.custom_claims:
                print(f'   ✅ Custom claims encontrados: {user.custom_claims}')
                if 'role' in user.custom_claims:
                    role = user.custom_claims['role']
                    print(f'   ✅ Role definido: {role}')
                    if role in ['admin', 'super_admin']:
                        print(f'   ✅ Usuário é admin/super_admin')
                    else:
                        print(f'   ⚠️ Role não é admin: {role}')
                else:
                    print(f'   ❌ PROBLEMA: Custom claim "role" não encontrado!')
                    print(f'   💡 Execute: python scripts/set-super-admin.py')
            else:
                print(f'   ❌ PROBLEMA: Nenhum custom claim configurado!')
                print(f'   💡 Execute: python scripts/set-super-admin.py')
            print()

            # 3. Verificar documento no Firestore
            print('3️⃣ Verificando documento no Firestore:')
            user_ref = db.collection('users').document(user.uid)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                print(f'   ✅ Documento encontrado em /users/{user.uid}')
                print(f'   📋 Dados do documento:')
                for key, value in user_data.items():
                    if key != 'updated_at' and key != 'created_at':
                        print(f'      - {key}: {value}')

                if 'role' in user_data:
                    firestore_role = user_data['role']
                    print(f'   ✅ Role no Firestore: {firestore_role}')
                    if firestore_role in ['admin', 'super_admin']:
                        print(f'   ✅ Role é admin/super_admin')
                    else:
                        print(f'   ⚠️ Role não é admin: {firestore_role}')
                else:
                    print(f'   ❌ PROBLEMA: Campo "role" não existe no documento!')
                    print(f'   💡 Execute: python scripts/set-super-admin.py')
            else:
                print(f'   ❌ PROBLEMA: Documento não existe no Firestore!')
                print(f'   💡 Execute: python scripts/set-super-admin.py')
            print()

            # 4. Comparar custom claims vs Firestore
            print('4️⃣ Comparando custom claims vs Firestore:')
            auth_role = user.custom_claims.get('role') if user.custom_claims else None
            firestore_role = user_data.get('role') if user_doc.exists else None

            if auth_role and firestore_role:
                if auth_role == firestore_role:
                    print(f'   ✅ Roles sincronizados: {auth_role}')
                else:
                    print(f'   ⚠️ Roles diferentes!')
                    print(f'      - Auth: {auth_role}')
                    print(f'      - Firestore: {firestore_role}')
                    print(f'   💡 Execute: python scripts/set-super-admin.py')
            else:
                print(f'   ❌ PROBLEMA: Roles não estão sincronizados!')
                print(f'      - Auth custom claim: {auth_role or "NÃO DEFINIDO"}')
                print(f'      - Firestore role: {firestore_role or "NÃO DEFINIDO"}')
                print(f'   💡 Execute: python scripts/set-super-admin.py')
            print()

            # 5. Diagnóstico final
            print('='*60)
            print('📊 DIAGNÓSTICO FINAL:')
            print('='*60)

            problems = []

            if not user.custom_claims or 'role' not in user.custom_claims:
                problems.append('❌ Custom claim "role" não configurado no Firebase Auth')
            elif user.custom_claims.get('role') not in ['admin', 'super_admin']:
                problems.append(f'⚠️ Custom claim role é "{user.custom_claims.get("role")}", deveria ser "super_admin"')

            if not user_doc.exists:
                problems.append('❌ Documento do usuário não existe no Firestore')
            elif 'role' not in user_data:
                problems.append('❌ Campo "role" não existe no documento do Firestore')
            elif user_data.get('role') not in ['admin', 'super_admin']:
                problems.append(f'⚠️ Role no Firestore é "{user_data.get("role")}", deveria ser "super_admin"')

            if auth_role != firestore_role:
                problems.append('⚠️ Roles dessincronizados entre Auth e Firestore')

            if problems:
                print('\n🚨 PROBLEMAS ENCONTRADOS:')
                for i, problem in enumerate(problems, 1):
                    print(f'{i}. {problem}')
                print('\n💡 SOLUÇÃO:')
                print('Execute o comando:')
                print('   python scripts/set-super-admin.py')
                print('\nDepois, o usuário deve:')
                print('   1. Fazer logout da aplicação')
                print('   2. Fazer login novamente')
                print('   3. O novo token com as permissões corretas será gerado')
            else:
                print('✅ Tudo configurado corretamente!')
                print('\nSe o problema persiste, pode ser:')
                print('   1. O usuário não fez logout/login após configurar o role')
                print('   2. Problema de cache no navegador')
                print('   3. Problema de race condition no código')
                print('\nVerfique os logs do navegador (Console) para mais detalhes.')

        except auth.UserNotFoundError:
            print(f'   ❌ Usuário não encontrado com email: {SUPERADMIN_EMAIL}')
            print(f'   💡 O usuário precisa fazer login pelo menos uma vez para ser criado.')
            return
        except Exception as e:
            print(f'   ❌ Erro ao buscar usuário: {e}')
            import traceback
            traceback.print_exc()
            return

    except Exception as e:
        print(f'❌ Erro durante diagnóstico: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    diagnose_auth()
