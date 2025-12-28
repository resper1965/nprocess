"""
Firebase Admin SDK service for token verification.
Unified authentication service for Admin Control Plane.
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
        
    except Exception as e:
        logger.warning(f"Firebase token verification failed: {e}")
        return None


def get_user_role(decoded_token: Dict[str, Any]) -> Optional[str]:
    """
    Extract user role from decoded token claims.
    
    Firebase custom claims are set via Cloud Functions or Admin SDK.
    
    Args:
        decoded_token: Decoded Firebase token claims.
        
    Returns:
        User role string ('admin', 'super_admin', 'user', etc.) or None.
    """
    # Try custom claim first
    role = decoded_token.get("role")
    if role:
        return role
    
    # Fallback: check Firestore for user role
    try:
        from firebase_admin import firestore
        db = firestore.client()
        uid = decoded_token.get("uid")
        if uid:
            user_doc = db.collection("users").document(uid).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                return user_data.get("role", "user")
    except Exception as e:
        logger.warning(f"Failed to get role from Firestore: {e}")
    
    return "user"  # Default role


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

