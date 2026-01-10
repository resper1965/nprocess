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


# Create FastAPI application
app = FastAPI(
    title="n.process",
    description="Middleware de Inteligência - Control Plane. "
    "Provides AI capabilities (BPMN, Compliance, Docs) for external systems via API and MCP.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

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

# Future routers (to be implemented)
# app.include_router(process_router, prefix="/v1/process")
# app.include_router(compliance_router, prefix="/v1/compliance")
# app.include_router(documents_router, prefix="/v1/documents")
# app.include_router(mcp_router, prefix="/mcp")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
    )
