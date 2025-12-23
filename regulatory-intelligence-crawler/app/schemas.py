"""
Pydantic schemas for Regulatory Intelligence Crawler
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class SourceType(str, Enum):
    """Regulatory source types"""
    ANEEL = "aneel"  # Agência Nacional de Energia Elétrica
    ONS = "ons"      # Operador Nacional do Sistema Elétrico
    ARCYBER = "arcyber"  # Framework de Cibersegurança Setor Elétrico


class ChangeType(str, Enum):
    """Type of regulatory change"""
    NEW_REGULATION = "new_regulation"
    AMENDMENT = "amendment"
    INTERPRETATION = "interpretation"
    GUIDANCE = "guidance"
    REVOCATION = "revocation"
    TECHNICAL_NOTE = "technical_note"


class ImpactLevel(str, Enum):
    """Impact level of regulatory change"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RegulatoryUpdate(BaseModel):
    """Regulatory update detected by crawler"""
    update_id: str
    source: SourceType
    authority: str
    title: str
    url: HttpUrl
    published_date: datetime
    detected_date: datetime
    change_type: ChangeType
    summary: str
    full_content: Optional[str] = None
    affected_regulations: List[str] = Field(default_factory=list)
    impact_level: ImpactLevel
    effective_date: Optional[datetime] = None
    required_actions: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    attachments: List[Dict[str, str]] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "update_id": "upd_aneel_2024_001",
                "source": "aneel",
                "authority": "ANEEL",
                "title": "Resolução Normativa nº 1.050/2024 - Cibersegurança em Distribuidoras",
                "url": "https://www.aneel.gov.br/resolucoes/2024/1050",
                "published_date": "2024-01-15T00:00:00Z",
                "detected_date": "2024-01-15T10:30:00Z",
                "change_type": "new_regulation",
                "summary": "Estabelece requisitos mínimos de cibersegurança...",
                "impact_level": "critical",
                "effective_date": "2024-07-01T00:00:00Z",
                "required_actions": [
                    "Implementar SGSI baseado em ISO 27001",
                    "Realizar avaliação de riscos cibernéticos",
                    "Reportar incidentes à ANEEL em até 24h"
                ]
            }
        }


class CrawlerStatus(BaseModel):
    """Status of a regulatory crawler"""
    source: SourceType
    status: str  # idle, running, error
    last_run: Optional[datetime] = None
    last_success: Optional[datetime] = None
    updates_found_last_run: int = 0
    total_updates_found: int = 0
    error_message: Optional[str] = None
    next_scheduled_run: Optional[datetime] = None


class CompanyContext(BaseModel):
    """Company context for impact analysis"""
    company_id: str
    company_name: str
    sector: str = "energia_eletrica"
    subsector: Optional[str] = None  # distribuicao, transmissao, geracao
    size: Optional[str] = None
    locations: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    existing_processes_count: int = 0


class AnalysisRequest(BaseModel):
    """Request for impact analysis"""
    company_context: CompanyContext
    existing_processes: Optional[List[str]] = Field(default_factory=list)


class ImpactAnalysis(BaseModel):
    """Impact analysis result"""
    update_id: str
    company_id: str
    impact_score: float = Field(ge=0, le=100)
    impact_level: ImpactLevel
    affected_processes: List[str] = Field(default_factory=list)
    affected_controls: List[str] = Field(default_factory=list)
    gaps_identified: List[str] = Field(default_factory=list)
    recommended_actions: List[Dict[str, Any]] = Field(default_factory=list)
    estimated_effort: str
    deadline: Optional[datetime] = None
    compliance_risk: str


class NotificationChannel(str, Enum):
    """Notification channels"""
    EMAIL = "email"
    SLACK = "slack"
    WEBHOOK = "webhook"
    DASHBOARD = "dashboard_alert"


class NotificationRequest(BaseModel):
    """Request to send notification"""
    update_id: str
    channels: List[NotificationChannel]
    recipients: List[str]
    priority: str = "normal"  # normal, high, urgent


class CrawlerConfig(BaseModel):
    """Configuration for a crawler source"""
    source_id: str
    source_type: SourceType
    url: HttpUrl
    check_frequency: str  # cron expression or interval
    enabled: bool = True
    selectors: Dict[str, str] = Field(default_factory=dict)
    custom_headers: Dict[str, str] = Field(default_factory=dict)


class ANEELResolution(BaseModel):
    """ANEEL Resolution metadata"""
    resolution_number: str
    resolution_type: str  # normativa, homologatoria, autorizativa
    year: int
    subject: str
    publication_dou: Optional[datetime] = None  # Diário Oficial da União
    revokes: List[str] = Field(default_factory=list)
    modifies: List[str] = Field(default_factory=list)


class ONSProcedure(BaseModel):
    """ONS Network Procedure metadata"""
    procedure_code: str  # Ex: ONS-PO-BR-02
    title: str
    category: str  # operacao, planejamento, etc
    version: str
    effective_date: datetime
    previous_version: Optional[str] = None


class ARCyberRequirement(BaseModel):
    """ARCyber cybersecurity requirement"""
    requirement_id: str
    category: str  # governance, protection, detection, response, recovery
    level: str  # basic, intermediate, advanced
    iso27001_mapping: List[str] = Field(default_factory=list)
    nist_mapping: List[str] = Field(default_factory=list)
