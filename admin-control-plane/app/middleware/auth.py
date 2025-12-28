"""
Authentication Middleware
Firebase Auth-based authentication for unified credentials
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
import os
import logging

from app.services.firebase_service import verify_firebase_token, get_user_role, is_admin

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict:
    """
    Get current authenticated user from Firebase ID token.
    
    Uses unified Firebase Auth for all services.
    """

    # Development mode: Allow requests without auth (only if explicitly set)
    if os.getenv("ENV") == "development" and os.getenv("SKIP_AUTH") == "true":
        if not credentials:
            logger.warning("Running in development mode with SKIP_AUTH - authentication bypassed")
            return {
                "uid": "dev_user_001",
                "email": "dev@example.com",
                "name": "Development User",
                "role": "super_admin"
            }

    # Require credentials in production
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify Firebase ID token
    token = credentials.credentials
    decoded_token = verify_firebase_token(token)
    
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user role from token or Firestore
    role = get_user_role(decoded_token)
    
    # Return user info in consistent format
    return {
        "uid": decoded_token.get("uid"),
        "user_id": decoded_token.get("uid"),  # For compatibility
        "email": decoded_token.get("email"),
        "name": decoded_token.get("name") or decoded_token.get("display_name"),
        "role": role or "user",
        "email_verified": decoded_token.get("email_verified", False),
        "firebase_claims": decoded_token  # Include all claims for reference
    }


async def require_role(required_role: str):
    """
    Dependency to require specific role

    Usage:
        @router.post("/")
        async def create_user(current_user: dict = Depends(require_role("admin"))):
            ...
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")

        # Super admin can do everything
        if user_role == "super_admin":
            return current_user

        # Check if user has required role
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' required. Current role: {user_role}"
            )

        return current_user

    return role_checker


async def require_admin_user(
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """
    Dependency that requires admin or super_admin role.
    """
    user_role = current_user.get("role")
    
    if user_role not in ("admin", "super_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return current_user
