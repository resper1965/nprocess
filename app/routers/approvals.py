"""
Process approval workflow endpoints for n.process.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_approvals import (
    ApprovalWorkflowCreate,
    ApprovalWorkflow,
    ApprovalWorkflowList,
    ApprovalAction,
    ApprovalHistoryList,
)
from app.services.approval_service import get_approval_service
from app.middleware.auth import validate_api_key


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/processes", tags=["Approval Workflows"])


# ============================================================================
# Approval Endpoints
# ============================================================================

@router.post(
    "/{process_id}/submit",
    response_model=ApprovalWorkflow,
    status_code=status.HTTP_201_CREATED,
    summary="Submit process for approval",
    description="Submit a process for approval workflow"
)
async def submit_for_approval(
    process_id: str,
    request: ApprovalWorkflowCreate,
    api_key = Depends(validate_api_key)
):
    """
    Submit a process for approval.
    
    Args:
        process_id: Process ID
        request: Approval workflow creation request
        api_key: Validated API key (optional)
        
    Returns:
        ApprovalWorkflow
    """
    try:
        approval_service = get_approval_service()
        
        submitted_by = api_key.key_id if api_key else "anonymous"
        
        # Override process_id in request
        request.process_id = process_id
        
        workflow = await approval_service.submit_for_approval(
            process_id=process_id,
            request=request,
            submitted_by=submitted_by
        )
        
        return workflow
        
    except ValueError as e:
        logger.error(f"Validation error submitting for approval: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error submitting for approval: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit for approval"
        )


@router.get(
    "/{process_id}/approval",
    response_model=ApprovalWorkflow,
    summary="Get approval status",
    description="Get approval workflow status for a process"
)
async def get_approval_status(
    process_id: str,
    api_key = Depends(validate_api_key)
):
    """
    Get approval status for a process.
    
    Args:
        process_id: Process ID
        api_key: Validated API key (optional)
        
    Returns:
        ApprovalWorkflow
    """
    try:
        approval_service = get_approval_service()
        
        workflow = await approval_service.get_workflow_by_process(process_id)
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No approval workflow found for process {process_id}"
            )
        
        return workflow
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting approval status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get approval status"
        )


@router.post(
    "/{process_id}/approve",
    response_model=ApprovalWorkflow,
    status_code=status.HTTP_200_OK,
    summary="Approve or reject process",
    description="Approve or reject a process at current approval stage"
)
async def approve_process(
    process_id: str,
    request: ApprovalAction,
    api_key = Depends(validate_api_key)
):
    """
    Approve or reject a process.
    
    Args:
        process_id: Process ID
        request: Approval action
        api_key: Validated API key (required - used as approver_id)
        
    Returns:
        Updated ApprovalWorkflow
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to approve/reject"
            )
        
        approval_service = get_approval_service()
        
        # Get workflow
        workflow = await approval_service.get_workflow_by_process(process_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No approval workflow found for process {process_id}"
            )
        
        # Approve/reject
        updated_workflow = await approval_service.approve(
            workflow_id=workflow.id,
            approver_id=api_key.key_id,
            request=request
        )
        
        return updated_workflow
        
    except ValueError as e:
        logger.error(f"Validation error approving process: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving process: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve/reject process"
        )


@router.get(
    "/approvals/pending",
    response_model=ApprovalWorkflowList,
    summary="List pending approvals",
    description="List all pending approvals for the authenticated approver"
)
async def list_pending_approvals(
    limit: int = 50,
    api_key = Depends(validate_api_key)
):
    """
    List pending approvals.
    
    Args:
        limit: Maximum number of results
        api_key: Validated API key (required - used as approver_id)
        
    Returns:
        ApprovalWorkflowList
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to list pending approvals"
            )
        
        approval_service = get_approval_service()
        
        workflows = await approval_service.list_pending_approvals(
            approver_id=api_key.key_id,
            limit=limit
        )
        
        return ApprovalWorkflowList(
            workflows=workflows,
            total=len(workflows),
            page=1,
            page_size=limit
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing pending approvals: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list pending approvals"
        )


@router.get(
    "/approvals/history",
    response_model=ApprovalHistoryList,
    summary="List approval history",
    description="List approval history (optionally filtered by process or workflow)"
)
async def list_approval_history(
    workflow_id: Optional[str] = None,
    process_id: Optional[str] = None,
    limit: int = 50,
    api_key = Depends(validate_api_key)
):
    """
    List approval history.
    
    Args:
        workflow_id: Filter by workflow ID
        process_id: Filter by process ID
        limit: Maximum number of results
        api_key: Validated API key (optional)
        
    Returns:
        ApprovalHistoryList
    """
    try:
        approval_service = get_approval_service()
        
        history = await approval_service.list_approval_history(
            workflow_id=workflow_id,
            process_id=process_id,
            limit=limit
        )
        
        return ApprovalHistoryList(
            history=history,
            total=len(history)
        )
        
    except Exception as e:
        logger.error(f"Error listing approval history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list approval history"
        )


@router.post(
    "/{process_id}/approval/cancel",
    status_code=status.HTTP_200_OK,
    summary="Cancel approval workflow",
    description="Cancel an approval workflow (only if pending)"
)
async def cancel_approval(
    process_id: str,
    api_key = Depends(validate_api_key)
):
    """
    Cancel an approval workflow.
    
    Args:
        process_id: Process ID
        api_key: Validated API key (required)
        
    Returns:
        Success message
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to cancel approval"
            )
        
        approval_service = get_approval_service()
        
        # Get workflow
        workflow = await approval_service.get_workflow_by_process(process_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No approval workflow found for process {process_id}"
            )
        
        # Cancel workflow
        success = await approval_service.cancel_workflow(
            workflow_id=workflow.id,
            cancelled_by=api_key.key_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel approval workflow"
            )
        
        return {
            "message": "Approval workflow cancelled successfully",
            "workflow_id": workflow.id,
            "process_id": process_id
        }
        
    except ValueError as e:
        logger.error(f"Validation error cancelling approval: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling approval: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel approval workflow"
        )

