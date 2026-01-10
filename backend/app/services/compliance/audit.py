"""
Compliance audit service.

Audits processes and documents against legal frameworks using RAG.
Combines Knowledge Store (legal context) with Gemini Pro (analysis).
"""

import logging
import uuid
from datetime import datetime

from app.services.ai.embedding import get_embedding_service
from app.services.ai.gemini import get_gemini_service
from app.services.knowledge.service import get_knowledge_service

logger = logging.getLogger(__name__)

# System instruction for compliance analysis
COMPLIANCE_SYSTEM_INSTRUCTION = """Você é um especialista em compliance e análise legal.

Sua tarefa é analisar documentos, processos ou textos contra legislações e normas.

Dado um texto para análise e trechos relevantes de leis/normas, você deve:
1. Identificar pontos de conformidade (o que está OK)
2. Identificar não-conformidades (gaps)
3. Classificar a severidade de cada gap (baixa, média, alta, crítica)
4. Fornecer recomendações de correção

Formato de resposta (JSON):
{
  "compliance_score": 0-100,
  "status": "compliant | partially_compliant | non_compliant",
  "findings": [
    {
      "type": "conformity | gap",
      "description": "...",
      "severity": "low | medium | high | critical",
      "reference": "Art. X da Lei Y",
      "recommendation": "..."
    }
  ],
  "summary": "Resumo executivo da análise"
}

Seja preciso e cite os artigos/parágrafos específicos das leis."""


class ComplianceAuditService:
    """
    Service for auditing compliance against legal frameworks.
    
    Uses RAG to find relevant legal context, then Gemini Pro for analysis.
    """
    
    def __init__(self):
        """Initialize compliance service."""
        self.gemini = get_gemini_service()
        self.embedding = get_embedding_service()
        self.knowledge = get_knowledge_service()
    
    async def audit(
        self,
        content: str,
        frameworks: list[str] | None = None,
        tenant_id: str | None = None,
    ) -> dict:
        """
        Audit content against compliance frameworks.
        
        Args:
            content: Text/process/document to audit
            frameworks: List of frameworks to check (e.g., ["LGPD", "SOX"])
            tenant_id: Tenant ID for accessing private knowledge
            
        Returns:
            Compliance audit result with score, findings, and recommendations
        """
        audit_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        logger.info(f"Starting compliance audit {audit_id}")
        
        # Step 1: Embed the content for RAG search
        content_embedding = await self.embedding.embed(content[:5000])  # Limit for embedding
        
        # Step 2: Search for relevant legal context
        legal_context = await self._get_legal_context(
            embedding=content_embedding,
            frameworks=frameworks,
            tenant_id=tenant_id,
        )
        
        # Step 3: Build prompt with RAG context
        prompt = self._build_audit_prompt(content, legal_context, frameworks)
        
        # Step 4: Analyze with Gemini Pro
        try:
            response = await self.gemini.generate_pro(
                prompt=prompt,
                system_instruction=COMPLIANCE_SYSTEM_INSTRUCTION,
                temperature=0.2,  # Low for consistent analysis
                max_tokens=4096,
            )
            
            # Parse response as JSON
            result = self._parse_response(response)
            
            result.update({
                "audit_id": audit_id,
                "tenant_id": tenant_id,
                "frameworks": frameworks or [],
                "created_at": created_at.isoformat(),
                "context_chunks_used": len(legal_context),
            })
            
            logger.info(f"Completed audit {audit_id}: score={result.get('compliance_score')}")
            return result
            
        except Exception as e:
            logger.error(f"Compliance audit {audit_id} failed: {e}")
            raise
    
    async def _get_legal_context(
        self,
        embedding: list[float],
        frameworks: list[str] | None,
        tenant_id: str | None,
    ) -> list[dict]:
        """Retrieve relevant legal context from Knowledge Store."""
        try:
            # Search marketplace (public laws) + private (tenant docs)
            results = await self.knowledge.search(
                query_embedding=embedding,
                tenant_id=tenant_id or "system",
                limit=10,
                filter_type="all",
            )
            
            # Filter by framework if specified
            if frameworks:
                filtered = []
                for r in results:
                    metadata = r.get("metadata", {})
                    law = metadata.get("law", "")
                    if any(fw.lower() in law.lower() for fw in frameworks):
                        filtered.append(r)
                return filtered or results  # Fallback to all if no matches
            
            return results
            
        except Exception as e:
            logger.warning(f"Failed to retrieve legal context: {e}")
            return []
    
    def _build_audit_prompt(
        self,
        content: str,
        legal_context: list[dict],
        frameworks: list[str] | None,
    ) -> str:
        """Build the audit prompt with RAG context."""
        frameworks_text = ", ".join(frameworks) if frameworks else "aplicáveis"
        
        prompt = f"""Analise o seguinte conteúdo quanto à conformidade com normas {frameworks_text}:

## CONTEÚDO PARA ANÁLISE:
{content[:5000]}
"""
        
        if legal_context:
            prompt += "\n## CONTEXTO LEGAL RELEVANTE:\n\n"
            for i, ctx in enumerate(legal_context, 1):
                metadata = ctx.get("metadata", {})
                law = metadata.get("law", "N/A")
                article = metadata.get("article", "")
                
                prompt += f"### Trecho {i} ({law} {f'Art. {article}' if article else ''}):\n"
                prompt += f"{ctx.get('content', '')}\n\n"
        
        prompt += """
## INSTRUÇÕES:
1. Analise o conteúdo contra as normas citadas
2. Identifique conformidades e não-conformidades
3. Classifique severidade de cada gap
4. Forneça recomendações específicas
5. Responda APENAS em formato JSON válido
"""
        
        return prompt
    
    def _parse_response(self, response: str) -> dict:
        """Parse Gemini response as JSON."""
        import json
        import re
        
        # Remove markdown code blocks if present
        response = re.sub(r"```json\s*", "", response)
        response = re.sub(r"```\s*", "", response)
        
        try:
            return json.loads(response.strip())
        except json.JSONDecodeError:
            # Fallback structure
            logger.warning("Failed to parse compliance response as JSON")
            return {
                "compliance_score": 0,
                "status": "error",
                "findings": [],
                "summary": response[:500],
                "parse_error": True,
            }
