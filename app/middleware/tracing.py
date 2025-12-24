"""
Distributed tracing middleware using Cloud Trace.
"""
import logging
from typing import Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Try to import Cloud Trace
try:
    from opentelemetry import trace
    from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    TRACING_AVAILABLE = True
except ImportError:
    TRACING_AVAILABLE = False

logger = logging.getLogger(__name__)


class TracingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for distributed tracing with Cloud Trace.
    """
    
    def __init__(self, app):
        super().__init__(app)
        
        if TRACING_AVAILABLE:
            try:
                # Setup Cloud Trace
                tracer_provider = TracerProvider()
                cloud_trace_exporter = CloudTraceSpanExporter()
                tracer_provider.add_span_processor(BatchSpanProcessor(cloud_trace_exporter))
                trace.set_tracer_provider(tracer_provider)
                
                # Instrument FastAPI
                FastAPIInstrumentor.instrument_app(app)
                
                self.tracer = trace.get_tracer(__name__)
                logger.info("Cloud Trace initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Cloud Trace: {e}")
                self.tracer = None
        else:
            self.tracer = None
            logger.info("Tracing not available (opentelemetry not installed)")
    
    async def dispatch(self, request: Request, call_next):
        if not self.tracer:
            # No tracing - just process request
            return await call_next(request)
        
        # Create span for request
        with self.tracer.start_as_current_span(
            f"{request.method} {request.url.path}",
            kind=trace.SpanKind.SERVER
        ) as span:
            # Add attributes
            span.set_attribute("http.method", request.method)
            span.set_attribute("http.url", str(request.url))
            span.set_attribute("http.route", request.url.path)
            
            # Add API key info if available
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                api_key = auth_header[7:]
                span.set_attribute("api.key_prefix", api_key[:16] if len(api_key) >= 16 else "unknown")
            
            try:
                response = await call_next(request)
                span.set_attribute("http.status_code", response.status_code)
                return response
            except Exception as e:
                span.set_attribute("error", True)
                span.set_attribute("error.message", str(e))
                span.set_attribute("error.type", type(e).__name__)
                raise


