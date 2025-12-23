"""
Compliance dashboard schemas for ComplianceEngine.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Dashboard Schemas
# ============================================================================

class ComplianceTrend(BaseModel):
    """Compliance trend over time."""
    
    date: datetime
    score: float = Field(..., ge=0.0, le=100.0, description="Compliance score (0-100)")
    process_count: int = Field(..., ge=0, description="Number of processes analyzed")
    compliant_count: int = Field(..., ge=0, description="Number of compliant processes")
    non_compliant_count: int = Field(..., ge=0, description="Number of non-compliant processes")


class ComplianceAlert(BaseModel):
    """Compliance alert."""
    
    id: str
    process_id: str
    process_name: str
    domain: str
    severity: str = Field(
        ...,
        description="Alert severity: 'critical', 'high', 'medium', 'low'"
    )
    message: str
    score: float = Field(..., ge=0.0, le=100.0)
    created_at: datetime


class DomainComplianceStats(BaseModel):
    """Compliance statistics for a domain."""
    
    domain: str
    total_processes: int
    compliant_processes: int
    non_compliant_processes: int
    average_score: float = Field(..., ge=0.0, le=100.0)
    min_score: float = Field(..., ge=0.0, le=100.0)
    max_score: float = Field(..., ge=0.0, le=100.0)
    trends: List[ComplianceTrend] = Field(
        default_factory=list,
        description="Trends over last 12 months"
    )
    alerts: List[ComplianceAlert] = Field(
        default_factory=list,
        description="Recent alerts"
    )


class ComplianceDashboard(BaseModel):
    """Overall compliance dashboard."""
    
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall compliance score")
    total_processes: int
    compliant_processes: int
    non_compliant_processes: int
    domains: List[DomainComplianceStats] = Field(
        ...,
        description="Statistics by domain"
    )
    recent_alerts: List[ComplianceAlert] = Field(
        default_factory=list,
        description="Recent compliance alerts"
    )
    trends: List[ComplianceTrend] = Field(
        default_factory=list,
        description="Overall trends over last 12 months"
    )
    generated_at: datetime


class DomainDashboardRequest(BaseModel):
    """Request for domain-specific dashboard."""
    
    domain: str = Field(..., description="Regulatory domain (e.g., 'LGPD', 'GDPR', 'SOX')")
    months: int = Field(
        12,
        ge=1,
        le=24,
        description="Number of months for trends (1-24)"
    )


class ProcessComplianceStatus(BaseModel):
    """Compliance status of a single process."""
    
    process_id: str
    process_name: str
    domain: str
    current_score: float = Field(..., ge=0.0, le=100.0)
    status: str = Field(
        ...,
        description="Status: 'compliant', 'non_compliant', 'needs_review'"
    )
    last_analyzed_at: Optional[datetime]
    gaps_count: int = 0
    suggestions_count: int = 0

