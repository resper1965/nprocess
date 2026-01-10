"""Routers module - API endpoints"""

from app.routers.health import router as health_router
from app.routers.system import router as system_router

__all__ = ["health_router", "system_router"]
