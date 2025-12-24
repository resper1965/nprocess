#!/usr/bin/env node

/**
 * Regulatory Intelligence Crawler MCP Server
 *
 * Exposes Regulatory Intelligence Crawler capabilities through the Model Context Protocol.
 * Monitors Brazilian regulatory sources (ANEEL, ONS, ARCyber) for compliance updates.
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

const API_BASE_URL = process.env.CRAWLER_API_URL || "http://localhost:8003";
const API_KEY = process.env.API_KEY || "";

// ============================================================================
// API Client
// ============================================================================

class RegulatoryIntelligenceCrawlerClient {
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
      timeout: 180000, // 180 seconds (crawling can be slow)
    });
  }

  async triggerCrawl(sources?: string[]) {
    const response = await this.client.post("/v1/crawlers/run", null, {
      params: sources ? { sources: sources.join(",") } : {},
    });
    return response.data;
  }

  async getCrawlerStatus() {
    const response = await this.client.get("/v1/crawlers/status");
    return response.data;
  }

  async listUpdates(params: {
    source?: string;
    impact_level?: string;
    since_date?: string;
    limit?: number;
  }) {
    const response = await this.client.get("/v1/updates", { params });
    return response.data;
  }

  async getUpdate(updateId: string) {
    const response = await this.client.get(`/v1/updates/${updateId}`);
    return response.data;
  }

  async analyzeImpact(
    updateId: string,
    companyContext: Record<string, any>,
    existingProcesses?: string[]
  ) {
    const response = await this.client.post(`/v1/updates/${updateId}/analyze`, {
      company_context: companyContext,
      existing_processes: existingProcesses,
    });
    return response.data;
  }

  async sendNotification(params: {
    update_id: string;
    channels: string[];
    recipients: string[];
    priority: string;
  }) {
    const response = await this.client.post("/v1/notifications/send", params);
    return response.data;
  }

  async configureSource(config: {
    source_id: string;
    url: string;
    crawl_frequency: string;
    selectors: Record<string, string>;
  }) {
    const response = await this.client.post("/v1/config/sources", config);
    return response.data;
  }
}

// ============================================================================
// Tool Schemas
// ============================================================================

const TriggerCrawlSchema = z.object({
  sources: z
    .array(z.enum(["aneel", "ons", "arcyber", "ans"]))
    .optional()
    .describe("List of sources to crawl. If not provided, crawls all sources."),
});

const ListUpdatesSchema = z.object({
  source: z
    .enum(["aneel", "ons", "arcyber", "ans"])
    .optional()
    .describe("Filter by source"),
  impact_level: z
    .enum(["critical", "high", "medium", "low"])
    .optional()
    .describe("Filter by impact level"),
  since_date: z
    .string()
    .optional()
    .describe("Filter updates since this date (ISO format: YYYY-MM-DD)"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Maximum number of results"),
});

const GetUpdateDetailsSchema = z.object({
  update_id: z.string().describe("Unique identifier of the regulatory update"),
});

const AnalyzeImpactSchema = z.object({
  update_id: z.string().describe("Unique identifier of the regulatory update"),
  company_context: z
    .object({
      company_name: z.string().optional(),
      sector: z.string().optional(),
      size: z.string().optional(),
      operations: z.array(z.string()).optional(),
    })
    .describe("Company context for impact analysis"),
  existing_processes: z
    .array(z.string())
    .optional()
    .describe("List of existing process IDs to check impact"),
});

const SubscribeNotificationsSchema = z.object({
  update_id: z.string().describe("Update ID to receive notifications for"),
  channels: z
    .array(z.enum(["email", "slack", "webhook"]))
    .describe("Notification channels"),
  recipients: z.array(z.string()).describe("List of recipient addresses/URLs"),
  priority: z
    .enum(["critical", "high", "medium", "low"])
    .default("medium")
    .describe("Notification priority"),
});

// ============================================================================
// MCP Tools
// ============================================================================

const tools: Tool[] = [
  {
    name: "trigger_crawl",
    description:
      "Trigger manual crawl of Brazilian regulatory sources (ANEEL, ONS, ARCyber, ANS). " +
      "Searches for new regulatory publications, updates, and compliance changes. " +
      "Useful for getting the latest regulations immediately instead of waiting for scheduled crawls. " +
      "The crawler uses Gemini AI to analyze relevance and extract structured metadata.",
    inputSchema: {
      type: "object",
      properties: {
        sources: {
          type: "array",
          items: {
            type: "string",
            enum: ["aneel", "ons", "arcyber", "ans"],
          },
          description:
            "List of sources to crawl. Options: aneel (energia), ons (operador), " +
            "arcyber (cibersegurança), ans (saúde suplementar). " +
            "If not provided, crawls all sources.",
        },
      },
    },
  },
  {
    name: "get_crawler_status",
    description:
      "Get current status of all regulatory crawlers. " +
      "Shows last crawl time, number of updates found, success/failure status, " +
      "and next scheduled crawl. Useful for monitoring crawler health and activity.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_updates",
    description:
      "List regulatory updates from Brazilian sources with optional filters. " +
      "Returns updates sorted by publication date (newest first). " +
      "Each update includes: title, source, publication date, impact level, summary, and document URL. " +
      "Use filters to narrow down to specific sources, impact levels, or date ranges.",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          enum: ["aneel", "ons", "arcyber", "ans"],
          description: "Filter by regulatory source",
        },
        impact_level: {
          type: "string",
          enum: ["critical", "high", "medium", "low"],
          description: "Filter by impact level (determined by Gemini AI analysis)",
        },
        since_date: {
          type: "string",
          description: "Filter updates since this date (ISO format: YYYY-MM-DD)",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 50, max: 100)",
        },
      },
    },
  },
  {
    name: "get_update_details",
    description:
      "Get detailed information about a specific regulatory update. " +
      "Includes full text summary, AI-generated impact analysis, affected sectors, " +
      "compliance deadlines, and links to original documents. " +
      "Use this after list_updates to get comprehensive details about an update of interest.",
    inputSchema: {
      type: "object",
      properties: {
        update_id: {
          type: "string",
          description: "Unique identifier of the regulatory update",
        },
      },
      required: ["update_id"],
    },
  },
  {
    name: "analyze_impact",
    description:
      "Analyze the impact of a regulatory update on your company's operations. " +
      "Uses Gemini AI to assess: required process changes, affected controls, " +
      "compliance gaps, recommended actions, and estimated effort. " +
      "Provide company context (sector, operations) for more accurate analysis.",
    inputSchema: {
      type: "object",
      properties: {
        update_id: {
          type: "string",
          description: "Unique identifier of the regulatory update",
        },
        company_context: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            sector: {
              type: "string",
              description: "e.g., 'energy', 'healthcare', 'financial_services'",
            },
            size: { type: "string", description: "e.g., 'small', 'medium', 'large'" },
            operations: {
              type: "array",
              items: { type: "string" },
              description: "List of operations (e.g., ['energy_distribution', 'generation'])",
            },
          },
          description: "Company context for tailored impact analysis",
        },
        existing_processes: {
          type: "array",
          items: { type: "string" },
          description: "List of existing process IDs to check if they're affected",
        },
      },
      required: ["update_id", "company_context"],
    },
  },
  {
    name: "subscribe_notifications",
    description:
      "Subscribe to notifications for a specific regulatory update. " +
      "Get alerts when there are changes or new information about the update. " +
      "Supports multiple channels: email, Slack, and webhooks. " +
      "Set priority to control urgency of notifications.",
    inputSchema: {
      type: "object",
      properties: {
        update_id: {
          type: "string",
          description: "Update ID to receive notifications for",
        },
        channels: {
          type: "array",
          items: {
            type: "string",
            enum: ["email", "slack", "webhook"],
          },
          description: "Notification channels to use",
        },
        recipients: {
          type: "array",
          items: { type: "string" },
          description:
            "List of recipient addresses (emails, Slack channels, webhook URLs)",
        },
        priority: {
          type: "string",
          enum: ["critical", "high", "medium", "low"],
          description: "Notification priority (default: medium)",
        },
      },
      required: ["update_id", "channels", "recipients"],
    },
  },
];

// ============================================================================
// MCP Server
// ============================================================================

const server = new Server(
  {
    name: "regulatory-crawler-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize API client
const client = new RegulatoryIntelligenceCrawlerClient(API_BASE_URL, API_KEY);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "trigger_crawl": {
        const parsed = TriggerCrawlSchema.parse(args);
        const result = await client.triggerCrawl(parsed.sources);

        const summary = {
          crawl_triggered: new Date().toISOString(),
          sources_crawled: parsed.sources || ["aneel", "ons", "arcyber", "ans"],
          updates_found: result.length,
          updates: result.map((u: any) => ({
            update_id: u.update_id,
            source: u.source,
            title: u.title,
            publication_date: u.publication_date,
            impact_level: u.impact_level,
            summary: u.summary?.substring(0, 200) + "...",
          })),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }

      case "get_crawler_status": {
        const result = await client.getCrawlerStatus();

        const formattedStatus = result.map((status: any) => ({
          source: status.source,
          status: status.status,
          last_crawl: status.last_crawl_time,
          updates_found: status.updates_found,
          next_crawl: status.next_scheduled_crawl,
          health: status.error_count === 0 ? "healthy" : "degraded",
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ crawlers: formattedStatus }, null, 2),
            },
          ],
        };
      }

      case "list_updates": {
        const parsed = ListUpdatesSchema.parse(args);
        const result = await client.listUpdates({
          source: parsed.source,
          impact_level: parsed.impact_level,
          since_date: parsed.since_date,
          limit: parsed.limit,
        });

        const summary = {
          total_updates: result.length,
          filters_applied: {
            source: parsed.source || "all",
            impact_level: parsed.impact_level || "all",
            since_date: parsed.since_date || "all_time",
          },
          updates: result.map((u: any) => ({
            update_id: u.update_id,
            source: u.source,
            title: u.title,
            publication_date: u.publication_date,
            impact_level: u.impact_level,
            document_type: u.document_type,
            summary: u.summary?.substring(0, 150) + "...",
            url: u.document_url,
          })),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }

      case "get_update_details": {
        const parsed = GetUpdateDetailsSchema.parse(args);
        const result = await client.getUpdate(parsed.update_id);

        const details = {
          update_id: result.update_id,
          source: result.source,
          title: result.title,
          document_type: result.document_type,
          publication_date: result.publication_date,
          impact_level: result.impact_level,
          full_summary: result.summary,
          affected_sectors: result.affected_sectors,
          compliance_deadlines: result.compliance_deadlines,
          key_changes: result.key_changes,
          document_url: result.document_url,
          crawled_at: result.crawled_at,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(details, null, 2),
            },
          ],
        };
      }

      case "analyze_impact": {
        const parsed = AnalyzeImpactSchema.parse(args);
        const result = await client.analyzeImpact(
          parsed.update_id,
          parsed.company_context,
          parsed.existing_processes
        );

        const analysis = {
          update_id: parsed.update_id,
          company: parsed.company_context.company_name,
          analysis: {
            impact_assessment: result.impact_assessment,
            affected_processes: result.affected_processes,
            required_changes: result.required_changes,
            compliance_gaps: result.compliance_gaps,
            recommended_actions: result.recommended_actions,
            estimated_effort: result.estimated_effort,
            deadline: result.compliance_deadline,
          },
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case "subscribe_notifications": {
        const parsed = SubscribeNotificationsSchema.parse(args);
        const result = await client.sendNotification({
          update_id: parsed.update_id,
          channels: parsed.channels,
          recipients: parsed.recipients,
          priority: parsed.priority || "medium",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "subscribed",
                  update_id: parsed.update_id,
                  channels: parsed.channels,
                  recipients_count: parsed.recipients.length,
                  priority: parsed.priority || "medium",
                  message: "You will receive notifications when there are updates.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
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
});

// ============================================================================
// Main
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Regulatory Intelligence Crawler MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
