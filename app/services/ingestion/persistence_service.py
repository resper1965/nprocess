"""
Persistence Service - Saves embeddings to Firestore for Vector Search.
"""
import logging
from typing import List, Dict, Any
import os
from datetime import datetime

from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector

logger = logging.getLogger(__name__)

_persistence_service = None

class PersistenceService:
    """Service to persist vector chunks to Firestore."""
    
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.db = None
        
        if not self.project_id:
            logger.warning("GCP_PROJECT_ID not set. PersistenceService disabled.")
            return
            
        try:
            self.db = firestore.Client(project=self.project_id)
            logger.info("✅ PersistenceService initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize Firestore: {e}")
            self.db = None

    def save_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
        source_id: str,
        tenant_id: str = "system",
        scope: str = "global"
    ) -> int:
        """
        Saves chunks to Firestore with multi-tenant isolation.
        
        Args:
            chunks: List of data dicts.
            embeddings: Vectors.
            source_id: Unique ID for the document/source.
            tenant_id: 'system' for global, or client_id for private.
            scope: 'global' or 'private'.
        """
        if not self.db:
            return 0
            
        if len(chunks) != len(embeddings):
            return 0
            
        saved_count = 0
        batch = self.db.batch()
        
        # Unified Collection for easier filtered search
        collection_ref = self.db.collection("vectors")
        
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            doc_ref = collection_ref.document()
            
            doc_data = {
                "content": chunk.get("content", ""),
                "metadata": chunk.get("metadata", {}),
                "embedding_vector": Vector(embedding),
                "source_id": source_id,
                "tenant_id": tenant_id,
                "scope": scope,
                "created_at": firestore.SERVER_TIMESTAMP,
                "chunk_index": i
            }
            
            batch.set(doc_ref, doc_data)
            saved_count += 1
            
            if saved_count % 500 == 0:
                batch.commit()
                batch = self.db.batch()
                logger.info(f"Committed {saved_count} chunks...")
        
        if saved_count % 500 != 0:
            batch.commit()
            
        logger.info(f"✅ Saved {saved_count} chunks to 'vectors' [Tenant: {tenant_id}]")
        return saved_count

    def update_source_metadata(self, source_id: str, metadata: Dict[str, Any]):
        """Updates or creates metadata document for the source."""
        if not self.db:
            return
            
        doc_ref = self.db.collection("global_standards").document(source_id)
        doc_ref.set({
            **metadata,
            "last_updated": firestore.SERVER_TIMESTAMP
        }, merge=True)


def get_persistence_service() -> PersistenceService:
    """Singleton accessor for PersistenceService."""
    global _persistence_service
    if _persistence_service is None:
        _persistence_service = PersistenceService()
    return _persistence_service
