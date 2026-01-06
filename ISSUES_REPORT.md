# 🚨 NPROCESS - Relatório de Problemas e Inconformidades

> **Data**: 2026-01-06
> **Branch**: main (após merge da PR #51)
> **Status**: 🔴 5 Critical | 🟠 7 High | 🟡 5 Medium

---

## 📊 Resumo Executivo

**Total de Issues:** 20
**Críticos (Quebram funcionalidade):** 5
**Alta Prioridade (Features faltantes):** 7
**Média Prioridade (Qualidade/TODOs):** 5
**Baixa Prioridade (Otimizações):** 3

---

## 🔴 CRITICAL ISSUES (Sistema Quebrado)

### 1.1 ⚠️ Standards Router em Memória - NÃO PERSISTENTE
**Arquivo:** `admin-control-plane/app/routers/standards.py:28-30`

```python
# ❌ PROBLEMA: Dicionários em memória
marketplace_standards_db = {}
custom_standards_db = {}
```

**Impacto:**
- ❌ Todos os standards são perdidos ao reiniciar servidor
- ❌ Não escalável (memória limitada)
- ❌ Não funciona em múltiplas instâncias

**TODOs Relacionados:**
- Linha 42: "Fetch from Firestore global_standards collection"
- Linha 140: "Fetch from Firestore"
- Linha 191: "Call ingestion service"
- Linha 271: "Delete from Firestore"
- Linha 298: "Call actual ingestion service (async)"
- Linha 352: "Save file to cloud storage (GCS)"

**Fix:**
```python
# ✅ SOLUÇÃO: Usar FirestoreRepository
from app.services.firestore_repository import FirestoreRepository

db = FirestoreRepository()

@router.get("/marketplace")
async def list_marketplace_standards(...):
    docs = db.db.collection("global_standards").get()
    return [StandardMarketplaceInfo(**doc.to_dict()) for doc in docs]
```

---

### 1.2 ⚠️ APIKeyService NÃO salva allowed_standards
**Arquivo:** `admin-control-plane/app/services/apikey_service.py:39-57`

```python
# ❌ PROBLEMA: Campo allowed_standards não é salvo
record = {
    "key_id": key_id,
    # ... outros campos ...
    # ❌ FALTANDO: "allowed_standards": data.get("allowed_standards")
}
```

**Impacto:**
- ❌ API keys não podem restringir acesso a standards específicos
- ❌ allowed_standards sempre retorna null
- ❌ Frontend multi-select inútil

**Fix:** Adicionar na linha 48:
```python
"allowed_standards": data.get("allowed_standards"),
```

---

### 1.3 ⚠️ APIKeyService.update_key() NÃO EXISTE
**Arquivo:** `admin-control-plane/app/services/apikey_service.py`

```python
# ❌ PROBLEMA: Método não implementado mas é chamado
# routers/apikeys.py:124, 212 chamam:
await service.update_key(key_id, {...})
```

**Impacto:**
- ❌ RuntimeError ao tentar atualizar API key
- ❌ Não é possível alterar allowed_standards
- ❌ Endpoint PUT /apikeys/{id}/standards quebrado

**Fix:** Adicionar método:
```python
async def update_key(self, key_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update API key fields"""
    doc_ref = self.db.collection("api_keys").document(key_id)
    doc = doc_ref.get()

    if not doc.exists:
        return None

    doc_ref.update(updates)
    updated_doc = doc_ref.get()
    return updated_doc.to_dict()
```

---

### 1.4 ⚠️ Frontend-Backend Response Mismatch
**Arquivos:**
- `web-portal/src/app/admin/standards/page.tsx:103, 110`
- `admin-control-plane/app/routers/standards.py:131`

```typescript
// ❌ Frontend espera objeto wrapper
const data = await marketplaceRes.json();
setMarketplaceStandards(data.standards || []); // Espera {standards: [...]}
```

```python
# ❌ Backend retorna array direto
@router.get("/marketplace", response_model=List[StandardMarketplaceInfo])
async def list_marketplace_standards(...):
    return standards  # Retorna lista direta
```

**Impacto:**
- ❌ Standards não aparecem na UI
- ❌ data.standards é undefined
- ❌ Lista vazia sempre

**Fix Backend:**
```python
return {"standards": standards}
```

**OU Fix Frontend:**
```typescript
setMarketplaceStandards(data || []);
```

---

### 1.5 ⚠️ Frontend usa campo errado: id vs standard_id
**Arquivo:** `web-portal/src/app/admin/standards/page.tsx:177`

```typescript
// ❌ Frontend usa .id
const result = await createKeyMutation.mutateAsync(request);
await fetch(`${API_URL}/v1/admin/standards/custom/${result.id}/ingest`)
```

```python
# ✅ Backend retorna standard_id
class StandardCustomInfo(BaseModel):
    standard_id: str  # Campo correto
```

**Impacto:**
- ❌ POST /standards/custom/undefined/ingest
- ❌ Ingestion nunca funciona
- ❌ Standards ficam pending forever

**Fix:** Linha 177:
```typescript
await fetch(`${API_URL}/v1/admin/standards/custom/${createdStandard.standard_id}/ingest`)
```

---

## 🟠 HIGH PRIORITY ISSUES (Features Faltantes)

### 2.1 🔧 Integração Firestore Ausente (Todas operações)
- **Linhas:** 42, 140, 191, 271, 298
- **Status:** Todas operações CRUD usam memória
- **Fix:** Implementar usando FirestoreRepository

### 2.2 🔧 Serviço de Ingestion Não Conectado
- **Linhas:** 191, 298-306
- **Status:** Endpoint existe mas não processa nada
- **Necessário:** Integrar com serviço de vetorização

### 2.3 🔧 Upload de Arquivo para GCS Não Implementado
- **Linha:** 352
- **Status:** Arquivo lido mas não salvo
- **Impacto:** Uploaded files perdidos imediatamente

### 2.4 🔧 Firebase Functions Directory Missing
- **Arquivo:** `firebase.json:8`
- **Missing:** `/functions/` directory
- **Impacto:** Deploy falhará

### 2.5 🔧 Vector Search Indexes Não Configurados
- **Arquivo:** `firestore.indexes.json`
- **Missing:** Indexes para collections `chunks`
- **Impacto:** Queries lentas ou falham

### 2.6 🔧 AI Keys Vault Não Implementado
- **Arquivo:** `admin-control-plane/app/routers/ai_keys.py:16, 40`
- **Status:** TODO - Store in Secret Manager
- **Impacto:** Keys armazenadas insecurely

### 2.7 🔧 Gemini Chat Admin Operations Placeholders
- **Arquivo:** `admin-control-plane/app/services/gemini_chat.py:277+`
- **Status:** 11 operações retornam apenas placeholders
- **Impacto:** Chat admin não funciona

---

## 🟡 MEDIUM PRIORITY (Qualidade/TODOs)

### 3.1 API Key Usage Tracking Não Implementado
- **Arquivo:** `apikey_service.py:135`
- **TODO:** Distributed counters
- **Impacto:** Quotas não enforced

### 3.2 Rate Limiting Não Integrado com Admin
- **Arquivo:** `app/middleware/rate_limit.py:60`
- **TODO:** Admin integration
- **Impacto:** Rate limiting desconectado

### 3.3 FinOps Integration Incomplete
- **Arquivo:** `finops.py:12, 26`
- **TODO:** Billing API + Monitoring
- **Impacto:** Custos não tracked

### 3.4 Services Registry Hardcoded
- **Arquivo:** `services.py:13`
- **TODO:** Service registry
- **Impacto:** Health checks falsos

### 3.5 MCP Context Não Injetado
- **Arquivo:** `admin-control-plane/app/main.py:101`
- **TODO:** Pass to MCP context
- **Impacto:** Client context indisponível em tools

---

## ✅ INTEGRATION CHECKS

### ✅ Estrutura AllowedStandards Consistente
**Status:** ✅ OK
- Backend: `{marketplace: [], custom: []}`
- Frontend: `{marketplace: string[], custom: string[]}`

### ✅ Search Service Filtragem Funcionando
**Status:** ✅ OK
- Arquivo: `app/services/search_service.py:92-152`
- Filtra corretamente marketplace + custom

### ⚠️ API Key Validation Response
**Status:** ✅ Retorna allowed_standards
**Problema:** Service não salva (ver 1.2)

---

## 🔧 CONFIGURATION ISSUES

### Environment Variables
```bash
# ⚠️ INCONSISTÊNCIA: Port confusion
# Root .env.example: NEXT_PUBLIC_API_URL=http://localhost:8000
# Admin API real port: 8008
```

**Recomendação:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000         # Core API
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8008   # Admin API
```

### CORS Configuration
```python
# Core API: Limited (GET, POST, OPTIONS)
# Admin API: Allow all (*)
```

**Recomendação:** Alinhar políticas ou documentar diferenças

### Firebase Hosting
```json
{
  "public": "web-portal/out"  // ⚠️ Next.js usa .next/
}
```

**Fix:** Usar `web-portal/.next` ou configurar static export

---

## 📋 PRIORITY MATRIX

| Priority | Count | Fix Before Production |
|----------|-------|----------------------|
| 🔴 **Critical** | 5 | ✅ Sim - Sistema quebrado |
| 🟠 **High** | 7 | ✅ Sim - Features core faltando |
| 🟡 **Medium** | 5 | ⚠️ Recomendado - Qualidade |
| 🟢 **Low** | 3 | ❌ Opcional - Otimização |

---

## 🎯 RECOMMENDED FIX ORDER

### **Phase 1: CRITICAL (Agora)**
1. ✅ Fix APIKeyService.allowed_standards storage
2. ✅ Add APIKeyService.update_key() method
3. ✅ Fix frontend-backend response mismatch
4. ✅ Fix frontend id vs standard_id
5. ✅ Implement Firestore integration for standards

### **Phase 2: HIGH (Next Sprint)**
6. ⬜ Implement file upload to GCS
7. ⬜ Connect ingestion service
8. ⬜ Add vector search indexes
9. ⬜ Create Firebase functions directory
10. ⬜ Implement AI keys vault
11. ⬜ Complete Gemini chat operations

### **Phase 3: MEDIUM (Backlog)**
12. ⬜ Implement usage tracking
13. ⬜ Integrate rate limiting with admin
14. ⬜ Complete FinOps integration
15. ⬜ Implement services registry
16. ⬜ Add MCP context injection

---

## 🚀 Quick Wins (Can fix now)

1. **APIKeyService allowed_standards** - 1 line
2. **Frontend response mismatch** - 2 lines
3. **Frontend id→standard_id** - 1 line
4. **Environment variables docs** - Documentation only

---

## 📝 Notes

- Todos os file paths são absolutos a partir de `/home/user/nprocess/`
- Issues encontrados após merge da PR #51
- Repository na branch `main`
- 8 commits mergeados com sucesso

---

**Generated:** 2026-01-06
**By:** Claude Code Analysis Agent
