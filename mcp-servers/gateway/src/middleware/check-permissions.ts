/**
 * Permission Check Middleware
 * 
 * Verifies that the API key has required permissions for the endpoint.
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Endpoint Permissions Mapping
// ============================================================================

const ENDPOINT_PERMISSIONS: Record<string, string[]> = {
  // ComplianceEngine endpoints
  '/v1/tools/compliance/generate_bpmn_diagram': ['diagrams:generate', 'write'],
  '/v1/tools/compliance/create_process': ['processes:create', 'write'],
  '/v1/tools/compliance/list_processes': ['processes:read', 'read'],
  '/v1/tools/compliance/get_process': ['processes:read', 'read'],
  '/v1/tools/compliance/analyze_compliance': ['compliance:analyze', 'write'],
  '/v1/tools/compliance/list_compliance_analyses': ['compliance:read', 'read'],
  '/v1/tools/compliance/get_compliance_analysis': ['compliance:read', 'read'],
  
  // RegulatoryRAG endpoints
  '/v1/tools/rag/search_regulations': ['rag:search', 'read'],
  '/v1/tools/rag/list_regulation_domains': ['rag:read', 'read'],
  '/v1/tools/rag/get_regulation': ['rag:read', 'read'],
  
  // Tool discovery (read-only, no specific permission required)
  '/v1/tools': [],
};

// ============================================================================
// Helper Functions
// ============================================================================

function getRequiredPermissions(path: string): string[] {
  // Exact match first
  if (ENDPOINT_PERMISSIONS[path]) {
    return ENDPOINT_PERMISSIONS[path];
  }
  
  // Try to match by prefix (for dynamic routes)
  for (const [endpoint, perms] of Object.entries(ENDPOINT_PERMISSIONS)) {
    if (path.startsWith(endpoint)) {
      return perms;
    }
  }
  
  // Default: require at least read permission
  return ['read'];
}

function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  if (requiredPermissions.length === 0) {
    // No specific permissions required
    return true;
  }
  
  // Check if user has all required permissions
  const userPermsSet = new Set(userPermissions);
  return requiredPermissions.every(perm => userPermsSet.has(perm));
}

// ============================================================================
// Middleware
// ============================================================================

export const checkPermissions = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const path = req.path;
  const userPermissions = req.apiKeyPermissions || [];
  
  // Get required permissions for this endpoint
  const requiredPermissions = getRequiredPermissions(path);
  
  // Check if user has all required permissions
  if (!hasAllPermissions(userPermissions, requiredPermissions)) {
    res.status(403).json({
      error: 'Insufficient permissions',
      detail: `This endpoint requires: ${requiredPermissions.join(', ')}`,
      required: requiredPermissions,
      granted: userPermissions,
    });
    return;
  }
  
  next();
};

