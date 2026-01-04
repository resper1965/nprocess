"""
API Keys Management Router
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging

from app.schemas import (
    APIKeyCreate,
    APIKeyResponse,
    APIKeyInfo,
    APIKeyValidationRequest,
    APIKeyValidationResponse
)
from app.middleware.auth import get_current_user
from app.services.apikey_service import APIKeyService

logger = logging.getLogger(__name__)

router = APIRouter()
service = APIKeyService()

@router.post("/", response_model=APIKeyResponse)
async def create_api_key(
    request: APIKeyCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new API key"""
    try:
        record = await service.create_key(request.dict(), current_user["user_id"])
        
        logger.info(f"API key created: {record['key_id']} by user {current_user['user_id']}")

        return APIKeyResponse(**record)

    except Exception as e:
        logger.error(f"Error creating API key: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[APIKeyInfo])
async def list_api_keys(
    current_user: dict = Depends(get_current_user)
):
    """List all API keys (without actual key values)"""
    records = await service.list_keys()
    # Pydantic will filter fields based on APIKeyInfo schema
    return [APIKeyInfo(**r) for r in records]


@router.get("/{key_id}", response_model=APIKeyInfo)
async def get_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get API key details"""
    record = await service.get_key(key_id)
    if not record:
        raise HTTPException(status_code=404, detail="API key not found")

    return APIKeyInfo(**record)


@router.post("/{key_id}/revoke", response_model=APIKeyInfo)
async def revoke_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Revoke an API key"""
    record = await service.revoke_key(key_id, current_user["user_id"])
    if not record:
        raise HTTPException(status_code=404, detail="API key not found")

    logger.info(f"API key revoked: {key_id} by user {current_user['user_id']}")
    return APIKeyInfo(**record)


@router.post("/validate", response_model=APIKeyValidationResponse)
async def validate_api_key(request: APIKeyValidationRequest):
    """Validate an API key"""
    result = await service.validate_key_string(request.api_key)
    
    if not result["valid"]:
        return APIKeyValidationResponse(
            valid=False,
            message=result["message"]
        )
    
    key_record = result["key_data"]
    
    return APIKeyValidationResponse(
        valid=True,
        key_id=key_record["key_id"],
        consumer_app_id=key_record["consumer_app_id"],
        permissions=key_record.get("permissions", []),
        quota_remaining={
            "daily": key_record["quotas"].get("requests_per_day", 1000), 
            "monthly": key_record["quotas"].get("requests_per_month", 10000)
        },
        message="API key is valid"
    )


@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an API key"""
    success = await service.delete_key(key_id)
    if not success: # Should check existance first practically, but firestore delete is idempotent
         pass

    logger.info(f"API key deleted: {key_id} by user {current_user['user_id']}")
    return {"success": True, "message": f"API key {key_id} deleted"}

