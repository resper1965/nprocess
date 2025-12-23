"""
RegulatoryRAG API - Regulatory Knowledge Base with Semantic Search

This microservice provides regulatory document search using Vertex AI Search
with Redis caching for improved performance.

Author: ComplianceEngine Team
License: MIT
"""

from contextlib import asynccontextmanager
from typing import Optional
import logging

from fastapi import FastAPI, HTTPException, status, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import (
    RegulationSearchRequest,
    RegulationSearchResponse,
    RegulationDomain,
    HealthResponse,
    ErrorResponse
)
from app.services.vertex_ai_search import get_search_service
from app.services.cache_service import get_cache_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# Application Lifespan
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting RegulatoryRAG API...")

    # Initialize services
    search_service = get_search_service()
    cache_service = get_cache_service()

    logger.info("Services initialized successfully")
    logger.info("RegulatoryRAG API is ready to serve requests")

    yield

    # Shutdown
    logger.info("Shutting down RegulatoryRAG API...")

    # Close connections if needed
    try:
        cache_service.close()
    except Exception as e:
        logger.error(f"Error closing cache service: {e}")

    logger.info("RegulatoryRAG API shutdown complete")

# ============================================================================
# Application Configuration
# ============================================================================

app = FastAPI(
    title="RegulatoryRAG API",
    description="Regulatory Knowledge Base with Semantic Search powered by Vertex AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Security - API Key Validation
# ============================================================================

async def validate_api_key(authorization: Optional[str] = Header(None)):
    """
    Validate API key from Authorization header

    Expected format: Bearer <api_key>
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )

    try:
        scheme, _, credentials = authorization.partition(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization scheme. Expected: Bearer"
            )

        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing API key"
            )

        # TODO: Validate API key against ComplianceEngine API
        # For now, just check if it's not empty
        # In production, call ComplianceEngine /v1/admin/apikeys/validate

        return credentials

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )

# ============================================================================
# Health Check Endpoint
# ============================================================================

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"]
)
async def health_check():
    """
    Health check endpoint for monitoring and load balancers
    """
    return HealthResponse(
        status="healthy",
        service="regulatory-rag-api",
        version="1.0.0"
    )

# ============================================================================
# Regulation Search Endpoints
# ============================================================================

@app.post(
    "/v1/regulations/search",
    response_model=RegulationSearchResponse,
    tags=["Regulations"],
    summary="Search regulations by semantic query",
    description="""
    Search for relevant regulations using semantic search powered by Vertex AI.

    This endpoint:
    - Uses Vertex AI Search for semantic understanding
    - Caches results for improved performance
    - Returns top-k most relevant regulations with quality scores
    - Supports filtering by regulation domain
    """
)
async def search_regulations(
    request: RegulationSearchRequest,
    api_key: str = Depends(validate_api_key)
):
    """
    Search for regulations based on query

    Args:
        request: Search request with query and filters
        api_key: Validated API key from header

    Returns:
        Search response with relevant regulations
    """
    try:
        search_service = get_search_service()
        cache_service = get_cache_service()

        # Generate cache key
        cache_key = cache_service.generate_cache_key(
            query=request.query,
            domain=request.domain,
            top_k=request.top_k
        )

        # Check cache
        cached_result = cache_service.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for query: {request.query[:50]}...")
            return RegulationSearchResponse(**cached_result)

        # Perform search
        logger.info(f"Performing search for query: {request.query[:50]}...")
        result = await search_service.search(
            query=request.query,
            domain=request.domain,
            top_k=request.top_k,
            min_quality_score=request.min_quality_score
        )

        # Cache the result
        cache_service.set(cache_key, result.dict(), ttl=3600)  # 1 hour TTL

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching regulations: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search regulations: {str(e)}"
        )

@app.get(
    "/v1/regulations/domains",
    response_model=list[str],
    tags=["Regulations"],
    summary="Get available regulation domains",
    description="Returns a list of all available regulation domains"
)
async def get_regulation_domains(
    api_key: str = Depends(validate_api_key)
):
    """
    Get list of available regulation domains

    Returns:
        List of domain names
    """
    # Available domains
    domains = [
        "banking",
        "finance",
        "healthcare",
        "insurance",
        "data_privacy",
        "labor",
        "tax",
        "environmental",
        "securities",
        "anti_money_laundering"
    ]

    return domains

@app.get(
    "/v1/regulations/{regulation_id}",
    response_model=dict,
    tags=["Regulations"],
    summary="Get regulation by ID",
    description="Retrieve full regulation details by ID"
)
async def get_regulation_by_id(
    regulation_id: str,
    api_key: str = Depends(validate_api_key)
):
    """
    Get regulation details by ID

    Args:
        regulation_id: Unique regulation identifier
        api_key: Validated API key

    Returns:
        Regulation details
    """
    try:
        search_service = get_search_service()
        cache_service = get_cache_service()

        # Check cache
        cache_key = f"regulation:{regulation_id}"
        cached_result = cache_service.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for regulation: {regulation_id}")
            return cached_result

        # Fetch from search service
        result = await search_service.get_by_id(regulation_id)

        # Cache the result
        cache_service.set(cache_key, result, ttl=86400)  # 24 hour TTL

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching regulation {regulation_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Regulation not found: {regulation_id}"
        )

# ============================================================================
# Cache Management Endpoints (Admin Only)
# ============================================================================

@app.delete(
    "/v1/admin/cache/clear",
    tags=["Admin"],
    summary="Clear cache",
    description="Clear all cached data (admin only)"
)
async def clear_cache(
    api_key: str = Depends(validate_api_key)
):
    """
    Clear all cached data

    Note: In production, add admin role validation
    """
    try:
        cache_service = get_cache_service()
        cache_service.clear_all()

        logger.info("Cache cleared successfully")
        return {"message": "Cache cleared successfully"}

    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cache: {str(e)}"
        )

# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """
    Custom HTTP exception handler
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            status_code=exc.status_code
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """
    General exception handler for uncaught exceptions
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal server error",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        ).dict()
    )

# ============================================================================
# Root Endpoint
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information
    """
    return {
        "service": "RegulatoryRAG API",
        "version": "1.0.0",
        "description": "Regulatory Knowledge Base with Semantic Search",
        "docs": "/docs",
        "health": "/health"
    }
