/**
 * API Key Validation Middleware
 * 
 * Validates API keys against the ComplianceEngine backend API.
 * Implements fail-secure: denies access if backend is unavailable.
 */

import axios, { AxiosError } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { getCachedValidation, cacheValidation } from './cache-validation.js';

// ============================================================================
// Configuration
// ============================================================================

const COMPLIANCE_API_URL = process.env.COMPLIANCE_API_URL || 'http://localhost:8000';
const VALIDATION_TIMEOUT = 5000; // 5 seconds

// ============================================================================
// Types
// ============================================================================

interface APIKeyValidation {
  valid: boolean;
  key_id?: string;
  consumer_app_id?: string;
  consumer_app_name?: string;
  permissions?: string[];
  rate_limit_remaining?: number;
  error?: string;
}

// Extend Express Request to include API key info
declare global {
  namespace Express {
    interface Request {
      apiKeyId?: string;
      apiKeyPermissions?: string[];
      consumerAppId?: string;
    }
  }
}

// ============================================================================
// Validation Function
// ============================================================================

async function validateApiKeyAgainstBackend(
  apiKey: string
): Promise<APIKeyValidation> {
  try {
    // Call backend validation endpoint
    const response = await axios.post(
      `${COMPLIANCE_API_URL}/v1/api-keys/validate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: VALIDATION_TIMEOUT,
      }
    );

    if (response.data.valid) {
      return {
        valid: true,
        key_id: response.data.key_id,
        consumer_app_id: response.data.consumer_app_id,
        consumer_app_name: response.data.consumer_app_name,
        permissions: response.data.permissions || [],
        rate_limit_remaining: response.data.rate_limit_remaining,
      };
    }

    return {
      valid: false,
      error: response.data.error || 'Invalid API key',
    };
  } catch (error: any) {
    // Fail-secure: deny access if backend is unavailable
    if (error instanceof AxiosError) {
      if (error.response) {
        // Backend returned an error
        const status = error.response.status;
        const data = error.response.data as any;
        
        if (status === 401) {
          return {
            valid: false,
            error: data.detail || 'Invalid API key',
          };
        }
        
        return {
          valid: false,
          error: `Backend validation failed: ${data.detail || error.message}`,
        };
      } else if (error.request) {
        // Request made but no response (backend down)
        console.error('Backend validation service unavailable:', error.message);
        return {
          valid: false,
          error: 'API key validation service unavailable',
        };
      }
    }
    
    // Other errors
    console.error('Error validating API key:', error);
    return {
      valid: false,
      error: 'Internal error during API key validation',
    };
  }
}

// ============================================================================
// Middleware
// ============================================================================

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Check for Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Missing or invalid authorization header',
      detail: 'Expected: Authorization: Bearer <api_key>',
    });
    return;
  }

  // Extract token
  const token = authHeader.substring(7);
  if (!token || token.trim().length === 0) {
    res.status(401).json({
      error: 'Invalid API key',
      detail: 'API key cannot be empty',
    });
    return;
  }

  // Check cache first
  let validation = getCachedValidation(token);
  
  if (!validation) {
    // Validate against backend
    validation = await validateApiKeyAgainstBackend(token);
    
    // Cache valid keys
    if (validation.valid) {
      cacheValidation(token, validation);
    }
  }

  if (!validation.valid) {
    res.status(401).json({
      error: validation.error || 'Invalid API key',
    });
    return;
  }

  // Add API key info to request
  req.apiKeyId = validation.key_id;
  req.apiKeyPermissions = validation.permissions || [];
  req.consumerAppId = validation.consumer_app_id;

  next();
};

