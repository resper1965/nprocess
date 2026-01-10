"""
Documents API endpoints.

Provides REST API for document generation:
- Generate documents from descriptions
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.documents import (
    GenerateDocumentRequest,
    GenerateDocumentResponse,
)
from app.services.documents.generator import DocumentGeneratorService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/documents", tags=["Document Factory"])


def get_document_service() -> DocumentGeneratorService:
    """Get document generator service instance."""
    return DocumentGeneratorService()


@router.post("/generate", response_model=GenerateDocumentResponse)
async def generate_document(
    request: GenerateDocumentRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> GenerateDocumentResponse:
    """
    Generate a professional document from description.
    
    Uses Gemini Flash for cost-effective document generation.
    
    **Document Types:**
    - `manual`: Manual de Procedimentos
    - `policy`: Política Corporativa
    - `report`: Relatório Técnico
    - `procedure`: POP (Procedimento Operacional Padrão)
    - `contract`: Minuta de Contrato
    - `generic`: Documento genérico
    
    **Output Formats:**
    - `markdown`: Markdown estruturado
    - `html`: HTML semântico
    """
    if not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization",
        )
    
    doc_service = get_document_service()
    
    try:
        result = await doc_service.generate(
            title=request.title,
            content_description=request.content_description,
            doc_type=request.doc_type,
            format=request.format,
            context=request.context,
            tenant_id=current_user.org_id,
        )
        
        return GenerateDocumentResponse(
            document_id=result["document_id"],
            title=result["title"],
            content=result["content"],
            doc_type=result["doc_type"],
            format=result["format"],
            created_at=result["created_at"],
            model=result["model"],
        )
        
    except Exception as e:
        logger.error(f"Document generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate document: {str(e)}",
        )
