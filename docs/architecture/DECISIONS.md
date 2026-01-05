# Registro de Decisões de Arquitetura (ADR)

**Data:** 05/01/2026
**Assunto:** Unificação do Frontend e Estratégia MCP

## 1. Contexto

A aplicação original possuía múltiplos frontends (`client-portal`, `admin-dashboard` planejado, e `secure-starter-kit/frontend` em uso temporário). Isso gerava fragmentação de código, dificuldade de manutenção e inconsistências na autenticação. Além disso, a estratégia de Agentes de IA (MCP) estava incipiente.

## 2. Decisões

### 2.1. Unificação do Frontend (`web-portal`)

- **Decisão:** Unificar todas as interfaces de usuário (Admin e Cliente) em um único projeto Next.js.
- **Nova Estrutura:** O diretório `nprocess/client-portal` foi renomeado para `nprocess/web-portal`.
- **Controle de Acesso (RBAC):**
  - Utilização do **Firebase Authentication** como fonte de verdade.
  - Separação lógica via rotas `/admin/*` e `/dashboard/*`.
  - Verificação de Roles robusta: Tenta ler Custom Claims do token; se falhar, consulta o documento `users/{uid}` no Firestore para determinar o papel (`admin`, `user`, etc.).
- **Eliminação de Legado:** O diretório `secure-starter-kit` foi removido para evitar duplicidade.

### 2.2. Implementação de Servidores MCP (`mcp-servers`)

- **Decisão:** Criar uma implementação dedicada e "madura" de servidores MCP usando TypeScript e o SDK oficial (`@modelcontextprotocol/sdk`).
- **Objetivo:** Permitir que agentes de IA (como Claude Desktop ou IDEs) interajam de forma estruturada com a API do n.process.
- **Localização:** `nprocess/mcp-servers`.
- **Tools Iniciais:** `list_tenants`, `get_compliance_status`.

## 3. Consequências

- **Positivas:**
  - Base de código única para o frontend, simplificando CI/CD e manutenção.
  - Autenticação centralizada e consistente.
  - Preparação para o futuro "Agentic" da aplicação com servidores MCP padrão.
- **Negativas:**
  - Necessidade de migrar quaisquer funcionalidades úteis que existiam no `secure-starter-kit` para o `web-portal`.

## 4. Status

✅ **Implementado** em 05/01/2026.
