"""
Integrations Router
Manages third-party integrations (Google Drive, SharePoint, Slack, etc.)
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.middleware.auth import get_current_user
from app.services.firebase_service import _initialize_firebase
from firebase_admin import firestore
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class IntegrationInfo(BaseModel):
    """Integration information"""
    id: str
    name: str
    description: str
    status: str  # 'connected' or 'disconnected'
    requires_plan: Optional[str] = None
    configurable: bool = True
    config: Optional[dict] = None
    connected_at: Optional[datetime] = None


class IntegrationConfig(BaseModel):
    """Integration configuration"""
    folder_id: Optional[str] = None
    folder_name: Optional[str] = None
    auto_upload: bool = False
    share_with_emails: Optional[List[str]] = None


@router.get("/", response_model=List[IntegrationInfo])
async def list_integrations(
    current_user: dict = Depends(get_current_user)
):
    """List all available integrations"""
    # Static list of available integrations
    all_integrations = [
        {
            'id': 'google_drive',
            'name': 'Google Drive',
            'description': 'Automatically save analyzed documents to Google Drive',
            'requires_plan': None,
            'configurable': True
        },
        {
            'id': 'sharepoint',
            'name': 'SharePoint',
            'description': 'Sync compliance documents with Microsoft SharePoint',
            'requires_plan': 'Professional',
            'configurable': True
        },
        {
            'id': 'onedrive',
            'name': 'OneDrive',
            'description': 'Store documents in Microsoft OneDrive',
            'requires_plan': 'Professional',
            'configurable': True
        },
        {
            'id': 'slack',
            'name': 'Slack',
            'description': 'Get notifications about compliance status in Slack',
            'requires_plan': None,
            'configurable': True
        },
        {
            'id': 'notebooklm',
            'name': 'NotebookLM',
            'description': 'Create AI-powered notebooks from compliance documents',
            'requires_plan': 'Enterprise',
            'configurable': True
        },
    ]
    
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Get user's connected integrations
        integrations_ref = db.collection('integrations').where('user_id', '==', user_id)
        docs = integrations_ref.stream()
        
        connected_ids = {doc.id for doc in docs}
        
        # Build response with status
        integrations = []
        for integration in all_integrations:
            is_connected = integration['id'] in connected_ids
            integrations.append(IntegrationInfo(
                id=integration['id'],
                name=integration['name'],
                description=integration['description'],
                status='connected' if is_connected else 'disconnected',
                requires_plan=integration.get('requires_plan'),
                configurable=integration.get('configurable', True),
                connected_at=datetime.utcnow() if is_connected else None
            ))
        
        return integrations
        
    except Exception as e:
        logger.error(f"Error listing integrations: {e}", exc_info=True)
        # Return static list on error
        return [
            IntegrationInfo(
                id=integration['id'],
                name=integration['name'],
                description=integration['description'],
                status='disconnected',
                requires_plan=integration.get('requires_plan'),
                configurable=integration.get('configurable', True)
            )
            for integration in all_integrations
        ]


@router.post("/{integration_id}/connect")
async def connect_integration(
    integration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Connect an integration"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Store connection in Firestore
        integration_ref = db.collection('integrations').document()
        integration_ref.set({
            'user_id': user_id,
            'integration_id': integration_id,
            'status': 'connected',
            'connected_at': firestore.SERVER_TIMESTAMP,
            'config': {}
        })
        
        return {"success": True, "message": f"Integration {integration_id} connected successfully"}
        
    except Exception as e:
        logger.error(f"Error connecting integration: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{integration_id}/disconnect")
async def disconnect_integration(
    integration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Disconnect an integration"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Find and delete integration connection
        integrations_ref = db.collection('integrations').where('user_id', '==', user_id).where('integration_id', '==', integration_id)
        docs = integrations_ref.stream()
        
        for doc in docs:
            doc.reference.delete()
        
        return {"success": True, "message": f"Integration {integration_id} disconnected successfully"}
        
    except Exception as e:
        logger.error(f"Error disconnecting integration: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{integration_id}/config")
async def update_integration_config(
    integration_id: str,
    config: IntegrationConfig,
    current_user: dict = Depends(get_current_user)
):
    """Update integration configuration"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Find integration
        integrations_ref = db.collection('integrations').where('user_id', '==', user_id).where('integration_id', '==', integration_id).limit(1)
        docs = list(integrations_ref.stream())
        
        if not docs:
            raise HTTPException(status_code=404, detail="Integration not found or not connected")
        
        # Update config
        doc_ref = docs[0].reference
        doc_ref.update({
            'config': config.dict(exclude_none=True),
            'updated_at': firestore.SERVER_TIMESTAMP
        })
        
        return {"success": True, "message": "Configuration updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating integration config: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

