import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://compliance-engine-5wqihg7s7a-uc.a.run.app';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor if needed
apiClient.interceptors.request.use(
  (config) => {
    // Auth token is added per request via headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface APIKeyCreate {
  name: string;
  description?: string;
  consumer_app_id: string;
  consumer_app_name?: string;
  permissions?: string[];
  quotas?: {
    requests_per_minute?: number;
    requests_per_day?: number;
    requests_per_month?: number;
  };
  expires_at?: string;
}

export interface APIKeyInfo {
  key_id: string;
  name: string;
  description?: string;
  consumer_app_id: string;
  consumer_app_name?: string;
  key_prefix: string;
  status: 'active' | 'revoked' | 'expired';
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  permissions: string[];
  quotas: {
    requests_per_minute: number;
    requests_per_day: number;
    requests_per_month: number;
  };
  usage?: {
    requests_today: number;
    requests_this_month: number;
    total_requests: number;
    last_request_at?: string;
  };
}

export interface APIKeyResponse {
  key_id: string;
  key: string; // Only shown once on creation
  name: string;
  description?: string;
  consumer_app_id: string;
  consumer_app_name?: string;
  status: 'active' | 'revoked' | 'expired';
  created_at: string;
  expires_at?: string;
  permissions: string[];
  quotas: {
    requests_per_minute: number;
    requests_per_day: number;
    requests_per_month: number;
  };
}

export interface APIKeyValidationRequest {
  api_key: string;
  required_permissions?: string[];
}

export interface APIKeyValidationResult {
  valid: boolean;
  key_id?: string;
  consumer_app_id?: string;
  consumer_app_name?: string;
  permissions?: string[];
  error?: string;
  rate_limit_remaining?: number;
}

export interface APIError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// API Keys API
export const apiKeysAPI = {
  list: async (adminToken: string): Promise<APIKeyInfo[]> => {
    const response = await apiClient.get('/v1/admin/api-keys', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response.data;
  },

  get: async (keyId: string, adminToken: string): Promise<APIKeyInfo> => {
    const response = await apiClient.get(`/v1/admin/api-keys/${keyId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response.data;
  },

  create: async (request: APIKeyCreate, adminToken: string): Promise<APIKeyResponse> => {
    const response = await apiClient.post('/v1/admin/api-keys', request, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response.data;
  },

  revoke: async (keyId: string, adminToken: string): Promise<void> => {
    await apiClient.post(
      `/v1/admin/api-keys/${keyId}/revoke`,
      {},
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
  },

  validate: async (request: APIKeyValidationRequest): Promise<APIKeyValidationResult> => {
    const response = await apiClient.post('/v1/admin/api-keys/validate', request);
    return response.data;
  },
};

export default apiClient;
