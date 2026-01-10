"""
n.process Backend - FastAPI Application

Middleware de Inteligência - Control Plane
Provides AI capabilities (BPMN, Compliance, Docs) via API and MCP.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import health_router, system_router
from app.routers.knowledge import router as knowledge_router
from app.routers.process import router as process_router
from app.routers.compliance import router as compliance_router
from app.routers.documents import router as documents_router
from app.routers.mcp import router as mcp_router

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    logger.info("n.process Backend starting up...")
    logger.info(f"GCP Project: {settings.gcp_project_id}")
    logger.info(f"Debug mode: {settings.debug}")
    yield
    logger.info("n.process Backend shutting down...")


# Create FastAPI application with security scheme for Swagger UI
app = FastAPI(
    title="n.process",
    description="Middleware de Inteligência - Control Plane. "
    "Provides AI capabilities (BPMN, Compliance, Docs) for external systems via API and MCP.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={
        "persistAuthorization": True,  # Keep auth between page refreshes
    },
    openapi_tags=[
        {"name": "Health", "description": "Health check endpoints"},
        {"name": "System", "description": "System administration"},
        {"name": "Knowledge Store", "description": "Document ingestion and semantic search"},
        {"name": "Process Engine", "description": "BPMN 2.0 diagram generation"},
        {"name": "Compliance Guard", "description": "Legal compliance audit"},
        {"name": "Document Factory", "description": "Professional document generation"},
        {"name": "MCP Server", "description": "Model Context Protocol for agent integration"},
    ],
)

# Add security scheme to OpenAPI
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=app.openapi_tags,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Firebase ID Token. Get from frontend after login.",
        }
    }
    # Apply security to all endpoints
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(system_router)
app.include_router(knowledge_router)
app.include_router(process_router)
app.include_router(compliance_router)
app.include_router(documents_router)
app.include_router(mcp_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
    )
