"""User Management Router"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas import UserCreate, UserResponse, UserUpdate, UserRole, UserStatus
from app.middleware.auth import get_current_user
from datetime import datetime
import secrets

router = APIRouter()
users_db = {}

@router.post("/", response_model=UserResponse)
async def create_user(request: UserCreate, current_user: dict = Depends(get_current_user)):
    user_id = f"user_{secrets.token_hex(8)}"
    user = {
        "user_id": user_id,
        "email": request.email,
        "name": request.name,
        "role": request.role,
        "status": UserStatus.ACTIVE,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login_at": None
    }
    users_db[user_id] = user
    return UserResponse(**user)

@router.get("/", response_model=List[UserResponse])
async def list_users(current_user: dict = Depends(get_current_user)):
    return [UserResponse(**u) for u in users_db.values()]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**users_db[user_id])

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, request: UserUpdate, current_user: dict = Depends(get_current_user)):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    user = users_db[user_id]
    if request.name:
        user["name"] = request.name
    if request.role:
        user["role"] = request.role
    if request.status:
        user["status"] = request.status
    user["updated_at"] = datetime.utcnow()
    return UserResponse(**user)

@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    del users_db[user_id]
    return {"success": True, "message": f"User {user_id} deleted"}
