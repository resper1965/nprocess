"""
Pydantic models for RegulatoryRAG API

All request/response models with validation
"""

from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum

# ============================================================================
# Enums
# ============================================================================

class RegulationDomain(str, Enum):
    """Regulation domains"""
    BANKING = "banking"
    FINANCE = "finance"
    HEALTHCARE = "healthcare"
    INSURANCE = "insurance"
    DATA_PRIVACY = "data_privacy"
    LABOR = "labor"
    TAX = "tax"
    ENVIRONMENTAL = "environmental"
    SECURITIES = "securities"
    ANTI_MONEY_LAUNDERING = "anti_money_laundering"

class BrazilianDataset(str, Enum):
    """Brazilian regulatory datasets"""
    ANEEL = "aneel"  # Agência Nacional de Energia Elétrica
    ONS = "ons"      # Operador Nacional do Sistema Elétrico
    BACEN = "bacen"  # Banco Central do Brasil
    CVM = "cvm"      # Comissão de Valores Mobiliários
    SUSEP = "susep"  # Superintendência de Seguros Privados
    LGPD = "lgpd"    # Lei Geral de Proteção de Dados (ANPD)
    ANPD = "anpd"    # Autoridade Nacional de Proteção de Dados
    ARCYBER = "arcyber"  # Framework de Cibersegurança do Setor Elétrico

# ============================================================================
# Search Models
# ============================================================================

class RegulationSearchRequest(BaseModel):
    """Request model for regulation search"""
    query: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Search query in natural language"
    )
    domain: Optional[str] = Field(
        None,
        description="Filter by regulation domain (e.g., 'banking', 'healthcare')"
    )
    top_k: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Number of top results to return"
    )
    min_quality_score: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Minimum quality score threshold (0.0 to 1.0)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "query": "What are the requirements for customer data protection in financial institutions?",
                "domain": "banking",
                "top_k": 5,
                "min_quality_score": 0.8
            }
        }

class RegulationSearchByDatasetsRequest(BaseModel):
    """Request model for regulation search filtered by Brazilian datasets"""
    query: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Search query in natural language"
    )
    datasets: List[str] = Field(
        ...,
        min_items=1,
        description="List of datasets to search (e.g., ['aneel', 'ons', 'lgpd'])"
    )
    top_k: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Number of top results to return"
    )
    min_quality_score: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Minimum quality score threshold (0.0 to 1.0)"
    )

    @validator('datasets')
    def validate_datasets(cls, v):
        """Validate that all datasets are valid Brazilian datasets"""
        valid_datasets = [d.value for d in BrazilianDataset]
        for dataset in v:
            if dataset.lower() not in valid_datasets:
                raise ValueError(
                    f"Invalid dataset '{dataset}'. "
                    f"Must be one of: {', '.join(valid_datasets)}"
                )
        return [d.lower() for d in v]  # Normalize to lowercase

    class Config:
        json_schema_extra = {
            "example": {
                "query": "prazo de notificação de incidente de segurança cibernética",
                "datasets": ["aneel", "arcyber"],
                "top_k": 5,
                "min_quality_score": 0.75
            }
        }

class RegulationResult(BaseModel):
    """Single regulation search result"""
    regulation_id: str = Field(..., description="Unique regulation identifier")
    title: str = Field(..., description="Regulation title")
    description: str = Field(..., description="Regulation description or summary")
    content_snippet: str = Field(..., description="Relevant content snippet")
    domain: str = Field(..., description="Regulation domain")
    authority: str = Field(..., description="Regulatory authority (e.g., 'BACEN', 'SUSEP')")
    document_number: str = Field(..., description="Official document number")
    published_date: Optional[datetime] = Field(None, description="Publication date")
    effective_date: Optional[datetime] = Field(None, description="Effective date")
    url: Optional[str] = Field(None, description="Official document URL")
    quality_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Quality/relevance score (0.0 to 1.0)"
    )
    metadata: Optional[dict] = Field(default_factory=dict, description="Additional metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "regulation_id": "bacen-res-4893",
                "title": "Resolution 4893 - Data Security",
                "description": "Establishes requirements for data security in financial institutions",
                "content_snippet": "Financial institutions must implement adequate security measures...",
                "domain": "banking",
                "authority": "BACEN",
                "document_number": "RES 4893/2021",
                "published_date": "2021-02-01T00:00:00Z",
                "effective_date": "2021-08-01T00:00:00Z",
                "url": "https://www.bcb.gov.br/...",
                "quality_score": 0.95,
                "metadata": {}
            }
        }

class RegulationSearchResponse(BaseModel):
    """Response model for regulation search"""
    query: str = Field(..., description="Original search query")
    total_results: int = Field(..., description="Total number of results found")
    returned_results: int = Field(..., description="Number of results returned")
    results: List[RegulationResult] = Field(
        default_factory=list,
        description="List of regulation results"
    )
    search_metadata: dict = Field(
        default_factory=dict,
        description="Search metadata (e.g., processing time, model used)"
    )
    searched_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of search"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "query": "customer data protection requirements",
                "total_results": 15,
                "returned_results": 5,
                "results": [],
                "search_metadata": {
                    "processing_time_ms": 234,
                    "cache_hit": False
                },
                "searched_at": "2024-02-15T10:30:00Z"
            }
        }

# ============================================================================
# Health Check Models
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Health check timestamp"
    )

# ============================================================================
# Error Models
# ============================================================================

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")
    details: Optional[dict] = Field(None, description="Additional error details")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Error timestamp"
    )
