"""
Webhook service for sending notifications to external systems.
"""
import asyncio
import logging
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse

import httpx
from google.cloud import firestore

from app.schemas_webhooks import (
    WebhookCreate,
    WebhookUpdate,
    WebhookInfo,
    WebhookResponse,
    WebhookDelivery,
    WebhookEventType,
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

WEBHOOKS_COLLECTION = "webhooks"
WEBHOOK_DELIVERIES_COLLECTION = "webhook_deliveries"

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAYS = [1, 5, 30]  # seconds (exponential backoff)
REQUEST_TIMEOUT = 10  # seconds


# ============================================================================
# Webhook Service
# ============================================================================

class WebhookService:
    """Service for managing and delivering webhooks."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize webhook service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("WebhookService initialized")
        except Exception as e:
            logger.error(f"Error initializing WebhookService: {e}")
            raise
    
    def generate_secret(self) -> str:
        """
        Generate a cryptographically secure webhook secret.
        
        Returns:
            Random secret string (32 bytes = 64 hex chars)
        """
        return secrets.token_hex(32)
    
    def sign_payload(self, payload: str, secret: str) -> str:
        """
        Generate HMAC signature for webhook payload.
        
        Args:
            payload: JSON string of the payload
            secret: Webhook secret
            
        Returns:
            HMAC SHA256 signature (hex)
        """
        return hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
    
    async def create_webhook(
        self,
        api_key_id: str,
        request: WebhookCreate
    ) -> WebhookResponse:
        """
        Create a new webhook.
        
        Args:
            api_key_id: ID of the API key that owns this webhook
            request: Webhook creation request
            
        Returns:
            WebhookResponse with secret (shown only once)
        """
        try:
            # Generate secret if not provided
            secret = request.secret or self.generate_secret()
            
            # Prepare document
            now = datetime.utcnow()
            webhook_data = {
                "api_key_id": api_key_id,
                "url": str(request.url),
                "events": request.events,
                "description": request.description,
                "secret": secret,  # Store plain secret (will be hashed later if needed)
                "active": request.active,
                "created_at": now,
                "updated_at": now,
                "last_delivery_at": None,
                "last_delivery_status": None,
                "delivery_count": 0,
                "failure_count": 0,
            }
            
            # Store in Firestore
            doc_ref = self.db.collection(WEBHOOKS_COLLECTION).document()
            doc_ref.set(webhook_data)
            
            webhook_id = doc_ref.id
            
            logger.info(f"Webhook created: {webhook_id} for API key {api_key_id}")
            
            # Return response with PLAIN secret (only time it's shown)
            return WebhookResponse(
                id=webhook_id,
                url=str(request.url),
                events=request.events,
                secret=secret,  # ⚠️ PLAIN SECRET - show only once!
                created_at=now
            )
            
        except Exception as e:
            logger.error(f"Error creating webhook: {e}")
            raise
    
    async def list_webhooks(
        self,
        api_key_id: Optional[str] = None,
        active_only: bool = False,
        limit: int = 50
    ) -> List[WebhookInfo]:
        """
        List webhooks.
        
        Args:
            api_key_id: Filter by API key ID
            active_only: Only return active webhooks
            limit: Maximum number of results
            
        Returns:
            List of WebhookInfo
        """
        try:
            query = self.db.collection(WEBHOOKS_COLLECTION)
            
            if api_key_id:
                query = query.where("api_key_id", "==", api_key_id)
            
            if active_only:
                query = query.where("active", "==", True)
            
            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)
            
            docs = query.stream()
            
            webhooks = []
            for doc in docs:
                data = doc.to_dict()
                
                # Don't include secret in response
                webhook_info = WebhookInfo(
                    id=doc.id,
                    api_key_id=data["api_key_id"],
                    url=data["url"],
                    events=data["events"],
                    description=data.get("description"),
                    active=data["active"],
                    created_at=data["created_at"],
                    updated_at=data.get("updated_at", data["created_at"]),
                    last_delivery_at=data.get("last_delivery_at"),
                    last_delivery_status=data.get("last_delivery_status"),
                    delivery_count=data.get("delivery_count", 0),
                    failure_count=data.get("failure_count", 0),
                )
                webhooks.append(webhook_info)
            
            logger.info(f"Retrieved {len(webhooks)} webhooks")
            return webhooks
            
        except Exception as e:
            logger.error(f"Error listing webhooks: {e}")
            raise
    
    async def get_webhook(self, webhook_id: str) -> Optional[WebhookInfo]:
        """
        Get webhook by ID.
        
        Args:
            webhook_id: Webhook ID
            
        Returns:
            WebhookInfo or None if not found
        """
        try:
            doc_ref = self.db.collection(WEBHOOKS_COLLECTION).document(webhook_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            
            return WebhookInfo(
                id=doc.id,
                api_key_id=data["api_key_id"],
                url=data["url"],
                events=data["events"],
                description=data.get("description"),
                active=data["active"],
                created_at=data["created_at"],
                updated_at=data.get("updated_at", data["created_at"]),
                last_delivery_at=data.get("last_delivery_at"),
                last_delivery_status=data.get("last_delivery_status"),
                delivery_count=data.get("delivery_count", 0),
                failure_count=data.get("failure_count", 0),
            )
            
        except Exception as e:
            logger.error(f"Error getting webhook: {e}")
            raise
    
    async def update_webhook(
        self,
        webhook_id: str,
        request: WebhookUpdate
    ) -> bool:
        """
        Update a webhook.
        
        Args:
            webhook_id: Webhook ID
            request: Update request
            
        Returns:
            True if updated successfully
        """
        try:
            doc_ref = self.db.collection(WEBHOOKS_COLLECTION).document(webhook_id)
            
            if not doc_ref.get().exists:
                logger.warning(f"Webhook not found: {webhook_id}")
                return False
            
            update_data = {
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
            
            if request.url is not None:
                update_data["url"] = str(request.url)
            if request.events is not None:
                update_data["events"] = request.events
            if request.description is not None:
                update_data["description"] = request.description
            if request.active is not None:
                update_data["active"] = request.active
            
            doc_ref.update(update_data)
            
            logger.info(f"Webhook updated: {webhook_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating webhook: {e}")
            raise
    
    async def delete_webhook(self, webhook_id: str) -> bool:
        """
        Delete a webhook.
        
        Args:
            webhook_id: Webhook ID
            
        Returns:
            True if deleted successfully
        """
        try:
            doc_ref = self.db.collection(WEBHOOKS_COLLECTION).document(webhook_id)
            
            if not doc_ref.get().exists:
                logger.warning(f"Webhook not found: {webhook_id}")
                return False
            
            doc_ref.delete()
            
            logger.info(f"Webhook deleted: {webhook_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting webhook: {e}")
            raise
    
    async def deliver_webhook(
        self,
        webhook_id: str,
        event_type: str,
        event_id: str,
        payload: Dict[str, Any]
    ) -> bool:
        """
        Deliver a webhook event.
        
        Args:
            webhook_id: Webhook ID
            event_type: Type of event
            event_id: ID of the event (process_id, analysis_id, etc.)
            payload: Event payload
            
        Returns:
            True if delivered successfully
        """
        try:
            # Get webhook
            webhook = await self.get_webhook(webhook_id)
            if not webhook or not webhook.active:
                logger.warning(f"Webhook {webhook_id} not found or inactive")
                return False
            
            # Check if webhook subscribes to this event
            if event_type not in webhook.events:
                logger.debug(f"Webhook {webhook_id} does not subscribe to {event_type}")
                return False
            
            # Get webhook secret
            doc_ref = self.db.collection(WEBHOOKS_COLLECTION).document(webhook_id)
            webhook_doc = doc_ref.get()
            if not webhook_doc.exists:
                return False
            
            secret = webhook_doc.to_dict()["secret"]
            
            # Prepare payload
            webhook_payload = {
                "event": event_type,
                "event_id": event_id,
                "timestamp": datetime.utcnow().isoformat(),
                "data": payload,
            }
            
            payload_json = json.dumps(webhook_payload, default=str)
            signature = self.sign_payload(payload_json, secret)
            
            # Deliver with retries
            success = False
            last_error = None
            status_code = None
            response_body = None
            
            for attempt in range(MAX_RETRIES):
                try:
                    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                        response = await client.post(
                            webhook.url,
                            content=payload_json,
                            headers={
                                "Content-Type": "application/json",
                                "X-Webhook-Signature": f"sha256={signature}",
                                "X-Webhook-Event": event_type,
                                "X-Webhook-Id": webhook_id,
                            }
                        )
                        
                        status_code = response.status_code
                        response_body = response.text[:1000]  # Limit response body size
                        
                        if 200 <= status_code < 300:
                            success = True
                            break
                        else:
                            last_error = f"HTTP {status_code}: {response_body}"
                            
                except httpx.TimeoutException:
                    last_error = "Request timeout"
                except httpx.RequestError as e:
                    last_error = str(e)
                except Exception as e:
                    last_error = str(e)
                
                # Wait before retry (exponential backoff)
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAYS[attempt])
            
            # Record delivery
            now = datetime.utcnow()
            delivery_data = {
                "webhook_id": webhook_id,
                "event_type": event_type,
                "event_id": event_id,
                "payload": webhook_payload,
                "status": "success" if success else "failed",
                "status_code": status_code,
                "response_body": response_body,
                "error_message": None if success else last_error,
                "attempt_number": MAX_RETRIES if not success else (attempt + 1),
                "delivered_at": now if success else None,
                "created_at": now,
            }
            
            self.db.collection(WEBHOOK_DELIVERIES_COLLECTION).add(delivery_data)
            
            # Update webhook stats
            update_data = {
                "last_delivery_at": now,
                "last_delivery_status": "success" if success else "failed",
                "delivery_count": firestore.Increment(1),
            }
            
            if not success:
                update_data["failure_count"] = firestore.Increment(1)
            
            doc_ref.update(update_data)
            
            if success:
                logger.info(f"Webhook {webhook_id} delivered successfully: {event_type}")
            else:
                logger.warning(f"Webhook {webhook_id} delivery failed: {last_error}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error delivering webhook {webhook_id}: {e}")
            return False
    
    async def trigger_event(
        self,
        api_key_id: str,
        event_type: str,
        event_id: str,
        payload: Dict[str, Any]
    ) -> int:
        """
        Trigger webhook event for all webhooks subscribed to it.
        
        Args:
            api_key_id: API key ID that triggered the event
            event_type: Type of event
            event_id: ID of the event
            payload: Event payload
            
        Returns:
            Number of webhooks triggered
        """
        try:
            # Find all active webhooks for this API key that subscribe to this event
            webhooks = await self.list_webhooks(
                api_key_id=api_key_id,
                active_only=True,
                limit=100
            )
            
            # Filter webhooks that subscribe to this event
            relevant_webhooks = [
                w for w in webhooks
                if event_type in w.events
            ]
            
            # Deliver to all relevant webhooks
            delivered_count = 0
            for webhook in relevant_webhooks:
                success = await self.deliver_webhook(
                    webhook.id,
                    event_type,
                    event_id,
                    payload
                )
                if success:
                    delivered_count += 1
            
            logger.info(
                f"Triggered {event_type} event: {delivered_count}/{len(relevant_webhooks)} "
                f"webhooks delivered successfully"
            )
            
            return delivered_count
            
        except Exception as e:
            logger.error(f"Error triggering webhook event: {e}")
            return 0
    
    async def list_deliveries(
        self,
        webhook_id: str,
        limit: int = 50
    ) -> List[WebhookDelivery]:
        """
        List webhook deliveries.
        
        Args:
            webhook_id: Webhook ID
            limit: Maximum number of results
            
        Returns:
            List of WebhookDelivery
        """
        try:
            query = (
                self.db.collection(WEBHOOK_DELIVERIES_COLLECTION)
                .where("webhook_id", "==", webhook_id)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
            )
            
            docs = query.stream()
            
            deliveries = []
            for doc in docs:
                data = doc.to_dict()
                
                delivery = WebhookDelivery(
                    id=doc.id,
                    webhook_id=data["webhook_id"],
                    event_type=data["event_type"],
                    event_id=data["event_id"],
                    payload=data["payload"],
                    status=data["status"],
                    status_code=data.get("status_code"),
                    response_body=data.get("response_body"),
                    error_message=data.get("error_message"),
                    attempt_number=data["attempt_number"],
                    delivered_at=data.get("delivered_at"),
                    created_at=data["created_at"],
                )
                deliveries.append(delivery)
            
            return deliveries
            
        except Exception as e:
            logger.error(f"Error listing webhook deliveries: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_webhook_service_instance: Optional[WebhookService] = None


def get_webhook_service() -> WebhookService:
    """Return singleton instance of WebhookService."""
    global _webhook_service_instance
    if _webhook_service_instance is None:
        _webhook_service_instance = WebhookService()
    return _webhook_service_instance

