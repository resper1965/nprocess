"""
Gemini service for Vertex AI.

Provides access to Gemini models for various AI tasks:
- Gemini Pro: Complex reasoning (BPMN, Compliance)
- Gemini Flash: Quick tasks (formatting, chat)
"""

import logging
from functools import lru_cache

from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, GenerationConfig

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Service for interacting with Vertex AI Gemini models.
    
    Implements FinOps routing - uses appropriate model based on task complexity.
    """
    
    # Model names
    MODEL_PRO = "gemini-1.5-pro"
    MODEL_FLASH = "gemini-1.5-flash"
    
    def __init__(self):
        """Initialize the Gemini service."""
        self._pro_model: GenerativeModel | None = None
        self._flash_model: GenerativeModel | None = None
        self._initialized = False
    
    def _ensure_initialized(self) -> None:
        """Ensure Vertex AI is initialized."""
        if not self._initialized:
            aiplatform.init(
                project=settings.gcp_project_id,
                location=settings.gcp_region,
            )
            self._pro_model = GenerativeModel(self.MODEL_PRO)
            self._flash_model = GenerativeModel(self.MODEL_FLASH)
            self._initialized = True
            logger.info("Initialized Vertex AI Gemini models")
    
    async def generate_pro(
        self,
        prompt: str,
        system_instruction: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 8192,
    ) -> str:
        """
        Generate content using Gemini Pro (complex reasoning).
        
        Use for: BPMN generation, compliance analysis, complex tasks.
        
        Args:
            prompt: The user prompt
            system_instruction: Optional system instruction
            temperature: Creativity (0.0-1.0)
            max_tokens: Maximum response tokens
            
        Returns:
            Generated text response
        """
        self._ensure_initialized()
        
        config = GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        
        model = self._pro_model
        if system_instruction:
            model = GenerativeModel(
                self.MODEL_PRO,
                system_instruction=system_instruction,
            )
        
        try:
            response = model.generate_content(prompt, generation_config=config)
            result = response.text
            logger.debug(f"Gemini Pro generated {len(result)} chars")
            return result
        except Exception as e:
            logger.error(f"Gemini Pro generation failed: {e}")
            raise
    
    async def generate_flash(
        self,
        prompt: str,
        system_instruction: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> str:
        """
        Generate content using Gemini Flash (quick tasks).
        
        Use for: Formatting, chat, simple Q&A.
        FinOps: Much cheaper than Pro.
        
        Args:
            prompt: The user prompt
            system_instruction: Optional system instruction
            temperature: Creativity (0.0-1.0)
            max_tokens: Maximum response tokens
            
        Returns:
            Generated text response
        """
        self._ensure_initialized()
        
        config = GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        
        model = self._flash_model
        if system_instruction:
            model = GenerativeModel(
                self.MODEL_FLASH,
                system_instruction=system_instruction,
            )
        
        try:
            response = model.generate_content(prompt, generation_config=config)
            result = response.text
            logger.debug(f"Gemini Flash generated {len(result)} chars")
            return result
        except Exception as e:
            logger.error(f"Gemini Flash generation failed: {e}")
            raise


@lru_cache
def get_gemini_service() -> GeminiService:
    """Get cached Gemini service instance."""
    return GeminiService()
