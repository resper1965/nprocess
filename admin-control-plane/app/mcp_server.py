
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

# Service Instances (Lazy Loaded)
_chat_service = None
_process_service = None
_audit_service = None
_document_service = None

def get_process_service():
    global _process_service
    if not _process_service:
        _process_service = ProcessService()
    return _process_service

def get_audit_service():
    global _audit_service
    if not _audit_service:
        _audit_service = AuditService()
    return _audit_service

def get_document_service():
    global _document_service
    if not _document_service:
        _document_service = DocumentService()
    return _document_service

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
        result = await get_process_service().normalize_text(description)
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
        result = await get_audit_service().audit_text(process_text, regulation)
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
        result = await get_document_service().analyze_gaps(process_description, audit_findings)
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
        return await get_document_service().generate_template(document_type, context)
    except Exception as e:
        return f"Error generating template: {str(e)}"


# ============================================
# Knowledge Base Tools (RAG)
# ============================================

_search_service = None

def get_search_service():
    global _search_service
    if not _search_service:
        from app.services.search_service import SearchService
        _search_service = SearchService()
    return _search_service


@mcp.tool()
async def search_knowledge_base(query: str, top_k: int = 5, domain: str = "") -> str:
    """
    Gemini RAG - Retrieval Phase: Semantic search in knowledge bases.
    
    Uses Vertex AI Search with Google embeddings (Gemini-based) for semantic similarity.
    Returns relevant document chunks ranked by relevance score.
    
    Args:
        query: The search query (e.g. "prazo retenção dados LGPD").
        top_k: Number of results to return (default: 5).
        domain: Optional filter by domain (e.g. "lgpd", "gdpr", "aneel").
        
    Returns:
        JSON string with search results containing content, source, and relevance score.
        These results can be used as context for Gemini generation (RAG completion).
    """
    logger.info(f"MCP Tool called: search_knowledge_base for '{query}' (top_k={top_k})")
    
    try:
        service = get_search_service()
        results = await service.search(query, top_k=top_k, domain=domain or None)
        
        return json.dumps({
            "query": query,
            "results": [
                {
                    "content": r.get("content", ""),
                    "source": r.get("source", ""),
                    "score": r.get("score", 0),
                    "metadata": r.get("metadata", {})
                }
                for r in results
            ]
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error in search_knowledge_base: {e}")
        return json.dumps({"error": str(e), "results": []})


@mcp.tool()
async def chat_with_knowledge(message: str, session_id: str = "") -> str:
    """
    Gemini RAG - Complete Pipeline: Chat with knowledge base context.
    
    Full RAG implementation:
    1. Retrieval: Searches knowledge base using semantic search (Vertex AI Search)
    2. Augmentation: Retrieves relevant document chunks as context
    3. Generation: Gemini 1.5 Pro/Flash generates response using retrieved context
    
    Args:
        message: The user's question or request.
        session_id: Optional session ID to maintain conversation context.
        
    Returns:
        JSON string with Gemini's response, sources used, and any actions performed.
    """
    logger.info(f"MCP Tool called: chat_with_knowledge for '{message[:50]}...'")
    
    try:
        global _chat_service
        if not _chat_service:
            _chat_service = GeminiChatService()
        
        response = await _chat_service.chat(message, session_id or None)
        
        return json.dumps({
            "message": response.get("message", ""),
            "session_id": response.get("session_id", ""),
            "sources": response.get("sources", []),
            "actions_performed": response.get("actions_performed", [])
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error in chat_with_knowledge: {e}")
        return json.dumps({"error": str(e), "message": ""})


@mcp.tool()
async def list_available_regulations() -> str:
    """
    Lists all regulations and frameworks available in the knowledge base.
    
    Returns:
        JSON string with list of available domains/regulations.
    """
    logger.info("MCP Tool called: list_available_regulations")
    
    try:
        service = get_search_service()
        domains = await service.list_domains()
        
        return json.dumps({
            "regulations": domains,
            "count": len(domains)
        }, indent=2)
    except Exception as e:
        return json.dumps({
            "regulations": ["lgpd", "gdpr", "sox", "iso27001", "aneel"],
            "count": 5,
            "note": "Default list returned due to error"
        })


if __name__ == "__main__":
    # Entry point for running the MCP server directly
    mcp.run()

