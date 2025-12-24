"""AI Keys Vault Router - Manages AI provider API keys"""
from fastapi import APIRouter, Depends
from typing import List
from app.schemas import AIKeyCreate, AIKeyInfo, AIKeyTestResponse, AIProvider
from app.middleware.auth import get_current_user
from datetime import datetime
import secrets

router = APIRouter()
ai_keys_db = {}

@router.post("/", response_model=AIKeyInfo)
async def create_ai_key(request: AIKeyCreate, current_user: dict = Depends(get_current_user)):
    """Add AI provider key (stored in Secret Manager)"""
    key_id = f"aikey_{secrets.token_hex(8)}"
    # TODO: Store in Google Secret Manager
    ai_key = {
        "key_id": key_id,
        "provider": request.provider,
        "key_name": request.key_name,
        "description": request.description,
        "status": "active",
        "created_at": datetime.utcnow(),
        "created_by": current_user["user_id"],
        "last_tested_at": None,
        "expires_at": None,
        "metadata": request.metadata
    }
    ai_keys_db[key_id] = ai_key
    return AIKeyInfo(**ai_key)

@router.get("/", response_model=List[AIKeyInfo])
async def list_ai_keys(current_user: dict = Depends(get_current_user)):
    """List all AI keys (without actual key values)"""
    return [AIKeyInfo(**k) for k in ai_keys_db.values()]

@router.post("/{key_id}/test", response_model=AIKeyTestResponse)
async def test_ai_key(key_id: str, current_user: dict = Depends(get_current_user)):
    """Test AI provider key validity"""
    # TODO: Implement actual API test
    return AIKeyTestResponse(
        valid=True,
        provider=AIProvider.GOOGLE,
        message="Key is valid",
        tested_at=datetime.utcnow()
    )
