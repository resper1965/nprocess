"""
Marketplace templates service for ComplianceEngine.
"""
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

from google.cloud import firestore

from app.schemas_marketplace import (
    MarketplaceTemplate,
    MarketplaceTemplatePublish,
    MarketplaceTemplateRating,
)
from app.services.template_service import get_template_service


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

TEMPLATES_COLLECTION = "process_templates"
MARKETPLACE_COLLECTION = "marketplace_templates"
TEMPLATE_RATINGS_COLLECTION = "template_ratings"


# ============================================================================
# Marketplace Service
# ============================================================================

class MarketplaceService:
    """Service for marketplace templates."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize marketplace service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("MarketplaceService initialized")
        except Exception as e:
            logger.error(f"Error initializing MarketplaceService: {e}")
            raise
    
    async def publish_template(
        self,
        template_id: str,
        api_key_id: str,
        request: MarketplaceTemplatePublish
    ) -> MarketplaceTemplate:
        """
        Publish a template to the marketplace.
        
        Args:
            template_id: Template ID
            api_key_id: API key ID of publisher
            request: Publish request
            
        Returns:
            MarketplaceTemplate
        """
        try:
            # Get template
            template_service = get_template_service()
            template = await template_service.get_template(template_id)
            
            if not template:
                raise ValueError(f"Template not found: {template_id}")
            
            # Verify ownership
            if template.created_by != api_key_id:
                raise ValueError("You can only publish your own templates")
            
            # Check if already published
            existing = await self._get_marketplace_template(template_id)
            
            now = datetime.utcnow()
            
            marketplace_data = {
                "template_id": template_id,
                "name": template.name,
                "description": template.description,
                "category": template.category,
                "tags": template.tags,
                "author": api_key_id,
                "rating": 0.0,
                "rating_count": 0,
                "download_count": 0,
                "price": request.price,
                "currency": request.currency,
                "is_featured": request.make_featured,
                "is_verified": False,  # Admin verification required
                "created_at": existing.created_at if existing else now,
                "updated_at": now,
                "preview_image_url": request.preview_image_url,
            }
            
            # Store in marketplace
            doc_ref = self.db.collection(MARKETPLACE_COLLECTION).document(template_id)
            doc_ref.set(marketplace_data)
            
            logger.info(f"Template {template_id} published to marketplace")
            
            return MarketplaceTemplate(
                template_id=template_id,
                name=template.name,
                description=template.description,
                category=template.category,
                tags=template.tags,
                author=api_key_id,
                rating=0.0,
                rating_count=0,
                download_count=0,
                price=request.price,
                currency=request.currency,
                is_featured=request.make_featured,
                is_verified=False,
                created_at=existing.created_at if existing else now,
                updated_at=now,
                preview_image_url=request.preview_image_url,
            )
            
        except Exception as e:
            logger.error(f"Error publishing template: {e}")
            raise
    
    async def list_marketplace_templates(
        self,
        category: Optional[str] = None,
        featured_only: bool = False,
        free_only: bool = False,
        min_rating: Optional[float] = None,
        limit: int = 50,
        page: int = 1
    ) -> List[MarketplaceTemplate]:
        """
        List marketplace templates.
        
        Args:
            category: Filter by category
            featured_only: Only featured templates
            free_only: Only free templates
            min_rating: Minimum rating
            limit: Maximum number of results
            page: Page number
            
        Returns:
            List of MarketplaceTemplate
        """
        try:
            query = self.db.collection(MARKETPLACE_COLLECTION)
            
            if category:
                query = query.where("category", "==", category)
            
            if featured_only:
                query = query.where("is_featured", "==", True)
            
            if free_only:
                query = query.where("price", "==", 0.0)
            
            # Order by rating and downloads
            query = query.order_by("rating", direction=firestore.Query.DESCENDING)
            query = query.order_by("download_count", direction=firestore.Query.DESCENDING)
            
            # Pagination
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit)
            
            docs = query.stream()
            
            templates = []
            for doc in docs:
                data = doc.to_dict()
                
                # Filter by min_rating in Python (Firestore doesn't support >= on multiple fields)
                if min_rating and data.get("rating", 0) < min_rating:
                    continue
                
                template = MarketplaceTemplate(
                    template_id=data["template_id"],
                    name=data["name"],
                    description=data["description"],
                    category=data["category"],
                    tags=data.get("tags", []),
                    author=data["author"],
                    rating=data.get("rating", 0.0),
                    rating_count=data.get("rating_count", 0),
                    download_count=data.get("download_count", 0),
                    price=data.get("price", 0.0),
                    currency=data.get("currency", "USD"),
                    is_featured=data.get("is_featured", False),
                    is_verified=data.get("is_verified", False),
                    created_at=data["created_at"],
                    updated_at=data.get("updated_at", data["created_at"]),
                    preview_image_url=data.get("preview_image_url"),
                )
                templates.append(template)
            
            return templates
            
        except Exception as e:
            logger.error(f"Error listing marketplace templates: {e}")
            raise
    
    async def get_marketplace_template(self, template_id: str) -> Optional[MarketplaceTemplate]:
        """
        Get marketplace template by ID.
        
        Args:
            template_id: Template ID
            
        Returns:
            MarketplaceTemplate or None if not found
        """
        return await self._get_marketplace_template(template_id)
    
    async def _get_marketplace_template(self, template_id: str) -> Optional[MarketplaceTemplate]:
        """Internal method to get marketplace template."""
        try:
            doc_ref = self.db.collection(MARKETPLACE_COLLECTION).document(template_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            
            return MarketplaceTemplate(
                template_id=data["template_id"],
                name=data["name"],
                description=data["description"],
                category=data["category"],
                tags=data.get("tags", []),
                author=data["author"],
                rating=data.get("rating", 0.0),
                rating_count=data.get("rating_count", 0),
                download_count=data.get("download_count", 0),
                price=data.get("price", 0.0),
                currency=data.get("currency", "USD"),
                is_featured=data.get("is_featured", False),
                is_verified=data.get("is_verified", False),
                created_at=data["created_at"],
                updated_at=data.get("updated_at", data["created_at"]),
                preview_image_url=data.get("preview_image_url"),
            )
            
        except Exception as e:
            logger.error(f"Error getting marketplace template: {e}")
            return None
    
    async def download_template(
        self,
        template_id: str,
        api_key_id: str
    ) -> Dict[str, Any]:
        """
        Download a template from marketplace.
        
        Args:
            template_id: Template ID
            api_key_id: API key ID of downloader
            
        Returns:
            Template data
        """
        try:
            # Get marketplace template
            marketplace_template = await self._get_marketplace_template(template_id)
            if not marketplace_template:
                raise ValueError(f"Template not found in marketplace: {template_id}")
            
            # Get actual template
            template_service = get_template_service()
            template = await template_service.get_template(template_id)
            if not template:
                raise ValueError(f"Template not found: {template_id}")
            
            # Increment download count
            doc_ref = self.db.collection(MARKETPLACE_COLLECTION).document(template_id)
            doc_ref.update({
                "download_count": firestore.Increment(1)
            })
            
            logger.info(f"Template {template_id} downloaded by {api_key_id}")
            
            return {
                "template_id": template_id,
                "name": template.name,
                "description": template.description,
                "template_data": template.template_data,
                "variables": [v.model_dump() for v in template.variables],
            }
            
        except Exception as e:
            logger.error(f"Error downloading template: {e}")
            raise
    
    async def rate_template(
        self,
        template_id: str,
        api_key_id: str,
        rating: float,
        comment: Optional[str] = None
    ) -> MarketplaceTemplateRating:
        """
        Rate a marketplace template.
        
        Args:
            template_id: Template ID
            api_key_id: API key ID of rater
            rating: Rating (1-5)
            comment: Optional comment
            
        Returns:
            MarketplaceTemplateRating
        """
        try:
            # Check if already rated
            existing_query = (
                self.db.collection(TEMPLATE_RATINGS_COLLECTION)
                .where("template_id", "==", template_id)
                .where("rated_by", "==", api_key_id)
                .limit(1)
            )
            
            existing = list(existing_query.stream())
            
            now = datetime.utcnow()
            
            if existing:
                # Update existing rating
                rating_ref = existing[0].reference
                rating_ref.update({
                    "rating": rating,
                    "comment": comment,
                    "rated_at": now,
                })
            else:
                # Create new rating
                rating_data = {
                    "template_id": template_id,
                    "rating": rating,
                    "comment": comment,
                    "rated_by": api_key_id,
                    "rated_at": now,
                }
                self.db.collection(TEMPLATE_RATINGS_COLLECTION).add(rating_data)
            
            # Recalculate average rating
            await self._update_template_rating(template_id)
            
            return MarketplaceTemplateRating(
                template_id=template_id,
                rating=rating,
                comment=comment,
                rated_by=api_key_id,
                rated_at=now,
            )
            
        except Exception as e:
            logger.error(f"Error rating template: {e}")
            raise
    
    async def _update_template_rating(self, template_id: str) -> None:
        """Update template's average rating."""
        try:
            # Get all ratings
            ratings_query = (
                self.db.collection(TEMPLATE_RATINGS_COLLECTION)
                .where("template_id", "==", template_id)
            )
            
            ratings = list(ratings_query.stream())
            
            if ratings:
                total_rating = sum(r.to_dict()["rating"] for r in ratings)
                avg_rating = total_rating / len(ratings)
                
                # Update marketplace template
                doc_ref = self.db.collection(MARKETPLACE_COLLECTION).document(template_id)
                doc_ref.update({
                    "rating": avg_rating,
                    "rating_count": len(ratings),
                })
            
        except Exception as e:
            logger.warning(f"Error updating template rating: {e}")


# ============================================================================
# Singleton Instance
# ============================================================================

_marketplace_service_instance: Optional[MarketplaceService] = None


def get_marketplace_service() -> MarketplaceService:
    """Return singleton instance of MarketplaceService."""
    global _marketplace_service_instance
    if _marketplace_service_instance is None:
        _marketplace_service_instance = MarketplaceService()
    return _marketplace_service_instance

