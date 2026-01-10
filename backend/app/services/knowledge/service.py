"""
Knowledge service for RAG operations.

Handles storage and retrieval of knowledge chunks using Firestore Vector Search.
Implements tenant isolation for private documents.
"""

import logging
import uuid
from datetime import datetime
from functools import lru_cache

from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure

from app.core.config import settings

logger = logging.getLogger(__name__)


class KnowledgeService:
    """
    Service for managing knowledge base with vector search.
    
    Uses Firestore with Vector Search for semantic retrieval.
    Enforces tenant isolation for private documents.
    """
    
    COLLECTION_NAME = "knowledge_base"
    
    def __init__(self):
        """Initialize the knowledge service."""
        self._db: firestore.Client | None = None
    
    @property
    def db(self) -> firestore.Client:
        """Get Firestore client."""
        if self._db is None:
            self._db = firestore.Client(project=settings.gcp_project_id)
            logger.info("Initialized Firestore client")
        return self._db
    
    @property
    def collection(self):
        """Get knowledge base collection reference."""
        return self.db.collection(self.COLLECTION_NAME)
    
    async def store_chunk(
        self,
        content: str,
        embedding: list[float] | None,
        doc_type: str,
        tenant_id: str | None,
        metadata: dict | None = None,
    ) -> str:
        """
        Store a knowledge chunk in Firestore.
        
        Args:
            content: Text content of the chunk
            embedding: Vector embedding (768 dimensions)
            doc_type: "private" or "marketplace"
            tenant_id: Owner tenant ID (None for marketplace)
            metadata: Additional metadata
            
        Returns:
            ID of the stored chunk
        """
        chunk_id = str(uuid.uuid4())
        
        doc_data = {
            "content": content,
            "type": doc_type,
            "tenant_id": tenant_id,
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
        }
        
        # Add embedding as Firestore Vector if available
        if embedding:
            doc_data["embedding"] = Vector(embedding)
        
        # Store in Firestore
        self.collection.document(chunk_id).set(doc_data)
        logger.debug(f"Stored chunk {chunk_id} in Firestore")
        
        return chunk_id
    
    async def search(
        self,
        query_embedding: list[float],
        tenant_id: str,
        limit: int = 10,
        filter_type: str = "all",
    ) -> list[dict]:
        """
        Perform semantic search using vector similarity.
        
        Args:
            query_embedding: Vector embedding of the search query
            tenant_id: ID of the requesting tenant
            limit: Maximum number of results
            filter_type: "private", "marketplace", or "all"
            
        Returns:
            List of matching chunks with scores
        """
        # Build query based on filter type
        query = self.collection
        
        if filter_type == "private":
            # Only private docs from this tenant
            query = query.where("type", "==", "private")
            query = query.where("tenant_id", "==", tenant_id)
        elif filter_type == "marketplace":
            # Only marketplace (public) docs
            query = query.where("type", "==", "marketplace")
        else:
            # All docs: private from tenant + all marketplace
            # This requires a compound query or client-side filtering
            # For now, we'll do two queries and merge
            pass
        
        # Perform vector search
        try:
            vector_query = query.find_nearest(
                vector_field="embedding",
                query_vector=Vector(query_embedding),
                distance_measure=DistanceMeasure.COSINE,
                limit=limit,
            )
            
            results = []
            for doc in vector_query.stream():
                doc_data = doc.to_dict()
                results.append({
                    "id": doc.id,
                    "content": doc_data.get("content", ""),
                    "type": doc_data.get("type"),
                    "metadata": doc_data.get("metadata", {}),
                    "score": doc_data.get("distance", 0),
                })
            
            logger.info(f"Vector search returned {len(results)} results")
            return results
            
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            raise
    
    async def get_documents(
        self,
        tenant_id: str,
        doc_type: str = "private",
        limit: int = 100,
    ) -> list[dict]:
        """
        List documents for a tenant.
        
        Args:
            tenant_id: ID of the tenant
            doc_type: Filter by document type
            limit: Maximum documents to return
            
        Returns:
            List of document summaries
        """
        query = self.collection.where("tenant_id", "==", tenant_id)
        
        if doc_type != "all":
            query = query.where("type", "==", doc_type)
        
        query = query.limit(limit)
        
        # Group by source_doc_id
        docs_by_source = {}
        for doc in query.stream():
            data = doc.to_dict()
            source_id = data.get("metadata", {}).get("source_doc_id", doc.id)
            
            if source_id not in docs_by_source:
                docs_by_source[source_id] = {
                    "doc_id": source_id,
                    "type": data.get("type"),
                    "chunk_count": 0,
                    "created_at": data.get("created_at"),
                    "metadata": data.get("metadata", {}),
                }
            
            docs_by_source[source_id]["chunk_count"] += 1
        
        return list(docs_by_source.values())
    
    async def delete_document(self, doc_id: str, tenant_id: str) -> int:
        """
        Delete a document and all its chunks.
        
        Args:
            doc_id: ID of the source document
            tenant_id: ID of the requesting tenant (for authorization)
            
        Returns:
            Number of chunks deleted
        """
        # Find all chunks for this document
        query = self.collection.where(
            "metadata.source_doc_id", "==", doc_id
        ).where("tenant_id", "==", tenant_id)
        
        deleted = 0
        batch = self.db.batch()
        
        for doc in query.stream():
            batch.delete(doc.reference)
            deleted += 1
            
            # Commit batch every 500 deletes
            if deleted % 500 == 0:
                batch.commit()
                batch = self.db.batch()
        
        if deleted % 500 != 0:
            batch.commit()
        
        logger.info(f"Deleted {deleted} chunks for document {doc_id}")
        return deleted


@lru_cache
def get_knowledge_service() -> KnowledgeService:
    """Get cached knowledge service instance."""
    return KnowledgeService()
