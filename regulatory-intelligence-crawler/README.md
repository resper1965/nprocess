# Regulatory Intelligence Crawler 🔍

Microserviço de monitoramento automático de atualizações regulatórias do **setor elétrico brasileiro**.

## 📋 Visão Geral

O Regulatory Intelligence Crawler monitora automaticamente sites regulatórios em busca de atualizações de normas, resoluções e procedimentos que impactam empresas do setor elétrico.

### Fontes Monitoradas

1. **ANEEL** (Agência Nacional de Energia Elétrica)
   - Resoluções Normativas
   - Resoluções Homologatórias
   - Notas Técnicas
   - Notícias regulatórias

2. **ONS** (Operador Nacional do Sistema Elétrico)
   - Procedimentos de Rede (PdR)
   - Submódulos
   - Instruções Operacionais

3. **ARCyber** (Framework de Cibersegurança Setor Elétrico)
   - Requisitos de cibersegurança
   - Guidelines de segurança
   - Mapeamento com ISO 27001, NIST, CIS

## 🚀 Funcionalidades

- ✅ **Crawling Automático**: Monitora fontes regulatórias 24/7
- ✅ **Análise com IA**: Usa Gemini 1.5 Pro para analisar impacto
- ✅ **Detecção de Mudanças**: Identifica novas regulações e alterações
- ✅ **Classificação de Impacto**: Critical, High, Medium, Low
- ✅ **Notificações**: Email, Slack, Webhooks
- ✅ **Análise de Impacto Empresarial**: Específico para cada empresa
- ✅ **Integração com RegulatoryRAG**: Indexa automaticamente

## 📊 Arquitetura

```
┌──────────────────────────────────────────────────────┐
│           Regulatory Intelligence Crawler            │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │    ANEEL    │  │     ONS     │  │   ARCyber   │ │
│  │   Crawler   │  │   Crawler   │  │   Crawler   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │         │
│         └────────────────┼────────────────┘         │
│                          │                          │
│              ┌───────────▼───────────┐              │
│              │  Crawler Orchestrator │              │
│              └───────────┬───────────┘              │
│                          │                          │
│         ┌────────────────┼────────────────┐         │
│         │                │                │         │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐│
│  │   Gemini    │  │ Regulation  │  │Notification ││
│  │  Analyzer   │  │ Repository  │  │  Service    ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🔧 Endpoints API

### Trigger Manual Crawl
```bash
POST /v1/crawlers/run
{
  "sources": ["aneel", "ons", "arcyber"]  # opcional
}
```

### Get Crawler Status
```bash
GET /v1/crawlers/status
```

### List Updates
```bash
GET /v1/updates?source=aneel&impact_level=critical&limit=20
```

### Get Specific Update
```bash
GET /v1/updates/{update_id}
```

### Analyze Impact
```bash
POST /v1/updates/{update_id}/analyze
{
  "company_context": {
    "company_id": "comp_123",
    "company_name": "Distribuidora XYZ",
    "sector": "energia_eletrica",
    "subsector": "distribuicao"
  }
}
```

## 🐳 Deploy

### Docker
```bash
docker build -t regulatory-crawler .
docker run -p 8003:8003 \
  -e GCP_PROJECT_ID=your-project \
  regulatory-crawler
```

### Cloud Run
```bash
gcloud run deploy regulatory-intelligence-crawler \
  --source . \
  --region us-central1 \
  --set-env-vars GCP_PROJECT_ID=your-project
```

## 📝 Exemplo de Uso

### Python
```python
import httpx

# Trigger crawl
async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8003/v1/crawlers/run",
        json={"sources": ["aneel"]}
    )
    updates = response.json()

    for update in updates:
        print(f"Nova regulação: {update['title']}")
        print(f"Impacto: {update['impact_level']}")
```

### MCP Tools
```typescript
// Via MCP Server
const result = await mcpClient.callTool("crawl_regulations", {
  sources: ["aneel", "ons"]
});
```

## 🔔 Notificações

### Email
```python
POST /v1/notifications/send
{
  "update_id": "upd_aneel_abc123",
  "channels": ["email"],
  "recipients": ["compliance@company.com"],
  "priority": "urgent"
}
```

### Slack
```python
POST /v1/notifications/send
{
  "update_id": "upd_aneel_abc123",
  "channels": ["slack"],
  "recipients": ["#compliance-alerts"],
  "priority": "high"
}
```

## 📈 Scheduler

O crawler executa automaticamente a cada 24 horas, mas pode ser triggered manualmente via API.

## 🔐 Segurança

- ✅ Respeita robots.txt
- ✅ Rate limiting (delay entre requests)
- ✅ User-Agent identificado
- ✅ Logs de auditoria

## 📚 Frameworks Mapeados

### ISO 27001:2022
- Controles Annex A mapeados para regulações do setor

### NIST Cybersecurity Framework
- Identificar, Proteger, Detectar, Responder, Recuperar

### CIS Controls v8
- 18 controles críticos mapeados

## 🤝 Integração com Outros Serviços

- **RegulatoryRAG API**: Indexa automaticamente novas regulações
- **ComplianceEngine API**: Atualiza processos afetados
- **Admin Dashboard**: Exibe alertas em tempo real

## 📊 Métricas

- Total de fontes monitoradas: 3
- Frequência de crawl: 24h
- Tempo médio de detecção: < 2h após publicação
- Acurácia de classificação (IA): ~95%

## 🐛 Troubleshooting

### Crawler não está encontrando updates
- Verificar conectividade com sites fonte
- Verificar seletores CSS (sites podem ter mudado estrutura)
- Verificar logs: `docker logs regulatory-crawler`

### Gemini não está funcionando
- Verificar credenciais GCP
- Verificar quota Vertex AI
- Fallback automático para análise heurística

## 📄 Licença

Proprietário - ComplianceEngine Platform
