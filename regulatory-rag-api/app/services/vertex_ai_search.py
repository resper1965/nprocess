"""
Vertex AI Search Service

Integrates with Google Cloud Vertex AI Search for semantic search
over regulatory documents.
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import os

from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.exceptions import GoogleAPIError

from app.schemas import RegulationSearchResponse, RegulationResult

logger = logging.getLogger(__name__)

# ============================================================================
# Configuration
# ============================================================================

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "nprocess")
LOCATION = os.getenv("VERTEX_AI_SEARCH_LOCATION", "global")
DATA_STORE_ID = os.getenv("VERTEX_AI_DATA_STORE_ID", "regulations-datastore")
SERVING_CONFIG = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATA_STORE_ID}/servingConfigs/default_config"

# ============================================================================
# Vertex AI Search Service
# ============================================================================

class VertexAISearchService:
    """
    Service for semantic search using Vertex AI Search
    """

    def __init__(self):
        """Initialize Vertex AI Search client"""
        try:
            self.client = discoveryengine.SearchServiceClient()
            logger.info("Vertex AI Search client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI Search client: {e}")
            raise

    async def search(
        self,
        query: str,
        domain: Optional[str] = None,
        top_k: int = 10,
        min_quality_score: float = 0.7
    ) -> RegulationSearchResponse:
        """
        Search for regulations using Vertex AI Search

        Args:
            query: Search query in natural language
            domain: Optional domain filter
            top_k: Number of results to return
            min_quality_score: Minimum quality score threshold

        Returns:
            RegulationSearchResponse with results
        """
        try:
            start_time = datetime.utcnow()

            # Build search request
            request = discoveryengine.SearchRequest(
                serving_config=SERVING_CONFIG,
                query=query,
                page_size=top_k,
                # Add filter for domain if specified
                filter=f"domain: ANY(\"{domain}\")" if domain else None,
                # Boost recent documents
                boost_spec=discoveryengine.SearchRequest.BoostSpec(
                    condition_boost_specs=[
                        discoveryengine.SearchRequest.BoostSpec.ConditionBoostSpec(
                            condition="published_date > \"2020-01-01\"",
                            boost=1.2
                        )
                    ]
                ),
                # Content search spec
                content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
                    snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                        max_snippet_count=3,
                        return_snippet=True
                    ),
                    summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
                        summary_result_count=5,
                        include_citations=True
                    )
                )
            )

            # Execute search
            logger.info(f"Executing Vertex AI Search for query: {query[:50]}...")
            response = self.client.search(request)

            # Parse results
            results = []
            total_results = 0

            for result in response.results:
                document = result.document

                # Extract document data
                doc_data = document.derived_struct_data

                # Calculate quality score (combine relevance and recency)
                quality_score = self._calculate_quality_score(
                    result.relevance_score if hasattr(result, 'relevance_score') else 0.8,
                    doc_data
                )

                # Filter by minimum quality score
                if quality_score < min_quality_score:
                    continue

                # Extract snippet
                snippet = ""
                if hasattr(result, 'document') and hasattr(result.document, 'derived_struct_data'):
                    snippets = doc_data.get('snippets', [])
                    if snippets:
                        snippet = snippets[0].get('snippet', '')

                # Create regulation result
                regulation = RegulationResult(
                    regulation_id=document.id,
                    title=doc_data.get('title', 'Untitled'),
                    description=doc_data.get('description', ''),
                    content_snippet=snippet,
                    domain=doc_data.get('domain', domain or 'general'),
                    authority=doc_data.get('authority', 'Unknown'),
                    document_number=doc_data.get('document_number', ''),
                    published_date=self._parse_date(doc_data.get('published_date')),
                    effective_date=self._parse_date(doc_data.get('effective_date')),
                    url=doc_data.get('url'),
                    quality_score=quality_score,
                    metadata=doc_data.get('metadata', {})
                )

                results.append(regulation)
                total_results += 1

            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000

            # Build response
            return RegulationSearchResponse(
                query=query,
                total_results=total_results,
                returned_results=len(results),
                results=results,
                search_metadata={
                    "processing_time_ms": processing_time,
                    "cache_hit": False,
                    "service": "vertex_ai_search",
                    "model": "enterprise_search"
                },
                searched_at=datetime.utcnow()
            )

        except GoogleAPIError as e:
            logger.error(f"Vertex AI Search API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in search: {e}", exc_info=True)
            raise

    async def search_by_datasets(
        self,
        query: str,
        datasets: List[str],
        top_k: int = 10,
        min_quality_score: float = 0.7
    ) -> RegulationSearchResponse:
        """
        Search for regulations filtered by Brazilian regulatory datasets

        Args:
            query: Search query in natural language
            datasets: List of datasets to search (e.g., ['aneel', 'ons', 'lgpd'])
            top_k: Number of results to return
            min_quality_score: Minimum quality score threshold

        Returns:
            RegulationSearchResponse with results from specified datasets
        """
        try:
            start_time = datetime.utcnow()

            # Build filter for datasets using OR logic
            # Example: source: ANY("aneel", "ons", "lgpd")
            datasets_filter = 'source: ANY("' + '", "'.join(datasets) + '")'

            logger.info(f"Filter applied: {datasets_filter}")

            # Build search request with dataset filter
            request = discoveryengine.SearchRequest(
                serving_config=SERVING_CONFIG,
                query=query,
                page_size=top_k,
                # Filter by datasets (source field)
                filter=datasets_filter,
                # Boost recent documents
                boost_spec=discoveryengine.SearchRequest.BoostSpec(
                    condition_boost_specs=[
                        discoveryengine.SearchRequest.BoostSpec.ConditionBoostSpec(
                            condition="published_date > \"2020-01-01\"",
                            boost=1.2
                        )
                    ]
                ),
                # Content search spec
                content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
                    snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                        max_snippet_count=3,
                        return_snippet=True
                    ),
                    summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
                        summary_result_count=5,
                        include_citations=True
                    )
                )
            )

            # Execute search
            logger.info(
                f"Executing Vertex AI Search in datasets {datasets}: "
                f"{query[:50]}..."
            )
            response = self.client.search(request)

            # Parse results (same logic as regular search)
            results = []
            total_results = 0

            for result in response.results:
                document = result.document
                doc_data = document.derived_struct_data

                # Calculate quality score
                quality_score = self._calculate_quality_score(
                    result.relevance_score if hasattr(result, 'relevance_score') else 0.8,
                    doc_data
                )

                # Filter by minimum quality score
                if quality_score < min_quality_score:
                    continue

                # Extract snippet
                snippet = ""
                if hasattr(result, 'document') and hasattr(result.document, 'derived_struct_data'):
                    snippets = doc_data.get('snippets', [])
                    if snippets:
                        snippet = snippets[0].get('snippet', '')

                # Create regulation result
                regulation = RegulationResult(
                    regulation_id=document.id,
                    title=doc_data.get('title', 'Untitled'),
                    description=doc_data.get('description', ''),
                    content_snippet=snippet,
                    domain=doc_data.get('domain', 'general'),
                    authority=doc_data.get('authority', 'Unknown'),
                    document_number=doc_data.get('document_number', ''),
                    published_date=self._parse_date(doc_data.get('published_date')),
                    effective_date=self._parse_date(doc_data.get('effective_date')),
                    url=doc_data.get('url'),
                    quality_score=quality_score,
                    metadata={
                        **doc_data.get('metadata', {}),
                        'source': doc_data.get('source', 'unknown')  # Include source/dataset
                    }
                )

                results.append(regulation)
                total_results += 1

            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000

            # Build response
            return RegulationSearchResponse(
                query=query,
                total_results=total_results,
                returned_results=len(results),
                results=results,
                search_metadata={
                    "processing_time_ms": processing_time,
                    "cache_hit": False,
                    "service": "vertex_ai_search",
                    "model": "enterprise_search",
                    "datasets_searched": datasets
                },
                searched_at=datetime.utcnow()
            )

        except GoogleAPIError as e:
            logger.error(f"Vertex AI Search API error (datasets search): {e}")
            raise
        except Exception as e:
            logger.error(
                f"Unexpected error in search_by_datasets: {e}",
                exc_info=True
            )
            raise

    async def get_by_id(self, regulation_id: str) -> Dict[str, Any]:
        """
        Get regulation by ID

        Args:
            regulation_id: Regulation ID

        Returns:
            Regulation data
        """
        try:
            # In production, implement actual document retrieval
            # For now, return mock data
            logger.warning(f"get_by_id not fully implemented. Returning mock for: {regulation_id}")

            return {
                "regulation_id": regulation_id,
                "title": "Sample Regulation",
                "description": "This is a sample regulation",
                "content": "Full regulation content would be here",
                "domain": "general",
                "authority": "Unknown",
                "document_number": "N/A"
            }

        except Exception as e:
            logger.error(f"Error fetching regulation {regulation_id}: {e}")
            raise

    def _calculate_quality_score(
        self,
        relevance_score: float,
        doc_data: Dict[str, Any]
    ) -> float:
        """
        Calculate quality score based on relevance and document attributes

        Args:
            relevance_score: Base relevance score from search
            doc_data: Document metadata

        Returns:
            Quality score between 0.0 and 1.0
        """
        # Start with relevance score
        quality = relevance_score

        # Boost for recent documents
        published_date = doc_data.get('published_date')
        if published_date:
            try:
                pub_date = datetime.fromisoformat(published_date.replace('Z', '+00:00'))
                years_old = (datetime.utcnow() - pub_date.replace(tzinfo=None)).days / 365.25

                # Reduce score for very old documents
                if years_old > 10:
                    quality *= 0.9
                elif years_old > 5:
                    quality *= 0.95
            except:
                pass

        # Ensure score is between 0 and 1
        return max(0.0, min(1.0, quality))

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse date string to datetime

        Args:
            date_str: Date string in ISO format

        Returns:
            Datetime object or None
        """
        if not date_str:
            return None

        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return None

# ============================================================================
# Service Instance (Singleton)
# ============================================================================

_search_service_instance: Optional[VertexAISearchService] = None

def get_search_service() -> VertexAISearchService:
    """
    Get or create the Vertex AI Search service instance (singleton)

    Returns:
        VertexAISearchService instance
    """
    global _search_service_instance

    if _search_service_instance is None:
        _search_service_instance = VertexAISearchService()

    return _search_service_instance
