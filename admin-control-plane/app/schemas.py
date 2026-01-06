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
# Shared Schemas
# ============================================================================

class AllowedStandards(BaseModel):
    """Standards allowed for an API key (marketplace + custom)"""
    marketplace: List[str] = Field(default_factory=list, description="IDs de standards do marketplace (e.g., ['lgpd_br', 'iso27001'])")
    custom: List[str] = Field(default_factory=list, description="IDs de standards customizados do cliente")


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
    allowed_standards: Optional[AllowedStandards] = Field(default=None, description="Standards permitidos (marketplace + custom). None = todos os standards")
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
    allowed_standards: Optional[AllowedStandards] = None
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
    allowed_standards: Optional[AllowedStandards] = None
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
    client_id: Optional[str] = None
    permissions: Optional[List[str]] = None
    allowed_standards: Optional[AllowedStandards] = None
    quota_remaining: Optional[Dict[str, int]] = None
    message: Optional[str] = None


class StandardsUpdateRequest(BaseModel):
    """Request to update allowed standards for an API key"""
    standards: AllowedStandards = Field(..., description="Standards permitidos (marketplace + custom)")


class StandardsResponse(BaseModel):
    """Response with standards information"""
    key_id: str
    allowed_standards: Optional[AllowedStandards] = None
    message: str


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
# Standards Management Schemas
# ============================================================================

class StandardType(str, Enum):
    """Type of standard"""
    MARKETPLACE = "marketplace"  # Global/public standard
    CUSTOM = "custom"            # Client-specific standard


class StandardStatus(str, Enum):
    """Status of standard vectorization"""
    PENDING = "pending"          # Awaiting ingestion
    PROCESSING = "processing"    # Being vectorized
    COMPLETED = "completed"      # Ready to use
    FAILED = "failed"           # Ingestion failed


class StandardSourceType(str, Enum):
    """Source type for ingestion"""
    FILE = "file"               # PDF, TXT, DOCX upload
    URL = "url"                 # Web scraping
    TEXT = "text"               # Direct text input


class StandardMarketplaceInfo(BaseModel):
    """Information about a marketplace standard"""
    standard_id: str
    name: str
    description: str
    category: str  # "legal", "security", "quality", etc
    jurisdiction: Optional[str] = None  # "BR", "EU", "US", etc
    version: Optional[str] = None
    total_chunks: int
    last_updated: datetime
    official_url: Optional[str] = None
    is_active: bool = True


class StandardCustomCreate(BaseModel):
    """Request to create a custom standard"""
    name: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    source_type: StandardSourceType
    source: str = Field(..., description="File path, URL, or raw text depending on source_type")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class StandardCustomInfo(BaseModel):
    """Information about a custom standard"""
    standard_id: str
    client_id: str
    name: str
    description: str
    source_type: StandardSourceType
    status: StandardStatus
    total_chunks: Optional[int] = None
    created_at: datetime
    created_by: str
    updated_at: datetime
    processing_progress: Optional[float] = None  # 0-100
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class StandardCustomUpdate(BaseModel):
    """Update a custom standard"""
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    metadata: Optional[Dict[str, Any]] = None


class StandardIngestRequest(BaseModel):
    """Request to ingest/re-ingest a standard"""
    source_type: StandardSourceType
    source: str
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class StandardIngestResponse(BaseModel):
    """Response from ingestion"""
    standard_id: str
    status: StandardStatus
    message: str
    chunks_generated: Optional[int] = None
    processing_progress: Optional[float] = None


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
    folder_name: str = "n.process Documents"
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


# ============================================================================
# Knowledge Base Marketplace Schemas
# ============================================================================

class KBStatus(str, Enum):
    """Knowledge Base status"""
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class KBUpdateFrequency(str, Enum):
    """KB update frequency"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    ON_DEMAND = "on_demand"


class KBCategory(str, Enum):
    """Knowledge Base categories"""
    LGPD = "lgpd"
    GDPR = "gdpr"
    SOX = "sox"
    ISO_27001 = "iso_27001"
    ISO_27701 = "iso_27701"
    HIPAA = "hipaa"
    ANEEL = "aneel"
    CVM = "cvm"
    BACEN = "bacen"
    CUSTOM = "custom"


class KBCreate(BaseModel):
    """Schema for creating a Knowledge Base"""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    category: KBCategory
    price_monthly_cents: int = Field(..., ge=0)  # Price in cents (0 = free)
    update_frequency: KBUpdateFrequency = KBUpdateFrequency.WEEKLY
    tags: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class KBUpdate(BaseModel):
    """Schema for updating a Knowledge Base"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    price_monthly_cents: Optional[int] = Field(None, ge=0)
    status: Optional[KBStatus] = None
    update_frequency: Optional[KBUpdateFrequency] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class KBResponse(BaseModel):
    """Schema for Knowledge Base response"""
    kb_id: str
    name: str
    description: str
    category: KBCategory
    status: KBStatus
    price_monthly_cents: int
    update_frequency: KBUpdateFrequency
    document_count: int = 0
    chunk_count: int = 0
    last_updated_at: Optional[datetime] = None
    created_at: datetime
    created_by: str
    tags: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class KBMarketplaceItem(BaseModel):
    """KB item for marketplace listing (public view)"""
    kb_id: str
    name: str
    description: str
    category: KBCategory
    price_monthly_cents: int
    update_frequency: KBUpdateFrequency
    document_count: int
    last_updated_at: Optional[datetime]
    tags: List[str]
    is_subscribed: bool = False  # Populated based on current user


class KBIngestRequest(BaseModel):
    """Request to ingest documents into a Knowledge Base"""
    kb_id: str
    documents: List[Dict[str, Any]]  # List of {content, source, metadata}
    replace_existing: bool = False  # If true, clears existing docs first


class KBIngestResponse(BaseModel):
    """Response from KB ingestion"""
    kb_id: str
    documents_ingested: int
    chunks_created: int
    processing_time_ms: float
    errors: List[str] = Field(default_factory=list)


# ============================================================================
# KB Subscription Schemas
# ============================================================================

class KBSubscriptionStatus(str, Enum):
    """KB Subscription status"""
    ACTIVE = "active"
    CANCELED = "canceled"
    EXPIRED = "expired"


class KBSubscriptionCreate(BaseModel):
    """Schema for subscribing to a Knowledge Base"""
    kb_id: str


class KBSubscriptionResponse(BaseModel):
    """Schema for KB subscription response"""
    subscription_id: str
    kb_id: str
    kb_name: str
    tenant_id: str
    status: KBSubscriptionStatus
    price_monthly_cents: int
    started_at: datetime
    expires_at: datetime
    canceled_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class KBSubscriptionList(BaseModel):
    """List of KB subscriptions for a tenant"""
    subscriptions: List[KBSubscriptionResponse]
    total_monthly_cost_cents: int


# ============================================================================
# KB Search Schemas (with subscription filtering)
# ============================================================================

class KBSearchRequest(BaseModel):
    """Request to search across subscribed Knowledge Bases"""
    query: str = Field(..., min_length=1, max_length=1000)
    kb_ids: Optional[List[str]] = None  # If None, searches all subscribed
    top_k: int = Field(5, ge=1, le=20)
    include_metadata: bool = True


class KBSearchResult(BaseModel):
    """Single search result"""
    content: str
    source: str
    kb_id: str
    kb_name: str
    score: float
    metadata: Optional[Dict[str, Any]] = None


class KBSearchResponse(BaseModel):
    """Response from KB search"""
    query: str
    results: List[KBSearchResult]
    kb_searched: List[str]
    processing_time_ms: float

