"""
Chat with Gemini Router
Administrative operations via conversational interface with Gemini AI
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import logging
from datetime import datetime
import uuid
import json

from app.schemas import ChatRequest, ChatResponse, ChatHistory, ChatMessage
from app.services.gemini_chat import GeminiChatService
from app.middleware.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Gemini chat service
chat_service = GeminiChatService()

# In-memory session storage (use Redis in production)
chat_sessions: Dict[str, List[ChatMessage]] = {}


@router.post("/", response_model=ChatResponse)
async def chat_with_gemini(
    request: ChatRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Chat with Gemini AI for administrative operations

    Examples:
    - "Create a new API key for contracts-app with 10000 daily quota"
    - "Show me all users with admin role"
    - "What was our Vertex AI cost last month?"
    - "Generate an audit report for user user_123"
    - "Revoke all expired API keys"

    Gemini can:
    - Answer questions about system state
    - Execute administrative operations
    - Provide cost optimization recommendations
    - Generate reports
    - Query audit logs
    """
    try:
        # Get or create session
        session_id = request.session_id or str(uuid.uuid4())

        if session_id not in chat_sessions:
            chat_sessions[session_id] = []

        # Add user message to history
        user_message = ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.utcnow()
        )
        chat_sessions[session_id].append(user_message)

        # Get chat history
        history = chat_sessions[session_id]

        # Process message with Gemini
        logger.info(f"Processing chat message from user {current_user['user_id']}: {request.message[:100]}...")

        response = await chat_service.process_message(
            message=request.message,
            context=request.context or {},
            history=history,
            user_id=current_user['user_id']
        )

        # Add assistant response to history
        assistant_message = ChatMessage(
            role="assistant",
            content=response["message"],
            timestamp=datetime.utcnow()
        )
        chat_sessions[session_id].append(assistant_message)

        return ChatResponse(
            message=response["message"],
            actions_performed=response.get("actions_performed"),
            suggestions=response.get("suggestions"),
            session_id=session_id,
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        logger.error(f"Error in chat: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}", response_model=ChatHistory)
async def get_chat_history(
    session_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get chat history for a session"""
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = chat_sessions[session_id]

    return ChatHistory(
        session_id=session_id,
        messages=messages,
        started_at=messages[0].timestamp if messages else datetime.utcnow(),
        last_message_at=messages[-1].timestamp if messages else datetime.utcnow()
    )


@router.delete("/history/{session_id}")
async def clear_chat_history(
    session_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Clear chat history for a session"""
    if session_id in chat_sessions:
        del chat_sessions[session_id]

    return {"success": True, "message": f"Chat history cleared for session {session_id}"}


@router.get("/sessions")
async def list_chat_sessions(
    current_user: Dict = Depends(get_current_user)
):
    """List all active chat sessions"""
    sessions = []

    for session_id, messages in chat_sessions.items():
        if messages:
            sessions.append({
                "session_id": session_id,
                "message_count": len(messages),
                "started_at": messages[0].timestamp.isoformat(),
                "last_message_at": messages[-1].timestamp.isoformat()
            })

    return {"sessions": sessions}


@router.post("/test")
async def test_gemini_connection():
    """Test Gemini API connection"""
    try:
        test_response = await chat_service.test_connection()
        return {
            "success": True,
            "message": "Gemini API connection successful",
            "model": test_response.get("model"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Gemini connection test failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to Gemini: {str(e)}"
        )
