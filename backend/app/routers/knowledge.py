"""
Knowledge API endpoints.

Provides REST API for knowledge base operations:
- Ingest documents
- Semantic search
- List and delete documents
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.knowledge import (
    IngestRequest,
    IngestResponse,
    SearchRequest,
    SearchResponse,
    SearchResult,
    ListDocumentsResponse,
    DocumentSummary,
    DeleteDocumentResponse,
)
from app.services.ai.embedding import get_embedding_service
from app.services.knowledge.service import get_knowledge_service
from app.services.ingestion.service import IngestionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/knowledge", tags=["Knowledge Store"])


def get_ingestion_service() -> IngestionService:
    """Get configured ingestion service."""
    return IngestionService(
        embedding_service=get_embedding_service(),
        knowledge_service=get_knowledge_service(),
    )


@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    request: IngestRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> IngestResponse:
    """
    Ingest a document into the knowledge base.
    
    Chunks the document using the specified strategy and generates
    embeddings for semantic search.
    
    - **default strategy**: Sliding window chunking
    - **legal strategy**: Preserves legal document structure (Articles, Paragraphs)
    """
    # Only super_admin can create marketplace docs
    if request.doc_type == "marketplace" and not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super_admin can create marketplace documents",
        )
    
    # Must have org_id for private docs
    if request.doc_type == "private" and not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization to create private documents",
        )
    
    tenant_id = current_user.org_id or "system"
    
    ingestion_service = get_ingestion_service()
    
    try:
        result = await ingestion_service.ingest_text(
            content=request.content,
            tenant_id=tenant_id,
            strategy=request.strategy,
            doc_type=request.doc_type,
            metadata=request.metadata,
        )
        
        return IngestResponse(**result)
        
    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest document: {str(e)}",
        )


@router.post("/search", response_model=SearchResponse)
async def search_knowledge(
    request: SearchRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> SearchResponse:
    """
    Search the knowledge base using semantic similarity.
    
    Returns chunks most similar to the query text.
    Results are filtered based on tenant access:
    - **private**: Only documents owned by the user's organization
    - **marketplace**: Only public marketplace documents
    - **all**: Both private (for user's org) and marketplace documents
    """
    if not current_user.org_id and request.filter_type != "marketplace":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization to search private documents",
        )
    
    embedding_service = get_embedding_service()
    knowledge_service = get_knowledge_service()
    
    try:
        # Generate query embedding
        query_embedding = await embedding_service.embed(request.query)
        
        # Search knowledge base
        results = await knowledge_service.search(
            query_embedding=query_embedding,
            tenant_id=current_user.org_id or "system",
            limit=request.limit,
            filter_type=request.filter_type,
        )
        
        return SearchResponse(
            query=request.query,
            results=[SearchResult(**r) for r in results],
            count=len(results),
        )
        
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}",
        )


@router.get("/documents", response_model=ListDocumentsResponse)
async def list_documents(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    doc_type: str = "private",
    limit: int = 100,
) -> ListDocumentsResponse:
    """
    List documents in the knowledge base.
    
    Returns summaries of documents owned by the user's organization.
    """
    if not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization",
        )
    
    knowledge_service = get_knowledge_service()
    
    try:
        docs = await knowledge_service.get_documents(
            tenant_id=current_user.org_id,
            doc_type=doc_type,
            limit=limit,
        )
        
        return ListDocumentsResponse(
            documents=[DocumentSummary(**d) for d in docs],
            count=len(docs),
        )
        
    except Exception as e:
        logger.error(f"List documents failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list documents: {str(e)}",
        )


@router.delete("/documents/{doc_id}", response_model=DeleteDocumentResponse)
async def delete_document(
    doc_id: str,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> DeleteDocumentResponse:
    """
    Delete a document and all its chunks.
    
    Only the owner organization (or super_admin) can delete a document.
    """
    if not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization",
        )
    
    knowledge_service = get_knowledge_service()
    
    try:
        deleted = await knowledge_service.delete_document(
            doc_id=doc_id,
            tenant_id=current_user.org_id,
        )
        
        if deleted == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {doc_id} not found or access denied",
            )
        
        return DeleteDocumentResponse(
            doc_id=doc_id,
            chunks_deleted=deleted,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete document failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}",
        )
