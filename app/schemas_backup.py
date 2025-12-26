"""
Backup and restore schemas for n.process.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Backup Schemas
# ============================================================================

class BackupRequest(BaseModel):
    """Request to create a backup."""
    
    name: Optional[str] = Field(
        None,
        max_length=100,
        description="Backup name (auto-generated if not provided)"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Backup description"
    )
    include_processes: bool = Field(True, description="Include processes in backup")
    include_analyses: bool = Field(True, description="Include compliance analyses in backup")
    include_templates: bool = Field(True, description="Include templates in backup")
    include_webhooks: bool = Field(False, description="Include webhooks in backup")
    include_api_keys: bool = Field(False, description="Include API keys in backup (hashed only)")
    include_tags: bool = Field(True, description="Include tags in backup")
    include_approvals: bool = Field(True, description="Include approval workflows in backup")


class Backup(BaseModel):
    """Backup information."""
    
    id: str
    name: str
    description: Optional[str]
    created_by: str
    created_at: datetime
    size_bytes: int = Field(..., ge=0, description="Backup size in bytes")
    collections: List[str] = Field(
        ...,
        description="List of collections included in backup"
    )
    record_count: Dict[str, int] = Field(
        ...,
        description="Number of records per collection"
    )
    status: str = Field(
        ...,
        description="Status: 'creating', 'completed', 'failed'"
    )
    download_url: Optional[str] = Field(
        None,
        description="Temporary download URL (expires in 1 hour)"
    )


class BackupList(BaseModel):
    """List of backups."""
    
    backups: List[Backup]
    total: int


class RestoreRequest(BaseModel):
    """Request to restore from backup."""
    
    backup_id: str = Field(..., description="Backup ID to restore from")
    collections: Optional[List[str]] = Field(
        None,
        description="Specific collections to restore (all if not specified)"
    )
    overwrite_existing: bool = Field(
        False,
        description="Whether to overwrite existing records"
    )
    dry_run: bool = Field(
        False,
        description="Perform a dry run without actually restoring"
    )


class RestoreResponse(BaseModel):
    """Response after restore operation."""
    
    restore_id: str
    backup_id: str
    status: str = Field(
        ...,
        description="Status: 'pending', 'in_progress', 'completed', 'failed'"
    )
    collections_restored: List[str] = Field(
        default_factory=list,
        description="Collections that were restored"
    )
    records_restored: Dict[str, int] = Field(
        default_factory=dict,
        description="Number of records restored per collection"
    )
    errors: List[str] = Field(
        default_factory=list,
        description="List of errors encountered during restore"
    )
    started_at: datetime
    completed_at: Optional[datetime] = None

