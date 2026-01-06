"""
Firestore Repository Service
Generic CRUD operations for Firestore collections with caching and seed data support.
"""

import logging
from typing import Dict, Any, List, Optional, TypeVar, Generic
from datetime import datetime
from functools import lru_cache

logger = logging.getLogger(__name__)

# Type for generic documents
T = TypeVar('T', bound=Dict[str, Any])


class FirestoreRepository:
    """
    Generic Firestore repository for CRUD operations.
    Falls back to in-memory storage if Firestore is unavailable.
    """
    
    def __init__(self, collection_name: str, id_field: str = "id"):
        self.collection_name = collection_name
        self.id_field = id_field
        self._db = None
        self._fallback_store: Dict[str, Dict[str, Any]] = {}
        self._initialized = False
    
    def _get_db(self):
        """Get Firestore client, initialize if needed"""
        if self._db is not None:
            return self._db
        
        try:
            from app.services.firebase_service import _initialize_firebase
            if _initialize_firebase():
                from firebase_admin import firestore
                self._db = firestore.client()
                self._initialized = True
                logger.info(f"✅ Firestore connected for collection: {self.collection_name}")
            else:
                logger.warning(f"⚠️ Firestore not available, using in-memory for: {self.collection_name}")
        except Exception as e:
            logger.warning(f"⚠️ Firestore init failed: {e}, using in-memory fallback")
        
        return self._db
    
    @property
    def is_persistent(self) -> bool:
        """Check if using real Firestore or fallback"""
        self._get_db()
        return self._db is not None
    
    async def get(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a document by ID"""
        db = self._get_db()
        
        if db:
            try:
                doc = db.collection(self.collection_name).document(doc_id).get()
                if doc.exists:
                    return doc.to_dict()
                return None
            except Exception as e:
                logger.error(f"Firestore get error: {e}")
        
        return self._fallback_store.get(doc_id)
    
    async def list(self, filters: Optional[Dict[str, Any]] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List documents with optional filters"""
        db = self._get_db()
        
        if db:
            try:
                query = db.collection(self.collection_name)
                
                if filters:
                    for field, value in filters.items():
                        query = query.where(field, "==", value)
                
                docs = query.limit(limit).stream()
                return [doc.to_dict() for doc in docs]
            except Exception as e:
                logger.error(f"Firestore list error: {e}")
        
        # Fallback
        results = list(self._fallback_store.values())
        if filters:
            for field, value in filters.items():
                results = [r for r in results if r.get(field) == value]
        return results[:limit]
    
    async def create(self, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new document"""
        db = self._get_db()
        
        # Ensure ID is in the document
        data[self.id_field] = doc_id
        
        if db:
            try:
                db.collection(self.collection_name).document(doc_id).set(data)
                logger.debug(f"Created {self.collection_name}/{doc_id}")
            except Exception as e:
                logger.error(f"Firestore create error: {e}")
        
        self._fallback_store[doc_id] = data
        return data
    
    async def update(self, doc_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing document"""
        db = self._get_db()
        
        if db:
            try:
                db.collection(self.collection_name).document(doc_id).update(data)
                doc = await self.get(doc_id)
                return doc
            except Exception as e:
                logger.error(f"Firestore update error: {e}")
        
        # Fallback
        if doc_id in self._fallback_store:
            self._fallback_store[doc_id].update(data)
            return self._fallback_store[doc_id]
        return None
    
    async def delete(self, doc_id: str) -> bool:
        """Delete a document"""
        db = self._get_db()
        
        if db:
            try:
                db.collection(self.collection_name).document(doc_id).delete()
            except Exception as e:
                logger.error(f"Firestore delete error: {e}")
        
        if doc_id in self._fallback_store:
            del self._fallback_store[doc_id]
            return True
        return False
    
    async def seed(self, initial_data: Dict[str, Dict[str, Any]]):
        """Seed initial data if collection is empty"""
        existing = await self.list(limit=1)
        
        if not existing:
            logger.info(f"Seeding {len(initial_data)} documents to {self.collection_name}")
            for doc_id, data in initial_data.items():
                await self.create(doc_id, data)
        else:
            logger.debug(f"Collection {self.collection_name} already has data, skipping seed")


# ============================================================================
# Repository Instances
# ============================================================================

# Singleton instances
_kb_repo: Optional[FirestoreRepository] = None
_subscription_repo: Optional[FirestoreRepository] = None
_user_repo: Optional[FirestoreRepository] = None


def get_kb_repository() -> FirestoreRepository:
    """Get the Knowledge Base repository"""
    global _kb_repo
    if _kb_repo is None:
        _kb_repo = FirestoreRepository("knowledge_bases", "kb_id")
    return _kb_repo


def get_subscription_repository() -> FirestoreRepository:
    """Get the KB Subscription repository"""
    global _subscription_repo
    if _subscription_repo is None:
        _subscription_repo = FirestoreRepository("kb_subscriptions", "subscription_id")
    return _subscription_repo


def get_user_repository() -> FirestoreRepository:
    """Get the User repository"""
    global _user_repo
    if _user_repo is None:
        _user_repo = FirestoreRepository("users", "user_id")
    return _user_repo
