"""
Marketplace templates endpoints for n.process.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_marketplace import (
    MarketplaceTemplate,
    MarketplaceTemplateList,
    MarketplaceTemplatePublish,
    MarketplaceTemplateRating,
)
from app.services.marketplace_service import get_marketplace_service
from app.middleware.auth import validate_api_key


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/marketplace", tags=["Marketplace"])


# ============================================================================
# Marketplace Endpoints
# ============================================================================

@router.post(
    "/publish",
    response_model=MarketplaceTemplate,
    status_code=status.HTTP_201_CREATED,
    summary="Publish template to marketplace",
    description="Publish a template to the marketplace"
)
async def publish_template(
    request: MarketplaceTemplatePublish,
    api_key = Depends(validate_api_key)
):
    """
    Publish a template to marketplace.
    
    Args:
        request: Publish request
        api_key: Validated API key (required)
        
    Returns:
        MarketplaceTemplate
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to publish templates"
            )
        
        marketplace_service = get_marketplace_service()
        
        template = await marketplace_service.publish_template(
            template_id=request.template_id,
            api_key_id=api_key.key_id,
            request=request
        )
        
        return template
        
    except ValueError as e:
        logger.error(f"Validation error publishing template: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error publishing template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to publish template"
        )


@router.get(
    "/templates",
    response_model=MarketplaceTemplateList,
    summary="List marketplace templates",
    description="Browse templates in the marketplace"
)
async def list_marketplace_templates(
    category: Optional[str] = None,
    featured_only: bool = False,
    free_only: bool = False,
    min_rating: Optional[float] = None,
    limit: int = 50,
    page: int = 1,
    api_key = Depends(validate_api_key)
):
    """
    List marketplace templates.
    
    Args:
        category: Filter by category
        featured_only: Only featured templates
        free_only: Only free templates
        min_rating: Minimum rating
        limit: Maximum number of results
        page: Page number
        api_key: Validated API key (optional)
        
    Returns:
        MarketplaceTemplateList
    """
    try:
        marketplace_service = get_marketplace_service()
        
        templates = await marketplace_service.list_marketplace_templates(
            category=category,
            featured_only=featured_only,
            free_only=free_only,
            min_rating=min_rating,
            limit=limit,
            page=page
        )
        
        return MarketplaceTemplateList(
            templates=templates,
            total=len(templates),
            page=page,
            page_size=limit
        )
        
    except Exception as e:
        logger.error(f"Error listing marketplace templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list marketplace templates"
        )


@router.get(
    "/templates/{template_id}",
    response_model=MarketplaceTemplate,
    summary="Get marketplace template",
    description="Get details of a marketplace template"
)
async def get_marketplace_template(
    template_id: str,
    api_key = Depends(validate_api_key)
):
    """
    Get marketplace template details.
    
    Args:
        template_id: Template ID
        api_key: Validated API key (optional)
        
    Returns:
        MarketplaceTemplate
    """
    try:
        marketplace_service = get_marketplace_service()
        
        template = await marketplace_service.get_marketplace_template(template_id)
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template not found in marketplace: {template_id}"
            )
        
        return template
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting marketplace template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get marketplace template"
        )


@router.post(
    "/templates/{template_id}/download",
    status_code=status.HTTP_200_OK,
    summary="Download template",
    description="Download a template from marketplace"
)
async def download_template(
    template_id: str,
    api_key = Depends(validate_api_key)
):
    """
    Download a template from marketplace.
    
    Args:
        template_id: Template ID
        api_key: Validated API key (required)
        
    Returns:
        Template data
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to download templates"
            )
        
        marketplace_service = get_marketplace_service()
        
        template_data = await marketplace_service.download_template(
            template_id=template_id,
            api_key_id=api_key.key_id
        )
        
        return template_data
        
    except ValueError as e:
        logger.error(f"Validation error downloading template: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download template"
        )


@router.post(
    "/templates/{template_id}/rate",
    response_model=MarketplaceTemplateRating,
    status_code=status.HTTP_200_OK,
    summary="Rate template",
    description="Rate a marketplace template"
)
async def rate_template(
    template_id: str,
    rating: float,
    comment: Optional[str] = None,
    api_key = Depends(validate_api_key)
):
    """
    Rate a marketplace template.
    
    Args:
        template_id: Template ID
        rating: Rating (1-5)
        comment: Optional comment
        api_key: Validated API key (required)
        
    Returns:
        MarketplaceTemplateRating
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to rate templates"
            )
        
        if not (1.0 <= rating <= 5.0):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Rating must be between 1.0 and 5.0"
            )
        
        marketplace_service = get_marketplace_service()
        
        rating_obj = await marketplace_service.rate_template(
            template_id=template_id,
            api_key_id=api_key.key_id,
            rating=rating,
            comment=comment
        )
        
        return rating_obj
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rate template"
        )

