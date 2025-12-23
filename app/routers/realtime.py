"""
Real-time compliance score endpoints for ComplianceEngine.
"""
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_realtime import (
    RealtimeScoreUpdate,
    RealtimeScoreSubscription,
    RealtimeScoreHistory,
)
from app.services.realtime_score_service import get_realtime_score_service
from app.middleware.auth import validate_api_key


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/realtime", tags=["Real-time Scores"])


# ============================================================================
# Real-time Score Endpoints
# ============================================================================

@router.get(
    "/scores/{process_id}/{domain}",
    response_model=RealtimeScoreHistory,
    summary="Get real-time score history",
    description="Get real-time compliance score history for a process"
)
async def get_score_history(
    process_id: str,
    domain: str,
    hours: int = 24,
    api_key = Depends(validate_api_key)
):
    """
    Get score history.
    
    Args:
        process_id: Process ID
        domain: Regulatory domain
        hours: Number of hours of history
        api_key: Validated API key (optional)
        
    Returns:
        RealtimeScoreHistory
    """
    try:
        realtime_service = get_realtime_score_service()
        
        history = await realtime_service.get_score_history(
            process_id=process_id,
            domain=domain,
            hours=hours
        )
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting score history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get score history"
        )


@router.get(
    "/scores/{process_id}/{domain}/current",
    summary="Get current real-time score",
    description="Get current real-time compliance score"
)
async def get_current_score(
    process_id: str,
    domain: str,
    api_key = Depends(validate_api_key)
):
    """
    Get current score.
    
    Args:
        process_id: Process ID
        domain: Regulatory domain
        api_key: Validated API key (optional)
        
    Returns:
        Current score data
    """
    try:
        realtime_service = get_realtime_score_service()
        
        score = await realtime_service.get_current_score(process_id, domain)
        
        if score is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No score found for process {process_id} in domain {domain}"
            )
        
        return {
            "process_id": process_id,
            "domain": domain,
            "score": score,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current score: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get current score"
        )


@router.post(
    "/subscribe",
    response_model=RealtimeScoreSubscription,
    status_code=status.HTTP_201_CREATED,
    summary="Subscribe to score updates",
    description="Subscribe to real-time compliance score updates"
)
async def subscribe_to_updates(
    process_id: Optional[str] = None,
    domain: Optional[str] = None,
    callback_url: Optional[str] = None,
    api_key = Depends(validate_api_key)
):
    """
    Subscribe to score updates.
    
    Args:
        process_id: Specific process ID (null for all)
        domain: Specific domain (null for all)
        callback_url: Webhook URL for updates
        api_key: Validated API key (required)
        
    Returns:
        RealtimeScoreSubscription
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to subscribe"
            )
        
        realtime_service = get_realtime_score_service()
        
        subscription = await realtime_service.subscribe_to_updates(
            api_key_id=api_key.key_id,
            process_id=process_id,
            domain=domain,
            callback_url=callback_url
        )
        
        return subscription
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription"
        )

