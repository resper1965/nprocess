"""
Admin Control Plane API
Central administrative API for ComplianceEngine Platform
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import routers
from app.routers import (
    apikeys,
    users,
    ai_keys,
    finops,
    services,
    audit,
    chat
)
from app.schemas import HealthResponse

# Create FastAPI app
app = FastAPI(
    title="Admin Control Plane API",
    description="Administrative API for ComplianceEngine Platform - User Management, API Keys, FinOps, AI Keys, and Gemini Chat",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/v1/auth", tags=["Authentication"])
app.include_router(apikeys.router, prefix="/v1/admin/apikeys", tags=["API Keys"])
app.include_router(users.router, prefix="/v1/admin/users", tags=["Users"])
app.include_router(ai_keys.router, prefix="/v1/admin/ai-keys", tags=["AI Keys"])
app.include_router(finops.router, prefix="/v1/admin/finops", tags=["FinOps"])
app.include_router(services.router, prefix="/v1/admin/services", tags=["Services"])
app.include_router(audit.router, prefix="/v1/admin/audit", tags=["Audit Logs"])
app.include_router(chat.router, prefix="/v1/admin/chat", tags=["Chat with Gemini"])


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="admin-control-plane",
        version="1.0.0",
        timestamp=datetime.utcnow(),
        dependencies={
            "database": "connected",
            "secret_manager": "available",
            "gemini": "available"
        }
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Admin Control Plane API",
        "version": "1.0.0",
        "description": "Administrative API for ComplianceEngine Platform",
        "docs": "/docs",
        "health": "/health"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") == "true" else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
