"""
Authentication middleware for API endpoints.
"""
import logging
import os
from typing import Optional, Dict, Any

from fastapi import HTTPException, Header, status, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> Optional[Dict[str, Any]]:
    """
    Extracts and validates the current user from token.
    Returns decoded token claims or None if unauthenticated.
    """
    token = None
    if credentials:
        token = credentials.credentials
    elif x_api_key:
        token = x_api_key
    
    if not token:
        return None
    
    # Check for Internal/Service-to-Service API Key
    internal_key = os.getenv("NPROCESS_API_KEY")
    if internal_key and token == internal_key:
        return {"uid": "service-account", "role": "admin", "is_service": True}

    # Check for Firebase ID Token (Bearer)
    if credentials:
        try:
            from app.services.firebase_service import verify_firebase_token
            decoded_token = verify_firebase_token(token)
            if decoded_token:
                return decoded_token
        except Exception as e:
            logger.warning(f"Firebase token verification failed: {e}")
    
    return None


async def validate_api_key(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> bool:
    """
    Validate Authentication (Firebase ID Token or Internal API Key).
    Returns True if authenticated, False otherwise.
    """
    user = await get_current_user(credentials, x_api_key)
    return user is not None


async def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> Dict[str, Any]:
    """
    Dependency that requires authentication.
    Raises 401 if not authenticated.
    """
    user = await get_current_user(credentials, x_api_key)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user


async def require_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> Dict[str, Any]:
    """
    Dependency that requires admin role.
    Raises 401 if not authenticated, 403 if not admin.
    """
    user = await get_current_user(credentials, x_api_key)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Check admin role
    role = user.get("role", "user")
    if role not in ("admin", "super_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return user
