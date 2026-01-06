"""
API Key Service
Handles persistence and validation of API Keys using Firestore.
"""
import logging
import secrets
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any, List
from firebase_admin import firestore
from app.services.firebase_service import _initialize_firebase
from app.schemas import APIKeyStatus, APIKeyQuotas

logger = logging.getLogger(__name__)

class APIKeyService:
    def __init__(self):
        _initialize_firebase()
        self.db = firestore.client()
        self.collection = self.db.collection('api_keys')

    def _hash_key(self, api_key: str) -> str:
        return hashlib.sha256(api_key.encode()).hexdigest()

    def generate_key(self) -> str:
        """Generate a cryptographically secure key string."""
        random_bytes = secrets.token_bytes(32)
        return f"ce_live_{random_bytes.hex()}"

    async def create_key(self, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Create and store a new API Key.
        Returns the full record including the raw key (only time it is visible).
        """
        raw_key = self.generate_key()
        hashed_key = self._hash_key(raw_key)
        key_id = f"key_{secrets.token_hex(8)}"

        record = {
            "key_id": key_id,
            "hashed_key": hashed_key,
            "name": data.get("name"),
            "description": data.get("description"),
            "consumer_app_id": data.get("consumer_app_id"),
            "environment": data.get("environment"),
            "status": APIKeyStatus.ACTIVE,
            "quotas": data.get("quotas").dict() if data.get("quotas") else APIKeyQuotas().dict(),
            "permissions": data.get("permissions", []),
            "allowed_standards": data.get("allowed_standards"),
            "created_at": datetime.utcnow(),
            "created_by": user_id,
            "expires_at": data.get("expires_at"),
            "last_used_at": None,
            "usage_stats": {
                "requests_today": 0,
                "requests_this_month": 0
            }
        }

        # Store in Firestore (using key_id as document ID)
        self.collection.document(key_id).set(record)
        
        # Return with raw key for the user to copy
        record["api_key"] = raw_key 
        return record

    async def get_key(self, key_id: str) -> Optional[Dict[str, Any]]:
        doc = self.collection.document(key_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    async def list_keys(self) -> List[Dict[str, Any]]:
        docs = self.collection.stream()
        return [doc.to_dict() for doc in docs]

    async def revoke_key(self, key_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        doc_ref = self.collection.document(key_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
        
        doc_ref.update({
            "status": APIKeyStatus.REVOKED,
            "revoked_at": datetime.utcnow(),
            "revoked_by": user_id
        })
        return doc_ref.get().to_dict()

    async def delete_key(self, key_id: str) -> bool:
        self.collection.document(key_id).delete()
        return True

    async def validate_key_string(self, api_key_string: str) -> Dict[str, Any]:
        """
        Validate a raw API Key string.
        1. Hash it.
        2. Query Firestore for this hash.
        3. Check status and expiration.
        """
        hashed = self._hash_key(api_key_string)
        
        # Query by hashed_key
        query = self.collection.where("hashed_key", "==", hashed).limit(1)
        docs = query.stream()
        
        found_doc = None
        for doc in docs:
            found_doc = doc.to_dict()
            break
            
        if not found_doc:
            return {"valid": False, "message": "Invalid API Key"}

        if found_doc["status"] != APIKeyStatus.ACTIVE:
            return {"valid": False, "message": f"API Key is {found_doc['status']}"}

        # Check Expiration (handle timezone naive/aware if needed, assuming UTC)
        expires_at = found_doc.get("expires_at")
        if expires_at:
             # Convert Firestore timestamp to datetime if necessary, usually auto-handled
             # If stored as string/iso, parse it. If stored as datetime, compare.
             if isinstance(expires_at, str):
                 expires_at = datetime.fromisoformat(expires_at)
             
             # Firestore datetime has timezone, utcnow does not (naive). 
             # Simplification: Compare naive to naive or aware to aware.
             # Assuming naive UTC for now as per schema default.
             if expires_at.tzinfo:
                 if expires_at < datetime.now(expires_at.tzinfo):
                     return {"valid": False, "message": "API Key expired"}
             elif expires_at < datetime.utcnow():
                  return {"valid": False, "message": "API Key expired"}

        # Update usage stats (async fire-and-forget ideal, but here direct)
        # TODO: Implement robust counting (e.g. distributed counters)
        # For MVP: just valid check
        
        return {
            "valid": True,
            "key_data": found_doc,
            "message": "Valid"
        }

    async def update_key(self, key_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update API key fields"""
        doc_ref = self.collection.document(key_id)
        doc = doc_ref.get()

        if not doc.exists:
            return None

        updates["updated_at"] = datetime.utcnow()
        doc_ref.update(updates)

        updated_doc = doc_ref.get()
        return updated_doc.to_dict()
