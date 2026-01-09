# Guia Completo: Knowledge Bases no Marketplace

Este guia explica como criar, publicar, atualizar e manter Knowledge Bases (KBs) no marketplace do n.process.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Criando uma Knowledge Base](#criando-uma-knowledge-base)
3. [Ingerindo Documentos](#ingerindo-documentos)
4. [Publicando no Marketplace](#publicando-no-marketplace)
5. [Atualizando e Mantendo a KB](#atualizando-e-mantendo-a-kb)
6. [Consumindo a KB](#consumindo-a-kb)
7. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

Uma Knowledge Base no n.process é um repositório de documentos indexados que pode ser:
- **Criada** por administradores
- **Publicada** no marketplace para consumo
- **Atualizada** periodicamente com novos documentos
- **Consumida** via API REST ou MCP (Model Context Protocol)

### Arquitetura RAG (Retrieval-Augmented Generation)

O sistema utiliza **Gemini RAG** para busca e geração de respostas:

1. **Indexação**: Documentos são divididos em chunks e indexados no **Vertex AI Search** (que usa embeddings do Google/Gemini)
2. **Busca Vetorial**: Queries são convertidas em embeddings e buscadas no índice vetorial
3. **Geração**: **Gemini 1.5 Pro/Flash** gera respostas contextuais baseadas nos documentos recuperados

**Stack Tecnológico:**
- **Vector Store**: Vertex AI Search (Discovery Engine)
- **Embeddings**: Google Embedding Models (text-embedding-004)
- **LLM**: Gemini 1.5 Pro/Flash para RAG
- **Chunking**: Estratégias customizadas (Standard/Legal)

### Fluxo de Trabalho

```
1. Criar KB (DRAFT) → 2. Ingerir Documentos → 3. Publicar (ACTIVE) → 4. Atualizar (quando necessário)
```

---

## 📝 Criando uma Knowledge Base

### Endpoint

```http
POST /v1/admin/kbs
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "name": "LGPD Completa 2026",
  "description": "Lei Geral de Proteção de Dados completa e atualizada. Inclui a lei original, regulamentações da ANPD, e orientações práticas para compliance.",
  "category": "lgpd",
  "price_monthly_cents": 9900,
  "update_frequency": "weekly",
  "tags": ["lgpd", "privacidade", "dados pessoais", "anpd", "brasil"],
  "metadata": {
    "version": "2026.1",
    "language": "pt-BR"
  }
}
```

### Categorias Disponíveis

- `lgpd` - Lei Geral de Proteção de Dados (Brasil)
- `gdpr` - General Data Protection Regulation (Europa)
- `sox` - Sarbanes-Oxley Act
- `iso_27001` - ISO 27001
- `iso_27701` - ISO 27701
- `hipaa` - Health Insurance Portability and Accountability Act
- `aneel` - Agência Nacional de Energia Elétrica
- `cvm` - Comissão de Valores Mobiliários
- `bacen` - Banco Central do Brasil
- `custom` - Categoria personalizada

### Frequências de Atualização

- `daily` - Atualização diária
- `weekly` - Atualização semanal
- `monthly` - Atualização mensal
- `on_demand` - Atualização sob demanda

### Resposta

```json
{
  "kb_id": "kb_a1b2c3d4e5f6",
  "name": "LGPD Completa 2026",
  "description": "...",
  "category": "lgpd",
  "status": "draft",
  "price_monthly_cents": 9900,
  "update_frequency": "weekly",
  "document_count": 0,
  "chunk_count": 0,
  "last_updated_at": null,
  "created_at": "2026-01-15T10:30:00Z",
  "created_by": "user_uid_123",
  "tags": ["lgpd", "privacidade", "dados pessoais", "anpd", "brasil"],
  "metadata": {
    "version": "2026.1",
    "language": "pt-BR"
  }
}
```

**Status inicial:** `draft` (não aparece no marketplace ainda)

---

## 📄 Ingerindo Documentos

### Endpoint

```http
POST /v1/admin/kbs/{kb_id}/ingest
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "documents": [
    {
      "content": "Texto completo do documento aqui...",
      "source": "lei_lgpd_13709_2018.pdf",
      "metadata": {
        "title": "Lei nº 13.709/2018 - LGPD",
        "author": "Congresso Nacional",
        "date": "2018-08-14",
        "type": "lei"
      }
    },
    {
      "content": "Outro documento...",
      "source": "resolucao_anpd_01_2020.pdf",
      "metadata": {
        "title": "Resolução ANPD nº 01/2020",
        "author": "ANPD",
        "date": "2020-10-29",
        "type": "resolucao"
      }
    }
  ],
  "replace_existing": false
}
```

### Parâmetros

- `documents`: Lista de documentos para ingerir
  - `content`: Texto completo do documento
  - `source`: Nome/identificador do arquivo fonte
  - `metadata`: Metadados opcionais (título, autor, data, etc.)
- `replace_existing`: 
  - `false` (padrão): Adiciona documentos aos existentes (incremental)
  - `true`: Remove todos os documentos existentes antes de adicionar (substituição completa)

### Resposta

```json
{
  "kb_id": "kb_a1b2c3d4e5f6",
  "documents_ingested": 2,
  "chunks_created": 45,
  "processing_time_ms": 1234.5,
  "errors": []
}
```

### Como Funciona a Ingestão (Gemini RAG Pipeline)

1. **Chunking Automático**: O sistema divide o conteúdo em chunks otimizados para busca
   - **Standard Rolling Window**: Para textos gerais/manuais
   - **Legal/Statute Structure**: Preserva estrutura de artigos/parágrafos para documentos legais
2. **Embeddings (Gemini)**: Cada chunk é convertido em vetor usando modelos de embedding do Google (text-embedding-004)
3. **Indexação**: Chunks e embeddings são indexados no **Vertex AI Search** (Discovery Engine)
4. **Metadados**: Metadados são preservados para filtragem e contexto
5. **RAG Ready**: KB está pronta para busca vetorial e geração com Gemini

---

## 🚀 Publicando no Marketplace

### Endpoint

```http
POST /v1/admin/kbs/{kb_id}/publish
Authorization: Bearer {token}
```

### Pré-requisitos

- A KB deve ter pelo menos 1 documento ingerido (`document_count > 0`)
- Status atual deve ser `draft`

### Resposta

```json
{
  "kb_id": "kb_a1b2c3d4e5f6",
  "name": "LGPD Completa 2026",
  "status": "active",  // ← Mudou para ACTIVE
  "document_count": 2,
  "chunk_count": 45,
  "last_updated_at": "2026-01-15T10:45:00Z",
  ...
}
```

**Após publicar:**
- A KB aparece no marketplace (`GET /v1/admin/kbs/marketplace/list`)
- Clientes podem se inscrever na KB
- A KB pode ser pesquisada via API

---

## 🔄 Atualizando e Mantendo a KB

### Estratégias de Atualização

#### 1. **Atualização Incremental** (Recomendado)

Adiciona novos documentos sem remover os existentes:

```json
{
  "documents": [
    {
      "content": "Nova resolução da ANPD...",
      "source": "resolucao_anpd_02_2026.pdf",
      "metadata": {
        "title": "Resolução ANPD nº 02/2026",
        "date": "2026-01-20",
        "type": "resolucao"
      }
    }
  ],
  "replace_existing": false  // ← Mantém documentos antigos
}
```

**Quando usar:**
- Adicionar novos documentos
- Atualizações parciais
- Manutenção contínua

#### 2. **Substituição Completa**

Remove todos os documentos e adiciona novos:

```json
{
  "documents": [
    {
      "content": "Versão atualizada completa...",
      "source": "lgpd_2026_completa.pdf",
      "metadata": {...}
    }
  ],
  "replace_existing": true  // ← Remove tudo antes de adicionar
}
```

**Quando usar:**
- Revisão completa do conteúdo
- Correção de erros em documentos existentes
- Reestruturação da KB

### Atualizando Metadados da KB

Use `PUT /v1/admin/kbs/{kb_id}` para atualizar informações:

```json
{
  "name": "LGPD Completa 2026 - Atualizada",
  "description": "Nova descrição...",
  "price_monthly_cents": 10900,
  "update_frequency": "weekly",
  "tags": ["lgpd", "privacidade", "dados pessoais", "anpd", "brasil", "2026"]
}
```

### Monitoramento

Verifique o status da KB:

```http
GET /v1/admin/kbs/{kb_id}
```

Campos importantes:
- `document_count`: Total de documentos
- `chunk_count`: Total de chunks indexados
- `last_updated_at`: Última atualização

---

## 🔍 Consumindo a KB

### 1. Via API REST

#### Buscar no Marketplace

```http
GET /v1/admin/kbs/marketplace/list?category=lgpd
Authorization: Bearer {token}
```

#### Inscrever-se na KB

```http
POST /v1/admin/kbs/subscriptions
Authorization: Bearer {token}
Content-Type: application/json

{
  "kb_id": "kb_a1b2c3d4e5f6"
}
```

#### Pesquisar na KB

```http
POST /v1/admin/kbs/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "Quais são os direitos do titular de dados?",
  "kb_ids": ["kb_a1b2c3d4e5f6"],
  "top_k": 5
}
```

### 2. Via MCP (Model Context Protocol)

A KB pode ser acessada via MCP Server do n.process:

```json
{
  "mcpServers": {
    "n.process": {
      "url": "https://nprocess-admin-api-prod-43006907338.us-central1.run.app/mcp/sse",
      "apiKey": "sua_api_key_aqui"
    }
  }
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Criar KB de LGPD

```bash
# 1. Criar KB
curl -X POST https://nprocess-admin-api-prod-43006907338.us-central1.run.app/v1/admin/kbs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LGPD Completa 2026",
    "description": "Lei Geral de Proteção de Dados completa e atualizada",
    "category": "lgpd",
    "price_monthly_cents": 9900,
    "update_frequency": "weekly",
    "tags": ["lgpd", "privacidade", "anpd"]
  }'

# Resposta: {"kb_id": "kb_abc123..."}

# 2. Ingerir documentos
curl -X POST https://nprocess-admin-api-prod-43006907338.us-central1.run.app/v1/admin/kbs/kb_abc123/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "Texto da Lei LGPD...",
        "source": "lei_lgpd.pdf",
        "metadata": {"title": "Lei nº 13.709/2018"}
      }
    ],
    "replace_existing": false
  }'

# 3. Publicar
curl -X POST https://nprocess-admin-api-prod-43006907338.us-central1.run.app/v1/admin/kbs/kb_abc123/publish \
  -H "Authorization: Bearer $TOKEN"
```

### Exemplo 2: Atualizar KB Existente

```bash
# Adicionar nova resolução da ANPD
curl -X POST https://nprocess-admin-api-prod-43006907338.us-central1.run.app/v1/admin/kbs/kb_abc123/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "Nova resolução da ANPD...",
        "source": "resolucao_anpd_02_2026.pdf",
        "metadata": {
          "title": "Resolução ANPD nº 02/2026",
          "date": "2026-01-20"
        }
      }
    ],
    "replace_existing": false
  }'
```

### Exemplo 3: Revisão Completa

```bash
# Substituir todo o conteúdo
curl -X POST https://nprocess-admin-api-prod-43006907338.us-central1.run.app/v1/admin/kbs/kb_abc123/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "Versão revisada e atualizada...",
        "source": "lgpd_2026_revisada.pdf",
        "metadata": {"version": "2026.2"}
      }
    ],
    "replace_existing": true
  }'
```

---

## 📊 Checklist de Manutenção

### Semanal (para KBs com `update_frequency: "weekly"`)

- [ ] Verificar se há novos documentos/atualizações
- [ ] Ingerir novos documentos com `replace_existing: false`
- [ ] Atualizar `last_updated_at` (automático)
- [ ] Verificar `document_count` e `chunk_count`

### Mensal (para KBs com `update_frequency: "monthly"`)

- [ ] Revisar qualidade dos documentos
- [ ] Verificar se há documentos desatualizados
- [ ] Considerar substituição completa se necessário
- [ ] Atualizar metadados (preço, descrição, tags)

### Quando Necessário (`on_demand`)

- [ ] Atualizar quando houver mudanças regulatórias
- [ ] Corrigir erros em documentos existentes
- [ ] Adicionar novos documentos relacionados

---

## ⚠️ Boas Práticas

1. **Nunca publique KB vazia**: Sempre ingira documentos antes de publicar
2. **Use metadados consistentes**: Facilita busca e filtragem
3. **Documente as fontes**: Use `source` e `metadata` para rastreabilidade
4. **Atualize regularmente**: Mantenha a KB atualizada conforme `update_frequency`
5. **Monitore o uso**: Verifique quantos clientes estão inscritos
6. **Teste antes de publicar**: Use busca para validar qualidade

---

## 🔗 Referências

- **API Docs**: `https://nprocess-admin-api-prod-43006907338.us-central1.run.app/docs`
- **Swagger UI**: `https://nprocess-admin-api-prod-43006907338.us-central1.run.app/swagger`
- **ReDoc**: `https://nprocess-admin-api-prod-43006907338.us-central1.run.app/redoc`

---

## ❓ Suporte

Para dúvidas ou problemas:
1. Verifique os logs da API
2. Consulte a documentação Swagger
3. Entre em contato com o time de suporte
