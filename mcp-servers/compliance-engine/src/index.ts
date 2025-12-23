#!/usr/bin/env node

/**
 * ComplianceEngine MCP Server
 *
 * Exposes ComplianceEngine API capabilities through the Model Context Protocol.
 * Supports both STDIO (for desktop apps) and HTTP/SSE (for web apps via gateway).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";
import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.COMPLIANCE_API_URL || "http://localhost:8000";
const API_KEY = process.env.API_KEY;

// ============================================================================
// API Key Validation
// ============================================================================

if (!API_KEY) {
  console.error('❌ ERROR: API_KEY environment variable is required!');
  console.error('Set API_KEY=ce_live_... or ce_test_... before starting the MCP server.');
  console.error('');
  console.error('Example:');
  console.error('  export API_KEY=ce_live_1234567890abcdef...');
  console.error('  node src/index.ts');
  process.exit(1);
}

// Validate format
if (!API_KEY.startsWith('ce_live_') && !API_KEY.startsWith('ce_test_')) {
  console.error('❌ ERROR: Invalid API key format!');
  console.error('API key must start with "ce_live_" or "ce_test_"');
  console.error('');
  console.error(`Received: ${API_KEY.substring(0, 20)}...`);
  process.exit(1);
}

// ============================================================================
// API Client
// ============================================================================

class ComplianceEngineClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey?: string) {
    this.client = axios.create({
      baseURL,
      headers: apiKey
        ? {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          },
      timeout: 60000, // 60 seconds
    });
  }

  async generateDiagram(description: string, context?: string) {
    const response = await this.client.post("/v1/diagrams/generate", {
      description,
      context,
    });
    return response.data;
  }

  async createProcess(data: {
    name: string;
    description: string;
    bpmn_diagram: string;
    owner: string;
    category: string;
    tags?: string[];
  }) {
    const response = await this.client.post("/v1/processes", data);
    return response.data;
  }

  async listProcesses() {
    const response = await this.client.get("/v1/processes");
    return response.data;
  }

  async getProcess(processId: string) {
    const response = await this.client.get(`/v1/processes/${processId}`);
    return response.data;
  }

  async analyzeCompliance(processId: string, regulationDomains: string[]) {
    const response = await this.client.post("/v1/compliance/analyze", {
      process_id: processId,
      regulation_domains: regulationDomains,
    });
    return response.data;
  }

  async listComplianceAnalyses() {
    const response = await this.client.get("/v1/compliance/analyses");
    return response.data;
  }

  async getComplianceAnalysis(analysisId: string) {
    const response = await this.client.get(
      `/v1/compliance/analyses/${analysisId}`
    );
    return response.data;
  }
}

// ============================================================================
// Tool Schemas
// ============================================================================

const GenerateDiagramSchema = z.object({
  description: z
    .string()
    .min(10)
    .describe("Detailed description of the business process"),
  context: z
    .string()
    .optional()
    .describe("Additional context about the organization or domain"),
});

const CreateProcessSchema = z.object({
  name: z.string().min(3).describe("Process name"),
  description: z.string().describe("Process description"),
  bpmn_diagram: z.string().describe("BPMN XML diagram"),
  owner: z.string().describe("Process owner (email or name)"),
  category: z.string().describe("Process category"),
  tags: z.array(z.string()).optional().describe("Process tags"),
});

const AnalyzeComplianceSchema = z.object({
  process_id: z.string().describe("ID of the process to analyze"),
  regulation_domains: z
    .array(z.string())
    .describe("List of regulation domains (e.g., 'banking', 'healthcare')"),
});

const GetProcessSchema = z.object({
  process_id: z.string().describe("ID of the process to retrieve"),
});

const GetComplianceAnalysisSchema = z.object({
  analysis_id: z.string().describe("ID of the compliance analysis to retrieve"),
});

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new Server(
  {
    name: "compliance-engine",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const client = new ComplianceEngineClient(API_BASE_URL, API_KEY);

// ============================================================================
// Tool Definitions
// ============================================================================

const tools: Tool[] = [
  {
    name: "generate_bpmn_diagram",
    description:
      "Generate a BPMN diagram from a text description of a business process. " +
      "Returns BPMN XML and SVG preview. Use this when you need to create a visual representation of a process.",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "Detailed description of the business process",
        },
        context: {
          type: "string",
          description: "Additional context about the organization or domain",
        },
      },
      required: ["description"],
    },
  },
  {
    name: "create_process",
    description:
      "Create and store a new business process in the system. " +
      "Requires a BPMN diagram (can be generated first with generate_bpmn_diagram). " +
      "Returns the created process with ID for future reference.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Process name" },
        description: { type: "string", description: "Process description" },
        bpmn_diagram: { type: "string", description: "BPMN XML diagram" },
        owner: { type: "string", description: "Process owner (email or name)" },
        category: { type: "string", description: "Process category" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Process tags",
        },
      },
      required: ["name", "description", "bpmn_diagram", "owner", "category"],
    },
  },
  {
    name: "list_processes",
    description:
      "List all business processes stored in the system. " +
      "Returns an array of processes with basic information.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_process",
    description:
      "Get detailed information about a specific process by its ID. " +
      "Returns complete process data including BPMN diagram.",
    inputSchema: {
      type: "object",
      properties: {
        process_id: {
          type: "string",
          description: "ID of the process to retrieve",
        },
      },
      required: ["process_id"],
    },
  },
  {
    name: "analyze_compliance",
    description:
      "Analyze a business process for compliance against regulatory requirements. " +
      "Uses AI to identify compliance gaps and provide recommendations. " +
      "Requires regulatory data to be available (via RegulatoryRAG).",
    inputSchema: {
      type: "object",
      properties: {
        process_id: {
          type: "string",
          description: "ID of the process to analyze",
        },
        regulation_domains: {
          type: "array",
          items: { type: "string" },
          description:
            "List of regulation domains (e.g., 'banking', 'healthcare', 'data_privacy')",
        },
      },
      required: ["process_id", "regulation_domains"],
    },
  },
  {
    name: "list_compliance_analyses",
    description:
      "List all compliance analyses performed in the system. " +
      "Returns an array of analyses with summary information.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_compliance_analysis",
    description:
      "Get detailed results of a specific compliance analysis by its ID. " +
      "Returns complete analysis including gaps, scores, and recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        analysis_id: {
          type: "string",
          description: "ID of the compliance analysis to retrieve",
        },
      },
      required: ["analysis_id"],
    },
  },
];

// ============================================================================
// Request Handlers
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "generate_bpmn_diagram": {
        const parsed = GenerateDiagramSchema.parse(args);
        const result = await client.generateDiagram(
          parsed.description,
          parsed.context
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "create_process": {
        const parsed = CreateProcessSchema.parse(args);
        const result = await client.createProcess(parsed);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_processes": {
        const result = await client.listProcesses();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_process": {
        const parsed = GetProcessSchema.parse(args);
        const result = await client.getProcess(parsed.process_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "analyze_compliance": {
        const parsed = AnalyzeComplianceSchema.parse(args);
        const result = await client.analyzeCompliance(
          parsed.process_id,
          parsed.regulation_domains
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_compliance_analyses": {
        const result = await client.listComplianceAnalyses();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_compliance_analysis": {
        const parsed = GetComplianceAnalysisSchema.parse(args);
        const result = await client.getComplianceAnalysis(parsed.analysis_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    if (error.response) {
      // API error
      return {
        content: [
          {
            type: "text",
            text: `API Error: ${error.response.status} - ${JSON.stringify(
              error.response.data
            )}`,
          },
        ],
        isError: true,
      };
    } else if (error instanceof z.ZodError) {
      // Validation error
      return {
        content: [
          {
            type: "text",
            text: `Validation Error: ${JSON.stringify(error.errors)}`,
          },
        ],
        isError: true,
      };
    } else {
      // Other error
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
});

// ============================================================================
// Start Server
// ============================================================================

async function main() {
  console.error("ComplianceEngine MCP Server starting...");
  console.error(`API URL: ${API_BASE_URL}`);
  console.error(`API Key: ${API_KEY ? "Set" : "Not set"}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("ComplianceEngine MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
