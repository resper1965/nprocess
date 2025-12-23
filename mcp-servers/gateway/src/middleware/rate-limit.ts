/**
 * Rate Limiting Middleware
 * 
 * Implements in-memory rate limiting per API key.
 * For production, consider using Redis for distributed rate limiting.
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Rate Limit Configuration
// ============================================================================

const DEFAULT_REQUESTS_PER_MINUTE = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// ============================================================================
// In-Memory Rate Limit Store
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

// ============================================================================
// Rate Limit Functions
// ============================================================================

function getRateLimitKey(req: Request): string {
  // Use API key ID if available, otherwise use IP
  return req.apiKeyId || req.ip || 'unknown';
}

function getRateLimit(req: Request): number {
  // In production, fetch from backend based on API key quotas
  // For now, use default
  return DEFAULT_REQUESTS_PER_MINUTE;
}

function checkRateLimit(key: string, limit: number): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetAt < now) {
    // New window or expired
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    };
  }
  
  // Existing window
  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  entry.count++;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// ============================================================================
// Middleware
// ============================================================================

export const rateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const key = getRateLimitKey(req);
  const limit = getRateLimit(req);
  
  const result = checkRateLimit(key, limit);
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    res.status(429).json({
      error: 'Rate limit exceeded',
      detail: `Too many requests. Limit: ${limit} per minute`,
      retry_after: retryAfter,
      limit,
      remaining: 0,
      reset_at: new Date(result.resetAt).toISOString(),
    });
    return;
  }
  
  next();
};

