# Quick Start - nProcess

**Guia rápido para acessar e consumir a aplicação nProcess**

---

## 🚀 Como Acessar a Aplicação

### Control Panel / Admin Dashboard

**URL**: https://nprocess.ness.com.br

Este é o painel de controle principal onde você pode:
- 🔑 Gerenciar API Keys
- 💰 Controlar custos (FinOps)
- 📊 Ver analytics e métricas
- 👥 Gerenciar consumidores
- 🔍 Monitorar serviços

**Autenticação**: Use as credenciais configuradas no sistema.

---

## 🔌 Como Consumir a API

### 1. Obter API Key

**Opção A: Via Admin Dashboard**
1. Acesse: https://nprocess.ness.com.br
2. Vá para seção "API Keys"
3. Crie uma nova API Key
4. Copie a chave (ela só é mostrada uma vez!)

**Opção B: Via API (se auto-serviço estiver habilitado)**
```bash
POST /v1/my/api-keys
Content-Type: application/json

{
  "name": "minha-app",
  "description": "API Key para minha aplicação"
}
```

### 2. Usar a API Key

Todas as requisições devem incluir a API Key no header:

```bash
# Opção 1: Header X-API-Key
curl -H "X-API-Key: sua-api-key-aqui" \
  https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/health

# Opção 2: Authorization Bearer
curl -H "Authorization: Bearer sua-api-key-aqui" \
  https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/health
```

### 3. Endpoints Principais

**Base URL**: `https://compliance-engine-5wqihg7s7a-uc.a.run.app`

#### Health Check
```bash
GET /v1/health
```

#### Gerar Diagrama de Processo
```bash
POST /v1/diagrams/generate
Content-Type: application/json
X-API-Key: sua-api-key

{
  "description": "Processo de aprovação de contrato",
  "format": "mermaid"
}
```

#### Analisar Compliance
```bash
POST /v1/analyze
Content-Type: application/json
X-API-Key: sua-api-key

{
  "process_id": "processo-123",
  "domain": "financeiro"
}
```

#### Documentação Completa (Swagger)
Acesse: `https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs`

---

## 📝 Exemplo de Integração

### Python

```python
import requests

API_URL = "https://compliance-engine-5wqihg7s7a-uc.a.run.app"
API_KEY = "sua-api-key-aqui"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Gerar diagrama
response = requests.post(
    f"{API_URL}/v1/diagrams/generate",
    headers=headers,
    json={
        "description": "Processo de aprovação de contrato",
        "format": "mermaid"
    }
)

diagram = response.json()
print(diagram["diagram"])
```

### JavaScript/Node.js

```javascript
const API_URL = 'https://compliance-engine-5wqihg7s7a-uc.a.run.app';
const API_KEY = 'sua-api-key-aqui';

async function generateDiagram(description) {
  const response = await fetch(`${API_URL}/v1/diagrams/generate`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description,
      format: 'mermaid'
    })
  });
  
  const data = await response.json();
  return data.diagram;
}
```

### cURL

```bash
# Gerar diagrama
curl -X POST \
  https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/diagrams/generate \
  -H "X-API-Key: sua-api-key-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Processo de aprovação de contrato",
    "format": "mermaid"
  }'
```

---

## 🔗 Links Úteis

- **Control Panel**: https://nprocess.ness.com.br
- **API Base URL**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **API Docs (Swagger)**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **Firebase Console**: https://console.firebase.google.com/project/nprocess-33a44

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `docs/INTEGRATION.md` - Guia completo de integração
- `docs/API_REFERENCE.md` - Referência completa da API
- `README.md` - Documentação principal do projeto
