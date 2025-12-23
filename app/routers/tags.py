"""
Tag and categorization endpoints for ComplianceEngine.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_tags import (
    TagCreate,
    Tag,
    TagList,
    TagSuggestions,
    CategoryCreate,
    Category,
    CategoryList,
    ProcessTagsUpdate,
    ProcessTagsResponse,
)
from app.services.tag_service import get_tag_service
from app.services.db_service import get_db_service
from app.middleware.auth import validate_api_key

# Import db_service.db for direct Firestore access
from app.services.db_service import get_db_service as _get_db_service


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["Tags & Categories"])


# ============================================================================
# Tag Endpoints
# ============================================================================

@router.post(
    "/tags",
    response_model=Tag,
    status_code=status.HTTP_201_CREATED,
    summary="Create tag",
    description="Create a new tag"
)
async def create_tag(
    request: TagCreate,
    api_key = Depends(validate_api_key)
):
    """
    Create a new tag.
    
    Args:
        request: Tag creation request
        api_key: Validated API key (optional)
        
    Returns:
        Tag
    """
    try:
        tag_service = get_tag_service()
        
        created_by = api_key.key_id if api_key else None
        
        tag = await tag_service.create_tag(request, created_by)
        
        return tag
        
    except Exception as e:
        logger.error(f"Error creating tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tag"
        )


@router.get(
    "/tags",
    response_model=TagList,
    summary="List tags",
    description="List all tags with optional filters"
)
async def list_tags(
    category: Optional[str] = None,
    parent_tag: Optional[str] = None,
    limit: int = 100,
    api_key = Depends(validate_api_key)
):
    """
    List tags.
    
    Args:
        category: Filter by category
        parent_tag: Filter by parent tag
        limit: Maximum number of results
        api_key: Validated API key (optional)
        
    Returns:
        TagList
    """
    try:
        tag_service = get_tag_service()
        
        tags = await tag_service.list_tags(
            category=category,
            parent_tag=parent_tag,
            limit=limit
        )
        
        categories = await tag_service.get_all_categories()
        
        return TagList(
            tags=tags,
            total=len(tags),
            categories=categories
        )
        
    except Exception as e:
        logger.error(f"Error listing tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list tags"
        )


@router.get(
    "/tags/{tag_name}",
    response_model=Tag,
    summary="Get tag",
    description="Get details of a specific tag"
)
async def get_tag(
    tag_name: str,
    api_key = Depends(validate_api_key)
):
    """
    Get a specific tag.
    
    Args:
        tag_name: Tag name
        api_key: Validated API key (optional)
        
    Returns:
        Tag
    """
    try:
        tag_service = get_tag_service()
        
        tag = await tag_service.get_tag(tag_name)
        
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tag not found: {tag_name}"
            )
        
        return tag
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tag"
        )


@router.get(
    "/tags/{tag_name}/processes",
    summary="Get processes with tag",
    description="List all processes that have a specific tag"
)
async def get_processes_with_tag(
    tag_name: str,
    limit: int = 50,
    api_key = Depends(validate_api_key)
):
    """
    Get processes with a specific tag.
    
    Args:
        tag_name: Tag name
        limit: Maximum number of results
        api_key: Validated API key (optional)
        
    Returns:
        List of process IDs
    """
    try:
        db_service = _get_db_service()
        
        # Query processes with this tag
        query = (
            db_service.db.collection("processes")
            .where("tags", "array_contains", tag_name)
            .limit(limit)
        )
        
        docs = query.stream()
        
        processes = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            processes.append(data)
        
        return {
            "tag": tag_name,
            "processes": processes,
            "total": len(processes)
        }
        
    except Exception as e:
        logger.error(f"Error getting processes with tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get processes with tag"
        )


# ============================================================================
# Process Tagging Endpoints
# ============================================================================

@router.post(
    "/processes/{process_id}/tags",
    response_model=ProcessTagsResponse,
    summary="Update process tags",
    description="Add or replace tags on a process"
)
async def update_process_tags(
    process_id: str,
    request: ProcessTagsUpdate,
    api_key = Depends(validate_api_key)
):
    """
    Update tags for a process.
    
    Args:
        process_id: Process ID
        request: Tags update request
        api_key: Validated API key (optional)
        
    Returns:
        ProcessTagsResponse
    """
    try:
        tag_service = get_tag_service()
        db_service = get_db_service()
        
        # Verify process exists
        process_data = await db_service.get_process(process_id)
        if not process_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Process not found: {process_id}"
            )
        
        if request.replace:
            # Replace all tags
            current_tags = await tag_service.get_process_tags(process_id)
            
            # Remove old tags
            for tag in current_tags:
                if tag not in request.tags:
                    await tag_service.remove_tag_from_process(process_id, tag)
            
            # Add new tags
            for tag in request.tags:
                if tag not in current_tags:
                    await tag_service.add_tags_to_process(process_id, [tag])
        else:
            # Add tags
            await tag_service.add_tags_to_process(process_id, request.tags)
        
        # Get updated tags
        tags = await tag_service.get_process_tags(process_id)
        
        # Group tags by category
        categories = {}
        for tag_name in tags:
            tag = await tag_service.get_tag(tag_name)
            if tag and tag.category:
                if tag.category not in categories:
                    categories[tag.category] = []
                categories[tag.category].append(tag_name)
        
        return ProcessTagsResponse(
            process_id=process_id,
            tags=tags,
            categories=categories
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating process tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update process tags"
        )


@router.delete(
    "/processes/{process_id}/tags/{tag_name}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove tag from process",
    description="Remove a specific tag from a process"
)
async def remove_process_tag(
    process_id: str,
    tag_name: str,
    api_key = Depends(validate_api_key)
):
    """
    Remove a tag from a process.
    
    Args:
        process_id: Process ID
        tag_name: Tag name to remove
        api_key: Validated API key (optional)
    """
    try:
        tag_service = get_tag_service()
        
        success = await tag_service.remove_tag_from_process(process_id, tag_name)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tag {tag_name} not found on process {process_id}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing tag from process: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove tag from process"
        )


@router.get(
    "/processes/{process_id}/tags/suggestions",
    response_model=TagSuggestions,
    summary="Suggest tags for process",
    description="Get AI-powered tag suggestions for a process"
)
async def suggest_process_tags(
    process_id: str,
    api_key = Depends(validate_api_key)
):
    """
    Suggest tags for a process.
    
    Args:
        process_id: Process ID
        api_key: Validated API key (optional)
        
    Returns:
        TagSuggestions
    """
    try:
        tag_service = get_tag_service()
        db_service = get_db_service()
        
        # Get process data
        process_data = await db_service.get_process(process_id)
        if not process_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Process not found: {process_id}"
            )
        
        # Get suggestions
        suggested_tags = await tag_service.suggest_tags(process_data)
        
        return TagSuggestions(
            suggested_tags=suggested_tags,
            confidence=0.7,  # Simple keyword matching
            method="keyword_matching"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error suggesting tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to suggest tags"
        )


# ============================================================================
# Category Endpoints
# ============================================================================

@router.post(
    "/categories",
    response_model=Category,
    status_code=status.HTTP_201_CREATED,
    summary="Create category",
    description="Create a new category"
)
async def create_category(
    request: CategoryCreate,
    api_key = Depends(validate_api_key)
):
    """
    Create a new category.
    
    Args:
        request: Category creation request
        api_key: Validated API key (optional)
        
    Returns:
        Category
    """
    try:
        tag_service = get_tag_service()
        
        category = await tag_service.create_category(request)
        
        return category
        
    except Exception as e:
        logger.error(f"Error creating category: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create category"
        )


@router.get(
    "/categories",
    response_model=CategoryList,
    summary="List categories",
    description="List all categories"
)
async def list_categories(
    parent_category: Optional[str] = None,
    limit: int = 100,
    api_key = Depends(validate_api_key)
):
    """
    List categories.
    
    Args:
        parent_category: Filter by parent category
        limit: Maximum number of results
        api_key: Validated API key (optional)
        
    Returns:
        CategoryList
    """
    try:
        tag_service = get_tag_service()
        
        categories = await tag_service.list_categories(
            parent_category=parent_category,
            limit=limit
        )
        
        return CategoryList(
            categories=categories,
            total=len(categories)
        )
        
    except Exception as e:
        logger.error(f"Error listing categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list categories"
        )

