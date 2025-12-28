"""
Secrets Management Router
Manages user secrets stored in Google Cloud Secret Manager
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.middleware.auth import get_current_user
from app.services.firebase_service import _initialize_firebase
from firebase_admin import firestore
from google.cloud import secretmanager
import logging
import os

logger = logging.getLogger(__name__)
router = APIRouter()

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "nprocess-prod")


class SecretCreate(BaseModel):
    """Schema for creating a secret"""
    secret_name: str = Field(..., min_length=1, max_length=100)
    secret_value: str = Field(..., min_length=1)
    integration_type: str = Field(..., description="google_cloud, aws, azure, github")
    description: Optional[str] = None


class SecretInfo(BaseModel):
    """Schema for secret information (without value)"""
    id: str
    secret_name: str
    integration_type: str
    description: Optional[str] = None
    created_at: datetime
    last_used_at: Optional[datetime] = None


@router.get("/", response_model=List[SecretInfo])
async def list_secrets(
    current_user: dict = Depends(get_current_user)
):
    """List all secrets for the current user"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Query secrets from Firestore
        secrets_ref = db.collection('secrets').where('user_id', '==', user_id)
        docs = secrets_ref.stream()
        
        secrets = []
        for doc in docs:
            data = doc.to_dict()
            secrets.append(SecretInfo(
                id=doc.id,
                secret_name=data.get('secret_name', ''),
                integration_type=data.get('integration_type', ''),
                description=data.get('description'),
                created_at=data.get('created_at', datetime.utcnow()),
                last_used_at=data.get('last_used_at')
            ))
        
        return secrets
        
    except Exception as e:
        logger.error(f"Error listing secrets: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=SecretInfo)
async def create_secret(
    request: SecretCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new secret"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        user_id = current_user.get('user_id')
        secret_id = f"user-{user_id}-{request.secret_name.lower().replace('_', '-')}"
        
        # Store in Google Cloud Secret Manager
        client = secretmanager.SecretManagerServiceClient()
        parent = f"projects/{PROJECT_ID}"
        
        # Create secret
        secret = client.create_secret(
            request={
                "parent": parent,
                "secret_id": secret_id,
                "secret": {
                    "replication": {"automatic": {}}
                }
            }
        )
        
        # Add secret version with value
        client.add_secret_version(
            request={
                "parent": secret.name,
                "payload": {
                    "data": request.secret_value.encode("UTF-8")
                }
            }
        )
        
        # Store metadata in Firestore
        db = firestore.client()
        secret_ref = db.collection('secrets').document()
        secret_ref.set({
            'user_id': user_id,
            'secret_name': request.secret_name,
            'integration_type': request.integration_type,
            'description': request.description,
            'secret_manager_id': secret_id,
            'created_at': firestore.SERVER_TIMESTAMP,
            'last_used_at': None
        })
        
        return SecretInfo(
            id=secret_ref.id,
            secret_name=request.secret_name,
            integration_type=request.integration_type,
            description=request.description,
            created_at=datetime.utcnow(),
            last_used_at=None
        )
        
    except Exception as e:
        logger.error(f"Error creating secret: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{secret_id}")
async def delete_secret(
    secret_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a secret"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Get secret from Firestore
        secret_ref = db.collection('secrets').document(secret_id)
        secret_doc = secret_ref.get()
        
        if not secret_doc.exists:
            raise HTTPException(status_code=404, detail="Secret not found")
        
        data = secret_doc.to_dict()
        if data.get('user_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this secret")
        
        # Delete from Secret Manager
        secret_manager_id = data.get('secret_manager_id')
        if secret_manager_id:
            try:
                client = secretmanager.SecretManagerServiceClient()
                secret_name = f"projects/{PROJECT_ID}/secrets/{secret_manager_id}"
                client.delete_secret(request={"name": secret_name})
            except Exception as e:
                logger.warning(f"Error deleting from Secret Manager: {e}")
        
        # Delete from Firestore
        secret_ref.delete()
        
        return {"success": True, "message": "Secret deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting secret: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

