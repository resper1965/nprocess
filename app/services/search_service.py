"""
Advanced search service for ComplianceEngine.
"""
import logging
import time
from datetime import datetime
from typing import Dict, List, Optional, Any, Set

from google.cloud import firestore

from app.schemas_search import (
    SearchRequest,
    SearchResult,
    SearchResponse,
    SearchSuggestion,
    SavedSearch,
    SavedSearchCreate,
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

PROCESSES_COLLECTION = "processes"
SAVED_SEARCHES_COLLECTION = "saved_searches"


# ============================================================================
# Search Service
# ============================================================================

class SearchService:
    """Service for advanced process search."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize search service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("SearchService initialized")
        except Exception as e:
            logger.error(f"Error initializing SearchService: {e}")
            raise
    
    def _calculate_relevance(
        self,
        process_data: Dict[str, Any],
        query: str
    ) -> float:
        """
        Calculate relevance score for a process against a query.
        
        Simple implementation - can be enhanced with TF-IDF, semantic search, etc.
        
        Args:
            process_data: Process data
            query: Search query
            
        Returns:
            Relevance score (0-1)
        """
        if not query:
            return 1.0
        
        query_lower = query.lower()
        query_terms = query_lower.split()
        
        # Search in name, description, domain, category
        text_fields = [
            process_data.get("name", ""),
            process_data.get("description", ""),
            process_data.get("domain", ""),
            process_data.get("category", ""),
        ]
        
        combined_text = " ".join(text_fields).lower()
        
        # Count matches
        matches = sum(1 for term in query_terms if term in combined_text)
        
        # Calculate score (simple: matches / total terms)
        if len(query_terms) == 0:
            return 1.0
        
        score = matches / len(query_terms)
        
        # Boost if query appears in name
        if query_lower in process_data.get("name", "").lower():
            score = min(1.0, score + 0.3)
        
        return score
    
    def _extract_highlights(
        self,
        process_data: Dict[str, Any],
        query: str
    ) -> Dict[str, List[str]]:
        """
        Extract text highlights matching the query.
        
        Args:
            process_data: Process data
            query: Search query
            
        Returns:
            Dictionary of field -> highlighted snippets
        """
        if not query:
            return {}
        
        query_lower = query.lower()
        highlights = {}
        
        # Extract from description
        description = process_data.get("description", "")
        if query_lower in description.lower():
            # Simple snippet (first 200 chars around match)
            idx = description.lower().find(query_lower)
            start = max(0, idx - 50)
            end = min(len(description), idx + len(query) + 50)
            snippet = description[start:end]
            if "description" not in highlights:
                highlights["description"] = []
            highlights["description"].append(snippet)
        
        return highlights
    
    async def search_processes(
        self,
        request: SearchRequest
    ) -> SearchResponse:
        """
        Search processes with advanced filters.
        
        Args:
            request: Search request
            
        Returns:
            SearchResponse
        """
        start_time = time.time()
        
        try:
            # Build query
            query = self.db.collection(PROCESSES_COLLECTION)
            
            # Apply filters
            if request.category:
                query = query.where("category", "==", request.category)
            
            if request.domain:
                query = query.where("domain", "==", request.domain)
            
            if request.owner:
                query = query.where("owner", "==", request.owner)
            
            if request.created_after:
                query = query.where("created_at", ">=", request.created_after)
            
            if request.created_before:
                query = query.where("created_at", "<=", request.created_before)
            
            # Note: Firestore doesn't support array_contains_all, so we'll filter tags in Python
            # Also, full-text search is not supported natively, so we'll do it in Python
            
            # Get all matching documents
            docs = list(query.stream())
            
            # Filter by tags (if specified)
            if request.tags:
                filtered_docs = []
                for doc in docs:
                    data = doc.to_dict()
                    process_tags = data.get("tags", [])
                    # Check if all requested tags are present
                    if all(tag in process_tags for tag in request.tags):
                        filtered_docs.append(doc)
                docs = filtered_docs
            
            # Full-text search (if query provided)
            if request.query:
                # Score and filter by relevance
                scored_docs = []
                for doc in docs:
                    data = doc.to_dict()
                    relevance = self._calculate_relevance(data, request.query)
                    if relevance > 0:  # Only include if some relevance
                        scored_docs.append((doc, relevance, data))
                
                # Sort by relevance
                scored_docs.sort(key=lambda x: x[1], reverse=True)
                docs = [doc for doc, _, _ in scored_docs]
            else:
                # No query - just get data for sorting
                scored_docs = [(doc, 1.0, doc.to_dict()) for doc in docs]
            
            # Sort
            if request.sort_by == "relevance" and request.query:
                # Already sorted by relevance above
                pass
            elif request.sort_by == "created_at":
                scored_docs.sort(
                    key=lambda x: x[2].get("created_at", datetime.min),
                    reverse=(request.sort_order == "desc")
                )
            elif request.sort_by == "name":
                scored_docs.sort(
                    key=lambda x: x[2].get("name", "").lower(),
                    reverse=(request.sort_order == "desc")
                )
            elif request.sort_by == "updated_at":
                scored_docs.sort(
                    key=lambda x: x[2].get("updated_at", x[2].get("created_at", datetime.min)),
                    reverse=(request.sort_order == "desc")
                )
            
            # Apply pagination
            total = len(scored_docs)
            start_idx = (request.page - 1) * request.limit
            end_idx = start_idx + request.limit
            paginated_docs = scored_docs[start_idx:end_idx]
            
            # Build results
            results = []
            for doc, relevance, data in paginated_docs:
                highlights = self._extract_highlights(data, request.query) if request.query else {}
                
                result = SearchResult(
                    process_id=doc.id,
                    name=data.get("name", ""),
                    description=data.get("description", ""),
                    domain=data.get("domain"),
                    category=data.get("category"),
                    tags=data.get("tags", []),
                    owner=data.get("owner"),
                    created_at=data.get("created_at", datetime.utcnow()),
                    updated_at=data.get("updated_at"),
                    relevance_score=relevance if request.query else None,
                    highlights=highlights,
                )
                results.append(result)
            
            query_time = (time.time() - start_time) * 1000  # Convert to ms
            
            total_pages = (total + request.limit - 1) // request.limit
            
            logger.info(
                f"Search completed: {len(results)}/{total} results in {query_time:.2f}ms"
            )
            
            return SearchResponse(
                results=results,
                total=total,
                page=request.page,
                page_size=request.limit,
                total_pages=total_pages,
                query_time_ms=query_time,
            )
            
        except Exception as e:
            logger.error(f"Error searching processes: {e}")
            raise
    
    async def get_suggestions(
        self,
        query: str,
        limit: int = 10
    ) -> List[SearchSuggestion]:
        """
        Get search autocomplete suggestions.
        
        Args:
            query: Partial query string
            limit: Maximum number of suggestions
            
        Returns:
            List of SearchSuggestion
        """
        try:
            query_lower = query.lower()
            suggestions = []
            
            # Get all processes for suggestions
            processes = self.db.collection(PROCESSES_COLLECTION).limit(100).stream()
            
            process_names = set()
            tags = set()
            categories = set()
            domains = set()
            
            for doc in processes:
                data = doc.to_dict()
                
                # Process names
                name = data.get("name", "")
                if query_lower in name.lower():
                    process_names.add(name)
                
                # Tags
                for tag in data.get("tags", []):
                    if query_lower in tag.lower():
                        tags.add(tag)
                
                # Categories
                category = data.get("category", "")
                if category and query_lower in category.lower():
                    categories.add(category)
                
                # Domains
                domain = data.get("domain", "")
                if domain and query_lower in domain.lower():
                    domains.add(domain)
            
            # Build suggestions
            for name in list(process_names)[:limit]:
                suggestions.append(SearchSuggestion(
                    text=name,
                    type="process",
                    count=None
                ))
            
            for tag in list(tags)[:limit]:
                suggestions.append(SearchSuggestion(
                    text=tag,
                    type="tag",
                    count=None
                ))
            
            for category in list(categories)[:limit]:
                suggestions.append(SearchSuggestion(
                    text=category,
                    type="category",
                    count=None
                ))
            
            for domain in list(domains)[:limit]:
                suggestions.append(SearchSuggestion(
                    text=domain,
                    type="domain",
                    count=None
                ))
            
            # Limit total suggestions
            return suggestions[:limit]
            
        except Exception as e:
            logger.error(f"Error getting suggestions: {e}")
            return []
    
    async def create_saved_search(
        self,
        api_key_id: str,
        request: SavedSearchCreate
    ) -> SavedSearch:
        """
        Create a saved search.
        
        Args:
            api_key_id: API key ID of creator
            request: Saved search creation request
            
        Returns:
            SavedSearch
        """
        try:
            now = datetime.utcnow()
            search_data = {
                "name": request.name,
                "description": request.description,
                "search_query": request.search_query,
                "created_by": api_key_id,
                "created_at": now,
                "last_used_at": None,
                "use_count": 0,
            }
            
            doc_ref = self.db.collection(SAVED_SEARCHES_COLLECTION).document()
            doc_ref.set(search_data)
            
            search_id = doc_ref.id
            
            logger.info(f"Saved search created: {search_id} by {api_key_id}")
            
            return SavedSearch(
                id=search_id,
                name=request.name,
                description=request.description,
                search_query=request.search_query,
                created_by=api_key_id,
                created_at=now,
                last_used_at=None,
                use_count=0,
            )
            
        except Exception as e:
            logger.error(f"Error creating saved search: {e}")
            raise
    
    async def list_saved_searches(
        self,
        api_key_id: Optional[str] = None,
        limit: int = 50
    ) -> List[SavedSearch]:
        """
        List saved searches.
        
        Args:
            api_key_id: Filter by creator (if provided)
            limit: Maximum number of results
            
        Returns:
            List of SavedSearch
        """
        try:
            query = self.db.collection(SAVED_SEARCHES_COLLECTION)
            
            if api_key_id:
                query = query.where("created_by", "==", api_key_id)
            
            query = query.order_by("last_used_at", direction=firestore.Query.DESCENDING)
            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)
            
            docs = query.stream()
            
            searches = []
            for doc in docs:
                data = doc.to_dict()
                
                search = SavedSearch(
                    id=doc.id,
                    name=data["name"],
                    description=data.get("description"),
                    search_query=data["search_query"],
                    created_by=data["created_by"],
                    created_at=data["created_at"],
                    last_used_at=data.get("last_used_at"),
                    use_count=data.get("use_count", 0),
                )
                searches.append(search)
            
            return searches
            
        except Exception as e:
            logger.error(f"Error listing saved searches: {e}")
            raise
    
    async def delete_saved_search(
        self,
        search_id: str
    ) -> bool:
        """
        Delete a saved search.
        
        Args:
            search_id: Saved search ID
            
        Returns:
            True if deleted successfully
        """
        try:
            doc_ref = self.db.collection(SAVED_SEARCHES_COLLECTION).document(search_id)
            
            if not doc_ref.get().exists:
                logger.warning(f"Saved search not found: {search_id}")
                return False
            
            doc_ref.delete()
            
            logger.info(f"Saved search deleted: {search_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting saved search: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_search_service_instance: Optional[SearchService] = None


def get_search_service() -> SearchService:
    """Return singleton instance of SearchService."""
    global _search_service_instance
    if _search_service_instance is None:
        _search_service_instance = SearchService()
    return _search_service_instance

