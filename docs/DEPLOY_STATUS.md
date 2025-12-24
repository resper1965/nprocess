# Deployment Status

**Última atualização**: 2025-12-24  
**Versão**: `54d035b`

## ✅ Serviços Deployados

### 1. ComplianceEngine API
- **URL**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **Status**: ✅ Deployado e funcionando
- **Versão**: `54d035b`
- **Health Check**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/health
- **Documentação**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **Acesso**: Público (autenticação via API Key)

### 2. Admin Dashboard
- **URL**: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
- **Status**: ✅ Deployado e funcionando
- **Versão**: `54d035b`
- **Acesso**: Autenticado (IAM configurado)
- **Interface**: Interface humana para gerenciar o motor

### 3. Frontend Demo
- **URL**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
- **Status**: ⚠️ Removido (não mais utilizado)
- **Nota**: Admin Dashboard é a interface principal

## 🔐 Autenticação

### API
- Autenticação via API Key no header `X-API-Key` ou `Authorization: Bearer <key>`
- Endpoint de validação: `/v1/api-keys/validate`
- Auto-serviço: `/v1/my/api-keys`

### Admin Dashboard
- Autenticação via NextAuth.js
- Credenciais mock disponíveis:
  - Email: `admin@company.com` / Senha: `admin123`
  - Email: `john.doe@company.com` / Senha: `admin123`
- Google OAuth: Não configurado (opcional)

## 📝 Configurações

### Variáveis de Ambiente (Admin Dashboard)
- `NEXT_PUBLIC_API_URL`: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- `NEXTAUTH_URL`: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
- `NEXTAUTH_SECRET`: Configurado via Secret Manager

### Secrets (Admin Dashboard)
- `nextauth-secret`: ✅ Configurado
- `google-client-id`: ❌ Não configurado (OAuth desabilitado)
- `google-client-secret`: ❌ Não configurado (OAuth desabilitado)

## 🚀 Como Acessar

### Admin Dashboard
1. Acesse: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
2. Faça login com:
   - Email: `admin@company.com`
   - Senha: `admin123`

### API
- Swagger: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- Health: https://compliance-engine-5wqihg7s7a-uc.a.run.app/health

## 📊 Recursos Disponíveis

### API Endpoints Principais
- `/v1/diagrams/generate` - Gerar diagramas BPMN
- `/v1/processes` - Gerenciar processos
- `/v1/analysis/compliance` - Análise de conformidade
- `/v1/api-keys` - Gerenciar API Keys (admin)
- `/v1/my/api-keys` - Auto-serviço de API Keys

### Admin Dashboard Pages
- `/` - Dashboard principal
- `/api-keys` - Gerenciamento de API Keys
- `/finops` - Controle de custos
- `/analytics` - Métricas e gráficos
- `/services` - Monitoramento de serviços

## 🔄 Deploy Automático

Deploys são realizados automaticamente via:
- **GitHub Actions** (`.github/workflows/cd.yml`)
- **Cloud Build** (manual via `gcloud builds submit`)

## 📋 Próximos Passos

1. **Configurar Google OAuth** (opcional):
   - Criar secrets `google-client-id` e `google-client-secret`
   - Configurar permissões IAM
   - Atualizar `cloudbuild.yaml`

2. **Monitoramento**:
   - Configurar alertas no Cloud Monitoring
   - Dashboard de métricas
   - Log aggregation

3. **Testes**:
   - Expandir cobertura de testes
   - Adicionar testes de integração
   - Configurar testes E2E

## 🔗 Links Úteis

- **API Swagger**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **API Health**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/health
- **Admin Dashboard**: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
- **GitHub Repository**: https://github.com/resper1965/nprocess
