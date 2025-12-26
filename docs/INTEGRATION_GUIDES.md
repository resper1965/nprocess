# Documentação de Integração nProcess

Este arquivo contém as especificações técnicas da API e sugestões de prompts para delegar tarefas de implementação a agentes de IA ou desenvolvedores.

---

## 📚 1. Especificação Técnica (Referência)

### Visão Geral

O **nProcess** é um motor de compliance stateless. Ele não armazena sessões ou estado do usuário. O cliente (Front/Backend) é responsável por manter o estado e fornecer contexto rico a cada requisição.

### Endpoints Principais

| Método | Endpoint                 | Descrição                                                     |
| :----- | :----------------------- | :------------------------------------------------------------ |
| `POST` | `/v1/modeling/generate`  | Gera diagrama BPMN a partir de texto.                         |
| `POST` | `/v1/compliance/analyze` | Realiza auditoria de conformidade em um processo estruturado. |

### Contrato de Dados (JSON Payload)

#### Auditoria (`/v1/compliance/analyze`)

Requisição obrigatória para validar um processo:

```json
{
  "process": {
    "name": "Nome do Processo",
    "description": "Descrição detalhada...",
    "mermaid_code": "graph TD; A-->B...",
    "nodes": [{ "id": "A", "type": "task", "label": "Label Visual" }],
    "flows": [{ "from_node": "A", "to_node": "B" }]
  },
  "domain": "LGPD",
  "additional_context": "Setor Financeiro",
  "process_id": "opcional_externo_123"
}
```

---

## 🤖 2. Sugestões de Prompt (Copy & Paste)

Use estes prompts para instruir sua equipe ou agentes de IA sobre como integrar com o nProcess.

### Opção A: Prompt para Desenvolvedor Frontend/Integration

```text
# Role: Senior Frontend Architect
Você deve construir a camada de cliente para o motor 'nProcess'.

# 1. Gestão de Estado (CRÍTICO)
- O nprocess é STATELESS. Você DEVE persistir o histórico de chat e versões do diagrama no Firestore do seu lado.
- Todo request para `/v1/compliance/analyze` precisa enviar o objeto 'process' COMPLETO (nodes, flows, mermaid), e não apenas o delta.

# 2. UI/UX Requirements
- **Drafting:** Renderize o `mermaid_code` retornado em tempo real.
- **Reviewing:** Ao receber o array `gaps` da API, desenhe bordas vermelhas nos nós afetados (`affected_nodes`) no diagrama visual.
- **Async Feedback:** A auditoria demora. Implemente 'Optimistic UI' ou mostre um esqueleto de carregamento ("Auditor analisando..."). NÃO bloqueie a tela.

# 3. Payload da API
Siga estritamente este JSON para a auditoria:
{
  "process": { "mermaid_code": "...", "nodes": [...] },
  "domain": "LGPD",
  "additional_context": "..."
}
```

### Opção B: Prompt para Engenheiro de MCP (AI Agents)

```text
# Role: AI Systems Engineer (MCP)
Sua missão é criar um MCP Server para o nProcess, permitindo que IAs (Claude/Cursor) o usem como ferramenta.

# Tools a Implementar

1. `audit_compliance(process_json: dict, standard: str)`
   - **Desc:** "Audita um processo de negócio contra uma norma exigida."
   - **Input:** Deve receber o objeto ProcessDefinition completo conforme schema Pydantic, não apenas string.
   - **Output:** Retorna lista textual de Gaps e Sugestões.

2. `generate_diagram(text: str)`
   - **Desc:** "Cria um diagrama BPMN a partir de texto."
   - **Output:** Retorna código Mermaid.

# Regras
- As tools devem ser wrappers stateless para a API REST (`http://localhost:8000`).
- Valide os inputs com Zod/Pydantic antes de chamar a API.
- Se a API retornar erro 422, formate uma mensagem amigável explicando qual campo faltou.
```

### Opção C: Prompt para Engenheiro Backend (Knowledge Ingestion)

```text
# Role: Senior Python Backend Engineer (GCP & AI Specialist)

Você foi encarregado de construir o **Módulo de Ingestão de Conhecimento (Knowledge Ingestion Engine)** do sistema `nprocess`.

# Objetivo
Escrever o código Python (Cloud Functions/Run) que implementa um pipeline de ingestão modular (Strategy Pattern).

# NON-FUNCTIONAL CONSTRAINT (CRITICAL)
Você está ESTRITAMENTE PROIBIDO de usar as APIs de "Discovery Engine" ou "Vertex AI Agent Builder" para ingestão automática de documentos.
Você DEVE escrever a lógica de "Chunking" e "Parsing" manualmente em Python. O Vertex AI deve ser usado APENAS para gerar embeddings (`TextEmbeddingModel`).

# Especificações Técnicas

## 1. Arquitetura (Strategy Pattern)
Implemente uma classe abstrata `IngestionStrategy` e três implementações:
- **`LegalTextStrategy`**: Para Leis (LGPD). Corte por Artigo/Parágrafo, não por caracteres.
- **`TechnicalStandardStrategy`**: Para Excel (ISO/NIST). Cada linha é um documento.
- **`WebWatchStrategy`**: Para CVM/ANEEL. Use BeautifulSoup e implemente **Hash Check (MD5)** para evitar processar conteúdo inalterado.

## 2. Schema de Saída
Lista de dicts para vetorização:
{
  "content": "Texto limpo...",
  "metadata": { "source_id": "...", "hierarchy": "Art.5" }
}
```
