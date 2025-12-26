"""
Serviço de modelagem de processos.
"""
import logging
from typing import Optional

from app.schemas import DiagramGenerateRequest, DiagramGenerateResponse
from app.services.ai_service import get_ai_service

logger = logging.getLogger(__name__)

class ModelingService:
    """Serviço para geração e manipulação de modelos de processo."""

    def __init__(self):
        self.ai_service = get_ai_service()

    async def generate_diagram(self, request: DiagramGenerateRequest) -> DiagramGenerateResponse:
        """
        Gera um diagrama BPMN a partir de descrição textual.
        """
        if not self.ai_service:
            raise ValueError("Serviço de IA não está disponível.")

        return await self.ai_service.generate_diagram(
            description=request.description,
            context=request.context
        )

_modeling_service_instance = None

def get_modeling_service() -> ModelingService:
    global _modeling_service_instance
    if _modeling_service_instance is None:
        _modeling_service_instance = ModelingService()
    return _modeling_service_instance
