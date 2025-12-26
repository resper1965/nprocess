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
        source_id: str
    ) -> int:
        """
        Saves chunks with their embeddings to Firestore.
        
        Args:
            chunks: List of chunk dicts with 'content' and 'metadata'.
            embeddings: Corresponding list of embedding vectors.
            source_id: Identifier for the source (e.g., 'lgpd_br').
            
        Returns:
            Number of chunks successfully saved.
        """
        if not self.db:
            logger.error("Firestore not available.")
            return 0
            
        if len(chunks) != len(embeddings):
            logger.error("Mismatch between chunks and embeddings count.")
            return 0
            
        saved_count = 0
        batch = self.db.batch()
        
        # Collection structure: global_standards/{source_id}/chunks/{auto_id}
        collection_ref = self.db.collection("global_standards").document(source_id).collection("chunks")
        
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            doc_ref = collection_ref.document()
            
            doc_data = {
                "content": chunk.get("content", ""),
                "metadata": chunk.get("metadata", {}),
                "embedding_vector": Vector(embedding),
                "source_id": source_id,
                "created_at": firestore.SERVER_TIMESTAMP,
                "chunk_index": i
            }
            
            batch.set(doc_ref, doc_data)
            saved_count += 1
            
            # Commit in batches of 500 (Firestore limit)
            if saved_count % 500 == 0:
                batch.commit()
                batch = self.db.batch()
                logger.info(f"Committed {saved_count} chunks...")
        
        # Final commit
        if saved_count % 500 != 0:
            batch.commit()
            
        logger.info(f"✅ Saved {saved_count} chunks to Firestore for source: {source_id}")
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
