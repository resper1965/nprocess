"""
Serviço de IA usando Vertex AI (Gemini 1.5 Pro) para análise e geração de processos.
"""
import json
import logging
import os
from typing import Dict, List, Optional, Tuple

import google.auth
import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    GenerationConfig,
    HarmCategory,
    HarmBlockThreshold
)

from app.schemas import (
    ComplianceGap,
    ComplianceSuggestion,
    DiagramGenerateResponse
)


logger = logging.getLogger(__name__)


# ============================================================================
# System Prompts
# ============================================================================

PROCESS_ANALYST_SYSTEM_PROMPT = """Você é um Analista de Processos de Negócio Sênior especializado em BPMN.

Suas responsabilidades:
1. Receber descrições textuais de processos de negócio (podem estar desorganizadas ou incompletas)
2. Normalizar e estruturar a descrição de forma clara e profissional
3. Gerar código Mermaid.js válido para diagrama BPMN

Diretrizes para normalização:
- Identifique claramente: início, atividades, decisões, eventos e fim
- Use linguagem clara e objetiva
- Organize as atividades em ordem lógica
- Identifique responsáveis (atores/lanes) quando mencionados
- Identifique pontos de decisão e condições

Diretrizes para código Mermaid.js:
- Use sintaxe BPMN: `graph TD` ou `flowchart TD`
- Use IDs significativos para nós (ex: `start`, `task1`, `decision1`, `end`)
- Para atividades: `task1[Atividade]`
- Para decisões: `decision1{Decisão?}`
- Para início/fim: `start([Início])` e `end([Fim])`
- Use setas com labels quando relevante: `task1 -->|condição| task2`
- Mantenha o diagrama legível e bem estruturado

Formato de resposta:
Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "normalized_text": "Descrição normalizada e estruturada do processo",
  "mermaid_code": "Código Mermaid.js completo",
  "metadata": {
    "actors": ["lista de atores identificados"],
    "activities_count": número_de_atividades,
    "decision_points": número_de_decisões
  }
}

Não inclua markdown, explicações adicionais ou texto fora do JSON.
"""


COMPLIANCE_AUDITOR_SYSTEM_PROMPT = """Você é um Auditor de Compliance especializado em regulamentações empresariais.

Suas responsabilidades:
1. Analisar processos de negócio mapeados em BPMN
2. Identificar gaps de conformidade baseado em regulamentos fornecidos
3. Fornecer recomendações práticas e acionáveis

Critérios de análise:
- Severidade dos gaps: critical (violação grave), high (risco alto), medium (risco moderado), low (melhoria recomendada)
- Verifique controles internos, segregação de funções, registros de auditoria
- Identifique pontos onde dados sensíveis são processados sem proteção adequada
- Verifique se há aprovações necessárias que estão faltando
- Analise se há documentação e rastreabilidade adequadas

Estrutura da resposta:
Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "overall_score": 0-100 (score de compliance, onde 100 é totalmente conforme),
  "summary": "Resumo executivo da análise em 2-3 parágrafos",
  "gaps": [
    {
      "gap_id": "GAP001",
      "severity": "critical|high|medium|low",
      "regulation": "Nome da regulamentação",
      "article": "Artigo ou seção específica (opcional)",
      "description": "Descrição clara do gap",
      "affected_nodes": ["id_do_nó1", "id_do_nó2"],
      "recommendation": "Recomendação específica e acionável"
    }
  ],
  "suggestions": [
    {
      "suggestion_id": "SUG001",
      "type": "process_improvement|control_addition|documentation|training",
      "title": "Título da sugestão",
      "description": "Descrição detalhada",
      "priority": "high|medium|low",
      "estimated_effort": "Estimativa de esforço (opcional)"
    }
  ]
}

Não inclua markdown, explicações adicionais ou texto fora do JSON.
Seja rigoroso mas construtivo nas recomendações.
"""


# ============================================================================
# AI Service Class
# ============================================================================

class AIService:
    """Serviço para interação com Vertex AI Gemini."""

    def __init__(self, project_id: Optional[str] = None, location: str = "us-central1"):
        """
        Inicializa o serviço de IA.

        Args:
            project_id: ID do projeto GCP. Se None, usa ADC.
            location: Região do Vertex AI.
        """
        self.project_id = project_id or self._get_project_id()
        self.location = location

        # Inicializa Vertex AI
        vertexai.init(project=self.project_id, location=self.location)

        # Configurações de geração
        self.generation_config = GenerationConfig(
            temperature=0.2,  # Baixa temperatura para respostas mais determinísticas
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
        )

        # Configurações de segurança (permissivo para contexto empresarial)
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        }

        logger.info(f"AIService inicializado: project={self.project_id}, location={self.location}")

    def _get_project_id(self) -> str:
        """Obtém o Project ID usando Application Default Credentials."""
        try:
            _, project_id = google.auth.default()
            if not project_id:
                # Fallback para variável de ambiente
                project_id = os.getenv("GCP_PROJECT_ID", os.getenv("GOOGLE_CLOUD_PROJECT"))
            if not project_id:
                raise ValueError("Project ID não encontrado. Configure GOOGLE_CLOUD_PROJECT ou use ADC.")
            return project_id
        except Exception as e:
            logger.error(f"Erro ao obter project_id: {e}")
            raise

    async def generate_diagram(
        self,
        description: str,
        context: Optional[str] = None
    ) -> DiagramGenerateResponse:
        """
        Gera diagrama BPMN a partir de descrição textual.

        Args:
            description: Descrição do processo de negócio.
            context: Contexto adicional (opcional).

        Returns:
            DiagramGenerateResponse com texto normalizado e código Mermaid.
        """
        try:
            # Monta o prompt do usuário
            user_prompt = f"Descrição do Processo:\n{description}"
            if context:
                user_prompt += f"\n\nContexto Adicional:\n{context}"

            # Cria o modelo com system instruction
            model = GenerativeModel(
                model_name="gemini-1.5-pro",
                system_instruction=[PROCESS_ANALYST_SYSTEM_PROMPT],
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )

            logger.info("Gerando diagrama com Gemini...")
            response = model.generate_content(user_prompt)

            # Parse da resposta JSON
            response_text = response.text.strip()
            # Remove markdown se existir
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()

            result = json.loads(response_text)

            return DiagramGenerateResponse(
                normalized_text=result["normalized_text"],
                mermaid_code=result["mermaid_code"],
                metadata=result.get("metadata", {})
            )

        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON da resposta: {e}")
            logger.error(f"Resposta recebida: {response.text}")
            raise ValueError(f"Resposta do modelo não está em formato JSON válido: {e}")
        except Exception as e:
            logger.error(f"Erro ao gerar diagrama: {e}")
            raise

    async def analyze_compliance(
        self,
        process_data: Dict,
        retrieved_regulations: List[Dict],
        domain: str,
        additional_context: Optional[str] = None
    ) -> Tuple[float, str, List[ComplianceGap], List[ComplianceSuggestion]]:
        """
        Analisa compliance do processo contra regulamentações.

        Args:
            process_data: Dados completos do processo (incluindo mermaid_code, nodes, etc.)
            retrieved_regulations: Lista de regulamentos recuperados via RAG.
            domain: Domínio regulatório.
            additional_context: Contexto adicional (opcional).

        Returns:
            Tuple com (overall_score, summary, gaps, suggestions).
        """
        try:
            # Monta o contexto do processo
            process_context = f"""
PROCESSO A SER ANALISADO:
Nome: {process_data.get('name', 'N/A')}
Descrição: {process_data.get('description', 'N/A')}
Domínio: {domain}

Código Mermaid (BPMN):
{process_data.get('mermaid_code', 'N/A')}

Nós do Processo:
{json.dumps(process_data.get('nodes', []), indent=2, ensure_ascii=False)}

Fluxos:
{json.dumps(process_data.get('flows', []), indent=2, ensure_ascii=False)}
"""

            # Monta o contexto das regulamentações
            regulations_context = f"\nREGULAMENTOS APLICÁVEIS (Domínio: {domain}):\n"
            for reg in retrieved_regulations:
                regulations_context += f"\n---\n"
                regulations_context += f"Regulamento: {reg.get('title', 'N/A')}\n"
                regulations_context += f"Artigo/Seção: {reg.get('article', 'N/A')}\n"
                regulations_context += f"Conteúdo: {reg.get('content', 'N/A')}\n"

            # Prompt do usuário
            user_prompt = process_context + regulations_context
            if additional_context:
                user_prompt += f"\n\nCONTEXTO ADICIONAL:\n{additional_context}"

            # Cria o modelo com system instruction
            model = GenerativeModel(
                model_name="gemini-1.5-pro",
                system_instruction=[COMPLIANCE_AUDITOR_SYSTEM_PROMPT],
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )

            logger.info(f"Analisando compliance para domínio: {domain}")
            response = model.generate_content(user_prompt)

            # Parse da resposta JSON
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()

            result = json.loads(response_text)

            # Converte gaps para objetos Pydantic
            gaps = [ComplianceGap(**gap) for gap in result.get("gaps", [])]

            # Converte suggestions para objetos Pydantic
            suggestions = [
                ComplianceSuggestion(**sug) for sug in result.get("suggestions", [])
            ]

            return (
                result.get("overall_score", 0),
                result.get("summary", ""),
                gaps,
                suggestions
            )

        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON da análise: {e}")
            logger.error(f"Resposta recebida: {response.text}")
            raise ValueError(f"Resposta do modelo não está em formato JSON válido: {e}")
        except Exception as e:
            logger.error(f"Erro ao analisar compliance: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_ai_service_instance: Optional[AIService] = None
_ai_service_enabled: Optional[bool] = None


def is_ai_enabled() -> bool:
    """Verifica se IA está habilitada via variável de ambiente."""
    global _ai_service_enabled
    if _ai_service_enabled is None:
        # Por padrão, IA está habilitada. Desabilite com ENABLE_AI=false
        ai_enabled = os.getenv("ENABLE_AI", "true").lower() in ("true", "1", "yes")
        _ai_service_enabled = ai_enabled
        logger.info(f"IA {'habilitada' if ai_enabled else 'desabilitada'} via ENABLE_AI={os.getenv('ENABLE_AI', 'true')}")
    return _ai_service_enabled


def get_ai_service() -> Optional[AIService]:
    """
    Retorna instância singleton do AIService.
    
    Returns:
        AIService se IA estiver habilitada, None caso contrário.
    """
    global _ai_service_instance
    
    if not is_ai_enabled():
        return None
    
    if _ai_service_instance is None:
        try:
            _ai_service_instance = AIService()
        except Exception as e:
            logger.warning(f"Falha ao inicializar AIService: {e}. IA não estará disponível.")
            return None
    
    return _ai_service_instance
