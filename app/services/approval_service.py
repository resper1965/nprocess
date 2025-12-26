"""
Process approval workflow service for n.process.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from google.cloud import firestore

from app.schemas_approvals import (
    ApprovalWorkflowCreate,
    ApprovalWorkflow,
    ApprovalStage,
    ApprovalStageStatus,
    Approval,
    ApprovalAction,
    ApprovalHistory,
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

APPROVAL_WORKFLOWS_COLLECTION = "approval_workflows"
APPROVAL_HISTORY_COLLECTION = "approval_history"


# ============================================================================
# Approval Service
# ============================================================================

class ApprovalService:
    """Service for managing process approval workflows."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize approval service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("ApprovalService initialized")
        except Exception as e:
            logger.error(f"Error initializing ApprovalService: {e}")
            raise
    
    async def submit_for_approval(
        self,
        process_id: str,
        request: ApprovalWorkflowCreate,
        submitted_by: str
    ) -> ApprovalWorkflow:
        """
        Submit a process for approval.
        
        Args:
            process_id: Process ID
            request: Approval workflow creation request
            submitted_by: User/API key ID that submitted
            
        Returns:
            ApprovalWorkflow
        """
        try:
            # Verify process exists
            from app.services.db_service import get_db_service
            db_service = get_db_service()
            process_data = await db_service.get_process(process_id)
            if not process_data:
                raise ValueError(f"Process not found: {process_id}")
            
            # Validate workflow type
            if request.workflow_type not in ["single", "multi-stage", "parallel"]:
                raise ValueError(f"Invalid workflow type: {request.workflow_type}")
            
            # Prepare workflow data
            now = datetime.utcnow()
            workflow_data = {
                "process_id": process_id,
                "workflow_type": request.workflow_type,
                "stages": [s.model_dump() for s in request.stages],
                "current_stage": 1,
                "status": "pending",
                "submitted_by": submitted_by,
                "submitted_at": now,
                "completed_at": None,
                "auto_approve": request.auto_approve,
                "stage_statuses": [
                    {
                        "stage_number": s.stage_number,
                        "approvers": s.approvers,
                        "required_approvals": s.required_approvals,
                        "approvals": [],
                        "status": "pending" if s.stage_number == 1 else "waiting",
                        "completed_at": None,
                    }
                    for s in request.stages
                ],
            }
            
            # Store in Firestore
            doc_ref = self.db.collection(APPROVAL_WORKFLOWS_COLLECTION).document()
            doc_ref.set(workflow_data)
            
            workflow_id = doc_ref.id
            
            logger.info(f"Process {process_id} submitted for approval: {workflow_id}")
            
            return ApprovalWorkflow(
                id=workflow_id,
                process_id=process_id,
                workflow_type=request.workflow_type,
                stages=request.stages,
                current_stage=1,
                status="pending",
                submitted_by=submitted_by,
                submitted_at=now,
                completed_at=None,
                stage_statuses=[
                    ApprovalStageStatus(
                        stage_number=s.stage_number,
                        approvers=s.approvers,
                        required_approvals=s.required_approvals,
                        approvals=[],
                        status="pending" if s.stage_number == 1 else "waiting",
                        completed_at=None,
                    )
                    for s in request.stages
                ],
            )
            
        except Exception as e:
            logger.error(f"Error submitting for approval: {e}")
            raise
    
    async def get_workflow(self, workflow_id: str) -> Optional[ApprovalWorkflow]:
        """
        Get approval workflow by ID.
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            ApprovalWorkflow or None if not found
        """
        try:
            doc_ref = self.db.collection(APPROVAL_WORKFLOWS_COLLECTION).document(workflow_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            
            return self._dict_to_workflow(doc.id, data)
            
        except Exception as e:
            logger.error(f"Error getting workflow: {e}")
            raise
    
    async def get_workflow_by_process(self, process_id: str) -> Optional[ApprovalWorkflow]:
        """
        Get approval workflow for a process.
        
        Args:
            process_id: Process ID
            
        Returns:
            ApprovalWorkflow or None if not found
        """
        try:
            query = (
                self.db.collection(APPROVAL_WORKFLOWS_COLLECTION)
                .where("process_id", "==", process_id)
                .where("status", "in", ["pending", "approved", "rejected"])
                .order_by("submitted_at", direction=firestore.Query.DESCENDING)
                .limit(1)
            )
            
            docs = list(query.stream())
            
            if not docs:
                return None
            
            doc = docs[0]
            return self._dict_to_workflow(doc.id, doc.to_dict())
            
        except Exception as e:
            logger.error(f"Error getting workflow by process: {e}")
            raise
    
    async def approve(
        self,
        workflow_id: str,
        approver_id: str,
        request: ApprovalAction
    ) -> ApprovalWorkflow:
        """
        Approve or reject at current stage.
        
        Args:
            workflow_id: Workflow ID
            approver_id: Approver ID
            request: Approval action
            
        Returns:
            Updated ApprovalWorkflow
        """
        try:
            workflow = await self.get_workflow(workflow_id)
            if not workflow:
                raise ValueError(f"Workflow not found: {workflow_id}")
            
            if workflow.status != "pending":
                raise ValueError(f"Workflow is not pending (status: {workflow.status})")
            
            # Get current stage
            current_stage_status = next(
                (s for s in workflow.stage_statuses if s.stage_number == workflow.current_stage),
                None
            )
            
            if not current_stage_status:
                raise ValueError(f"Current stage {workflow.current_stage} not found")
            
            # Check if approver is authorized
            if approver_id not in current_stage_status.approvers:
                raise ValueError(f"Approver {approver_id} not authorized for this stage")
            
            # Check if already approved/rejected by this approver
            existing_approval = next(
                (a for a in current_stage_status.approvals if a.approver_id == approver_id),
                None
            )
            
            if existing_approval:
                raise ValueError(f"Approver {approver_id} has already voted")
            
            # Add approval/rejection
            now = datetime.utcnow()
            approval = Approval(
                approver_id=approver_id,
                approved=request.approved,
                comments=request.comments,
                approved_at=now if request.approved else None,
                rejected_at=now if not request.approved else None,
            )
            
            # Update workflow
            doc_ref = self.db.collection(APPROVAL_WORKFLOWS_COLLECTION).document(workflow_id)
            
            # Get current stage status from Firestore
            workflow_doc = doc_ref.get()
            workflow_data = workflow_doc.to_dict()
            stage_statuses = workflow_data.get("stage_statuses", [])
            
            # Find and update current stage
            current_stage_idx = workflow.current_stage - 1
            if current_stage_idx < len(stage_statuses):
                stage_status = stage_statuses[current_stage_idx]
                approvals = stage_status.get("approvals", [])
                approvals.append(approval.model_dump())
                stage_status["approvals"] = approvals
                
                # Check if stage is complete
                approved_count = sum(1 for a in approvals if a.get("approved", False))
                rejected_count = sum(1 for a in approvals if not a.get("approved", True))
                
                if request.approved:
                    if approved_count >= current_stage_status.required_approvals:
                        # Stage approved, move to next or complete
                        stage_status["status"] = "approved"
                        stage_status["completed_at"] = now
                        
                        if workflow.current_stage < len(workflow.stages):
                            # Move to next stage
                            next_stage_idx = workflow.current_stage
                            if next_stage_idx < len(stage_statuses):
                                stage_statuses[next_stage_idx]["status"] = "pending"
                            
                            workflow_data["current_stage"] = workflow.current_stage + 1
                        else:
                            # All stages approved
                            workflow_data["status"] = "approved"
                            workflow_data["completed_at"] = now
                    else:
                        # Still need more approvals
                        pass
                else:
                    # Rejected
                    stage_status["status"] = "rejected"
                    stage_status["completed_at"] = now
                    workflow_data["status"] = "rejected"
                    workflow_data["completed_at"] = now
                
                workflow_data["stage_statuses"] = stage_statuses
                doc_ref.update(workflow_data)
                
                # Record in history
                await self._record_history(
                    workflow_id=workflow_id,
                    stage_number=workflow.current_stage,
                    approver_id=approver_id,
                    action="approved" if request.approved else "rejected",
                    comments=request.comments
                )
                
                # Get updated workflow
                updated_workflow = await self.get_workflow(workflow_id)
                return updated_workflow
            else:
                raise ValueError(f"Stage {workflow.current_stage} not found in workflow")
                
        except Exception as e:
            logger.error(f"Error processing approval: {e}")
            raise
    
    async def list_pending_approvals(
        self,
        approver_id: str,
        limit: int = 50
    ) -> List[ApprovalWorkflow]:
        """
        List pending approvals for an approver.
        
        Args:
            approver_id: Approver ID
            limit: Maximum number of results
            
        Returns:
            List of ApprovalWorkflow
        """
        try:
            # Get all pending workflows
            query = (
                self.db.collection(APPROVAL_WORKFLOWS_COLLECTION)
                .where("status", "==", "pending")
                .order_by("submitted_at", direction=firestore.Query.DESCENDING)
                .limit(limit * 2)  # Get more to filter
            )
            
            docs = query.stream()
            
            workflows = []
            for doc in docs:
                data = doc.to_dict()
                workflow = self._dict_to_workflow(doc.id, data)
                
                # Check if approver is in current stage
                current_stage_status = next(
                    (s for s in workflow.stage_statuses 
                     if s.stage_number == workflow.current_stage),
                    None
                )
                
                if current_stage_status and approver_id in current_stage_status.approvers:
                    # Check if not already voted
                    has_voted = any(
                        a.approver_id == approver_id 
                        for a in current_stage_status.approvals
                    )
                    
                    if not has_voted:
                        workflows.append(workflow)
                
                if len(workflows) >= limit:
                    break
            
            logger.info(f"Found {len(workflows)} pending approvals for {approver_id}")
            return workflows
            
        except Exception as e:
            logger.error(f"Error listing pending approvals: {e}")
            raise
    
    async def list_approval_history(
        self,
        workflow_id: Optional[str] = None,
        process_id: Optional[str] = None,
        limit: int = 50
    ) -> List[ApprovalHistory]:
        """
        List approval history.
        
        Args:
            workflow_id: Filter by workflow ID
            process_id: Filter by process ID
            limit: Maximum number of results
            
        Returns:
            List of ApprovalHistory
        """
        try:
            query = self.db.collection(APPROVAL_HISTORY_COLLECTION)
            
            if workflow_id:
                query = query.where("workflow_id", "==", workflow_id)
            elif process_id:
                # Get workflow ID from process
                workflow = await self.get_workflow_by_process(process_id)
                if workflow:
                    query = query.where("workflow_id", "==", workflow.id)
                else:
                    return []
            
            query = query.order_by("timestamp", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)
            
            docs = query.stream()
            
            history = []
            for doc in docs:
                data = doc.to_dict()
                
                history_entry = ApprovalHistory(
                    workflow_id=data["workflow_id"],
                    stage_number=data["stage_number"],
                    approver_id=data["approver_id"],
                    action=data["action"],
                    comments=data.get("comments"),
                    timestamp=data["timestamp"],
                )
                history.append(history_entry)
            
            return history
            
        except Exception as e:
            logger.error(f"Error listing approval history: {e}")
            raise
    
    async def cancel_workflow(
        self,
        workflow_id: str,
        cancelled_by: str
    ) -> bool:
        """
        Cancel an approval workflow.
        
        Args:
            workflow_id: Workflow ID
            cancelled_by: User/API key ID that cancelled
            
        Returns:
            True if cancelled successfully
        """
        try:
            doc_ref = self.db.collection(APPROVAL_WORKFLOWS_COLLECTION).document(workflow_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                logger.warning(f"Workflow not found: {workflow_id}")
                return False
            
            workflow_data = doc.to_dict()
            
            # Only allow cancellation if pending
            if workflow_data.get("status") != "pending":
                raise ValueError(f"Cannot cancel workflow with status: {workflow_data.get('status')}")
            
            # Cancel workflow
            doc_ref.update({
                "status": "cancelled",
                "completed_at": firestore.SERVER_TIMESTAMP,
                "cancelled_by": cancelled_by,
            })
            
            logger.info(f"Workflow {workflow_id} cancelled by {cancelled_by}")
            return True
            
        except Exception as e:
            logger.error(f"Error cancelling workflow: {e}")
            raise
    
    def _dict_to_workflow(self, workflow_id: str, data: Dict[str, Any]) -> ApprovalWorkflow:
        """Convert Firestore dict to ApprovalWorkflow."""
        return ApprovalWorkflow(
            id=workflow_id,
            process_id=data["process_id"],
            workflow_type=data["workflow_type"],
            stages=[ApprovalStage(**s) for s in data["stages"]],
            current_stage=data["current_stage"],
            status=data["status"],
            submitted_by=data["submitted_by"],
            submitted_at=data["submitted_at"],
            completed_at=data.get("completed_at"),
            stage_statuses=[
                ApprovalStageStatus(
                    stage_number=s["stage_number"],
                    approvers=s["approvers"],
                    required_approvals=s["required_approvals"],
                    approvals=[Approval(**a) for a in s.get("approvals", [])],
                    status=s["status"],
                    completed_at=s.get("completed_at"),
                )
                for s in data.get("stage_statuses", [])
            ],
        )
    
    async def _record_history(
        self,
        workflow_id: str,
        stage_number: int,
        approver_id: str,
        action: str,
        comments: Optional[str] = None
    ) -> None:
        """Record approval action in history."""
        try:
            history_data = {
                "workflow_id": workflow_id,
                "stage_number": stage_number,
                "approver_id": approver_id,
                "action": action,
                "comments": comments,
                "timestamp": firestore.SERVER_TIMESTAMP,
            }
            
            self.db.collection(APPROVAL_HISTORY_COLLECTION).add(history_data)
            
        except Exception as e:
            logger.warning(f"Error recording approval history: {e}")


# ============================================================================
# Singleton Instance
# ============================================================================

_approval_service_instance: Optional[ApprovalService] = None


def get_approval_service() -> ApprovalService:
    """Return singleton instance of ApprovalService."""
    global _approval_service_instance
    if _approval_service_instance is None:
        _approval_service_instance = ApprovalService()
    return _approval_service_instance

