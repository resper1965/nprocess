"""
User service for managing users in PostgreSQL
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import bcrypt
import uuid
import logging

logger = logging.getLogger(__name__)


class UserService:
    """Service for user management"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    def create_user(
        self,
        email: str,
        name: str,
        password: str,
        role: str = "user",
        tenant_id: Optional[str] = None
    ) -> dict:
        """Create a new user"""
        # Check if user exists
        existing = self.get_user_by_email(email)
        if existing:
            raise ValueError(f"User with email {email} already exists")
        
        # Hash password
        password_hash = self.hash_password(password)
        
        # Generate user_id
        user_id = str(uuid.uuid4())
        
        # Get default tenant if not provided
        if not tenant_id:
            tenant_result = self.db.execute(
                text("SELECT tenant_id FROM tenants WHERE slug = 'demo' LIMIT 1")
            )
            tenant_row = tenant_result.fetchone()
            if tenant_row:
                tenant_id = str(tenant_row[0])
            else:
                raise ValueError("No default tenant found")
        
        # Insert user
        self.db.execute(
            text("""
                INSERT INTO users (user_id, tenant_id, email, name, password_hash, role, is_active, created_at, updated_at)
                VALUES (:user_id, :tenant_id::uuid, :email, :name, :password_hash, :role, TRUE, NOW(), NOW())
            """),
            {
                "user_id": user_id,
                "tenant_id": tenant_id,
                "email": email,
                "name": name,
                "password_hash": password_hash,
                "role": role
            }
        )
        self.db.commit()
        
        return self.get_user_by_id(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        result = self.db.execute(
            text("""
                SELECT user_id, tenant_id, email, name, password_hash, role, is_active, 
                       last_login, created_at, updated_at
                FROM users
                WHERE email = :email
            """),
            {"email": email}
        )
        row = result.fetchone()
        
        if not row:
            return None
        
        return {
            "user_id": str(row[0]),
            "tenant_id": str(row[1]) if row[1] else None,
            "email": row[2],
            "name": row[3],
            "password_hash": row[4],
            "role": row[5],
            "is_active": row[6],
            "last_login": row[7],
            "created_at": row[8],
            "updated_at": row[9]
        }
    
    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        result = self.db.execute(
            text("""
                SELECT user_id, tenant_id, email, name, password_hash, role, is_active,
                       last_login, created_at, updated_at
                FROM users
                WHERE user_id = :user_id::uuid
            """),
            {"user_id": user_id}
        )
        row = result.fetchone()
        
        if not row:
            return None
        
        return {
            "user_id": str(row[0]),
            "tenant_id": str(row[1]) if row[1] else None,
            "email": row[2],
            "name": row[3],
            "password_hash": row[4],
            "role": row[5],
            "is_active": row[6],
            "last_login": row[7],
            "created_at": row[8],
            "updated_at": row[9]
        }
    
    def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate user with email and password"""
        user = self.get_user_by_email(email)
        
        if not user:
            return None
        
        if not user["is_active"]:
            return None
        
        if not self.verify_password(password, user["password_hash"]):
            return None
        
        # Update last_login
        self.db.execute(
            text("""
                UPDATE users
                SET last_login = NOW(), updated_at = NOW()
                WHERE user_id = :user_id::uuid
            """),
            {"user_id": user["user_id"]}
        )
        self.db.commit()
        
        # Remove password_hash from response
        user.pop("password_hash", None)
        return user
    
    def list_users(self, tenant_id: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[dict]:
        """List users"""
        query = """
            SELECT user_id, tenant_id, email, name, role, is_active,
                   last_login, created_at, updated_at
            FROM users
        """
        params = {}
        
        if tenant_id:
            query += " WHERE tenant_id = :tenant_id::uuid"
            params["tenant_id"] = tenant_id
        
        query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = offset
        
        result = self.db.execute(text(query), params)
        rows = result.fetchall()
        
        return [
            {
                "user_id": str(row[0]),
                "tenant_id": str(row[1]) if row[1] else None,
                "email": row[2],
                "name": row[3],
                "role": row[4],
                "is_active": row[5],
                "last_login": row[6],
                "created_at": row[7],
                "updated_at": row[8]
            }
            for row in rows
        ]
    
    def update_user(
        self,
        user_id: str,
        name: Optional[str] = None,
        role: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Optional[dict]:
        """Update user"""
        updates = []
        params = {"user_id": user_id}
        
        if name is not None:
            updates.append("name = :name")
            params["name"] = name
        
        if role is not None:
            updates.append("role = :role")
            params["role"] = role
        
        if is_active is not None:
            updates.append("is_active = :is_active")
            params["is_active"] = is_active
        
        if not updates:
            return self.get_user_by_id(user_id)
        
        updates.append("updated_at = NOW()")
        
        self.db.execute(
            text(f"""
                UPDATE users
                SET {', '.join(updates)}
                WHERE user_id = :user_id::uuid
            """),
            params
        )
        self.db.commit()
        
        return self.get_user_by_id(user_id)
    
    def update_password(self, user_id: str, new_password: str) -> bool:
        """Update user password"""
        password_hash = self.hash_password(new_password)
        
        self.db.execute(
            text("""
                UPDATE users
                SET password_hash = :password_hash, updated_at = NOW()
                WHERE user_id = :user_id::uuid
            """),
            {
                "user_id": user_id,
                "password_hash": password_hash
            }
        )
        self.db.commit()
        
        return True
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user (soft delete by setting is_active = false)"""
        self.db.execute(
            text("""
                UPDATE users
                SET is_active = FALSE, updated_at = NOW()
                WHERE user_id = :user_id::uuid
            """),
            {"user_id": user_id}
        )
        self.db.commit()
        
        return True

