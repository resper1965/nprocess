# n.process Integration Guide (Developer Manual)

This document provides instructions on how to consume `n.process` as a backend service for your applications. It supports two modes of interaction:

1.  **Runtime API (REST)**: For your application to call `n.process` functionalities.
2.  **Design-Time (MCP)**: For developers using AI tools (Cursor, Claude, etc.) to query `n.process` context while coding.

---

## Part 1: The Functional Architecture

Your application delegates the heavy lifting of **Process Intelligence** & **Compliance** to `n.process`.

### Core Flow 1: Process Normalization

**Scenario**: Your user types a messy description of a process. You want to show them a professional flow.

- **Endpoint**: `POST /v1/process/normalize`
- **Input**: `{ "description": "We buy stuff by asking the boss on slack", "format": "bpmn" }`
- **Output**:
  ```json
  {
    "normalized_text": "Purchase Requisition Process...",
    "bpmn_xml": "<definitions>...</definitions>",
    "mermaid_diagram": "graph TD; A[Start] --> B[Request Approval]...",
    "status": "pending_approval"
  }
  ```
- **UX Loop**: Your app displays the Mermaid diagram.
  - If User says "No", call endpoint again with feedback.
  - If User says "Yes", call `POST /v1/process/confirm`.

### Core Flow 2: Compliance Audit

**Scenario**: You have a normalized process. Now checking if it follows the law.

- **Endpoint**: `POST /v1/audit/process`
- **Input**:
  ```json
  {
    "process_id": "123",
    "regulation": "ISO27001",
    "context": "Financial Sector"
  }
  ```
- **Output**:
  ```json
  {
    "compliant": false,
    "gaps": [{ "step": "Payment Approval", "issue": "Missing Segregation of Duties", "severity": "high" }]
  }
  ```

### Core Flow 3: Document Intelligence

**Scenario**: The process is approved. What documents are missing?

- **Endpoint**: `POST /v1/compliance/documents-gap-analysis`
- **Output**: List of required documents (e.g., "Vendor Risk Assessment").
- **Endpoint**: `POST /v1/documents/generate` (Generates templates based on the process).

---

## Part 2: Developer Consumption (The "AI-Native" Way)

You asked: _"How does the developer consume this? Do they need a prompt?"_

### Option A: The "Traditional" API (Runtime)

The developer writes code in your app to call our REST API.

- **Best for**: Functions that run automatically when _your_ end-users click buttons.
- **Artifact**: We provide an **OpenAPI Specification (Swagger)**.

### Option B: The MCP Server (Design-Time) - **HIGHLY RECOMMENDED**

Since your developers use **Cursor** or **Claude**, we expose `n.process` as a **Model Context Protocol (MCP) Server**.

**Why?**
Instead of the developer constantly looking up docs, they connect Cursor to `n.process`.
Then they can type in Cursor:

> _"@nprocess create a function in my code that validates this procurement flow against ISO27001"_

The MCP Server lets Cursor "read" the regulations stored in `n.process` and write the code for the developer.

### Option C: Process Prompts (The "Prompt-as-a-Service")

If the developer doesn't want to call an API but wants to use _their own_ LLM to do the work using your logic.

- **Endpoint**: `GET /v1/prompts/normalization`
- **Output**: The precise system prompt `n.process` uses.
- **Usage**: The developer fetches this prompt and feeds it to _their_ instance of GPT-4.

---

## Integration Checklist

1.  [ ] **Deploy n.process** (Backend is ready).
2.  [ ] **OpenAPI Spec**: Available at `/docs` (FastAPI auto-generates this).
3.  [ ] **MCP Server**: We need to add a lightweight MCP interface layer.

### Recommended Stack for Consumers

- **Frontend**: React/Next.js (render Mermaid diagrams easily).
- **AI IDE**: Cursor (connected to n.process MCP for rapid development).
