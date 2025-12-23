# ComplianceEngine API

[![Release](https://img.shields.io/badge/release-v1.0.0-blue.svg)](https://github.com/resper1965/nprocess/releases/tag/v1.0.0)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Microsserviço (API REST)** para análise de compliance de processos de negócio usando IA Generativa.

## 🎯 Propósito

O **ComplianceEngine API** é um **serviço especializado** projetado para ser **integrado em outras aplicações** via chamadas HTTP. 

> ⚠️ **IMPORTANTE**: Esta é uma **API**, não uma aplicação final. Deve ser consumida por outras aplicações.

### Para Quem é Esta API?

Esta API foi desenvolvida para ser consumida por:
- **Sistemas ERP/CRM**: Adicionar análise de compliance aos processos internos
- **Plataformas de Gestão de Processos**: Enriquecer processos com análise automática de conformidade
- **Ferramentas de Auditoria**: Gerar relatórios de compliance automaticamente
- **Aplicações de Governança**: Monitorar conformidade regulatória em tempo real
- **Sistemas de Documentação**: Gerar diagramas BPMN a partir de documentação textual

### Capacidades Principais

1. **Geração de Diagramas BPMN**: Converte descrições textuais de processos em diagramas Mermaid.js
2. **Gestão de Processos**: Armazena e gerencia processos validados no Firestore
3. **Análise de Compliance**: Identifica gaps de conformidade regulatória (LGPD, SOX, GDPR, etc.) usando IA

> 📖 **Manual de Integração Completo**: Veja [docs/INTEGRATION.md](docs/INTEGRATION.md) para guias detalhados de integração em Python, JavaScript, cURL e mais.

---

## 🚀 Como Usar a API

### 1. Acessar a API

**URL Produção**: `https://compliance-engine-5wqihg7s7a-uc.a.run.app`

**Documentação Interativa**:
- **Swagger UI**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **ReDoc**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc

### 2. Obter API Key

Para consumir a API, você precisa de uma API Key:

1. **Via Admin Dashboard** (quando disponível):
   - Acesse o Admin Dashboard
   - Vá para "API Keys"
   - Crie uma nova chave
   - ⚠️ A chave é mostrada apenas uma vez!

2. **Via API** (requer autenticação admin):
   ```bash
   POST /v1/api-keys
   Authorization: Bearer admin_token
   ```

### 3. Consumir a API

```python
import httpx

# Gerar diagrama BPMN
response = httpx.post(
    "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/diagrams/generate",
    headers={"Authorization": "Bearer ce_live_<sua-api-key>"},
    json={
        "description": "Processo de aprovação de compras: funcionário solicita, gerente aprova, financeiro processa pagamento"
    }
)
```

Veja [docs/INTEGRATION.md](docs/INTEGRATION.md) para mais exemplos.

---

## 📦 Componentes do Projeto

### 1. **API Backend** (`app/`)
Microsserviço REST principal - **Este é o produto principal**

- **URL**: `https://compliance-engine-5wqihg7s7a-uc.a.run.app`
- **Status**: ✅ Em produção
- **Como acessar**: Via chamadas HTTP (REST API)

### 2. **Admin Dashboard** (`admin-dashboard/`)
Interface administrativa para gerenciar a plataforma

- **Funcionalidades**: API Keys, FinOps, Analytics, Monitoramento
- **Status**: 📝 Especificado, implementação parcial
- **Acesso**: A ser definido após deploy completo
- **Público**: Administradores da plataforma

### 3. **Frontend Demo** (`frontend/`)
Interface de demonstração/teste da API

- **URL**: `https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app`
- **Status**: ✅ Deployado
- **⚠️ IMPORTANTE**: Use apenas para testes/demo. Para produção, consuma a API diretamente.

---

## 📚 Documentação

- **[Manual de Integração](docs/INTEGRATION.md)**: Guia completo de integração
- **[Guia do Dashboard](docs/DASHBOARD_GUIDE.md)**: Como consumir o dashboard (API e Frontend)
- **[Guia para IAs](docs/AI_INTEGRATION_GUIDE.md)**: Como IAs de desenvolvimento podem integrar
- **[Arquitetura](docs/ARCHITECTURE.md)**: Visão geral da arquitetura
- **[Visão Geral do Projeto](docs/PROJECT_OVERVIEW.md)**: Documentação completa

---

## 🏗️ Stack Tecnológica

- **Linguagem**: Python 3.11+
- **Framework Web**: FastAPI
- **Banco de Dados**: Google Cloud Firestore
- **IA Generativa**: Vertex AI (Gemini 1.5 Pro)
- **Infraestrutura**: Google Cloud Run (Docker)

---

## 🔑 Autenticação

A API requer **API Key** para todos os endpoints (exceto `/health`):

```
Authorization: Bearer ce_live_<sua-api-key>
```

Formato: `ce_live_<64 caracteres hexadecimais>`

---

## 📖 Exemplos de Uso

### Gerar Diagrama BPMN

```bash
curl -X POST "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/diagrams/generate" \
  -H "Authorization: Bearer ce_live_<sua-chave>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Processo de aprovação de compras..."
  }'
```

### Analisar Compliance

```bash
curl -X POST "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/compliance/analyze" \
  -H "Authorization: Bearer ce_live_<sua-chave>" \
  -H "Content-Type: application/json" \
  -d '{
    "process_id": "abc123",
    "domain": "LGPD"
  }'
```

Veja [docs/INTEGRATION.md](docs/INTEGRATION.md) para mais exemplos.

---

## 🔗 Links Úteis

- **API Swagger**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **API ReDoc**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc
- **Frontend Demo**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
- **Documentação**: `/v1/docs/integration` e `/v1/docs/prompts`

---

## 📝 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.
