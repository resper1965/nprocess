"""
Webhook management endpoints for ComplianceEngine.
"""
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Header, status, Depends, BackgroundTasks
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.schemas_webhooks import (
    WebhookCreate,
    WebhookUpdate,
    WebhookInfo,
    WebhookResponse,
    WebhookDeliveryList,
    WebhookTestRequest,
    WebhookTestResponse,
    WebhookEventType,
)
from app.services.webhook_service import get_webhook_service
from app.services.apikey_service import get_apikey_service
from app.schemas_apikeys import APIKeyValidationResult


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/webhooks", tags=["Webhooks"])
security = HTTPBearer()


# ============================================================================
# Authentication Dependency
# ============================================================================

async def get_api_key_from_request(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security, auto_error=False),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> APIKeyValidationResult:
    """
    Extract and validate API key from request.
    
    Args:
        credentials: Bearer token from Authorization header
        x_api_key: API key from X-API-Key header (legacy)
        
    Returns:
        APIKeyValidationResult with key_id
        
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Provide via Authorization: Bearer <key> or X-API-Key header"
        )
    
    # Validate API key
    apikey_service = get_apikey_service()
    result = await apikey_service.validate_api_key(api_key)
    
    if not result.valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.error or "Invalid API key"
        )
    
    return result


# ============================================================================
# Webhook Endpoints
# ============================================================================

@router.post(
    "/",
    response_model=WebhookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new webhook",
    description="""
    Create a new webhook for receiving event notifications.
    
    **⚠️  IMPORTANT:**
    - The webhook secret is shown ONLY ONCE in the response
    - Store it securely immediately
    - You cannot retrieve it later
    - Use the secret to verify webhook signatures
    """
)
async def create_webhook(
    request: WebhookCreate,
    api_key: APIKeyValidationResult = Depends(get_api_key_from_request)
):
    """
    Create a new webhook.
    
    Args:
        request: Webhook creation request
        api_key: Validated API key info
        
    Returns:
        WebhookResponse with secret (shown only once)
    """
    try:
        logger.info(f"Creating webhook for API key {api_key.key_id}")
        
        webhook_service = get_webhook_service()
        
        result = await webhook_service.create_webhook(
            api_key_id=api_key.key_id,
            request=request
        )
        
        return result
        
    except ValueError as e:
        logger.error(f"Validation error creating webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create webhook"
        )


@router.get(
    "/",
    response_model=List[WebhookInfo],
    summary="List webhooks",
    description="List all webhooks for the authenticated API key"
)
async def list_webhooks(
    active_only: bool = False,
    api_key: APIKeyValidationResult = Depends(get_api_key_from_request)
):
    """
    List webhooks.
    
    Args:
        active_only: Only return active webhooks
        api_key: Validated API key info
        
    Returns:
        List of WebhookInfo
    """
    try:
        webhook_service = get_webhook_service()
        
        webhooks = await webhook_service.list_webhooks(
            api_key_id=api_key.key_id,
            active_only=active_only
        )
        
        return webhooks
        
    except Exception as e:
        logger.error(f"Error listing webhooks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list webhooks"
        )


@router.get(
    "/{webhook_id}",
    response_model=WebhookInfo,
    summary="Get webhook details",
    description="Get details of a specific webhook"
)
async def get_webhook(
    webhook_id: str,
    api_key: APIKeyValidationResult = Depends(get_api_key_from_request)
):
    """
    Get webhook details.
    
    Args:
        webhook_id: Webhook ID
        api_key: Validated API key info
        
    Returns:
        WebhookInfo
    """
    try:
        webhook_service = get_webhook_service()
        
        webhook = await webhook_service.get_webhook(webhook_id)
        
        if not webhook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Webhook not found: {webhook_id}"
            )
        
        # Verify webhook belongs to this API key
        if webhook.api_key_id != api_key.key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: webhook belongs to different API key"
            )
        
        return webhook
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get webhook"
        )


@router.put(
    "/{webhook_id}",
    response_model=WebhookInfo,
    summary="Update webhook",
    description="Update a webhook"
)
async def update_webhook(
    webhook_id: str,
    request: WebhookUpdate,
    api_key: APIKeyValidationResult = Depends(get_api_key_from_request)
):
    """
    Update a webhook.
    
    Args:
        webhook_id: Webhook ID
        request: Update request
        api_key: Validated API key info
        
    Returns:
        Updated WebhookInfo
    """
    try:
        webhook_service = get_webhook_service()
        
        # Verify webhook belongs to this API key
        webhook = await webhook_service.get_webhook(webhook_id)
        if not webhook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Webhook not found: {webhook_id}"
            )
        
        if webhook.api_key_id != api_key.key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: webhook belongs to different API key"
            )
        
        # Update webhook
        success = await webhook_service.update_webhook(webhook_id, request)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update webhook"
            )
        
        # Return updated webhook
        updated_webhook = await webhook_service.get_webhook(webhook_id)
        return updated_webhook
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update webhook"
        )


@router.delete(
    "/{webhook_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete webhook",
    description="Delete a webhook"
)
async def delete_webhook(
    webhook_id: str,
    api_key: APIKeyValidationResult = Depends(get_api_key_from_request)
):
    """
    Delete a webhook.
    
    Args:
        webhook_id: Webhook ID
        api_key: Validated API key info
    """
    try:
        webhook_service = get_webhook_service()
        
        # Verify webhook belongs to this API key
        webhook = await webhook_service.get_webhook(webhook_id)
        if not webhook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Webhook not found: {webhook_id}"
            )
        
        if webhook.api_key_id != api_key.key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: webhook belongs to different API key"
            )
        
        # Delete webhook
        success = await webhook_service.delete_webhook(webhook_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete webhook"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete webhook"
        )


@router.get(
    "/{webhook_id}/deliveries",
    response_model=WebhookDeliveryList,
    summary="List webhook deliveries",
    description="List delivery history for a webhook"
)
async def list_webhook_deliveries(
    webhook_id: str,
    limit: int = 50,
    api_key: APIKeyValidationResult = Depends(get_api_key_from_request)
):
    """
    List webhook deliveries.
    
    Args:
        webhook_id: Webhook ID
        limit: Maximum number of results
        api_key: Validated API key info
        
    Returns:
        List of WebhookDelivery
    """
    try:
        webhook_service = get_webhook_service()
        
        # Verify webhook belongs to this API key
        webhook = await webhook_service.get_webhook(webhook_id)
        if not webhook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Webhook not found: {webhook_id}"
            )
        
        if webhook.api_key_id != api_key.key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: webhook belongs to different API key"
            )
        
        # List deliveries
        deliveries = await webhook_service.list_deliveries(webhook_id, limit)
        
        return WebhookDeliveryList(
            deliveries=deliveries,
            total=len(deliveries),
            page=1,
            page_size=limit
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing webhook deliveries: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list webhook deliveries"
        )


@router.post(
    "/{webhook_id}/test",
    response_model=WebhookTestResponse,
    summary="Test webhook",
    description="Send a test event to a webhook"
)
async def test_webhook(
    webhook_id: str,
    request: WebhookTestRequest,
    background_tasks: BackgroundTasks,
    api_key: APIKeyValidationResult = Depends(get_api_key_from_request)
):
    """
    Test a webhook by sending a test event.
    
    Args:
        webhook_id: Webhook ID
        request: Test request with optional custom payload
        background_tasks: FastAPI background tasks
        api_key: Validated API key info
        
    Returns:
        WebhookTestResponse
    """
    try:
        webhook_service = get_webhook_service()
        
        # Verify webhook belongs to this API key
        webhook = await webhook_service.get_webhook(webhook_id)
        if not webhook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Webhook not found: {webhook_id}"
            )
        
        if webhook.api_key_id != api_key.key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: webhook belongs to different API key"
            )
        
        # Prepare test payload
        test_payload = request.payload or {
            "test": True,
            "message": "This is a test webhook event",
        }
        
        # Deliver test event in background
        async def deliver_test():
            await webhook_service.deliver_webhook(
                webhook_id=webhook_id,
                event_type="test",
                event_id="test-event",
                payload=test_payload
            )
        
        background_tasks.add_task(deliver_test)
        
        return WebhookTestResponse(
            success=True,
            status_code=None,
            response_body=None,
            error_message=None,
            delivered_at=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to test webhook"
        )


@router.get(
    "/events",
    response_model=List[str],
    summary="List available event types",
    description="Get list of all available webhook event types"
)
async def list_event_types():
    """
    List all available webhook event types.
    
    Returns:
        List of event type strings
    """
    return WebhookEventType.all()

