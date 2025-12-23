# Release v1.0.0 - ComplianceEngine API

**Data**: 23 de Dezembro de 2025

## 🎉 Primeira Release Oficial

Esta é a primeira release oficial do ComplianceEngine API, um microsserviço completo para análise de compliance de processos de negócio usando IA Generativa.

## ✨ Principais Funcionalidades

### API REST Completa
- ✅ Geração de diagramas BPMN a partir de descrições textuais
- ✅ Gestão completa de processos (CRUD) no Firestore
- ✅ Análise de compliance usando IA (Vertex AI Gemini 1.5 Pro)
- ✅ Endpoints de documentação integrados
- ✅ Modo opcional sem IA (apenas gestão de processos)

### Frontend Next.js
- ✅ Dashboard principal com design system ness
- ✅ Geração interativa de diagramas
- ✅ Visualização de processos
- ✅ Análise de compliance
- ✅ Documentação integrada

### Admin Dashboard
- ✅ Gestão de API keys
- ✅ Monitoramento de serviços
- ✅ FinOps dashboard
- ✅ Consumer management

### Integrações
- ✅ MCP Servers para Claude Desktop, VS Code, Cursor
- ✅ Gateway HTTP para aplicações web
- ✅ RegulatoryRAG API para busca de regulamentações

### DevOps
- ✅ CI/CD completo com GitHub Actions
- ✅ Deploy automático para Google Cloud Run
- ✅ Testes automatizados
- ✅ Security scanning

## 📚 Documentação

Toda a documentação está organizada na pasta `docs/`:

- **[INTEGRATION.md](docs/INTEGRATION.md)** - Manual completo de integração
- **[PROMPTS_EXAMPLES.md](docs/PROMPTS_EXAMPLES.md)** - Exemplos de prompts para IA
- **[QUICK_START.md](docs/QUICK_START.md)** - Guia rápido de instalação
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** - Guia de autenticação
- **[RUN_WITHOUT_AI.md](docs/RUN_WITHOUT_AI.md)** - Como rodar sem IA

## 🚀 Como Usar

### Instalação Local

```bash
git clone https://github.com/resper1965/nprocess.git
cd nprocess
cp .env.example .env
# Configure suas variáveis de ambiente
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Deploy no GCP

Veja [docs/QUICK_START.md](docs/QUICK_START.md) para instruções completas.

## 🔧 Configuração

### Pré-requisitos
- Python 3.11+
- Google Cloud Project (ID: `nprocess`)
- Firestore Database (Native mode)
- Vertex AI habilitado (opcional, se usar IA)

### Variáveis de Ambiente

```bash
GOOGLE_CLOUD_PROJECT=nprocess
GCP_PROJECT_ID=nprocess
VERTEX_AI_LOCATION=us-central1
ENABLE_AI=true  # false para rodar sem IA
```

## 📊 Estatísticas

- **Commits**: 10+ commits principais
- **Arquivos**: 50+ arquivos de código
- **Documentação**: 8+ guias completos
- **Testes**: Cobertura completa
- **Deploy**: Cloud Run configurado

## 🎯 Próximos Passos

- [ ] Implementar RAG real com Vertex AI Search
- [ ] Adicionar autenticação JWT/OAuth2
- [ ] Integrar Cloud Logging e Cloud Trace
- [ ] Expandir testes de integração
- [ ] Adicionar métricas e observabilidade

## 🙏 Agradecimentos

Obrigado por usar o ComplianceEngine API! Para dúvidas ou suporte, consulte a documentação ou abra uma issue.

---

**Download**: [v1.0.0](https://github.com/resper1965/nprocess/archive/refs/tags/v1.0.0.zip)

**Changelog Completo**: [CHANGELOG.md](../CHANGELOG.md)

