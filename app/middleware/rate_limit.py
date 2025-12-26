"""
Rate limiting middleware for API endpoints.
Supports Redis (preferred) or in-memory fallback.
"""
import logging
import time
from typing import Optional, Tuple
from datetime import datetime, timedelta

from fastapi import HTTPException, Request, status
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware

# API key service removed in v2.0.0 refactoring
# Rate limiting temporarily disabled - will be re-implemented with admin-control-plane integration
# from app.services.apikey_service import get_apikey_service
# from app.schemas_apikeys import APIKeyValidationResult, APIKeyQuotas

logger = logging.getLogger(__name__)

# Try to import Redis, fallback to in-memory if not available
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available, using in-memory rate limiting (not suitable for production with multiple instances)")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware that enforces limits per API key.
    
    Uses Redis if available, otherwise falls back to in-memory storage.
    """
    
    def __init__(self, app, redis_url: Optional[str] = None):
        super().__init__(app)
        self.redis_client = None
        self.memory_store: dict = {}  # Fallback: {key_id: {minute: count, day: count, month: count}}
        
        if REDIS_AVAILABLE and redis_url:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                # Test connection
                self.redis_client.ping()
                logger.info("Rate limiting using Redis")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}. Using in-memory fallback.")
                self.redis_client = None
        else:
            logger.warning("Rate limiting using in-memory storage (not suitable for production)")
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Rate limiting temporarily disabled in v2.0.0
        # TODO: Re-implement with admin-control-plane integration
        # For now, allow all requests without rate limiting
        return await call_next(request)
        
        # Original code (disabled):
        # Extract API key from request
        # api_key = self._extract_api_key(request)
        # ... rest of rate limiting logic
        
        try:
            allowed, remaining, reset_time = await self._check_rate_limit(
                key_id,
                quotas.requests_per_minute,
                quotas.requests_per_day,
                quotas.requests_per_month
            )
            
            if not allowed:
                # Rate limit exceeded
                retry_after = int((reset_time - datetime.utcnow()).total_seconds())
                if retry_after < 0:
                    retry_after = 60  # Default to 1 minute
                
                response = Response(
                    content=f"Rate limit exceeded. Try again after {retry_after} seconds.",
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS
                )
                response.headers["X-RateLimit-Limit"] = str(quotas.requests_per_minute)
                response.headers["X-RateLimit-Remaining"] = "0"
                response.headers["X-RateLimit-Reset"] = str(int(reset_time.timestamp()))
                response.headers["Retry-After"] = str(retry_after)
                return response
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers
            response.headers["X-RateLimit-Limit"] = str(quotas.requests_per_minute)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(int(reset_time.timestamp()))
            
            return response
            
        except Exception as e:
            logger.error(f"Error in rate limiting: {e}")
            # On error, allow request but log
            return await call_next(request)
    
    def _extract_api_key(self, request: Request) -> Optional[str]:
        """Extract API key from Authorization header or X-API-Key header."""
        # Check Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header[7:]
        
        # Check X-API-Key header
        return request.headers.get("X-API-Key")
    
    async def _check_rate_limit(
        self,
        key_id: str,
        per_minute: int,
        per_day: int,
        per_month: int
    ) -> Tuple[bool, int, datetime]:
        """
        Check if request is within rate limits.
        
        Returns:
            (allowed, remaining, reset_time)
        """
        now = datetime.utcnow()
        minute_key = f"{key_id}:minute:{now.strftime('%Y%m%d%H%M')}"
        day_key = f"{key_id}:day:{now.strftime('%Y%m%d')}"
        month_key = f"{key_id}:month:{now.strftime('%Y%m')}"
        
        if self.redis_client:
            return await self._check_redis_limits(
                minute_key, day_key, month_key,
                per_minute, per_day, per_month, now
            )
        else:
            return await self._check_memory_limits(
                key_id, per_minute, per_day, per_month, now
            )
    
    async def _check_redis_limits(
        self,
        minute_key: str,
        day_key: str,
        month_key: str,
        per_minute: int,
        per_day: int,
        per_month: int,
        now: datetime
    ) -> Tuple[bool, int, datetime]:
        """Check limits using Redis."""
        pipe = self.redis_client.pipeline()
        
        # Increment counters
        pipe.incr(minute_key)
        pipe.incr(day_key)
        pipe.incr(month_key)
        
        # Set expiration
        pipe.expire(minute_key, 60)  # 1 minute
        pipe.expire(day_key, 86400)  # 1 day
        pipe.expire(month_key, 2592000)  # 30 days
        
        # Get current counts
        pipe.get(minute_key)
        pipe.get(day_key)
        pipe.get(month_key)
        
        results = pipe.execute()
        
        minute_count = int(results[3] or 0)
        day_count = int(results[4] or 0)
        month_count = int(results[5] or 0)
        
        # Check limits (most restrictive wins)
        if minute_count > per_minute:
            reset_time = now + timedelta(seconds=60)
            return (False, 0, reset_time)
        
        if day_count > per_day:
            reset_time = now + timedelta(days=1)
            reset_time = reset_time.replace(hour=0, minute=0, second=0, microsecond=0)
            return (False, 0, reset_time)
        
        if month_count > per_month:
            # Reset at start of next month
            if now.month == 12:
                reset_time = datetime(now.year + 1, 1, 1)
            else:
                reset_time = datetime(now.year, now.month + 1, 1)
            return (False, 0, reset_time)
        
        # Calculate remaining (use most restrictive)
        remaining = min(
            per_minute - minute_count,
            per_day - day_count,
            per_month - month_count
        )
        
        # Reset time is when minute window resets
        reset_time = now + timedelta(seconds=60)
        
        return (True, remaining, reset_time)
    
    async def _check_memory_limits(
        self,
        key_id: str,
        per_minute: int,
        per_day: int,
        per_month: int,
        now: datetime
    ) -> Tuple[bool, int, datetime]:
        """Check limits using in-memory storage."""
        if key_id not in self.memory_store:
            self.memory_store[key_id] = {}
        
        store = self.memory_store[key_id]
        
        # Clean old entries
        minute_key = f"minute:{now.strftime('%Y%m%d%H%M')}"
        day_key = f"day:{now.strftime('%Y%m%d')}"
        month_key = f"month:{now.strftime('%Y%m')}"
        
        # Remove old entries
        keys_to_remove = [k for k in store.keys() if not k.startswith((minute_key, day_key, month_key))]
        for k in keys_to_remove:
            del store[k]
        
        # Increment counters
        store[minute_key] = store.get(minute_key, 0) + 1
        store[day_key] = store.get(day_key, 0) + 1
        store[month_key] = store.get(month_key, 0) + 1
        
        minute_count = store.get(minute_key, 0)
        day_count = store.get(day_key, 0)
        month_count = store.get(month_key, 0)
        
        # Check limits
        if minute_count > per_minute:
            reset_time = now + timedelta(seconds=60)
            return (False, 0, reset_time)
        
        if day_count > per_day:
            reset_time = now + timedelta(days=1)
            reset_time = reset_time.replace(hour=0, minute=0, second=0, microsecond=0)
            return (False, 0, reset_time)
        
        if month_count > per_month:
            if now.month == 12:
                reset_time = datetime(now.year + 1, 1, 1)
            else:
                reset_time = datetime(now.year, now.month + 1, 1)
            return (False, 0, reset_time)
        
        remaining = min(
            per_minute - minute_count,
            per_day - day_count,
            per_month - month_count
        )
        
        reset_time = now + timedelta(seconds=60)
        
        return (True, remaining, reset_time)

