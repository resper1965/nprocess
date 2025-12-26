"""
Tag and categorization service for n.process.
"""
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from google.cloud import firestore

from app.schemas_tags import (
    TagCreate,
    Tag,
    CategoryCreate,
    Category,
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

TAGS_COLLECTION = "tags"
CATEGORIES_COLLECTION = "categories"
PROCESSES_COLLECTION = "processes"


# ============================================================================
# Tag Service
# ============================================================================

class TagService:
    """Service for managing tags and categories."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize tag service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("TagService initialized")
        except Exception as e:
            logger.error(f"Error initializing TagService: {e}")
            raise
    
    async def create_tag(
        self,
        request: TagCreate,
        created_by: Optional[str] = None
    ) -> Tag:
        """
        Create a new tag.
        
        Args:
            request: Tag creation request
            created_by: API key ID of creator (optional)
            
        Returns:
            Tag
        """
        try:
            # Check if tag already exists
            existing = await self.get_tag(request.name)
            if existing:
                # Update usage count if exists
                return existing
            
            # Prepare tag data
            now = datetime.utcnow()
            tag_data = {
                "name": request.name,
                "category": request.category,
                "parent_tag": request.parent_tag,
                "description": request.description,
                "color": request.color,
                "usage_count": 0,
                "created_at": now,
                "created_by": created_by,
            }
            
            # Store in Firestore
            doc_ref = self.db.collection(TAGS_COLLECTION).document(request.name)
            doc_ref.set(tag_data)
            
            logger.info(f"Tag created: {request.name}")
            
            return Tag(
                name=request.name,
                category=request.category,
                parent_tag=request.parent_tag,
                description=request.description,
                color=request.color,
                usage_count=0,
                created_at=now,
                created_by=created_by,
            )
            
        except Exception as e:
            logger.error(f"Error creating tag: {e}")
            raise
    
    async def get_tag(self, tag_name: str) -> Optional[Tag]:
        """
        Get a tag by name.
        
        Args:
            tag_name: Tag name
            
        Returns:
            Tag or None if not found
        """
        try:
            doc_ref = self.db.collection(TAGS_COLLECTION).document(tag_name)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            
            return Tag(
                name=data["name"],
                category=data.get("category"),
                parent_tag=data.get("parent_tag"),
                description=data.get("description"),
                color=data.get("color"),
                usage_count=data.get("usage_count", 0),
                created_at=data["created_at"],
                created_by=data.get("created_by"),
            )
            
        except Exception as e:
            logger.error(f"Error getting tag: {e}")
            raise
    
    async def list_tags(
        self,
        category: Optional[str] = None,
        parent_tag: Optional[str] = None,
        limit: int = 100
    ) -> List[Tag]:
        """
        List tags with optional filters.
        
        Args:
            category: Filter by category
            parent_tag: Filter by parent tag
            limit: Maximum number of results
            
        Returns:
            List of Tag
        """
        try:
            query = self.db.collection(TAGS_COLLECTION)
            
            if category:
                query = query.where("category", "==", category)
            
            if parent_tag:
                query = query.where("parent_tag", "==", parent_tag)
            
            query = query.order_by("usage_count", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)
            
            docs = query.stream()
            
            tags = []
            for doc in docs:
                data = doc.to_dict()
                
                tag = Tag(
                    name=data["name"],
                    category=data.get("category"),
                    parent_tag=data.get("parent_tag"),
                    description=data.get("description"),
                    color=data.get("color"),
                    usage_count=data.get("usage_count", 0),
                    created_at=data["created_at"],
                    created_by=data.get("created_by"),
                )
                tags.append(tag)
            
            logger.info(f"Retrieved {len(tags)} tags")
            return tags
            
        except Exception as e:
            logger.error(f"Error listing tags: {e}")
            raise
    
    async def get_all_categories(self) -> List[str]:
        """
        Get all unique tag categories.
        
        Returns:
            List of category names
        """
        try:
            query = self.db.collection(TAGS_COLLECTION)
            docs = query.stream()
            
            categories = set()
            for doc in docs:
                data = doc.to_dict()
                if data.get("category"):
                    categories.add(data["category"])
            
            return sorted(list(categories))
            
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            raise
    
    async def add_tags_to_process(
        self,
        process_id: str,
        tag_names: List[str]
    ) -> bool:
        """
        Add tags to a process.
        
        Args:
            process_id: Process ID
            tag_names: List of tag names to add
            
        Returns:
            True if successful
        """
        try:
            process_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)
            process_doc = process_ref.get()
            
            if not process_doc.exists:
                logger.warning(f"Process not found: {process_id}")
                return False
            
            # Get current tags
            current_tags = process_doc.to_dict().get("tags", [])
            
            # Add new tags (avoid duplicates)
            updated_tags = list(set(current_tags + tag_names))
            
            # Update process
            process_ref.update({"tags": updated_tags})
            
            # Update tag usage counts
            for tag_name in tag_names:
                await self._increment_tag_usage(tag_name)
            
            logger.info(f"Added tags {tag_names} to process {process_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding tags to process: {e}")
            raise
    
    async def remove_tag_from_process(
        self,
        process_id: str,
        tag_name: str
    ) -> bool:
        """
        Remove a tag from a process.
        
        Args:
            process_id: Process ID
            tag_name: Tag name to remove
            
        Returns:
            True if successful
        """
        try:
            process_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)
            process_doc = process_ref.get()
            
            if not process_doc.exists:
                logger.warning(f"Process not found: {process_id}")
                return False
            
            # Get current tags
            current_tags = process_doc.to_dict().get("tags", [])
            
            # Remove tag
            if tag_name in current_tags:
                updated_tags = [t for t in current_tags if t != tag_name]
                process_ref.update({"tags": updated_tags})
                
                # Decrement tag usage count
                await self._decrement_tag_usage(tag_name)
                
                logger.info(f"Removed tag {tag_name} from process {process_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error removing tag from process: {e}")
            raise
    
    async def get_process_tags(self, process_id: str) -> List[str]:
        """
        Get tags for a process.
        
        Args:
            process_id: Process ID
            
        Returns:
            List of tag names
        """
        try:
            process_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)
            process_doc = process_ref.get()
            
            if not process_doc.exists:
                return []
            
            return process_doc.to_dict().get("tags", [])
            
        except Exception as e:
            logger.error(f"Error getting process tags: {e}")
            return []
    
    async def suggest_tags(
        self,
        process_data: Dict[str, Any]
    ) -> List[str]:
        """
        Suggest tags for a process based on its content.
        
        Args:
            process_data: Process data
            
        Returns:
            List of suggested tag names
        """
        try:
            suggestions = []
            
            # Extract category from domain
            domain = process_data.get("domain", "").lower()
            if domain:
                suggestions.append(f"domain:{domain}")
            
            # Extract from name/description (simple keyword matching)
            name = process_data.get("name", "").lower()
            description = process_data.get("description", "").lower()
            
            # Common compliance tags
            compliance_keywords = {
                "lgpd": "compliance:lgpd",
                "gdpr": "compliance:gdpr",
                "sox": "compliance:sox",
                "pci": "compliance:pci",
                "iso": "compliance:iso",
            }
            
            text = f"{name} {description}"
            for keyword, tag in compliance_keywords.items():
                if keyword in text:
                    suggestions.append(tag)
            
            # Category-based suggestions
            category = process_data.get("category")
            if category:
                suggestions.append(f"category:{category.lower()}")
            
            # Remove duplicates and return
            return list(set(suggestions))
            
        except Exception as e:
            logger.error(f"Error suggesting tags: {e}")
            return []
    
    async def _increment_tag_usage(self, tag_name: str) -> None:
        """Increment usage count for a tag."""
        try:
            tag_ref = self.db.collection(TAGS_COLLECTION).document(tag_name)
            tag_doc = tag_ref.get()
            
            if tag_doc.exists:
                tag_ref.update({
                    "usage_count": firestore.Increment(1)
                })
            else:
                # Create tag if it doesn't exist
                tag_ref.set({
                    "name": tag_name,
                    "usage_count": 1,
                    "created_at": firestore.SERVER_TIMESTAMP,
                })
                
        except Exception as e:
            logger.warning(f"Error incrementing tag usage: {e}")
    
    async def _decrement_tag_usage(self, tag_name: str) -> None:
        """Decrement usage count for a tag."""
        try:
            tag_ref = self.db.collection(TAGS_COLLECTION).document(tag_name)
            tag_ref.update({
                "usage_count": firestore.Increment(-1)
            })
        except Exception as e:
            logger.warning(f"Error decrementing tag usage: {e}")
    
    async def create_category(
        self,
        request: CategoryCreate
    ) -> Category:
        """
        Create a new category.
        
        Args:
            request: Category creation request
            
        Returns:
            Category
        """
        try:
            # Check if category already exists
            existing = await self.get_category(request.name)
            if existing:
                return existing
            
            # Prepare category data
            now = datetime.utcnow()
            category_data = {
                "name": request.name,
                "description": request.description,
                "parent_category": request.parent_category,
                "process_count": 0,
                "created_at": now,
            }
            
            # Store in Firestore
            doc_ref = self.db.collection(CATEGORIES_COLLECTION).document(request.name)
            doc_ref.set(category_data)
            
            logger.info(f"Category created: {request.name}")
            
            return Category(
                name=request.name,
                description=request.description,
                parent_category=request.parent_category,
                process_count=0,
                created_at=now,
            )
            
        except Exception as e:
            logger.error(f"Error creating category: {e}")
            raise
    
    async def get_category(self, category_name: str) -> Optional[Category]:
        """
        Get a category by name.
        
        Args:
            category_name: Category name
            
        Returns:
            Category or None if not found
        """
        try:
            doc_ref = self.db.collection(CATEGORIES_COLLECTION).document(category_name)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            
            return Category(
                name=data["name"],
                description=data.get("description"),
                parent_category=data.get("parent_category"),
                process_count=data.get("process_count", 0),
                created_at=data["created_at"],
            )
            
        except Exception as e:
            logger.error(f"Error getting category: {e}")
            raise
    
    async def list_categories(
        self,
        parent_category: Optional[str] = None,
        limit: int = 100
    ) -> List[Category]:
        """
        List categories.
        
        Args:
            parent_category: Filter by parent category
            limit: Maximum number of results
            
        Returns:
            List of Category
        """
        try:
            query = self.db.collection(CATEGORIES_COLLECTION)
            
            if parent_category:
                query = query.where("parent_category", "==", parent_category)
            
            query = query.order_by("process_count", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)
            
            docs = query.stream()
            
            categories = []
            for doc in docs:
                data = doc.to_dict()
                
                category = Category(
                    name=data["name"],
                    description=data.get("description"),
                    parent_category=data.get("parent_category"),
                    process_count=data.get("process_count", 0),
                    created_at=data["created_at"],
                )
                categories.append(category)
            
            logger.info(f"Retrieved {len(categories)} categories")
            return categories
            
        except Exception as e:
            logger.error(f"Error listing categories: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_tag_service_instance: Optional[TagService] = None


def get_tag_service() -> TagService:
    """Return singleton instance of TagService."""
    global _tag_service_instance
    if _tag_service_instance is None:
        _tag_service_instance = TagService()
    return _tag_service_instance

