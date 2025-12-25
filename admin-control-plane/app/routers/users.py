"""User Management Router"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserResponse, UserUpdate, UserRole, UserStatus
from app.middleware.auth import get_current_user
from app.services.db import get_db
from app.services.user_service import UserService
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=UserResponse)
async def create_user(
    request: UserCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new user"""
    user_service = UserService(db)
    
    try:
        user_data = user_service.create_user(
            email=request.email,
            name=request.name,
            password=request.password,
            role=request.role.value
        )
        
        return UserResponse(
            user_id=user_data["user_id"],
            email=user_data["email"],
            name=user_data["name"],
            role=UserRole(user_data["role"]),
            status=UserStatus.ACTIVE if user_data["is_active"] else UserStatus.INACTIVE,
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            last_login_at=user_data.get("last_login")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[UserResponse])
async def list_users(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0
):
    """List all users"""
    user_service = UserService(db)
    users = user_service.list_users(limit=limit, offset=offset)
    
    return [
        UserResponse(
            user_id=u["user_id"],
            email=u["email"],
            name=u["name"],
            role=UserRole(u["role"]),
            status=UserStatus.ACTIVE if u["is_active"] else UserStatus.INACTIVE,
            created_at=u["created_at"],
            updated_at=u["updated_at"],
            last_login_at=u.get("last_login")
        )
        for u in users
    ]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    user_service = UserService(db)
    user_data = user_service.get_user_by_id(user_id)
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        user_id=user_data["user_id"],
        email=user_data["email"],
        name=user_data["name"],
        role=UserRole(user_data["role"]),
        status=UserStatus.ACTIVE if user_data["is_active"] else UserStatus.INACTIVE,
        created_at=user_data["created_at"],
        updated_at=user_data["updated_at"],
        last_login_at=user_data.get("last_login")
    )

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    request: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user"""
    user_service = UserService(db)
    
    user_data = user_service.update_user(
        user_id=user_id,
        name=request.name,
        role=request.role.value if request.role else None,
        is_active=request.status == UserStatus.ACTIVE if request.status else None
    )
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        user_id=user_data["user_id"],
        email=user_data["email"],
        name=user_data["name"],
        role=UserRole(user_data["role"]),
        status=UserStatus.ACTIVE if user_data["is_active"] else UserStatus.INACTIVE,
        created_at=user_data["created_at"],
        updated_at=user_data["updated_at"],
        last_login_at=user_data.get("last_login")
    )

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user (soft delete)"""
    user_service = UserService(db)
    
    user_data = user_service.get_user_by_id(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_service.delete_user(user_id)
    
    return {"success": True, "message": f"User {user_id} deleted"}
