# ComplianceEngine API Constitution

**Última Atualização**: 2025-12-23  
**Versão**: 2.0  
**Status**: Projeto 75% completo

---

## Core Principles

### I. API-First Architecture
Todas as funcionalidades devem ser expostas via API REST seguindo padrões RESTful. A API é o contrato principal do sistema e deve ser bem documentada (OpenAPI/Swagger). Endpoints devem seguir convenções REST: GET para leitura, POST para criação, uso adequado de códigos HTTP e mensagens de erro padronizadas.

### II. Cloud-Native Design (NON-NEGOTIABLE)
O projeto é projetado para Google Cloud Platform. Todas as decisões arquiteturais devem considerar:
- Escalabilidade horizontal no Cloud Run
- Uso de serviços gerenciados do GCP (Firestore, Vertex AI, Cloud Storage)
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
- Ser opcional (ENABLE_AI=false permite rodar sem IA)

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
- Documentação de API via Swagger/ReDoc
- Guias de integração para desenvolvedores

### VIII. Security by Default
Segurança deve ser considerada em todas as decisões:
- API Keys obrigatórias para todos os endpoints (exceto health)
- Bcrypt para hashing de chaves
- Validação de permissões por API key
- Rate limiting (em implementação)
- WAF configuration (planejado)
- Secret Manager para credenciais (planejado)

### IX. Self-Service API Keys
Usuários devem poder gerenciar suas próprias API keys:
- Endpoints `/v1/my/api-keys` para self-service
- Interface no frontend para gestão
- Visualização de consumo e estatísticas
- Preparação para controle de custos

### X. Feature Completeness
Todas as funcionalidades planejadas devem ser implementadas:
- ✅ Webhooks e notificações
- ✅ Versionamento de processos
- ✅ Templates de processos
- ✅ Tags e categorização
- ✅ Workflow de aprovação
- ✅ Busca avançada
- ✅ Dashboard de compliance
- ✅ Backup e restore
- ✅ AI para sugestões
- ✅ Compliance score em tempo real
- ✅ Marketplace de templates

---

## Current Status

### Implementado (75%)
- ✅ Core API completa (100%)
- ✅ Frontend funcional (90%)
- ✅ MCP Servers (100%)
- ✅ Documentação (95%)
- ✅ Deploy automatizado (80%)

### Em Progresso (25%)
- ⏳ Produção readiness (rate limiting, WAF, secrets)
- ⏳ Admin Dashboard deploy
- ⏳ Serviços adicionais (Crawler, Document Generator, RegulatoryRAG)
- ⏳ Monitoring completo

---

## Project Context

**GCP Project ID**: `nprocess`  
**GCP Project Number**: `273624403528`  
**Região Principal**: `us-central1`

**URLs Produção**:
- API: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- Frontend: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
- Custom Domain: https://nprocess.ness.com.br (aguardando SSL)

**Stack Principal**:
- Backend: Python 3.11+, FastAPI, Firestore, Vertex AI
- Frontend: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- MCP: Node.js, TypeScript
- DevOps: Cloud Run, Cloud Build, Docker

---

## Next Priorities

1. **Rate Limiting** (CRÍTICO para produção)
2. **Admin Dashboard Deploy**
3. **Monitoring e Alerting**
4. **WAF + Secret Manager**
