# Compliance Admin Dashboard

**Interface administrativa** para gerenciar a ComplianceEngine API.

## 🎯 Propósito

Este dashboard é para **administradores da plataforma** gerenciarem:

- 🔑 **API Keys**: Criar, revogar e monitorar chaves de API
- 💰 **FinOps**: Controlar custos por API key e consumidor
- 📊 **Analytics**: Métricas de uso, performance e SLA
- 👥 **Consumidores**: Gerenciar aplicações que consomem a API
- 🔍 **Monitoramento**: Health checks e status dos serviços

## ⚠️ Status

**Status**: Especificado (spec 002), implementação parcial

**Acesso**: A ser definido após deploy completo

## 🔐 Autenticação

- **NextAuth.js** com JWT
- **Google Cloud IAM** para RBAC
- **Roles**: Super Admin, Admin, Editor, Viewer

## 🚀 Como Acessar (Quando Disponível)

1. Acesse a URL do Admin Dashboard (a ser definida)
2. Faça login com credenciais Google Cloud IAM
3. Navegue pelas seções:
   - `/api-keys` - Gestão de chaves
   - `/finops` - Controle de custos
   - `/analytics` - Métricas e gráficos
   - `/consumers` - Gestão de consumidores
   - `/services` - Monitoramento

## 📝 Para Desenvolvedores

Se você precisa **consumir a API** (não gerenciá-la), veja:

- **Manual de Integração**: [docs/INTEGRATION.md](../docs/INTEGRATION.md)
- **API Swagger**: `https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs`
- **Frontend Demo**: [frontend/README.md](../frontend/README.md)

## 🔗 Links

- **API Principal**: `https://compliance-engine-5wqihg7s7a-uc.a.run.app`
- **Frontend Demo**: `https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app`
- **Admin Dashboard**: A ser definido
