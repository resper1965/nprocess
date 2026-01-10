#!/usr/bin/env python3
"""
Script para definir Custom Claims no primeiro super_admin.

Uso:
    1. Configure GOOGLE_APPLICATION_CREDENTIALS para seu service account
    2. Execute: uv run python scripts/set_super_admin.py EMAIL_DO_USUARIO

Exemplo:
    uv run python scripts/set_super_admin.py resper@ness.com.br
"""

import sys
import firebase_admin
from firebase_admin import auth, credentials


def set_super_admin_claims(email: str) -> None:
    """Define claims de super_admin para um usuário por email."""
    # Inicializa Firebase Admin
    try:
        firebase_admin.get_app()
    except ValueError:
        # Use default credentials (GOOGLE_APPLICATION_CREDENTIALS)
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)

    # Busca usuário por email
    try:
        user = auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        print(f"❌ Usuário não encontrado: {email}")
        print("   Certifique-se de que o usuário já fez login no app.")
        sys.exit(1)

    # Define Custom Claims
    claims = {
        "org_id": "system",
        "role": "super_admin",
        "status": "active",
    }

    auth.set_custom_user_claims(user.uid, claims)

    print(f"✅ Custom Claims definidas para: {email}")
    print(f"   UID: {user.uid}")
    print(f"   Claims: {claims}")
    print()
    print("⚠️  O usuário precisa fazer logout e login novamente")
    print("   para que as novas claims sejam aplicadas.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python set_super_admin.py EMAIL_DO_USUARIO")
        print("Exemplo: python set_super_admin.py admin@empresa.com")
        sys.exit(1)

    email = sys.argv[1]
    set_super_admin_claims(email)
