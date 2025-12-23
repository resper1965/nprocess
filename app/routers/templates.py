"""
Process template endpoints for ComplianceEngine.
"""
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_templates import (
    ProcessTemplateCreate,
    ProcessTemplateUpdate,
    ProcessTemplate,
    ProcessTemplateList,
    ProcessTemplateInstantiate,
    ProcessTemplatePreview,
)
from app.services.template_service import get_template_service
from app.services.db_service import get_db_service
from app.middleware.auth import validate_api_key


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/templates", tags=["Process Templates"])


# ============================================================================
# Template Endpoints
# ============================================================================

@router.post(
    "/",
    response_model=ProcessTemplate,
    status_code=status.HTTP_201_CREATED,
    summary="Create process template",
    description="Create a new process template with variables"
)
async def create_template(
    request: ProcessTemplateCreate,
    api_key = Depends(validate_api_key)
):
    """
    Create a new process template.
    
    Args:
        request: Template creation request
        api_key: Validated API key (optional, but required for private templates)
        
    Returns:
        ProcessTemplate
    """
    try:
        template_service = get_template_service()
        
        # Get API key ID (use "anonymous" if not provided)
        api_key_id = api_key.key_id if api_key else "anonymous"
        
        template = await template_service.create_template(
            api_key_id=api_key_id,
            request=request
        )
        
        return template
        
    except Exception as e:
        logger.error(f"Error creating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create template"
        )


@router.get(
    "/",
    response_model=ProcessTemplateList,
    summary="List process templates",
    description="List available process templates"
)
async def list_templates(
    category: Optional[str] = None,
    public_only: bool = False,
    limit: int = 50,
    page: int = 1,
    api_key = Depends(validate_api_key)
):
    """
    List process templates.
    
    Args:
        category: Filter by category
        public_only: Only return public templates
        limit: Maximum number of results
        page: Page number (1-based)
        api_key: Validated API key (optional)
        
    Returns:
        ProcessTemplateList
    """
    try:
        template_service = get_template_service()
        
        api_key_id = api_key.key_id if api_key else None
        
        templates = await template_service.list_templates(
            category=category,
            public_only=public_only,
            api_key_id=api_key_id,
            limit=limit,
            page=page
        )
        
        return ProcessTemplateList(
            templates=templates,
            total=len(templates),
            page=page,
            page_size=limit
        )
        
    except Exception as e:
        logger.error(f"Error listing templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list templates"
        )


@router.get(
    "/{template_id}",
    response_model=ProcessTemplate,
    summary="Get process template",
    description="Get details of a specific template"
)
async def get_template(
    template_id: str,
    api_key = Depends(validate_api_key)
):
    """
    Get a specific template.
    
    Args:
        template_id: Template ID
        api_key: Validated API key (optional)
        
    Returns:
        ProcessTemplate
    """
    try:
        template_service = get_template_service()
        
        template = await template_service.get_template(template_id)
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template not found: {template_id}"
            )
        
        # Check access (public or owned by API key)
        api_key_id = api_key.key_id if api_key else None
        if not template.public and template.created_by != api_key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: template is private"
            )
        
        return template
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template"
        )


@router.put(
    "/{template_id}",
    response_model=ProcessTemplate,
    summary="Update process template",
    description="Update a process template"
)
async def update_template(
    template_id: str,
    request: ProcessTemplateUpdate,
    api_key = Depends(validate_api_key)
):
    """
    Update a template.
    
    Args:
        template_id: Template ID
        request: Update request
        api_key: Validated API key (required)
        
    Returns:
        Updated ProcessTemplate
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to update templates"
            )
        
        template_service = get_template_service()
        
        # Verify ownership
        template = await template_service.get_template(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template not found: {template_id}"
            )
        
        if template.created_by != api_key.key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you can only update your own templates"
            )
        
        # Update template
        success = await template_service.update_template(template_id, request)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update template"
            )
        
        # Return updated template
        updated_template = await template_service.get_template(template_id)
        return updated_template
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update template"
        )


@router.delete(
    "/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete process template",
    description="Delete a process template"
)
async def delete_template(
    template_id: str,
    api_key = Depends(validate_api_key)
):
    """
    Delete a template.
    
    Args:
        template_id: Template ID
        api_key: Validated API key (required)
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to delete templates"
            )
        
        template_service = get_template_service()
        
        # Verify ownership
        template = await template_service.get_template(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template not found: {template_id}"
            )
        
        if template.created_by != api_key.key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you can only delete your own templates"
            )
        
        # Delete template
        success = await template_service.delete_template(template_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete template"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete template"
        )


@router.post(
    "/{template_id}/instantiate",
    status_code=status.HTTP_201_CREATED,
    summary="Instantiate template into process",
    description="Create a process from a template"
)
async def instantiate_template(
    template_id: str,
    request: ProcessTemplateInstantiate,
    api_key = Depends(validate_api_key)
):
    """
    Instantiate a template into a process.
    
    Args:
        template_id: Template ID
        request: Instantiation request with variables
        api_key: Validated API key (optional)
        
    Returns:
        Created process data
    """
    try:
        template_service = get_template_service()
        db_service = get_db_service()
        
        # Override template_id in request
        request.template_id = template_id
        
        # Instantiate template
        instantiated_data = await template_service.instantiate_template(
            template_id=template_id,
            request=request
        )
        
        # Create process from instantiated data
        process_id = await db_service.create_process(instantiated_data)
        
        logger.info(f"Process {process_id} created from template {template_id}")
        
        return {
            "process_id": process_id,
            "template_id": template_id,
            "created_at": datetime.utcnow().isoformat(),
            "data": instantiated_data
        }
        
    except ValueError as e:
        logger.error(f"Validation error instantiating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error instantiating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to instantiate template"
        )


@router.post(
    "/{template_id}/preview",
    response_model=ProcessTemplatePreview,
    summary="Preview instantiated template",
    description="Preview how a template would look with given variables (without saving)"
)
async def preview_template(
    template_id: str,
    variables: dict,
    api_key = Depends(validate_api_key)
):
    """
    Preview instantiated template.
    
    Args:
        template_id: Template ID
        variables: Variable values
        api_key: Validated API key (optional)
        
    Returns:
        ProcessTemplatePreview
    """
    try:
        template_service = get_template_service()
        
        preview = await template_service.preview_template(
            template_id=template_id,
            variables=variables
        )
        
        return preview
        
    except ValueError as e:
        logger.error(f"Validation error previewing template: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error previewing template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to preview template"
        )

