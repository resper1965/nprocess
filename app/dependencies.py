"""
Core Dependencies for n.process API.
Handles Authentication, Tenant Resolution, and Service Injection.
"""
import os
from typing import Optional
from fastapi import Header, HTTPException, status, Depends
import logging

logger = logging.getLogger(__name__)

# Mock API Key Database for Demo/MVP
# In production, this would be a Firestore lookup or Secret Manager
API_KEYS = {
    "ness-secure-key": "system",  # Admin/System Scope
    "client-a-key": "client_a",
    "client-b-key": "client_b"
}

async def get_current_tenant(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")
) -> str:
    """
    Resolves the strict 'tenant_id' for the current request.
    
    Rules:
    1. If X-API-Key provided: Resolve Tenant from Key.
    2. If X-Tenant-ID provided: Only allowed if Key is 'system' (Admin override).
    3. Else: Raise 401.
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header"
        )

    # 1. Resolve Tenant from Key
    resolved_tenant = API_KEYS.get(x_api_key)
    
    if not resolved_tenant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key"
        )
        
    # 2. Handle System/Admin Override
    if resolved_tenant == "system":
        # System admin can impersonate/operate on specific tenants if provided
        if x_tenant_id:
            return x_tenant_id
        return "system"
        
    # 3. Regular Client - Enforced Tenant
    # Client A cannot pretend to be Client B
    if x_tenant_id and x_tenant_id != resolved_tenant:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Tenant mismatch. Key belongs to {resolved_tenant}"
        )

    return resolved_tenant

async def require_system_admin(
    tenant_id: str = Depends(get_current_tenant)
) -> None:
    """Dependency to enforce System Admin access only."""
    if tenant_id != "system":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires System Admin privileges"
        )
