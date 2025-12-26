"""
Real-time compliance score service for n.process.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict

from google.cloud import firestore

from app.schemas_realtime import (
    RealtimeScoreUpdate,
    RealtimeScoreSubscription,
    RealtimeScoreHistory,
)
from app.services.webhook_service import get_webhook_service
from app.schemas_webhooks import WebhookEventType


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

REALTIME_SCORES_COLLECTION = "realtime_scores"
SCORE_HISTORY_COLLECTION = "score_history"
SUBSCRIPTIONS_COLLECTION = "realtime_subscriptions"


# ============================================================================
# Real-time Score Service
# ============================================================================

class RealtimeScoreService:
    """Service for real-time compliance score tracking."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize real-time score service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("RealtimeScoreService initialized")
        except Exception as e:
            logger.error(f"Error initializing RealtimeScoreService: {e}")
            raise
    
    async def update_score(
        self,
        process_id: str,
        domain: str,
        score: float,
        triggered_by: str = "analysis"
    ) -> RealtimeScoreUpdate:
        """
        Update real-time compliance score for a process.
        
        Args:
            process_id: Process ID
            domain: Regulatory domain
            score: New compliance score (0-100)
            triggered_by: What triggered the update
            
        Returns:
            RealtimeScoreUpdate
        """
        try:
            now = datetime.utcnow()
            
            # Get previous score
            score_ref = (
                self.db.collection(REALTIME_SCORES_COLLECTION)
                .document(f"{process_id}_{domain}")
            )
            score_doc = score_ref.get()
            
            previous_score = None
            if score_doc.exists:
                previous_data = score_doc.to_dict()
                previous_score = previous_data.get("score")
            
            change = score - (previous_score or score)
            
            # Update current score
            score_data = {
                "process_id": process_id,
                "domain": domain,
                "score": score,
                "previous_score": previous_score,
                "updated_at": now,
                "triggered_by": triggered_by,
            }
            score_ref.set(score_data)
            
            # Record in history
            history_ref = self.db.collection(SCORE_HISTORY_COLLECTION).document()
            history_ref.set({
                "process_id": process_id,
                "domain": domain,
                "score": score,
                "previous_score": previous_score,
                "change": change,
                "timestamp": now,
                "triggered_by": triggered_by,
            })
            
            # Notify subscribers
            await self._notify_subscribers(process_id, domain, score, change)
            
            logger.info(f"Real-time score updated: {process_id}/{domain} = {score}% (change: {change:+.1f})")
            
            return RealtimeScoreUpdate(
                process_id=process_id,
                domain=domain,
                score=score,
                previous_score=previous_score,
                change=change,
                timestamp=now,
                triggered_by=triggered_by,
            )
            
        except Exception as e:
            logger.error(f"Error updating real-time score: {e}")
            raise
    
    async def get_current_score(
        self,
        process_id: str,
        domain: str
    ) -> Optional[float]:
        """
        Get current real-time score for a process.
        
        Args:
            process_id: Process ID
            domain: Regulatory domain
            
        Returns:
            Current score or None if not found
        """
        try:
            score_ref = (
                self.db.collection(REALTIME_SCORES_COLLECTION)
                .document(f"{process_id}_{domain}")
            )
            score_doc = score_ref.get()
            
            if not score_doc.exists:
                return None
            
            return score_doc.to_dict().get("score")
            
        except Exception as e:
            logger.error(f"Error getting current score: {e}")
            return None
    
    async def get_score_history(
        self,
        process_id: str,
        domain: str,
        hours: int = 24
    ) -> RealtimeScoreHistory:
        """
        Get score history for a process.
        
        Args:
            process_id: Process ID
            domain: Regulatory domain
            hours: Number of hours of history to retrieve
            
        Returns:
            RealtimeScoreHistory
        """
        try:
            cutoff = datetime.utcnow() - timedelta(hours=hours)
            
            query = (
                self.db.collection(SCORE_HISTORY_COLLECTION)
                .where("process_id", "==", process_id)
                .where("domain", "==", domain)
                .where("timestamp", ">=", cutoff)
                .order_by("timestamp", direction=firestore.Query.ASCENDING)
            )
            
            docs = query.stream()
            
            scores = []
            for doc in docs:
                data = doc.to_dict()
                scores.append({
                    "timestamp": data["timestamp"],
                    "score": data["score"],
                    "change": data.get("change", 0),
                })
            
            if not scores:
                # Get current score
                current = await self.get_current_score(process_id, domain)
                if current:
                    scores.append({
                        "timestamp": datetime.utcnow(),
                        "score": current,
                        "change": 0,
                    })
                    current_score = current
                    average_score = current
                else:
                    current_score = 0.0
                    average_score = 0.0
            else:
                current_score = scores[-1]["score"]
                average_score = sum(s["score"] for s in scores) / len(scores)
            
            # Calculate trend
            if len(scores) >= 2:
                recent_avg = sum(s["score"] for s in scores[-5:]) / min(5, len(scores))
                older_avg = sum(s["score"] for s in scores[:5]) / min(5, len(scores))
                
                if recent_avg > older_avg + 2:
                    trend = "improving"
                elif recent_avg < older_avg - 2:
                    trend = "declining"
                else:
                    trend = "stable"
            else:
                trend = "stable"
            
            return RealtimeScoreHistory(
                process_id=process_id,
                domain=domain,
                scores=scores,
                current_score=current_score,
                average_score=average_score,
                trend=trend,
            )
            
        except Exception as e:
            logger.error(f"Error getting score history: {e}")
            raise
    
    async def subscribe_to_updates(
        self,
        api_key_id: str,
        process_id: Optional[str] = None,
        domain: Optional[str] = None,
        callback_url: Optional[str] = None
    ) -> RealtimeScoreSubscription:
        """
        Subscribe to real-time score updates.
        
        Args:
            api_key_id: API key ID of subscriber
            process_id: Specific process ID (null for all)
            domain: Specific domain (null for all)
            callback_url: Webhook URL for updates
            
        Returns:
            RealtimeScoreSubscription
        """
        try:
            now = datetime.utcnow()
            
            subscription_data = {
                "process_id": process_id,
                "domain": domain,
                "callback_url": callback_url,
                "created_by": api_key_id,
                "created_at": now,
                "is_active": True,
            }
            
            doc_ref = self.db.collection(SUBSCRIPTIONS_COLLECTION).document()
            doc_ref.set(subscription_data)
            
            subscription_id = doc_ref.id
            
            logger.info(f"Subscription created: {subscription_id}")
            
            return RealtimeScoreSubscription(
                subscription_id=subscription_id,
                process_id=process_id,
                domain=domain,
                callback_url=callback_url,
                created_at=now,
                is_active=True,
            )
            
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            raise
    
    async def _notify_subscribers(
        self,
        process_id: str,
        domain: str,
        score: float,
        change: float
    ) -> None:
        """Notify subscribers of score updates."""
        try:
            # Find matching subscriptions
            query = self.db.collection(SUBSCRIPTIONS_COLLECTION).where("is_active", "==", True)
            
            subscriptions = query.stream()
            
            for sub_doc in subscriptions:
                sub_data = sub_doc.to_dict()
                
                # Check if subscription matches
                if sub_data.get("process_id") and sub_data["process_id"] != process_id:
                    continue
                if sub_data.get("domain") and sub_data["domain"] != domain:
                    continue
                
                # Send notification
                callback_url = sub_data.get("callback_url")
                if callback_url:
                    try:
                        import httpx
                        async with httpx.AsyncClient() as client:
                            await client.post(
                                callback_url,
                                json={
                                    "process_id": process_id,
                                    "domain": domain,
                                    "score": score,
                                    "change": change,
                                    "timestamp": datetime.utcnow().isoformat(),
                                },
                                timeout=5.0,
                            )
                    except Exception as e:
                        logger.warning(f"Error sending callback to {callback_url}: {e}")
                
                # Also trigger webhook if webhook service is available
                try:
                    webhook_service = get_webhook_service()
                    await webhook_service.trigger_event(
                        WebhookEventType.COMPLIANCE_SCORE_UPDATED,
                        {
                            "process_id": process_id,
                            "domain": domain,
                            "score": score,
                            "change": change,
                        }
                    )
                except Exception as e:
                    logger.debug(f"Webhook service not available or error: {e}")
                    
        except Exception as e:
            logger.warning(f"Error notifying subscribers: {e}")


# ============================================================================
# Singleton Instance
# ============================================================================

_realtime_score_service_instance: Optional[RealtimeScoreService] = None


def get_realtime_score_service() -> RealtimeScoreService:
    """Return singleton instance of RealtimeScoreService."""
    global _realtime_score_service_instance
    if _realtime_score_service_instance is None:
        _realtime_score_service_instance = RealtimeScoreService()
    return _realtime_score_service_instance

