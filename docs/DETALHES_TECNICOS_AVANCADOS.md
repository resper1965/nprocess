# 🔬 Detalhes Técnicos Avançados - n.process

**Versão**: 2.0.0  
**Data**: 07 de Janeiro de 2026  
**Complemento**: SISTEMA_COMPLETO_DETALHADO.md

---

## 📋 Índice

1. [Arquitetura de Dados](#arquitetura-de-dados)
2. [Fluxos de Código Detalhados](#fluxos-de-código-detalhados)
3. [Integração com Vertex AI](#integração-com-vertex-ai)
4. [Sistema de RAG (Retrieval Augmented Generation)](#sistema-de-rag)
5. [Multi-tenancy e Isolamento](#multi-tenancy-e-isolamento)
6. [Sistema de Autenticação Detalhado](#sistema-de-autenticação-detalhado)
7. [Rate Limiting e Quotas](#rate-limiting-e-quotas)
8. [Error Handling e Retry Logic](#error-handling-e-retry-logic)

---

## 🗄️ Arquitetura de Dados

### Estrutura do Firestore

#### Collection: `users`

```typescript
{
  uid: string,                    // Firebase Auth UID
  email: string,
  name: string,
  role: "super_admin" | "admin" | "user",  // Fallback se custom claim não existir
  emailVerified: boolean,
  provider: "google" | "email",
  created_at: Timestamp,
  updated_at: Timestamp,
  tenant_id?: string              // Opcional, para multi-tenant futuro
}
```

#### Collection: `api_keys`

```typescript
{
  id: string,                     // UUID
  key: string,                    // "nprocess_xxx..." (hashed)
  key_id: string,                 // Public identifier
  consumer_app_id: string,        // Identificador do cliente
  tenant_id: string,              // Isolamento por tenant
  active: boolean,
  created_at: Timestamp,
  last_used_at: Timestamp,
  expires_at?: Timestamp,
  daily_quota: number,            // Requests por dia
  usage: {
    requests_today: number,
    requests_total: number,
    last_reset: Timestamp
  },
  permissions: string[],          // ["process", "compliance", "documents"]
  allowed_standards: string[]     // ["lgpd", "gdpr", "sox"]
}
```

#### Collection: `processes`

```typescript
{
  id: string,                     // UUID
  tenant_id: string,              // Isolamento
  name: string,
  description: string,
  bpmn_xml: string,              // BPMN 2.0 XML
  mermaid_code: string,           // Mermaid.js code
  status: "draft" | "finalized",
  created_at: Timestamp,
  updated_at: Timestamp,
  created_by: string,             // User UID
  metadata: {
    activities: number,
    gateways: number,
    events: number,
    lanes: number
  }
}
```

#### Collection: `compliance_analyses`

```typescript
{
  id: string,
  tenant_id: string,
  process_id: string,
  domain: string,                 // "lgpd", "gdpr", "sox"
  score: number,                  // 0-100
  gaps: Array<{
    id: string,
    severity: "critical" | "high" | "medium" | "low",
    description: string,
    recommendation: string
  }>,
  suggestions: string[],
  report: string,                 // Relatório completo
  created_at: Timestamp,
  created_by: string
}
```

#### Collection: `knowledge_base` (RAG)

```typescript
{
  id: string,
  tenant_id: "system" | string,   // "system" = global, outro = privado
  scope: "global" | "private",    // Visibilidade
  title: string,
  content: string,                // Texto completo
  embedding: number[],            // Vector embedding (1536 dims)
  source: string,                 // URL ou filename
  source_type: "pdf" | "docx" | "html" | "text",
  metadata: {
    author?: string,
    date?: string,
    domain?: string,              // "lgpd", "gdpr", etc.
    tags?: string[]
  },
  created_at: Timestamp,
  created_by: string
}
```

### Índices do Firestore

**Localização**: `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "knowledge_base",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenant_id", "order": "ASCENDING" },
        { "fieldPath": "scope", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "api_keys",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tenant_id", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🔄 Fluxos de Código Detalhados

### Fluxo Completo: Geração de Processo BPMN

```python
# 1. Request recebido em app/routers/process.py
@router.post("/v1/modeling/generate")
async def generate_diagram(
    request: DiagramGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    # 2. Validação de tenant_id
    tenant_id = current_user.get("tenant_id") or "default"
    
    # 3. Chama service
    service = get_modeling_service()
    result = await service.generate_diagram(
        text=request.text,
        tenant_id=tenant_id,
        user_id=current_user["uid"]
    )
    
    # 4. Retorna resposta
    return DiagramGenerateResponse(**result)

# 5. Service em app/services/modeling_service.py
class ModelingService:
    async def generate_diagram(self, text: str, tenant_id: str, user_id: str):
        # 6. Prepara prompt para Vertex AI
        prompt = self._build_prompt(text)
        
        # 7. Chama Vertex AI
        ai_service = get_ai_service()
        response = await ai_service.generate_content(
            prompt=prompt,
            model="gemini-1.5-pro",
            temperature=0.7
        )
        
        # 8. Parse resposta (JSON estruturado)
        parsed = self._parse_ai_response(response)
        
        # 9. Gera BPMN XML e Mermaid
        bpmn_xml = self._generate_bpmn(parsed)
        mermaid_code = self._generate_mermaid(parsed)
        
        # 10. Salva em Firestore (opcional, se finalizado)
        if request.finalize:
            await self._save_process(
                tenant_id=tenant_id,
                user_id=user_id,
                bpmn_xml=bpmn_xml,
                mermaid_code=mermaid_code
            )
        
        return {
            "process_id": str(uuid.uuid4()),
            "mermaid": mermaid_code,
            "bpmn": bpmn_xml,
            "summary": parsed["summary"]
        }
```

### Fluxo Completo: Análise de Compliance

```python
# 1. Request em app/routers/compliance.py
@router.post("/v1/compliance/analyze")
async def analyze_compliance(
    request: ComplianceAnalyzeRequest,
    current_user: dict = Depends(get_current_user)
):
    tenant_id = current_user.get("tenant_id") or "default"
    
    # 2. Busca processo
    process = await get_process(request.process_id, tenant_id)
    
    # 3. Busca regulamentações via RAG
    search_service = get_search_service()
    regulations = await search_service.search(
        query=f"compliance requirements for {request.domain}",
        tenant_id=tenant_id,
        scope="global"  # Regulamentações são globais
    )
    
    # 4. Análise com Vertex AI
    compliance_service = get_compliance_service()
    analysis = await compliance_service.analyze(
        process=process,
        domain=request.domain,
        regulations=regulations
    )
    
    # 5. Salva análise
    await save_analysis(tenant_id, analysis)
    
    return ComplianceAnalyzeResponse(**analysis)
```

---

## 🤖 Integração com Vertex AI

### Configuração

```python
# app/services/ai_service.py
from vertexai.generative_models import GenerativeModel
import vertexai

class AIService:
    def __init__(self):
        vertexai.init(
            project=os.getenv("GCP_PROJECT_ID"),
            location=os.getenv("VERTEX_AI_LOCATION", "us-central1")
        )
        self.model = GenerativeModel("gemini-1.5-pro")
    
    async def generate_content(
        self,
        prompt: str,
        model: str = "gemini-1.5-pro",
        temperature: float = 0.7,
        max_tokens: int = 8192
    ):
        response = await self.model.generate_content_async(
            prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens
            }
        )
        return response.text
```

### Prompts Estruturados

#### Prompt para Geração de BPMN

```python
BPMN_GENERATION_PROMPT = """
You are a BPMN 2.0 expert. Convert the following process description into a structured BPMN diagram.

Process Description:
{text}

Requirements:
1. Extract all actors (Lanes)
2. Extract all tasks (Activities)
3. Extract all decisions (Gateways)
4. Normalize task names to "Verb + Object" format
5. Generate valid BPMN 2.0 XML
6. Generate Mermaid.js code for visualization

Return JSON:
{
  "lanes": [...],
  "activities": [...],
  "gateways": [...],
  "events": [...],
  "bpmn_xml": "...",
  "mermaid_code": "...",
  "summary": "..."
}
"""
```

#### Prompt para Análise de Compliance

```python
COMPLIANCE_ANALYSIS_PROMPT = """
You are a compliance expert specializing in {domain}.

Process to analyze:
{bpmn_xml}

Relevant regulations:
{regulations}

Analyze the process for compliance gaps and provide:
1. Compliance score (0-100)
2. List of gaps with severity
3. Recommendations for each gap
4. Detailed report

Return JSON:
{
  "score": 75,
  "gaps": [...],
  "suggestions": [...],
  "report": "..."
}
"""
```

---

## 🔍 Sistema de RAG (Retrieval Augmented Generation)

### Geração de Embeddings

```python
# app/services/ingestion/embedding_service.py
from vertexai.language_models import TextEmbeddingModel

class EmbeddingService:
    def __init__(self):
        self.model = TextEmbeddingModel.from_pretrained("textembedding-gecko@003")
    
    async def generate_embedding(self, text: str) -> list[float]:
        embeddings = await self.model.get_embeddings_async([text])
        return embeddings[0].values  # 768 dimensions
```

### Busca Vetorial no Firestore

```python
# app/services/search_service.py
from google.cloud.firestore_v1.vector_query import DistanceMeasure

class SearchService:
    async def search(
        self,
        query: str,
        tenant_id: str,
        scope: str = "global",
        limit: int = 10
    ):
        # 1. Gera embedding da query
        embedding_service = EmbeddingService()
        query_embedding = await embedding_service.generate_embedding(query)
        
        # 2. Busca no Firestore
        db = get_firestore_client()
        collection = db.collection("knowledge_base")
        
        # 3. Filtra por tenant e scope
        query_ref = collection.where("tenant_id", "in", [tenant_id, "system"])
        if scope == "private":
            query_ref = query_ref.where("scope", "==", "private")
        
        # 4. Vector search (Firestore Vector Search)
        # Nota: Firestore Vector Search está em preview
        # Alternativa: Buscar todos e calcular distância cosine
        
        docs = query_ref.limit(limit).stream()
        
        # 5. Calcula similaridade (cosine similarity)
        results = []
        for doc in docs:
            doc_data = doc.to_dict()
            doc_embedding = doc_data["embedding"]
            similarity = cosine_similarity(query_embedding, doc_embedding)
            results.append({
                "id": doc.id,
                "title": doc_data["title"],
                "content": doc_data["content"],
                "similarity": similarity,
                "metadata": doc_data.get("metadata", {})
            })
        
        # 6. Ordena por similaridade
        results.sort(key=lambda x: x["similarity"], reverse=True)
        
        return results[:limit]
```

### Ingestão de Documentos

```python
# admin-control-plane/app/routers/ingestion.py
@router.post("/v1/admin/knowledge/ingest")
async def ingest_document(
    file: UploadFile,
    tenant_id: str = "system",
    scope: str = "global",
    current_user: dict = Depends(require_admin)
):
    # 1. Extrai texto do arquivo
    text = await extract_text(file)
    
    # 2. Divide em chunks
    chunks = split_text(text, chunk_size=1000, overlap=200)
    
    # 3. Gera embeddings para cada chunk
    embedding_service = EmbeddingService()
    for chunk in chunks:
        embedding = await embedding_service.generate_embedding(chunk["text"])
        
        # 4. Salva no Firestore
        await db.collection("knowledge_base").add({
            "tenant_id": tenant_id,
            "scope": scope,
            "title": extract_title(chunk),
            "content": chunk["text"],
            "embedding": embedding,
            "source": file.filename,
            "source_type": get_file_type(file),
            "metadata": extract_metadata(chunk),
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": current_user["uid"]
        })
    
    return {"status": "success", "chunks_ingested": len(chunks)}
```

---

## 🏢 Multi-tenancy e Isolamento

### Estratégia de Isolamento

1. **Tenant ID em todas as queries**:
   ```python
   # Sempre filtrar por tenant_id
   query = db.collection("processes").where("tenant_id", "==", tenant_id)
   ```

2. **API Keys isoladas**:
   - Cada API key tem `tenant_id`
   - Backend extrai `tenant_id` da key
   - Todas as queries filtram por `tenant_id`

3. **Base de conhecimento**:
   - `tenant_id="system"` + `scope="global"`: Acessível por todos
   - `tenant_id="client_a"` + `scope="private"`: Apenas client_a

### Middleware de Tenant

```python
# app/middleware/auth.py
async def get_current_tenant(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    current_user: Optional[dict] = Depends(get_current_user)
) -> str:
    # 1. Se API key, extrai tenant_id da key
    if x_api_key:
        key_data = await validate_api_key(x_api_key)
        return key_data["tenant_id"]
    
    # 2. Se usuário autenticado, extrai do token
    if current_user:
        return current_user.get("tenant_id", "default")
    
    raise HTTPException(401, "Authentication required")
```

---

## 🔐 Sistema de Autenticação Detalhado

### Fluxo Firebase Auth (Frontend)

```typescript
// web-portal/src/lib/auth-context.tsx

// 1. Login com Google
const loginWithGoogle = async () => {
  // Salva URL de redirect
  sessionStorage.setItem('auth_redirect_url', window.location.href);
  
  // Inicia redirect
  await signInWithRedirect(auth, googleProvider);
  // Usuário é redirecionado para Google
};

// 2. Após redirect do Google
const checkRedirectResult = async () => {
  // Detecta parâmetros de redirect
  const isRedirectUrl = urlParams.includes('__firebase_request_key');
  
  if (isRedirectUrl && !sessionStorage.getItem('redirect_processed')) {
    // Força reload para processar redirect
    sessionStorage.setItem('redirect_processed', 'true');
    window.location.reload();
    return;
  }
  
  // Processa redirect
  const result = await getRedirectResult(auth);
  
  if (result?.user) {
    // Usuário autenticado
    setUser(result.user);
    
    // Busca role
    const tokenResult = await getIdTokenResult(result.user);
    let role = tokenResult.claims.role;
    
    // Fallback para Firestore
    if (!role) {
      const profile = await getUserProfile(result.user.uid);
      role = profile?.role || 'user';
    }
    
    setRole(role);
    
    // Redireciona
    router.push(role === 'admin' || role === 'super_admin' 
      ? '/admin/overview' 
      : '/dashboard');
  }
};

// 3. Listener de mudanças de auth
onAuthStateChanged(auth, async (user) => {
  if (user) {
    setUser(user);
    // Busca role...
  } else {
    setUser(null);
    setRole(null);
  }
});
```

### Verificação de Token (Backend)

```python
# app/middleware/auth.py
from firebase_admin import auth as firebase_auth

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> dict:
    if not credentials:
        raise HTTPException(401, "Authentication required")
    
    # 1. Decodifica token
    try:
        decoded_token = firebase_auth.verify_id_token(credentials.credentials)
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")
    
    # 2. Extrai dados
    return {
        "uid": decoded_token["uid"],
        "email": decoded_token.get("email"),
        "role": decoded_token.get("role", "user"),  # Custom claim
        "tenant_id": decoded_token.get("tenant_id", "default")
    }
```

### Custom Claims

```python
# Script para definir custom claim (executado via Cloud Shell)
import firebase_admin
from firebase_admin import auth

# Inicializa
cred = credentials.Certificate("service-account.json")
firebase_admin.initialize_app(cred)

# Define custom claim
auth.set_custom_user_claims(
    uid="hp9TADsRoHfJ4GgSIjQejmCDRCt2",
    custom_claims={
        "role": "super_admin",
        "admin": True
    }
)
```

---

## ⚡ Rate Limiting e Quotas

### Implementação

```python
# app/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# Aplicar rate limit
@router.post("/v1/modeling/generate")
@limiter.limit("10/minute")  # 10 requests por minuto
async def generate_diagram(...):
    pass
```

### Quotas por API Key

```python
# app/middleware/auth.py
async def check_api_key_quota(api_key_data: dict) -> bool:
    usage = api_key_data.get("usage", {})
    quota = api_key_data.get("daily_quota", 0)
    
    # Verifica se excedeu quota diária
    if usage.get("requests_today", 0) >= quota:
        raise HTTPException(429, "Daily quota exceeded")
    
    # Incrementa contador
    await increment_usage(api_key_data["id"])
    
    return True
```

---

## 🛡️ Error Handling e Retry Logic

### Retry para Vertex AI

```python
# app/services/ai_service.py
from tenacity import retry, stop_after_attempt, wait_exponential

class AIService:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def generate_content(self, prompt: str):
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Vertex AI error: {e}")
            raise
```

### Error Responses Padronizados

```python
# app/schemas.py
class ErrorResponse(BaseModel):
    error: str
    message: str
    code: Optional[str] = None
    details: Optional[dict] = None

# Uso
raise HTTPException(
    status_code=400,
    detail={
        "error": "validation_error",
        "message": "Invalid process description",
        "code": "INVALID_INPUT"
    }
)
```

---

**Última Atualização**: 07 de Janeiro de 2026  
**Versão do Documento**: 2.0.0
