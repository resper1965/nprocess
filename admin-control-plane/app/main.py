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

# Import custom middlewares
from app.middleware.logging_middleware import setup_structured_logging, LoggingMiddleware, get_logger
from app.middleware.rate_limit import RateLimitMiddleware

# Configure structured logging
setup_structured_logging(log_level=os.getenv("LOG_LEVEL", "INFO"))
logger = get_logger(__name__)

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
    documents,
    kbs
)
from app.schemas import HealthResponse
# ... (intermediate code preserved by context) ...
# Initialize FastAPI app
app = FastAPI(
    title="Admin Control Plane API",
    description="Administrative API for n.process Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

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

# Knowledge Base Marketplace
app.include_router(kbs.router, prefix="/v1/admin/kbs", tags=["Knowledge Bases"])

# MCP Server Integration (SSE Transport)
from app.mcp_server import mcp
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from app.services.apikey_service import APIKeyService

# Mount FastMCP app (it is a FastAPI app)
# Configured for SSE at /sse and Messages at /messages
app.mount("/mcp", mcp.sse_app)

# MCP Authentication Middleware
@app.middleware("http")
async def mcp_auth_middleware(request: Request, call_next):
    # Only protect /mcp routes
    if request.url.path.startswith("/mcp"):
        # Check for API Key
        api_key = request.headers.get("X-API-Key")
        if not api_key:
             return JSONResponse(status_code=401, content={"error": "Missing X-API-Key header"})
        
        # Validate Key
        service = APIKeyService()
        result = await service.validate_key_string(api_key)
        
        if not result["valid"]:
            return JSONResponse(status_code=403, content={"error": result["message"]})
        
        # Inject client context (TODO: Pass to MCP context if supported)
        request.state.client_id = result["key_data"]["consumer_app_id"]
        
    response = await call_next(request)
    return response


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


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173",
        "https://nprocess-frontend-s7tmkmao2a-uc.a.run.app",
        "https://*.run.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Rate Limiting Middleware (60 req/min per client)
app.add_middleware(RateLimitMiddleware)

# Add Logging Middleware (correlation IDs, request logging)
app.add_middleware(LoggingMiddleware)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
