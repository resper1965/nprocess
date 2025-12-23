"""
Authentication middleware for API endpoints.
"""
import logging
from typing import Optional

from fastapi import HTTPException, Header, status, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.services.apikey_service import get_apikey_service
from app.schemas_apikeys import APIKeyValidationResult


logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)
admin_security = HTTPBearer()


async def validate_api_key(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> Optional[APIKeyValidationResult]:
    """
    Validate API key from request.
    
    Args:
        credentials: Bearer token from Authorization header
        x_api_key: API key from X-API-Key header (legacy)
        
    Returns:
        APIKeyValidationResult if valid, None if not provided
        
    Raises:
        HTTPException: If API key is invalid
    """
    # Extract API key
    api_key = None
    
    if credentials:
        api_key = credentials.credentials
    elif x_api_key:
        api_key = x_api_key
    
    if not api_key:
        return None  # API key is optional for some endpoints
    
    # Validate API key
    apikey_service = get_apikey_service()
    result = await apikey_service.validate_api_key(api_key)
    
    if not result.valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.error or "Invalid API key"
        )
    
    return result


async def require_api_key(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> APIKeyValidationResult:
    """
    Require API key (raises error if not provided).
    
    Args:
        credentials: Bearer token from Authorization header
        x_api_key: API key from X-API-Key header (legacy)
        
    Returns:
        APIKeyValidationResult
        
    Raises:
        HTTPException: If API key is missing or invalid
    """
    result = await validate_api_key(credentials, x_api_key)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    return result

