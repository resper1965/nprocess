"""
Backup and restore endpoints for ComplianceEngine.
"""
import logging
from typing import List

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_backup import (
    BackupRequest,
    Backup,
    BackupList,
    RestoreRequest,
    RestoreResponse,
)
from app.services.backup_service import get_backup_service
from app.middleware.auth import verify_admin_token


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/backup", tags=["Backup & Restore"])


# ============================================================================
# Backup Endpoints
# ============================================================================

@router.post(
    "/",
    response_model=Backup,
    status_code=status.HTTP_201_CREATED,
    summary="Create backup",
    description="Create a backup of the database (admin only)"
)
async def create_backup(
    request: BackupRequest,
    admin_user: str = Depends(verify_admin_token)
):
    """
    Create a backup.
    
    Args:
        request: Backup request
        admin_user: Admin user (from token)
        
    Returns:
        Backup
    """
    try:
        backup_service = get_backup_service()
        
        backup = await backup_service.create_backup(
            api_key_id=admin_user,
            request=request
        )
        
        return backup
        
    except Exception as e:
        logger.error(f"Error creating backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create backup"
        )


@router.get(
    "/",
    response_model=BackupList,
    summary="List backups",
    description="List all backups (admin only)"
)
async def list_backups(
    limit: int = 50,
    admin_user: str = Depends(verify_admin_token)
):
    """
    List backups.
    
    Args:
        limit: Maximum number of results
        admin_user: Admin user (from token)
        
    Returns:
        BackupList
    """
    try:
        backup_service = get_backup_service()
        
        backups = await backup_service.list_backups(limit=limit)
        
        return BackupList(
            backups=backups,
            total=len(backups)
        )
        
    except Exception as e:
        logger.error(f"Error listing backups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list backups"
        )


@router.get(
    "/{backup_id}",
    response_model=Backup,
    summary="Get backup",
    description="Get backup details (admin only)"
)
async def get_backup(
    backup_id: str,
    admin_user: str = Depends(verify_admin_token)
):
    """
    Get backup details.
    
    Args:
        backup_id: Backup ID
        admin_user: Admin user (from token)
        
    Returns:
        Backup
    """
    try:
        backup_service = get_backup_service()
        
        backup = await backup_service.get_backup(backup_id)
        
        if not backup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Backup not found: {backup_id}"
            )
        
        return backup
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get backup"
        )


@router.delete(
    "/{backup_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete backup",
    description="Delete a backup (admin only)"
)
async def delete_backup(
    backup_id: str,
    admin_user: str = Depends(verify_admin_token)
):
    """
    Delete a backup.
    
    Args:
        backup_id: Backup ID
        admin_user: Admin user (from token)
    """
    try:
        backup_service = get_backup_service()
        
        success = await backup_service.delete_backup(backup_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Backup not found: {backup_id}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete backup"
        )


# ============================================================================
# Restore Endpoints
# ============================================================================

@router.post(
    "/restore",
    response_model=RestoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Restore from backup",
    description="Restore database from a backup (admin only, use dry_run first!)"
)
async def restore_backup(
    request: RestoreRequest,
    admin_user: str = Depends(verify_admin_token)
):
    """
    Restore from backup.
    
    ⚠️ WARNING: This will overwrite existing data if overwrite_existing=True!
    Always use dry_run=True first to validate.
    
    Args:
        request: Restore request
        admin_user: Admin user (from token)
        
    Returns:
        RestoreResponse
    """
    try:
        backup_service = get_backup_service()
        
        response = await backup_service.restore_backup(
            api_key_id=admin_user,
            request=request
        )
        
        return response
        
    except ValueError as e:
        logger.error(f"Validation error restoring backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error restoring backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore backup"
        )

