# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-12-23

### 🎉 Release Inicial

#### Adicionado
- **API REST completa** para análise de compliance de processos
  - Geração de diagramas BPMN a partir de descrições textuais
  - Gestão de processos no Firestore
  - Análise de compliance usando IA (Vertex AI Gemini 1.5 Pro)
  - Endpoints de documentação integrados

- **Frontend Next.js** com design system ness
  - Dashboard principal
  - Página de geração de diagramas
  - Página de listagem de processos
  - Página de análise de compliance
  - Página de documentação
  - Componente DiagramViewer para renderizar Mermaid

- **Admin Dashboard** completo
  - Gestão de API keys
  - Monitoramento de serviços
  - FinOps dashboard
  - Consumer management

- **RegulatoryRAG API**
  - Busca semântica de regulamentações
  - Integração com Vertex AI Search
  - Cache com Redis

- **MCP Servers**
  - Integração com Claude Desktop, VS Code, Cursor
  - Gateway HTTP para aplicações web
  - TypeScript client library

- **CI/CD completo**
  - GitHub Actions workflows
  - Testes automatizados
  - Deploy automático para Cloud Run
  - Security scanning

- **Documentação completa**
  - Manual de integração (Python, JavaScript, cURL, Go)
  - Exemplos de prompts para ferramentas de IA
  - Guia de autenticação
  - Quick start guide
  - Guia para rodar sem IA
  - Documentação organizada em `docs/`

- **Infraestrutura**
  - Deploy no Google Cloud Run
  - Docker containers otimizados
  - Cloud Build configuration
  - Health checks e monitoring

#### Configuração
- **CODEOWNERS** configurado para definir responsáveis
- **Branch protection** guidelines criadas
- **LICENSE** MIT adicionada
- **Badges** no README (release, Python, FastAPI, License)
- **Tag v1.0.0** criada e publicada

#### Melhorias
- IA opcional (pode rodar apenas com gestão de processos)
- Endpoints de documentação expostos via API
- Organização de documentação em pasta dedicada
- Guias de manutenção e branch protection

### Tecnologias
- **Backend**: Python 3.11+, FastAPI
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Database**: Google Cloud Firestore
- **IA**: Vertex AI (Gemini 1.5 Pro)
- **Infraestrutura**: Google Cloud Run, Docker
- **CI/CD**: GitHub Actions

### Documentação
- [docs/INTEGRATION.md](docs/INTEGRATION.md) - Manual de integração
- [docs/PROMPTS_EXAMPLES.md](docs/PROMPTS_EXAMPLES.md) - Exemplos de prompts
- [docs/QUICK_START.md](docs/QUICK_START.md) - Guia rápido
- [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) - Autenticação
- [docs/RUN_WITHOUT_AI.md](docs/RUN_WITHOUT_AI.md) - Modo sem IA

---

## Formato do Changelog

### Tipos de Mudanças
- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Depreciado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correção de bugs
- `Segurança` para vulnerabilidades

[1.0.0]: https://github.com/resper1965/nprocess/releases/tag/v1.0.0

