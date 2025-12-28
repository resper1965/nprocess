# 🔄 Remover Dados Mockados - Status

**Data**: 27 de Dezembro de 2024

---

## ✅ Concluído

### 1. Hooks Criados
- ✅ `use-dashboard-stats.ts` - Estatísticas do dashboard
- ✅ `use-chat.ts` - Chat com Gemini
- ✅ `use-users.ts` - Gerenciamento de usuários
- ✅ `use-finops.ts` - Custos e métricas de uso
- ✅ `use-services.ts` - Status dos serviços

### 2. Páginas Atualizadas
- ✅ **Dashboard** (`/dashboard/page.tsx`) - Usa `useDashboardStats()`
- ⏳ **Chat** (`/dashboard/chat/page.tsx`) - Precisa usar `useChat()`
- ⏳ **Team** (`/dashboard/team/page.tsx`) - Precisa usar `useUsers()`
- ⏳ **Admin FinOps** (`/admin/finops/page.tsx`) - Precisa usar `useFinOps()`
- ⏳ **Admin Services** (`/admin/services/page.tsx`) - Precisa usar `useServices()`

---

## ⏳ Pendente

### Páginas que Precisam de Endpoints Adicionais

#### 1. Documents (`/dashboard/documents/page.tsx`)
**Status**: Mock data
**Necessário**:
- Endpoint para listar documentos: `GET /v1/documents`
- Endpoint para upload: `POST /v1/documents`
- Endpoint para deletar: `DELETE /v1/documents/{id}`
- Endpoint para download: `GET /v1/documents/{id}/download`

**Ação**: Criar router `documents.py` no `n.process API`

#### 2. Compliance (`/dashboard/compliance/page.tsx`)
**Status**: Mock data
**Necessário**:
- Endpoint para frameworks: `GET /v1/compliance/frameworks`
- Endpoint para gaps: `GET /v1/compliance/gaps`
- Endpoint para scores: `GET /v1/compliance/scores`

**Ação**: Criar router `compliance.py` no `n.process API`

#### 3. Billing (`/dashboard/billing/page.tsx`)
**Status**: Mock data
**Necessário**:
- Endpoint para planos: `GET /v1/billing/plans`
- Endpoint para invoice: `GET /v1/billing/invoices`
- Endpoint para payment method: `GET /v1/billing/payment-method`

**Ação**: Criar router `billing.py` no `Admin Control Plane` ou integrar com sistema de billing externo

#### 4. Secrets (`/dashboard/secrets/page.tsx`)
**Status**: Mock data
**Necessário**:
- Endpoint para listar secrets: `GET /v1/admin/secrets`
- Endpoint para criar: `POST /v1/admin/secrets`
- Endpoint para deletar: `DELETE /v1/admin/secrets/{id}`

**Ação**: Criar router `secrets.py` no `Admin Control Plane` (usar Google Secret Manager)

#### 5. Integrations (`/dashboard/integrations/page.tsx`)
**Status**: Mock data
**Necessário**:
- Endpoint para listar: `GET /v1/integrations`
- Endpoint para conectar: `POST /v1/integrations/{id}/connect`
- Endpoint para desconectar: `POST /v1/integrations/{id}/disconnect`
- Endpoint para configurar: `PATCH /v1/integrations/{id}/config`

**Ação**: Criar router `integrations.py` no `Admin Control Plane`

#### 6. Admin Consumers (`/admin/consumers/page.tsx`)
**Status**: Mock data
**Necessário**:
- Endpoint para listar: `GET /v1/admin/consumers`
- Endpoint para criar: `POST /v1/admin/consumers`
- Endpoint para atualizar: `PATCH /v1/admin/consumers/{id}`
- Endpoint para deletar: `DELETE /v1/admin/consumers/{id}`

**Ação**: Criar router `consumers.py` no `Admin Control Plane`

#### 7. Admin Settings (`/admin/settings/page.tsx`)
**Status**: Mock data
**Necessário**:
- Endpoint para obter: `GET /v1/admin/settings`
- Endpoint para atualizar: `PATCH /v1/admin/settings`

**Ação**: Criar router `settings.py` no `Admin Control Plane`

---

## 📋 Próximos Passos

1. **Atualizar páginas com hooks existentes**:
   - Chat page → usar `useChat()`
   - Team page → usar `useUsers()`
   - Admin FinOps → usar `useFinOps()`
   - Admin Services → usar `useServices()`

2. **Criar endpoints faltantes**:
   - Documents API
   - Compliance API
   - Billing API
   - Secrets API
   - Integrations API
   - Consumers API
   - Settings API

3. **Criar hooks para novos endpoints**:
   - `use-documents.ts`
   - `use-compliance.ts`
   - `use-billing.ts`
   - `use-secrets.ts`
   - `use-integrations.ts`
   - `use-consumers.ts`
   - `use-settings.ts`

4. **Atualizar páginas para usar novos hooks**

---

**Última Atualização**: 27 de Dezembro de 2024

