"""
Embedding service using Vertex AI.

Generates vector embeddings for text using Google's text-embedding-004 model.
"""

import logging
from functools import lru_cache

from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service for generating text embeddings using Vertex AI.
    
    Uses Google's text-embedding-004 model which produces 768-dimensional vectors.
    """
    
    MODEL_NAME = "text-embedding-004"
    EMBEDDING_DIMENSION = 768
    
    def __init__(self):
        """Initialize the embedding service."""
        self._model: TextEmbeddingModel | None = None
        self._initialized = False
    
    def _ensure_initialized(self) -> None:
        """Ensure Vertex AI is initialized."""
        if not self._initialized:
            aiplatform.init(
                project=settings.gcp_project_id,
                location=settings.gcp_region,
            )
            self._model = TextEmbeddingModel.from_pretrained(self.MODEL_NAME)
            self._initialized = True
            logger.info(f"Initialized Vertex AI embedding model: {self.MODEL_NAME}")
    
    async def embed(self, text: str) -> list[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            List of floats representing the embedding vector (768 dimensions)
        """
        self._ensure_initialized()
        
        # Truncate if too long (model has token limit)
        if len(text) > 10000:
            text = text[:10000]
            logger.warning("Text truncated to 10000 chars for embedding")
        
        try:
            embeddings = self._model.get_embeddings([text])
            embedding = embeddings[0].values
            logger.debug(f"Generated embedding with {len(embedding)} dimensions")
            return embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        self._ensure_initialized()
        
        # Truncate long texts
        processed_texts = [t[:10000] if len(t) > 10000 else t for t in texts]
        
        try:
            # Process in batches of 250 (API limit)
            batch_size = 250
            all_embeddings = []
            
            for i in range(0, len(processed_texts), batch_size):
                batch = processed_texts[i:i + batch_size]
                embeddings = self._model.get_embeddings(batch)
                all_embeddings.extend([e.values for e in embeddings])
            
            logger.info(f"Generated {len(all_embeddings)} embeddings")
            return all_embeddings
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            raise


@lru_cache
def get_embedding_service() -> EmbeddingService:
    """Get cached embedding service instance."""
    return EmbeddingService()
