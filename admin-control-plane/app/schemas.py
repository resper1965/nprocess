"""
Pydantic schemas for Admin Control Plane API
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

class UserRole(str, Enum):
    """User roles for RBAC"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    FINOPS_MANAGER = "finops_manager"
    AUDITOR = "auditor"
    USER = "user"
    VIEWER = "viewer"


class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class APIKeyStatus(str, Enum):
    """API key status"""
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"


class APIKeyEnvironment(str, Enum):
    """API key environment"""
    LIVE = "live"
    TEST = "test"


class AIProvider(str, Enum):
    """AI provider types"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    AZURE = "azure"


class ActionType(str, Enum):
    """Audit log action types"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    REVOKE = "revoke"
    ROTATE = "rotate"
    LOGIN = "login"
    LOGOUT = "logout"


# ============================================================================
# User Management Schemas
# ============================================================================

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.USER


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


class UserResponse(UserBase):
    """Schema for user response"""
    user_id: str
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserWithActivity(UserResponse):
    """User response with activity stats"""
    total_logins: int = 0
    api_keys_created: int = 0
    last_activity_at: Optional[datetime] = None


# ============================================================================
# API Key Management Schemas
# ============================================================================

class APIKeyQuotas(BaseModel):
    """API key quotas"""
    requests_per_minute: int = Field(100, ge=1, le=1000)
    requests_per_day: int = Field(10000, ge=1, le=1000000)
    requests_per_month: int = Field(300000, ge=1, le=10000000)


class APIKeyCreate(BaseModel):
    """Schema for creating an API key"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    consumer_app_id: str = Field(..., min_length=1, max_length=100)
    environment: APIKeyEnvironment = APIKeyEnvironment.LIVE
    quotas: Optional[APIKeyQuotas] = None
    permissions: List[str] = Field(default_factory=lambda: ["read"])
    expires_at: Optional[datetime] = None


class APIKeyResponse(BaseModel):
    """Schema for API key response (includes the actual key only on creation)"""
    key_id: str
    api_key: str  # Only shown once during creation
    name: str
    description: Optional[str] = None
    consumer_app_id: str
    environment: APIKeyEnvironment
    status: APIKeyStatus
    quotas: APIKeyQuotas
    permissions: List[str]
    created_at: datetime
    created_by: str
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class APIKeyInfo(BaseModel):
    """API key info without the actual key value"""
    key_id: str
    name: str
    description: Optional[str] = None
    consumer_app_id: str
    environment: APIKeyEnvironment
    status: APIKeyStatus
    quotas: APIKeyQuotas
    permissions: List[str]
    created_at: datetime
    created_by: str
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    usage_stats: Optional[Dict[str, int]] = None

    class Config:
        from_attributes = True


class APIKeyValidationRequest(BaseModel):
    """Request to validate an API key"""
    api_key: str


class APIKeyValidationResponse(BaseModel):
    """Response from API key validation"""
    valid: bool
    key_id: Optional[str] = None
    consumer_app_id: Optional[str] = None
    permissions: Optional[List[str]] = None
    quota_remaining: Optional[Dict[str, int]] = None
    message: Optional[str] = None


# ============================================================================
# AI Keys Vault Schemas
# ============================================================================

class AIKeyCreate(BaseModel):
    """Schema for adding an AI provider key"""
    provider: AIProvider
    key_name: str = Field(..., min_length=1, max_length=100)
    api_key: str = Field(..., min_length=1)
    description: Optional[str] = Field(None, max_length=500)
    metadata: Optional[Dict[str, Any]] = None


class AIKeyInfo(BaseModel):
    """AI key info (without actual key value)"""
    key_id: str
    provider: AIProvider
    key_name: str
    description: Optional[str] = None
    status: str  # "active", "invalid", "expired"
    created_at: datetime
    created_by: str
    last_tested_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class AIKeyTestResponse(BaseModel):
    """Response from testing an AI key"""
    valid: bool
    provider: AIProvider
    message: str
    tested_at: datetime
    error: Optional[str] = None


# ============================================================================
# FinOps Schemas
# ============================================================================

class CostSummary(BaseModel):
    """Cost summary for a period"""
    period: str  # "2024-01", "2024-01-15", etc
    total_cost: float
    cost_by_service: Dict[str, float]
    cost_by_consumer: Dict[str, float]
    budget: Optional[float] = None
    budget_used_percent: Optional[float] = None
    forecast_month_end: Optional[float] = None


class UsageMetrics(BaseModel):
    """Usage metrics"""
    period: str
    total_requests: int
    requests_by_service: Dict[str, int]
    requests_by_consumer: Dict[str, int]
    average_latency_ms: float
    error_rate_percent: float


class CostOptimizationRecommendation(BaseModel):
    """AI-powered cost optimization recommendation"""
    recommendation_id: str
    title: str
    description: str
    potential_savings: float
    priority: str  # "high", "medium", "low"
    impact_description: str
    action_items: List[str]
    generated_at: datetime


class BudgetAlert(BaseModel):
    """Budget alert configuration"""
    alert_id: str
    name: str
    threshold_percent: float  # Alert when budget usage exceeds this %
    budget_amount: float
    notification_channels: List[str]  # ["email", "slack", etc]
    enabled: bool
    created_at: datetime


# ============================================================================
# Service Monitoring Schemas
# ============================================================================

class ServiceHealth(BaseModel):
    """Service health status"""
    service_id: str
    service_name: str
    status: str  # "healthy", "degraded", "down"
    uptime_percent: float
    last_check_at: datetime
    response_time_ms: Optional[float] = None
    error_message: Optional[str] = None


class ServiceMetrics(BaseModel):
    """Service metrics"""
    service_id: str
    period: str
    total_requests: int
    error_rate_percent: float
    latency_p50_ms: float
    latency_p95_ms: float
    latency_p99_ms: float
    availability_percent: float


class ServiceInfo(BaseModel):
    """Service information"""
    service_id: str
    service_name: str
    description: str
    url: str
    port: int
    version: str
    status: str
    health: ServiceHealth
    metrics: Optional[ServiceMetrics] = None


# ============================================================================
# Audit Log Schemas
# ============================================================================

class AuditLogEntry(BaseModel):
    """Audit log entry"""
    log_id: str
    timestamp: datetime
    user_id: str
    user_email: str
    action: ActionType
    resource_type: str  # "user", "api_key", "ai_key", etc
    resource_id: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str  # "success", "failure"
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class AuditLogQuery(BaseModel):
    """Query parameters for audit logs"""
    user_id: Optional[str] = None
    action: Optional[ActionType] = None
    resource_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(100, ge=1, le=1000)
    offset: int = Field(0, ge=0)


class AuditLogExportRequest(BaseModel):
    """Request to export audit logs"""
    query: AuditLogQuery
    format: str = Field("csv", pattern="^(csv|json|pdf)$")


# ============================================================================
# Chat with Gemini Schemas
# ============================================================================

class ChatMessage(BaseModel):
    """Chat message"""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1)
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Request to chat with Gemini for admin operations"""
    message: str = Field(..., min_length=1, max_length=5000)
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Response from Gemini chat"""
    message: str
    actions_performed: Optional[List[Dict[str, Any]]] = None
    suggestions: Optional[List[str]] = None
    session_id: str
    timestamp: datetime


class ChatHistory(BaseModel):
    """Chat history"""
    session_id: str
    messages: List[ChatMessage]
    started_at: datetime
    last_message_at: datetime


# ============================================================================
# Health and Status Schemas
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    timestamp: datetime
    dependencies: Optional[Dict[str, str]] = None


# ============================================================================
# Generic Response Schemas
# ============================================================================

class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
