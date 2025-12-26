"""
Process template schemas for n.process.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Template Variable Schemas
# ============================================================================

class TemplateVariable(BaseModel):
    """Template variable definition."""
    
    name: str = Field(..., description="Variable name (e.g., 'company_name')")
    type: str = Field(
        "string",
        description="Variable type: 'string', 'number', 'date', 'email', etc."
    )
    description: Optional[str] = Field(
        None,
        description="Description of what this variable represents"
    )
    default_value: Optional[str] = Field(
        None,
        description="Default value if not provided"
    )
    required: bool = Field(
        True,
        description="Whether this variable is required"
    )


# ============================================================================
# Template Schemas
# ============================================================================

class ProcessTemplateCreate(BaseModel):
    """Request to create a new process template."""
    
    name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Template name"
    )
    description: str = Field(
        ...,
        max_length=1000,
        description="Template description"
    )
    category: str = Field(
        ...,
        description="Template category (e.g., 'HR', 'Finance', 'IT')"
    )
    tags: List[str] = Field(
        default_factory=list,
        description="Template tags"
    )
    template_data: Dict[str, Any] = Field(
        ...,
        description="Process template with variables (e.g., {{company_name}})"
    )
    variables: List[TemplateVariable] = Field(
        default_factory=list,
        description="List of variables in the template"
    )
    public: bool = Field(
        False,
        description="Whether template is public (visible to all users)"
    )


class ProcessTemplateUpdate(BaseModel):
    """Request to update a process template."""
    
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    template_data: Optional[Dict[str, Any]] = None
    variables: Optional[List[TemplateVariable]] = None
    public: Optional[bool] = None


class ProcessTemplate(BaseModel):
    """Process template information."""
    
    id: str
    name: str
    description: str
    category: str
    tags: List[str]
    template_data: Dict[str, Any]
    variables: List[TemplateVariable]
    public: bool
    created_by: str
    created_at: datetime
    updated_at: datetime
    usage_count: int = 0


class ProcessTemplateList(BaseModel):
    """List of process templates."""
    
    templates: List[ProcessTemplate]
    total: int
    page: int = 1
    page_size: int = 50


class ProcessTemplateInstantiate(BaseModel):
    """Request to instantiate a template into a process."""
    
    template_id: str = Field(..., description="Template ID to instantiate")
    variables: Dict[str, Any] = Field(
        ...,
        description="Variable values to substitute in template"
    )
    process_name: Optional[str] = Field(
        None,
        description="Custom process name (overrides template default)"
    )


class ProcessTemplatePreview(BaseModel):
    """Preview of instantiated template."""
    
    template_id: str
    template_name: str
    instantiated_data: Dict[str, Any]
    missing_variables: List[str] = Field(
        default_factory=list,
        description="Required variables that were not provided"
    )
    preview_only: bool = Field(
        True,
        description="This is a preview, not a saved process"
    )

