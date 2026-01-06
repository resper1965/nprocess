"""
Structured Logging with Correlation IDs
Cloud Logging compatible format
"""

import logging
import uuid
import time
import json
from typing import Optional, Dict, Any
from contextvars import ContextVar
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Context variable for correlation ID
correlation_id_var: ContextVar[str] = ContextVar('correlation_id', default='')


class StructuredFormatter(logging.Formatter):
    """
    JSON formatter for structured logging.
    Compatible with Google Cloud Logging.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record, self.datefmt),
            "severity": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add correlation ID if available
        correlation_id = correlation_id_var.get()
        if correlation_id:
            log_entry["correlation_id"] = correlation_id
            log_entry["logging.googleapis.com/trace"] = correlation_id
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, 'extra'):
            log_entry.update(record.extra)
        
        return json.dumps(log_entry)


class CloudLoggingHandler(logging.Handler):
    """
    Handler that formats logs for Cloud Logging ingestion.
    Falls back to stdout for local development.
    """
    
    def __init__(self, level=logging.NOTSET):
        super().__init__(level)
        self.setFormatter(StructuredFormatter())
    
    def emit(self, record: logging.LogRecord):
        try:
            msg = self.format(record)
            print(msg)  # Cloud Logging picks up stdout
        except Exception:
            self.handleError(record)


def setup_structured_logging(log_level: str = "INFO"):
    """
    Configure structured logging for the application.
    Call this at application startup.
    """
    # Remove existing handlers
    root_logger = logging.getLogger()
    root_logger.handlers = []
    
    # Add structured handler
    handler = CloudLoggingHandler()
    handler.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.DEBUG)
    
    # Log startup
    logging.info("Structured logging initialized", extra={"component": "logging"})


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for request logging and correlation ID tracking.
    """
    
    async def dispatch(self, request: Request, call_next):
        # Generate or extract correlation ID
        correlation_id = request.headers.get("X-Correlation-ID")
        if not correlation_id:
            correlation_id = str(uuid.uuid4())
        
        # Set in context var
        token = correlation_id_var.set(correlation_id)
        
        # Store in request state
        request.state.correlation_id = correlation_id
        
        # Log request start
        start_time = time.time()
        logger = logging.getLogger("http")
        
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "http_method": request.method,
                "http_path": request.url.path,
                "http_query": str(request.query_params),
                "client_ip": self._get_client_ip(request),
                "user_agent": request.headers.get("User-Agent", ""),
            }
        )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log request completion
            logger.info(
                f"Request completed: {request.method} {request.url.path} -> {response.status_code}",
                extra={
                    "http_method": request.method,
                    "http_path": request.url.path,
                    "http_status": response.status_code,
                    "duration_ms": round(duration_ms, 2),
                }
            )
            
            # Add correlation ID to response
            response.headers["X-Correlation-ID"] = correlation_id
            
            return response
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "http_method": request.method,
                    "http_path": request.url.path,
                    "error": str(e),
                    "duration_ms": round(duration_ms, 2),
                },
                exc_info=True
            )
            raise
        finally:
            # Reset context var
            correlation_id_var.reset(token)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with correlation ID support.
    Use this instead of logging.getLogger() for automatic correlation.
    """
    return logging.getLogger(name)
