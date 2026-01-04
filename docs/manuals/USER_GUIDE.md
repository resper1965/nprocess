# n.process - Guia do Usuário

## 1. Visão Geral do Sistema

O **n.process** é um motor de compliance e modelagem de processos stateless. Ele analisa processos de negócio contra normas regulatórias (LGPD, SOX, ISO 27001) e gera diagramas BPMN a partir de texto.

## 2. RBAC (Role-Based Access Control)

### Como funciona?

O controle de acesso é baseado em **Firebase Custom Claims**:

| Role          | Permissões                                          |
| ------------- | --------------------------------------------------- |
| `user`        | Acessa apenas o Dashboard do cliente (`/dashboard`) |
| `admin`       | Acessa Dashboard + Admin Console (`/admin/*`)       |
| `super_admin` | Acesso total + gerenciamento de outros admins       |

### Onde é definido?

1. **Backend** (`app/middleware/auth.py`): A função `require_admin` verifica se o usuário tem role `admin` ou `super_admin` no token JWT.
2. **Frontend** (`client-portal/src/lib/auth-context.tsx`): O hook `useAuth()` expõe `isAdmin` que é verificado no layout.
3. **Firestore** (`users/{uid}`): O campo `role` do documento do usuário.

### Como atribuir roles?

```javascript
// Via Firebase Admin SDK (Cloud Function ou script)
const admin = require("firebase-admin");
await admin.auth().setCustomUserClaims(uid, { role: "admin" });
```

## 3. Páginas do Sistema

### Páginas do Cliente (`/dashboard`)

- **Dashboard**: Visão geral do uso de API do cliente
- **API Keys**: Gerenciar chaves de API próprias
- **Compliance**: Executar análises de conformidade

### Páginas de Admin (`/admin`)

| Página         | Função                                        | Aderência ao Projeto      |
| -------------- | --------------------------------------------- | ------------------------- |
| **Overview**   | Métricas da plataforma (calls, custo, uptime) | ✅ FinOps                 |
| **API Keys**   | Gerenciar todas as API Keys                   | ✅ Gestão de acesso       |
| **Consumers**  | Gerenciar clientes/aplicações                 | ⚠️ Não essencial para MVP |
| **FinOps**     | Custos de Vertex AI, Gemini, Firestore        | ✅ Core                   |
| **Services**   | Status dos serviços (health)                  | ✅ Monitoramento          |
| **Settings**   | Configurações globais                         | ✅ Administração          |
| **Developers** | Prompts e guias de integração                 | ✅ Onboarding             |

## 4. Análise de Aderência

### ✅ Páginas Essenciais (Core)

- `/admin/overview`: Monitoramento
- `/admin/finops`: Controle de custos (Vertex AI)
- `/admin/developers`: Guias de integração

### ⚠️ Páginas Opcionais

- `/admin/consumers`: Útil se tiver multi-tenant, mas não é prioridade
- `/admin/services`: Duplica funcionalidade do Cloud Run dashboard

### ❌ Páginas Faltando

- `/admin/knowledge` ou `/admin/ingest`: **Deveria existir** para disparar ingestão de documentos (LGPD, CVM) via UI

## 5. Próximos Passos Recomendados

1. Criar página `/admin/knowledge` para gerenciar base de conhecimento RAG
2. Simplificar `/admin/consumers` ou remover se não for multi-tenant
3. Adicionar botão de Help (?) em cada página com o componente `HelpDialog`
