# Especificações do Projeto - ComplianceEngine

Índice de todas as especificações do projeto usando GitHub Spec-Kit.

## 📋 Especificações

### [001 - Baseline Compliance Engine](./001-baseline-compliance-engine/spec.md)

**Status**: ✅ Implementado  
**Data**: 2025-12-22

Especificação base do ComplianceEngine API:
- Geração de diagramas BPMN
- Gestão de processos
- Análise de compliance
- Arquitetura inicial

### [002 - Admin Dashboard com IAM e Analytics](./002-admin-dashboard-iam-integration/spec.md)

**Status**: 📝 Draft  
**Data**: 2025-12-23

Especificação completa para Admin Dashboard:
- **Autenticação**: Google Cloud IAM via NextAuth.js
- **API Keys Management**: Interface completa baseada em [resper1965/clone](https://github.com/resper1965/clone)
- **Analytics Dashboard**: Métricas, gráficos e visualizações
- **RBAC**: Role-Based Access Control (Super Admin, Admin, Editor, Viewer)
- **Integração**: Consumo da ComplianceEngine API existente

#### Componentes Principais

1. **Sistema de Autenticação**
   - Google OAuth 2.0
   - NextAuth.js com JWT
   - Integração com Google Cloud Identity

2. **Página de API Keys** (`/dashboard/api-keys`)
   - DataTable com listagem
   - Dialog de criação
   - Cards de métricas
   - Ações (revogar, copiar, visualizar)

3. **Página de Analytics** (`/dashboard/analytics`)
   - Métricas principais
   - Gráficos de timeline
   - Filtros por período
   - Distribuição por endpoint

4. **Gestão de Usuários**
   - Listagem de admins
   - Criação/edição de usuários
   - Atribuição de roles
   - Integração com Google Cloud IAM

#### Tecnologias

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Autenticação**: NextAuth.js, Google Cloud IAM
- **Backend**: FastAPI (endpoints de admin e analytics)
- **Database**: Firestore
- **Design System**: ness

#### Estrutura de Dados

- `api_keys/` - API keys e metadados
- `api_requests/` - Logs de requisições para analytics
- `admin_users/` - Cache de usuários e roles

## 🔄 Workflow de Specs

1. **Criar spec**: Usar template do Spec-Kit
2. **Revisar**: Discussão e aprovação
3. **Implementar**: Seguir checklist da spec
4. **Atualizar status**: Marcar como implementado

## 📚 Referências

- [GitHub Spec-Kit](https://github.com/github/spec-kit)
- [Dashboard de Referência](https://github.com/resper1965/clone)
- [Design System ness](../docs/FRONTEND_PROPOSAL.md)

