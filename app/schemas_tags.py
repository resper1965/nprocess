"""
Tags and categorization schemas for n.process.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Tag Schemas
# ============================================================================

class TagCreate(BaseModel):
    """Request to create a new tag."""
    
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Tag name (e.g., 'compliance:gdpr', 'compliance:lgpd')"
    )
    category: Optional[str] = Field(
        None,
        max_length=50,
        description="Tag category (e.g., 'compliance', 'department', 'priority')"
    )
    parent_tag: Optional[str] = Field(
        None,
        description="Parent tag name for hierarchical tags"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Tag description"
    )
    color: Optional[str] = Field(
        None,
        description="Tag color (hex code, e.g., '#FF5733')"
    )


class Tag(BaseModel):
    """Tag information."""
    
    name: str
    category: Optional[str]
    parent_tag: Optional[str]
    description: Optional[str]
    color: Optional[str]
    usage_count: int = 0
    created_at: datetime
    created_by: Optional[str] = None


class TagList(BaseModel):
    """List of tags."""
    
    tags: List[Tag]
    total: int
    categories: List[str] = Field(
        default_factory=list,
        description="List of all tag categories"
    )


class TagSuggestions(BaseModel):
    """Tag suggestions for a process."""
    
    suggested_tags: List[str] = Field(
        ...,
        description="List of suggested tag names"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score (0-1)"
    )
    method: str = Field(
        ...,
        description="Method used for suggestions (e.g., 'ai', 'similarity', 'category')"
    )


# ============================================================================
# Category Schemas
# ============================================================================

class CategoryCreate(BaseModel):
    """Request to create a new category."""
    
    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Category name"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Category description"
    )
    parent_category: Optional[str] = Field(
        None,
        description="Parent category for hierarchical categories"
    )


class Category(BaseModel):
    """Category information."""
    
    name: str
    description: Optional[str]
    parent_category: Optional[str]
    process_count: int = 0
    created_at: datetime


class CategoryList(BaseModel):
    """List of categories."""
    
    categories: List[Category]
    total: int


# ============================================================================
# Process Tagging Schemas
# ============================================================================

class ProcessTagsUpdate(BaseModel):
    """Request to update process tags."""
    
    tags: List[str] = Field(
        ...,
        description="List of tag names to assign to the process"
    )
    replace: bool = Field(
        False,
        description="Whether to replace existing tags (true) or add to them (false)"
    )


class ProcessTagsResponse(BaseModel):
    """Response with process tags."""
    
    process_id: str
    tags: List[str]
    categories: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Tags grouped by category"
    )

