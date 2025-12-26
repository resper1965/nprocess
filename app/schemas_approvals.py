"""
Process approval workflow schemas for n.process.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Approval Workflow Schemas
# ============================================================================

class ApprovalStage(BaseModel):
    """Approval stage definition."""
    
    stage_number: int = Field(..., ge=1, description="Stage number (1, 2, 3, ...)")
    approvers: List[str] = Field(
        ...,
        min_items=1,
        description="List of approver IDs (user emails or roles)"
    )
    required_approvals: int = Field(
        ...,
        ge=1,
        description="Number of approvals required to pass this stage"
    )
    timeout_hours: Optional[int] = Field(
        None,
        ge=1,
        description="Timeout in hours (escalation if not approved)"
    )


class ApprovalWorkflowCreate(BaseModel):
    """Request to create an approval workflow."""
    
    process_id: str = Field(..., description="Process ID to submit for approval")
    workflow_type: str = Field(
        "single",
        description="Workflow type: 'single', 'multi-stage', 'parallel'"
    )
    stages: List[ApprovalStage] = Field(
        ...,
        min_items=1,
        description="List of approval stages"
    )
    auto_approve: bool = Field(
        False,
        description="Auto-approve if all required approvers approve"
    )


class Approval(BaseModel):
    """Individual approval record."""
    
    approver_id: str
    approved: bool
    comments: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None


class ApprovalStageStatus(BaseModel):
    """Status of an approval stage."""
    
    stage_number: int
    approvers: List[str]
    required_approvals: int
    approvals: List[Approval]
    status: str = Field(
        ...,
        description="Status: 'pending', 'approved', 'rejected', 'timeout'"
    )
    completed_at: Optional[datetime] = None


class ApprovalWorkflow(BaseModel):
    """Approval workflow information."""
    
    id: str
    process_id: str
    workflow_type: str
    stages: List[ApprovalStage]
    current_stage: int
    status: str = Field(
        ...,
        description="Overall status: 'pending', 'approved', 'rejected', 'cancelled'"
    )
    submitted_by: str
    submitted_at: datetime
    completed_at: Optional[datetime] = None
    stage_statuses: List[ApprovalStageStatus] = Field(
        default_factory=list,
        description="Status of each stage"
    )


class ApprovalWorkflowList(BaseModel):
    """List of approval workflows."""
    
    workflows: List[ApprovalWorkflow]
    total: int
    page: int = 1
    page_size: int = 50


class ApprovalAction(BaseModel):
    """Request to approve or reject."""
    
    approved: bool = Field(..., description="True to approve, False to reject")
    comments: Optional[str] = Field(
        None,
        max_length=1000,
        description="Comments about the approval/rejection"
    )


class ApprovalHistory(BaseModel):
    """Approval history entry."""
    
    workflow_id: str
    stage_number: int
    approver_id: str
    action: str = Field(..., description="'approved' or 'rejected'")
    comments: Optional[str]
    timestamp: datetime


class ApprovalHistoryList(BaseModel):
    """List of approval history entries."""
    
    history: List[ApprovalHistory]
    total: int

