"""
API Key management endpoints for ComplianceEngine.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Header, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, Security

from app.schemas_apikeys import (
    APIKeyCreate,
    APIKeyInfo,
    APIKeyListResponse,
    APIKeyResponse,
    APIKeyRevokeRequest,
)
from app.services.apikey_service import get_apikey_service


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/api-keys", tags=["API Keys"])
security = HTTPBearer()


# ============================================================================
# Authentication Dependency
# ============================================================================

async def verify_admin_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify admin authentication token.

    In production, this should verify JWT token from admin dashboard.
    For now, we'll use a simple bearer token check.

    Args:
        credentials: HTTP Authorization credentials

    Returns:
        User ID if valid

    Raises:
        HTTPException: If token is invalid
    """
    token = credentials.credentials

    # TODO: Implement proper JWT verification
    # For now, accept any token starting with "admin_"
    if not token.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

    return "admin_user"  # Return user ID


# ============================================================================
# API Key Endpoints
# ============================================================================

@router.post(
    "/",
    response_model=APIKeyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new API key",
    description="""
    Create a new API key for a consumer application.

    **⚠️  IMPORTANT:**
    - The API key is shown ONLY ONCE in the response
    - Store it securely immediately
    - You cannot retrieve it later

    **Authentication:**
    - Requires admin authentication token
    """
)
async def create_api_key(
    request: APIKeyCreate,
    admin_user: str = Depends(verify_admin_token)
):
    """
    Create a new API key.

    Args:
        request: API key creation request
        admin_user: Authenticated admin user ID

    Returns:
        APIKeyResponse with the generated API key
    """
    try:
        logger.info(
            f"Admin {admin_user} creating API key for {request.consumer_app_id}"
        )

        apikey_service = get_apikey_service()

        # Determine environment based on naming convention
        environment = "test" if "test" in request.name.lower() else "live"

        result = await apikey_service.create_api_key(
            request=request,
            environment=environment
        )

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
    summary="List API keys",
    description="List all API keys with optional filters"
)
async def list_api_keys(
    consumer_app_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    admin_user: str = Depends(verify_admin_token)
):
    """
    List API keys.

    Args:
        consumer_app_id: Filter by consumer app ID
        status_filter: Filter by status (active, revoked, expired)
        page: Page number
        page_size: Number of results per page
        admin_user: Authenticated admin user

    Returns:
        APIKeyListResponse with list of keys
    """
    try:
        apikey_service = get_apikey_service()

        api_keys = await apikey_service.list_api_keys(
            consumer_app_id=consumer_app_id,
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
    summary="Get API key details",
    description="Get details of a specific API key (without the actual key)"
)
async def get_api_key(
    key_id: str,
    admin_user: str = Depends(verify_admin_token)
):
    """
    Get API key details.

    Args:
        key_id: API key ID
        admin_user: Authenticated admin user

    Returns:
        APIKeyInfo with key details
    """
    try:
        apikey_service = get_apikey_service()

        api_keys = await apikey_service.list_api_keys(limit=1)

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
    summary="Revoke API key",
    description="Revoke an API key (cannot be undone)"
)
async def revoke_api_key(
    key_id: str,
    request: APIKeyRevokeRequest,
    admin_user: str = Depends(verify_admin_token)
):
    """
    Revoke an API key.

    Args:
        key_id: API key ID to revoke
        request: Revocation request with reason
        admin_user: Authenticated admin user

    Returns:
        Success message
    """
    try:
        logger.info(f"Admin {admin_user} revoking API key: {key_id}")

        apikey_service = get_apikey_service()

        success = await apikey_service.revoke_api_key(
            key_id=key_id,
            reason=request.reason
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"API key not found: {key_id}"
            )

        return {
            "message": "API key revoked successfully",
            "key_id": key_id,
            "revoked_by": admin_user
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke API key"
        )


@router.post(
    "/validate",
    summary="Validate API key",
    description="Validate an API key (used internally by MCP Gateway and other services)"
)
async def validate_api_key(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security, auto_error=False),
    api_key_header: Optional[str] = Header(None, alias="X-API-Key")
):
    """
    Validate an API key.

    This endpoint is used internally by the API gateway or middleware.
    Accepts API key via:
    - Authorization: Bearer <api_key> (preferred)
    - X-API-Key header (legacy)

    Args:
        credentials: Bearer token from Authorization header
        api_key_header: API key from X-API-Key header (legacy)

    Returns:
        Validation result with key_id, permissions, etc.
    """
    try:
        # Extract API key from Bearer token or header
        api_key = None
        
        if credentials:
            api_key = credentials.credentials
        elif api_key_header:
            api_key = api_key_header
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing API key. Provide via Authorization: Bearer <key> or X-API-Key header"
            )

        apikey_service = get_apikey_service()

        result = await apikey_service.validate_api_key(api_key)

        if not result.valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.error or "Invalid API key"
            )

        return {
            "valid": True,
            "key_id": result.key_id,
            "consumer_app_id": result.consumer_app_id,
            "consumer_app_name": result.consumer_app_name,
            "permissions": result.permissions or [],
            "rate_limit_remaining": result.rate_limit_remaining
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate API key"
        )
