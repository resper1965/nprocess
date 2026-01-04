"""
Document Service - Orchestrates document generation.
"""
import logging
from typing import Dict, Optional
from app.services.ai_service import get_ai_service

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.ai_service = get_ai_service()
        
    async def generate(self, doc_type: str, context: Optional[str] = "") -> Dict:
        """
        Generates a structured document.
        """
        if not self.ai_service:
            raise ValueError("AI Service unavailable")
            
        return await self.ai_service.generate_document(
            doc_type=doc_type,
            context=context or "No specific context provided."
        )

_doc_service = None

def get_document_service() -> DocumentService:
    global _doc_service
    if _doc_service is None:
        _doc_service = DocumentService()
    return _doc_service
