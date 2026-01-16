"""System administration endpoints - super_admin only."""

import logging
import secrets
import hashlib
from datetime import datetime
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import firestore, auth

from app.core.deps import get_current_user, require_super_admin
from app.core.security import get_user, set_custom_claims
from app.schemas.auth import ApproveUserRequest, ApproveUserResponse, CurrentUser, UserResponse
from app.schemas.system import (
    TenantCreate, TenantResponse, 
    ApiKeyCreate, ApiKeyResponse,
    SystemUserResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/system", tags=["System Admin"])

# Helper to get Firestore DB
def get_db():
    return firestore.client()

# --- USER MANAGEMENT ---

@router.post(
    "/approve_user",
    response_model=ApproveUserResponse,
    dependencies=[Depends(require_super_admin)],
)
async def approve_user(
    request: ApproveUserRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ApproveUserResponse:
    """Approve a pending user and assign them to an organization."""
    logger.info(f"Approving user {request.target_uid} for org {request.org_id}")

    try:
        # Get target user from Firebase
        target_user = get_user(request.target_uid)
        
        # Set custom claims
        new_claims = {
            "org_id": request.org_id,
            "role": request.role,
            "status": "active",
        }
        set_custom_claims(request.target_uid, new_claims)
        
        # Also update/create in Firestore 'users' collection for querying
        db = get_db()
        user_data = {
            "uid": target_user.uid,
            "email": target_user.email,
            "display_name": target_user.display_name,
            "photo_url": target_user.photo_url,
            "org_id": request.org_id,
            "role": request.role,
            "status": "active",
            "updated_at": datetime.utcnow()
        }
        db.collection("users").document(request.target_uid).set(user_data, merge=True)
        
        return ApproveUserResponse(
            success=True,
            message=f"User {target_user.email} approved",
            user=UserResponse(
                uid=target_user.uid,
                email=target_user.email or "",
                name=target_user.display_name or "",
                org_id=request.org_id,
                role=request.role,
                status="active",
            ),
        )
    except Exception as e:
        logger.error(f"Approval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users", response_model=List[SystemUserResponse], dependencies=[Depends(require_super_admin)])
async def list_users(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    status_filter: str | None = None,
):
    """List all users. Optional filter by status (e.g. 'pending')."""
    db = get_db()
    
    # Try Query Firestore 'users'
    users_ref = db.collection("users")
    if status_filter:
        query = users_ref.where("status", "==", status_filter)
        docs = query.stream()
    else:
        # Limit to 50 for safety
        docs = users_ref.limit(50).stream()
        
    results = []
    for doc in docs:
        d = doc.to_dict()
        results.append(SystemUserResponse(**d))
        
    # Fallback: If Firestore is empty (first run), fetch from Auth logic?
    # For now, assume Frontend will self-register via a trigger or we just iterate Auth
    if not results and not status_filter:
        # Fetch from Auth for bootstrap
        page = auth.list_users(max_results=20)
        for u in page.users:
            claims = u.custom_claims or {}
            results.append(SystemUserResponse(
                uid=u.uid,
                email=u.email or "",
                display_name=u.display_name,
                photo_url=u.photo_url,
                org_id=claims.get("org_id"),
                role=claims.get("role"),
                status=claims.get("status", "pending"),  # Default to pending if no status
                created_at=datetime.fromtimestamp(u.user_metadata.creation_timestamp / 1000) if u.user_metadata.creation_timestamp else None
            ))
            
    return results

# --- TENANT MANAGEMENT ---

@router.get("/tenants", response_model=List[TenantResponse], dependencies=[Depends(require_super_admin)])
async def list_tenants(current_user: Annotated[CurrentUser, Depends(get_current_user)]):
    """List all tenants."""
    db = get_db()
    docs = db.collection("tenants").stream()
    return [TenantResponse(id=d.id, **d.to_dict()) for d in docs]

@router.post("/tenants", response_model=TenantResponse, dependencies=[Depends(require_super_admin)])
async def create_tenant(
    tenant: TenantCreate,
    current_user: Annotated[CurrentUser, Depends(get_current_user)]
):
    """Create a new tenant."""
    db = get_db()
    new_ref = db.collection("tenants").document()
    
    data = tenant.dict()
    data["created_at"] = datetime.utcnow()
    data["settings"] = {"allowed_models": ["gemini-1.5-flash", "gemini-1.5-pro"]}
    
    new_ref.set(data)
    
    return TenantResponse(id=new_ref.id, **data)

# --- API KEY MANAGEMENT ---

@router.get("/keys", response_model=List[ApiKeyResponse], dependencies=[Depends(require_super_admin)])
async def list_keys(
    tenant_id: str,
    current_user: Annotated[CurrentUser, Depends(get_current_user)]
):
    """List API keys for a tenant."""
    db = get_db()
    # Query keys where tenant_id matches
    query = db.collection("api_keys").where("tenant_id", "==", tenant_id)
    docs = query.stream()
    
    results = []
    for doc in docs:
        d = doc.to_dict()
        # Ensure we don't leak full hash if we had it, but key_hash is safe (it's a hash)
        # We constructed the response to show prefix
        # If we stored raw key (bad), we should mask it. 
        # But we only store hash. We can't show the key.
        # We need to assume the model stores `key_prefix` or we synthesize it?
        # Let's synthesize.
        results.append(ApiKeyResponse(
            id=doc.id,
            key_prefix="np_****", # Can't recover
            tenant_id=d.get("tenant_id"),
            status=d.get("status", "active"),
            created_at=d.get("created_at"),
            budget_limit=d.get("budget_limit", 0.0)
        ))
    return results

@router.post("/keys", response_model=dict, dependencies=[Depends(require_super_admin)])
async def create_key(
    req: ApiKeyCreate,
    current_user: Annotated[CurrentUser, Depends(get_current_user)]
):
    """Generate a new API Key. Returns the raw key ONLY ONCE."""
    db = get_db()
    
    # Generate
    raw_key = f"np_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    data = {
        "key_hash": key_hash,
        "tenant_id": req.tenant_id,
        "budget_limit": req.budget,
        "usage_current_month": 0.0,
        "created_at": datetime.utcnow(),
        "status": "active",
        "created_by": current_user.uid
    }
    
    doc_ref = db.collection("api_keys").add(data)
    
    return {
        "key": raw_key,
        "message": "Save this key immediately. It cannot be retrieved again."
    }
