"""
Real-time compliance score schemas for n.process.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Real-time Score Schemas
# ============================================================================

class RealtimeScoreUpdate(BaseModel):
    """Real-time compliance score update."""
    
    process_id: str
    domain: str
    score: float = Field(..., ge=0.0, le=100.0)
    previous_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    change: float = Field(..., description="Score change (current - previous)")
    timestamp: datetime
    triggered_by: str = Field(
        ...,
        description="What triggered the update: 'process_change', 'analysis', 'manual'"
    )


class RealtimeScoreSubscription(BaseModel):
    """Real-time score subscription."""
    
    subscription_id: str
    process_id: Optional[str] = Field(None, description="Specific process ID (null for all)")
    domain: Optional[str] = Field(None, description="Specific domain (null for all)")
    callback_url: Optional[str] = Field(None, description="Webhook URL for updates")
    created_at: datetime
    is_active: bool = True


class RealtimeScoreHistory(BaseModel):
    """Historical real-time score data."""
    
    process_id: str
    domain: str
    scores: List[Dict[str, Any]] = Field(
        ...,
        description="List of {timestamp, score, change} objects"
    )
    current_score: float
    average_score: float
    trend: str = Field(
        ...,
        description="Trend: 'improving', 'declining', 'stable'"
    )

