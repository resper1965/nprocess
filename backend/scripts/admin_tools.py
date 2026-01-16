#!/usr/bin/env python3
"""
n.process Admin CLI
Manage Tenants, API Keys, and Users directly in Firestore.

Usage:
    uv run python scripts/admin_tools.py [command] [args]

Commands:
    list-tenants
    create-tenant --name "My Corp" --plan "enterprise"
    create-key --tenant-id "TENANT_ID"
    list-users
"""

import argparse
import secrets
import hashlib
import sys
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Initialize Firestore
def get_db():
    if not firebase_admin._apps:
        # Assumes GOOGLE_APPLICATION_CREDENTIALS or gcloud auth is set
        firebase_admin.initialize_app(options={"projectId": "nprocess-85f63"})
    return firestore.client()

def list_tenants(args):
    db = get_db()
    docs = db.collection("tenants").stream()
    print(f"\n{'ID':<25} | {'Name':<20} | {'Plan':<10}")
    print("-" * 60)
    count = 0
    for doc in docs:
        d = doc.to_dict()
        print(f"{doc.id:<25} | {d.get('name', 'N/A'):<20} | {d.get('plan', 'starter'):<10}")
        count += 1
    print(f"\nTotal: {count} tenants")

def create_tenant(args):
    db = get_db()
    
    # Check if exists
    # (Simplified: just create)
    
    doc_ref = db.collection("tenants").document()
    tenant_data = {
        "name": args.name,
        "plan": args.plan,
        "created_at": datetime.utcnow(),
        "settings": {
            "allowed_models": ["gemini-1.5-pro", "gemini-1.5-flash"]
        }
    }
    doc_ref.set(tenant_data)
    print(f"\n✅ Tenant created successfully!")
    print(f"ID: {doc_ref.id}")
    print(f"Name: {args.name}")
    print(f"Plan: {args.plan}")

def create_key(args):
    db = get_db()
    
    # Validate tenant
    tenant_ref = db.collection("tenants").document(args.tenant_id)
    if not tenant_ref.get().exists:
        print(f"❌ Tenant {args.tenant_id} not found.")
        return

    # Generate Key
    raw_key = f"np_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    # Store
    key_data = {
        "key_hash": key_hash,
        "tenant_id": args.tenant_id,
        "budget_limit": args.budget,
        "usage_current_month": 0.0,
        "created_at": datetime.utcnow(),
        "status": "active",
        "created_by": "admin_cli"
    }
    
    # Use key_hash as ID or random? 
    # Store by ID, query by hash usually.
    db.collection("api_keys").add(key_data)
    
    print(f"\n✅ API Key created!")
    print(f"Tenant: {args.tenant_id}")
    print(f"Key: {raw_key}")
    print(f"⚠️  SAVE THIS KEY! It cannot be retrieved again.")

def list_users(args):
    db = get_db()
    # Also tries to list from Firebase Auth if possible, but let's stick to Firestore users collection
    # OR iterate auth users
    
    print(f"\nFetching users from Firebase Auth...")
    page = auth.list_users()
    print(f"{'UID':<30} | {'Email':<25} | {'Name':<20} | {'Claims'}")
    print("-" * 100)
    for user in page.users:
        claims = user.custom_claims or {}
        print(f"{user.uid:<30} | {user.email:<25} | {user.display_name or 'N/A':<20} | {claims}")

def main():
    parser = argparse.ArgumentParser(description="n.process Admin CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # list-tenants
    subparsers.add_parser("list-tenants", help="List all organizations")
    
    # create-tenant
    ct_parser = subparsers.add_parser("create-tenant", help="Create a new organization")
    ct_parser.add_argument("--name", required=True, help="Organization name")
    ct_parser.add_argument("--plan", default="starter", choices=["starter", "enterprise"], help="Subscription plan")
    
    # create-key
    ck_parser = subparsers.add_parser("create-key", help="Create API Key for a tenant")
    ck_parser.add_argument("--tenant-id", required=True, help="Tenant ID")
    ck_parser.add_argument("--budget", type=float, default=100.0, help="Monthly budget limit")
    
    # list-users
    subparsers.add_parser("list-users", help="List all users and their claims")
    
    args = parser.parse_args()
    
    try:
        if args.command == "list-tenants":
            list_tenants(args)
        elif args.command == "create-tenant":
            create_tenant(args)
        elif args.command == "create-key":
            create_key(args)
        elif args.command == "list-users":
            list_users(args)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        # print usage hint
        if "Default Credentials" in str(e):
            print("\n💡 Hint: Run 'gcloud auth application-default login' first.")

if __name__ == "__main__":
    main()
