"""
MCP (Model Context Protocol) API endpoints.

Provides SSE-based MCP server for tool-augmented LLM integration.
Compatible with Cursor, Claude Desktop, and other MCP clients.
"""

import json
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.core.deps import get_current_user
from app.schemas.auth import CurrentUser
from app.services.mcp.server import get_mcp_server

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp", tags=["MCP Server"])


@router.get("/tools")
async def list_tools(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    List available MCP tools.
    
    Returns tool definitions for MCP client discovery.
    """
    mcp = get_mcp_server()
    return {"tools": mcp.get_tools_list()}


@router.post("/tools/{tool_name}")
async def call_tool(
    tool_name: str,
    request: Request,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> dict:
    """
    Execute an MCP tool.
    
    Args:
        tool_name: Name of the tool to execute
        request: Tool arguments in request body
        
    Returns:
        Tool execution result
    """
    body = await request.json()
    arguments = body.get("arguments", {})
    
    mcp = get_mcp_server()
    result = await mcp.call_tool(
        name=tool_name,
        arguments=arguments,
        tenant_id=current_user.org_id or "system"
    )
    
    return result


@router.get("/sse")
async def mcp_sse(
    request: Request,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> StreamingResponse:
    """
    SSE endpoint for MCP protocol.
    
    Provides Server-Sent Events stream for real-time tool communication.
    """
    async def event_generator():
        mcp = get_mcp_server()
        
        # Send initial connection message
        yield f"event: connected\ndata: {json.dumps({'session_id': mcp.session_id})}\n\n"
        
        # Send tools list
        tools = mcp.get_tools_list()
        yield f"event: tools\ndata: {json.dumps({'tools': tools})}\n\n"
        
        # Keep connection alive
        # In real implementation, would handle incoming tool calls here
        try:
            while True:
                # Heartbeat every 30 seconds
                import asyncio
                await asyncio.sleep(30)
                yield f"event: heartbeat\ndata: {json.dumps({'timestamp': str(__import__('datetime').datetime.utcnow())})}\n\n"
        except Exception as e:
            logger.info(f"SSE connection closed: {e}")
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


@router.get("/health")
async def mcp_health() -> dict:
    """MCP server health check."""
    mcp = get_mcp_server()
    return {
        "status": "ok",
        "session_id": mcp.session_id,
        "tools_count": len(mcp.tools)
    }
