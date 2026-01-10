"""System administration endpoints - super_admin only."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_super_admin
from app.core.security import get_user, set_custom_claims
from app.schemas.auth import ApproveUserRequest, ApproveUserResponse, CurrentUser, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/system", tags=["System Admin"])


@router.post(
    "/approve_user",
    response_model=ApproveUserResponse,
    dependencies=[Depends(require_super_admin)],
)
async def approve_user(
    request: ApproveUserRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ApproveUserResponse:
    """
    Approve a pending user and assign them to an organization.

    **Required Role**: super_admin

    This endpoint:
    1. Validates the requesting user is a super_admin
    2. Retrieves the target user from Firebase
    3. Sets custom claims (org_id, role, status: active) on the user
    4. The user will have access on their next token refresh

    Args:
        request: Contains target_uid, org_id, and role to assign

    Returns:
        Confirmation with updated user details
    """
    logger.info(
        f"Super admin {current_user.uid} approving user {request.target_uid} "
        f"for org {request.org_id} with role {request.role}"
    )

    try:
        # Get target user from Firebase
        target_user = get_user(request.target_uid)
    except Exception as e:
        logger.error(f"Failed to get user {request.target_uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with UID {request.target_uid} not found",
        )

    # Set custom claims
    new_claims = {
        "org_id": request.org_id,
        "role": request.role,
        "status": "active",
    }

    try:
        set_custom_claims(request.target_uid, new_claims)
    except Exception as e:
        logger.error(f"Failed to set claims for user {request.target_uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user permissions",
        )

    logger.info(f"Successfully approved user {request.target_uid}")

    return ApproveUserResponse(
        success=True,
        message=f"User {target_user.email} approved and assigned to organization",
        user=UserResponse(
            uid=target_user.uid,
            email=target_user.email or "",
            name=target_user.display_name or "",
            org_id=request.org_id,
            role=request.role,
            status="active",
        ),
    )


@router.get("/pending_users", dependencies=[Depends(require_super_admin)])
async def list_pending_users(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    List all users with pending status.

    **Required Role**: super_admin

    Note: This is a placeholder. In production, this would query
    Firestore for users with status: pending or iterate Firebase users.
    """
    # TODO: Implement Firestore query for pending users
    # For now, return placeholder
    return {
        "pending_users": [],
        "message": "Implement Firestore query for users collection",
    }
