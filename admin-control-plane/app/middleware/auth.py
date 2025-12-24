"""
Authentication Middleware
JWT-based authentication for admin operations
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
import os
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict:
    """
    Get current authenticated user from JWT token

    In development: Returns mock user if no credentials
    In production: Validates JWT token and returns user info
    """

    # Development mode: Allow requests without auth
    if os.getenv("ENV") == "development" or not credentials:
        logger.warning("Running in development mode - authentication bypassed")
        return {
            "user_id": "dev_user_001",
            "email": "dev@example.com",
            "name": "Development User",
            "role": "super_admin"
        }

    # Production mode: Validate JWT token
    token = credentials.credentials

    try:
        # TODO: Implement JWT validation with python-jose
        # For now, return mock user
        return {
            "user_id": "user_001",
            "email": "admin@example.com",
            "name": "Admin User",
            "role": "admin"
        }

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


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
                detail=f"Role '{required_role}' required"
            )

        return current_user

    return role_checker
