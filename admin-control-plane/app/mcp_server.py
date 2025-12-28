
import asyncio
from typing import Any, Dict, List
import logging
from mcp.server.fastmcp import FastMCP
from app.services.gemini_chat import GeminiChatService
from app.services.process_service import ProcessService
from app.services.audit_service import AuditService
from app.services.document_service import DocumentService
import json

# Initialize FastMCP Server
mcp = FastMCP("n.process B4B")
logger = logging.getLogger(__name__)

# Service Instances
chat_service = GeminiChatService()
process_service = ProcessService()
audit_service = AuditService()
document_service = DocumentService()

@mcp.tool()
async def normalize_process_workflow(description: str) -> str:
    """
    Analyzes a raw text description of a business process and returns a standardized 
    BPMN 2.0 structure and Mermaid Diagram.
    
    Args:
        description: Unstructured text describing the process (e.g. "To buy a pen, I ask Bob...")
    
    Returns:
        JSON string containing 'mermaid_code', 'bpmn_xml', and 'summary'.
    """
    logger.info(f"MCP Tool called: normalize_process_workflow with input length {len(description)}")
    
    try:
        # Use the dedicated ProcessService logic
        result = await process_service.normalize_text(description)
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Error processing normalization: {str(e)}"

@mcp.tool()
async def audit_workflow_compliance(process_text: str, regulation: str = "General Best Practices") -> str:
    """
    Audits a process description against a specific regulation or standard.
    
    Args:
        process_text: The process description (Text or BPMN/Mermaid).
        regulation: The standard to check against (e.g. "ISO27001", "GDPR", "SOX").
    
    Returns:
        JSON string containing risk analysis, compliance score, and findings.
    """
    logger.info(f"MCP Tool called: audit_workflow_compliance for {regulation}")
    
    try:
        result = await audit_service.audit_text(process_text, regulation)
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Error execution audit: {str(e)}"

@mcp.tool()
async def suggest_compliance_documents(process_description: str, audit_findings: str = "") -> str:
    """
    Suggests a list of compliance documents (evidence) required for a given process.
    
    Args:
        process_description: Description of the process.
        audit_findings: Optional findings from a previous audit to refine suggestions.
        
    Returns:
        JSON string with list of missing documents and suggestions.
    """
    logger.info(f"MCP Tool called: suggest_compliance_documents")
    
    try:
        result = await document_service.analyze_gaps(process_description, audit_findings)
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Error analyzing documents: {str(e)}"

@mcp.tool()
async def generate_document_template(document_type: str, context: str) -> str:
    """
    Generates a markdown template for a specific compliance document.
    
    Args:
        document_type: Type of document (e.g. "Vendor Risk Assessment").
        context: Context of the process to pre-fill the template.
        
    Returns:
        Markdown string of the document.
    """
    logger.info(f"MCP Tool called: generate_document_template for {document_type}")
    
    try:
        return await document_service.generate_template(document_type, context)
    except Exception as e:
        return f"Error generating template: {str(e)}"



if __name__ == "__main__":
    # Entry point for running the MCP server directly
    mcp.run()
