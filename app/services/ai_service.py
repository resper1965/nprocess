"""
Serviço de IA usando Vertex AI (Gemini) com Model Routing para otimizar custos e latência.
Usa gemini-1.5-pro para tarefas complexas e gemini-1.5-flash para tarefas rápidas.
"""
import json
import logging
import os
from enum import Enum
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
# Task Types for Model Routing
# ============================================================================

class TaskType(str, Enum):
    """Tipos de tarefa para roteamento de modelos."""
    COMPLEX_REASONING = "complex_reasoning"  # Análise de compliance, raciocínio complexo
    FAST_GENERATION = "fast_generation"      # Chats simples, resumos, formatação, geração rápida


# ============================================================================
# Model Configuration
# ============================================================================

# Modelos disponíveis
MODEL_PRO = "gemini-1.5-pro-latest"      # Para tarefas complexas
MODEL_FLASH = "gemini-1.5-flash-latest"  # Para tarefas rápidas

# Configurações de geração por tipo de tarefa
GENERATION_CONFIG_PRO = GenerationConfig(
    temperature=0.2,  # Baixa temperatura para respostas determinísticas
    top_p=0.95,
    top_k=40,
    max_output_tokens=8192,
)

GENERATION_CONFIG_FLASH = GenerationConfig(
    temperature=0.3,  # Temperatura levemente menor para garantir obediência a formatos JSON
    top_p=0.95,
    top_k=40,
    max_output_tokens=8192,
)


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
# AI Factory - Model Routing
# ============================================================================

class AIFactory:
    """Factory para criar modelos Gemini baseado no tipo de tarefa."""
    
    @staticmethod
    def get_model(
        task_type: TaskType,
        system_instruction: Optional[str] = None,
        custom_config: Optional[GenerationConfig] = None
    ) -> GenerativeModel:
        """
        Retorna o modelo apropriado baseado no tipo de tarefa.
        
        Args:
            task_type: Tipo de tarefa (COMPLEX_REASONING ou FAST_GENERATION).
            system_instruction: Instrução de sistema (opcional).
            custom_config: Configuração customizada (opcional).
        
        Returns:
            GenerativeModel configurado.
        """
        # Escolhe o modelo baseado no tipo de tarefa
        if task_type == TaskType.COMPLEX_REASONING:
            model_name = MODEL_PRO
            generation_config = custom_config or GENERATION_CONFIG_PRO
            logger.debug(f"Usando {model_name} para {task_type.value}")
        else:  # FAST_GENERATION
            model_name = MODEL_FLASH
            generation_config = custom_config or GENERATION_CONFIG_FLASH
            logger.debug(f"Usando {model_name} para {task_type.value}")
        
        # Configurações de segurança (permissivo para contexto empresarial)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        }
        
        # Cria o modelo
        model_kwargs = {
            "model_name": model_name,
            "generation_config": generation_config,
            "safety_settings": safety_settings
        }
        
        if system_instruction:
            model_kwargs["system_instruction"] = [system_instruction]
        
        return GenerativeModel(**model_kwargs)


# ============================================================================
# AI Service Class
# ============================================================================

class AIService:
    """Serviço para interação com Vertex AI Gemini com Model Routing."""

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
        context: Optional[str] = None,
        task_type: TaskType = TaskType.FAST_GENERATION
    ) -> DiagramGenerateResponse:
        """
        Gera diagrama BPMN a partir de descrição textual.

        Args:
            description: Descrição do processo de negócio.
            context: Contexto adicional (opcional).
            task_type: Tipo de tarefa. Por padrão usa FAST_GENERATION (Flash).
                      Use COMPLEX_REASONING (Pro) para processos muito complexos.

        Returns:
            DiagramGenerateResponse com texto normalizado e código Mermaid.
        """
        try:
            # Monta o prompt do usuário
            user_prompt = f"Descrição do Processo:\n{description}"
            if context:
                user_prompt += f"\n\nContexto Adicional:\n{context}"

            # Cria o modelo usando AIFactory com roteamento baseado em task_type
            model = AIFactory.get_model(
                task_type=task_type,
                system_instruction=PROCESS_ANALYST_SYSTEM_PROMPT
            )

            logger.info(f"Gerando diagrama com {model._model_name} (task_type={task_type.value})...")
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
        additional_context: Optional[str] = None,
        task_type: TaskType = TaskType.COMPLEX_REASONING
    ) -> Tuple[float, str, List[ComplianceGap], List[ComplianceSuggestion]]:
        """
        Analisa compliance do processo contra regulamentações.
        SEMPRE usa COMPLEX_REASONING (gemini-1.5-pro) para análise de compliance.

        Args:
            process_data: Dados completos do processo (incluindo mermaid_code, nodes, etc.)
            retrieved_regulations: Lista de regulamentos recuperados via RAG.
            domain: Domínio regulatório.
            additional_context: Contexto adicional (opcional).
            task_type: Tipo de tarefa. Por padrão COMPLEX_REASONING (não recomendado alterar).

        Returns:
            Tuple com (overall_score, summary, gaps, suggestions).
        """
        try:
            # Força COMPLEX_REASONING para análise de compliance
            if task_type != TaskType.COMPLEX_REASONING:
                logger.warning(f"analyze_compliance sempre usa COMPLEX_REASONING. Ignorando task_type={task_type}")
                task_type = TaskType.COMPLEX_REASONING

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

            # Cria o modelo usando AIFactory com COMPLEX_REASONING
            model = AIFactory.get_model(
                task_type=task_type,
                system_instruction=COMPLIANCE_AUDITOR_SYSTEM_PROMPT
            )

            logger.info(f"Analisando compliance para domínio: {domain} usando {model._model_name}")
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

    async def generate_rag_answer(
        self,
        query: str,
        context: str,
        task_type: TaskType = TaskType.FAST_GENERATION
    ) -> str:
        """
        Generates a RAG answer based on retrieved context.
        Strictly grounds the answer in the provided context.
        Usa FAST_GENERATION (Flash) por padrão para respostas rápidas.

        Args:
            query: Pergunta do usuário.
            context: Contexto recuperado via RAG.
            task_type: Tipo de tarefa. Por padrão FAST_GENERATION (Flash).
        """
        system_prompt = """You are a Compliance Assistant.
        Answer the user's question STRICTLY based on the provided Context.
        If the answer is not in the context, say "I cannot answer based on the available information."
        Do not hallucinate outside of the context.
        """
        
        user_prompt = f"""Context:
        {context}
        
        Question: 
        {query}
        """
        
        try:
            model = AIFactory.get_model(
                task_type=task_type,
                system_instruction=system_prompt
            )
            
            logger.debug(f"Gerando resposta RAG com {model._model_name} (task_type={task_type.value})")
            response = model.generate_content(user_prompt)
            return response.text
        except Exception as e:
            logger.error(f"RAG Generation failed: {e}")
            return "Error generating answer."

    async def generate_document(
        self,
        doc_type: str,
        context: str,
        task_type: TaskType = TaskType.FAST_GENERATION
    ) -> Dict:
        """
        Generates a structured document (Title + Sections).
        Usa FAST_GENERATION (Flash) por padrão.

        Args:
            doc_type: Tipo de documento.
            context: Contexto para geração.
            task_type: Tipo de tarefa. Por padrão FAST_GENERATION (Flash).
        """
        system_prompt = """You are a Legal & Compliance Document Expert.
        Generate a structured JSON document based on the request.
        
        Output Format:
        {
            "title": "Document Title",
            "sections": [
                {
                    "heading": "1. Introduction",
                    "content": "Full content of the section..."
                },
                ...
            ]
        }
        Do not include Markdown. Return only JSON.
        """
        
        user_prompt = f"Type: {doc_type}\nContext: {context}"
        
        try:
            model = AIFactory.get_model(
                task_type=task_type,
                system_instruction=system_prompt
            )
            
            logger.debug(f"Gerando documento com {model._model_name} (task_type={task_type.value})")
            response = model.generate_content(user_prompt)
            
            # Clean JSON
            text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
            
        except Exception as e:
            logger.error(f"Document Generation failed: {e}")
            raise ValueError("Failed to generate document")

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
