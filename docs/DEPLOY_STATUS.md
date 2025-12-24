# Status do Deploy - ComplianceEngine

**Data**: 2025-12-24  
**Última atualização**: Deploy da API e Admin Dashboard

## ✅ Serviços Deployados

### 1. ComplianceEngine API
- **URL**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **Status**: ✅ Deployado e funcionando
- **Versão**: `1c56c79`
- **Acesso**: Público (autenticação via API Key)
- **Documentação**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs

### 2. Admin Dashboard
- **URL**: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
- **Status**: ✅ Deployado
- **Acesso**: Autenticado (IAM)
- **Interface**: Interface humana para gerenciar o motor

### 3. Frontend Demo (Removido)
- **Status**: ❌ Removido intencionalmente
- **Motivo**: Admin Dashboard agora é a interface principal

## 🔐 Autenticação

### API
- Autenticação via API Key no header `X-API-Key` ou `Authorization: Bearer <key>`
- Endpoint de validação: `/v1/api-keys/validate`

### Admin Dashboard
- Autenticação via NextAuth.js
- Credenciais mock disponíveis:
  - Email: `admin@company.com` / Senha: `admin123`
  - Email: `john.doe@company.com` / Senha: `admin123`
- Google OAuth: Configuração pendente (secrets não criados)

## 📝 Configurações

### Variáveis de Ambiente (Admin Dashboard)
- `NEXT_PUBLIC_API_URL`: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- `NEXTAUTH_URL`: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
- `NEXTAUTH_SECRET`: Configurado via Secret Manager

### Secrets (Admin Dashboard)
- `nextauth-secret`: ✅ Configurado
- `google-client-id`: ❌ Não configurado (OAuth desabilitado)
- `google-client-secret`: ❌ Não configurado (OAuth desabilitado)

## 🚀 Próximos Passos

1. **Configurar Google OAuth** (opcional):
   - Criar secrets `google-client-id` e `google-client-secret`
   - Configurar permissões IAM
   - Atualizar `cloudbuild.yaml` para incluir os secrets

2. **Configurar domínio customizado** (opcional):
   - Configurar DNS para o Admin Dashboard
   - Atualizar `NEXTAUTH_URL` com o novo domínio

3. **Testar funcionalidades**:
   - Gerenciamento de API Keys
   - FinOps e controle de custos
   - Analytics e monitoramento

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

## 🔗 Links Úteis

- **API Swagger**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **API Health**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/health
- **Admin Dashboard**: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
