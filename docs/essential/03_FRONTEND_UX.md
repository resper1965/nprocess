# Especificação de UI/UX (O Console)

## 1. Conceito
Não é um dashboard administrativo comum. É um **Control Plane de Infraestrutura**.
Tipografia de dados: **Geist Mono** ou **Fira Code**.

## 2. Estrutura de Páginas
- **Login:** Autenticação Google (Popup) limpa.
- **Waiting Room (Tela de Bloqueio):**
  - Exibida para usuários com `status: pending` ou sem `org_id`.
  - Mensagem: "Sua conta foi criada. Solicite acesso ao administrador da sua organização."
  - Botão de Logout.
- **Console (Home):** Grid 2x2 mostrando o status dos 4 Motores (Online/Idle) e métricas de saúde.
- **Super Admin Console (`/admin/system`):**
  - Apenas visível para `role: super_admin`.
  - Lista de "Novos Usuários Pendentes".
  - Botão "Aprovar & Vincular": Modal para escolher Tenant e Role.
- **Knowledge Ops:**
  - Aba "Private Context": Uploads do cliente.
  - Aba "Marketplace Drivers": Leis prontas (LGPD, SOX) para ativar/desativar.
  - Visual de "Refinaria de Dados" (Logs de ingestão).
- **Network & Access:**
  - Gestão de Tenants (Consumers).
  - Gestão de API Keys com limites de orçamento (FinOps).
- **Developer Hub:**
  - Instruções de conexão MCP.
  - Galeria de "System Prompts" para copiar.

## 3. FinOps Visibility
Gráficos claros diferenciando consumo de Gemini Flash (Barato) vs Pro (Caro).
