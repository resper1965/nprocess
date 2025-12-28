"""Audit Logs Router"""
from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from app.schemas import AuditLogEntry, AuditLogQuery, ActionType
from app.middleware.auth import get_current_user
from app.services.firebase_service import _initialize_firebase
from firebase_admin import firestore
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/logs", response_model=List[AuditLogEntry])
async def query_audit_logs(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Query audit logs from Firestore.
    Returns recent audit logs for the current user or all logs for admins.
    """
    try:
        if not _initialize_firebase():
            logger.error("Firebase not initialized")
            return []
        
        db = firestore.client()
        
        # Build query
        query = db.collection('audit_logs').order_by('timestamp', direction=firestore.Query.DESCENDING)
        
        # Filter by action if provided
        if action:
            query = query.where('action', '==', action)
        
        # Filter by resource_type if provided
        if resource_type:
            query = query.where('resource_type', '==', resource_type)
        
        # For non-admin users, filter by user_id
        if current_user.get('role') not in ('admin', 'super_admin'):
            query = query.where('user_id', '==', current_user.get('user_id'))
        
        # Apply pagination
        query = query.limit(limit).offset(offset)
        
        # Execute query
        docs = query.stream()
        
        logs = []
        for doc in docs:
            data = doc.to_dict()
            # Convert Firestore timestamp to datetime
            if 'timestamp' in data:
                if hasattr(data['timestamp'], 'timestamp'):
                    # Firestore Timestamp
                    timestamp = data['timestamp'].to_datetime()
                elif isinstance(data['timestamp'], datetime):
                    timestamp = data['timestamp']
                elif isinstance(data.get('timestamp'), str):
                    timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
                else:
                    timestamp = datetime.utcnow()
            else:
                timestamp = datetime.utcnow()
            
            # Get action, defaulting to 'read' if not found or invalid
            action_str = data.get('action', 'read')
            try:
                action = ActionType(action_str)
            except ValueError:
                # If action is not in enum, try to map common values
                action_map = {
                    'api_key.created': ActionType.CREATE,
                    'api_key.revoked': ActionType.REVOKE,
                    'api_key.deleted': ActionType.DELETE,
                    'document.analyzed': ActionType.READ,
                    'document.uploaded': ActionType.CREATE,
                    'chat.message': ActionType.READ,
                    'integration.configured': ActionType.UPDATE,
                    'compliance.analysis': ActionType.READ,
                    'user.created': ActionType.CREATE,
                    'user.updated': ActionType.UPDATE,
                }
                action = action_map.get(action_str, ActionType.READ)
            
            logs.append(AuditLogEntry(
                log_id=doc.id,
                timestamp=timestamp,
                user_id=data.get('user_id', ''),
                user_email=data.get('user_email', current_user.get('email', '')),
                action=action,
                resource_type=data.get('resource_type', ''),
                resource_id=data.get('resource_id', ''),
                details=data.get('details', {}),
                ip_address=data.get('ip_address'),
                user_agent=data.get('user_agent'),
                status=data.get('status', 'success'),
                error_message=data.get('error_message')
            ))
        
        return logs
        
    except Exception as e:
        logger.error(f"Error querying audit logs: {e}", exc_info=True)
        # Return empty list on error to not break the UI
        return []
