"""
Advanced search endpoints for ComplianceEngine.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_search import (
    SearchRequest,
    SearchResponse,
    SearchSuggestionsResponse,
    SavedSearch,
    SavedSearchCreate,
    SavedSearchList,
)
from app.services.search_service import get_search_service
from app.middleware.auth import validate_api_key


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/search", tags=["Search"])


# ============================================================================
# Search Endpoints
# ============================================================================

@router.post(
    "/processes",
    response_model=SearchResponse,
    summary="Search processes",
    description="Advanced search for processes with filters, sorting, and pagination"
)
async def search_processes(
    request: SearchRequest,
    api_key = Depends(validate_api_key)
):
    """
    Search processes with advanced filters.
    
    Args:
        request: Search request with filters and pagination
        api_key: Validated API key (optional)
        
    Returns:
        SearchResponse with results
    """
    try:
        search_service = get_search_service()
        
        response = await search_service.search_processes(request)
        
        return response
        
    except Exception as e:
        logger.error(f"Error searching processes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search processes"
        )


@router.get(
    "/suggestions",
    response_model=SearchSuggestionsResponse,
    summary="Get search suggestions",
    description="Get autocomplete suggestions for search queries"
)
async def get_search_suggestions(
    q: str,
    limit: int = 10,
    api_key = Depends(validate_api_key)
):
    """
    Get search autocomplete suggestions.
    
    Args:
        q: Partial query string
        limit: Maximum number of suggestions
        api_key: Validated API key (optional)
        
    Returns:
        SearchSuggestionsResponse
    """
    try:
        search_service = get_search_service()
        
        suggestions = await search_service.get_suggestions(q, limit)
        
        return SearchSuggestionsResponse(
            suggestions=suggestions,
            query=q
        )
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get suggestions"
        )


# ============================================================================
# Saved Searches Endpoints
# ============================================================================

@router.post(
    "/saved",
    response_model=SavedSearch,
    status_code=status.HTTP_201_CREATED,
    summary="Save search query",
    description="Save a search query for later use"
)
async def create_saved_search(
    request: SavedSearchCreate,
    api_key = Depends(validate_api_key)
):
    """
    Create a saved search.
    
    Args:
        request: Saved search creation request
        api_key: Validated API key (required)
        
    Returns:
        SavedSearch
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to save searches"
            )
        
        search_service = get_search_service()
        
        saved_search = await search_service.create_saved_search(
            api_key_id=api_key.key_id,
            request=request
        )
        
        return saved_search
        
    except Exception as e:
        logger.error(f"Error creating saved search: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create saved search"
        )


@router.get(
    "/saved",
    response_model=SavedSearchList,
    summary="List saved searches",
    description="List all saved searches for the authenticated user"
)
async def list_saved_searches(
    limit: int = 50,
    api_key = Depends(validate_api_key)
):
    """
    List saved searches.
    
    Args:
        limit: Maximum number of results
        api_key: Validated API key (optional, but required to see own searches)
        
    Returns:
        SavedSearchList
    """
    try:
        search_service = get_search_service()
        
        api_key_id = api_key.key_id if api_key else None
        
        searches = await search_service.list_saved_searches(
            api_key_id=api_key_id,
            limit=limit
        )
        
        return SavedSearchList(
            searches=searches,
            total=len(searches)
        )
        
    except Exception as e:
        logger.error(f"Error listing saved searches: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list saved searches"
        )


@router.delete(
    "/saved/{search_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete saved search",
    description="Delete a saved search"
)
async def delete_saved_search(
    search_id: str,
    api_key = Depends(validate_api_key)
):
    """
    Delete a saved search.
    
    Args:
        search_id: Saved search ID
        api_key: Validated API key (required)
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required to delete searches"
            )
        
        search_service = get_search_service()
        
        # Verify ownership
        searches = await search_service.list_saved_searches(
            api_key_id=api_key.key_id,
            limit=1000
        )
        
        search = next((s for s in searches if s.id == search_id), None)
        if not search:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Saved search not found: {search_id}"
            )
        
        if search.created_by != api_key.key_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you can only delete your own saved searches"
            )
        
        success = await search_service.delete_saved_search(search_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete saved search"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting saved search: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete saved search"
        )

