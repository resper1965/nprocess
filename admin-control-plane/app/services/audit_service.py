
from typing import Dict, Any, List, Optional
import logging
import google.generativeai as genai
import os
import json

logger = logging.getLogger(__name__)

class AuditService:
    """
    Service for auditing processes against regulations/standards.
    Mocking RAG for now by injecting regulation knowledge via prompt.
    """
    
    def __init__(self):
        # Initialize Gemini
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash-latest")
        else:
            logger.warning("No API Key found for Gemini. AuditService will fail.")

    async def audit_text(self, process_content: str, regulation: str) -> Dict[str, Any]:
        """
        Audit a process content (Text or BPMN) against a regulation.
        """
        prompt = f"""
        ACT AS: A Senior Compliance Auditor and Legal Risk Expert.
        OBJECTIVE: Audit the provided business process against the specified REGULATION.
        
        REGULATION TO APPLY: "{regulation}"
        PROCESS TO AUDIT: "{process_content}"
        
        INSTRUCTIONS:
        1. Analyze the process steps for security, legal, or procedural risks.
        2. Cross-reference with standard clauses of {regulation} (e.g. if ISO27001, check Access Control, Logs, Segregation of Duties).
        3. Identify GAPS (High/Medium/Low Risk).
        4. Recommend potential controls.
        
        OUTPUT FORMAT: JSON ONLY.
        {{
            "summary": "The process violates...",
            "compliance_score": 75,
            "findings": [
                {{
                    "severity": "HIGH",
                    "step": "Approve Payment",
                    "violation": "Missing dual-control",
                    "recommendation": "Add a second approver"
                }}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
            
        except Exception as e:
            logger.error(f"Error auditing process: {str(e)}")
            return {
                "error": str(e),
                "summary": "Failed to complete audit.",
                "compliance_score": 0,
                "findings": []
            }
