"""
API Key Authentication Middleware - Enterprise Grade

Validates API keys and injects access control context into requests.
Enforces allowed_standards filtering for search operations.
"""

import logging
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.apikey_service import APIKeyService

logger = logging.getLogger(__name__)


class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware to authenticate API keys and inject access control context

    Features:
    - Validates X-API-Key header
    - Checks API key status and expiration
    - Injects allowed_standards into request.state
    - Provides fallback to Firebase auth if no API key
    - Logs API key usage for audit
    """

    def __init__(self, app, skip_paths: Optional[list] = None):
        """
        Initialize middleware

        Args:
            app: FastAPI application
            skip_paths: List of path prefixes to skip API key auth
        """
        super().__init__(app)
        self.skip_paths = skip_paths or [
            "/health",
            "/docs",
            "/openapi.json",
            "/v1/auth/"  # Authentication endpoints
        ]

    async def dispatch(self, request: Request, call_next):
        """
        Process request and validate API key if present

        Args:
            request: Incoming request
            call_next: Next middleware/handler

        Returns:
            Response from handler
        """
        # Skip API key validation for certain paths
        if any(request.url.path.startswith(path) for path in self.skip_paths):
            return await call_next(request)

        # Check for X-API-Key header
        api_key = request.headers.get("X-API-Key") or request.headers.get("x-api-key")

        if api_key:
            # Validate API key
            try:
                service = APIKeyService()
                validation_result = await service.validate_key_string(api_key)

                if not validation_result.get("valid"):
                    logger.warning(
                        f"Invalid API key attempt",
                        extra={
                            "path": request.url.path,
                            "ip": request.client.host if request.client else "unknown",
                            "reason": validation_result.get("message")
                        }
                    )
                    raise HTTPException(
                        status_code=403,
                        detail=validation_result.get("message", "Invalid API key")
                    )

                key_data = validation_result.get("key_data", {})

                # Inject API key context into request state
                request.state.api_key_authenticated = True
                request.state.api_key_id = key_data.get("key_id")
                request.state.consumer_app_id = key_data.get("consumer_app_id")
                request.state.allowed_standards = key_data.get("allowed_standards")
                request.state.quotas = key_data.get("quotas", {})
                request.state.permissions = key_data.get("permissions", [])
                request.state.client_id = key_data.get("consumer_app_id")  # Compatibility

                # Update last_used_at (async, don't block)
                # TODO: Use background task or pub/sub for better performance
                try:
                    await service.update_last_used(key_data.get("key_id"))
                except Exception as e:
                    logger.error(f"Failed to update last_used_at: {e}")

                logger.info(
                    f"API key authenticated",
                    extra={
                        "api_key_id": request.state.api_key_id,
                        "consumer_app_id": request.state.consumer_app_id,
                        "path": request.url.path,
                        "has_allowed_standards": bool(request.state.allowed_standards)
                    }
                )

            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"API key validation error: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail="Authentication service error"
                )
        else:
            # No API key - will fall back to Firebase auth in endpoints
            request.state.api_key_authenticated = False
            request.state.allowed_standards = None

        # Continue to next handler
        response = await call_next(request)
        return response


def get_allowed_standards(request: Request) -> Optional[Dict[str, list]]:
    """
    Extract allowed_standards from request context

    Args:
        request: FastAPI request object

    Returns:
        Dict with {marketplace: [str], custom: [str]} or None
    """
    return getattr(request.state, "allowed_standards", None)


def filter_by_allowed_standards(
    standards: list,
    allowed_standards: Optional[Dict[str, list]],
    standard_type: str = "marketplace"
) -> list:
    """
    Filter standards list by allowed_standards

    Args:
        standards: List of standard IDs or objects
        allowed_standards: {marketplace: [], custom: []} or None
        standard_type: "marketplace" or "custom"

    Returns:
        Filtered list
    """
    if not allowed_standards:
        # No restrictions - return all
        return standards

    allowed = allowed_standards.get(standard_type, [])

    if not allowed:
        # Empty allowed list = no access to this type
        return []

    # Filter standards
    filtered = []
    for std in standards:
        # Handle both string IDs and dict objects
        std_id = std if isinstance(std, str) else (
            std.get("standard_id") or std.get("kb_id") or std.get("id")
        )

        if std_id in allowed:
            filtered.append(std)

    return filtered


def check_standard_access(
    standard_id: str,
    allowed_standards: Optional[Dict[str, list]]
) -> bool:
    """
    Check if standard_id is allowed

    Args:
        standard_id: Standard identifier
        allowed_standards: {marketplace: [], custom: []} or None

    Returns:
        True if allowed, False otherwise
    """
    if not allowed_standards:
        # No restrictions
        return True

    # Determine type from ID
    if standard_id.startswith("custom_"):
        allowed = allowed_standards.get("custom", [])
    else:
        allowed = allowed_standards.get("marketplace", [])

    return standard_id in allowed if allowed else False
