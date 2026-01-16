from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

# --- TENANTS ---

class TenantBase(BaseModel):
    name: str
    plan: str = "starter"

class TenantCreate(TenantBase):
    pass

class TenantResponse(TenantBase):
    id: str
    created_at: Optional[datetime] = None
    settings: Optional[dict] = None

# --- API KEYS ---

class ApiKeyCreate(BaseModel):
    tenant_id: str
    budget: float = 100.0

class ApiKeyResponse(BaseModel):
    id: str  # Firestore Doc ID
    key_prefix: str # "np_xxxx..." (just the start)
    tenant_id: str
    status: str
    created_at: Optional[datetime] = None
    budget_limit: float

# --- USERS ---

class SystemUserResponse(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    org_id: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
