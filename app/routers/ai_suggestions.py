"""
AI improvement suggestions endpoints for ComplianceEngine.
"""
import logging

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_ai_suggestions import (
    ProcessImprovementRequest,
    ProcessImprovementResponse,
    BulkImprovementRequest,
    BulkImprovementResponse,
)
from app.services.ai_suggestion_service import get_ai_suggestion_service
from app.middleware.auth import validate_api_key


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/ai", tags=["AI Suggestions"])


# ============================================================================
# AI Suggestion Endpoints
# ============================================================================

@router.post(
    "/improvements",
    response_model=ProcessImprovementResponse,
    status_code=status.HTTP_200_OK,
    summary="Get AI improvement suggestions",
    description="Analyze a process and get AI-powered improvement suggestions"
)
async def get_improvement_suggestions(
    request: ProcessImprovementRequest,
    api_key = Depends(validate_api_key)
):
    """
    Get AI improvement suggestions for a process.
    
    Args:
        request: Improvement request
        api_key: Validated API key (optional)
        
    Returns:
        ProcessImprovementResponse
    """
    try:
        ai_suggestion_service = get_ai_suggestion_service()
        
        response = await ai_suggestion_service.analyze_process_improvements(request)
        
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error getting improvement suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate improvement suggestions"
        )


@router.post(
    "/improvements/bulk",
    response_model=BulkImprovementResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk improvement analysis",
    description="Analyze multiple processes for improvements"
)
async def get_bulk_improvements(
    request: BulkImprovementRequest,
    api_key = Depends(validate_api_key)
):
    """
    Get AI improvement suggestions for multiple processes.
    
    Args:
        request: Bulk improvement request
        api_key: Validated API key (optional)
        
    Returns:
        BulkImprovementResponse
    """
    try:
        ai_suggestion_service = get_ai_suggestion_service()
        
        response = await ai_suggestion_service.analyze_bulk_improvements(request)
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting bulk improvements: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate bulk improvement suggestions"
        )

