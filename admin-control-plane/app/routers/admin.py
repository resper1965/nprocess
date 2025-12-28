"""Admin Utilities Router - for setting super_admin, etc."""
from fastapi import APIRouter, HTTPException, Depends
from app.middleware.auth import require_admin_user
from app.services.firebase_service import _initialize_firebase
import firebase_admin
from firebase_admin import auth, firestore
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/set-super-admin/{user_uid}")
async def set_super_admin(
    user_uid: str,
    current_user: dict = Depends(require_admin_user)
):
    """
    Set a user as super_admin.
    Requires admin privileges.
    
    Uses Firebase Admin SDK pattern:
    getAuth().setCustomUserClaims(uid, { role: 'super_admin' })
    """
    try:
        # Ensure Firebase is initialized
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase Admin SDK not initialized")
        
        # Set custom claim - the new custom claims will propagate to the user's ID token
        # the next time a new one is issued
        auth.set_custom_user_claims(user_uid, {'role': 'super_admin'})
        logger.info(f"Custom claim 'role: super_admin' set for user {user_uid}")
        
        # Update Firestore as backup
        db = firestore.client()
        db.collection('users').document(user_uid).set({
            'role': 'super_admin',
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        logger.info(f"Firestore role updated for user {user_uid}")
        
        # Get user info to verify
        user = auth.get_user(user_uid)
        
        return {
            "success": True,
            "message": f"User {user_uid} set as super_admin. The new custom claims will propagate to the user's ID token the next time a new one is issued.",
            "user": {
                "uid": user_uid,
                "email": user.email,
                "display_name": user.display_name,
                "custom_claims": user.custom_claims
            },
            "note": "User must logout and login again to get the new token with updated claims"
        }
    except firebase_admin.exceptions.NotFoundError:
        raise HTTPException(status_code=404, detail=f"User {user_uid} not found")
    except Exception as e:
        logger.error(f"Error setting super_admin: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

