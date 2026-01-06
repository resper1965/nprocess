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
    APIKeyValidationResponse,
    StandardsUpdateRequest,
    StandardsResponse
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
        allowed_standards=key_record.get("allowed_standards"),
        quota_remaining={
            "daily": key_record.get("quotas", {}).get("requests_per_day", 1000),
            "monthly": key_record.get("quotas", {}).get("requests_per_month", 10000)
        },
        message="API key is valid"
    )


@router.put("/{key_id}/standards", response_model=StandardsResponse)
async def update_allowed_standards(
    key_id: str,
    request: StandardsUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update allowed standards for an API key.
    Set to null/empty to allow all standards.
    """
    record = await service.get_key(key_id)
    if not record:
        raise HTTPException(status_code=404, detail="API key not found")

    # Update using service
    updated = await service.update_key(key_id, {
        "allowed_standards": request.standards if request.standards else None
    })

    logger.info(f"Standards updated for API key {key_id} by user {current_user['user_id']}: {request.standards}")

    return StandardsResponse(
        key_id=key_id,
        allowed_standards=updated.get("allowed_standards"),
        message=f"Allowed standards updated successfully"
    )


@router.get("/{key_id}/standards", response_model=StandardsResponse)
async def get_allowed_standards(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get allowed standards for an API key"""
    record = await service.get_key(key_id)
    if not record:
        raise HTTPException(status_code=404, detail="API key not found")

    allowed = record.get("allowed_standards")

    if allowed is None:
        message = "All standards allowed (marketplace + custom)"
    else:
        marketplace_count = len(allowed.get("marketplace", [])) if isinstance(allowed, dict) else 0
        custom_count = len(allowed.get("custom", [])) if isinstance(allowed, dict) else 0
        message = f"{marketplace_count} marketplace + {custom_count} custom standards allowed"

    return StandardsResponse(
        key_id=key_id,
        allowed_standards=allowed,
        message=message
    )


@router.delete("/{key_id}/standards/{standard_type}/{standard_id}")
async def remove_standard_from_key(
    key_id: str,
    standard_type: str,  # "marketplace" ou "custom"
    standard_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a specific standard from allowed list"""
    record = await service.get_key(key_id)
    if not record:
        raise HTTPException(status_code=404, detail="API key not found")

    allowed = record.get("allowed_standards")

    if allowed is None:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove standard: key has access to all standards. Set allowed_standards first."
        )

    # Verificar tipo de standard
    if standard_type not in ["marketplace", "custom"]:
        raise HTTPException(status_code=400, detail="standard_type must be 'marketplace' or 'custom'")

    # Garantir que allowed é um dict
    if not isinstance(allowed, dict):
        raise HTTPException(status_code=400, detail="Invalid allowed_standards format")

    # Remover do tipo correto
    if standard_type == "marketplace":
        marketplace_list = allowed.get("marketplace", [])
        if standard_id not in marketplace_list:
            raise HTTPException(status_code=404, detail=f"Marketplace standard {standard_id} not in allowed list")
        marketplace_list.remove(standard_id)
        allowed["marketplace"] = marketplace_list
    else:  # custom
        custom_list = allowed.get("custom", [])
        if standard_id not in custom_list:
            raise HTTPException(status_code=404, detail=f"Custom standard {standard_id} not in allowed list")
        custom_list.remove(standard_id)
        allowed["custom"] = custom_list

    # Se ambas as listas ficarem vazias, set None (acesso a todos)
    if not allowed.get("marketplace") and not allowed.get("custom"):
        updated_allowed = None
    else:
        updated_allowed = allowed

    # Atualizar via service
    await service.update_key(key_id, {"allowed_standards": updated_allowed})

    logger.info(f"{standard_type.capitalize()} standard {standard_id} removed from API key {key_id} by user {current_user['user_id']}")

    return {
        "success": True,
        "message": f"{standard_type.capitalize()} standard {standard_id} removed",
        "remaining_standards": updated_allowed
    }


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

