"""
Quota Enforcement Middleware - Enterprise Grade

Enforces API key quotas to protect revenue and prevent abuse:
- requests_per_minute
- requests_per_day
- requests_per_month

Uses distributed counters for accurate tracking across instances.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class QuotaEnforcementMiddleware(BaseHTTPMiddleware):
    """
    Middleware to enforce API key quotas

    Features:
    - Per-minute, per-day, and per-month limits
    - Distributed counter tracking (Firestore)
    - Graceful degradation if quota service unavailable
    - Detailed quota headers in response
    - Audit logging for quota violations
    """

    def __init__(self, app, skip_paths: Optional[list] = None):
        """
        Initialize middleware

        Args:
            app: FastAPI application
            skip_paths: List of path prefixes to skip quota enforcement
        """
        super().__init__(app)
        self.skip_paths = skip_paths or [
            "/health",
            "/docs",
            "/openapi.json",
            "/v1/auth/"
        ]

    async def dispatch(self, request: Request, call_next):
        """
        Check and enforce quotas before processing request

        Args:
            request: Incoming request
            call_next: Next middleware/handler

        Returns:
            Response with quota headers
        """
        # Skip quota enforcement for certain paths
        if any(request.url.path.startswith(path) for path in self.skip_paths):
            return await call_next(request)

        # Only enforce if API key authenticated
        if not getattr(request.state, "api_key_authenticated", False):
            return await call_next(request)

        # Get API key context
        api_key_id = getattr(request.state, "api_key_id", None)
        quotas = getattr(request.state, "quotas", {})

        if not api_key_id or not quotas:
            # No quotas configured - allow request
            return await call_next(request)

        # Check quotas
        try:
            quota_check = await self._check_quotas(
                api_key_id=api_key_id,
                quotas=quotas
            )

            if not quota_check["allowed"]:
                # Quota exceeded
                logger.warning(
                    f"Quota exceeded",
                    extra={
                        "api_key_id": api_key_id,
                        "quota_type": quota_check["quota_type"],
                        "limit": quota_check["limit"],
                        "current": quota_check["current"],
                        "path": request.url.path
                    }
                )

                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Quota exceeded",
                        "quota_type": quota_check["quota_type"],
                        "limit": quota_check["limit"],
                        "current": quota_check["current"],
                        "reset_at": quota_check["reset_at"].isoformat() if quota_check.get("reset_at") else None
                    },
                    headers={
                        "Retry-After": str(int((quota_check.get("reset_at", datetime.utcnow()) - datetime.utcnow()).total_seconds())),
                        "X-RateLimit-Limit": str(quota_check["limit"]),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(int(quota_check.get("reset_at", datetime.utcnow()).timestamp()))
                    }
                )

            # Increment usage counters
            await self._increment_usage(api_key_id)

            # Process request
            response = await call_next(request)

            # Add quota headers to response
            response.headers["X-RateLimit-Limit-Minute"] = str(quotas.get("requests_per_minute", "unlimited"))
            response.headers["X-RateLimit-Limit-Day"] = str(quotas.get("requests_per_day", "unlimited"))
            response.headers["X-RateLimit-Limit-Month"] = str(quotas.get("requests_per_month", "unlimited"))

            remaining = quota_check.get("remaining", {})
            response.headers["X-RateLimit-Remaining-Minute"] = str(remaining.get("minute", "unknown"))
            response.headers["X-RateLimit-Remaining-Day"] = str(remaining.get("day", "unknown"))
            response.headers["X-RateLimit-Remaining-Month"] = str(remaining.get("month", "unknown"))

            return response

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Quota enforcement error: {e}", exc_info=True)
            # Fail open - allow request if quota service fails
            # In production, consider fail closed for critical endpoints
            return await call_next(request)

    async def _check_quotas(
        self,
        api_key_id: str,
        quotas: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Check if request is within quota limits

        Args:
            api_key_id: API key identifier
            quotas: Quota configuration

        Returns:
            Dict with check result:
            {
                "allowed": bool,
                "quota_type": str,  # "minute", "day", "month"
                "limit": int,
                "current": int,
                "reset_at": datetime,
                "remaining": {"minute": int, "day": int, "month": int}
            }
        """
        from app.services.firestore_repository import FirestoreRepository

        db = FirestoreRepository()

        try:
            # Get current usage from Firestore
            usage_doc = db.db.collection("api_key_usage").document(api_key_id).get()

            if not usage_doc.exists:
                # First request - all quotas available
                return {
                    "allowed": True,
                    "remaining": {
                        "minute": quotas.get("requests_per_minute", 999999),
                        "day": quotas.get("requests_per_day", 999999),
                        "month": quotas.get("requests_per_month", 999999)
                    }
                }

            usage_data = usage_doc.to_dict()

            # Get current time windows
            now = datetime.utcnow()
            minute_start = now.replace(second=0, microsecond=0)
            day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            # Check minute quota
            if "requests_per_minute" in quotas:
                minute_count = usage_data.get("current_minute", {})
                if minute_count.get("window") == minute_start.isoformat():
                    current_minute = minute_count.get("count", 0)
                else:
                    current_minute = 0

                if current_minute >= quotas["requests_per_minute"]:
                    return {
                        "allowed": False,
                        "quota_type": "requests_per_minute",
                        "limit": quotas["requests_per_minute"],
                        "current": current_minute,
                        "reset_at": minute_start + timedelta(minutes=1)
                    }

            # Check day quota
            if "requests_per_day" in quotas:
                day_count = usage_data.get("current_day", {})
                if day_count.get("window") == day_start.isoformat():
                    current_day = day_count.get("count", 0)
                else:
                    current_day = 0

                if current_day >= quotas["requests_per_day"]:
                    return {
                        "allowed": False,
                        "quota_type": "requests_per_day",
                        "limit": quotas["requests_per_day"],
                        "current": current_day,
                        "reset_at": day_start + timedelta(days=1)
                    }

            # Check month quota
            if "requests_per_month" in quotas:
                month_count = usage_data.get("current_month", {})
                if month_count.get("window") == month_start.isoformat():
                    current_month = month_count.get("count", 0)
                else:
                    current_month = 0

                if current_month >= quotas["requests_per_month"]:
                    # Calculate next month
                    if month_start.month == 12:
                        next_month = month_start.replace(year=month_start.year + 1, month=1)
                    else:
                        next_month = month_start.replace(month=month_start.month + 1)

                    return {
                        "allowed": False,
                        "quota_type": "requests_per_month",
                        "limit": quotas["requests_per_month"],
                        "current": current_month,
                        "reset_at": next_month
                    }

            # All checks passed
            return {
                "allowed": True,
                "remaining": {
                    "minute": quotas.get("requests_per_minute", 999999) - usage_data.get("current_minute", {}).get("count", 0),
                    "day": quotas.get("requests_per_day", 999999) - usage_data.get("current_day", {}).get("count", 0),
                    "month": quotas.get("requests_per_month", 999999) - usage_data.get("current_month", {}).get("count", 0)
                }
            }

        except Exception as e:
            logger.error(f"Error checking quotas: {e}", exc_info=True)
            # Fail open - allow request
            return {"allowed": True}

    async def _increment_usage(self, api_key_id: str):
        """
        Increment usage counters for all time windows

        Uses Firestore atomic increment for distributed counting

        Args:
            api_key_id: API key identifier
        """
        from app.services.firestore_repository import FirestoreRepository
        from google.cloud.firestore import Increment

        db = FirestoreRepository()

        try:
            now = datetime.utcnow()
            minute_start = now.replace(second=0, microsecond=0)
            day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            usage_ref = db.db.collection("api_key_usage").document(api_key_id)

            # Get current document
            usage_doc = usage_ref.get()

            if not usage_doc.exists:
                # Create new usage document
                usage_ref.set({
                    "api_key_id": api_key_id,
                    "current_minute": {
                        "window": minute_start.isoformat(),
                        "count": 1
                    },
                    "current_day": {
                        "window": day_start.isoformat(),
                        "count": 1
                    },
                    "current_month": {
                        "window": month_start.isoformat(),
                        "count": 1
                    },
                    "total_requests": 1,
                    "last_request_at": now,
                    "created_at": now
                })
            else:
                usage_data = usage_doc.to_dict()

                # Check if we need to reset windows
                updates = {}

                # Minute window
                if usage_data.get("current_minute", {}).get("window") == minute_start.isoformat():
                    updates["current_minute.count"] = Increment(1)
                else:
                    updates["current_minute"] = {
                        "window": minute_start.isoformat(),
                        "count": 1
                    }

                # Day window
                if usage_data.get("current_day", {}).get("window") == day_start.isoformat():
                    updates["current_day.count"] = Increment(1)
                else:
                    updates["current_day"] = {
                        "window": day_start.isoformat(),
                        "count": 1
                    }

                # Month window
                if usage_data.get("current_month", {}).get("window") == month_start.isoformat():
                    updates["current_month.count"] = Increment(1)
                else:
                    updates["current_month"] = {
                        "window": month_start.isoformat(),
                        "count": 1
                    }

                updates["total_requests"] = Increment(1)
                updates["last_request_at"] = now

                usage_ref.update(updates)

        except Exception as e:
            logger.error(f"Error incrementing usage: {e}", exc_info=True)
            # Non-critical - don't fail request
