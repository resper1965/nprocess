# Guia de Configuração: Integração MCP (Model Context Protocol)

Este guia explica como conectar o **Claude Desktop** ou **Cursor IDE** ao ecossistema n.process via MCP.

> [!NOTE]
> O MCP (Model Context Protocol) permite que a IA execute ferramentas diretamente na nossa plataforma, sem que você precise copiar e colar dados.

## 1. Pré-requisitos

1.  Uma conta **Administrador** no portal n.process.
2.  Uma **API Key** válida (gerada no menu _Developers > API Keys_).

## 2. Endpoints do Servidor

O servidor MCP está hospedado junto com a API Administrativa.

- **URL Base**: `https://nprocess-admin-api-prod-43006907338.us-central1.run.app`
- **Transporte**: SSE (Server-Sent Events)
- **SSE URL**: `/mcp/sse`
- **Messages URL**: `/mcp/messages`

## 3. Configuração (Claude Desktop)

Edite o arquivo de configuração do Claude Desktop:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Adicione a seguinte configuração:

```json
{
  "mcpServers": {
    "nprocess-b4b": {
      "command": "",
      "url": "https://nprocess-admin-api-prod-43006907338.us-central1.run.app/mcp/sse",
      "transport": "sse",
      "headers": {
        "X-API-Key": "SUA_API_KEY_AQUI"
      }
    }
  }
}
```

> [!IMPORTANT]
> Substitua `SUA_API_KEY_AQUI` pela chave real gerada no dashboard.

## 4. Ferramentas Disponíveis

Uma vez conectado, o Claude terá acesso às seguintes ferramentas:

### 4.1. `normalize_process_workflow`

- **O que faz**: Transforma descrição textual em BPMN/Mermaid.
- **Exemplo de Prompt**: _"Analise este processo de compras e gere o diagrama."_

### 4.2. `audit_workflow_compliance`

- **O que faz**: Audita um processo contra uma regulação (ISO, GDPR, etc).
- **Exemplo de Prompt**: _"Audite o processo acima contra a ISO 27001."_

### 4.3. `suggest_compliance_documents`

- **O que faz**: Lista documentos (evidências) faltantes.
- **Exemplo de Prompt**: _"Quais documentos eu preciso criar para passar na auditoria?"_

### 4.4. `generate_document_template`

- **O que faz**: Cria o template Markdown do documento.
- **Exemplo de Prompt**: _"Gere o template da Política de Mesa Limpa."_

## 5. Soluções de Problemas

- **Erro de Conexão**: Verifique se a URL está correta e se a API Admin está online (`/health`).
- **Erro 401/403**: Verifique se sua API Key é válida e tem permissão de Admin.
- **Erro 500**: Verifique os logs do Cloud Run.

---

**Suporte**: Em caso de dúvidas, contacte `devops@nprocess.com.br`
