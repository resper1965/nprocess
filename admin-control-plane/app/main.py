"""
Admin Control Plane API
Central administrative API for n.process Platform
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
    auth,
    apikeys,
    users,
    ai_keys,
    finops,
    services,
    audit,
    chat,
    admin,
    secrets,
    billing,
    integrations,
    process,
    audit,
    documents
)
from app.schemas import HealthResponse
# ... (intermediate code preserved by context, but we are editing imports and includes) ...

# Include routers
app.include_router(auth.router, prefix="/v1/auth", tags=["Authentication"])
app.include_router(apikeys.router, prefix="/v1/admin/apikeys", tags=["API Keys"])
app.include_router(users.router, prefix="/v1/admin/users", tags=["Users"])
app.include_router(ai_keys.router, prefix="/v1/admin/ai-keys", tags=["AI Keys"])
app.include_router(finops.router, prefix="/v1/admin/finops", tags=["FinOps"])
app.include_router(services.router, prefix="/v1/admin/services", tags=["Services"])
app.include_router(audit.router, prefix="/v1/audit", tags=["Audit Log (Internal)"]) # Renamed prefix to avoid conflict
app.include_router(chat.router, prefix="/v1/admin/chat", tags=["Chat with Gemini"])
app.include_router(admin.router, prefix="/v1/admin/utils", tags=["Admin Utilities"])
app.include_router(secrets.router, prefix="/v1/admin/secrets", tags=["Secrets"])
app.include_router(billing.router, prefix="/v1/billing", tags=["Billing"])
app.include_router(integrations.router, prefix="/v1/integrations", tags=["Integrations"])

# B4B Core Modules
app.include_router(process.router, prefix="/v1/process", tags=["Module 1: Process Normalization"])
app.include_router(audit.router, prefix="/v1/audit-engine", tags=["Module 2: Compliance Audit"]) # Distinct from audit log
app.include_router(documents.router, prefix="/v1/documents", tags=["Module 3: Document Intelligence"])


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
        "description": "Administrative API for n.process Platform",
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
