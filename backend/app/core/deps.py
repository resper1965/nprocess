"""FastAPI dependencies for authentication and authorization."""

import logging
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from firebase_admin import auth as firebase_auth

from app.core.security import verify_firebase_token
from app.schemas.auth import CurrentUser

logger = logging.getLogger(__name__)


async def get_current_user(
    authorization: Annotated[str, Header(description="Bearer token from Firebase Auth")]
) -> CurrentUser:
    """
    Validate Firebase token and extract user information with custom claims.

    This dependency:
    1. Extracts the Bearer token from the Authorization header
    2. Verifies the token with Firebase Admin SDK
    3. Extracts custom claims (org_id, role, status)
    4. REJECTS users with status == "pending"
    5. Returns a CurrentUser object for tenant-isolated operations

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
        HTTPException 403: If user status is "pending" (awaiting approval)
    """
    # Extract Bearer token
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization[7:]  # Remove "Bearer " prefix

    try:
        # Verify token and get claims
        decoded_token = verify_firebase_token(token)
    except firebase_auth.InvalidIdTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.ExpiredIdTokenError:
        logger.warning("Expired token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.RevokedIdTokenError:
        logger.warning("Revoked token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user info and custom claims
    uid = decoded_token.get("uid")
    email = decoded_token.get("email", "")
    name = decoded_token.get("name", "")

    # Extract custom claims (set by super_admin during approval)
    org_id = decoded_token.get("org_id")
    role = decoded_token.get("role", "guest")
    user_status = decoded_token.get("status", "pending")

    # CRITICAL: Reject pending users
    if user_status == "pending":
        logger.info(f"Rejected pending user: {uid} ({email})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending approval. Please wait for administrator to approve your access.",
        )

    # Build CurrentUser object
    current_user = CurrentUser(
        uid=uid,
        email=email,
        name=name,
        org_id=org_id,
        role=role,
        status=user_status,
    )

    logger.debug(f"Authenticated user: {uid}, org: {org_id}, role: {role}")
    return current_user


def require_role(*allowed_roles: str):
    """
    Factory for role-based access control dependency.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_role("super_admin", "org_admin"))])
        async def admin_endpoint():
            ...
    """

    async def role_checker(
        current_user: Annotated[CurrentUser, Depends(get_current_user)]
    ) -> CurrentUser:
        if current_user.role not in allowed_roles:
            logger.warning(
                f"Access denied for user {current_user.uid}: "
                f"role '{current_user.role}' not in {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


# Convenience dependency for super_admin only endpoints
require_super_admin = require_role("super_admin")
