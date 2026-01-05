"""
API Keys Management Router
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging
from datetime import datetime
import secrets
import hashlib

from app.schemas import (
    APIKeyCreate,
    APIKeyResponse,
    APIKeyInfo,
    APIKeyValidationRequest,
    APIKeyValidationResponse,
    APIKeyQuotas,
    APIKeyEnvironment,
    APIKeyStatus,
    StandardsUpdateRequest,
    StandardsResponse
)
from app.middleware.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage (use database in production)
api_keys_db: dict = {}


def generate_api_key() -> str:
    """Generate cryptographically secure API key"""
    random_bytes = secrets.token_bytes(32)
    key_hex = random_bytes.hex()
    return f"ce_live_{key_hex}"


def hash_api_key(api_key: str) -> str:
    """Hash API key for secure storage"""
    return hashlib.sha256(api_key.encode()).hexdigest()


@router.post("/", response_model=APIKeyResponse)
async def create_api_key(
    request: APIKeyCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new API key"""
    try:
        # Generate API key
        api_key = generate_api_key()
        key_id = f"key_{secrets.token_hex(8)}"

        # Hash for storage
        hashed_key = hash_api_key(api_key)

        # Create key record
        key_record = {
            "key_id": key_id,
            "hashed_key": hashed_key,
            "name": request.name,
            "description": request.description,
            "consumer_app_id": request.consumer_app_id,
            "environment": request.environment,
            "status": APIKeyStatus.ACTIVE,
            "quotas": request.quotas or APIKeyQuotas(),
            "permissions": request.permissions,
            "allowed_standards": request.allowed_standards,
            "created_at": datetime.utcnow(),
            "created_by": current_user["user_id"],
            "expires_at": request.expires_at,
            "last_used_at": None
        }

        # Store in database
        api_keys_db[key_id] = key_record

        logger.info(f"API key created: {key_id} by user {current_user['user_id']}")

        # Return response with actual key (only shown once)
        return APIKeyResponse(
            key_id=key_id,
            api_key=api_key,  # Only shown during creation!
            name=key_record["name"],
            description=key_record["description"],
            consumer_app_id=key_record["consumer_app_id"],
            environment=key_record["environment"],
            status=key_record["status"],
            quotas=key_record["quotas"],
            permissions=key_record["permissions"],
            allowed_standards=key_record["allowed_standards"],
            created_at=key_record["created_at"],
            created_by=key_record["created_by"],
            expires_at=key_record["expires_at"],
            last_used_at=key_record["last_used_at"]
        )

    except Exception as e:
        logger.error(f"Error creating API key: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[APIKeyInfo])
async def list_api_keys(
    current_user: dict = Depends(get_current_user)
):
    """List all API keys (without actual key values)"""
    keys = []

    for key_id, key_record in api_keys_db.items():
        keys.append(APIKeyInfo(
            key_id=key_record["key_id"],
            name=key_record["name"],
            description=key_record["description"],
            consumer_app_id=key_record["consumer_app_id"],
            environment=key_record["environment"],
            status=key_record["status"],
            quotas=key_record["quotas"],
            permissions=key_record["permissions"],
            allowed_standards=key_record.get("allowed_standards"),
            created_at=key_record["created_at"],
            created_by=key_record["created_by"],
            expires_at=key_record["expires_at"],
            last_used_at=key_record["last_used_at"],
            usage_stats={
                "requests_today": 0,  # TODO: Get from monitoring
                "requests_this_month": 0
            }
        ))

    return keys


@router.get("/{key_id}", response_model=APIKeyInfo)
async def get_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get API key details"""
    if key_id not in api_keys_db:
        raise HTTPException(status_code=404, detail="API key not found")

    key_record = api_keys_db[key_id]

    return APIKeyInfo(
        key_id=key_record["key_id"],
        name=key_record["name"],
        description=key_record["description"],
        consumer_app_id=key_record["consumer_app_id"],
        environment=key_record["environment"],
        status=key_record["status"],
        quotas=key_record["quotas"],
        permissions=key_record["permissions"],
        allowed_standards=key_record.get("allowed_standards"),
        created_at=key_record["created_at"],
        created_by=key_record["created_by"],
        expires_at=key_record["expires_at"],
        last_used_at=key_record["last_used_at"],
        usage_stats={
            "requests_today": 0,
            "requests_this_month": 0
        }
    )


@router.post("/{key_id}/revoke", response_model=APIKeyInfo)
async def revoke_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Revoke an API key"""
    if key_id not in api_keys_db:
        raise HTTPException(status_code=404, detail="API key not found")

    # Update status
    api_keys_db[key_id]["status"] = APIKeyStatus.REVOKED

    logger.info(f"API key revoked: {key_id} by user {current_user['user_id']}")

    key_record = api_keys_db[key_id]

    return APIKeyInfo(
        key_id=key_record["key_id"],
        name=key_record["name"],
        description=key_record["description"],
        consumer_app_id=key_record["consumer_app_id"],
        environment=key_record["environment"],
        status=key_record["status"],
        quotas=key_record["quotas"],
        permissions=key_record["permissions"],
        allowed_standards=key_record.get("allowed_standards"),
        created_at=key_record["created_at"],
        created_by=key_record["created_by"],
        expires_at=key_record["expires_at"],
        last_used_at=key_record["last_used_at"]
    )


@router.post("/validate", response_model=APIKeyValidationResponse)
async def validate_api_key(request: APIKeyValidationRequest):
    """Validate an API key"""
    hashed_key = hash_api_key(request.api_key)

    # Find key by hash
    for key_id, key_record in api_keys_db.items():
        if key_record["hashed_key"] == hashed_key:
            if key_record["status"] != APIKeyStatus.ACTIVE:
                return APIKeyValidationResponse(
                    valid=False,
                    message=f"API key is {key_record['status']}"
                )

            # Check expiration
            if key_record["expires_at"] and key_record["expires_at"] < datetime.utcnow():
                return APIKeyValidationResponse(
                    valid=False,
                    message="API key has expired"
                )

            return APIKeyValidationResponse(
                valid=True,
                key_id=key_record["key_id"],
                consumer_app_id=key_record["consumer_app_id"],
                permissions=key_record["permissions"],
                allowed_standards=key_record.get("allowed_standards"),
                quota_remaining={
                    "daily": key_record["quotas"].requests_per_day,  # TODO: Calculate actual remaining
                    "monthly": key_record["quotas"].requests_per_month
                },
                message="API key is valid"
            )

    return APIKeyValidationResponse(
        valid=False,
        message="Invalid API key"
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
    if key_id not in api_keys_db:
        raise HTTPException(status_code=404, detail="API key not found")

    # Update allowed_standards
    api_keys_db[key_id]["allowed_standards"] = request.standards if request.standards else None

    logger.info(f"Standards updated for API key {key_id} by user {current_user['user_id']}: {request.standards}")

    return StandardsResponse(
        key_id=key_id,
        allowed_standards=api_keys_db[key_id]["allowed_standards"],
        message=f"Allowed standards updated successfully"
    )


@router.get("/{key_id}/standards", response_model=StandardsResponse)
async def get_allowed_standards(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get allowed standards for an API key"""
    if key_id not in api_keys_db:
        raise HTTPException(status_code=404, detail="API key not found")

    allowed = api_keys_db[key_id].get("allowed_standards")

    return StandardsResponse(
        key_id=key_id,
        allowed_standards=allowed,
        message="All standards allowed" if allowed is None else f"{len(allowed)} standards allowed"
    )


@router.delete("/{key_id}/standards/{standard_id}")
async def remove_standard_from_key(
    key_id: str,
    standard_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a specific standard from allowed list"""
    if key_id not in api_keys_db:
        raise HTTPException(status_code=404, detail="API key not found")

    allowed = api_keys_db[key_id].get("allowed_standards")

    if allowed is None:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove standard: key has access to all standards. Set allowed_standards first."
        )

    if standard_id not in allowed:
        raise HTTPException(status_code=404, detail=f"Standard {standard_id} not in allowed list")

    allowed.remove(standard_id)
    api_keys_db[key_id]["allowed_standards"] = allowed if allowed else None

    logger.info(f"Standard {standard_id} removed from API key {key_id} by user {current_user['user_id']}")

    return {
        "success": True,
        "message": f"Standard {standard_id} removed from allowed list",
        "remaining_standards": allowed
    }


@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an API key"""
    if key_id not in api_keys_db:
        raise HTTPException(status_code=404, detail="API key not found")

    del api_keys_db[key_id]

    logger.info(f"API key deleted: {key_id} by user {current_user['user_id']}")

    return {"success": True, "message": f"API key {key_id} deleted"}
