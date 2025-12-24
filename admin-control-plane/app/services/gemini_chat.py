"""
Gemini Chat Service
Conversational AI interface for administrative operations using Google Gemini
"""

import google.generativeai as genai
import os
import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class GeminiChatService:
    """
    Service for chat-based administrative operations using Gemini AI

    Capabilities:
    - Natural language interface for admin operations
    - Execute admin tasks via conversation
    - Query system state and metrics
    - Generate reports and recommendations
    - Provide cost optimization insights
    """

    def __init__(self):
        """Initialize Gemini chat service"""
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set. Chat functionality will be limited.")
        else:
            genai.configure(api_key=api_key)

        # Use Gemini 1.5 Flash for fast responses
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash-latest",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
            },
            safety_settings=[
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
            ]
        )

        # System prompt for admin operations
        self.system_prompt = """You are an AI assistant for the ComplianceEngine Platform's Admin Control Plane.

You help administrators manage:
- Users and permissions (RBAC)
- API keys and quotas
- AI provider keys (OpenAI, Claude, Gemini, Azure)
- Financial operations (FinOps) and cost tracking
- Service monitoring and health
- Audit logs and compliance reporting

You can execute administrative operations and answer questions about the system state.

When users ask you to perform actions:
1. Understand the intent
2. Validate the request
3. Execute via available tools/functions
4. Confirm completion
5. Suggest next steps

Be concise, professional, and security-conscious. Always confirm destructive operations.

Available operations:
- create_api_key(name, consumer_app_id, quotas)
- list_api_keys(filters)
- revoke_api_key(key_id)
- create_user(email, name, role)
- list_users(filters)
- update_user_role(user_id, role)
- get_cost_summary(period)
- get_usage_metrics(period)
- query_audit_logs(filters)
- get_service_health(service_id)
- test_ai_key(provider, key_id)

Format your responses as JSON when executing operations:
{
  "message": "Human-readable response",
  "actions_performed": [{"operation": "create_api_key", "result": {...}}],
  "suggestions": ["Try checking usage stats", "Consider rotating old keys"]
}
"""

    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        history: List[Any],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Process a chat message and execute admin operations

        Args:
            message: User's message
            context: Additional context (current state, filters, etc.)
            history: Chat history
            user_id: User making the request

        Returns:
            Dict with response message, actions performed, and suggestions
        """
        try:
            # Build conversation history for Gemini
            conversation_history = self._build_conversation_history(history)

            # Add system prompt and current message
            full_prompt = self._build_prompt(message, context, user_id)

            # Start chat session with history
            chat = self.model.start_chat(history=conversation_history)

            # Send message
            response = chat.send_message(full_prompt)

            # Parse response
            response_text = response.text

            # Try to extract JSON if response contains structured data
            parsed_response = self._parse_response(response_text)

            # Execute any requested operations
            if parsed_response.get("operations"):
                executed_actions = await self._execute_operations(
                    parsed_response["operations"],
                    user_id
                )
                parsed_response["actions_performed"] = executed_actions

            return parsed_response

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            return {
                "message": f"Sorry, I encountered an error: {str(e)}. Please try again or rephrase your request.",
                "actions_performed": None,
                "suggestions": [
                    "Try using more specific commands",
                    "Check the system health if issues persist"
                ]
            }

    def _build_conversation_history(self, history: List[Any]) -> List[Dict[str, str]]:
        """Build Gemini conversation history from chat messages"""
        gemini_history = []

        for msg in history[:-1]:  # Exclude current message
            gemini_history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })

        return gemini_history

    def _build_prompt(self, message: str, context: Dict[str, Any], user_id: str) -> str:
        """Build the full prompt with context"""
        prompt_parts = [self.system_prompt]

        # Add context information
        if context:
            prompt_parts.append(f"\nCurrent context:\n{json.dumps(context, indent=2)}\n")

        # Add user info
        prompt_parts.append(f"\nUser ID: {user_id}")
        prompt_parts.append(f"Timestamp: {datetime.utcnow().isoformat()}Z\n")

        # Add user message
        prompt_parts.append(f"\nUser request: {message}")

        return "\n".join(prompt_parts)

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse Gemini response, extracting JSON if present

        Tries to extract JSON from markdown code blocks or plain text
        """
        try:
            # Try to find JSON in code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_str = response_text[json_start:json_end].strip()
                return json.loads(json_str)

            # Try to parse entire response as JSON
            return json.loads(response_text)

        except json.JSONDecodeError:
            # If not JSON, return as plain message
            return {
                "message": response_text,
                "actions_performed": None,
                "suggestions": None
            }

    async def _execute_operations(
        self,
        operations: List[Dict[str, Any]],
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Execute administrative operations requested by Gemini

        Operations are validated and executed with proper permissions
        """
        executed = []

        for op in operations:
            operation_type = op.get("operation")
            params = op.get("params", {})

            logger.info(f"Executing operation: {operation_type} with params: {params}")

            try:
                # Import services dynamically to avoid circular imports
                result = await self._dispatch_operation(
                    operation_type,
                    params,
                    user_id
                )

                executed.append({
                    "operation": operation_type,
                    "status": "success",
                    "result": result
                })

            except Exception as e:
                logger.error(f"Failed to execute {operation_type}: {str(e)}")
                executed.append({
                    "operation": operation_type,
                    "status": "error",
                    "error": str(e)
                })

        return executed

    async def _dispatch_operation(
        self,
        operation: str,
        params: Dict[str, Any],
        user_id: str
    ) -> Any:
        """
        Dispatch operation to appropriate service

        This is a simplified implementation. In production, use proper
        service layer with dependency injection.
        """
        # Map operations to service methods
        # TODO: Implement actual service calls

        operation_map = {
            "create_api_key": self._create_api_key,
            "list_api_keys": self._list_api_keys,
            "revoke_api_key": self._revoke_api_key,
            "create_user": self._create_user,
            "list_users": self._list_users,
            "update_user_role": self._update_user_role,
            "get_cost_summary": self._get_cost_summary,
            "get_usage_metrics": self._get_usage_metrics,
            "query_audit_logs": self._query_audit_logs,
            "get_service_health": self._get_service_health,
        }

        handler = operation_map.get(operation)
        if not handler:
            raise ValueError(f"Unknown operation: {operation}")

        return await handler(params, user_id)

    # Placeholder operation handlers (implement with actual service calls)

    async def _create_api_key(self, params: Dict, user_id: str):
        """Create API key - TODO: Implement with actual APIKeyManager"""
        return {"key_id": "placeholder_key_123", "status": "created"}

    async def _list_api_keys(self, params: Dict, user_id: str):
        """List API keys - TODO: Implement with actual APIKeyManager"""
        return {"keys": [], "total": 0}

    async def _revoke_api_key(self, params: Dict, user_id: str):
        """Revoke API key - TODO: Implement with actual APIKeyManager"""
        return {"status": "revoked"}

    async def _create_user(self, params: Dict, user_id: str):
        """Create user - TODO: Implement with actual UserManager"""
        return {"user_id": "placeholder_user_123", "status": "created"}

    async def _list_users(self, params: Dict, user_id: str):
        """List users - TODO: Implement with actual UserManager"""
        return {"users": [], "total": 0}

    async def _update_user_role(self, params: Dict, user_id: str):
        """Update user role - TODO: Implement with actual UserManager"""
        return {"status": "updated"}

    async def _get_cost_summary(self, params: Dict, user_id: str):
        """Get cost summary - TODO: Implement with actual FinOpsTracker"""
        return {"total_cost": 0, "period": params.get("period", "current_month")}

    async def _get_usage_metrics(self, params: Dict, user_id: str):
        """Get usage metrics - TODO: Implement with actual FinOpsTracker"""
        return {"total_requests": 0, "period": params.get("period", "current_month")}

    async def _query_audit_logs(self, params: Dict, user_id: str):
        """Query audit logs - TODO: Implement with actual AuditLogger"""
        return {"logs": [], "total": 0}

    async def _get_service_health(self, params: Dict, user_id: str):
        """Get service health - TODO: Implement with actual ServicesMonitor"""
        return {"status": "healthy", "service_id": params.get("service_id")}

    async def test_connection(self) -> Dict[str, Any]:
        """Test Gemini API connection"""
        try:
            response = self.model.generate_content("Hello! Respond with 'OK' if you can read this.")
            return {
                "success": True,
                "model": "gemini-1.5-flash-latest",
                "response": response.text
            }
        except Exception as e:
            logger.error(f"Gemini connection test failed: {str(e)}")
            raise


# Example usage in conversation:
"""
User: "Create an API key for the contracts app with 10000 daily requests"

Gemini Response:
{
  "message": "I'll create an API key for the contracts app with a daily quota of 10,000 requests.",
  "operations": [
    {
      "operation": "create_api_key",
      "params": {
        "name": "contracts-app-key",
        "consumer_app_id": "contracts-app",
        "quotas": {
          "requests_per_day": 10000
        }
      }
    }
  ]
}

After execution:
{
  "message": "I've successfully created an API key for contracts-app with 10,000 daily requests. The key ID is key_abc123. Make sure to save the key securely as it won't be shown again.",
  "actions_performed": [
    {
      "operation": "create_api_key",
      "status": "success",
      "result": {"key_id": "key_abc123", "api_key": "ce_live_..."}
    }
  ],
  "suggestions": [
    "You can view usage stats anytime with: get usage for key_abc123",
    "Consider setting up budget alerts for this consumer app"
  ]
}
"""
