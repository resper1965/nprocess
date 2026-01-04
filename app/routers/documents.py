"""
Documents Router - Handles Document Generation.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import logging

from app.dependencies import get_current_tenant
from app.services.document_service import get_document_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])

class DocGenRequest(BaseModel):
    type: str  # e.g. "Privacy Policy", "SOP"
    context: Optional[str] = None

class DocGenResponse(BaseModel):
    title: str
    sections: List[Dict[str, str]]

@router.post("/generate", response_model=DocGenResponse)
async def generate_document(
    request: DocGenRequest,
    tenant_id: str = Depends(get_current_tenant)
):
    """
    Generates a structured document using AI.
    """
    try:
        service = get_document_service()
        result = await service.generate(request.type, request.context)
        return DocGenResponse(**result)
    except Exception as e:
        logger.error(f"Doc Gen failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
