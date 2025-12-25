"""
Authentication router for Admin Dashboard
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.services.db import get_db
from app.services.user_service import UserService
from app.schemas import UserResponse, UserRole, UserStatus
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

router = APIRouter()
security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    user: UserResponse
    token: Optional[str] = None  # For future JWT implementation


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password"""
    user_service = UserService(db)
    
    user = user_service.authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Map to UserResponse
    user_response = UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        role=UserRole(user["role"]),
        status=UserStatus.ACTIVE if user["is_active"] else UserStatus.INACTIVE,
        created_at=user["created_at"],
        updated_at=user["updated_at"],
        last_login_at=user.get("last_login")
    )
    
    return LoginResponse(user=user_response)


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user (for future JWT implementation)"""
    # TODO: Implement JWT token validation
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/verify", response_model=UserResponse)
async def verify_credentials(request: LoginRequest, db: Session = Depends(get_db)):
    """Verify user credentials (used by NextAuth)"""
    user_service = UserService(db)
    
    user = user_service.authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    
    # Map to UserResponse
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        role=UserRole(user["role"]),
        status=UserStatus.ACTIVE if user["is_active"] else UserStatus.INACTIVE,
        created_at=user["created_at"],
        updated_at=user["updated_at"],
        last_login_at=user.get("last_login")
    )

