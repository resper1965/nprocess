# 🚀 Prompt de Boot

**Para usar com Cursor Composer ou Claude Desktop:**

---

## 📋 Instruções

Após salvar os 6 documentos essenciais na pasta `docs/essential/`, abra o **Cursor Composer** (ou Claude Desktop) e digite:

---

## 🎯 Prompt de Inicialização

```
@docs/essential/00_PROJECT_MANIFESTO.md @docs/essential/01_ARCHITECTURE_STACK.md @docs/essential/02_BACKEND_SPEC.md @docs/essential/03_FRONTEND_UX.md @docs/essential/04_DATA_MODEL.md @docs/essential/05_SECURITY_RBAC.md

Você é um Arquiteto de Software Sênior (Google Cloud & Security Expert).

Leia os documentos de contexto fornecidos, com atenção especial ao `05_SECURITY_RBAC.md`.

Analise os 6 documentos essenciais em docs/essential/ e use o GitHub Spec Kit para iniciar o projeto n.process.

Os documentos definem:
- 00_PROJECT_MANIFESTO.md: Visão do produto, branding e os 4 motores
- 01_ARCHITECTURE_STACK.md: Stack técnico GCP Native e FinOps
- 02_BACKEND_SPEC.md: Especificação do backend com RAG avançado
- 03_FRONTEND_UX.md: Especificação do Console (Control Plane)
- 04_DATA_MODEL.md: Modelo de dados Firestore (incluindo collection users)
- 05_SECURITY_RBAC.md: Segurança, RBAC & Onboarding (CRÍTICO)

Use o Spec Kit para:
1. /speckit.specify - Criar especificação completa do n.process como middleware de inteligência (Control Plane) que fornece capacidades de IA (BPMN, Compliance, Docs) para outros sistemas via API e MCP, com segurança multi-tenant baseada em Firebase Custom Claims
2. /speckit.plan - Definir arquitetura serverless-first GCP Native (Cloud Run, Firestore, Cloud Tasks, Vertex AI) com foco em FinOps e Tenant Isolation
3. /speckit.tasks - Gerar lista de tarefas acionáveis priorizadas
4. /speckit.implement - Iniciar implementação seguindo a arquitetura definida

**Sua Missão Inicial:**
1. Inicialize o Monorepo (backend/frontend).
2. **Backend (FastAPI):**
   - Implemente o `deps.py` (Dependencies) para validar o Firebase Token.
   - **CRÍTICO:** O Dependency deve extrair `org_id` e `role` do token e rejeitar requisições de usuários com `status: pending`.
   - Crie o endpoint `/system/approve_user` (protegido para super_admin) que usa `firebase-admin` para definir Custom Claims.
3. **Frontend (Next.js):**
   - Configure o `AuthContext` para redirecionar usuários sem `org_id` para a rota `/waiting-room`.
   - Crie a proteção de rotas (Middleware) baseada em Roles.

Importante: 
- O projeto é "powered by ness." (n.process sempre minúsculo)
- Branding: Montserrat Medium, ponto em #00ade8
- Stack: Python 3.11+ (FastAPI), Next.js 14+, Firestore, Vertex AI
- Os 4 motores: Process Engine, Compliance Guard, Document Factory, Knowledge Store
- Estrutura Clean Architecture com Strategy Pattern para RAG Legal
- **Segurança Multi-Tenant: Tenant Isolation obrigatório em todas as queries**
- **RBAC: Firebase Custom Claims para evitar consultas ao banco em cada request**
```

---

## 🔧 Versão Curta (Quick Start)

Se preferir uma versão mais concisa:

```
@docs/essential/00_PROJECT_MANIFESTO.md @docs/essential/01_ARCHITECTURE_STACK.md @docs/essential/02_BACKEND_SPEC.md @docs/essential/03_FRONTEND_UX.md @docs/essential/04_DATA_MODEL.md @docs/essential/05_SECURITY_RBAC.md

Use o Spec Kit para criar o projeto n.process baseado nos 6 documentos essenciais em docs/essential/.

O projeto é um Control Plane de infraestrutura que fornece IA (BPMN, Compliance, Docs) via API e MCP.
Stack: GCP Native (Cloud Run, Firestore, Vertex AI), FastAPI, Next.js 14+.
Os 4 motores: Process Engine, Compliance Guard, Document Factory, Knowledge Store.

**CRÍTICO - Segurança Multi-Tenant:**
- Implementar Firebase Custom Claims para RBAC
- Dependency `get_current_user` deve validar token e extrair org_id/role
- Tenant Isolation obrigatório em todas as queries Firestore
- Endpoint `/system/approve_user` para super_admin aprovar usuários
- Frontend: AuthContext redireciona usuários sem org_id para `/waiting-room`

Execute: /speckit.specify (baseado nos docs), /speckit.plan (GCP Native + Security), /speckit.tasks, /speckit.implement
```

---

## 📚 Documentação de Referência

Antes de usar, certifique-se de que:

1. ✅ Os 6 documentos estão em `docs/essential/` (incluindo 05_SECURITY_RBAC.md)
2. ✅ Spec Kit está instalado (`specify --help`)
3. ✅ Projeto inicializado (`specify init . --ai claude`)

**Atenção especial ao documento 05_SECURITY_RBAC.md:**
- Define estratégia de identidade com Firebase Custom Claims
- Hierarquia de papéis (super_admin, org_admin, developer, guest)
- Fluxo de onboarding "The Waiting Room"
- Regras de segurança multi-tenant obrigatórias

---

**Última Atualização**: 10 de Janeiro de 2026
