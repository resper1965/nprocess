"""
API Key management schemas for n.process.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ============================================================================
# API Key Schemas
# ============================================================================

class APIKeyCreate(BaseModel):
    """Request to create new API key."""

    name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Descriptive name for the API key (e.g., 'Contracts App - Production')"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional description of the key's purpose"
    )
    consumer_app_id: str = Field(
        ...,
        description="Unique identifier for the consuming application"
    )
    quotas: Optional['APIKeyQuotas'] = Field(
        None,
        description="Rate limits and quotas"
    )
    permissions: Optional[List[str]] = Field(
        default_factory=lambda: ["read", "write"],
        description="Permissions for this key"
    )
    expires_at: Optional[datetime] = Field(
        None,
        description="Expiration date (optional)"
    )


class APIKeyQuotas(BaseModel):
    """Rate limits and quotas for API key."""

    requests_per_minute: int = Field(
        default=100,
        ge=1,
        le=10000,
        description="Maximum requests per minute"
    )
    requests_per_day: int = Field(
        default=10000,
        ge=1,
        le=1000000,
        description="Maximum requests per day"
    )
    requests_per_month: int = Field(
        default=100000,
        ge=1,
        le=10000000,
        description="Maximum requests per month"
    )


class APIKeyResponse(BaseModel):
    """Response after API key creation."""

    key_id: str = Field(..., description="Unique identifier for the key")
    api_key: str = Field(
        ...,
        description="The actual API key (SHOWN ONLY ONCE!)"
    )
    name: str
    consumer_app_id: str
    created_at: datetime
    expires_at: Optional[datetime]
    permissions: List[str]
    quotas: APIKeyQuotas
    warning: str = Field(
        default="⚠️  Save this API key now. You won't be able to see it again!",
        description="Warning message"
    )


class APIKeyInfo(BaseModel):
    """API key information (without the actual key)."""

    key_id: str
    name: str
    description: Optional[str]
    consumer_app_id: str
    consumer_app_name: Optional[str]
    key_prefix: str = Field(
        ...,
        description="First 8 characters of the key for identification"
    )
    status: str = Field(
        default="active",
        description="Status: active, revoked, expired"
    )
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    permissions: List[str]
    quotas: APIKeyQuotas
    usage: Optional['APIKeyUsage'] = None


class APIKeyUsage(BaseModel):
    """Usage statistics for an API key."""

    requests_today: int = Field(default=0)
    requests_this_month: int = Field(default=0)
    last_request_at: Optional[datetime] = None
    total_requests: int = Field(default=0)


class APIKeyListResponse(BaseModel):
    """Response for listing API keys."""

    api_keys: List[APIKeyInfo]
    total: int
    page: int = Field(default=1)
    page_size: int = Field(default=50)


class APIKeyRevokeRequest(BaseModel):
    """Request to revoke an API key."""

    key_id: str = Field(..., description="ID of the key to revoke")
    reason: Optional[str] = Field(
        None,
        max_length=500,
        description="Reason for revocation"
    )


class APIKeyValidationResult(BaseModel):
    """Result of API key validation."""

    valid: bool
    key_id: Optional[str] = None
    consumer_app_id: Optional[str] = None
    consumer_app_name: Optional[str] = None
    permissions: List[str] = Field(default_factory=list)
    error: Optional[str] = None
    rate_limit_remaining: Optional[int] = None
