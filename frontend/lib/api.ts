/**
 * Cliente da API ComplianceEngine
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://compliance-engine-273624403528.us-central1.run.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutos para análises longas
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos
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

export interface ProcessCreateResponse {
  process_id: string;
  created_at: string;
  message: string;
}

export interface Process {
  process_id: string;
  name: string;
  description: string;
  domain: string;
  mermaid_code: string;
  nodes: any[];
  flows: any[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface ComplianceAnalyzeRequest {
  process_id: string;
  domain: string;
  additional_context?: string;
}

export interface ComplianceGap {
  gap_id: string;
  severity: 'high' | 'medium' | 'low';
  regulation: string;
  article?: string;
  description: string;
  affected_nodes?: string[];
  recommendation: string;
}

export interface ComplianceSuggestion {
  suggestion_id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimated_effort?: string;
}

export interface ComplianceAnalyzeResponse {
  analysis_id: string;
  process_id: string;
  domain: string;
  analyzed_at: string;
  overall_score: number;
  summary: string;
  gaps: ComplianceGap[];
  suggestions: ComplianceSuggestion[];
}

// Funções da API
export const apiClient = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },

  // Gerar diagrama
  async generateDiagram(data: DiagramGenerateRequest): Promise<DiagramGenerateResponse> {
    const response = await api.post<DiagramGenerateResponse>('/v1/diagrams/generate', data);
    return response.data;
  },

  // Criar processo
  async createProcess(data: ProcessCreateRequest): Promise<ProcessCreateResponse> {
    const response = await api.post<ProcessCreateResponse>('/v1/processes', data);
    return response.data;
  },

  // Listar processos
  async listProcesses(limit = 100, domain?: string): Promise<Process[]> {
    const params: any = { limit };
    if (domain) params.domain = domain;
    const response = await api.get<Process[]>('/v1/processes', { params });
    return response.data;
  },

  // Obter processo
  async getProcess(processId: string): Promise<Process> {
    const response = await api.get<Process>(`/v1/processes/${processId}`);
    return response.data;
  },

  // Analisar compliance
  async analyzeCompliance(data: ComplianceAnalyzeRequest): Promise<ComplianceAnalyzeResponse> {
    const response = await api.post<ComplianceAnalyzeResponse>('/v1/compliance/analyze', data);
    return response.data;
  },

  // Obter análise
  async getAnalysis(analysisId: string): Promise<ComplianceAnalyzeResponse> {
    const response = await api.get<ComplianceAnalyzeResponse>(`/v1/compliance/analyses/${analysisId}`);
    return response.data;
  },
};


