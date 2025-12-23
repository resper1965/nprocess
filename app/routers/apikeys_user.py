"""
User self-service API Key management endpoints.
Allows users to manage their own API keys without admin authentication.
"""
import logging
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Header, status, Depends
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.schemas_apikeys import (
    APIKeyCreate,
    APIKeyInfo,
    APIKeyListResponse,
    APIKeyResponse,
    APIKeyRevokeRequest,
)
from app.services.apikey_service import get_apikey_service
from app.middleware.auth import validate_api_key, APIKeyValidationResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/my/api-keys", tags=["My API Keys"])
security = HTTPBearer(auto_error=False)


# ============================================================================
# User Self-Service Endpoints
# ============================================================================

@router.post(
    "/",
    response_model=APIKeyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new API key (self-service)",
    description="""
    Create a new API key for your own use.
    
    **⚠️  IMPORTANT:**
    - The API key is shown ONLY ONCE in the response
    - Store it securely immediately
    - You cannot retrieve it later
    
    **Authentication:**
    - Requires a valid API key (for rate limiting and identification)
    - Or can be called without auth for first-time users
    """
)
async def create_my_api_key(
    request: APIKeyCreate,
    api_key: Optional[APIKeyValidationResult] = Depends(validate_api_key)
):
    """
    Create a new API key for the current user.
    
    Args:
        request: API key creation request
        api_key: Optional validated API key (for existing users)
    
    Returns:
        APIKeyResponse with the generated API key
    """
    try:
        # If no API key provided, allow creation for first-time users
        # Use a default consumer_app_id if not provided
        if not request.consumer_app_id:
            # Generate a simple consumer ID based on name
            request.consumer_app_id = f"user_{request.name.lower().replace(' ', '_')}"
        
        apikey_service = get_apikey_service()
        
        # Determine environment
        environment = "test" if "test" in request.name.lower() else "live"
        
        result = await apikey_service.create_api_key(
            request=request,
            environment=environment
        )
        
        logger.info(f"User created API key: {result.key_id}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key"
        )


@router.get(
    "/",
    response_model=APIKeyListResponse,
    summary="List my API keys",
    description="List all API keys created by the current user"
)
async def list_my_api_keys(
    status_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    api_key: Optional[APIKeyValidationResult] = Depends(validate_api_key)
):
    """
    List API keys for the current user.
    
    Args:
        status_filter: Filter by status (active, revoked, expired)
        page: Page number
        page_size: Number of results per page
        api_key: Optional validated API key
    
    Returns:
        APIKeyListResponse with list of keys
    """
    try:
        apikey_service = get_apikey_service()
        
        # For now, list all keys (in future, filter by user_id)
        # TODO: Implement user-based filtering when user authentication is added
        api_keys = await apikey_service.list_api_keys(
            consumer_app_id=None,
            status=status_filter,
            limit=page_size
        )
        
        return APIKeyListResponse(
            api_keys=api_keys,
            total=len(api_keys),
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"Error listing API keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list API keys"
        )


@router.get(
    "/{key_id}",
    response_model=APIKeyInfo,
    summary="Get my API key details",
    description="Get details of a specific API key (without the actual key)"
)
async def get_my_api_key(
    key_id: str,
    api_key: Optional[APIKeyValidationResult] = Depends(validate_api_key)
):
    """
    Get API key details.
    
    Args:
        key_id: API key ID
        api_key: Optional validated API key
    
    Returns:
        APIKeyInfo with key details
    """
    try:
        apikey_service = get_apikey_service()
        
        api_keys = await apikey_service.list_api_keys(limit=1000)
        
        # Find specific key
        key_info = next((k for k in api_keys if k.key_id == key_id), None)
        
        if not key_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"API key not found: {key_id}"
            )
        
        return key_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get API key"
        )


@router.post(
    "/{key_id}/revoke",
    status_code=status.HTTP_200_OK,
    summary="Revoke my API key",
    description="Revoke an API key (cannot be undone)"
)
async def revoke_my_api_key(
    key_id: str,
    request: APIKeyRevokeRequest,
    api_key: Optional[APIKeyValidationResult] = Depends(validate_api_key)
):
    """
    Revoke an API key.
    
    Args:
        key_id: API key ID to revoke
        request: Revocation request with reason
        api_key: Optional validated API key
    
    Returns:
        Success message
    """
    try:
        logger.info(f"User revoking API key: {key_id}")
        
        apikey_service = get_apikey_service()
        
        success = await apikey_service.revoke_api_key(
            key_id=key_id,
            reason=request.reason or "Revoked by user"
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"API key not found: {key_id}"
            )
        
        return {
            "message": "API key revoked successfully",
            "key_id": key_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke API key"
        )


@router.get(
    "/{key_id}/usage",
    summary="Get API key usage statistics",
    description="Get usage statistics for a specific API key"
)
async def get_my_api_key_usage(
    key_id: str,
    api_key: Optional[APIKeyValidationResult] = Depends(validate_api_key)
):
    """
    Get usage statistics for an API key.
    
    Args:
        key_id: API key ID
        api_key: Optional validated API key
    
    Returns:
        Usage statistics
    """
    try:
        apikey_service = get_apikey_service()
        
        api_keys = await apikey_service.list_api_keys(limit=1000)
        
        # Find specific key
        key_info = next((k for k in api_keys if k.key_id == key_id), None)
        
        if not key_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"API key not found: {key_id}"
            )
        
        # Return usage info if available
        usage = key_info.usage or {
            "requests_today": 0,
            "requests_this_month": 0,
            "total_requests": 0,
            "last_request_at": None
        }
        
        return {
            "key_id": key_id,
            "usage": usage,
            "quotas": key_info.quotas,
            "status": key_info.status,
            "expires_at": key_info.expires_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting API key usage: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get API key usage"
        )

