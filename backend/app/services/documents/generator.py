"""
Document generation service.

Generates structured documents (PDFs, manuals, reports) using AI.
"""

import logging
import uuid
from datetime import datetime
from io import BytesIO

from app.services.ai.gemini import get_gemini_service

logger = logging.getLogger(__name__)

# System instruction for document generation
DOCUMENT_SYSTEM_INSTRUCTION = """Você é um especialista em documentação técnica e legal.

Sua tarefa é gerar documentos estruturados e profissionais.

Regras:
1. Use linguagem clara e objetiva
2. Mantenha formatação consistente
3. Inclua seções numeradas quando apropriado
4. Cite fontes quando disponíveis
5. Use listas e tabelas para organizar informações

Formatos de saída:
- Markdown para documentos simples
- HTML estruturado para documentos complexos

Sempre inclua:
- Título do documento
- Data de geração
- Seções claras e organizadas"""


class DocumentGeneratorService:
    """
    Service for generating professional documents.
    
    Uses Gemini for content generation and supports multiple output formats.
    """
    
    # Supported document types
    DOCUMENT_TYPES = {
        "manual": "Manual de Procedimentos",
        "policy": "Política Corporativa",
        "report": "Relatório Técnico",
        "procedure": "Procedimento Operacional Padrão (POP)",
        "contract": "Minuta de Contrato",
        "generic": "Documento",
    }
    
    def __init__(self):
        """Initialize document generator."""
        self.gemini = get_gemini_service()
    
    async def generate(
        self,
        title: str,
        content_description: str,
        doc_type: str = "generic",
        format: str = "markdown",
        context: str | None = None,
        tenant_id: str | None = None,
    ) -> dict:
        """
        Generate a document from description.
        
        Args:
            title: Document title
            content_description: What the document should contain
            doc_type: Type of document (manual, policy, report, etc.)
            format: Output format (markdown, html)
            context: Additional context
            tenant_id: Tenant ID for tracking
            
        Returns:
            Dict with document_id, content, and metadata
        """
        doc_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        doc_type_name = self.DOCUMENT_TYPES.get(doc_type, "Documento")
        
        logger.info(f"Generating {doc_type_name} document {doc_id}")
        
        # Build prompt
        prompt = self._build_prompt(
            title=title,
            description=content_description,
            doc_type=doc_type_name,
            format=format,
            context=context,
        )
        
        try:
            # Use Gemini Flash for document generation (cost effective)
            response = await self.gemini.generate_flash(
                prompt=prompt,
                system_instruction=DOCUMENT_SYSTEM_INSTRUCTION,
                temperature=0.4,
                max_tokens=8192,
            )
            
            result = {
                "document_id": doc_id,
                "title": title,
                "content": response,
                "doc_type": doc_type,
                "format": format,
                "tenant_id": tenant_id,
                "created_at": created_at.isoformat(),
                "model": "gemini-1.5-flash",
            }
            
            logger.info(f"Generated document {doc_id}: {len(response)} chars")
            return result
            
        except Exception as e:
            logger.error(f"Document generation failed for {doc_id}: {e}")
            raise
    
    def _build_prompt(
        self,
        title: str,
        description: str,
        doc_type: str,
        format: str,
        context: str | None,
    ) -> str:
        """Build the document generation prompt."""
        today = datetime.utcnow().strftime("%d/%m/%Y")
        
        prompt = f"""Gere um documento do tipo "{doc_type}" com as seguintes especificações:

## TÍTULO
{title}

## DESCRIÇÃO DO CONTEÚDO
{description}

## DATA
{today}

## FORMATO DE SAÍDA
{format.upper()}
"""
        
        if context:
            prompt += f"""
## CONTEXTO ADICIONAL
{context}
"""
        
        prompt += f"""
## INSTRUÇÕES
1. Gere um documento profissional e completo
2. Use formatação {format} correta
3. Inclua todas as seções necessárias para este tipo de documento
4. Seja claro e objetivo
5. Se for markdown, use headers, listas e citações apropriadamente
"""
        
        return prompt
    
    async def generate_from_template(
        self,
        template_id: str,
        variables: dict,
        tenant_id: str | None = None,
    ) -> dict:
        """
        Generate document from a pre-defined template.
        
        Args:
            template_id: ID of the template to use
            variables: Variables to fill in the template
            tenant_id: Tenant ID
            
        Returns:
            Generated document
        """
        # TODO: Implement template system with Firestore
        raise NotImplementedError("Template-based generation not yet implemented")
