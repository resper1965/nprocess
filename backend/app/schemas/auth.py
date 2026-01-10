"""Authentication and authorization schemas."""

from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class CurrentUser(BaseModel):
    """
    Represents the currently authenticated user.
    
    Extracted from Firebase ID token with custom claims.
    Used for tenant isolation in all database queries.
    """

    uid: str = Field(..., description="Firebase user ID")
    email: str = Field(..., description="User email address")
    name: str = Field(default="", description="User display name")
    org_id: str | None = Field(default=None, description="Tenant/Organization ID for isolation")
    role: Literal["super_admin", "org_admin", "developer", "guest"] = Field(
        default="guest", description="User role for RBAC"
    )
    status: Literal["active", "pending", "suspended"] = Field(
        default="pending", description="User account status"
    )

    @property
    def is_super_admin(self) -> bool:
        """Check if user is a super admin (Ness staff)."""
        return self.role == "super_admin"

    @property
    def is_org_admin(self) -> bool:
        """Check if user is an organization admin."""
        return self.role == "org_admin"

    @property
    def has_org(self) -> bool:
        """Check if user belongs to an organization."""
        return self.org_id is not None


class ApproveUserRequest(BaseModel):
    """Request body for approving a pending user."""

    target_uid: str = Field(..., description="Firebase UID of the user to approve")
    org_id: str = Field(..., description="Organization/Tenant ID to assign")
    role: Literal["org_admin", "developer"] = Field(
        default="developer", description="Role to assign (super_admin excluded)"
    )


class UserResponse(BaseModel):
    """Response model for user data."""

    uid: str
    email: str
    name: str
    org_id: str | None
    role: str
    status: str


class ApproveUserResponse(BaseModel):
    """Response after approving a user."""

    success: bool = True
    message: str
    user: UserResponse
