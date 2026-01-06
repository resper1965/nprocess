# Guia de Consumo do Dashboard - ComplianceEngine

## 🎯 Visão Geral

O ComplianceEngine oferece **duas formas** de acessar o dashboard:

1. **Dashboard via API** - Consumir dados via endpoints REST (para integração)
2. **Dashboard no Frontend** - Interface visual web (para visualização)

---

## 📊 Dashboard via API

### URL Base

```
https://compliance-engine-5wqihg7s7a-uc.a.run.app
```

### Autenticação

Todos os endpoints requerem **API Key**:

```bash
Authorization: Bearer ce_live_<sua-api-key>
```

> 💡 **Como obter API Key**: Acesse `/api-keys` no frontend ou veja [docs/INTEGRATION.md](INTEGRATION.md)

---

## 🔗 Endpoints Disponíveis

### 1. Dashboard Geral

**Endpoint**: `GET /v1/compliance/dashboard`

**Descrição**: Retorna dashboard geral com estatísticas por domínio regulatório

**Parâmetros**:
- `months` (opcional): Número de meses para tendências (padrão: 12)

**Exemplo**:

```bash
curl -X GET \
  "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/dashboard?months=12" \
  -H "Authorization: Bearer ce_live_<sua-api-key>"
```

**Resposta**:

```json
{
  "overall_score": 85.5,
  "total_processes": 42,
  "compliant_processes": 35,
  "non_compliant_processes": 7,
  "domains": [
    {
      "domain": "LGPD",
      "total_processes": 15,
      "compliant_processes": 12,
      "non_compliant_processes": 3,
      "average_score": 88.2,
      "trends": [...]
    },
    {
      "domain": "GDPR",
      "total_processes": 10,
      "compliant_processes": 9,
      "non_compliant_processes": 1,
      "average_score": 92.5,
      "trends": [...]
    }
  ],
  "recent_alerts": [...],
  "trends": [...],
  "generated_at": "2025-12-23T20:00:00Z"
}
```

---

### 2. Dashboard por Domínio

**Endpoint**: `GET /v1/compliance/domains/{domain}`

**Descrição**: Retorna dashboard específico para um domínio regulatório (LGPD, GDPR, SOX, etc.)

**Parâmetros**:
- `domain` (path): Domínio regulatório (ex: `LGPD`, `GDPR`, `SOX`)
- `months` (query, opcional): Número de meses para tendências (padrão: 12)

**Exemplo**:

```bash
curl -X GET \
  "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/domains/LGPD?months=6" \
  -H "Authorization: Bearer ce_live_<sua-api-key>"
```

**Resposta**:

```json
{
  "domain": "LGPD",
  "total_processes": 15,
  "compliant_processes": 12,
  "non_compliant_processes": 3,
  "average_score": 88.2,
  "trends": [
    {
      "date": "2025-11-01",
      "score": 85.0,
      "process_count": 14,
      "compliant_count": 11,
      "non_compliant_count": 3
    }
  ],
  "alerts": [
    {
      "process_id": "abc123",
      "process_name": "Processo de Vendas",
      "severity": "high",
      "message": "Falta consentimento explícito",
      "score": 65.0
    }
  ]
}
```

---

### 3. Processos por Domínio

**Endpoint**: `GET /v1/compliance/domains/{domain}/processes`

**Descrição**: Lista todos os processos de um domínio com status de compliance

**Parâmetros**:
- `domain` (path): Domínio regulatório
- `limit` (query, opcional): Número máximo de resultados (padrão: 50)

**Exemplo**:

```bash
curl -X GET \
  "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/domains/LGPD/processes?limit=100" \
  -H "Authorization: Bearer ce_live_<sua-api-key>"
```

---

### 4. Tendências por Domínio

**Endpoint**: `GET /v1/compliance/domains/{domain}/trends`

**Descrição**: Retorna tendências de compliance ao longo do tempo

**Parâmetros**:
- `domain` (path): Domínio regulatório
- `months` (query, opcional): Número de meses (padrão: 12)

**Exemplo**:

```bash
curl -X GET \
  "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/domains/LGPD/trends?months=12" \
  -H "Authorization: Bearer ce_live_<sua-api-key>"
```

---

### 5. Relatório por Domínio

**Endpoint**: `GET /v1/compliance/domains/{domain}/report`

**Descrição**: Retorna relatório detalhado de compliance (JSON por enquanto, PDF no futuro)

**Exemplo**:

```bash
curl -X GET \
  "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/domains/LGPD/report" \
  -H "Authorization: Bearer ce_live_<sua-api-key>"
```

---

## 💻 Exemplos de Código

### Python

```python
import httpx

API_URL = "https://compliance-engine-5wqihg7s7a-uc.a.run.app"
API_KEY = "ce_live_<sua-api-key>"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Dashboard geral
response = httpx.get(
    f"{API_URL}/v1/compliance/dashboard?months=12",
    headers=headers
)
dashboard = response.json()

print(f"Score geral: {dashboard['overall_score']}")
print(f"Processos: {dashboard['total_processes']}")

# Dashboard por domínio
response = httpx.get(
    f"{API_URL}/v1/compliance/domains/LGPD",
    headers=headers
)
lgpd_dashboard = response.json()

print(f"LGPD - Score médio: {lgpd_dashboard['average_score']}")
print(f"LGPD - Processos conformes: {lgpd_dashboard['compliant_processes']}")
```

### JavaScript/TypeScript

```typescript
const API_URL = 'https://compliance-engine-5wqihg7s7a-uc.a.run.app';
const API_KEY = 'ce_live_<sua-api-key>';

async function getDashboard() {
  const response = await fetch(
    `${API_URL}/v1/compliance/dashboard?months=12`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const dashboard = await response.json();
  
  console.log('Score geral:', dashboard.overall_score);
  console.log('Processos:', dashboard.total_processes);
  
  return dashboard;
}

async function getDomainDashboard(domain: string) {
  const response = await fetch(
    `${API_URL}/v1/compliance/domains/${domain}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return await response.json();
}

// Uso
getDashboard().then(dashboard => {
  console.log('Dashboard:', dashboard);
});

getDomainDashboard('LGPD').then(lgpd => {
  console.log('LGPD Dashboard:', lgpd);
});
```

### cURL

```bash
# Dashboard geral
curl -X GET \
  "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/dashboard" \
  -H "Authorization: Bearer ce_live_<sua-api-key>"

# Dashboard LGPD
curl -X GET \
  "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/domains/LGPD" \
  -H "Authorization: Bearer ce_live_<sua-api-key>"

# Processos LGPD
curl -X GET \
  "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/domains/LGPD/processes" \
  -H "Authorization: Bearer ce_live_<sua-api-key>"
```

---

## 🌐 Dashboard no Frontend (Interface Web)

### Acesso

**URL**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app

**Custom Domain**: https://nprocess.ness.com.br (aguardando SSL)

### Funcionalidades

1. **Dashboard Principal** (`/`)
   - Visão geral de processos
   - Estatísticas rápidas
   - Ações rápidas
   - Atividade recente

2. **Navegação**
   - Dashboard
   - Generate (gerar diagramas)
   - Processes (listar processos)
   - Analysis (análise de compliance)
   - API Keys (gerenciar chaves)
   - Documentation (documentação)

### Como Usar

1. Acesse o frontend: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
2. O dashboard principal é exibido automaticamente
3. Navegue pelo menu lateral para outras funcionalidades

> ⚠️ **Nota**: O frontend é uma interface de demonstração. Para produção, consuma a API diretamente.

---

## 📚 Documentação Adicional

- **Swagger UI**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **ReDoc**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc
- **Manual de Integração**: [docs/INTEGRATION.md](INTEGRATION.md)
- **Guia de API Keys**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🔑 Obter API Key

1. Acesse: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app/api-keys
2. Clique em "Create API Key"
3. Preencha o formulário
4. **⚠️ IMPORTANTE**: Salve a chave imediatamente (ela só é mostrada uma vez!)

Ou via API (requer autenticação admin):

```bash
POST /v1/api-keys
Authorization: Bearer admin_token
{
  "name": "Minha Aplicação",
  "consumer_app_id": "my-app"
}
```

---

## ❓ Dúvidas Frequentes

**Q: Preciso de API Key para acessar o frontend?**  
A: Não. O frontend é uma interface de demonstração. Para consumir a API, você precisa de uma API Key.

**Q: Posso integrar o dashboard na minha aplicação?**  
A: Sim! Use os endpoints REST (`/v1/compliance/dashboard`) para obter os dados e crie sua própria interface.

**Q: O dashboard mostra dados em tempo real?**  
A: Os dados são atualizados quando você faz análises de compliance. Use `/v1/compliance/realtime` para scores em tempo real.

**Q: Como exportar relatórios?**  
A: Use `/v1/compliance/domains/{domain}/report` (JSON por enquanto, PDF no futuro).

