"""
Serviço de auditoria e compliance.
"""
import logging
import json
from datetime import datetime
from typing import List, Dict, Optional, Tuple

from app.schemas import (
    ComplianceAnalyzeRequest,
    ComplianceAnalyzeResponse,
    ComplianceGap,
    ComplianceSuggestion,
    ProcessDefinition
)
from app.services.ai_service import get_ai_service
from app.services.db_service import get_db_service
from app.services.search_service import get_search_service

logger = logging.getLogger(__name__)

class ComplianceService:
    """Serviço para análise de conformidade de processos."""

    def __init__(self):
        self.ai_service = get_ai_service()
        self.db_service = get_db_service()
        self.search_service = get_search_service()

    async def analyze_compliance(self, request: ComplianceAnalyzeRequest) -> ComplianceAnalyzeResponse:
        """
        Realiza a análise de compliance de um processo.
        """
        if not self.ai_service:
            raise ValueError("Serviço de IA não está disponível.")

        # 1. Recuperar regulamentos (Grounding)
        # Usa o SearchService (Vertex AI) se disponível, ou fallback para mock se configurado
        retrieved_regulations = []
        if self.search_service:
            # Query baseada na descrição do processo e metadados
            query = f"Regulamentos de {request.domain} aplicáveis a: {request.process.description[:200]}"
            retrieved_regulations = await self.search_service.search_regulations(
                query=query, 
                domain=request.domain
            )
            logger.info(f"Recuperados {len(retrieved_regulations)} regulamentos via Vertex AI Search")
        
        # Fallback para Mock se nada retornar (para testes/dev sem GCP configurado)
        if not retrieved_regulations:
            retrieved_regulations = self._retrieve_regulations(request.domain)
            logger.info("Usando regulamentos mockados (fallback)")

        # 2. Preparar dados do processo para o prompt
        # Convertemos o objeto ProcessDefinition para dict para passar ao AI Service
        process_data = request.process.model_dump()

        # 2.1. Preparar contexto adicional incluindo SOA se fornecido
        context = request.additional_context or ""
        if request.soa:
            soa_context = "\n\n**Statement of Applicability (SOA):**\n"
            if request.soa.get("applicable_controls"):
                soa_context += f"- Controles aplicáveis: {', '.join(request.soa['applicable_controls'])}\n"
            if request.soa.get("excluded_controls"):
                soa_context += f"- Controles excluídos: {', '.join(request.soa['excluded_controls'])}\n"
            if request.soa.get("justification"):
                soa_context += f"- Justificativa: {request.soa['justification']}\n"
            soa_context += "\n**IMPORTANTE:** Analise APENAS os controles aplicáveis listados no SOA. Ignore completamente os controles excluídos."
            context += soa_context

        # 3. Executar análise com IA
        overall_score, summary, gaps, suggestions = await self.ai_service.analyze_compliance(
            process_data=process_data,
            retrieved_regulations=retrieved_regulations,
            domain=request.domain,
            additional_context=context
        )

        # 4. Construir resposta
        response = ComplianceAnalyzeResponse(
            analysis_id="", # Será gerado pelo DB
            process_id=request.process_id,
            domain=request.domain,
            analyzed_at=datetime.utcnow(),
            overall_score=overall_score,
            gaps=gaps,
            suggestions=suggestions,
            summary=summary
        )

        # 5. Salvar Log de Auditoria (Stateless engine persiste apenas o resultado da análise)
        try:
            audit_data = response.model_dump()
            audit_data.pop("analysis_id", None)
            
            # Adiciona metadados do processo ao log para contexto futuro
            audit_data["process_snapshot"] = {
                "name": request.process.name,
                "description": request.process.description
            }
            
            analysis_id = await self.db_service.create_analysis(audit_data)
            response.analysis_id = analysis_id
            logger.info(f"Análise registrada com ID: {analysis_id}")
            
        except Exception as e:
            logger.error(f"Falha ao salvar log de auditoria: {e}")
            # Não falha a requisição se o log falhar, mas gera um ID temporário ou avisa
            response.analysis_id = "temp_error_saving_log"

        return response

    def _retrieve_regulations(self, domain: str) -> List[Dict]:
        """
        Mock para recuperação de regulamentos.
        """
        # Dados mock baseados no domínio
        mock_regulations = {
            "LGPD": [
                {
                    "title": "LGPD - Lei Geral de Proteção de Dados",
                    "article": "Art. 6º",
                    "content": "Princípios de finalidade, adequação e necessidade."
                },
                {
                    "title": "LGPD - Segurança",
                    "article": "Art. 46",
                    "content": "Medidas de segurança, técnicas e administrativas."
                }
            ],
            "SOX": [
                {
                    "title": "Sarbanes-Oxley Act",
                    "article": "Section 404",
                    "content": "Internal controls importance."
                }
            ],
            "PCI-DSS": [
                {
                    "title": "PCI DSS",
                    "article": "Req 3",
                    "content": "Protect stored cardholder data."
                }
            ]
        }
        return mock_regulations.get(domain.upper(), [])

_compliance_service_instance = None

def get_compliance_service() -> ComplianceService:
    global _compliance_service_instance
    if _compliance_service_instance is None:
        _compliance_service_instance = ComplianceService()
    return _compliance_service_instance
