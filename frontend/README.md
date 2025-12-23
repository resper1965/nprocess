# ComplianceEngine - Frontend Demo

⚠️ **IMPORTANTE**: Este frontend é apenas uma **interface de demonstração e teste** da ComplianceEngine API.

## 🎯 Propósito

Este frontend NÃO é uma aplicação final para usuários. É apenas uma interface visual para:

- **Testar** os endpoints da API
- **Demonstrar** as funcionalidades disponíveis
- **Acessar** documentação e exemplos

## ✅ Uso Real da API

A **ComplianceEngine API** deve ser **consumida diretamente** por outras aplicações via chamadas HTTP:

```python
# Exemplo: Integração em Python
import httpx

response = httpx.post(
    "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/diagrams/generate",
    headers={"Authorization": "Bearer ce_live_<sua-api-key>"},
    json={"description": "Processo de aprovação de compras..."}
)
```

## 📖 Documentação Completa

- **Manual de Integração**: `/v1/docs/integration`
- **Exemplos de Prompts**: `/v1/docs/prompts`
- **Swagger UI**: `https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs`
- **ReDoc**: `https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc`

## 🚀 Como Usar Este Frontend (Demo)

### Desenvolvimento Local

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

### Produção

URL: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app

**Nota**: Use apenas para testes. Para produção, integre a API diretamente na sua aplicação.

## 🔑 Autenticação

Este frontend usa a API sem autenticação para demonstração. Em produção, você deve:

1. Obter uma API Key via Admin Dashboard
2. Incluir no header: `Authorization: Bearer ce_live_<sua-chave>`

## 📚 Para Desenvolvedores

Se você está desenvolvendo uma aplicação que precisa de:
- Geração de diagramas BPMN
- Análise de compliance
- Gestão de processos

**Consuma a API diretamente** - veja [docs/INTEGRATION.md](../docs/INTEGRATION.md)
