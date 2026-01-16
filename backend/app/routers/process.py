"""
Process API endpoints.

Provides REST API for BPMN generation:
- Generate BPMN from text description
- Check job status (for async processing)
"""

import asyncio
import logging
import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from firebase_admin import firestore

from app.core.config import settings
from app.core.deps import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.process import (
    GenerateBPMNRequest,
    GenerateBPMNResponse,
    ProcessJob,
)
from app.services.process.bpmn import BPMNService
from app.services.tasks.cloud_tasks import enqueue_http_task, tasks_enabled

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/process", tags=["Process Engine"])

JOB_COLLECTION = "jobs"


def get_bpmn_service() -> BPMNService:
    """Get BPMN service instance."""
    return BPMNService()


def get_db():
    """Get Firestore client."""
    return firestore.client()


async def _run_bpmn_job(job_id: str) -> None:
    """Run BPMN generation job and update status."""
    db = get_db()
    job_ref = db.collection(JOB_COLLECTION).document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        logger.error("Job not found: %s", job_id)
        return

    job_data = job_doc.to_dict()
    job_ref.update(
        {"status": "processing", "updated_at": datetime.utcnow()}
    )

    try:
        request_data = job_data.get("request", {})
        tenant_id = job_data.get("tenant_id")

        result = await get_bpmn_service().generate(
            description=request_data.get("description", ""),
            context=request_data.get("context"),
            tenant_id=tenant_id,
        )

        job_ref.update(
            {
                "status": "completed",
                "result": result,
                "updated_at": datetime.utcnow(),
            }
        )
    except Exception as exc:
        logger.error("Job %s failed: %s", job_id, exc)
        job_ref.update(
            {
                "status": "failed",
                "error": str(exc),
                "updated_at": datetime.utcnow(),
            }
        )


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


@router.post("/generate/async", response_model=ProcessJob)
async def generate_bpmn_async(
    request: GenerateBPMNRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ProcessJob:
    """Queue BPMN generation for async processing."""
    if not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization",
        )

    job_id = str(uuid.uuid4())
    now = datetime.utcnow()
    job_data = {
        "job_id": job_id,
        "type": "bpmn_generate",
        "status": "pending",
        "tenant_id": current_user.org_id,
        "request": request.model_dump(),
        "created_at": now,
        "updated_at": now,
    }

    db = get_db()
    db.collection(JOB_COLLECTION).document(job_id).set(job_data)

    if tasks_enabled():
        enqueue_http_task(
            relative_path=f"/v1/process/jobs/{job_id}/run",
            payload={"job_id": job_id},
        )
    else:
        asyncio.create_task(_run_bpmn_job(job_id))

    return ProcessJob(
        job_id=job_id,
        status="pending",
        result=None,
        error=None,
        created_at=now,
        updated_at=now,
    )


@router.post("/jobs/{job_id}/run")
async def run_bpmn_job(
    job_id: str,
    task_secret: Annotated[str | None, Header(alias="X-Task-Secret")] = None,
) -> dict:
    """Internal endpoint for Cloud Tasks to process a job."""
    if (
        tasks_enabled()
        and settings.cloud_tasks_task_secret
        and task_secret != settings.cloud_tasks_task_secret
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid task secret",
        )

    await _run_bpmn_job(job_id)
    return {"success": True, "job_id": job_id}


@router.get("/jobs/{job_id}", response_model=ProcessJob)
async def get_job_status(
    job_id: str,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ProcessJob:
    """Check status of async job."""
    db = get_db()
    job_doc = db.collection(JOB_COLLECTION).document(job_id).get()

    if not job_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    job_data = job_doc.to_dict()
    if job_data.get("tenant_id") != current_user.org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    result = job_data.get("result")
    parsed_result = GenerateBPMNResponse(**result) if result else None

    return ProcessJob(
        job_id=job_data.get("job_id", job_id),
        status=job_data.get("status", "pending"),
        result=parsed_result,
        error=job_data.get("error"),
        created_at=job_data.get("created_at"),
        updated_at=job_data.get("updated_at"),
    )
