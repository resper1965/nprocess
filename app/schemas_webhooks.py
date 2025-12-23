"""
Webhook management schemas for ComplianceEngine.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, validator


# ============================================================================
# Webhook Event Types
# ============================================================================

class WebhookEventType:
    """Webhook event type constants."""
    
    # Process events
    PROCESS_CREATED = "process.created"
    PROCESS_UPDATED = "process.updated"
    PROCESS_DELETED = "process.deleted"
    
    # Analysis events
    ANALYSIS_COMPLETED = "analysis.completed"
    ANALYSIS_FAILED = "analysis.failed"
    ANALYSIS_STARTED = "analysis.started"
    
    # Compliance events
    COMPLIANCE_SCORE_UPDATED = "compliance.score_updated"
    COMPLIANCE_ALERT = "compliance.alert"
    
    # API Key events
    API_KEY_CREATED = "api_key.created"
    API_KEY_REVOKED = "api_key.revoked"
    
    @classmethod
    def all(cls) -> List[str]:
        """Get all event types."""
        return [
            cls.PROCESS_CREATED,
            cls.PROCESS_UPDATED,
            cls.PROCESS_DELETED,
            cls.ANALYSIS_COMPLETED,
            cls.ANALYSIS_FAILED,
            cls.ANALYSIS_STARTED,
            cls.COMPLIANCE_SCORE_UPDATED,
            cls.COMPLIANCE_ALERT,
            cls.API_KEY_CREATED,
            cls.API_KEY_REVOKED,
        ]


# ============================================================================
# Webhook Schemas
# ============================================================================

class WebhookCreate(BaseModel):
    """Request to create a new webhook."""
    
    url: HttpUrl = Field(
        ...,
        description="URL to send webhook events to"
    )
    events: List[str] = Field(
        ...,
        min_items=1,
        description="List of events to subscribe to"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional description of the webhook"
    )
    secret: Optional[str] = Field(
        None,
        min_length=16,
        max_length=256,
        description="Secret for HMAC signature (auto-generated if not provided)"
    )
    active: bool = Field(
        True,
        description="Whether the webhook is active"
    )
    
    @validator('events')
    def validate_events(cls, v):
        """Validate event types."""
        valid_events = WebhookEventType.all()
        invalid_events = [e for e in v if e not in valid_events]
        if invalid_events:
            raise ValueError(f"Invalid event types: {invalid_events}. Valid events: {valid_events}")
        return v


class WebhookUpdate(BaseModel):
    """Request to update a webhook."""
    
    url: Optional[HttpUrl] = Field(None, description="New webhook URL")
    events: Optional[List[str]] = Field(None, description="New list of events")
    description: Optional[str] = Field(None, max_length=500)
    active: Optional[bool] = Field(None, description="Active status")
    
    @validator('events')
    def validate_events(cls, v):
        """Validate event types if provided."""
        if v is not None:
            valid_events = WebhookEventType.all()
            invalid_events = [e for e in v if e not in valid_events]
            if invalid_events:
                raise ValueError(f"Invalid event types: {invalid_events}. Valid events: {valid_events}")
        return v


class WebhookInfo(BaseModel):
    """Webhook information (without secret)."""
    
    id: str
    api_key_id: str
    url: str
    events: List[str]
    description: Optional[str]
    active: bool
    created_at: datetime
    updated_at: datetime
    last_delivery_at: Optional[datetime]
    last_delivery_status: Optional[str]  # "success", "failed", "pending"
    delivery_count: int = 0
    failure_count: int = 0


class WebhookResponse(BaseModel):
    """Response after webhook creation."""
    
    id: str
    url: str
    events: List[str]
    secret: str = Field(
        ...,
        description="Webhook secret for HMAC signature (SHOWN ONLY ONCE!)"
    )
    created_at: datetime
    warning: str = Field(
        default="⚠️  Save this webhook secret now. You won't be able to see it again!",
        description="Warning message"
    )


class WebhookDelivery(BaseModel):
    """Webhook delivery attempt."""
    
    id: str
    webhook_id: str
    event_type: str
    event_id: str  # ID of the event (process_id, analysis_id, etc.)
    payload: Dict[str, Any]
    status: str  # "pending", "success", "failed"
    status_code: Optional[int]
    response_body: Optional[str]
    error_message: Optional[str]
    attempt_number: int
    delivered_at: Optional[datetime]
    created_at: datetime


class WebhookDeliveryList(BaseModel):
    """List of webhook deliveries."""
    
    deliveries: List[WebhookDelivery]
    total: int
    page: int = 1
    page_size: int = 50


class WebhookTestRequest(BaseModel):
    """Request to test a webhook."""
    
    payload: Optional[Dict[str, Any]] = Field(
        None,
        description="Custom test payload (optional)"
    )


class WebhookTestResponse(BaseModel):
    """Response from webhook test."""
    
    success: bool
    status_code: Optional[int]
    response_body: Optional[str]
    error_message: Optional[str]
    delivered_at: datetime

