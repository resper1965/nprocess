# Visão Geral de UX/UI e Mapa do Site

Este documento descreve a experiência do usuário (UX) e a interface (UI) do Portal do Cliente n.process, detalhando o conteúdo e propósito de cada página.

## Filosofia de Design

- **Estilo**: Minimalista, "Glassmorphism" (efeitos de vidro/transparência), Dark Mode nativo.
- **Navegação**: Sidebar lateral fixa, Header com contexto da página.
- **Feedback**: Toasts para ações, Loaders para estados de espera (Skeleton screens).

## Estrutura de Páginas

### 1. Autenticação

- **/login**: Formulário limpo com email/senha e opção de "Esqueci minha senha".
- **/register**: Cadastro simplificado (Nome, Email, Senha, Empresa).

### 2. Dashboard (`/dashboard`)

A "Home" do usuário.

- **Resumo Geral**: Cards com métricas principais (Documentos processados, Créditos de IA restantes, Nível de Conformidade).
- **Acesso Rápido**: Atalhos para Auditoria e Chat.
- **Atividade Recente**: Tabela com os últimos 5 eventos ou documentos manipulados.

### 3. Módulos Operacionais

#### Chat de Compliance (`/dashboard/chat`)

- **UX**: Interface tipo "ChatGPT".
- **Conteúdo**: Janela de chat central, histórico de conversas lateral (se implementado) ou na sessão.
- **Funcionalidade**: O usuário conversa em linguagem natural com o motor de IA (Gemini).
- **Exemplo de Uso**: "Analise este texto quanto à LGPD".

#### Documentos (`/dashboard/documents`)

- **UX**: Grid ou Lista de arquivos.
- **Funcionalidade**: Botão de Upload (Drag & Drop), busca semântica, filtros por data/tipo.
- **Conteúdo**: Lista de arquivos enviados (PDFs, Docx) com status de processamento (Indexado, Pendente).

#### Compliance & Auditoria (`/dashboard/compliance`)

- **UX**: Dashboards visuais (Gráficos de Rosca/Barra).
- **Conteúdo**: Status dos frameworks (ISO27001, LGPD, SOX). Lista de não-conformidades detectadas.
- **Ação**: Gerar relatório de auditoria.

### 4. Gestão & FinOps

#### Faturamento (`/dashboard/billing`)

- **UX**: Layout informativo e transparente.
- **Conteúdo**:
  - **Plano Atual**: Detalhes do tier (Starter/Pro/Enterprise).
  - **Consumo**: Barra de progresso do uso de Tokens/API Calls.
  - **Faturas**: Histórico de invoices para download.
  - **Alertas**: Configuração de notificações de custo (80% do budget).

#### Time (`/dashboard/team`)

- **UX**: Tabela de usuários.
- **Conteúdo**: Lista de membros, papéis (Admin, Leitor), botão de convite por e-mail.

### 5. Desenvolvedor (`/dashboard/developers`)

#### API Keys (`/dashboard/api-keys`)

- **UX**: Focado em segurança.
- **Conteúdo**: Lista de chaves ativas, data de expiração, botão para "Revogar" e "Gerar Nova Chave" (que exibe o segredo apenas uma vez).

#### Segredos (`/dashboard/secrets`)

- **UX**: Cofre digital.
- **Conteúdo**: Interface para salvar variáveis de ambiente criptografadas usadas pelos agentes.

### 6. Suporte & Ajuda

#### Manual (`/dashboard/manual`)

- **UX**: Navegação por Abas (Tabs).
- **Conteúdo**:
  - **Guia Geral**: Como usar a plataforma.
  - **Arquitetura**: Diagramas Mermaid explicativos.
  - **API & MCP**: Guia técnico para devs (Configuração Claude/Cursor, Exemplos de Curl).
  - **Prompts**: Biblioteca de "System Instructions" prontos para uso.

#### Configurações (`/dashboard/settings`)

- **Conteúdo**: Perfil do usuário (Avatar, Nome), Preferências de Notificação, Tema (Claro/Escuro).
