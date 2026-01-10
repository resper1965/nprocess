"""
Process API endpoints.

Provides REST API for BPMN generation:
- Generate BPMN from text description
- Check job status (for async processing)
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.process import (
    GenerateBPMNRequest,
    GenerateBPMNResponse,
)
from app.services.process.bpmn import BPMNService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/process", tags=["Process Engine"])


def get_bpmn_service() -> BPMNService:
    """Get BPMN service instance."""
    return BPMNService()


@router.post("/generate", response_model=GenerateBPMNResponse)
async def generate_bpmn(
    request: GenerateBPMNRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> GenerateBPMNResponse:
    """
    Generate a BPMN 2.0 diagram from text description.
    
    Uses Gemini Pro for complex reasoning about process structure.
    Returns valid BPMN 2.0 XML that can be rendered by any BPMN viewer.
    
    Example description:
    ```
    Processo de aprovação de férias:
    1. Funcionário solicita férias no sistema
    2. RH verifica saldo disponível
    3. Se saldo OK, gestor aprova ou rejeita
    4. Se aprovado, RH registra as férias
    5. Funcionário recebe notificação
    ```
    """
    if not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization",
        )
    
    bpmn_service = get_bpmn_service()
    
    try:
        result = await bpmn_service.generate(
            description=request.description,
            context=request.context,
            tenant_id=current_user.org_id,
        )
        
        return GenerateBPMNResponse(
            process_id=result["process_id"],
            bpmn_xml=result["bpmn_xml"],
            description=result["description"],
            created_at=result["created_at"],
            model=result["model"],
        )
        
    except Exception as e:
        logger.error(f"BPMN generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate BPMN: {str(e)}",
        )


# TODO: Implement async job processing with Cloud Tasks
# @router.post("/generate/async")
# async def generate_bpmn_async(...) -> JobResponse:
#     """Queue BPMN generation for async processing."""
#     pass

# @router.get("/jobs/{job_id}")
# async def get_job_status(job_id: str, ...) -> ProcessJob:
#     """Check status of async job."""
#     pass
