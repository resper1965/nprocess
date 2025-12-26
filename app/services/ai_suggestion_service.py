"""
AI improvement suggestion service for n.process.
"""
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import asyncio

from app.schemas_ai_suggestions import (
    ProcessImprovementRequest,
    ProcessImprovementResponse,
    ImprovementSuggestion,
    BulkImprovementRequest,
    BulkImprovementResponse,
)
from app.services.db_service import get_db_service
from app.services.ai_service import get_ai_service


logger = logging.getLogger(__name__)


# ============================================================================
# AI Suggestion Service
# ============================================================================

class AISuggestionService:
    """Service for AI-powered improvement suggestions."""
    
    def __init__(self):
        """Initialize AI suggestion service."""
        logger.info("AISuggestionService initialized")
    
    async def _call_ai_for_text(self, ai_service, prompt: str) -> str:
        """Call AI service to generate text."""
        try:
            # Use Vertex AI directly
            import vertexai
            from vertexai.generative_models import GenerativeModel, GenerationConfig
            
            model = GenerativeModel("gemini-1.5-pro")
            config = GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048,
            )
            
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: model.generate_content(prompt, generation_config=config)
            )
            return response.text
            
        except Exception as e:
            logger.error(f"Error calling AI for text: {e}")
            raise
    
    async def analyze_process_improvements(
        self,
        request: ProcessImprovementRequest
    ) -> ProcessImprovementResponse:
        """
        Analyze a process and generate AI improvement suggestions.
        
        Args:
            request: Improvement request
            
        Returns:
            ProcessImprovementResponse
        """
        try:
            db_service = get_db_service()
            ai_service = get_ai_service()
            
            if not ai_service:
                raise ValueError("AI service not available. Enable ENABLE_AI=true")
            
            # Get process data
            process_data = await db_service.get_process(request.process_id)
            if not process_data:
                raise ValueError(f"Process not found: {request.process_id}")
            
            # Get latest compliance analyses
            analyses = await db_service.list_analyses_by_process(request.process_id, limit=5)
            
            # Build context for AI
            context = {
                "process": process_data,
                "analyses": analyses,
                "focus_areas": request.focus_areas or ["compliance", "efficiency"],
            }
            
            # Generate suggestions using AI
            suggestions = await self._generate_suggestions(ai_service, context)
            
            # Calculate overall score
            overall_score = sum(s.impact_score for s in suggestions) / len(suggestions) if suggestions else 0.0
            
            # Generate summary
            summary = await self._generate_summary(ai_service, process_data, suggestions)
            
            return ProcessImprovementResponse(
                process_id=request.process_id,
                suggestions=suggestions,
                overall_score=overall_score,
                generated_at=datetime.utcnow(),
                analysis_summary=summary,
            )
            
        except Exception as e:
            logger.error(f"Error analyzing process improvements: {e}")
            raise
    
    async def _generate_suggestions(
        self,
        ai_service,
        context: Dict[str, Any]
    ) -> List[ImprovementSuggestion]:
        """Generate improvement suggestions using AI."""
        process = context["process"]
        analyses = context["analyses"]
        focus_areas = context.get("focus_areas", [])
        
        # Build prompt
        prompt = f"""Analyze the following business process and generate improvement suggestions.

Process Name: {process.get('name', 'Unknown')}
Process Description: {process.get('description', '')}
Domain: {process.get('domain', '')}

Focus Areas: {', '.join(focus_areas)}

Recent Compliance Analyses:
"""
        for analysis in analyses[:3]:
            score = analysis.get('overall_score', 0)
            gaps = analysis.get('gaps', [])
            prompt += f"- Score: {score}%, Gaps: {len(gaps)}\n"
        
        prompt += """
Generate 3-5 improvement suggestions with:
- Type (process_optimization, compliance_enhancement, risk_reduction, efficiency_gain)
- Title
- Description
- Priority (high, medium, low)
- Impact score (0-10)
- Effort estimate (low, medium, high)
- Confidence (0-1)

Return JSON array of suggestions.
"""
        
        try:
            # Use AI service to generate suggestions
            # Create a simple text generation method call
            response_text = await self._call_ai_for_text(ai_service, prompt)
            
            # Parse response (assuming JSON format)
            import json
            import re
            
            # Extract JSON from response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                suggestions_data = json.loads(json_match.group())
            else:
                # Fallback: try to parse entire response
                suggestions_data = json.loads(response_text)
            
            suggestions = []
            for idx, sug_data in enumerate(suggestions_data[:5]):  # Limit to 5
                suggestion = ImprovementSuggestion(
                    suggestion_id=f"SUG_{idx+1:03d}",
                    type=sug_data.get("type", "process_optimization"),
                    title=sug_data.get("title", "Improvement"),
                    description=sug_data.get("description", ""),
                    priority=sug_data.get("priority", "medium"),
                    impact_score=float(sug_data.get("impact_score", 5.0)),
                    effort_estimate=sug_data.get("effort_estimate", "medium"),
                    affected_nodes=sug_data.get("affected_nodes", []),
                    related_gaps=sug_data.get("related_gaps", []),
                    confidence=float(sug_data.get("confidence", 0.7)),
                )
                suggestions.append(suggestion)
            
            return suggestions
            
        except Exception as e:
            logger.warning(f"Error generating AI suggestions: {e}. Using fallback.")
            # Fallback suggestions
            return [
                ImprovementSuggestion(
                    suggestion_id="SUG_001",
                    type="compliance_enhancement",
                    title="Add compliance checkpoints",
                    description="Consider adding explicit compliance checkpoints in the process flow",
                    priority="high",
                    impact_score=7.5,
                    effort_estimate="medium",
                    affected_nodes=[],
                    related_gaps=[],
                    confidence=0.6,
                )
            ]
    
    async def _generate_summary(
        self,
        ai_service,
        process_data: Dict[str, Any],
        suggestions: List[ImprovementSuggestion]
    ) -> str:
        """Generate analysis summary using AI."""
        try:
            prompt = f"""Summarize the improvement analysis for process: {process_data.get('name', 'Unknown')}

Found {len(suggestions)} improvement suggestions.
High priority: {sum(1 for s in suggestions if s.priority == 'high')}
Average impact score: {sum(s.impact_score for s in suggestions) / len(suggestions) if suggestions else 0:.1f}

Generate a 2-3 sentence summary.
"""
            
            summary = await self._call_ai_for_text(ai_service, prompt)
            return summary.strip()
            
        except Exception as e:
            logger.warning(f"Error generating summary: {e}")
            return f"Analysis completed with {len(suggestions)} improvement suggestions identified."
    
    async def analyze_bulk_improvements(
        self,
        request: BulkImprovementRequest
    ) -> BulkImprovementResponse:
        """
        Analyze multiple processes for improvements.
        
        Args:
            request: Bulk improvement request
            
        Returns:
            BulkImprovementResponse
        """
        try:
            results = []
            
            for process_id in request.process_ids:
                try:
                    improvement_request = ProcessImprovementRequest(
                        process_id=process_id,
                        focus_areas=request.focus_areas,
                    )
                    
                    response = await self.analyze_process_improvements(improvement_request)
                    results.append(response)
                    
                except Exception as e:
                    logger.warning(f"Error analyzing process {process_id}: {e}")
                    continue
            
            return BulkImprovementResponse(
                results=results,
                total_analyzed=len(results),
                generated_at=datetime.utcnow(),
            )
            
        except Exception as e:
            logger.error(f"Error in bulk improvement analysis: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_ai_suggestion_service_instance: Optional[AISuggestionService] = None


def get_ai_suggestion_service() -> AISuggestionService:
    """Return singleton instance of AISuggestionService."""
    global _ai_suggestion_service_instance
    if _ai_suggestion_service_instance is None:
        _ai_suggestion_service_instance = AISuggestionService()
    return _ai_suggestion_service_instance

