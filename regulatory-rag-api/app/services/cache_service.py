"""
Cache Service using Redis

Provides caching functionality for regulation search results
to improve performance and reduce API calls.
"""

import logging
import json
import hashlib
from typing import Optional, Any, Dict
import os

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logging.warning("Redis not available. Caching will be disabled.")

logger = logging.getLogger(__name__)

# ============================================================================
# Configuration
# ============================================================================

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"

# ============================================================================
# Cache Service
# ============================================================================

class CacheService:
    """
    Redis-based cache service for regulation search results
    """

    def __init__(self):
        """Initialize cache service"""
        self.enabled = CACHE_ENABLED and REDIS_AVAILABLE
        self.client: Optional[redis.Redis] = None

        if self.enabled:
            try:
                self.client = redis.Redis(
                    host=REDIS_HOST,
                    port=REDIS_PORT,
                    db=REDIS_DB,
                    password=REDIS_PASSWORD if REDIS_PASSWORD else None,
                    decode_responses=True,
                    socket_connect_timeout=5
                )

                # Test connection
                self.client.ping()
                logger.info(f"Redis cache connected: {REDIS_HOST}:{REDIS_PORT}")

            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                logger.warning("Cache service will be disabled")
                self.enabled = False
                self.client = None
        else:
            logger.info("Cache service is disabled")

    def generate_cache_key(
        self,
        query: str,
        domain: Optional[str] = None,
        top_k: int = 10,
        extra: Optional[str] = None
    ) -> str:
        """
        Generate cache key from search parameters

        Args:
            query: Search query
            domain: Optional domain filter
            top_k: Number of results
            extra: Extra string to include in cache key (e.g., datasets)

        Returns:
            Cache key (hash)
        """
        # Create a string representation of the search parameters
        key_data = {
            "query": query.lower().strip(),
            "domain": domain,
            "top_k": top_k,
            "extra": extra
        }

        # Generate MD5 hash
        key_str = json.dumps(key_data, sort_keys=True)
        hash_key = hashlib.md5(key_str.encode()).hexdigest()

        return f"reg_search:{hash_key}"

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        if not self.enabled or not self.client:
            return None

        try:
            value = self.client.get(key)
            if value:
                logger.debug(f"Cache hit: {key}")
                return json.loads(value)
            else:
                logger.debug(f"Cache miss: {key}")
                return None

        except Exception as e:
            logger.error(f"Error getting from cache: {e}")
            return None

    def set(
        self,
        key: str,
        value: Dict[str, Any],
        ttl: int = 3600
    ) -> bool:
        """
        Set value in cache with TTL

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (default: 1 hour)

        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.client:
            return False

        try:
            value_json = json.dumps(value, default=str)
            self.client.setex(key, ttl, value_json)
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
            return True

        except Exception as e:
            logger.error(f"Error setting cache: {e}")
            return False

    def delete(self, key: str) -> bool:
        """
        Delete value from cache

        Args:
            key: Cache key

        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.client:
            return False

        try:
            self.client.delete(key)
            logger.debug(f"Cache deleted: {key}")
            return True

        except Exception as e:
            logger.error(f"Error deleting from cache: {e}")
            return False

    def clear_all(self) -> bool:
        """
        Clear all cache entries (use with caution)

        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.client:
            return False

        try:
            # Only delete keys with our prefix
            keys = self.client.keys("reg_search:*")
            if keys:
                self.client.delete(*keys)
                logger.info(f"Cleared {len(keys)} cache entries")
            return True

        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics

        Returns:
            Dictionary with cache stats
        """
        if not self.enabled or not self.client:
            return {
                "enabled": False,
                "status": "disabled"
            }

        try:
            info = self.client.info()
            keys_count = len(self.client.keys("reg_search:*"))

            return {
                "enabled": True,
                "status": "connected",
                "host": REDIS_HOST,
                "port": REDIS_PORT,
                "db": REDIS_DB,
                "total_keys": keys_count,
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "uptime_days": info.get("uptime_in_days")
            }

        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {
                "enabled": True,
                "status": "error",
                "error": str(e)
            }

    def close(self):
        """Close cache connection"""
        if self.client:
            try:
                self.client.close()
                logger.info("Cache connection closed")
            except Exception as e:
                logger.error(f"Error closing cache connection: {e}")

# ============================================================================
# Service Instance (Singleton)
# ============================================================================

_cache_service_instance: Optional[CacheService] = None

def get_cache_service() -> CacheService:
    """
    Get or create the cache service instance (singleton)

    Returns:
        CacheService instance
    """
    global _cache_service_instance

    if _cache_service_instance is None:
        _cache_service_instance = CacheService()

    return _cache_service_instance
