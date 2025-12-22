# ComplianceEngine API Constitution

## Core Principles

### I. API-First Architecture
Todas as funcionalidades devem ser expostas via API REST seguindo padrões RESTful. A API é o contrato principal do sistema e deve ser bem documentada (OpenAPI/Swagger). Endpoints devem seguir convenções REST: GET para leitura, POST para criação, uso adequado de códigos HTTP e mensagens de erro padronizadas.

### II. Cloud-Native Design (NON-NEGOTIABLE)
O projeto é projetado para Google Cloud Platform. Todas as decisões arquiteturais devem considerar:
- Escalabilidade horizontal no Cloud Run
- Uso de serviços gerenciados do GCP (Firestore, Vertex AI)
- Stateless design para permitir múltiplas instâncias
- Application Default Credentials (ADC) para autenticação
- Configuração via variáveis de ambiente

### III. Type Safety & Validation (NON-NEGOTIABLE)
Pydantic é obrigatório para validação de dados. Todos os modelos de entrada/saída devem:
- Usar Pydantic BaseModel com validação rigorosa
- Incluir Field descriptions para documentação automática
- Validar tipos, ranges e formatos
- Retornar erros de validação claros e estruturados
- Nunca confiar em dados não validados

### IV. AI Service Abstraction
Serviços de IA devem ser abstraídos através de interfaces claras. O AIService deve:
- Ser independente do provedor específico (atualmente Vertex AI, mas preparado para mudanças)
- Retornar estruturas de dados padronizadas
- Tratar erros de forma graciosa com fallbacks quando apropriado
- Permitir mock/stub para testes locais

### V. Testing & Quality
Testes são obrigatórios para novas funcionalidades:
- Testes unitários para lógica de negócio
- Testes de integração para endpoints da API
- Cobertura mínima de 70% para código crítico
- Uso de pytest com fixtures apropriadas
- Testes devem ser executáveis localmente sem dependências do GCP (usar mocks)

### VI. Observability
Logging estruturado é obrigatório:
- Usar Python logging module com níveis apropriados
- Logs devem incluir contexto suficiente para debugging
- Integração com Cloud Logging quando em produção
- Health checks devem ser implementados para monitoramento

### VII. Documentation First
Documentação deve ser mantida junto com o código:
- README.md atualizado com instruções claras
- Docstrings em todas as funções públicas
- Exemplos de uso em pasta `examples/`
- Documentação da API via FastAPI (automática)
- Comentários explicam "por quê", não "o quê"

## Technology Stack Constraints

### Required Technologies
- **Language**: Python 3.11+
- **Web Framework**: FastAPI
- **Validation**: Pydantic 2.x
- **Database**: Google Cloud Firestore
- **AI/ML**: Vertex AI (Gemini 1.5 Pro)
- **Deployment**: Google Cloud Run
- **Containerization**: Docker

### Prohibited Practices
- Não usar bibliotecas não suportadas no Cloud Run
- Não fazer chamadas síncronas bloqueantes em endpoints async
- Não armazenar estado em memória entre requisições
- Não hardcodar credenciais ou configurações sensíveis
- Não ignorar erros silenciosamente

## Development Workflow

### Code Quality Gates
1. **Linting**: Código deve passar em flake8 sem erros críticos
2. **Formatting**: Código deve seguir black (line-length: 100)
3. **Type Checking**: mypy deve ser usado para type hints (quando aplicável)
4. **Tests**: Todos os testes devem passar antes de merge

### Git Workflow
- Branch `main` é a branch padrão e deve estar sempre deployável
- Features devem ser desenvolvidas em branches separadas
- Commits devem ter mensagens descritivas seguindo conventional commits
- PRs devem incluir descrição clara das mudanças

### Environment Management
- `.env.example` deve documentar todas as variáveis necessárias
- `.env` nunca deve ser commitado (já no .gitignore)
- Configurações sensíveis via variáveis de ambiente ou Secret Manager
- Suporte a múltiplos ambientes (dev, staging, prod)

## API Design Standards

### Endpoint Naming
- Usar substantivos no plural para recursos: `/v1/processes`, `/v1/compliance/analyses`
- Verbos apenas em ações específicas quando necessário
- Versão da API no path: `/v1/...`

### Response Format
- Sucesso: Retornar dados no formato especificado pelos schemas Pydantic
- Erro: Usar ErrorResponse schema padronizado com código HTTP apropriado
- Sempre incluir timestamps em formato ISO 8601
- IDs devem ser strings opacas (não sequenciais)

### Error Handling
- 400: Bad Request (validação falhou)
- 404: Not Found (recurso não existe)
- 422: Unprocessable Entity (dados válidos mas lógica falhou)
- 500: Internal Server Error (erro inesperado)
- Todos os erros devem incluir mensagem clara e detalhes quando apropriado

## Data Management

### Firestore Structure
- Coleções devem seguir padrão de nomenclatura consistente
- Documentos devem incluir metadados: `created_at`, `updated_at`
- Queries devem ser otimizadas (índices quando necessário)
- Não fazer queries sem limites em produção

### Data Validation
- Validar dados na entrada (Pydantic)
- Validar dados antes de salvar no Firestore
- Não confiar em dados já persistidos (re-validar quando necessário)

## Security & Compliance

### Authentication (Future)
- Preparar estrutura para autenticação JWT/OAuth2
- Endpoints sensíveis devem requerer autenticação
- Rate limiting deve ser implementado para endpoints públicos

### Data Privacy
- Não logar dados sensíveis (PII)
- Respeitar LGPD/GDPR em análises de compliance
- Dados devem ser criptografados em trânsito (HTTPS obrigatório)

## Governance

Esta constituição supera todas as outras práticas e decisões arquiteturais. 

### Amendment Process
- Mudanças na constituição requerem:
  1. Documentação clara da razão
  2. Análise de impacto
  3. Aprovação do time
  4. Atualização desta versão

### Compliance Verification
- Code reviews devem verificar conformidade com esta constituição
- Violações devem ser documentadas e corrigidas
- Complexidade adicional deve ser justificada

### Version History
- **Version**: 1.0.0
- **Ratified**: 2025-12-22
- **Last Amended**: 2025-12-22
