"""
MCP Server Implementation.

Model Context Protocol server exposing n.process tools via SSE.
Compatible with Cursor, Claude Desktop, and other MCP clients.

Based on the MCP specification for tool-augmented LLM systems.
"""

import json
import logging
import uuid
from datetime import datetime
from typing import AsyncGenerator, Callable, Any

from app.services.ai.embedding import get_embedding_service
from app.services.ai.gemini import get_gemini_service
from app.services.knowledge.service import get_knowledge_service
from app.services.process.bpmn import BPMNService
from app.services.compliance.audit import ComplianceAuditService
from app.services.documents.generator import DocumentGeneratorService

logger = logging.getLogger(__name__)


class MCPServer:
    """
    Model Context Protocol server for n.process.
    
    Exposes the following tools:
    - search_knowledge_base: Semantic search in knowledge base
    - generate_bpmn: Generate BPMN 2.0 from text
    - audit_compliance: Legal compliance audit
    - generate_document: Generate professional documents
    """
    
    def __init__(self):
        """Initialize MCP server with tool registry."""
        self.tools = self._register_tools()
        self.session_id = str(uuid.uuid4())
        
    def _register_tools(self) -> dict:
        """Register available tools with their schemas."""
        return {
            "search_knowledge_base": {
                "name": "search_knowledge_base",
                "description": "Busca semântica na base de conhecimento do n.process. "
                              "Use para encontrar informações sobre leis, processos, ou documentos.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Texto da consulta para busca semântica"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Número máximo de resultados (default: 5)",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                },
                "handler": self._handle_search
            },
            "generate_bpmn": {
                "name": "generate_bpmn",
                "description": "Gera um diagrama BPMN 2.0 a partir de uma descrição textual. "
                              "Retorna XML BPMN válido que pode ser renderizado.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string",
                            "description": "Descrição do processo a ser modelado"
                        },
                        "context": {
                            "type": "string",
                            "description": "Contexto adicional (opcional)"
                        }
                    },
                    "required": ["description"]
                },
                "handler": self._handle_generate_bpmn
            },
            "audit_compliance": {
                "name": "audit_compliance",
                "description": "Audita um texto/processo contra frameworks legais (LGPD, SOX, etc). "
                              "Retorna score de compliance e findings detalhados.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "string",
                            "description": "Conteúdo a ser auditado"
                        },
                        "frameworks": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Frameworks a verificar (ex: ['LGPD', 'SOX'])"
                        }
                    },
                    "required": ["content"]
                },
                "handler": self._handle_audit_compliance
            },
            "generate_document": {
                "name": "generate_document",
                "description": "Gera um documento profissional (manual, política, relatório, etc).",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Título do documento"
                        },
                        "content_description": {
                            "type": "string",
                            "description": "Descrição do conteúdo desejado"
                        },
                        "doc_type": {
                            "type": "string",
                            "enum": ["manual", "policy", "report", "procedure", "contract", "generic"],
                            "description": "Tipo de documento"
                        }
                    },
                    "required": ["title", "content_description"]
                },
                "handler": self._handle_generate_document
            }
        }
    
    def get_tools_list(self) -> list[dict]:
        """Get list of available tools for MCP discovery."""
        return [
            {
                "name": tool["name"],
                "description": tool["description"],
                "inputSchema": tool["inputSchema"]
            }
            for tool in self.tools.values()
        ]
    
    async def call_tool(self, name: str, arguments: dict, tenant_id: str = "system") -> dict:
        """
        Execute a tool call.
        
        Args:
            name: Tool name
            arguments: Tool arguments
            tenant_id: Tenant ID for access control
            
        Returns:
            Tool result as dict
        """
        if name not in self.tools:
            return {
                "isError": True,
                "content": [{"type": "text", "text": f"Tool not found: {name}"}]
            }
        
        tool = self.tools[name]
        handler = tool["handler"]
        
        try:
            result = await handler(arguments, tenant_id)
            return {
                "content": [{"type": "text", "text": json.dumps(result, ensure_ascii=False)}]
            }
        except Exception as e:
            logger.error(f"Tool {name} error: {e}")
            return {
                "isError": True,
                "content": [{"type": "text", "text": str(e)}]
            }
    
    async def _handle_search(self, args: dict, tenant_id: str) -> dict:
        """Handle search_knowledge_base tool call."""
        query = args.get("query", "")
        limit = args.get("limit", 5)
        
        embedding_service = get_embedding_service()
        knowledge_service = get_knowledge_service()
        
        # Get embedding
        embedding = await embedding_service.embed(query)
        
        # Search
        results = await knowledge_service.search(
            query_embedding=embedding,
            tenant_id=tenant_id,
            limit=limit,
            filter_type="all"
        )
        
        return {
            "query": query,
            "results": results,
            "count": len(results)
        }
    
    async def _handle_generate_bpmn(self, args: dict, tenant_id: str) -> dict:
        """Handle generate_bpmn tool call."""
        description = args.get("description", "")
        context = args.get("context")
        
        bpmn_service = BPMNService()
        result = await bpmn_service.generate(
            description=description,
            context=context,
            tenant_id=tenant_id
        )
        
        return result
    
    async def _handle_audit_compliance(self, args: dict, tenant_id: str) -> dict:
        """Handle audit_compliance tool call."""
        content = args.get("content", "")
        frameworks = args.get("frameworks")
        
        audit_service = ComplianceAuditService()
        result = await audit_service.audit(
            content=content,
            frameworks=frameworks,
            tenant_id=tenant_id
        )
        
        return result
    
    async def _handle_generate_document(self, args: dict, tenant_id: str) -> dict:
        """Handle generate_document tool call."""
        title = args.get("title", "")
        content_description = args.get("content_description", "")
        doc_type = args.get("doc_type", "generic")
        
        doc_service = DocumentGeneratorService()
        result = await doc_service.generate(
            title=title,
            content_description=content_description,
            doc_type=doc_type,
            tenant_id=tenant_id
        )
        
        return result


# Singleton instance
_mcp_server: MCPServer | None = None


def get_mcp_server() -> MCPServer:
    """Get or create MCP server instance."""
    global _mcp_server
    if _mcp_server is None:
        _mcp_server = MCPServer()
    return _mcp_server
