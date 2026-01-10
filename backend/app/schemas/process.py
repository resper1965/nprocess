"""
Process API schemas.

Pydantic models for process/BPMN operations.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class GenerateBPMNRequest(BaseModel):
    """Request to generate a BPMN diagram."""
    
    description: str = Field(
        ...,
        description="Natural language description of the process",
        min_length=10,
        max_length=10000,
    )
    context: str | None = Field(
        default=None,
        description="Optional additional context (e.g., industry, regulations)"
    )


class GenerateBPMNResponse(BaseModel):
    """Response with generated BPMN diagram."""
    
    process_id: str = Field(..., description="Unique process ID")
    bpmn_xml: str = Field(..., description="BPMN 2.0 XML content")
    description: str = Field(..., description="Original description")
    created_at: str = Field(..., description="ISO timestamp")
    model: str = Field(..., description="AI model used")


class ProcessJob(BaseModel):
    """Status of an async process job."""
    
    job_id: str = Field(..., description="Unique job ID")
    status: str = Field(..., description="pending | processing | completed | failed")
    result: GenerateBPMNResponse | None = Field(None, description="Result if completed")
    error: str | None = Field(None, description="Error message if failed")
    created_at: datetime
    updated_at: datetime | None = None
