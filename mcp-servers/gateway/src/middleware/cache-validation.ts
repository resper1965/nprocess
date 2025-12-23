/**
 * Validation Cache Middleware
 * 
 * Caches API key validations to reduce load on backend.
 * Cache TTL: 5 minutes (chosen to balance performance and security)
 */

import NodeCache from 'node-cache';
import { APIKeyValidation } from './validate-api-key';

// ============================================================================
// Cache Configuration
// ============================================================================

const CACHE_TTL = 300; // 5 minutes
const CACHE_CHECK_PERIOD = 60; // Check for expired entries every minute

// Create cache instance
const validationCache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: CACHE_CHECK_PERIOD,
  useClones: false, // Better performance
});

// ============================================================================
// Cache Statistics
// ============================================================================

let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
};

export function getCacheStats() {
  const cacheStatsInternal = validationCache.getStats();
  return {
    ...cacheStats,
    size: cacheStatsInternal.keys,
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
  };
}

// ============================================================================
// Cache Functions
// ============================================================================

/**
 * Get cached validation result.
 */
export function getCachedValidation(apiKey: string): APIKeyValidation | undefined {
  const cached = validationCache.get<APIKeyValidation>(apiKey);
  if (cached) {
    cacheStats.hits++;
    return cached;
  }
  cacheStats.misses++;
  return undefined;
}

/**
 * Cache validation result.
 * Only caches valid keys (invalid keys are not cached to allow retry).
 */
export function cacheValidation(
  apiKey: string,
  validation: APIKeyValidation
): void {
  if (validation.valid) {
    validationCache.set(apiKey, validation);
    cacheStats.sets++;
  }
}

/**
 * Invalidate cache for a specific API key.
 * Used when a key is revoked or permissions change.
 */
export function invalidateCache(apiKey: string): void {
  validationCache.del(apiKey);
}

/**
 * Clear all cached validations.
 */
export function clearCache(): void {
  validationCache.flushAll();
  cacheStats = { hits: 0, misses: 0, sets: 0 };
}

