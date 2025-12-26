"""
Marketplace templates schemas for n.process.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Marketplace Schemas
# ============================================================================

class MarketplaceTemplate(BaseModel):
    """Template in the marketplace."""
    
    template_id: str
    name: str
    description: str
    category: str
    tags: List[str]
    author: str
    author_name: Optional[str] = None
    rating: float = Field(..., ge=0.0, le=5.0, description="Average rating (0-5)")
    rating_count: int = Field(..., ge=0, description="Number of ratings")
    download_count: int = Field(..., ge=0, description="Number of downloads")
    price: float = Field(0.0, ge=0.0, description="Price (0 = free)")
    currency: str = Field("USD", description="Currency code")
    is_featured: bool = False
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime
    preview_image_url: Optional[str] = None


class MarketplaceTemplateList(BaseModel):
    """List of marketplace templates."""
    
    templates: List[MarketplaceTemplate]
    total: int
    page: int = 1
    page_size: int = 50


class MarketplaceTemplateRating(BaseModel):
    """Template rating."""
    
    template_id: str
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = Field(None, max_length=1000)
    rated_by: str
    rated_at: datetime


class MarketplaceTemplatePublish(BaseModel):
    """Request to publish template to marketplace."""
    
    template_id: str
    price: float = Field(0.0, ge=0.0, description="Price (0 = free)")
    currency: str = Field("USD", description="Currency code")
    preview_image_url: Optional[str] = None
    make_featured: bool = False

