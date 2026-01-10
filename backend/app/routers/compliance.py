"""
Compliance API endpoints.

Provides REST API for compliance auditing:
- Audit content against legal frameworks
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.compliance import (
    AuditRequest,
    AuditResponse,
    Finding,
)
from app.services.compliance.audit import ComplianceAuditService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/compliance", tags=["Compliance Guard"])


def get_compliance_service() -> ComplianceAuditService:
    """Get compliance service instance."""
    return ComplianceAuditService()


@router.post("/audit", response_model=AuditResponse)
async def audit_compliance(
    request: AuditRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> AuditResponse:
    """
    Audit content for compliance against legal frameworks.
    
    Uses RAG to find relevant legal context from the Knowledge Store,
    then analyzes the content using Gemini Pro.
    
    **Frameworks supported:**
    - LGPD (Lei Geral de Proteção de Dados)
    - Marco Civil da Internet
    - SOX (Sarbanes-Oxley)
    - GDPR (General Data Protection Regulation)
    - Custom frameworks in your Knowledge Store
    
    **Returns:**
    - Compliance score (0-100)
    - Status (compliant, partially_compliant, non_compliant)
    - Detailed findings with severities and recommendations
    """
    if not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization",
        )
    
    compliance_service = get_compliance_service()
    
    try:
        result = await compliance_service.audit(
            content=request.content,
            frameworks=request.frameworks,
            tenant_id=current_user.org_id,
        )
        
        return AuditResponse(
            audit_id=result["audit_id"],
            compliance_score=result.get("compliance_score", 0),
            status=result.get("status", "error"),
            findings=[Finding(**f) for f in result.get("findings", [])],
            summary=result.get("summary", ""),
            frameworks=result.get("frameworks", []),
            context_chunks_used=result.get("context_chunks_used", 0),
            created_at=result["created_at"],
        )
        
    except Exception as e:
        logger.error(f"Compliance audit failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audit failed: {str(e)}",
        )
