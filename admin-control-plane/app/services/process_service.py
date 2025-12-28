
from typing import Dict, Any, Optional
import logging
import google.generativeai as genai
import os
import json

logger = logging.getLogger(__name__)

class ProcessService:
    """
    Service for normalizing unstructured process descriptions into standard BPMN/Mermaid formats.
    """
    
    def __init__(self):
        # Initialize Gemini
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash-latest")
        else:
            logger.warning("No API Key found for Gemini. ProcessService will fail.")

    async def normalize_text(self, text: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Normalize raw text into BPMN and Mermaid diagram.
        """
        prompt = f"""
        ACT AS: A Senior Business Process Analyst and BPMN 2.0 Expert.
        OBJECTIVE: Analyze the provided process description and convert it into a structured, normalized format.
        
        INPUT TEXT: "{text}"
        CONTEXT (Optional): "{context or 'None'}"
        
        INSTRUCTIONS:
        1. Identify the Actors (Lanes).
        2. Identify the Tasks (Nodes). Rewrite them in "Verb + Object" format (e.g., "Send Email" -> "Notify Stakeholder").
        3. Identify Gateways (Decisions).
        4. Generate a Mermaid Graph (graph TD) code block.
        5. Generate a simplified BPMN XML structure (just the logical flow).
        6. Provide a concise summary.
        
        OUTPUT FORMAT: JSON ONLY. Do not include markdown code blocks ```json ... ```. Just the raw JSON object.
        {{
            "summary": "Brief summary...",
            "mermaid_code": "graph TD\\n A[Start] --> B[Task]...",
            "bpmn_xml": "<definitions>...</definitions>",
            "steps": [
                {{"id": "step1", "description": "Notify Stakeholder", "actor": "Manager"}}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Safe parsing: remove markdown fence if present
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
            
        except Exception as e:
            logger.error(f"Error normalizing process: {str(e)}")
            return {
                "error": str(e),
                "summary": "Failed to normalize process.",
                "mermaid_code": "graph TD; A[Error] --> B[Check Logs];",
                "bpmn_xml": "",
                "steps": []
            }

    async def refine_diagram(self, original_mermaid: str, feedback: str) -> Dict[str, Any]:
        """
        Refine an existing diagram based on user feedback.
        """
        prompt = f"""
        ACT AS: A Senior Business Process Analyst.
        OBJECTIVE: Update the Mermaid Diagram based on user feedback.
        
        CURRENT DIAGRAM:
        {original_mermaid}
        
        USER FEEDBACK:
        "{feedback}"
        
        OUTPUT FORMAT: JSON ONLY.
        {{
            "mermaid_code": "graph TD\\n...",
            "explanation": "Made the following changes..."
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            return {"error": str(e)}
