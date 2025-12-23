# Arquitetura do ComplianceEngine

## 🎯 Visão Geral

O **ComplianceEngine** é uma **API REST** projetada para ser **consumida por outras aplicações** via chamadas HTTP. Não é uma aplicação final para usuários finais.

## 📦 Componentes do Sistema

### 1. **API Backend** (`app/`)
**Propósito**: Microsserviço REST principal

- **URL Produção**: `https://compliance-engine-5wqihg7s7a-uc.a.run.app`
- **URL Local**: `http://localhost:8080`
- **Documentação**: 
  - Swagger UI: `https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs`
  - ReDoc: `https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc`

**Como acessar**: Via chamadas HTTP (REST API)

**Endpoints principais**:
- `POST /v1/diagrams/generate` - Gerar diagrama BPMN
- `GET /v1/processes` - Listar processos
- `POST /v1/compliance/analyze` - Analisar compliance
- `GET /v1/docs/prompts` - Obter exemplos de prompts
- `GET /v1/docs/integration` - Manual de integração

**Autenticação**: API Key obrigatória (exceto `/health`)

---

### 2. **Admin Dashboard** (`admin-dashboard/`)
**Propósito**: Interface administrativa para gerenciar a plataforma

**Funcionalidades**:
- 🔑 Gestão de API Keys (criar, revogar, monitorar)
- 💰 FinOps Dashboard (controle de custos por API key)
- 📊 Analytics e métricas de uso
- 👥 Gestão de consumidores
- 🔍 Monitoramento de serviços

**Como acessar**:
- **URL**: A ser definida (não deployado ainda)
- **Autenticação**: NextAuth.js + Google Cloud IAM
- **Público**: Administradores da plataforma

**Status**: Especificado (spec 002), implementação parcial

---

### 3. **Frontend Demo** (`frontend/`)
**Propósito**: Interface de demonstração/teste da API

⚠️ **IMPORTANTE**: Este frontend é apenas para **demonstração e testes**. A API deve ser consumida diretamente por outras aplicações via HTTP.

**Funcionalidades**:
- Interface visual para testar os endpoints da API
- Demonstração de funcionalidades
- Acesso à documentação

**Como acessar**:
- **URL Produção**: `https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app`
- **URL Local**: `http://localhost:3000`

**Status**: Deployado, mas deve ser considerado apenas como demo

---

## 🔄 Fluxo de Uso Real

### Para Desenvolvedores Integrando a API:

1. **Obter API Key**:
   - Via Admin Dashboard (quando disponível)
   - Ou via endpoint admin (requer autenticação)

2. **Consumir API**:
   ```python
   import httpx
   
   response = httpx.post(
       "https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/diagrams/generate",
       headers={"Authorization": "Bearer ce_live_<sua-chave>"},
       json={"description": "Processo de aprovação..."}
   )
   ```

3. **Integrar na sua aplicação**:
   - ERP/CRM
   - Plataformas de gestão de processos
   - Ferramentas de auditoria
   - Sistemas de documentação

### Para Administradores:

1. **Acessar Admin Dashboard** (quando disponível)
2. **Gerenciar API Keys**
3. **Monitorar custos e uso**
4. **Ver analytics**

---

## 📝 Recomendações

### O que fazer:
- ✅ Consumir a API diretamente via HTTP
- ✅ Usar o frontend apenas para testes/demo
- ✅ Acessar Admin Dashboard para gestão (quando disponível)
- ✅ Consultar documentação em `/docs` e `/redoc`

### O que NÃO fazer:
- ❌ Não usar o frontend como aplicação final
- ❌ Não depender do frontend para produção
- ❌ Não expor o frontend como produto principal

---

## 🔗 Links Úteis

- **API Swagger**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **API ReDoc**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc
- **Frontend Demo**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
- **Manual de Integração**: `/v1/docs/integration`
- **Exemplos de Prompts**: `/v1/docs/prompts`

