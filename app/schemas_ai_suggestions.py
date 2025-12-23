"""
AI improvement suggestions schemas for ComplianceEngine.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# AI Suggestion Schemas
# ============================================================================

class ImprovementSuggestion(BaseModel):
    """AI-generated improvement suggestion."""
    
    suggestion_id: str
    type: str = Field(
        ...,
        description="Suggestion type: 'process_optimization', 'compliance_enhancement', 'risk_reduction', 'efficiency_gain'"
    )
    title: str
    description: str
    priority: str = Field(
        ...,
        description="Priority: 'high', 'medium', 'low'"
    )
    impact_score: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Impact score (0-10)"
    )
    effort_estimate: str = Field(
        ...,
        description="Estimated effort: 'low', 'medium', 'high'"
    )
    affected_nodes: List[str] = Field(
        default_factory=list,
        description="Process node IDs affected by this suggestion"
    )
    related_gaps: List[str] = Field(
        default_factory=list,
        description="Related compliance gap IDs"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="AI confidence score (0-1)"
    )


class ProcessImprovementRequest(BaseModel):
    """Request for AI improvement suggestions."""
    
    process_id: str = Field(..., description="Process ID to analyze")
    focus_areas: Optional[List[str]] = Field(
        None,
        description="Focus areas: 'compliance', 'efficiency', 'risk', 'cost'"
    )
    include_comparison: bool = Field(
        False,
        description="Include comparison with similar processes"
    )


class ProcessImprovementResponse(BaseModel):
    """Response with AI improvement suggestions."""
    
    process_id: str
    suggestions: List[ImprovementSuggestion]
    overall_score: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Overall improvement potential score"
    )
    generated_at: datetime
    analysis_summary: str = Field(
        ...,
        description="Summary of the analysis"
    )


class BulkImprovementRequest(BaseModel):
    """Request for bulk improvement analysis."""
    
    process_ids: List[str] = Field(
        ...,
        min_items=1,
        max_items=50,
        description="List of process IDs to analyze"
    )
    focus_areas: Optional[List[str]] = None


class BulkImprovementResponse(BaseModel):
    """Response for bulk improvement analysis."""
    
    results: List[ProcessImprovementResponse]
    total_analyzed: int
    generated_at: datetime

