import logging
from typing import Dict, Any, List
from .strategies import IngestionStrategy
from .legal_strategy import LegalTextStrategy
from .technical_strategy import TechnicalStandardStrategy
from .web_strategy import WebWatchStrategy
from .embedding_service import get_embedding_service
from .persistence_service import get_persistence_service

logger = logging.getLogger(__name__)

def ingest_command_handler(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main Orchestrator for Knowledge Ingestion.
    Now includes embedding generation and Firestore persistence.
    
    Args:
        request: dict containing:
            - source_type: 'legal' | 'technical' | 'web'
            - source: URL or FilePath or Raw Text
            - source_id: Unique identifier for this source (e.g., 'lgpd_br')
            - metadata: dict (optional)
            
    Returns:
        Summary of processing including chunks saved.
    """
    source_type = request.get('source_type')
    source = request.get('source')
    source_id = request.get('source_id', 'unknown')
    metadata = request.get('metadata', {})
    
    if not source_type or not source:
        raise ValueError("Missing 'source_type' or 'source'")
        
    strategy: IngestionStrategy = None
    
    # Factory Logic
    if source_type == 'legal':
        strategy = LegalTextStrategy()
    elif source_type == 'technical':
        strategy = TechnicalStandardStrategy()
    elif source_type == 'web':
        strategy = WebWatchStrategy()
    else:
        raise ValueError(f"Unknown source_type: {source_type}")
        
    logger.info(f"Starting Ingestion. Strategy: {source_type}, Source: {source[:50]}...")
    
    # Step 1: Execute Strategy (Chunking)
    chunks = strategy.ingest(source, metadata=metadata)
    
    if not chunks:
        return {"status": "skipped", "reason": "No content or Unchanged (FinOps)"}
    
    logger.info(f"Generated {len(chunks)} chunks. Proceeding to embedding...")
    
    # Step 2: Generate Embeddings
    embedding_service = get_embedding_service()
    texts = [c.get('content', '') for c in chunks]
    embeddings = embedding_service.generate_embeddings(texts)
    
    if not embeddings or len(embeddings) != len(chunks):
        logger.error("Embedding generation failed or count mismatch.")
        return {"status": "error", "reason": "Embedding generation failed"}
    
    logger.info(f"Generated {len(embeddings)} embeddings. Saving to Firestore...")
    
    # Step 3: Persist to Firestore
    persistence_service = get_persistence_service()
    saved_count = persistence_service.save_chunks(chunks, embeddings, source_id)
    
    # Update source metadata
    persistence_service.update_source_metadata(source_id, {
        "name": metadata.get("name", source_id),
        "source_type": source_type,
        "total_chunks": saved_count,
        "source_url": source if source_type == 'web' else None
    })
    
    return {
        "status": "success",
        "source_id": source_id,
        "chunks_generated": len(chunks),
        "chunks_saved": saved_count,
        "sample_chunk": chunks[0]['content'][:100] if chunks else None
    }
