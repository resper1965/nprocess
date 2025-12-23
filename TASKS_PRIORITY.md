# Tarefas Prioritárias - ComplianceEngine

**Data**: 2025-12-23  
**Status**: 75% completo  
**Foco**: Produção Readiness

---

## 🔴 PRIORIDADE CRÍTICA (Fazer Agora)

### 1. Rate Limiting em Produção ⚠️ CRÍTICO
**Por quê**: Sem rate limiting, a API está vulnerável a abuso e custos descontrolados.

**O que fazer**:
- [ ] Implementar rate limiting robusto em todos os endpoints da API
- [ ] Configurar limites por API key (requests/min, /day, /month)
- [ ] Usar Redis ou Cloud Memorystore para tracking
- [ ] Adicionar headers de rate limit nas respostas (`X-RateLimit-*`)
- [ ] Implementar retry-after quando limite excedido
- [ ] Dashboard de monitoramento de rate limits

**Arquivos a modificar**:
- `app/middleware/rate_limit.py` (criar)
- `app/main.py` (integrar middleware)
- `app/services/apikey_service.py` (adicionar tracking)

**Estimativa**: 3-5 dias  
**Impacto**: 🔴 CRÍTICO - Bloqueia produção segura

---

### 2. Monitoring e Observabilidade ⚠️ CRÍTICO
**Por quê**: Sem visibilidade, não há como detectar problemas em produção.

**O que fazer**:
- [ ] Integrar Cloud Logging estruturado
- [ ] Configurar Cloud Trace para rastreamento distribuído
- [ ] Criar métricas customizadas (Cloud Monitoring):
  - Taxa de erro por endpoint
  - Latência (P50, P95, P99)
  - Throughput (requests/segundo)
  - Uso de API keys
  - Custos por API key
- [ ] Configurar alertas:
  - Taxa de erro > 1%
  - Latência P95 > 1s
  - Uptime < 99.9%
  - Custo diário > threshold
- [ ] Dashboard no GCP Console
- [ ] Health checks avançados (dependências)

**Arquivos a criar/modificar**:
- `app/middleware/logging.py` (criar)
- `app/middleware/tracing.py` (criar)
- `app/services/metrics_service.py` (criar)
- `app/main.py` (integrar)

**Estimativa**: 3-5 dias  
**Impacto**: 🔴 CRÍTICO - Essencial para produção

---

### 3. Secret Manager Integration ⚠️ IMPORTANTE
**Por quê**: Credenciais hardcoded são risco de segurança.

**O que fazer**:
- [ ] Migrar variáveis sensíveis para Secret Manager:
  - API keys de serviços externos
  - Tokens de autenticação
  - Chaves de criptografia
- [ ] Atualizar código para buscar secrets do Secret Manager
- [ ] Configurar rotação automática de secrets
- [ ] Documentar processo de gestão de secrets

**Arquivos a modificar**:
- `app/services/secret_service.py` (criar)
- `.env.example` (atualizar)
- `app/main.py` (integrar)

**Estimativa**: 2-3 dias  
**Impacto**: 🟡 IMPORTANTE - Segurança

---

## 🟡 PRIORIDADE ALTA (Próximas 2 Semanas)

### 4. Admin Dashboard Deploy
**Por quê**: Necessário para gerenciar API keys, custos e analytics.

**O que fazer**:
- [ ] Criar `admin-dashboard/cloudbuild.yaml`
- [ ] Configurar variáveis de ambiente
- [ ] Fazer deploy no Cloud Run
- [ ] Configurar autenticação (NextAuth + Google Cloud IAM)
- [ ] Integrar com API backend
- [ ] Testar fluxo completo

**Arquivos**:
- `admin-dashboard/cloudbuild.yaml` (criar)
- `admin-dashboard/.env.example` (atualizar)

**Estimativa**: 3-5 dias  
**Impacto**: 🟡 ALTA - Gestão da plataforma

---

### 5. WAF (Web Application Firewall)
**Por quê**: Proteção contra ataques comuns.

**O que fazer**:
- [ ] Configurar Cloud Armor
- [ ] Criar security policy
- [ ] Configurar regras:
  - Rate limiting global
  - Bloqueio de IPs suspeitos
  - Proteção contra SQL injection
  - Proteção contra XSS
- [ ] Aplicar WAF aos serviços Cloud Run

**Comandos**:
```bash
gcloud compute security-policies create compliance-waf
gcloud compute security-policies rules create 1000 \
  --security-policy compliance-waf \
  --expression "true" \
  --action "rate-based-ban" \
  --rate-limit-threshold-count 100 \
  --rate-limit-threshold-interval-sec 60
```

**Estimativa**: 1-2 dias  
**Impacto**: 🟡 ALTA - Segurança

---

### 6. Testes Automatizados
**Por quê**: Garantir qualidade antes de produção.

**O que fazer**:
- [ ] Configurar pytest e fixtures
- [ ] Testes unitários para services críticos
- [ ] Testes de integração para endpoints
- [ ] Mock de serviços externos
- [ ] CI/CD com testes automáticos
- [ ] Cobertura mínima: 70%

**Estrutura**:
```
tests/
├── unit/
│   ├── test_services/
│   └── test_routers/
├── integration/
│   └── test_api_endpoints.py
└── e2e/
    └── test_complete_flows.py
```

**Estimativa**: 1-2 semanas  
**Impacto**: 🟡 ALTA - Qualidade

---

## 🟢 PRIORIDADE MÉDIA (Próximas 4 Semanas)

### 7. RAG Real (Vertex AI Search)
**Por quê**: Melhorar qualidade das análises de compliance.

**O que fazer**:
- [ ] Configurar Vertex AI Search data store
- [ ] Coletar regulamentações (LGPD, GDPR, SOX, etc.)
- [ ] Upload e indexação de documentos
- [ ] Substituir mock por RAG real
- [ ] Testes de qualidade de busca
- [ ] Cache de resultados

**Estimativa**: 1-2 semanas  
**Impacto**: 🟢 MÉDIA - Melhoria de qualidade

---

### 8. Deploy Serviços Adicionais
**Por quê**: Completar ecossistema da plataforma.

**Serviços**:
- [ ] Regulatory Intelligence Crawler
- [ ] Document Generator Engine
- [ ] RegulatoryRAG API

**O que fazer**:
- [ ] Criar cloudbuild.yaml para cada serviço
- [ ] Configurar variáveis de ambiente
- [ ] Fazer deploy no Cloud Run
- [ ] Integrar com API principal
- [ ] Testar integrações

**Estimativa**: 1 semana por serviço  
**Impacto**: 🟢 MÉDIA - Funcionalidades adicionais

---

### 9. Frontend - Dashboard de Compliance
**Por quê**: Visualização completa de métricas.

**O que fazer**:
- [ ] Integrar endpoint `/v1/compliance/dashboard` no frontend
- [ ] Criar visualizações de gráficos
- [ ] Mostrar tendências por domínio
- [ ] Alertas e notificações
- [ ] Exportação de relatórios (PDF)

**Estimativa**: 3-5 dias  
**Impacto**: 🟢 MÉDIA - UX

---

## 📋 Checklist Resumido

### Esta Semana (Crítico)
- [ ] Rate limiting
- [ ] Monitoring básico
- [ ] Secret Manager

### Próximas 2 Semanas (Alto)
- [ ] Admin Dashboard deploy
- [ ] WAF
- [ ] Testes básicos

### Próximas 4 Semanas (Médio)
- [ ] RAG real
- [ ] Deploy serviços adicionais
- [ ] Frontend completo

---

## 🎯 Ordem Recomendada de Execução

1. **Rate Limiting** (3-5 dias) - 🔴 CRÍTICO
2. **Monitoring** (3-5 dias) - 🔴 CRÍTICO
3. **Secret Manager** (2-3 dias) - 🟡 IMPORTANTE
4. **Admin Dashboard Deploy** (3-5 dias) - 🟡 ALTA
5. **WAF** (1-2 dias) - 🟡 ALTA
6. **Testes** (1-2 semanas) - 🟡 ALTA
7. **RAG Real** (1-2 semanas) - 🟢 MÉDIA
8. **Serviços Adicionais** (3 semanas) - 🟢 MÉDIA

**Total estimado**: 6-8 semanas para produção completa

---

## 💡 Notas Importantes

- **Rate limiting** e **monitoring** são bloqueadores para produção
- **Admin Dashboard** é necessário para gestão operacional
- **Testes** devem ser feitos em paralelo com outras tarefas
- **RAG real** pode ser feito depois, mas melhora qualidade

---

**Última atualização**: 2025-12-23

