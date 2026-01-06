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
    const response = await fetch(`${API_URL}/v1/admin/apikeys`, {
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
    const response = await fetch(`${API_URL}/v1/admin/apikeys`, {
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
    const response = await fetch(`${API_URL}/v1/admin/apikeys/${keyId}`, {
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
    const response = await fetch(`${API_URL}/v1/admin/apikeys/${keyId}/revoke`, {
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

// Admin API client for hooks that need axios-like interface
const createAdminApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
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
