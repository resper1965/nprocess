"""
Embedding Service - Generates vector embeddings using Vertex AI.
"""
import logging
from typing import List, Optional
import os

logger = logging.getLogger(__name__)

_embedding_service = None

class EmbeddingService:
    """Service to generate text embeddings using Vertex AI."""
    
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.location = "us-central1"
        self.model = None
        
        if not self.project_id:
            logger.warning("GCP_PROJECT_ID not set. EmbeddingService disabled.")
            return
            
        try:
            import vertexai
            from vertexai.language_models import TextEmbeddingModel
            
            vertexai.init(project=self.project_id, location=self.location)
            self.model = TextEmbeddingModel.from_pretrained("text-embedding-004")
            logger.info("✅ EmbeddingService initialized with text-embedding-004")
        except Exception as e:
            logger.error(f"Failed to initialize EmbeddingService: {e}")
            self.model = None

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates embeddings for a list of texts.
        
        Args:
            texts: List of strings to embed.
            
        Returns:
            List of embedding vectors (each is a list of floats).
        """
        if not self.model:
            logger.error("EmbeddingService not available.")
            return []
            
        try:
            from vertexai.language_models import TextEmbeddingInput
            
            # Batch texts for efficiency (max 250 per batch for text-embedding-004)
            batch_size = 100
            all_embeddings = []
            
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i+batch_size]
                inputs = [TextEmbeddingInput(text=t, task_type="RETRIEVAL_DOCUMENT") for t in batch]
                embeddings = self.model.get_embeddings(inputs)
                all_embeddings.extend([e.values for e in embeddings])
                
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return []

    def generate_single_embedding(self, text: str) -> Optional[List[float]]:
        """Generates embedding for a single text."""
        results = self.generate_embeddings([text])
        return results[0] if results else None


def get_embedding_service() -> EmbeddingService:
    """Singleton accessor for EmbeddingService."""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
