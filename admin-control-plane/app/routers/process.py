
from fastapi import APIRouter, HTTPException, Depends, Security
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.services.process_service import ProcessService
from app.routers.auth import get_current_active_user

router = APIRouter()
process_service = ProcessService()

class NormalizeRequest(BaseModel):
    text: str
    previous_context: Optional[str] = None

class FeedbackRequest(BaseModel):
    original_mermaid: str
    feedback: str

@router.post("/normalize")
async def normalize_process(
    req: NormalizeRequest,
    current_user: dict = Security(get_current_active_user, scopes=["admin"])
):
    """
    Normalize unstructured text into a standard BPMN 2.0 & Mermaid process structure.
    """
    try:
        result = await process_service.normalize_text(req.text, req.previous_context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine")
async def refine_process(
    req: FeedbackRequest,
    current_user: dict = Security(get_current_active_user, scopes=["admin"])
):
    """
    Refine an existing Mermaid diagram based on user feedback.
    """
    try:
        result = await process_service.refine_diagram(req.original_mermaid, req.feedback)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
