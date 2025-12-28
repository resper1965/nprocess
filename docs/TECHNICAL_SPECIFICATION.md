# Technical Specification: n.process B4B Core Modules

This document details the architecture, data models, and logic flow for the 3 core engines of the n.process Backend-for-Backends (B4B) platform.

---

## Module 1: Process Normalization Engine

**Goal**: Convert unstructured user descriptions into standardized BPMN 2.0 and Mermaid Diagrams, with a human-in-the-loop refinement cycle.

### 1.1. Logic Flow

1.  **Input**: User raw text (e.g., "We buy things by emailing Bob").
2.  **LLM Processing**:
    - Extract Actors (Lanes).
    - Extract Tasks (Nodes).
    - Extract Decisions (Gateways).
    - **Normalization**: Rewrite tasks in "Verb + Object" format (e.g., "Email Bob" -> "Submit Purchase Request").
3.  **Generation**:
    - Generate BPMN XML (Standard).
    - Generate Mermaid Code (Visualization).
4.  **Feedback Loop**:
    - User reviews Diagram.
    - If **Reject**: User provides feedback -> LLM re-processes taking feedback into account -> Returns new Version.
    - If **Accept**: Process is persisted as the "Golden Source".

### 1.2. API Endpoints

- `POST /v1/process/normalize`
  - **Input**: `NormalizeRequest { text: str, previous_context: Optional[str] }`
  - **Output**: `NormalizeResponse { process_id: str, mermaid: str, bpmn: str, summary: str }`
- `POST /v1/process/feedback`
  - **Input**: `FeedbackRequest { process_id: str, feedback: str }`
  - **Output**: `NormalizeResponse` (Updated)
- `POST /v1/process/finalize`
  - **Input**: `FinalizeRequest { process_id: str }`
  - **Output**: `ProcessSchema` (Persisted)

### 1.3. Service Layer (Python)

```python
class ProcessService:
    async def normalize(self, text: str, history: List[Message]) -> ProcessAttempt:
        # Prompt Engineering: "Act as a BPMN Expert..."
        # Calls Vertex AI (Gemini 1.5 Pro)
        pass
```

---

## Architecture Principle: Modular & Standalone

**CRITICAL**: Each module works independently.

- **Module 1**: Can be used purely as a "Text-to-Diagram" tool.
- **Module 2**: Can audit a process _generated elsewhere_ (e.g., handcrafted BPMN), without needing Module 1.
- **Module 3**: Can suggest documents based on a raw description, without a full Audit Report.

---

## Module 2: Compliance Audit Engine

**Goal**: Audit a process against a specific Regulation (Standard/Law).

### 2.1. Logic Flow

1.  **Input**: Normalized Process Structure (from Module 1 **OR** External Source) + Regulation ID.
2.  **Context Retrieval (RAG)**:
    - Fetch specific clauses of the Regulation relevant to the Process keywords (e.g., "Purchase" -> "Supplier Relationships", "Access Control").
3.  **Gap Analysis**:
    - LLM compares _Process Steps_ vs _Regulation Requirements_.
    - Identify Gaps (Missing steps, lack of segregation of duties, insecure transmission).
4.  **Output**: List of Findings prioritized by Risk.

### 2.2. API Endpoints

- `POST /v1/audit/execute`
  - **Input**:
    ```json
    {
      "process_id": "Optional[str]", // Ref to internal DB
      "process_content": "Optional[str]", // Raw Text/BPMN (Standalone Mode)
      "regulation_ids": ["ISO27001"]
    }
    ```
  - **Output**: `AuditReport { findings: List[Finding], score: int }`

### 2.3. Data Model

```python
class Finding(BaseModel):
    id: str
    severity: Enum['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    affected_step: str  # Node ID in BPMN
    violation: str      # "Missing Approval"
    recommendation: str # "Add a Supervisor Approval Step"
    regulation_clause: str # "ISO27001 A.12.1"
```

---

## Module 3: Document Intelligence Engine

**Goal**: Identify and Generate missing evidence/documents based on the Process and Audit results.

### 3.1. Logic Flow

1.  **Analysis**:
    - Input: Process + Audit Gaps.
    - Logic: "If step is 'Vendor Selection', ISO requires 'Vendor Risk Assessment'".
    - Check: Does this document exist in the scope?
2.  **Suggestion**:
    - Return list of **Missing Documents**.
3.  **Generation (On Demand)**:
    - User requests a missing document.
    - LLM generates a template filled with context from the Process (e.g., "Vendor Risk Assessment" pre-filled with the 'IT Components' mentioned in the process).

### 3.2. API Endpoints

- `POST /v1/documents/gap-analysis`
  - **Input**: `DocGapRequest { process_id: str, audit_id: str }`
  - **Output**: `DocGapReport { missing_documents: List[DocMetadata], existing_documents: List[DocMetadata] }`
- `POST /v1/documents/generate`
  - **Input**: `GenRequest { doc_type: str, context_process_id: str }`
  - **Output**: `GenResponse { content_markdown: str, download_url: str }`

---

## Developer Experience (MCP Server)

To enable the "Cursor Integration", we will wrap these API services into MCP Tools.

### MCP Tools Definition

1.  `normalize_process_workflow(description: str)`
    - _Desc_: "Convert a text description into a structured BPMN/Mermaid process."
2.  `audit_compliance(process_xml: str, regulation: str)`
    - _Desc_: "Check a BPMN process for violations against a standard (ISO, GDPR)."
3.  `suggest_missing_evidence(process_xml: str)`
    - _Desc_: "List required documents that are missing from this process flow."

### Usage Example (Cursor)

User types: _"Analyze my User Onboarding flow for GDPR compliance"_

1.  Cursor calls `normalize_process_workflow` (if text) or reads code.
2.  Cursor calls `audit_compliance(..., regulation='GDPR')`.
3.  Cursor displays specific lines of code/process that violate GDPR (e.g., "Saving IP address without consent").
