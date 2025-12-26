"""
Firebase Admin SDK service for token verification.

This service provides centralized Firebase authentication for the API.
It uses the GOOGLE_APPLICATION_CREDENTIALS environment variable or 
Application Default Credentials when running on GCP.
"""
import logging
import os
from typing import Optional, Dict, Any
from functools import lru_cache

logger = logging.getLogger(__name__)

# Firebase Admin SDK imports
_firebase_initialized = False
_firebase_app = None


def _initialize_firebase() -> bool:
    """
    Initialize Firebase Admin SDK.
    
    Uses Application Default Credentials (ADC) which works automatically:
    - On GCP (Cloud Run, GCE, etc.) - uses service account
    - Locally - uses GOOGLE_APPLICATION_CREDENTIALS env var
    
    Returns:
        True if initialized successfully, False otherwise.
    """
    global _firebase_initialized, _firebase_app
    
    if _firebase_initialized:
        return _firebase_app is not None
    
    _firebase_initialized = True
    
    try:
        import firebase_admin
        from firebase_admin import credentials
        
        # Check if already initialized
        if firebase_admin._apps:
            _firebase_app = firebase_admin.get_app()
            logger.info("✅ Firebase Admin SDK already initialized")
            return True
        
        # Initialize with Application Default Credentials
        _firebase_app = firebase_admin.initialize_app()
        logger.info("✅ Firebase Admin SDK initialized successfully")
        return True
        
    except ImportError:
        logger.error("❌ firebase-admin package not installed")
        return False
    except Exception as e:
        logger.error(f"❌ Failed to initialize Firebase Admin SDK: {e}")
        return False


def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Firebase ID token and return the decoded claims.
    
    Args:
        id_token: The Firebase ID token to verify.
        
    Returns:
        Decoded token claims if valid, None otherwise.
        Claims include: uid, email, name, role (custom claim), etc.
    """
    if not _initialize_firebase():
        logger.error("Firebase not initialized, cannot verify token")
        return None
    
    try:
        from firebase_admin import auth
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        
        logger.debug(f"Token verified for user: {decoded_token.get('uid')}")
        return decoded_token
        
    except auth.InvalidIdTokenError as e:
        logger.warning(f"Invalid Firebase ID token: {e}")
        return None
    except auth.ExpiredIdTokenError:
        logger.warning("Firebase ID token has expired")
        return None
    except auth.RevokedIdTokenError:
        logger.warning("Firebase ID token has been revoked")
        return None
    except auth.CertificateFetchError as e:
        logger.error(f"Failed to fetch Firebase certificates: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error verifying token: {e}")
        return None


def get_user_role(decoded_token: Dict[str, Any]) -> Optional[str]:
    """
    Extract user role from decoded token claims.
    
    Firebase custom claims are set via Cloud Functions (syncUserRoleToClaims).
    
    Args:
        decoded_token: Decoded Firebase token claims.
        
    Returns:
        User role string ('admin', 'super_admin', 'user', etc.) or None.
    """
    return decoded_token.get("role")


def is_admin(decoded_token: Dict[str, Any]) -> bool:
    """
    Check if the user has admin privileges.
    
    Args:
        decoded_token: Decoded Firebase token claims.
        
    Returns:
        True if user is admin or super_admin, False otherwise.
    """
    role = get_user_role(decoded_token)
    return role in ("admin", "super_admin")


@lru_cache(maxsize=1)
def get_firebase_service() -> Dict[str, Any]:
    """
    Get Firebase service functions.
    
    Returns:
        Dictionary with service functions.
    """
    _initialize_firebase()
    return {
        "verify_token": verify_firebase_token,
        "get_role": get_user_role,
        "is_admin": is_admin,
    }
