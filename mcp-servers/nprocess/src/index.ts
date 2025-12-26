#!/usr/bin/env node

/**
 * n.process MCP Server
 *
 * Exposes n.process Engine stateless capabilities through the Model Context Protocol.
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

const API_BASE_URL = process.env.COMPLIANCE_API_URL || "http://localhost:8080";
const API_KEY = process.env.API_KEY || "nprocess_default_key"; // Simplified for internal use

// ============================================================================
// API Client
// ============================================================================

class ComplianceEngineClient {
  public client: AxiosInstance;

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
    const response = await this.client.post("/v1/modeling/generate", {
      description,
      context,
    });
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

const ProcessNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  properties: z.record(z.any()).optional(),
});

const ProcessFlowSchema = z.object({
  from_node: z.string(),
  to_node: z.string(),
  label: z.string().optional(),
  condition: z.string().optional(),
});

const ProcessDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  mermaid_code: z.string(),
  nodes: z.array(ProcessNodeSchema),
  flows: z.array(ProcessFlowSchema),
});

const AnalyzeComplianceSchema = z.object({
  process: ProcessDefinitionSchema.describe("Full process definition"),
  domain: z.string().describe("Regulation domain (e.g., 'LGPD', 'SOX')"),
  additional_context: z.string().optional(),
});

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new Server(
  {
    name: "nprocess-engine",
    version: "2.0.0",
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
      "Returns BPMN XML and normalized structure.",
    inputSchema: {
      type: "object",
      properties: {
        description: { type: "string" },
        context: { type: "string" },
      },
      required: ["description"],
    },
  },
  {
    name: "analyze_compliance",
    description:
      "Analyze a business process for compliance against regulatory requirements. " +
      "Accepts a full process definition (Stateless). " +
      "Returns compliance gaps, suggestions, and overall score.",
    inputSchema: {
      type: "object",
      properties: {
        process: {
            type: "object",
            description: "Process definition with mermaid_code, nodes, flows",
        },
        domain: { type: "string", description: "e.g., LGPD, GDPR" },
        additional_context: { type: "string" },
      },
      required: ["process", "domain"],
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

      case "analyze_compliance": {
        const parsed = AnalyzeComplianceSchema.parse(args);
        
        // Call the stateless analyze endpoint
        const response = await client.client.post("/v1/compliance/analyze", {
            process: parsed.process,
            domain: parsed.domain,
            additional_context: parsed.additional_context
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    if (error.response) {
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
  console.error("n.process MCP Server starting...");
  console.error(`API URL: ${API_BASE_URL}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("n.process MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
