"""
Compliance Router - Handles RAG Analysis.
Strictly Multi-tenant.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.dependencies import get_current_tenant
from app.services.search_service import get_search_service
# Note: AI Service would be here for the LLM generation part.

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance", tags=["Compliance"])

class AnalyzeRequest(BaseModel):
    query: str
    include_private: bool = True

class AnalyzeResponse(BaseModel):
    answer: str
    sources: List[str]

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_compliance(
    request: AnalyzeRequest,
    tenant_id: str = Depends(get_current_tenant)
):
    """
    Performs RAG Analysis on the query.
    
    1. Retrieve relevant vectors (filtered by tenant_id).
    2. Generate Answer (Mocked LLM call for this step, or uses Vertex if configured).
    """
    search_service = get_search_service()
    
    # 1. Secured Retrieval
    results = await search_service.search_regulations(
        query=request.query,
        tenant_id=tenant_id,           # <--- Enforced Filter
        include_private=request.include_private
    )
    
    if not results:
        return AnalyzeResponse(
            answer="No relevant regulations found.",
            sources=[]
        )
        
    # 2. Context Construction
    context_text = "\n\n".join([f"[{r['source']}] {r['content']}" for r in results])
    
    # 3. LLM Generation
    from app.services.ai_service import get_ai_service
    ai_service = get_ai_service()
    
    if not ai_service:
        answer = "AI Service is disabled. Showing context only."
    else:
        answer = await ai_service.generate_rag_answer(query=request.query, context=context_text)

    return AnalyzeResponse(
        answer=answer,
        sources=[r["source"] for r in results]
    )
