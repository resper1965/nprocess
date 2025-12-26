"""
Process versioning schemas for n.process.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Version Schemas
# ============================================================================

class ProcessVersionCreate(BaseModel):
    """Request to create a new version of a process."""
    
    version_tag: Optional[str] = Field(
        None,
        max_length=50,
        description="Version tag (e.g., 'v1.0.0', 'v1.1.0')"
    )
    change_notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Notes about what changed in this version"
    )
    changed_by: Optional[str] = Field(
        None,
        description="User or system that made the change"
    )


class ProcessVersion(BaseModel):
    """Process version information."""
    
    id: str
    process_id: str
    version: int = Field(..., description="Version number (incremental)")
    version_tag: Optional[str] = Field(None, description="Version tag (e.g., 'v1.0.0')")
    process_data: Dict[str, Any] = Field(..., description="Complete process snapshot")
    changed_by: str
    change_notes: Optional[str]
    created_at: datetime
    is_current: bool = Field(False, description="Whether this is the current version")


class ProcessVersionList(BaseModel):
    """List of process versions."""
    
    versions: List[ProcessVersion]
    total: int
    current_version: int
    process_id: str


class ProcessVersionCompare(BaseModel):
    """Comparison between two process versions."""
    
    process_id: str
    version1: int
    version2: int
    version1_data: Dict[str, Any]
    version2_data: Dict[str, Any]
    differences: Dict[str, Any] = Field(
        ...,
        description="Dictionary of field differences"
    )
    added_fields: List[str] = Field(default_factory=list)
    removed_fields: List[str] = Field(default_factory=list)
    modified_fields: List[str] = Field(default_factory=list)


class ProcessVersionRestore(BaseModel):
    """Request to restore a process version."""
    
    version: int = Field(..., description="Version number to restore")
    create_new_version: bool = Field(
        True,
        description="Whether to create a new version when restoring (preserves history)"
    )
    change_notes: Optional[str] = Field(
        None,
        description="Notes about the restoration"
    )

