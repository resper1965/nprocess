# Feature Specification: ComplianceEngine API - Baseline Implementation

**Feature Branch**: `main`  
**Created**: 2025-12-22  
**Status**: Implemented  
**Input**: Microsserviço (API REST) para análise de compliance de processos de negócio usando IA Generativa

## User Scenarios & Testing

### User Story 1 - Geração de Diagramas BPMN (Priority: P1)

Usuários podem fornecer uma descrição textual de um processo de negócio e receber um diagrama BPMN em formato Mermaid.js, junto com o texto normalizado e metadados do processo.

**Why this priority**: Esta é a funcionalidade core que permite a entrada de dados do usuário. Sem ela, não há processo para analisar.

**Independent Test**: Pode ser testado completamente fazendo uma requisição POST para `/v1/diagrams/generate` com uma descrição de processo e verificando que retorna código Mermaid válido, texto normalizado e metadados.

**Acceptance Scenarios**:

1. **Given** uma descrição textual de processo válida, **When** o usuário faz POST para `/v1/diagrams/generate`, **Then** recebe resposta 200 com `mermaid_code`, `normalized_text` e `metadata`
2. **Given** uma descrição vazia ou inválida, **When** o usuário faz POST, **Then** recebe erro 422 com mensagem de validação clara
3. **Given** um contexto adicional fornecido, **When** o diagrama é gerado, **Then** o contexto é considerado na geração

---

### User Story 2 - Gestão de Processos (Priority: P1)

Usuários podem salvar processos validados no Firestore, recuperar processos por ID e listar processos com filtros opcionais.

**Why this priority**: Necessário para persistir processos gerados e permitir análises futuras. Sem persistência, cada análise precisaria regenerar o processo.

**Independent Test**: Pode ser testado criando um processo via POST `/v1/processes`, recuperando via GET `/v1/processes/{id}` e listando via GET `/v1/processes`.

**Acceptance Scenarios**:

1. **Given** dados completos de um processo, **When** o usuário faz POST para `/v1/processes`, **Then** recebe 201 com `process_id` e processo é salvo no Firestore
2. **Given** um `process_id` válido, **When** o usuário faz GET `/v1/processes/{id}`, **Then** recebe 200 com dados completos do processo
3. **Given** um `process_id` inexistente, **When** o usuário faz GET, **Then** recebe 404
4. **Given** parâmetros de filtro (domain, limit), **When** o usuário faz GET `/v1/processes`, **Then** recebe lista filtrada de processos

---

### User Story 3 - Análise de Compliance (Priority: P1)

Usuários podem analisar um processo salvo contra regulamentações específicas (LGPD, SOX, GDPR, etc.) e receber gaps de conformidade, sugestões de melhoria e score geral.

**Why this priority**: Esta é a funcionalidade de valor principal - identificar problemas de compliance e sugerir correções.

**Independent Test**: Pode ser testado criando um processo, fazendo POST para `/v1/compliance/analyze` e verificando que retorna análise com gaps, sugestões e score.

**Acceptance Scenarios**:

1. **Given** um `process_id` válido e domínio de compliance, **When** o usuário faz POST `/v1/compliance/analyze`, **Then** recebe 200 com `analysis_id`, `overall_score`, `gaps` e `suggestions`
2. **Given** um processo inexistente, **When** o usuário tenta analisar, **Then** recebe 404
3. **Given** uma análise concluída, **When** o usuário faz GET `/v1/compliance/analyses/{id}`, **Then** recebe dados completos da análise
4. **Given** contexto adicional fornecido, **When** a análise é executada, **Then** o contexto é considerado na análise

---

### Edge Cases

- O que acontece quando o Vertex AI retorna erro ou timeout?
- Como o sistema lida com Firestore indisponível?
- O que acontece com requisições concorrentes para o mesmo processo?
- Como validar código Mermaid gerado antes de retornar?
- O que acontece quando regulamentos não são encontrados no RAG (mock atual)?

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE gerar diagramas BPMN em formato Mermaid.js a partir de descrições textuais usando Vertex AI Gemini 1.5 Pro
- **FR-002**: Sistema DEVE normalizar e estruturar descrições de processos antes de gerar diagramas
- **FR-003**: Sistema DEVE extrair metadados de processos (atores, atividades, pontos de decisão)
- **FR-004**: Sistema DEVE persistir processos completos no Firestore com estrutura validada
- **FR-005**: Sistema DEVE permitir recuperação de processos por ID único
- **FR-006**: Sistema DEVE permitir listagem de processos com filtros (domain, limit)
- **FR-007**: Sistema DEVE analisar processos contra regulamentações usando IA e RAG
- **FR-008**: Sistema DEVE identificar gaps de conformidade com severidade (high, medium, low)
- **FR-009**: Sistema DEVE gerar sugestões de melhoria com prioridade e esforço estimado
- **FR-010**: Sistema DEVE calcular score geral de compliance (0-100)
- **FR-011**: Sistema DEVE persistir análises no Firestore para histórico
- **FR-012**: Sistema DEVE fornecer endpoints de health check (`/` e `/health`)
- **FR-013**: Sistema DEVE validar todos os dados de entrada usando Pydantic
- **FR-014**: Sistema DEVE retornar erros estruturados com códigos HTTP apropriados
- **FR-015**: Sistema DEVE suportar CORS configurável para desenvolvimento

### Key Entities

- **Process**: Representa um processo de negócio completo com nome, descrição, código Mermaid, nós, fluxos e metadados. Armazenado no Firestore.
- **Analysis**: Representa uma análise de compliance de um processo, incluindo score, gaps, sugestões e metadados. Armazenado no Firestore.
- **Diagram**: Representa o resultado da geração de diagrama, incluindo código Mermaid, texto normalizado e metadados. Não persistido, apenas retornado.
- **Gap**: Representa um gap de conformidade identificado, com severidade, regulamento, artigo, descrição e recomendações.
- **Suggestion**: Representa uma sugestão de melhoria, com tipo, título, descrição, prioridade e esforço estimado.

## Success Criteria

### Measurable Outcomes

- **SC-001**: API responde a requisições de health check em menos de 200ms (p95)
- **SC-002**: Geração de diagramas completa em menos de 30 segundos (p95)
- **SC-003**: Análise de compliance completa em menos de 60 segundos (p95)
- **SC-004**: Sistema suporta 100 requisições concorrentes sem degradação
- **SC-005**: 95% das requisições retornam código HTTP correto (200, 201, 400, 404, 422, 500)
- **SC-006**: Todos os endpoints retornam dados validados conforme schemas Pydantic
- **SC-007**: Documentação da API (Swagger) está acessível e completa em `/docs`
- **SC-008**: Sistema pode ser deployado no Cloud Run sem erros de configuração

## Technical Constraints

### Required Technologies
- Python 3.11+
- FastAPI 0.115.0+
- Pydantic 2.x
- Google Cloud Firestore
- Vertex AI (Gemini 1.5 Pro)
- Google Cloud Run

### Architecture Decisions
- API RESTful com versionamento (`/v1/...`)
- Validação rigorosa com Pydantic
- Async/await para operações I/O
- Application Default Credentials para GCP
- Stateless design para escalabilidade
- Docker para containerização

## Implementation Status

### ✅ Implemented
- Estrutura base da API FastAPI
- Endpoints de geração de diagramas
- Endpoints de gestão de processos (CRUD)
- Endpoints de análise de compliance
- Integração com Vertex AI
- Integração com Firestore
- Schemas Pydantic completos
- Health checks
- Tratamento de erros
- CORS middleware
- Dockerfile e docker-compose
- Scripts de deploy
- Testes básicos
- Exemplos de uso

### ⚠️ Partially Implemented
- RAG para recuperação de regulamentos (atualmente mockado)
- Observabilidade (logging básico, falta Cloud Logging/Trace)

### ❌ Not Implemented
- Autenticação JWT/OAuth2
- Rate limiting
- Cache de resultados
- Webhooks para notificações
- Exportação de relatórios
- Dashboard/UI

## Dependencies

### External Services
- Google Cloud Platform (Firestore, Vertex AI, Cloud Run)
- Application Default Credentials configuradas

### Internal Dependencies
- Nenhuma dependência interna (microsserviço standalone)

## Assumptions

1. Usuários têm acesso ao GCP e credenciais configuradas
2. Firestore está em modo Native (não Datastore)
3. Vertex AI está habilitado no projeto GCP
4. RAG será implementado posteriormente (atualmente mock)
5. Autenticação será adicionada em fase futura
6. Processos são criados manualmente ou via API (não há importação em lote)

## Notes

Este é o baseline do projeto já implementado. Futuras features devem seguir o processo de especificação do spec-kit, criando novas specs em `specs/###-feature-name/`.


