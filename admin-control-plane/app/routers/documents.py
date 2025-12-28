
from fastapi import APIRouter, HTTPException, Security
from pydantic import BaseModel
from typing import Optional, List
from app.services.document_service import DocumentService
from app.routers.auth import get_current_active_user

router = APIRouter()
document_service = DocumentService()

class GapAnalysisRequest(BaseModel):
    process_description: str
    audit_findings: Optional[str] = None

class GenerateTemplateRequest(BaseModel):
    document_type: str
    context: str

@router.post("/analyze-gaps")
async def analyze_document_gaps(
    req: GapAnalysisRequest,
    current_user: dict = Security(get_current_active_user, scopes=["admin"])
):
    """
    Identify missing documentation required for compliance based on process context.
    """
    try:
        result = await document_service.analyze_gaps(req.process_description, req.audit_findings)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-template")
async def generate_template(
    req: GenerateTemplateRequest,
    current_user: dict = Security(get_current_active_user, scopes=["admin"])
):
    """
    Generate a markdown template for a specific compliance document.
    """
    try:
        markdown_content = await document_service.generate_template(req.document_type, req.context)
        return {"content": markdown_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
