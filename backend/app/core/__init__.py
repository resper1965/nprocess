"""Core module - Configuration, Security, Dependencies"""

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import verify_firebase_token

__all__ = ["settings", "get_current_user", "verify_firebase_token"]
