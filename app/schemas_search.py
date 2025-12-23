"""
Advanced search schemas for ComplianceEngine.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Search Schemas
# ============================================================================

class SearchRequest(BaseModel):
    """Request for advanced process search."""
    
    query: Optional[str] = Field(
        None,
        max_length=500,
        description="Full-text search query"
    )
    tags: Optional[List[str]] = Field(
        None,
        description="Filter by tags (AND logic - all tags must match)"
    )
    category: Optional[str] = Field(
        None,
        description="Filter by category"
    )
    domain: Optional[str] = Field(
        None,
        description="Filter by domain"
    )
    owner: Optional[str] = Field(
        None,
        description="Filter by owner"
    )
    created_after: Optional[datetime] = Field(
        None,
        description="Filter processes created after this date"
    )
    created_before: Optional[datetime] = Field(
        None,
        description="Filter processes created before this date"
    )
    sort_by: str = Field(
        "relevance",
        description="Sort by: 'relevance', 'created_at', 'name', 'updated_at'"
    )
    sort_order: str = Field(
        "desc",
        description="Sort order: 'asc' or 'desc'"
    )
    page: int = Field(1, ge=1, description="Page number (1-based)")
    limit: int = Field(20, ge=1, le=100, description="Results per page")


class SearchResult(BaseModel):
    """Single search result."""
    
    process_id: str
    name: str
    description: str
    domain: Optional[str]
    category: Optional[str]
    tags: List[str] = Field(default_factory=list)
    owner: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    relevance_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Relevance score (0-1) for search query"
    )
    highlights: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Highlighted text snippets matching the query"
    )


class SearchResponse(BaseModel):
    """Search response."""
    
    results: List[SearchResult]
    total: int
    page: int
    page_size: int
    total_pages: int
    query_time_ms: float = Field(
        ...,
        description="Query execution time in milliseconds"
    )


class SearchSuggestion(BaseModel):
    """Search autocomplete suggestion."""
    
    text: str
    type: str = Field(
        ...,
        description="Suggestion type: 'process', 'tag', 'category', 'domain'"
    )
    count: Optional[int] = Field(
        None,
        description="Number of results for this suggestion"
    )


class SearchSuggestionsResponse(BaseModel):
    """Search suggestions response."""
    
    suggestions: List[SearchSuggestion]
    query: str


class SavedSearch(BaseModel):
    """Saved search query."""
    
    id: str
    name: str
    description: Optional[str]
    search_query: Dict[str, Any] = Field(
        ...,
        description="Search parameters (SearchRequest as dict)"
    )
    created_by: str
    created_at: datetime
    last_used_at: Optional[datetime]
    use_count: int = 0


class SavedSearchCreate(BaseModel):
    """Request to create a saved search."""
    
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    search_query: Dict[str, Any] = Field(
        ...,
        description="Search parameters (SearchRequest as dict)"
    )


class SavedSearchList(BaseModel):
    """List of saved searches."""
    
    searches: List[SavedSearch]
    total: int

