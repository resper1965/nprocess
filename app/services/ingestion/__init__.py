"""
Ingestion Package - Knowledge Ingestion Engine.
"""
from .orchestrator import ingest_command_handler
from .strategies import IngestionStrategy
from .legal_strategy import LegalTextStrategy
from .technical_strategy import TechnicalStandardStrategy
from .web_strategy import WebWatchStrategy
from .embedding_service import get_embedding_service, EmbeddingService
from .persistence_service import get_persistence_service, PersistenceService

__all__ = [
    "ingest_command_handler",
    "IngestionStrategy",
    "LegalTextStrategy",
    "TechnicalStandardStrategy",
    "WebWatchStrategy",
    "get_embedding_service",
    "EmbeddingService",
    "get_persistence_service",
    "PersistenceService",
]
