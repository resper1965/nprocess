#!/usr/bin/env python3
"""
Seed script to create initial admin users
"""
import os
import sys
import bcrypt
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.db import SessionLocal
from app.services.user_service import UserService

# Default users to create
DEFAULT_USERS = [
    {
        "email": "admin@company.com",
        "name": "Admin User",
        "password": "admin123",
        "role": "super_admin"
    },
    {
        "email": "john.doe@company.com",
        "name": "John Doe",
        "password": "admin123",
        "role": "admin"
    }
]


def seed_users():
    """Seed initial users"""
    db = SessionLocal()
    user_service = UserService(db)
    
    print("🌱 Seeding users...")
    
    for user_data in DEFAULT_USERS:
        try:
            # Check if user exists
            existing = user_service.get_user_by_email(user_data["email"])
            if existing:
                print(f"⚠️  User {user_data['email']} already exists, skipping...")
                continue
            
            # Create user
            user = user_service.create_user(
                email=user_data["email"],
                name=user_data["name"],
                password=user_data["password"],
                role=user_data["role"]
            )
            
            print(f"✅ Created user: {user['email']} ({user['role']})")
        except Exception as e:
            print(f"❌ Error creating user {user_data['email']}: {e}")
    
    db.close()
    print("✅ Seeding complete!")


if __name__ == "__main__":
    seed_users()

