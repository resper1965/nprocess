# Especificação do Backend

## 1. Estrutura de Pastas (Clean Architecture)
/app
  /core (Config, Security, Logging)
  /routers (Endpoints v1)
  /services (Lógica de Negócio)
    /ai (Factory do Vertex AI)
    /ingestion (Pipeline de dados)
    /knowledge (RAG Logic)
  /mcp (Servidor MCP)

## 2. Knowledge Ops (RAG Avançado)
O sistema de ingestão deve suportar **Strategy Pattern** para Chunking:
- **Estratégia Padrão:** Janela deslizante (Tokens).
- **Estratégia Legal (Diferencial):** Parser que respeita estrutura de leis (Artigos, Parágrafos, Incisos). Não quebrar no meio de uma frase jurídica.

## 3. Pipeline Assíncrono
Endpoints de análise (Compliance) devem seguir o padrão:
1. Recebe Request.
2. Salva Job ID "PENDING".
3. Envia para **Cloud Tasks**.
4. Retorna 202 Accepted.
5. Worker processa e atualiza Job ID para "COMPLETED" ou chama Webhook.

## 4. MCP Server
Implementar servidor MCP via SSE (`/mcp/sse`) expondo as tools:
- `generate_bpmn`
- `audit_compliance`
- `search_knowledge_base`
