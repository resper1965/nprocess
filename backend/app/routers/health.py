"""Health check endpoint."""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    """
    Health check endpoint for load balancers and monitoring.
    
    Returns:
        Status indicating the service is healthy.
    """
    return {
        "status": "healthy",
        "service": "n.process",
        "version": "0.1.0",
    }


@router.get("/")
async def root() -> dict:
    """Root endpoint with service information."""
    return {
        "service": "n.process",
        "description": "Middleware de Inteligência - Control Plane",
        "docs": "/docs",
        "health": "/health",
    }
