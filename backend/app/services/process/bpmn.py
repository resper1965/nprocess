"""
BPMN generation service.

Generates BPMN 2.0 diagrams from text descriptions using Gemini Pro.
"""

import logging
import re
import uuid
from datetime import datetime

from app.services.ai.gemini import get_gemini_service

logger = logging.getLogger(__name__)

# System instruction for BPMN generation
BPMN_SYSTEM_INSTRUCTION = """Você é um especialista em modelagem de processos BPMN 2.0.

Sua tarefa é gerar diagramas BPMN 2.0 válidos em formato XML a partir de descrições textuais.

Regras:
1. Sempre gere XML BPMN 2.0 válido e bem formado
2. Use o namespace correto: xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
3. Inclua sempre: startEvent, endEvent, e pelo menos um task ou gateway
4. Use IDs únicos para todos os elementos
5. Conecte todos os elementos com sequenceFlow
6. Retorne APENAS o XML, sem explicações

Exemplo de estrutura básica:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" id="definitions">
  <process id="process_1" isExecutable="true">
    <startEvent id="start"/>
    <task id="task_1" name="Tarefa"/>
    <endEvent id="end"/>
    <sequenceFlow id="flow_1" sourceRef="start" targetRef="task_1"/>
    <sequenceFlow id="flow_2" sourceRef="task_1" targetRef="end"/>
  </process>
</definitions>
```"""


class BPMNService:
    """
    Service for generating BPMN 2.0 diagrams.
    
    Uses Gemini Pro for complex reasoning about process structure.
    """
    
    def __init__(self):
        """Initialize BPMN service."""
        self.gemini = get_gemini_service()
    
    async def generate(
        self,
        description: str,
        context: str | None = None,
        tenant_id: str | None = None,
    ) -> dict:
        """
        Generate BPMN 2.0 XML from text description.
        
        Args:
            description: Natural language description of the process
            context: Optional additional context
            tenant_id: Tenant ID for logging/tracking
            
        Returns:
            Dict with process_id, bpmn_xml, and metadata
        """
        process_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        logger.info(f"Generating BPMN for process {process_id}")
        
        # Build prompt
        prompt = f"""Gere um diagrama BPMN 2.0 para o seguinte processo:

DESCRIÇÃO DO PROCESSO:
{description}
"""
        
        if context:
            prompt += f"""
CONTEXTO ADICIONAL:
{context}
"""
        
        prompt += """
Retorne APENAS o XML BPMN 2.0 completo e válido, sem explicações ou markdown."""
        
        try:
            # Generate using Gemini Pro (complex reasoning)
            response = await self.gemini.generate_pro(
                prompt=prompt,
                system_instruction=BPMN_SYSTEM_INSTRUCTION,
                temperature=0.3,  # Lower for structured output
                max_tokens=4096,
            )
            
            # Extract XML from response (remove markdown if present)
            bpmn_xml = self._extract_xml(response)
            
            # Validate basic structure
            if not self._validate_bpmn(bpmn_xml):
                logger.warning(f"Generated BPMN may be invalid for process {process_id}")
            
            result = {
                "process_id": process_id,
                "bpmn_xml": bpmn_xml,
                "description": description,
                "tenant_id": tenant_id,
                "created_at": created_at.isoformat(),
                "model": "gemini-1.5-pro",
            }
            
            logger.info(f"Successfully generated BPMN for process {process_id}")
            return result
            
        except Exception as e:
            logger.error(f"BPMN generation failed for process {process_id}: {e}")
            raise
    
    def _extract_xml(self, response: str) -> str:
        """Extract XML from response, removing markdown if present."""
        # Remove markdown code blocks
        response = re.sub(r"```xml\s*", "", response)
        response = re.sub(r"```\s*", "", response)
        
        # Find XML content
        xml_match = re.search(
            r"(<\?xml.*?</definitions>)",
            response,
            re.DOTALL | re.IGNORECASE
        )
        
        if xml_match:
            return xml_match.group(1).strip()
        
        # Try without XML declaration
        def_match = re.search(
            r"(<definitions.*?</definitions>)",
            response,
            re.DOTALL | re.IGNORECASE
        )
        
        if def_match:
            return f'<?xml version="1.0" encoding="UTF-8"?>\n{def_match.group(1).strip()}'
        
        # Return cleaned response as fallback
        return response.strip()
    
    def _validate_bpmn(self, xml: str) -> bool:
        """Basic validation of BPMN structure."""
        required_elements = [
            "definitions",
            "process",
            "startEvent",
            "endEvent",
        ]
        
        for element in required_elements:
            if element not in xml:
                logger.warning(f"Missing required BPMN element: {element}")
                return False
        
        return True
