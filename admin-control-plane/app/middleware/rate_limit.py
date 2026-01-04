"""
Rate Limiting Middleware
Token bucket algorithm with Redis/in-memory fallback
"""

import time
import logging
from typing import Dict, Optional, Tuple
from collections import defaultdict
from dataclasses import dataclass, field
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


@dataclass
class RateLimitConfig:
    """Rate limit configuration"""
    requests_per_minute: int = 60
    requests_per_hour: int = 1000
    burst_size: int = 10  # Allow short bursts


@dataclass
class TokenBucket:
    """Token bucket for rate limiting"""
    tokens: float = 60.0
    last_refill: float = field(default_factory=time.time)
    max_tokens: float = 60.0
    refill_rate: float = 1.0  # tokens per second
    
    def consume(self, tokens: int = 1) -> Tuple[bool, float]:
        """
        Try to consume tokens.
        Returns (success, wait_time)
        """
        now = time.time()
        elapsed = now - self.last_refill
        
        # Refill tokens
        self.tokens = min(self.max_tokens, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
        
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True, 0.0
        
        # Calculate wait time
        wait_time = (tokens - self.tokens) / self.refill_rate
        return False, wait_time


class RateLimiter:
    """
    In-memory rate limiter with token bucket algorithm.
    For production, replace with Redis-based implementation.
    """
    
    def __init__(self, config: Optional[RateLimitConfig] = None):
        self.config = config or RateLimitConfig()
        self._buckets: Dict[str, TokenBucket] = {}
        self._cleanup_interval = 300  # 5 minutes
        self._last_cleanup = time.time()
    
    def _get_bucket(self, key: str) -> TokenBucket:
        """Get or create a token bucket for the key"""
        if key not in self._buckets:
            self._buckets[key] = TokenBucket(
                tokens=float(self.config.burst_size),
                max_tokens=float(self.config.requests_per_minute),
                refill_rate=self.config.requests_per_minute / 60.0
            )
        return self._buckets[key]
    
    def _cleanup_old_buckets(self):
        """Remove old buckets to prevent memory leak"""
        now = time.time()
        if now - self._last_cleanup < self._cleanup_interval:
            return
        
        # Remove buckets not used in the last hour
        cutoff = now - 3600
        self._buckets = {
            k: v for k, v in self._buckets.items()
            if v.last_refill > cutoff
        }
        self._last_cleanup = now
        logger.debug(f"Cleaned up rate limit buckets. Remaining: {len(self._buckets)}")
    
    def check_limit(self, key: str) -> Tuple[bool, Dict[str, any]]:
        """
        Check if request is within rate limit.
        Returns (allowed, metadata)
        """
        self._cleanup_old_buckets()
        bucket = self._get_bucket(key)
        allowed, wait_time = bucket.consume()
        
        return allowed, {
            "remaining": int(bucket.tokens),
            "limit": self.config.requests_per_minute,
            "reset": int(wait_time) if wait_time > 0 else 0
        }


# Global rate limiter instance
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """Get the global rate limiter"""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for rate limiting
    """
    
    # Paths to exclude from rate limiting
    EXCLUDED_PATHS = {"/health", "/", "/docs", "/openapi.json", "/redoc"}
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for excluded paths
        if request.url.path in self.EXCLUDED_PATHS:
            return await call_next(request)
        
        # Get identifier (API key, user ID, or IP)
        identifier = self._get_identifier(request)
        
        # Check rate limit
        limiter = get_rate_limiter()
        allowed, metadata = limiter.check_limit(identifier)
        
        if not allowed:
            logger.warning(f"Rate limit exceeded for {identifier}")
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Too Many Requests",
                    "retry_after": metadata["reset"],
                    "message": "Rate limit exceeded. Please retry later."
                },
                headers={
                    "Retry-After": str(metadata["reset"]),
                    "X-RateLimit-Limit": str(metadata["limit"]),
                    "X-RateLimit-Remaining": "0"
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(metadata["limit"])
        response.headers["X-RateLimit-Remaining"] = str(metadata["remaining"])
        
        return response
    
    def _get_identifier(self, request: Request) -> str:
        """Get unique identifier for rate limiting"""
        # Try API key first
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return f"key:{api_key[:16]}"
        
        # Try authenticated user
        if hasattr(request.state, "user") and request.state.user:
            return f"user:{request.state.user.get('uid', 'unknown')}"
        
        # Fall back to IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else "unknown"
        
        return f"ip:{ip}"
