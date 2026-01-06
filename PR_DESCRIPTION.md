# Pull Request: feat: Implementa gestão completa de Standards (Marketplace + Custom) com backend e frontend

## 🎯 Objetivo

Refatoração completa do nprocess para focar no backend das 3 rotinas principais (Process Regularization, Compliance Analysis, Documentation Generation), implementando arquitetura dual de standards (Marketplace + Custom) com controle granular de acesso por API key.

## 📦 Mudanças Implementadas

### Backend (admin-control-plane)

#### 1. Schemas e Modelos (`app/schemas.py`)
- ✅ `AllowedStandards`: estrutura `{marketplace: [], custom: []}` para controle granular
- ✅ `StandardType`: enum MARKETPLACE | CUSTOM
- ✅ `StandardStatus`: enum para tracking (pending, processing, completed, failed)
- ✅ `StandardMarketplaceInfo`: metadados de standards públicos
- ✅ `StandardCustomCreate`: criação de standards privados
- ✅ `StandardSourceType`: suporte a file, url, text
- ✅ `ComplianceAnalyzeRequest`: integração com SOA (Statement of Applicability)

#### 2. Router de Standards (`app/routers/standards.py`) - **NOVO**
**Marketplace Standards:**
- `GET /v1/admin/standards/marketplace` - Lista standards públicos
- `GET /v1/admin/standards/marketplace/{id}` - Detalhes de standard público

**Custom Standards (por cliente):**
- `POST /v1/admin/standards/custom` - Cria standard customizado
- `GET /v1/admin/standards/custom` - Lista standards do cliente
- `GET /v1/admin/standards/custom/{id}` - Detalhes de standard
- `PUT /v1/admin/standards/custom/{id}` - Atualiza metadados
- `DELETE /v1/admin/standards/custom/{id}` - Remove standard
- `POST /v1/admin/standards/custom/{id}/ingest` - Inicia vetorização
- `GET /v1/admin/standards/custom/{id}/status` - Verifica status de processamento
- `POST /v1/admin/standards/custom/upload` - Upload de arquivos

#### 3. API Keys (`app/routers/apikeys.py`)
- ✅ Suporte a `allowed_standards: AllowedStandards` na criação
- ✅ DELETE endpoint atualizado: `/apikeys/{key_id}/standards/{standard_type}/{standard_id}`
- ✅ Separação entre marketplace e custom standards

#### 4. Search Service (`app/services/search_service.py`)
- ✅ Filtragem por `allowed_standards.marketplace` e `allowed_standards.custom`
- ✅ Suporte a múltiplos caminhos Firestore:
  - `global_standards/{standard_id}/chunks/*` (marketplace)
  - `client_standards/{client_id}/{standard_id}/chunks/*` (custom)

#### 5. Compliance Service (`app/services/compliance_service.py`)
- ✅ Integração com SOA (Statement of Applicability)
- ✅ Contexto enriquecido com controles aplicáveis/excluídos

### Frontend (client-portal)

#### 1. Página Standards (`src/app/admin/standards/page.tsx`) - **NOVO**
**Features:**
- 📋 Tab "Marketplace" - Lista standards públicos (read-only)
  - Badges de categoria (legal, security, quality, financial)
  - Badges de jurisdição (BR, EU, US)
  - Links para documentação oficial
  - Contador de chunks vetorizados

- 📝 Tab "Meus Standards" - CRUD completo para standards customizados
  - Upload de arquivos (.pdf, .txt, .md, .doc, .docx)
  - Input de URL para scraping
  - Input de texto direto
  - Status tracking com badges animados:
    - ⏱️ Pending (pendente)
    - 🔄 Processing (processando - spinner animado)
    - ✅ Completed (completo)
    - ❌ Failed (falhou com mensagem de erro)
  - Refresh manual de status
  - Delete com confirmação
  - Informações de fonte (file/url/text)
  - Data de criação

#### 2. Página API Keys (`src/app/admin/api-keys/page.tsx`) - **ENHANCED**
**Novas Features:**
- 🛡️ Seção "Allowed Standards" no dialog de criação
- ✅ Multi-select para Marketplace Standards (checkboxes)
- ✅ Multi-select para Custom Standards (checkboxes)
- 📊 Apenas standards com `status: completed` aparecem
- 🔢 Contador de standards selecionados
- 📝 Descrição de cada standard visível
- 🎨 UI com scrollable containers (max 40vh)
- 🔄 Loading state ao carregar standards
- ⚠️ Mensagem se nenhum standard disponível

#### 3. API Client (`src/lib/api-client.ts`) - **NOVO**
- 🔐 Headers de autenticação automáticos
- 📝 Tipos TypeScript completos:
  - `AllowedStandards`
  - `APIKey`
  - `APIKeyCreate`
  - `APIResponse<T>`
- 🌐 Funções HTTP:
  - `listAPIKeys()`
  - `createAPIKey()`
  - `deleteAPIKey()`
  - `revokeAPIKey()`

#### 4. Componente Checkbox (`src/components/ui/checkbox.tsx`) - **NOVO**
- ✅ Implementação shadcn/ui completa
- 🎨 Integração com Radix UI
- ♿ Acessibilidade completa
- 🎯 Estados focus/disabled/checked

### Documentação

#### 1. CORE_API_MAPPING.md - **NOVO**
- Mapeamento completo da arquitetura
- Identificação de componentes essenciais vs "gordura"
- Documentação das 3 rotinas principais
- Opções de refatoração propostas

#### 2. API_INTEGRATION_GUIDE.md - **NOVO** (1560+ linhas)
**Conteúdo:**
- Exemplos de integração em Python, Node.js, TypeScript, cURL
- Integração MCP para Claude Desktop, Cursor, Vibe Code
- Rotina 1: Process Regularization com exemplos completos
- Rotina 2: Compliance Analysis com RAG
- Rotina 3: Documentation Generation
- Autenticação e rate limiting
- Error handling e best practices

## 🏗️ Arquitetura Implementada

### Firestore Structure
```
global_standards/
  ├── lgpd_br/chunks/...
  ├── iso27001/chunks/...
  └── gdpr_eu/chunks/...

client_standards/
  └── {client_id}/
      ├── custom_abc123/chunks/...
      └── custom_xyz789/chunks/...
```

### AllowedStandards Structure
```typescript
{
  marketplace: ["lgpd_br", "iso27001", "gdpr_eu"],
  custom: ["custom_abc123", "custom_xyz789"]
}
```

### API Key with Standards
```json
{
  "name": "Contracts App - Production",
  "consumer_app_id": "contracts-app",
  "allowed_standards": {
    "marketplace": ["lgpd_br", "iso27001"],
    "custom": ["custom_estatuto"]
  },
  "quotas": { "requests_per_day": 10000 },
  "permissions": ["read", "write"]
}
```

## 🔄 Fluxo de Uso

### 1. Criar Custom Standard
```bash
POST /v1/admin/standards/custom
{
  "name": "Estatuto da Empresa",
  "description": "Regras internas de governança",
  "source_type": "file",
  "source": "/tmp/estatuto.pdf"
}
# → Returns standard_id, status: "pending"
```

### 2. Processar Standard
```bash
POST /v1/admin/standards/custom/{standard_id}/ingest
# → Inicia vetorização em background
# → status: "processing"
```

### 3. Verificar Status
```bash
GET /v1/admin/standards/custom/{standard_id}/status
# → status: "completed", total_chunks: 150
```

### 4. Criar API Key com Standards
```bash
POST /v1/admin/apikeys
{
  "name": "App XYZ",
  "consumer_app_id": "app-xyz",
  "allowed_standards": {
    "marketplace": ["lgpd_br"],
    "custom": ["custom_estatuto"]
  }
}
```

### 5. Usar na Rotina 2 (Compliance)
```bash
POST /v1/process/compliance/analyze
Headers: X-API-Key: npk_xxx
{
  "process": { ... },
  "domain": "contratos",
  # Apenas standards permitidos serão usados
}
```

## 🧪 Test Plan

### Backend Tests
- [ ] Criar marketplace standard via endpoint
- [ ] Criar custom standard (file upload)
- [ ] Criar custom standard (URL)
- [ ] Criar custom standard (texto direto)
- [ ] Verificar status de processamento
- [ ] Listar marketplace standards
- [ ] Listar custom standards por cliente
- [ ] Deletar custom standard
- [ ] Criar API key com allowed_standards
- [ ] Verificar filtragem no search_service
- [ ] Testar compliance analysis com SOA
- [ ] Verificar isolamento entre clientes (custom standards)

### Frontend Tests
- [ ] Acessar /admin/standards
- [ ] Ver tab Marketplace (read-only)
- [ ] Criar standard via upload de arquivo
- [ ] Criar standard via URL
- [ ] Criar standard via texto direto
- [ ] Acompanhar status (pending → processing → completed)
- [ ] Verificar status failed com mensagem de erro
- [ ] Refresh manual de status
- [ ] Deletar custom standard com confirmação
- [ ] Acessar /admin/api-keys
- [ ] Criar API key e ver checkboxes de standards
- [ ] Selecionar marketplace standards
- [ ] Selecionar custom standards
- [ ] Ver contador de standards selecionados
- [ ] Verificar que apenas "completed" aparecem
- [ ] Criar key e copiar para clipboard

### Integration Tests
- [ ] Fluxo completo: criar standard → processar → criar API key → usar em compliance
- [ ] Verificar que API key só acessa standards permitidos
- [ ] Testar com múltiplos clientes (isolamento)
- [ ] Verificar rate limiting
- [ ] Testar error handling em uploads grandes
- [ ] Validar formatos de arquivo aceitos

### MCP Integration Tests
- [ ] Configurar MCP em Claude Desktop
- [ ] Testar Rotina 1 via MCP
- [ ] Testar Rotina 2 via MCP com standards
- [ ] Testar Rotina 3 via MCP

## 📊 Commits Incluídos

- **5bce02d** - feat: adiciona backend para standards marketplace e customizados
- **f72e976** - refactor: migra allowed_standards de List para AllowedStandards
- **c2b01bb** - feat: implementa gestão de standards por cliente e SOA
- **0cb0619** - feat: implementa frontend completo para gestão de standards

## 🚀 Deploy Checklist

### Environment Variables Required
- [ ] `NEXT_PUBLIC_API_URL` no frontend
- [ ] Firebase credentials configuradas
- [ ] Firestore Vector Search habilitado
- [ ] Vertex AI API habilitada
- [ ] Text-embedding-004 disponível

### Database Setup
- [ ] Criar coleções Firestore:
  - `global_standards/{standard_id}/chunks`
  - `client_standards/{client_id}/{standard_id}/chunks`
- [ ] Configurar índices de vector search
- [ ] Popular marketplace standards iniciais (LGPD, ISO27001, etc.)

### Dependencies
```bash
# Backend
pip install fastapi python-multipart firebase-admin google-cloud-aiplatform

# Frontend
npm install @radix-ui/react-checkbox lucide-react sonner
```

## 📝 Breaking Changes

### ⚠️ API Changes
- `allowed_standards` mudou de `List[str]` para `AllowedStandards{marketplace, custom}`
- Endpoint `/v1/admin/knowledge/*` renomeado para `/v1/admin/standards/*`

### 🔄 Migration Required
Se já existem API keys com `allowed_standards: ["lgpd_br"]`:
```python
# Migrar para novo formato
old_format = ["lgpd_br", "iso27001"]
new_format = {
  "marketplace": ["lgpd_br", "iso27001"],
  "custom": []
}
```

## 🎯 Benefícios

1. **Controle Granular**: API keys podem ter acesso específico a standards
2. **Multi-Tenancy**: Custom standards isolados por cliente
3. **Flexibilidade**: 3 fontes de dados (file, URL, text)
4. **Status Tracking**: UI mostra progresso em tempo real
5. **Type Safety**: TypeScript end-to-end
6. **Clean Architecture**: Remoção de componentes desnecessários
7. **Escalabilidade**: Processing assíncrono para grandes volumes
8. **UX Melhorada**: Feedback visual instantâneo

## 📚 Documentação Adicional

- Ver `CORE_API_MAPPING.md` para arquitetura detalhada
- Ver `API_INTEGRATION_GUIDE.md` para exemplos de uso
- Backend: `admin-control-plane/app/routers/standards.py`
- Frontend: `client-portal/src/app/admin/standards/page.tsx`
