# Documentação ComplianceEngine API

Índice completo da documentação do projeto.

## 📚 Guias Principais

### Para Desenvolvedores

- **[INTEGRATION.md](INTEGRATION.md)** - Manual completo de integração
  - Exemplos em Python, JavaScript, TypeScript, Go, cURL
  - Padrões de autenticação
  - Tratamento de erros
  - Boas práticas

- **[QUICK_START.md](QUICK_START.md)** - Guia rápido de instalação
  - Setup local em 5 minutos
  - Configuração do GCP
  - Primeiros passos

- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Guia de autenticação
  - Application Default Credentials (ADC)
  - Service Account Keys
  - Futuras integrações JWT/OAuth2

- **[SECURITY.md](SECURITY.md)** - Segurança e autenticação
  - Sistema de API Keys
  - Proteção de endpoints
  - Segurança do MCP
  - Rate limiting
  - Boas práticas de segurança

### Para IAs de Desenvolvimento

- **[AI_INTEGRATION_GUIDE.md](AI_INTEGRATION_GUIDE.md)** - Guia de integração para IAs
  - Documento específico para Cursor, Claude Code, Antigravity, etc.
  - Como integrar ComplianceEngine em aplicações
  - Exemplos de código completos
  - Segurança e API keys
  - Checklist de integração

- **[PROMPTS_EXAMPLES.md](PROMPTS_EXAMPLES.md)** - Exemplos de prompts
  - Prompts para Cursor
  - Prompts para Claude Code
  - Prompts para Antigravity
  - Dicas de prompting eficaz

### Configuração e Deploy

- **[RUN_WITHOUT_AI.md](RUN_WITHOUT_AI.md)** - Rodar sem IA
  - Configuração para modo sem IA
  - Endpoints disponíveis
  - Casos de uso

- **[DEPLOY_STATUS.md](DEPLOY_STATUS.md)** - Status de deploy
  - Informações sobre deploy atual
  - URLs dos serviços
  - Status de saúde

### Propostas e Planejamento

- **[FRONTEND_PROPOSAL.md](FRONTEND_PROPOSAL.md)** - Proposta do frontend
  - Arquitetura proposta
  - Design system ness
  - Roadmap de implementação

## 🔗 Links Úteis

- **API Swagger**: `/docs` (quando API estiver rodando)
- **API ReDoc**: `/redoc` (quando API estiver rodando)
- **Repositório**: [GitHub](https://github.com/resper1965/nprocess)
- **Releases**: [Tags](https://github.com/resper1965/nprocess/releases)

## 📖 Estrutura da Documentação

```
docs/
├── README.md                 # Este arquivo (índice)
├── AI_INTEGRATION_GUIDE.md   # Guia para IAs de desenvolvimento
├── INTEGRATION.md            # Manual de integração
├── PROMPTS_EXAMPLES.md       # Exemplos de prompts
├── AUTHENTICATION.md         # Guia de autenticação
├── SECURITY.md               # Segurança e autenticação
├── QUICK_START.md            # Guia rápido
├── RUN_WITHOUT_AI.md         # Modo sem IA
├── DEPLOY_STATUS.md          # Status de deploy
└── FRONTEND_PROPOSAL.md      # Proposta do frontend
```

## 🆘 Precisa de Ajuda?

1. **Para IAs de desenvolvimento**: Comece com [AI_INTEGRATION_GUIDE.md](AI_INTEGRATION_GUIDE.md)
2. Consulte o [QUICK_START.md](QUICK_START.md) para setup inicial
3. Veja [INTEGRATION.md](INTEGRATION.md) para exemplos de código
4. Verifique [SECURITY.md](SECURITY.md) e [AUTHENTICATION.md](AUTHENTICATION.md) para segurança
5. Use [PROMPTS_EXAMPLES.md](PROMPTS_EXAMPLES.md) para prompts de IA

