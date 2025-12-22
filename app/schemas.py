"""
Schemas Pydantic para validação de dados do ComplianceEngine API.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, validator


# ============================================================================
# Diagram Generation Schemas
# ============================================================================

class DiagramGenerateRequest(BaseModel):
    """Request para geração de diagrama BPMN a partir de descrição textual."""

    description: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Descrição textual do processo de negócio"
    )
    context: Optional[str] = Field(
        None,
        max_length=5000,
        description="Contexto adicional sobre o processo (departamento, objetivo, etc.)"
    )

    @validator('description')
    def description_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Descrição não pode estar vazia')
        return v.strip()


class DiagramGenerateResponse(BaseModel):
    """Response com processo normalizado e diagrama Mermaid.js."""

    normalized_text: str = Field(
        ...,
        description="Descrição do processo normalizada e estruturada"
    )
    mermaid_code: str = Field(
        ...,
        description="Código Mermaid.js do diagrama BPMN"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Metadados adicionais do processamento"
    )


# ============================================================================
# Process Management Schemas
# ============================================================================

class ProcessNode(BaseModel):
    """Representa um nó do processo (atividade, gateway, evento)."""

    id: str = Field(..., description="Identificador único do nó")
    type: str = Field(..., description="Tipo do nó (task, gateway, event)")
    label: str = Field(..., description="Rótulo/descrição do nó")
    properties: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Propriedades específicas do nó"
    )


class ProcessFlow(BaseModel):
    """Representa uma conexão entre nós."""

    from_node: str = Field(..., description="ID do nó de origem")
    to_node: str = Field(..., description="ID do nó de destino")
    label: Optional[str] = Field(None, description="Rótulo da conexão")
    condition: Optional[str] = Field(None, description="Condição para o fluxo")


class ProcessCreateRequest(BaseModel):
    """Request para criar um novo processo validado."""

    name: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="Nome do processo"
    )
    description: str = Field(
        ...,
        min_length=10,
        description="Descrição detalhada do processo"
    )
    domain: str = Field(
        ...,
        description="Domínio/área do processo (financeiro, RH, vendas, etc.)"
    )
    mermaid_code: str = Field(
        ...,
        min_length=10,
        description="Código Mermaid.js do diagrama"
    )
    nodes: List[ProcessNode] = Field(
        default_factory=list,
        description="Lista de nós do processo"
    )
    flows: List[ProcessFlow] = Field(
        default_factory=list,
        description="Lista de fluxos entre nós"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Metadados adicionais"
    )


class ProcessCreateResponse(BaseModel):
    """Response após criação do processo."""

    process_id: str = Field(..., description="ID do processo criado")
    created_at: datetime = Field(..., description="Timestamp de criação")
    message: str = Field(default="Processo criado com sucesso")


# ============================================================================
# Compliance Analysis Schemas
# ============================================================================

class ComplianceAnalyzeRequest(BaseModel):
    """Request para análise de compliance de um processo."""

    process_id: str = Field(
        ...,
        min_length=1,
        description="ID do processo a ser analisado"
    )
    domain: str = Field(
        ...,
        min_length=1,
        description="Domínio regulatório (LGPD, SOX, GDPR, etc.)"
    )
    additional_context: Optional[str] = Field(
        None,
        max_length=2000,
        description="Contexto adicional para análise"
    )


class ComplianceGap(BaseModel):
    """Representa um gap de compliance identificado."""

    gap_id: str = Field(..., description="Identificador único do gap")
    severity: str = Field(
        ...,
        description="Severidade (critical, high, medium, low)"
    )
    regulation: str = Field(
        ...,
        description="Regulamento/lei relacionado"
    )
    article: Optional[str] = Field(
        None,
        description="Artigo ou seção específica"
    )
    description: str = Field(
        ...,
        description="Descrição do gap identificado"
    )
    affected_nodes: List[str] = Field(
        default_factory=list,
        description="IDs dos nós do processo afetados"
    )
    recommendation: str = Field(
        ...,
        description="Recomendação para corrigir o gap"
    )

    @validator('severity')
    def validate_severity(cls, v):
        allowed = ['critical', 'high', 'medium', 'low']
        if v.lower() not in allowed:
            raise ValueError(f'Severity deve ser um de: {allowed}')
        return v.lower()


class ComplianceSuggestion(BaseModel):
    """Sugestão de melhoria de compliance."""

    suggestion_id: str = Field(..., description="Identificador da sugestão")
    type: str = Field(
        ...,
        description="Tipo de sugestão (process_improvement, control_addition, etc.)"
    )
    title: str = Field(..., description="Título da sugestão")
    description: str = Field(..., description="Descrição detalhada")
    priority: str = Field(
        default="medium",
        description="Prioridade (high, medium, low)"
    )
    estimated_effort: Optional[str] = Field(
        None,
        description="Esforço estimado para implementação"
    )


class ComplianceAnalyzeResponse(BaseModel):
    """Response da análise de compliance."""

    analysis_id: str = Field(..., description="ID da análise realizada")
    process_id: str = Field(..., description="ID do processo analisado")
    domain: str = Field(..., description="Domínio analisado")
    analyzed_at: datetime = Field(..., description="Timestamp da análise")
    overall_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Score geral de compliance (0-100)"
    )
    gaps: List[ComplianceGap] = Field(
        default_factory=list,
        description="Lista de gaps identificados"
    )
    suggestions: List[ComplianceSuggestion] = Field(
        default_factory=list,
        description="Sugestões de melhoria"
    )
    summary: Optional[str] = Field(
        None,
        description="Resumo executivo da análise"
    )


# ============================================================================
# Generic Schemas
# ============================================================================

class HealthCheckResponse(BaseModel):
    """Response do health check."""

    status: str = Field(default="healthy")
    service: str = Field(default="ComplianceEngine")
    version: str = Field(default="1.0.0")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    """Response padrão de erro."""

    error: str = Field(..., description="Tipo de erro")
    message: str = Field(..., description="Mensagem de erro")
    details: Optional[Dict[str, Any]] = Field(
        None,
        description="Detalhes adicionais do erro"
    )
