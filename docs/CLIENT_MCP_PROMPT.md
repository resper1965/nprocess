# n.process MCP Integration Guide

This guide explains how to enable the **n.process Compliance Engine** within your AI-powered development environment (Cursor, Windsurf, Claude Code, etc.) using the Model Context Protocol (MCP).

By integrating this MCP server, your AI assistant gains the ability to:

1.  **Analyze Business Processes** against regulatory standards (LGPD, GDPR, SOX) in real-time.
2.  **Generate Compliance Documents** (Policies, SOPs) automatically.
3.  **Query Tenant Status** and compliance scores.

## 🚀 Quick Setup

### 1. Prerequisites

- Node.js (v18 or higher) installed.
- Access to the `nprocess` repository (or the standalone `mcp-servers` directory).
- A valid Google Cloud credential (if running locally) or simply public internet access (if connecting to Production API).

### 2. Installation

Navigate to the `mcp-servers` directory and install dependencies:

```bash
cd nprocess/mcp-servers
npm install
npm run build
```

### 3. Application Configuration (e.g., Claude Desktop)

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nprocess-engine": {
      "command": "node",
      "args": ["/absolute/path/to/nprocess/mcp-servers/dist/index.js"],
      "env": {
        "API_URL": "https://nprocess-api-prod-s7tmkmao2a-uc.a.run.app"
      }
    }
  }
}
```

_Replace `/absolute/path/to/...` with the actual path on your machine._

---

## 🤖 System Prompt for AI Clients

When using Cursor, Windsurf, or creating a custom assistant, copy and paste the following prompt to "prime" the AI with knowledge of the available tools:

```text
You are integrated with the n.process Compliance Engine via MCP.
You have access to the following specialized tools:

1. analyze_compliance(process_text, standard)
   - USE THIS to check if a described business process violates regulations.
   - Supported Standards: LGPD (default), GDPR, SOX, ISO 27001, HIPAA.
   - Input: A textual description of the process (e.g., "HR receives resume via email...").

2. generate_document(type, context)
   - USE THIS to draft official compliance documentation.
   - Types: 'Privacy Policy', 'Data Retention Policy', 'SOP', 'Incident Response Plan'.
   - Context: Provide specific company details or requirements.

3. list_tenants(status) and get_compliance_status(tenantId)
   - USE THESE to query the platform's current state.

EXAMPLE USAGE:
User: "Check if my onboarding process is LGPD compliant: We collect CPF and Address via email and store it in Excel."
AI: [Calls analyze_compliance("We collect CPF...", "LGPD")]
```

---

## 💡 Usage Examples

Once configured, you can ask your AI editor questions like:

> "Create a Privacy Policy for a fintech startup handling credit card data."
> _(The AI will call `generate_document`)_

> "Analyze the following user registration flow for GDPR compliance: [paste flow code/text]"
> _(The AI will call `analyze_compliance`)_

> "What is the compliance score for tenant 'ness-enterprise'?"
> _(The AI will call `get_compliance_status`)_
