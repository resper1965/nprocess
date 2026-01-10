"""
Knowledge API schemas.

Pydantic models for knowledge base operations.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class IngestRequest(BaseModel):
    """Request to ingest a document into the knowledge base."""
    
    content: str = Field(..., description="Raw text content to ingest")
    strategy: Literal["default", "legal"] = Field(
        default="default",
        description="Chunking strategy: 'default' (sliding window) or 'legal' (preserves legal structure)"
    )
    doc_type: Literal["private", "marketplace"] = Field(
        default="private",
        description="Document type: 'private' (tenant-specific) or 'marketplace' (public)"
    )
    metadata: dict | None = Field(
        default=None,
        description="Optional metadata to attach to the document"
    )


class IngestResponse(BaseModel):
    """Response after document ingestion."""
    
    doc_id: str = Field(..., description="Unique document ID")
    chunk_count: int = Field(..., description="Number of chunks created")
    strategy: str = Field(..., description="Chunking strategy used")
    doc_type: str = Field(..., description="Document type")
    tenant_id: str | None = Field(None, description="Owner tenant ID (for private docs)")
    created_at: str = Field(..., description="ISO timestamp of ingestion")


class SearchRequest(BaseModel):
    """Request to search the knowledge base."""
    
    query: str = Field(..., description="Search query text")
    limit: int = Field(default=10, ge=1, le=100, description="Maximum results to return")
    filter_type: Literal["private", "marketplace", "all"] = Field(
        default="all",
        description="Filter by document type"
    )


class SearchResult(BaseModel):
    """A single search result."""
    
    id: str = Field(..., description="Chunk ID")
    content: str = Field(..., description="Chunk content")
    type: str = Field(..., description="Document type")
    metadata: dict = Field(default_factory=dict, description="Chunk metadata")
    score: float = Field(..., description="Similarity score")


class SearchResponse(BaseModel):
    """Response from knowledge base search."""
    
    query: str = Field(..., description="Original query")
    results: list[SearchResult] = Field(..., description="Matching chunks")
    count: int = Field(..., description="Number of results")


class DocumentSummary(BaseModel):
    """Summary of an ingested document."""
    
    doc_id: str = Field(..., description="Document ID")
    type: str = Field(..., description="Document type")
    chunk_count: int = Field(..., description="Number of chunks")
    created_at: datetime | None = Field(None, description="Ingestion timestamp")
    metadata: dict = Field(default_factory=dict, description="Document metadata")


class ListDocumentsResponse(BaseModel):
    """Response listing documents in the knowledge base."""
    
    documents: list[DocumentSummary]
    count: int


class DeleteDocumentResponse(BaseModel):
    """Response after deleting a document."""
    
    doc_id: str
    chunks_deleted: int
    message: str = "Document deleted successfully"
