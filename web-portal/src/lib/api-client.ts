import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AllowedStandards {
  marketplace: string[];
  custom: string[];
}

export interface APIKey {
  id: string;
  key: string;
  name: string;
  consumer_app_id: string;
  description?: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  active: boolean;
  daily_quota?: number;
  allowed_standards?: AllowedStandards;
}

export interface APIKeyCreate {
  name: string;
  consumer_app_id: string;
  description?: string;
  daily_quota?: number;
  quotas?: {
    requests_per_minute?: number;
    requests_per_day?: number;
    requests_per_month?: number;
  };
  permissions?: string[];
  allowed_standards?: AllowedStandards;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function listAPIKeys(): Promise<APIResponse<APIKey[]>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/apikeys`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch API keys' }));
      return { error: errorData.detail || 'Failed to fetch API keys' };
    }

    const data = await response.json();
    return { data: data.api_keys || [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to fetch API keys' };
  }
}

export async function createAPIKey(request: APIKeyCreate): Promise<APIResponse<APIKey>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/apikeys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to create API key' }));
      return { error: errorData.detail || 'Failed to create API key' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create API key' };
  }
}

export async function deleteAPIKey(keyId: string): Promise<APIResponse<void>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/apikeys/${keyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to delete API key' }));
      return { error: errorData.detail || 'Failed to delete API key' };
    }

    return { data: undefined };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete API key' };
  }
}

export async function revokeAPIKey(keyId: string): Promise<APIResponse<void>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/apikeys/${keyId}/revoke`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to revoke API key' }));
      return { error: errorData.detail || 'Failed to revoke API key' };
    }

    return { data: undefined };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to revoke API key' };
  }
}

// Admin API URL (separate from main API)
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Admin API client for hooks that need axios-like interface
const createAdminApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: ADMIN_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  instance.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export const adminApi = createAdminApi();

// ============================================================================
// Knowledge Base Interfaces and Functions
// ============================================================================

export interface KnowledgeBase {
  kb_id: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  price_monthly_cents: number;
  update_frequency: 'daily' | 'weekly' | 'monthly' | 'on_demand';
  document_count: number;
  chunk_count: number;
  last_updated_at: string | null;
  created_at: string;
  created_by: string;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface KBCreate {
  name: string;
  description: string;
  category: string;
  price_monthly_cents: number;
  update_frequency?: 'daily' | 'weekly' | 'monthly' | 'on_demand';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface KBIngestDocument {
  content: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface KBIngestRequest {
  documents: KBIngestDocument[];
  replace_existing?: boolean;
}

export interface KBIngestResponse {
  kb_id: string;
  documents_ingested: number;
  chunks_created: number;
  processing_time_ms: number;
  errors: string[];
}

// List all Knowledge Bases
export async function listKnowledgeBases(status?: 'draft' | 'active' | 'archived'): Promise<APIResponse<KnowledgeBase[]>> {
  try {
    const url = status 
      ? `${ADMIN_API_URL}/v1/admin/kbs?status=${status}`
      : `${ADMIN_API_URL}/v1/admin/kbs`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch knowledge bases' }));
      return { error: errorData.detail || 'Failed to fetch knowledge bases' };
    }

    const data = await response.json();
    return { data: Array.isArray(data) ? data : [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to fetch knowledge bases' };
  }
}

// Create a new Knowledge Base
export async function createKnowledgeBase(request: KBCreate): Promise<APIResponse<KnowledgeBase>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/kbs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to create knowledge base' }));
      return { error: errorData.detail || 'Failed to create knowledge base' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create knowledge base' };
  }
}

// Get a specific Knowledge Base
export async function getKnowledgeBase(kbId: string): Promise<APIResponse<KnowledgeBase>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/kbs/${kbId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch knowledge base' }));
      return { error: errorData.detail || 'Failed to fetch knowledge base' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to fetch knowledge base' };
  }
}

// Ingest documents into a Knowledge Base
export async function ingestKnowledgeBaseDocuments(
  kbId: string,
  request: KBIngestRequest
): Promise<APIResponse<KBIngestResponse>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/kbs/${kbId}/ingest`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to ingest documents' }));
      return { error: errorData.detail || 'Failed to ingest documents' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to ingest documents' };
  }
}

// Publish a Knowledge Base to marketplace
export async function publishKnowledgeBase(kbId: string): Promise<APIResponse<KnowledgeBase>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/kbs/${kbId}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to publish knowledge base' }));
      return { error: errorData.detail || 'Failed to publish knowledge base' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to publish knowledge base' };
  }
}

// Update a Knowledge Base
export async function updateKnowledgeBase(
  kbId: string,
  updates: Partial<KBCreate>
): Promise<APIResponse<KnowledgeBase>> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/v1/admin/kbs/${kbId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to update knowledge base' }));
      return { error: errorData.detail || 'Failed to update knowledge base' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update knowledge base' };
  }
}
