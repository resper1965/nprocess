
from fastapi import APIRouter, HTTPException, Security, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.services.audit_service import AuditService
from app.middleware.auth import get_current_user

router = APIRouter()
audit_service = AuditService()

class AuditRequest(BaseModel):
    process_content: str
    regulation: str = "ISO27001"

@router.post("/execute")
async def execute_audit(
    req: AuditRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Audit a process (Text/BPMN) against a specific Regulation.
    Returns findings and compliance score.
    """
    try:
        result = await audit_service.audit_text(req.process_content, req.regulation)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
