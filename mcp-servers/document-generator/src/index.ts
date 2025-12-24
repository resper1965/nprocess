#!/usr/bin/env node

/**
 * Document Generator MCP Server
 *
 * Exposes Document Generator Engine capabilities through the Model Context Protocol.
 * Generates compliance documentation in Markdown format with Mermaid diagrams.
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

const API_BASE_URL = process.env.DOC_GEN_API_URL || "http://localhost:8004";
const API_KEY = process.env.API_KEY || "";

// ============================================================================
// API Client
// ============================================================================

class DocumentGeneratorClient {
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
      timeout: 120000, // 120 seconds (document generation can be slow)
    });
  }

  async generateDocuments(request: {
    process_id: string;
    process_name: string;
    bpmn_xml: string;
    controls_addressed?: string[];
    evidences_configured?: Record<string, any>;
    company_context?: Record<string, any>;
    document_types?: string[];
    export_format?: string;
  }) {
    const response = await this.client.post("/v1/documents/generate", request);
    return response.data;
  }

  async convertBpmnToMermaid(bpmn_xml: string) {
    const response = await this.client.post("/v1/convert/bpmn-to-mermaid", {
      bpmn_xml,
    });
    return response.data;
  }

  async exportAuditPackage(process_id: string, control_id: string, format: string = "zip") {
    const response = await this.client.post("/v1/documents/export-package", null, {
      params: {
        process_id,
        control_id,
        format,
      },
      responseType: "arraybuffer",
    });
    return response.data;
  }

  async listTemplates() {
    const response = await this.client.get("/v1/templates");
    return response.data;
  }
}

// ============================================================================
// Tool Schemas
// ============================================================================

const GenerateDocumentsSchema = z.object({
  process_id: z.string().describe("Unique identifier for the process"),
  process_name: z.string().describe("Human-readable name of the process"),
  bpmn_xml: z.string().describe("BPMN 2.0 XML content"),
  controls_addressed: z
    .array(z.string())
    .optional()
    .describe("List of control IDs addressed by this process (e.g., ['ISO27001:A.8.7', 'SOC2:CC6.1'])"),
  evidences_configured: z
    .record(z.any())
    .optional()
    .describe("Evidence configuration mapping control IDs to evidence types"),
  company_context: z
    .record(z.any())
    .optional()
    .describe("Company-specific context (name, sector, policies)"),
  document_types: z
    .array(z.string())
    .optional()
    .describe("Types of documents to generate: 'procedure', 'work_instruction', 'checklist'"),
  export_format: z
    .string()
    .optional()
    .default("markdown")
    .describe("Export format: 'markdown' or 'bundle'"),
});

const ConvertBpmnToMermaidSchema = z.object({
  bpmn_xml: z.string().describe("BPMN 2.0 XML content to convert to Mermaid flowchart"),
});

const ExportPackageSchema = z.object({
  process_id: z.string().describe("Process identifier"),
  control_id: z.string().describe("Control identifier (e.g., 'ISO27001:A.8.7')"),
  format: z
    .string()
    .optional()
    .default("zip")
    .describe("Package format: 'zip' or 'tar.gz'"),
});

// ============================================================================
// MCP Tools
// ============================================================================

const tools: Tool[] = [
  {
    name: "generate_documents",
    description:
      "Generate compliance documentation from BPMN process. " +
      "Produces POPs (Standard Operating Procedures), Work Instructions, and Audit Checklists " +
      "in Markdown format with Mermaid diagrams. " +
      "Documents are Git-friendly, versionable, and renderable in GitHub/GitLab. " +
      "Use this to create documentation for validated processes that address compliance controls.",
    inputSchema: {
      type: "object",
      properties: {
        process_id: {
          type: "string",
          description: "Unique identifier for the process",
        },
        process_name: {
          type: "string",
          description: "Human-readable name of the process (e.g., 'Instalação de Antivírus Corporativo')",
        },
        bpmn_xml: {
          type: "string",
          description: "BPMN 2.0 XML content (output from BPMN Generation Engine)",
        },
        controls_addressed: {
          type: "array",
          items: { type: "string" },
          description:
            "List of compliance controls addressed (e.g., ['ISO27001:A.8.7', 'SOC2:CC6.1', 'LGPD:Art.46'])",
        },
        evidences_configured: {
          type: "object",
          description: "Evidence configuration for controls (optional)",
        },
        company_context: {
          type: "object",
          description:
            "Company context: {company_name, sector, existing_policies} (optional)",
        },
        document_types: {
          type: "array",
          items: {
            type: "string",
            enum: ["procedure", "work_instruction", "checklist"],
          },
          description: "Types of documents to generate (default: all types)",
        },
        export_format: {
          type: "string",
          enum: ["markdown", "bundle"],
          description: "Export format (default: markdown)",
        },
      },
      required: ["process_id", "process_name", "bpmn_xml"],
    },
  },
  {
    name: "convert_bpmn_to_mermaid",
    description:
      "Convert BPMN 2.0 XML to Mermaid flowchart syntax. " +
      "Useful for embedding process diagrams in Markdown documentation, " +
      "creating visual representations for GitHub README files, or " +
      "generating diagrams for Confluence pages. " +
      "Output is Git-friendly and renders automatically in most modern platforms.",
    inputSchema: {
      type: "object",
      properties: {
        bpmn_xml: {
          type: "string",
          description: "BPMN 2.0 XML content to convert",
        },
      },
      required: ["bpmn_xml"],
    },
  },
  {
    name: "export_package",
    description:
      "Export complete audit package for a control. " +
      "Packages all generated documents (POPs, Work Instructions, Checklists) " +
      "plus configured evidences into a single downloadable archive. " +
      "Use this when preparing for audits or when delivering compliance documentation packages. " +
      "Output format can be ZIP or tar.gz.",
    inputSchema: {
      type: "object",
      properties: {
        process_id: {
          type: "string",
          description: "Process identifier",
        },
        control_id: {
          type: "string",
          description: "Control identifier (e.g., 'ISO27001:A.8.7')",
        },
        format: {
          type: "string",
          enum: ["zip", "tar.gz"],
          description: "Package format (default: zip)",
        },
      },
      required: ["process_id", "control_id"],
    },
  },
  {
    name: "list_templates",
    description:
      "List available document templates. " +
      "Shows all available templates for procedures, work instructions, and checklists. " +
      "Templates are framework-specific (ISO 27001, SOC2, PCI-DSS, LGPD, etc.) " +
      "or generic. Use this to discover what document types can be generated.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// ============================================================================
// MCP Server
// ============================================================================

const server = new Server(
  {
    name: "document-generator-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize API client
const client = new DocumentGeneratorClient(API_BASE_URL, API_KEY);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "generate_documents": {
        const parsed = GenerateDocumentsSchema.parse(args);
        const result = await client.generateDocuments({
          process_id: parsed.process_id,
          process_name: parsed.process_name,
          bpmn_xml: parsed.bpmn_xml,
          controls_addressed: parsed.controls_addressed,
          evidences_configured: parsed.evidences_configured,
          company_context: parsed.company_context,
          document_types: parsed.document_types,
          export_format: parsed.export_format,
        });

        // Format response with document summary
        const summary = {
          process_id: parsed.process_id,
          process_name: parsed.process_name,
          documents_generated: result.length,
          documents: result.map((doc: any) => ({
            type: doc.document_type,
            format: doc.format,
            filename: doc.filename,
            size_bytes: doc.size_bytes,
            download_url: doc.download_url,
          })),
          controls_covered: parsed.controls_addressed || [],
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

      case "convert_bpmn_to_mermaid": {
        const parsed = ConvertBpmnToMermaidSchema.parse(args);
        const result = await client.convertBpmnToMermaid(parsed.bpmn_xml);

        return {
          content: [
            {
              type: "text",
              text:
                "```mermaid\n" +
                result.mermaid +
                "\n```\n\n" +
                "You can embed this Mermaid diagram directly in Markdown files. " +
                "It will render automatically on GitHub, GitLab, and Confluence.",
            },
          ],
        };
      }

      case "export_package": {
        const parsed = ExportPackageSchema.parse(args);
        const result = await client.exportAuditPackage(
          parsed.process_id,
          parsed.control_id,
          parsed.format || "zip"
        );

        // Note: In a real MCP implementation, we'd return a base64-encoded file
        // For now, we return metadata
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  process_id: parsed.process_id,
                  control_id: parsed.control_id,
                  format: parsed.format || "zip",
                  package_size_bytes: result.byteLength,
                  message:
                    "Audit package generated successfully. " +
                    "Package includes all documentation (POPs, Work Instructions, Checklists) " +
                    "and configured evidences for control " +
                    parsed.control_id,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_templates": {
        const result = await client.listTemplates();

        const formattedTemplates = {
          procedures: result.procedures.map((t: string) => ({
            id: t,
            description: getTemplateDescription(t, "procedure"),
          })),
          work_instructions: result.work_instructions.map((t: string) => ({
            id: t,
            description: getTemplateDescription(t, "work_instruction"),
          })),
          checklists: result.checklists.map((t: string) => ({
            id: t,
            description: getTemplateDescription(t, "checklist"),
          })),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formattedTemplates, null, 2),
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

// Helper function to get template descriptions
function getTemplateDescription(templateId: string, type: string): string {
  const descriptions: Record<string, string> = {
    iso27001_control_procedure: "ISO 27001 control implementation procedure",
    soc2_control_procedure: "SOC2 control implementation procedure",
    pci_dss_requirement_procedure: "PCI-DSS requirement implementation procedure",
    generic_procedure: "Generic procedure template (framework-agnostic)",
    technical_instruction: "Technical work instruction for IT tasks",
    operational_instruction: "Operational work instruction for business processes",
    administrative_instruction: "Administrative work instruction for governance tasks",
    audit_checklist: "Audit verification checklist",
    compliance_checklist: "Compliance assessment checklist",
    verification_checklist: "Control verification checklist",
  };

  return descriptions[templateId] || `${type}: ${templateId}`;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Document Generator MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
