"""
Documents API schemas.

Pydantic models for document generation operations.
"""

from typing import Literal

from pydantic import BaseModel, Field


class GenerateDocumentRequest(BaseModel):
    """Request to generate a document."""
    
    title: str = Field(
        ...,
        description="Document title",
        min_length=3,
        max_length=200,
    )
    content_description: str = Field(
        ...,
        description="Description of what the document should contain",
        min_length=20,
        max_length=10000,
    )
    doc_type: Literal["manual", "policy", "report", "procedure", "contract", "generic"] = Field(
        default="generic",
        description="Type of document to generate",
    )
    format: Literal["markdown", "html"] = Field(
        default="markdown",
        description="Output format",
    )
    context: str | None = Field(
        default=None,
        description="Additional context (e.g., company info, regulations)",
    )


class GenerateDocumentResponse(BaseModel):
    """Response with generated document."""
    
    document_id: str = Field(..., description="Unique document ID")
    title: str = Field(..., description="Document title")
    content: str = Field(..., description="Generated document content")
    doc_type: str = Field(..., description="Document type")
    format: str = Field(..., description="Output format")
    created_at: str = Field(..., description="ISO timestamp")
    model: str = Field(..., description="AI model used")
