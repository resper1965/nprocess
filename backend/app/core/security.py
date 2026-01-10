"""Firebase Admin SDK setup and token verification."""

import logging
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
# Uses GOOGLE_APPLICATION_CREDENTIALS environment variable automatically
_firebase_app: firebase_admin.App | None = None


def get_firebase_app() -> firebase_admin.App:
    """Get or initialize Firebase Admin app."""
    global _firebase_app
    if _firebase_app is None:
        try:
            # Try to get existing app
            _firebase_app = firebase_admin.get_app()
        except ValueError:
            # Initialize new app with default credentials
            cred = credentials.ApplicationDefault()
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized")
    return _firebase_app


def verify_firebase_token(id_token: str) -> dict[str, Any]:
    """
    Verify a Firebase ID token and return the decoded claims.

    Args:
        id_token: The Firebase ID token to verify.

    Returns:
        Dict containing the decoded token claims including custom claims.

    Raises:
        firebase_admin.auth.InvalidIdTokenError: If the token is invalid.
        firebase_admin.auth.ExpiredIdTokenError: If the token has expired.
        firebase_admin.auth.RevokedIdTokenError: If the token has been revoked.
    """
    get_firebase_app()  # Ensure app is initialized
    decoded_token = auth.verify_id_token(id_token)
    return decoded_token


def set_custom_claims(uid: str, claims: dict[str, Any]) -> None:
    """
    Set custom claims on a Firebase user.

    Args:
        uid: The Firebase user ID.
        claims: Dict of custom claims to set (org_id, role, status).
    """
    get_firebase_app()
    auth.set_custom_user_claims(uid, claims)
    logger.info(f"Set custom claims for user {uid}: {claims}")


def get_user(uid: str) -> auth.UserRecord:
    """
    Get a Firebase user by UID.

    Args:
        uid: The Firebase user ID.

    Returns:
        UserRecord object containing user details.
    """
    get_firebase_app()
    return auth.get_user(uid)
