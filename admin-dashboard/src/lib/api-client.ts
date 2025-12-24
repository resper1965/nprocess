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
  api_key: string; // Only shown once on creation (matches backend response field name)
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
  warning?: string; // Optional warning message
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

// Compliance API Types
export interface ComplianceAnalyzeRequest {
  process_id: string;
  regulations?: string[];
  context?: string;
}

export interface ComplianceAnalyzeResponse {
  analysis_id: string;
  process_id: string;
  compliance_score: number;
  gaps: Array<{
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    regulation: string;
    recommendation: string;
  }>;
  suggestions: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
  }>;
  created_at: string;
}

// Diagrams API Types
export interface DiagramGenerateRequest {
  description: string;
  context?: string;
}

export interface DiagramGenerateResponse {
  normalized_text: string;
  mermaid_code: string;
  metadata: {
    actors?: string[];
    activities_count?: number;
    decision_points?: number;
  };
}

// Processes API Types
export interface ProcessCreateRequest {
  name: string;
  description: string;
  domain: string;
  mermaid_code: string;
  nodes: Array<{
    id: string;
    type: 'task' | 'event' | 'gateway';
    label: string;
    properties?: Record<string, any>;
  }>;
  flows: Array<{
    from_node: string;
    to_node: string;
    label?: string;
  }>;
  metadata?: Record<string, any>;
}

export interface ProcessResponse {
  process_id: string;
  name: string;
  description: string;
  domain: string;
  mermaid_code: string;
  nodes: Array<{
    id: string;
    type: 'task' | 'event' | 'gateway';
    label: string;
    properties?: Record<string, any>;
  }>;
  flows: Array<{
    from_node: string;
    to_node: string;
    label?: string;
  }>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Compliance API
export const complianceAPI = {
  list: async (): Promise<ComplianceAnalyzeResponse[]> => {
    const response = await apiClient.get('/v1/compliance/analyses');
    return response.data;
  },

  get: async (analysisId: string): Promise<ComplianceAnalyzeResponse> => {
    const response = await apiClient.get(`/v1/compliance/analyses/${analysisId}`);
    return response.data;
  },

  analyze: async (request: ComplianceAnalyzeRequest): Promise<ComplianceAnalyzeResponse> => {
    const response = await apiClient.post('/v1/compliance/analyze', request);
    return response.data;
  },
};

// Diagrams API
export const diagramsAPI = {
  generate: async (request: DiagramGenerateRequest): Promise<DiagramGenerateResponse> => {
    const response = await apiClient.post('/v1/diagrams/generate', request);
    return response.data;
  },
};

// Processes API
export const processesAPI = {
  list: async (): Promise<ProcessResponse[]> => {
    const response = await apiClient.get('/v1/processes');
    return response.data;
  },

  get: async (processId: string): Promise<ProcessResponse> => {
    const response = await apiClient.get(`/v1/processes/${processId}`);
    return response.data;
  },

  create: async (request: ProcessCreateRequest): Promise<ProcessResponse> => {
    const response = await apiClient.post('/v1/processes', request);
    return response.data;
  },

  update: async (processId: string, data: Partial<ProcessCreateRequest>): Promise<ProcessResponse> => {
    const response = await apiClient.put(`/v1/processes/${processId}`, data);
    return response.data;
  },

  delete: async (processId: string): Promise<void> => {
    await apiClient.delete(`/v1/processes/${processId}`);
  },
};

export default apiClient;
