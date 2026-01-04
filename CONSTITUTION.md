# PROJECT ARCHITECTURE & RULES (The "Constitution")

## 1. TECH STACK (STRICT)

- **Language:** Python 3.11+
- **Framework:** FastAPI (Async)
- **Database:** Google Firestore (NoSQL)
- **Vector Store:** Firestore Vector Search
- **AI/LLM:** Vertex AI SDK (Gemini 1.5 Pro)
- **Async Processing:** Google Cloud Tasks (Pattern: Dispatch -> 202 Accepted -> Webhook)

## 2. DATA PRIVACY & MULTI-TENANCY (CRITICAL)

- **Client Data (Payloads):** EPHEMERAL. Never persist raw user processes/documents to disk/DB. Process in memory, return result, discard.
- **Knowledge Base (Vectors):** PERSISTENT.
  - **Schema:** Must include `tenant_id` and `scope` ('global' or 'private').
  - **Global:** `tenant_id='system'`, `scope='global'` (Accessible by all).
  - **Private:** `tenant_id='client_id'`, `scope='private'` (Accessible ONLY by owner).
- **Enforcement:** Every vector query MUST filter by `tenant_id`.

## 3. CODING PATTERNS

- **Pydantic Models:** All AI outputs must be structured JSON (parsed by Pydantic).
- **Dependency Injection:** Use FastAPI `Depends` for API Key validation and DB connections.
- **Error Handling:** Graceful handling of Vertex AI timeouts.

## 4. MODULE DEFINITIONS

- **nprocess (Core):** Stateless logic.
- **Ingestion:** Parses PDFs/URLs -> Chunks -> Embeds -> Saves to Firestore (checking Tenant ID).
- **Compliance:** Retrieves Vectors (Global + Private if allowed) -> RAG Analysis.
- **Documents:** Generates structure -> Fills content -> Returns JSON.
