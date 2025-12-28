"""
Authentication router for Admin Dashboard
Unified authentication using Firebase Auth
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.middleware.auth import get_current_user
from app.schemas import UserResponse, UserRole, UserStatus
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()
security = HTTPBearer(auto_error=False)


class VerifyTokenRequest(BaseModel):
    """Request to verify Firebase ID token"""
    id_token: str


class VerifyTokenResponse(BaseModel):
    """Response with user info from verified token"""
    user: UserResponse
    valid: bool = True


@router.post("/verify", response_model=VerifyTokenResponse)
async def verify_token(request: VerifyTokenRequest):
    """
    Verify Firebase ID token and return user information.
    
    This endpoint is used by the Client Portal to verify tokens
    and get user information from the Admin Control Plane.
    """
    from app.services.firebase_service import verify_firebase_token, get_user_role
    
    decoded_token = verify_firebase_token(request.id_token)
    
    if not decoded_token:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
    
    # Get role from token or Firestore
    role = get_user_role(decoded_token) or "user"
    
    # Map to UserResponse
    user_response = UserResponse(
        user_id=decoded_token.get("uid"),
        email=decoded_token.get("email") or "",
        name=decoded_token.get("name") or decoded_token.get("display_name") or "",
        role=UserRole(role),
        status=UserStatus.ACTIVE,  # Firebase users are active by default
        created_at=datetime.utcnow(),  # Will be fetched from Firestore if needed
        updated_at=datetime.utcnow(),
        last_login_at=None
    )
    
    return VerifyTokenResponse(user=user_response, valid=True)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user from Firebase token.
    
    Returns user information based on the Firebase ID token
    provided in the Authorization header.
    """
    # Map current_user dict to UserResponse
    return UserResponse(
        user_id=current_user.get("uid") or current_user.get("user_id"),
        email=current_user.get("email", ""),
        name=current_user.get("name", ""),
        role=UserRole(current_user.get("role", "user")),
        status=UserStatus.ACTIVE,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        last_login_at=None
    )

