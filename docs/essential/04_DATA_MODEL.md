# Modelo de Dados (Firestore NoSQL)

## Collections Principais

### `tenants` (Consumers)
- `id`: UUID
- `name`: String
- `plan`: "starter" | "enterprise"
- `settings`: { "allowed_models": [...] }

### `api_keys`
- `key_hash`: String
- `tenant_id`: Ref
- `budget_limit`: Number
- `usage_current_month`: Number

### `knowledge_base` (Híbrido)
- `content`: String (Chunk de texto)
- `embedding`: Vector<768>
- `type`: "private" | "marketplace"
- `metadata`: { "law": "LGPD", "article": "5", "tenant_id": "..." }
*Nota: Se `type` == marketplace, `tenant_id` é nulo (público).*

### `jobs`
- `id`: UUID
- `status`: "pending" | "processing" | "completed" | "failed"
- `result`: JSON (BPMN XML ou Relatório)

### `users`
- `uid`: String (PK do Firebase)
- `email`: String
- `name`: String
- `photo_url`: String
- `org_id`: Ref (Tenants)
- `role`: String
- `status`: "pending" | "active" | "suspended"
- `created_at`: Timestamp
