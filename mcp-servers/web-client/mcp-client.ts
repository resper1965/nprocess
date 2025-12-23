/**
 * MCP Web Client
 *
 * TypeScript client for consuming MCP services via HTTP Gateway.
 * Can be used in any web application (React, Vue, Angular, vanilla JS, etc.)
 */

export interface MCPClientConfig {
  gatewayUrl: string;
  apiKey: string;
}

export class MCPClient {
  private gatewayUrl: string;
  private apiKey: string;

  constructor(config: MCPClientConfig) {
    this.gatewayUrl = config.gatewayUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" = "POST",
    body?: any
  ): Promise<T> {
    const response = await fetch(`${this.gatewayUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  // ============================================================================
  // ComplianceEngine Tools
  // ============================================================================

  /**
   * Generate a BPMN diagram from text description
   */
  async generateBPMNDiagram(description: string, context?: string) {
    return this.request("/v1/tools/compliance/generate_bpmn_diagram", "POST", {
      description,
      context,
    });
  }

  /**
   * Create a new business process
   */
  async createProcess(process: {
    name: string;
    description: string;
    bpmn_diagram: string;
    owner: string;
    category: string;
    tags?: string[];
  }) {
    return this.request("/v1/tools/compliance/create_process", "POST", process);
  }

  /**
   * List all business processes
   */
  async listProcesses() {
    return this.request("/v1/tools/compliance/list_processes", "GET");
  }

  /**
   * Get a specific process by ID
   */
  async getProcess(processId: string) {
    return this.request("/v1/tools/compliance/get_process", "POST", {
      process_id: processId,
    });
  }

  /**
   * Analyze a process for compliance
   */
  async analyzeCompliance(processId: string, regulationDomains: string[]) {
    return this.request("/v1/tools/compliance/analyze_compliance", "POST", {
      process_id: processId,
      regulation_domains: regulationDomains,
    });
  }

  // ============================================================================
  // RegulatoryRAG Tools
  // ============================================================================

  /**
   * Search for regulations using semantic search
   */
  async searchRegulations(
    query: string,
    options?: {
      domain?: string;
      top_k?: number;
      min_quality_score?: number;
    }
  ) {
    return this.request("/v1/tools/rag/search_regulations", "POST", {
      query,
      ...options,
    });
  }

  /**
   * Get list of available regulation domains
   */
  async listRegulationDomains() {
    return this.request("/v1/tools/rag/list_regulation_domains", "GET");
  }

  /**
   * Get a specific regulation by ID
   */
  async getRegulation(regulationId: string) {
    return this.request("/v1/tools/rag/get_regulation", "POST", {
      regulation_id: regulationId,
    });
  }

  /**
   * List all available tools
   */
  async listTools() {
    return this.request("/v1/tools", "GET");
  }
}

// ============================================================================
// Example Usage
// ============================================================================

/*
// Initialize client
const client = new MCPClient({
  gatewayUrl: 'http://localhost:3100',
  apiKey: 'ce_live_...'
});

// Example 1: Generate BPMN diagram
const diagram = await client.generateBPMNDiagram(
  'Create a customer onboarding process with KYC verification'
);
console.log('Generated diagram:', diagram);

// Example 2: Search regulations
const regulations = await client.searchRegulations(
  'data protection requirements for financial institutions',
  { domain: 'banking', top_k: 5 }
);
console.log('Found regulations:', regulations);

// Example 3: Create and analyze process
const process = await client.createProcess({
  name: 'Customer Onboarding',
  description: 'Process for onboarding new customers',
  bpmn_diagram: diagram.bpmn_xml,
  owner: 'compliance@company.com',
  category: 'onboarding'
});

const analysis = await client.analyzeCompliance(
  process.process_id,
  ['banking', 'data_privacy']
);
console.log('Compliance analysis:', analysis);
*/
