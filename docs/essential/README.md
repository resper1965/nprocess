# 📚 Documentos Essenciais - n.process

Documentação fundamental do projeto **ness. (n.process)** - Middleware de Inteligência.

---

## 📋 Índice dos Documentos

### 1. [00_PROJECT_MANIFESTO.md](00_PROJECT_MANIFESTO.md)
**Visão do Produto & Branding**

- Visão do produto: Control Plane de infraestrutura
- Branding & Identity (ness., n.process)
- Os 4 Motores: Process Engine, Compliance Guard, Document Factory, Knowledge Store

---

### 2. [01_ARCHITECTURE_STACK.md](01_ARCHITECTURE_STACK.md)
**Stack Tecnológico & FinOps**

- Princípios: Serverless First, Google Native, FinOps Driven
- Stack completo: Python 3.11+ (FastAPI), Next.js 14+, Firestore, Vertex AI
- Integração: API REST + MCP (Model Context Protocol)

---

### 3. [02_BACKEND_SPEC.md](02_BACKEND_SPEC.md)
**Especificação do Backend**

- Estrutura Clean Architecture
- Knowledge Ops (RAG Avançado) com Strategy Pattern
- Pipeline Assíncrono com Cloud Tasks
- MCP Server (SSE) para integração com Agentes

---

### 4. [03_FRONTEND_UX.md](03_FRONTEND_UX.md)
**Especificação do Console (UI/UX)**

- Conceito: Control Plane de Infraestrutura
- Estrutura de páginas completa
- Waiting Room (Tela de bloqueio para usuários pendentes)
- Super Admin Console (Aprovação de usuários)
- FinOps Visibility

---

### 5. [04_DATA_MODEL.md](04_DATA_MODEL.md)
**Modelo de Dados (Firestore NoSQL)**

Collections:
- `tenants` - Organizações/Consumers
- `api_keys` - Chaves de API com limites
- `knowledge_base` - Base de conhecimento (RAG)
- `jobs` - Jobs assíncronos
- `users` - Usuários do sistema (RBAC)

---

### 6. [05_SECURITY_RBAC.md](05_SECURITY_RBAC.md)
**Segurança, RBAC & Onboarding** ⚠️ **CRÍTICO**

- Estratégia de Identidade: Firebase Custom Claims
- Hierarquia de Papéis: `super_admin`, `org_admin`, `developer`, `guest`
- Fluxo de Onboarding: "The Waiting Room"
- Segurança na API: Tenant Isolation obrigatório
- Token JWT com `org_id`, `role`, `status`

**Regras de Segurança:**
- Todo endpoint deve usar Dependency `get_current_user`
- `org_id` extraído do token deve ser injetado em todas as queries
- Usuários com `status: pending` são bloqueados

---

## 🚀 Como Usar

### 1. Ler na Ordem

Leia os documentos na ordem numérica para entender:
- **00** → O que é o produto
- **01** → Como será construído
- **02** → Backend detalhado
- **03** → Frontend/UX
- **04** → Estrutura de dados
- **05** → Segurança multi-tenant (CRÍTICO)

### 2. Usar com Spec Kit

Veja o [BOOT_PROMPT.md](BOOT_PROMPT.md) para iniciar o desenvolvimento usando o GitHub Spec Kit.

---

## ⚠️ Importante

- **Documento 05 (Security RBAC) é CRÍTICO**: Define toda a estratégia de segurança multi-tenant
- **Tenant Isolation é obrigatório**: Nenhuma query deve ignorar o `org_id`
- **Firebase Custom Claims**: Usado para evitar consultas ao banco em cada request

---

## 📝 Atualizações

- **10/01/2026**: Adicionado documento 05_SECURITY_RBAC.md
- **10/01/2026**: Atualizado 04_DATA_MODEL.md com collection `users`
- **10/01/2026**: Atualizado 03_FRONTEND_UX.md com Waiting Room e Super Admin Console
- **10/01/2026**: Atualizado BOOT_PROMPT.md com instruções de segurança

---

**Última Atualização**: 10 de Janeiro de 2026
