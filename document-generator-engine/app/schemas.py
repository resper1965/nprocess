"""
Pydantic schemas for Document Generator Engine
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class DocumentType(str, Enum):
    """Types of documents that can be generated"""
    PROCEDURE = "procedure"
    WORK_INSTRUCTION = "work_instruction"
    CHECKLIST = "checklist"


class ExportFormat(str, Enum):
    """Export formats for generated documents"""
    MARKDOWN = "markdown"
    BUNDLE = "bundle"  # ZIP with all documents


class GenerateDocumentsRequest(BaseModel):
    """Request model for document generation"""
    process_id: str = Field(..., description="Unique identifier for the process")
    process_name: str = Field(..., description="Human-readable name of the process")
    bpmn_xml: str = Field(..., description="BPMN 2.0 XML content")
    controls_addressed: Optional[List[str]] = Field(
        default=None,
        description="List of control IDs addressed by this process (e.g., ['ISO27001:A.8.7'])"
    )
    evidences_configured: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Evidence configuration mapping control IDs to evidence types"
    )
    company_context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Company-specific context (name, sector, policies)"
    )
    document_types: Optional[List[DocumentType]] = Field(
        default=None,
        description="Types of documents to generate. If None, generates all types."
    )
    export_format: ExportFormat = Field(
        default=ExportFormat.MARKDOWN,
        description="Export format"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "process_id": "proc_001",
                "process_name": "Instalação de Antivírus Corporativo",
                "bpmn_xml": "<bpmn:definitions>...</bpmn:definitions>",
                "controls_addressed": ["ISO27001:A.8.7", "SOC2:CC6.1"],
                "company_context": {
                    "company_name": "TechCorp",
                    "sector": "technology"
                },
                "document_types": ["procedure", "checklist"]
            }
        }


class GeneratedDocument(BaseModel):
    """Response model for a generated document"""
    document_id: str = Field(..., description="Unique document identifier")
    document_type: DocumentType = Field(..., description="Type of document")
    process_id: str = Field(..., description="Associated process ID")
    filename: str = Field(..., description="Filename of the generated document")
    format: str = Field(..., description="File format (markdown, pdf, etc)")
    size_bytes: int = Field(..., description="File size in bytes")
    download_url: str = Field(..., description="URL to download the document")
    generated_at: str = Field(..., description="Timestamp when document was generated")
    controls_covered: Optional[List[str]] = Field(
        default=None,
        description="List of controls covered in this document"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "doc_12345",
                "document_type": "procedure",
                "process_id": "proc_001",
                "filename": "POP_InstalacaoAntivirus.md",
                "format": "markdown",
                "size_bytes": 12450,
                "download_url": "/v1/documents/doc_12345/download",
                "generated_at": "2025-01-15T10:30:00Z",
                "controls_covered": ["ISO27001:A.8.7"]
            }
        }


class BpmnToMermaidRequest(BaseModel):
    """Request model for BPMN to Mermaid conversion"""
    bpmn_xml: str = Field(..., description="BPMN 2.0 XML content to convert")

    class Config:
        json_schema_extra = {
            "example": {
                "bpmn_xml": "<bpmn:definitions>...</bpmn:definitions>"
            }
        }


class BpmnToMermaidResponse(BaseModel):
    """Response model for BPMN to Mermaid conversion"""
    mermaid: str = Field(..., description="Mermaid flowchart syntax")
    preview_url: Optional[str] = Field(
        default=None,
        description="URL to preview image (if generated)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "mermaid": "graph TD\n  Start[Início] --> Task1[Download Instalador]\n  Task1 --> End[Fim]",
                "preview_url": None
            }
        }
