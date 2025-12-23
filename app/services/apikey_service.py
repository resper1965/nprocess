"""
API Key management service with secure storage.
"""
import secrets
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import bcrypt
from google.cloud import firestore

from app.schemas_apikeys import (
    APIKeyCreate,
    APIKeyInfo,
    APIKeyQuotas,
    APIKeyResponse,
    APIKeyUsage,
    APIKeyValidationResult
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

API_KEYS_COLLECTION = "api_keys"
API_KEY_PREFIX = "ce"  # ComplianceEngine
KEY_LENGTH = 32  # bytes (64 hex characters)


# ============================================================================
# API Key Service
# ============================================================================

class APIKeyService:
    """Service for managing API keys with secure storage."""

    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize API key service.

        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()

            logger.info("APIKeyService initialized")
        except Exception as e:
            logger.error(f"Error initializing APIKeyService: {e}")
            raise

    def generate_api_key(self, environment: str = "live") -> str:
        """
        Generate a cryptographically secure API key.

        Format: ce_live_<64-hex-chars>
        Example: ce_live_1234567890abcdef...

        Args:
            environment: 'live' or 'test'

        Returns:
            Generated API key
        """
        # Generate random bytes
        random_bytes = secrets.token_bytes(KEY_LENGTH)
        random_hex = random_bytes.hex()

        # Format: prefix_environment_token
        api_key = f"{API_KEY_PREFIX}_{environment}_{random_hex}"

        return api_key

    def hash_api_key(self, api_key: str) -> str:
        """
        Hash API key for secure storage using bcrypt.

        Args:
            api_key: Plain API key

        Returns:
            Bcrypt hash
        """
        # Use bcrypt with salt rounds = 12
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(api_key.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def verify_api_key(self, api_key: str, hashed_key: str) -> bool:
        """
        Verify API key against stored hash.

        Args:
            api_key: Plain API key
            hashed_key: Stored bcrypt hash

        Returns:
            True if key is valid
        """
        try:
            return bcrypt.checkpw(
                api_key.encode('utf-8'),
                hashed_key.encode('utf-8')
            )
        except Exception as e:
            logger.error(f"Error verifying API key: {e}")
            return False

    async def create_api_key(
        self,
        request: APIKeyCreate,
        environment: str = "live"
    ) -> APIKeyResponse:
        """
        Create a new API key.

        Args:
            request: API key creation request
            environment: 'live' or 'test'

        Returns:
            APIKeyResponse with the plain API key (shown only once)
        """
        try:
            # Generate API key
            api_key = self.generate_api_key(environment)

            # Hash for storage
            hashed_key = self.hash_api_key(api_key)

            # Get key prefix (first 8 chars after prefix_env_)
            key_prefix = api_key[:16]  # ce_live_12345678

            # Prepare document
            now = datetime.utcnow()
            key_data = {
                "name": request.name,
                "description": request.description,
                "consumer_app_id": request.consumer_app_id,
                "key_hash": hashed_key,
                "key_prefix": key_prefix,
                "environment": environment,
                "status": "active",
                "created_at": now,
                "expires_at": request.expires_at,
                "last_used_at": None,
                "permissions": request.permissions or ["read", "write"],
                "quotas": (request.quotas or APIKeyQuotas()).model_dump(),
                "usage": {
                    "requests_today": 0,
                    "requests_this_month": 0,
                    "total_requests": 0,
                    "last_request_at": None
                },
                "revoked": False,
                "revoked_at": None,
                "revoked_reason": None
            }

            # Store in Firestore
            doc_ref = self.db.collection(API_KEYS_COLLECTION).document()
            doc_ref.set(key_data)

            key_id = doc_ref.id

            logger.info(f"API key created: {key_id} for {request.consumer_app_id}")

            # Return response with PLAIN key (only time it's shown)
            return APIKeyResponse(
                key_id=key_id,
                api_key=api_key,  # ⚠️  PLAIN KEY - show only once!
                name=request.name,
                consumer_app_id=request.consumer_app_id,
                created_at=now,
                expires_at=request.expires_at,
                permissions=key_data["permissions"],
                quotas=APIKeyQuotas(**key_data["quotas"])
            )

        except Exception as e:
            logger.error(f"Error creating API key: {e}")
            raise

    async def validate_api_key(
        self,
        api_key: str,
        required_permissions: Optional[List[str]] = None
    ) -> APIKeyValidationResult:
        """
        Validate an API key and check permissions.

        Args:
            api_key: Plain API key to validate
            required_permissions: Optional list of required permissions

        Returns:
            APIKeyValidationResult
        """
        try:
            # Get key prefix for quick lookup
            key_prefix = api_key[:16]

            # Query Firestore for active keys with this prefix
            query = (
                self.db.collection(API_KEYS_COLLECTION)
                .where("key_prefix", "==", key_prefix)
                .where("status", "==", "active")
                .where("revoked", "==", False)
                .limit(1)
            )

            docs = list(query.stream())

            if not docs:
                return APIKeyValidationResult(
                    valid=False,
                    error="Invalid API key"
                )

            doc = docs[0]
            key_data = doc.to_dict()

            # Verify hash
            if not self.verify_api_key(api_key, key_data["key_hash"]):
                return APIKeyValidationResult(
                    valid=False,
                    error="Invalid API key"
                )

            # Check expiration
            if key_data.get("expires_at"):
                if datetime.utcnow() > key_data["expires_at"]:
                    # Mark as expired
                    doc.reference.update({"status": "expired"})
                    return APIKeyValidationResult(
                        valid=False,
                        error="API key has expired"
                    )

            # Check permissions
            if required_permissions:
                key_permissions = set(key_data.get("permissions", []))
                if not all(perm in key_permissions for perm in required_permissions):
                    return APIKeyValidationResult(
                        valid=False,
                        error="Insufficient permissions"
                    )

            # Update last used
            doc.reference.update({
                "last_used_at": firestore.SERVER_TIMESTAMP,
                "usage.last_request_at": firestore.SERVER_TIMESTAMP,
                "usage.total_requests": firestore.Increment(1)
            })

            # Check rate limits (simplified - real implementation would use Redis)
            quotas = APIKeyQuotas(**key_data.get("quotas", {}))
            usage = key_data.get("usage", {})

            rate_limit_remaining = quotas.requests_per_minute - (usage.get("requests_today", 0) % quotas.requests_per_minute)

            return APIKeyValidationResult(
                valid=True,
                key_id=doc.id,
                consumer_app_id=key_data["consumer_app_id"],
                consumer_app_name=key_data.get("consumer_app_name"),
                permissions=key_data["permissions"],
                rate_limit_remaining=rate_limit_remaining
            )

        except Exception as e:
            logger.error(f"Error validating API key: {e}")
            return APIKeyValidationResult(
                valid=False,
                error="Internal error during validation"
            )

    async def list_api_keys(
        self,
        consumer_app_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[APIKeyInfo]:
        """
        List API keys with optional filters.

        Args:
            consumer_app_id: Filter by consumer app
            status: Filter by status (active, revoked, expired)
            limit: Maximum number of results

        Returns:
            List of APIKeyInfo
        """
        try:
            query = self.db.collection(API_KEYS_COLLECTION)

            if consumer_app_id:
                query = query.where("consumer_app_id", "==", consumer_app_id)

            if status:
                query = query.where("status", "==", status)

            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)

            docs = query.stream()

            api_keys = []
            for doc in docs:
                data = doc.to_dict()

                api_keys.append(APIKeyInfo(
                    key_id=doc.id,
                    name=data["name"],
                    description=data.get("description"),
                    consumer_app_id=data["consumer_app_id"],
                    consumer_app_name=data.get("consumer_app_name"),
                    key_prefix=data["key_prefix"],
                    status=data["status"],
                    created_at=data["created_at"],
                    expires_at=data.get("expires_at"),
                    last_used_at=data.get("last_used_at"),
                    permissions=data["permissions"],
                    quotas=APIKeyQuotas(**data["quotas"]),
                    usage=APIKeyUsage(**data.get("usage", {})) if data.get("usage") else None
                ))

            logger.info(f"Retrieved {len(api_keys)} API keys")
            return api_keys

        except Exception as e:
            logger.error(f"Error listing API keys: {e}")
            raise

    async def revoke_api_key(self, key_id: str, reason: Optional[str] = None) -> bool:
        """
        Revoke an API key.

        Args:
            key_id: ID of the key to revoke
            reason: Reason for revocation

        Returns:
            True if revoked successfully
        """
        try:
            doc_ref = self.db.collection(API_KEYS_COLLECTION).document(key_id)

            if not doc_ref.get().exists:
                logger.warning(f"API key not found: {key_id}")
                return False

            doc_ref.update({
                "status": "revoked",
                "revoked": True,
                "revoked_at": firestore.SERVER_TIMESTAMP,
                "revoked_reason": reason
            })

            logger.info(f"API key revoked: {key_id}")
            return True

        except Exception as e:
            logger.error(f"Error revoking API key: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_apikey_service_instance: Optional[APIKeyService] = None


def get_apikey_service() -> APIKeyService:
    """Return singleton instance of APIKeyService."""
    global _apikey_service_instance
    if _apikey_service_instance is None:
        _apikey_service_instance = APIKeyService()
    return _apikey_service_instance
