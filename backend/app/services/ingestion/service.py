"""
Ingestion service for processing documents.

Orchestrates the document ingestion pipeline:
1. Receive document (text, URL, or file)
2. Apply chunking strategy
3. Generate embeddings for each chunk
4. Store in Firestore with tenant isolation
"""

import logging
import uuid
from datetime import datetime

from app.services.ingestion.chunking import ChunkingStrategy, get_chunking_strategy

logger = logging.getLogger(__name__)


class IngestionService:
    """
    Document ingestion service.
    
    Handles the full pipeline from raw document to indexed chunks.
    """
    
    def __init__(
        self,
        embedding_service=None,
        knowledge_service=None,
    ):
        """
        Initialize ingestion service.
        
        Args:
            embedding_service: Service for generating embeddings
            knowledge_service: Service for storing/retrieving knowledge
        """
        self.embedding_service = embedding_service
        self.knowledge_service = knowledge_service
    
    async def ingest_text(
        self,
        content: str,
        tenant_id: str,
        strategy: str = "default",
        doc_type: str = "private",
        metadata: dict | None = None,
    ) -> dict:
        """
        Ingest raw text content.
        
        Args:
            content: Raw text to ingest
            tenant_id: ID of the tenant (for private docs)
            strategy: Chunking strategy ("default" or "legal")
            doc_type: Type of document ("private" or "marketplace")
            metadata: Optional metadata to attach
            
        Returns:
            Dict with ingestion results (doc_id, chunk_count, etc.)
        """
        # Generate document ID
        doc_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        logger.info(f"Starting ingestion for doc {doc_id}, strategy={strategy}")
        
        # Get chunking strategy
        chunker: ChunkingStrategy = get_chunking_strategy(strategy)
        
        # Chunk the document
        base_metadata = {
            "source_doc_id": doc_id,
            "doc_type": doc_type,
            "ingested_at": created_at.isoformat(),
            **(metadata or {}),
        }
        
        chunks = chunker.chunk(content, base_metadata)
        logger.info(f"Document {doc_id} split into {len(chunks)} chunks using {chunker.name}")
        
        # Generate embeddings if service available
        if self.embedding_service:
            for chunk in chunks:
                embedding = await self.embedding_service.embed(chunk.content)
                chunk.metadata["embedding"] = embedding
        
        # Store chunks if knowledge service available
        stored_chunks = []
        if self.knowledge_service:
            for chunk in chunks:
                chunk_id = await self.knowledge_service.store_chunk(
                    content=chunk.content,
                    embedding=chunk.metadata.get("embedding"),
                    doc_type=doc_type,
                    tenant_id=tenant_id if doc_type == "private" else None,
                    metadata=chunk.metadata,
                )
                stored_chunks.append(chunk_id)
        
        result = {
            "doc_id": doc_id,
            "chunk_count": len(chunks),
            "strategy": chunker.name,
            "doc_type": doc_type,
            "tenant_id": tenant_id if doc_type == "private" else None,
            "created_at": created_at.isoformat(),
            "chunk_ids": stored_chunks,
        }
        
        logger.info(f"Ingestion complete for doc {doc_id}: {len(chunks)} chunks stored")
        return result
    
    async def ingest_file(
        self,
        file_content: bytes,
        filename: str,
        tenant_id: str,
        strategy: str = "default",
        doc_type: str = "private",
        metadata: dict | None = None,
    ) -> dict:
        """
        Ingest content from a file (PDF or Text).
        
        Args:
            file_content: Raw bytes of the file
            filename: Name of the file
            tenant_id: ID of the tenant
            strategy: Chunking strategy
            doc_type: Type of document
            metadata: Optional metadata
            
        Returns:
            Dict with ingestion results
        """
        import io
        from pypdf import PdfReader
        
        text_content = ""
        
        # Determine file type
        if filename.lower().endswith(".pdf"):
            try:
                # Process PDF
                logger.info(f"Processing PDF file: {filename}")
                pdf_file = io.BytesIO(file_content)
                reader = PdfReader(pdf_file)
                
                # Extract text from all pages
                for page in reader.pages:
                    text_content += page.extract_text() + "\n\n"
                    
                if not text_content.strip():
                    logger.warning(f"No text extracted from PDF: {filename}")
                    
            except Exception as e:
                logger.error(f"Failed to process PDF {filename}: {e}")
                raise ValueError(f"Invalid or corrupted PDF file: {str(e)}")
        else:
            # Assume text
            try:
                text_content = file_content.decode("utf-8")
            except UnicodeDecodeError:
                # Try latin-1 fallback
                text_content = file_content.decode("latin-1")
        
        # Enrich metadata
        file_metadata = {
            **(metadata or {}),
            "filename": filename,
            "original_size": len(file_content),
            "content_type": "application/pdf" if filename.lower().endswith(".pdf") else "text/plain",
        }
        
        # Helper to treat title if not present
        if "title" not in file_metadata:
            file_metadata["title"] = filename
            
        return await self.ingest_text(
            content=text_content,
            tenant_id=tenant_id,
            strategy=strategy,
            doc_type=doc_type,
            metadata=file_metadata,
        )

    async def ingest_url(
        self,
        url: str,
        tenant_id: str,
        strategy: str = "default",
        doc_type: str = "private",
        metadata: dict | None = None,
    ) -> dict:
        """
        Ingest content from a URL.
        
        Args:
            url: URL to fetch and ingest
            tenant_id: ID of the tenant
            strategy: Chunking strategy
            doc_type: Type of document
            metadata: Optional metadata
            
        Returns:
            Dict with ingestion results
        """
        # TODO: Implement URL fetching
        # For now, placeholder
        raise NotImplementedError("URL ingestion not yet implemented")
    
    def get_available_strategies(self) -> list[str]:
        """Get list of available chunking strategies."""
        return ["default", "sliding_window", "legal", "legal_document"]
