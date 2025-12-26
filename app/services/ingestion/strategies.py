from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import hashlib
import logging

logger = logging.getLogger(__name__)

class IngestionStrategy(ABC):
    """
    Abstract Base Class for Ingestion Strategies.
    Defines the contract for reading, processing and returning chunks.
    """
    
    @abstractmethod
    def ingest(self, source: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Ingests data from a source and returns a list of chunks ready for embedding.
        
        Args:
            source: The source identifier (URL, File Path, File Content).
            **kwargs: Additional strategy-specific arguments.
            
        Returns:
            List of dictionaries in the format:
            {
                "content": str,
                "metadata": dict
            }
        """
        pass

    def calculate_hash(self, content: str) -> str:
        """Calculates MD5 hash of string content."""
        return hashlib.md5(content.encode('utf-8')).hexdigest()
