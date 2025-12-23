#!/usr/bin/env node

/**
 * RegulatoryRAG MCP Server
 *
 * Exposes RegulatoryRAG API capabilities through the Model Context Protocol.
 * Provides semantic search over regulatory documents using Vertex AI Search.
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

const API_BASE_URL = process.env.RAG_API_URL || "http://localhost:8001";
const API_KEY = process.env.API_KEY || "";

// ============================================================================
// API Client
// ============================================================================

class RegulatoryRAGClient {
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

  async searchRegulations(
    query: string,
    domain?: string,
    topK: number = 10,
    minQualityScore: number = 0.7
  ) {
    const response = await this.client.post("/v1/regulations/search", {
      query,
      domain,
      top_k: topK,
      min_quality_score: minQualityScore,
    });
    return response.data;
  }

  async getRegulationDomains() {
    const response = await this.client.get("/v1/regulations/domains");
    return response.data;
  }

  async getRegulation(regulationId: string) {
    const response = await this.client.get(`/v1/regulations/${regulationId}`);
    return response.data;
  }
}

// ============================================================================
// Tool Schemas
// ============================================================================

const SearchRegulationsSchema = z.object({
  query: z.string().min(3).describe("Search query in natural language"),
  domain: z
    .string()
    .optional()
    .describe(
      "Filter by regulation domain (e.g., 'banking', 'healthcare', 'data_privacy')"
    ),
  top_k: z
    .number()
    .min(1)
    .max(50)
    .default(10)
    .describe("Number of top results to return (1-50)"),
  min_quality_score: z
    .number()
    .min(0)
    .max(1)
    .default(0.7)
    .describe("Minimum quality score threshold (0.0 to 1.0)"),
});

const GetRegulationSchema = z.object({
  regulation_id: z
    .string()
    .describe("Unique identifier of the regulation to retrieve"),
});

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new Server(
  {
    name: "regulatory-rag",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const client = new RegulatoryRAGClient(API_BASE_URL, API_KEY);

// ============================================================================
// Tool Definitions
// ============================================================================

const tools: Tool[] = [
  {
    name: "search_regulations",
    description:
      "Search for regulations using semantic search powered by Vertex AI. " +
      "Provide a natural language query and optionally filter by domain. " +
      "Returns relevant regulations with quality scores, content snippets, and metadata. " +
      "Use this to find regulations related to specific topics, requirements, or compliance needs.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query in natural language (e.g., 'data protection requirements for financial institutions')",
        },
        domain: {
          type: "string",
          description:
            "Optional domain filter (banking, healthcare, data_privacy, labor, tax, etc.)",
        },
        top_k: {
          type: "number",
          description: "Number of top results to return (default: 10, max: 50)",
          default: 10,
        },
        min_quality_score: {
          type: "number",
          description:
            "Minimum quality/relevance score (0.0 to 1.0, default: 0.7)",
          default: 0.7,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_regulation_domains",
    description:
      "Get a list of all available regulation domains. " +
      "Use this to discover which regulatory areas are covered in the knowledge base. " +
      "Returns an array of domain names that can be used to filter searches.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_regulation",
    description:
      "Retrieve detailed information about a specific regulation by its ID. " +
      "Returns the complete regulation document including full content, metadata, and references. " +
      "Use this after finding regulations via search to get complete details.",
    inputSchema: {
      type: "object",
      properties: {
        regulation_id: {
          type: "string",
          description: "Unique identifier of the regulation",
        },
      },
      required: ["regulation_id"],
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
      case "search_regulations": {
        const parsed = SearchRegulationsSchema.parse(args);
        const result = await client.searchRegulations(
          parsed.query,
          parsed.domain,
          parsed.top_k,
          parsed.min_quality_score
        );

        // Format results for better readability
        const formattedResults = {
          query: result.query,
          total_results: result.total_results,
          returned_results: result.returned_results,
          results: result.results.map((r: any) => ({
            id: r.regulation_id,
            title: r.title,
            authority: r.authority,
            document_number: r.document_number,
            quality_score: r.quality_score,
            snippet: r.content_snippet,
            domain: r.domain,
            url: r.url,
          })),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formattedResults, null, 2),
            },
          ],
        };
      }

      case "list_regulation_domains": {
        const result = await client.getRegulationDomains();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  domains: result,
                  count: result.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_regulation": {
        const parsed = GetRegulationSchema.parse(args);
        const result = await client.getRegulation(parsed.regulation_id);
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
  console.error("RegulatoryRAG MCP Server starting...");
  console.error(`API URL: ${API_BASE_URL}`);
  console.error(`API Key: ${API_KEY ? "Set" : "Not set"}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("RegulatoryRAG MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
