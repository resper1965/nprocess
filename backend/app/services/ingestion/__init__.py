"""Ingestion service package."""

from app.services.ingestion.chunking import (
    ChunkingStrategy,
    SlidingWindowStrategy,
    LegalDocumentStrategy,
    get_chunking_strategy,
)
from app.services.ingestion.service import IngestionService

__all__ = [
    "ChunkingStrategy",
    "SlidingWindowStrategy",
    "LegalDocumentStrategy",
    "get_chunking_strategy",
    "IngestionService",
]
