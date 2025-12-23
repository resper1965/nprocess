"""
Structured logging middleware for Cloud Logging integration.
"""
import logging
import json
from typing import Dict, Any
from datetime import datetime

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Try to import Cloud Logging
try:
    from google.cloud import logging as cloud_logging
    CLOUD_LOGGING_AVAILABLE = True
except ImportError:
    CLOUD_LOGGING_AVAILABLE = False

logger = logging.getLogger(__name__)


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for structured logging with Cloud Logging integration.
    """
    
    def __init__(self, app):
        super().__init__(app)
        
        if CLOUD_LOGGING_AVAILABLE:
            try:
                self.cloud_logger = cloud_logging.Client().logger("compliance-engine")
                logger.info("Cloud Logging initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Cloud Logging: {e}")
                self.cloud_logger = None
        else:
            self.cloud_logger = None
            logger.info("Using standard Python logging (Cloud Logging not available)")
    
    async def dispatch(self, request: Request, call_next):
        start_time = datetime.utcnow()
        
        # Extract request info
        request_id = request.headers.get("X-Request-ID", "unknown")
        api_key_id = None
        
        # Try to extract API key ID from request
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            api_key = auth_header[7:]
            # Get key_id prefix for logging (first 8 chars)
            api_key_id = api_key[:16] if len(api_key) >= 16 else "unknown"
        
        # Log request
        log_data = {
            "method": request.method,
            "path": str(request.url.path),
            "query_params": str(request.url.query),
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
            "request_id": request_id,
            "api_key_id": api_key_id,
            "timestamp": start_time.isoformat(),
        }
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Log response
            log_data.update({
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
                "success": 200 <= response.status_code < 400,
            })
            
            # Structured log
            self._log("request", log_data, response.status_code)
            
            return response
            
        except Exception as e:
            # Log error
            duration_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
            log_data.update({
                "status_code": 500,
                "duration_ms": round(duration_ms, 2),
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__,
            })
            
            self._log("error", log_data, 500)
            raise
    
    def _log(self, level: str, data: Dict[str, Any], status_code: int):
        """Log structured data."""
        if self.cloud_logger:
            # Use Cloud Logging
            severity = self._get_severity(status_code)
            self.cloud_logger.log_struct(data, severity=severity)
        else:
            # Use standard logging
            log_message = json.dumps(data, default=str)
            if status_code >= 500:
                logger.error(log_message)
            elif status_code >= 400:
                logger.warning(log_message)
            else:
                logger.info(log_message)
    
    def _get_severity(self, status_code: int) -> str:
        """Map HTTP status code to Cloud Logging severity."""
        if status_code >= 500:
            return "ERROR"
        elif status_code >= 400:
            return "WARNING"
        else:
            return "INFO"

