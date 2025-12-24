"""Services Monitoring Router"""
from fastapi import APIRouter, Depends
from typing import List
from app.schemas import ServiceHealth, ServiceInfo
from app.middleware.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[ServiceInfo])
async def list_services(current_user: dict = Depends(get_current_user)):
    """List all services"""
    # TODO: Get from service registry
    return []

@router.get("/{service_id}/health", response_model=ServiceHealth)
async def get_service_health(service_id: str, current_user: dict = Depends(get_current_user)):
    """Get service health status"""
    return ServiceHealth(
        service_id=service_id,
        service_name=service_id,
        status="healthy",
        uptime_percent=99.9,
        last_check_at=datetime.utcnow(),
        response_time_ms=123.4
    )
