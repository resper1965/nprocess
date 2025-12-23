/**
 * MCP HTTP Gateway
 *
 * Exposes MCP servers via HTTP/SSE for web applications.
 * Acts as a bridge between web clients and STDIO-based MCP servers.
 */

import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3100;

// ============================================================================
// Configuration
// ============================================================================

const COMPLIANCE_API_URL =
  process.env.COMPLIANCE_API_URL || "http://localhost:8000";
const RAG_API_URL = process.env.RAG_API_URL || "http://localhost:8001";
const API_KEY = process.env.API_KEY || "";

// ============================================================================
// Middleware
// ============================================================================

app.use(cors());
app.use(express.json());

// API Key validation middleware
const validateApiKey = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid authorization header",
    });
  }

  // In production, validate against your API key service
  // For now, just check if it's not empty
  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({
      error: "Invalid API key",
    });
  }

  next();
};

// ============================================================================
// Health Check
// ============================================================================

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "mcp-gateway",
    version: "1.0.0",
    servers: {
      compliance_engine: COMPLIANCE_API_URL,
      regulatory_rag: RAG_API_URL,
    },
  });
});

// ============================================================================
// MCP Tool Discovery
// ============================================================================

app.get("/v1/tools", validateApiKey, async (req, res) => {
  try {
    const tools = {
      compliance_engine: [
        {
          name: "generate_bpmn_diagram",
          description: "Generate BPMN diagram from text description",
          parameters: {
            description: "string (required)",
            context: "string (optional)",
          },
        },
        {
          name: "create_process",
          description: "Create and store a new business process",
          parameters: {
            name: "string (required)",
            description: "string (required)",
            bpmn_diagram: "string (required)",
            owner: "string (required)",
            category: "string (required)",
            tags: "string[] (optional)",
          },
        },
        {
          name: "list_processes",
          description: "List all business processes",
          parameters: {},
        },
        {
          name: "get_process",
          description: "Get detailed information about a specific process",
          parameters: {
            process_id: "string (required)",
          },
        },
        {
          name: "analyze_compliance",
          description: "Analyze a process for compliance",
          parameters: {
            process_id: "string (required)",
            regulation_domains: "string[] (required)",
          },
        },
        {
          name: "list_compliance_analyses",
          description: "List all compliance analyses",
          parameters: {},
        },
        {
          name: "get_compliance_analysis",
          description: "Get detailed compliance analysis results",
          parameters: {
            analysis_id: "string (required)",
          },
        },
      ],
      regulatory_rag: [
        {
          name: "search_regulations",
          description: "Search for regulations using semantic search",
          parameters: {
            query: "string (required)",
            domain: "string (optional)",
            top_k: "number (optional, default: 10)",
            min_quality_score: "number (optional, default: 0.7)",
          },
        },
        {
          name: "list_regulation_domains",
          description: "Get list of available regulation domains",
          parameters: {},
        },
        {
          name: "get_regulation",
          description: "Get detailed information about a specific regulation",
          parameters: {
            regulation_id: "string (required)",
          },
        },
      ],
    };

    res.json(tools);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to list tools",
      message: error.message,
    });
  }
});

// ============================================================================
// ComplianceEngine Tool Endpoints
// ============================================================================

app.post(
  "/v1/tools/compliance/generate_bpmn_diagram",
  validateApiKey,
  async (req, res) => {
    try {
      const { description, context } = req.body;

      const response = await axios.post(
        `${COMPLIANCE_API_URL}/v1/diagrams/generate`,
        { description, context },
        {
          headers: API_KEY
            ? { Authorization: `Bearer ${API_KEY}` }
            : undefined,
        }
      );

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to generate diagram",
        message: error.response?.data || error.message,
      });
    }
  }
);

app.post(
  "/v1/tools/compliance/create_process",
  validateApiKey,
  async (req, res) => {
    try {
      const response = await axios.post(
        `${COMPLIANCE_API_URL}/v1/processes`,
        req.body,
        {
          headers: API_KEY
            ? { Authorization: `Bearer ${API_KEY}` }
            : undefined,
        }
      );

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to create process",
        message: error.response?.data || error.message,
      });
    }
  }
);

app.get(
  "/v1/tools/compliance/list_processes",
  validateApiKey,
  async (req, res) => {
    try {
      const response = await axios.get(`${COMPLIANCE_API_URL}/v1/processes`, {
        headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
      });

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to list processes",
        message: error.response?.data || error.message,
      });
    }
  }
);

app.post(
  "/v1/tools/compliance/get_process",
  validateApiKey,
  async (req, res) => {
    try {
      const { process_id } = req.body;

      const response = await axios.get(
        `${COMPLIANCE_API_URL}/v1/processes/${process_id}`,
        {
          headers: API_KEY
            ? { Authorization: `Bearer ${API_KEY}` }
            : undefined,
        }
      );

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to get process",
        message: error.response?.data || error.message,
      });
    }
  }
);

app.post(
  "/v1/tools/compliance/analyze_compliance",
  validateApiKey,
  async (req, res) => {
    try {
      const { process_id, regulation_domains } = req.body;

      const response = await axios.post(
        `${COMPLIANCE_API_URL}/v1/compliance/analyze`,
        { process_id, regulation_domains },
        {
          headers: API_KEY
            ? { Authorization: `Bearer ${API_KEY}` }
            : undefined,
        }
      );

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to analyze compliance",
        message: error.response?.data || error.message,
      });
    }
  }
);

// ============================================================================
// RegulatoryRAG Tool Endpoints
// ============================================================================

app.post(
  "/v1/tools/rag/search_regulations",
  validateApiKey,
  async (req, res) => {
    try {
      const { query, domain, top_k, min_quality_score } = req.body;

      const response = await axios.post(
        `${RAG_API_URL}/v1/regulations/search`,
        {
          query,
          domain,
          top_k: top_k || 10,
          min_quality_score: min_quality_score || 0.7,
        },
        {
          headers: API_KEY
            ? { Authorization: `Bearer ${API_KEY}` }
            : undefined,
        }
      );

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to search regulations",
        message: error.response?.data || error.message,
      });
    }
  }
);

app.get(
  "/v1/tools/rag/list_regulation_domains",
  validateApiKey,
  async (req, res) => {
    try {
      const response = await axios.get(
        `${RAG_API_URL}/v1/regulations/domains`,
        {
          headers: API_KEY
            ? { Authorization: `Bearer ${API_KEY}` }
            : undefined,
        }
      );

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: "Failed to list domains",
        message: error.response?.data || error.message,
      });
    }
  }
);

app.post("/v1/tools/rag/get_regulation", validateApiKey, async (req, res) => {
  try {
    const { regulation_id } = req.body;

    const response = await axios.get(
      `${RAG_API_URL}/v1/regulations/${regulation_id}`,
      {
        headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
      }
    );

    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: "Failed to get regulation",
      message: error.response?.data || error.message,
    });
  }
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`MCP HTTP Gateway running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Tools list: http://localhost:${PORT}/v1/tools`);
  console.log("");
  console.log("Connected to:");
  console.log(`  - ComplianceEngine API: ${COMPLIANCE_API_URL}`);
  console.log(`  - RegulatoryRAG API: ${RAG_API_URL}`);
});
