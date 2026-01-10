"""
Compliance API schemas.

Pydantic models for compliance audit operations.
"""

from pydantic import BaseModel, Field


class Finding(BaseModel):
    """A single compliance finding."""
    
    type: str = Field(..., description="conformity or gap")
    description: str = Field(..., description="Finding description")
    severity: str | None = Field(None, description="low | medium | high | critical")
    reference: str | None = Field(None, description="Legal reference (e.g., Art. 5 LGPD)")
    recommendation: str | None = Field(None, description="Recommended action")


class AuditRequest(BaseModel):
    """Request to audit content for compliance."""
    
    content: str = Field(
        ...,
        description="Text, process description, or document to audit",
        min_length=20,
        max_length=50000,
    )
    frameworks: list[str] | None = Field(
        default=None,
        description="Legal frameworks to check (e.g., LGPD, SOX, GDPR)",
        examples=[["LGPD"], ["LGPD", "Marco Civil"]],
    )


class AuditResponse(BaseModel):
    """Response from compliance audit."""
    
    audit_id: str = Field(..., description="Unique audit ID")
    compliance_score: int = Field(..., ge=0, le=100, description="Score 0-100")
    status: str = Field(..., description="compliant | partially_compliant | non_compliant")
    findings: list[Finding] = Field(default_factory=list, description="Audit findings")
    summary: str = Field(..., description="Executive summary")
    frameworks: list[str] = Field(default_factory=list, description="Frameworks analyzed")
    context_chunks_used: int = Field(..., description="Number of legal context chunks used")
    created_at: str = Field(..., description="ISO timestamp")
