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

# ============================================================================
# Multi-Tenancy & SaaS Schemas
# ============================================================================

class SubscriptionPlan(str, Enum):
    """Subscription plan tiers"""
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"


class SubscriptionStatus(str, Enum):
    """Subscription status"""
    TRIAL = "trial"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    SUSPENDED = "suspended"


class TenantStatus(str, Enum):
    """Tenant status"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELED = "canceled"


# ============================================================================
# Tenant Management Schemas
# ============================================================================

class TenantCreate(BaseModel):
    """Schema for creating a tenant (organization)"""
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=3, max_length=50, pattern="^[a-z0-9-]+$")
    email: EmailStr
    plan: SubscriptionPlan = SubscriptionPlan.STARTER
    metadata: Optional[Dict[str, Any]] = None


class TenantResponse(BaseModel):
    """Schema for tenant response"""
    tenant_id: str
    name: str
    slug: str
    email: str
    status: TenantStatus
    plan: SubscriptionPlan
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class TenantUpdate(BaseModel):
    """Schema for updating tenant"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[EmailStr] = None
    status: Optional[TenantStatus] = None
    metadata: Optional[Dict[str, Any]] = None


class TenantSettings(BaseModel):
    """Tenant-specific settings"""
    tenant_id: str
    allowed_domains: List[str] = Field(default_factory=list)
    max_api_keys: int = 1
    max_team_members: int = 3
    max_documents_per_month: int = 50
    max_api_calls_per_month: int = 1000
    enabled_frameworks: List[str] = Field(default_factory=lambda: ["lgpd", "iso_27001", "hipaa"])
    integrations: Dict[str, bool] = Field(default_factory=lambda: {
        "google_drive": True,
        "sharepoint": False,
        "slack": False,
        "notebooklm": False
    })
    custom_branding: Optional[Dict[str, Any]] = None


# ============================================================================
# Subscription & Billing Schemas
# ============================================================================

class SubscriptionCreate(BaseModel):
    """Schema for creating a subscription"""
    tenant_id: str
    plan: SubscriptionPlan
    billing_cycle: str = Field("monthly", pattern="^(monthly|annual)$")
    payment_method_id: Optional[str] = None


class SubscriptionResponse(BaseModel):
    """Schema for subscription response"""
    subscription_id: str
    tenant_id: str
    plan: SubscriptionPlan
    status: SubscriptionStatus
    billing_cycle: str
    current_period_start: datetime
    current_period_end: datetime
    trial_end: Optional[datetime] = None
    cancel_at: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlanLimits(BaseModel):
    """Plan limits and features"""
    plan: SubscriptionPlan
    price_monthly: float
    price_annual: float
    max_documents_per_month: int
    max_api_calls_per_month: int
    max_api_keys: int
    max_team_members: int
    frameworks_included: List[str]
    chat_messages_per_month: int
    support_level: str
    features: Dict[str, bool] = Field(default_factory=dict)


# Default plan limits
PLAN_LIMITS = {
    SubscriptionPlan.STARTER: PlanLimits(
        plan=SubscriptionPlan.STARTER,
        price_monthly=99.0,
        price_annual=990.0,  # 2 months free
        max_documents_per_month=50,
        max_api_calls_per_month=1000,
        max_api_keys=1,
        max_team_members=3,
        frameworks_included=["lgpd", "iso_27001", "hipaa"],
        chat_messages_per_month=100,
        support_level="email",
        features={
            "google_drive": True,
            "sharepoint": False,
            "audit_logs": True,
            "custom_branding": False,
            "api_access": True,
            "priority_support": False
        }
    ),
    SubscriptionPlan.PROFESSIONAL: PlanLimits(
        plan=SubscriptionPlan.PROFESSIONAL,
        price_monthly=299.0,
        price_annual=2990.0,
        max_documents_per_month=200,
        max_api_calls_per_month=5000,
        max_api_keys=5,
        max_team_members=10,
        frameworks_included=[
            "lgpd", "gdpr", "iso_27001", "iso_27701", "hipaa",
            "fda_510k", "iso_13485", "soc2", "pci_dss", "cis_v8"
        ],
        chat_messages_per_month=500,
        support_level="email_chat",
        features={
            "google_drive": True,
            "sharepoint": True,
            "audit_logs": True,
            "custom_branding": False,
            "api_access": True,
            "priority_support": True,
            "notebooklm": True
        }
    ),
    SubscriptionPlan.ENTERPRISE: PlanLimits(
        plan=SubscriptionPlan.ENTERPRISE,
        price_monthly=999.0,
        price_annual=9990.0,
        max_documents_per_month=-1,  # Unlimited
        max_api_calls_per_month=50000,
        max_api_keys=-1,  # Unlimited
        max_team_members=-1,  # Unlimited
        frameworks_included=["all"],  # All frameworks
        chat_messages_per_month=-1,  # Unlimited
        support_level="dedicated",
        features={
            "google_drive": True,
            "sharepoint": True,
            "audit_logs": True,
            "custom_branding": True,
            "api_access": True,
            "priority_support": True,
            "notebooklm": True,
            "white_label": True,
            "sla": True,
            "dedicated_instance": False
        }
    )
}


class UsageMetricsResponse(BaseModel):
    """Current usage metrics for a tenant"""
    tenant_id: str
    period_start: datetime
    period_end: datetime
    documents_generated: int
    api_calls_made: int
    chat_messages_sent: int
    storage_used_mb: float
    limits: PlanLimits
    usage_percent: Dict[str, float] = Field(default_factory=dict)


class BillingInvoice(BaseModel):
    """Billing invoice"""
    invoice_id: str
    tenant_id: str
    subscription_id: str
    amount: float
    currency: str = "USD"
    status: str  # "draft", "open", "paid", "void"
    period_start: datetime
    period_end: datetime
    due_date: datetime
    paid_at: Optional[datetime] = None
    invoice_pdf_url: Optional[str] = None
    created_at: datetime


# ============================================================================
# Client Portal Schemas (Self-Service)
# ============================================================================

class ClientAPIKeyCreate(BaseModel):
    """Schema for client creating their own API key"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class ClientSecretCreate(BaseModel):
    """Schema for client configuring integration secrets"""
    integration_type: str = Field(..., pattern="^(google_cloud|aws|azure|github)$")
    secret_name: str = Field(..., min_length=1, max_length=100)
    secret_value: str = Field(..., min_length=1)
    description: Optional[str] = None


class ClientIntegrationConfig(BaseModel):
    """Schema for configuring integrations"""
    integration_type: str = Field(..., pattern="^(google_drive|sharepoint|slack|notebooklm)$")
    enabled: bool
    config: Dict[str, Any]  # Integration-specific config


class ClientComplianceStatus(BaseModel):
    """Compliance status dashboard for client"""
    tenant_id: str
    framework: str
    status: str  # "compliant", "partial", "non_compliant", "not_started"
    completion_percent: float
    controls_total: int
    controls_implemented: int
    documents_generated: int
    last_updated: datetime
    next_actions: List[str] = Field(default_factory=list)


# ============================================================================
# Integration Schemas (Google Drive, SharePoint, etc)
# ============================================================================

class GoogleDriveConfig(BaseModel):
    """Google Drive integration configuration"""
    enabled: bool = True
    folder_id: Optional[str] = None
    folder_name: str = "ComplianceEngine Documents"
    auto_upload: bool = False
    share_with_emails: List[str] = Field(default_factory=list)


class SharePointConfig(BaseModel):
    """SharePoint integration configuration"""
    enabled: bool = False
    site_id: Optional[str] = None
    library_name: str = "Compliance Documents"
    tenant_id: Optional[str] = None
    auto_upload: bool = False


class SlackConfig(BaseModel):
    """Slack integration configuration"""
    enabled: bool = False
    webhook_url: Optional[str] = None
    channel: str = "#compliance"
    notify_on: List[str] = Field(default_factory=lambda: ["document_generated", "compliance_issue"])


class NotebookLMConfig(BaseModel):
    """NotebookLM integration configuration"""
    enabled: bool = False
    auto_create_notebooks: bool = False
    notebook_title_template: str = "Compliance - {framework} - {date}"
