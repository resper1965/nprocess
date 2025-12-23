"""
Gemini Analyzer Service
Uses Vertex AI Gemini to analyze regulatory updates
"""

import logging
import json
from typing import List, Dict, Any, Optional

try:
    import google.generativeai as genai
    from vertexai.generative_models import GenerativeModel, GenerationConfig
except ImportError:
    genai = None
    GenerativeModel = None
    GenerationConfig = None

from app.schemas import RegulatoryUpdate, ImpactAnalysis, ImpactLevel, CompanyContext

logger = logging.getLogger(__name__)


class GeminiAnalyzer:
    """
    Analyzes regulatory updates using Gemini 1.5 Pro

    Capabilities:
    - Determine if update is truly regulatory
    - Assess impact level
    - Extract affected regulations
    - Identify required actions
    - Analyze company-specific impact
    """

    def __init__(self):
        if not GenerativeModel:
            logger.warning("Vertex AI SDK not available - analyzer will be limited")
            self.model = None
            return

        try:
            self.model = GenerativeModel(
                "gemini-1.5-pro",
                generation_config=GenerationConfig(
                    temperature=0.1,  # Low temperature for factual analysis
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=8192,
                )
            )
            logger.info("Gemini Analyzer initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Gemini: {str(e)}")
            self.model = None

    async def quick_analyze(self, update: RegulatoryUpdate) -> Dict[str, Any]:
        """
        Quick analysis of regulatory update

        Args:
            update: Regulatory update to analyze

        Returns:
            Analysis result with impact_level, summary, etc.
        """
        if not self.model:
            # Fallback to simple heuristics
            return self._heuristic_analysis(update)

        prompt = f"""
Analise a seguinte atualização regulatória do setor elétrico brasileiro e determine:

1. **É uma mudança regulatória oficial?** (sim/não)
2. **Tipo de mudança**: nova regulação, emenda, interpretação, orientação, revogação
3. **Nível de impacto**: critical, high, medium, low
4. **Regulações afetadas**: lista de regulações/normas afetadas
5. **Resumo executivo**: 2-3 parágrafos explicando a mudança
6. **Ações requeridas**: lista de ações que empresas devem tomar
7. **Prazo de vigência**: data de vigência se mencionada
8. **Categorias ARCyber**: identificar, proteger, detectar, responder, recuperar

**Atualização:**
Fonte: {update.source.value.upper()}
Título: {update.title}
URL: {update.url}
Data de Publicação: {update.published_date}

Conteúdo: {update.full_content[:3000] if update.full_content else update.summary}

**Responda em JSON estruturado:**
{{
  "is_regulatory_change": true/false,
  "change_type": "new_regulation|amendment|interpretation|guidance|revocation",
  "impact_level": "critical|high|medium|low",
  "affected_regulations": ["REG-001", "REG-002"],
  "executive_summary": "...",
  "required_actions": ["Action 1", "Action 2"],
  "effective_date": "YYYY-MM-DD" or null,
  "arcyber_categories": ["identificar", "proteger"],
  "justification": "Por que esse nível de impacto..."
}}
"""

        try:
            response = await self.model.generate_content_async(prompt)
            result = self._parse_json_response(response.text)

            return result

        except Exception as e:
            logger.error(f"Error in Gemini analysis: {str(e)}")
            return self._heuristic_analysis(update)

    async def analyze_impact(
        self,
        update: RegulatoryUpdate,
        company_context: CompanyContext,
        existing_processes: Optional[List[str]] = None
    ) -> ImpactAnalysis:
        """
        Analyze impact of regulatory update on specific company

        Args:
            update: Regulatory update
            company_context: Company-specific context
            existing_processes: List of existing process IDs

        Returns:
            Detailed impact analysis
        """
        if not self.model:
            return self._mock_impact_analysis(update, company_context)

        prompt = f"""
Você é um especialista em compliance regulatório do setor elétrico brasileiro.

Analise o impacto da seguinte atualização regulatória para a empresa descrita:

**EMPRESA:**
Nome: {company_context.company_name}
Setor: {company_context.sector}
Subsetor: {company_context.subsector or 'N/A'}
Tamanho: {company_context.size or 'N/A'}
Localizações: {', '.join(company_context.locations)}
Certificações Existentes: {', '.join(company_context.certifications)}
Processos Documentados: {company_context.existing_processes_count}

**ATUALIZAÇÃO REGULATÓRIA:**
Fonte: {update.source.value.upper()}
Título: {update.title}
Resumo: {update.summary}
Nível de Impacto Geral: {update.impact_level.value}
Ações Requeridas: {', '.join(update.required_actions)}

Forneça análise detalhada em JSON:
{{
  "impact_score": 0-100,
  "impact_level": "critical|high|medium|low",
  "affected_processes": ["proc_id_1", "proc_id_2"],
  "affected_controls": ["ISO27001:A.5.1", "NIST:PR.AC-1"],
  "gaps_identified": [
    "Gap 1: Falta implementar SGSI conforme ISO 27001",
    "Gap 2: ..."
  ],
  "recommended_actions": [
    {{
      "action": "Implementar SGSI",
      "priority": "critical|high|medium|low",
      "effort_hours": 160,
      "deadline": "2024-06-30"
    }}
  ],
  "estimated_effort": "2-3 meses",
  "compliance_risk": "Alto risco de não conformidade se não implementar SGSI até julho/2024",
  "budget_impact": "R$ 50.000 - R$ 100.000 (estimativa de consultoria + implementação)"
}}
"""

        try:
            response = await self.model.generate_content_async(prompt)
            result = self._parse_json_response(response.text)

            # Convert to ImpactAnalysis schema
            return ImpactAnalysis(
                update_id=update.update_id,
                company_id=company_context.company_id,
                impact_score=result.get("impact_score", 50),
                impact_level=ImpactLevel(result.get("impact_level", "medium")),
                affected_processes=result.get("affected_processes", []),
                affected_controls=result.get("affected_controls", []),
                gaps_identified=result.get("gaps_identified", []),
                recommended_actions=result.get("recommended_actions", []),
                estimated_effort=result.get("estimated_effort", "N/A"),
                deadline=None,  # Parse from result if needed
                compliance_risk=result.get("compliance_risk", "N/A")
            )

        except Exception as e:
            logger.error(f"Error in impact analysis: {str(e)}")
            return self._mock_impact_analysis(update, company_context)

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Parse JSON from Gemini response"""
        try:
            # Find JSON block
            start_idx = text.find('{')
            end_idx = text.rfind('}') + 1

            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")

            json_str = text[start_idx:end_idx]
            return json.loads(json_str)

        except Exception as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            return {}

    def _heuristic_analysis(self, update: RegulatoryUpdate) -> Dict[str, Any]:
        """Fallback heuristic analysis if Gemini unavailable"""
        # Simple keyword-based analysis
        title_lower = update.title.lower()
        content_lower = (update.full_content or update.summary).lower()

        # Assess impact
        if any(word in title_lower for word in ['obrigatório', 'deverá', 'multa', 'penalidade']):
            impact = "critical"
        elif any(word in title_lower for word in ['recomenda', 'orienta', 'sugere']):
            impact = "low"
        else:
            impact = "medium"

        return {
            "is_regulatory_change": True,
            "change_type": update.change_type.value,
            "impact_level": impact,
            "affected_regulations": [],
            "executive_summary": update.summary,
            "required_actions": update.required_actions,
            "effective_date": update.effective_date.isoformat() if update.effective_date else None,
            "arcyber_categories": [],
            "justification": "Análise heurística (Gemini indisponível)"
        }

    def _mock_impact_analysis(
        self,
        update: RegulatoryUpdate,
        company_context: CompanyContext
    ) -> ImpactAnalysis:
        """Mock impact analysis if Gemini unavailable"""
        return ImpactAnalysis(
            update_id=update.update_id,
            company_id=company_context.company_id,
            impact_score=70,
            impact_level=update.impact_level,
            affected_processes=[],
            affected_controls=[],
            gaps_identified=["Análise detalhada requer Vertex AI"],
            recommended_actions=[],
            estimated_effort="N/A",
            deadline=update.effective_date,
            compliance_risk="Análise detalhada indisponível"
        )
