
from typing import Dict, Any, List, Optional
import logging
import google.generativeai as genai
import os
import json

logger = logging.getLogger(__name__)

class DocumentService:
    """
    Service for intelligent document management: Gap Analysis and Template Generation.
    """
    
    def __init__(self):
        # Initialize Gemini
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash-latest")
        else:
            logger.warning("No API Key found for Gemini. DocumentService will fail.")

    async def analyze_gaps(self, process_context: str, audit_findings: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze what documents are missing based on the process type and audit results.
        """
        prompt = f"""
        ACT AS: A Document Control Specialist and Auditor.
        OBJECTIVE: Identify required documentation needed to support the validity and compliance of this process.
        
        PROCESS CONTEXT: "{process_context}"
        AUDIT FINDINGS (If any): "{audit_findings or 'None'}"
        
        INSTRUCTIONS:
        1. List standard evidences usually required for this type of process (e.g. Invoices, Contracts, Logs, Sign-offs).
        2. If Audit Findings mention missing controls, suggest documents to prove those controls.
        
        OUTPUT FORMAT: JSON ONLY.
        {{
            "missing_documents": [
                {{
                    "name": "Vendor Risk Assessment Form",
                    "type": "Form",
                    "reason": "Required by ISO27001 for new vendor onboarding"
                }}
            ],
            "existing_documents_suggestions": ["Invoice"]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            return {"error": str(e)}

    async def generate_template(self, doc_type: str, context: str) -> str:
        """
        Generate a pre-filled markdown template for a specific document type.
        """
        prompt = f"""
        ACT AS: Expert Technical Writer.
        TASK: Create a professional document template.
        DOCUMENT TYPE: "{doc_type}"
        CONTEXT TO FILL: "{context}"
        
        INSTRUCTIONS:
        1. Create a clean Markdown document.
        2. Pre-fill sections based on the context (e.g. if process is 'HR Hiring', pre-fill 'Department: HR').
        3. Leave placeholders [LIKE THIS] for unknown data.
        
        OUTPUT: Just the Markdown content.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"# Error generating document\n\n{str(e)}"
