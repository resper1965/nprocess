# Funcionalidades da Aplicação n.process

**Data**: 27 de Dezembro de 2024  
**Versão**: 2.0.0  
**Status**: ✅ Implementado e em Produção

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [n.process API (Core)](#nprocess-api-core)
3. [Admin Control Plane](#admin-control-plane)
4. [Client Portal](#client-portal)
5. [Regulatory RAG API](#regulatory-rag-api)
6. [Document Generator Engine](#document-generator-engine)
7. [MCP Servers](#mcp-servers)
8. [Funcionalidades Planejadas](#funcionalidades-planejadas)

---

## 🎯 Visão Geral

**n.process** é uma plataforma SaaS multi-tenant para gestão inteligente de compliance, que permite:

- **Mapear processos de negócio** em diagramas BPMN usando IA
- **Analisar compliance** com frameworks regulatórios (LGPD, GDPR, SOX, ANEEL, ONS, etc.)
- **Gerenciar API keys** e monitorar uso
- **Controlar custos** com FinOps
- **Chat com Gemini** para operações administrativas
- **Busca semântica** em regulamentações (RAG)

---

## 🔧 n.process API (Core)

### 1. Modelagem de Processos

#### Geração de Diagramas BPMN
- ✅ **POST `/v1/modeling/generate`**
  - Converte descrições textuais em diagramas BPMN
  - Usa Vertex AI Gemini 1.5 Pro
  - Gera diagramas em formato Mermaid.js
  - Extrai metadados do processo
  - Normaliza processos para formato padrão

**Funcionalidades:**
- Conversão texto → BPMN
- Validação de estrutura
- Extração de elementos (atividades, gateways, eventos)
- Geração de metadados

### 2. Análise de Compliance

#### Análise de Processos
- ✅ **POST `/v1/compliance/analyze`**
  - Analisa processos contra frameworks regulatórios
  - Identifica gaps de conformidade
  - Calcula score de compliance (0-100)
  - Gera sugestões de melhoria
  - Suporta múltiplos domínios (LGPD, GDPR, SOX, ANEEL, ONS, etc.)

**Funcionalidades:**
- Análise por domínio regulatório
- Identificação de gaps
- Sugestões de melhoria
- Score de compliance em tempo real
- Relatórios detalhados

### 3. Ingestão de Conhecimento (Admin)

#### Ingestão de Documentos Regulatórios
- ✅ **POST `/v1/admin/ingest`**
  - Ingere documentos no sistema RAG
  - Suporta múltiplos tipos de fonte (legal, technical, web)
  - Processa e indexa conteúdo para busca semântica
  - Requer autenticação de admin

**Funcionalidades:**
- Ingestão de documentos legais
- Ingestão de documentos técnicos
- Ingestão de conteúdo web
- Indexação para Vertex AI Search
- Metadados customizáveis

### 4. Health Check

- ✅ **GET `/health`** - Status do serviço
- ✅ **GET `/`** - Informações básicas

---

## 🎛️ Admin Control Plane

### 1. Autenticação Unificada

#### Verificação de Tokens
- ✅ **POST `/v1/auth/verify`**
  - Verifica Firebase ID token
  - Retorna informações do usuário
  - Valida roles e permissões

#### Informações do Usuário
- ✅ **GET `/v1/auth/me`**
  - Retorna usuário atual autenticado
  - Requer Firebase ID token

### 2. Chat com Gemini AI ⭐

#### Interface Conversacional
- ✅ **POST `/v1/admin/chat`**
  - Chat natural para operações administrativas
  - Gemini pode executar operações via comandos
  - Histórico de conversas
  - Sugestões inteligentes

**Capacidades do Gemini:**
- Criar/revogar API keys
- Gerenciar usuários e roles
- Consultar custos e uso
- Gerar relatórios de auditoria
- Recomendações de otimização de custos

#### Gerenciamento de Sessões
- ✅ **GET `/v1/admin/chat/sessions`** - Listar sessões
- ✅ **GET `/v1/admin/chat/history/{session_id}`** - Histórico
- ✅ **DELETE `/v1/admin/chat/history/{session_id}`** - Deletar sessão
- ✅ **POST `/v1/admin/chat/test`** - Testar conexão

### 3. Gerenciamento de API Keys

#### CRUD de API Keys
- ✅ **POST `/v1/admin/apikeys`** - Criar API key
- ✅ **GET `/v1/admin/apikeys`** - Listar todas as keys
- ✅ **GET `/v1/admin/apikeys/{key_id}`** - Detalhes de uma key
- ✅ **POST `/v1/admin/apikeys/{key_id}/revoke`** - Revogar key
- ✅ **DELETE `/v1/admin/apikeys/{key_id}`** - Deletar key
- ✅ **POST `/v1/admin/apikeys/validate`** - Validar key

**Funcionalidades:**
- Geração criptograficamente segura
- Criptografia AES-256-GCM
- Hash bcrypt (12 salt rounds)
- Exibição única na criação
- Expiração automática
- Quotas configuráveis (requests/min, day, month)
- Permissões granulares
- Ambiente (dev, staging, prod)

### 4. Gerenciamento de Usuários (RBAC)

#### CRUD de Usuários
- ✅ **POST `/v1/admin/users`** - Criar usuário
- ✅ **GET `/v1/admin/users`** - Listar usuários
- ✅ **GET `/v1/admin/users/{user_id}`** - Detalhes do usuário
- ✅ **PATCH `/v1/admin/users/{user_id}`** - Atualizar usuário
- ✅ **DELETE `/v1/admin/users/{user_id}`** - Deletar usuário

**Roles Disponíveis:**
- `super_admin` - Acesso total
- `admin` - Gerenciar usuários e keys
- `finops_manager` - Visualizar/gerenciar custos
- `auditor` - Apenas leitura de logs de auditoria
- `user` - Usar plataforma
- `viewer` - Apenas leitura

**Funcionalidades:**
- Controle de acesso baseado em roles
- Ativação/desativação de usuários
- Histórico de login
- Gerenciamento de tenants (multi-tenant)

### 5. AI Keys Vault

#### Gerenciamento de Chaves de IA
- ✅ **POST `/v1/admin/ai-keys`** - Adicionar chave de IA
- ✅ **GET `/v1/admin/ai-keys`** - Listar chaves (sem valores)
- ✅ **POST `/v1/admin/ai-keys/{key_id}/test`** - Testar validade
- ✅ **POST `/v1/admin/ai-keys/{key_id}/rotate`** - Rotacionar chave

**Provedores Suportados:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini, Vertex AI)
- Azure (OpenAI)

**Funcionalidades:**
- Armazenamento seguro no Google Secret Manager
- Criptografia em repouso
- Rotação de chaves
- Teste de validade
- Histórico de uso

### 6. FinOps Dashboard

#### Monitoramento de Custos
- ✅ **GET `/v1/admin/finops/costs`** - Resumo de custos
- ✅ **GET `/v1/admin/finops/usage`** - Métricas de uso

**Funcionalidades:**
- Rastreamento de custos em tempo real
- Custos por serviço (Vertex AI, Cloud Run, Storage)
- Custos por consumidor (aplicação)
- Orçamento e alertas
- Previsão de custos
- Recomendações de otimização (IA)
- Integração com Google Cloud Billing API
- Métricas via Cloud Monitoring
- Analytics históricos (BigQuery)

### 7. Monitoramento de Serviços

#### Health e Métricas
- ✅ **GET `/v1/admin/services`** - Listar serviços
- ✅ **GET `/v1/admin/services/{service_id}/health`** - Health check

**Métricas Rastreadas:**
- Uptime %
- Latência (P50, P95, P99)
- Taxa de erro
- Volume de requisições
- Disponibilidade

**Serviços Monitorados:**
- n.process API
- Admin Control Plane
- Regulatory RAG API
- Document Generator Engine
- Client Portal

### 8. Audit Logs

#### Logs de Auditoria
- ✅ **GET `/v1/admin/audit/logs`** - Consultar logs

**Ações Registradas:**
- Todas as operações CRUD
- Criação/revogação de API keys
- Mudanças de roles de usuários
- Violações de threshold de custo
- Eventos de segurança
- Acessos administrativos

**Funcionalidades:**
- Busca e filtros avançados
- Exportação de relatórios
- Integração com Cloud Logging
- Retenção configurável

---

## 👥 Client Portal

### Dashboard do Cliente

#### Páginas Disponíveis

1. **Dashboard Principal** (`/dashboard`)
   - ✅ Visão geral do uso da API
   - ✅ Métricas de compliance
   - ✅ Gráficos de uso
   - ✅ Status de processos

2. **API Keys** (`/dashboard/api-keys`)
   - ✅ Gerenciar próprias API keys
   - ✅ Criar novas keys
   - ✅ Revogar keys
   - ✅ Visualizar uso e quotas

3. **Compliance** (`/dashboard/compliance`)
   - ✅ Executar análises de compliance
   - ✅ Visualizar scores
   - ✅ Relatórios de conformidade
   - ✅ Histórico de análises

4. **Documents** (`/dashboard/documents`)
   - ✅ Gerenciar documentos
   - ✅ Visualizar processos
   - ✅ Exportar relatórios

5. **Chat** (`/dashboard/chat`)
   - ✅ Chat com assistente de compliance
   - ✅ Perguntas sobre regulamentações

6. **Integrations** (`/dashboard/integrations`)
   - ✅ Integrações com sistemas externos
   - ✅ Webhooks configurados

7. **Secrets** (`/dashboard/secrets`)
   - ✅ Gerenciar segredos e credenciais

8. **Billing** (`/dashboard/billing`)
   - ✅ Visualizar custos
   - ✅ Histórico de uso
   - ✅ Planos e limites

9. **Settings** (`/dashboard/settings`)
   - ✅ Configurações da conta
   - ✅ Preferências
   - ✅ Notificações

10. **Team** (`/dashboard/team`)
    - ✅ Gerenciar membros da equipe
    - ✅ Permissões e roles

### Admin Dashboard

#### Páginas Administrativas

1. **Overview** (`/admin/overview`)
   - ✅ Métricas da plataforma
   - ✅ Visão geral de custos
   - ✅ Status de serviços
   - ✅ Alertas e notificações

2. **API Keys** (`/admin/api-keys`)
   - ✅ Gerenciar todas as API keys
   - ✅ Criar keys para consumidores
   - ✅ Monitorar uso

3. **Consumers** (`/admin/consumers`)
   - ✅ Gerenciar aplicações consumidoras
   - ✅ Configurar quotas
   - ✅ Monitorar uso por aplicação

4. **FinOps** (`/admin/finops`)
   - ✅ Dashboard de custos detalhado
   - ✅ Análise de custos por serviço
   - ✅ Previsões e recomendações

5. **Services** (`/admin/services`)
   - ✅ Monitoramento de serviços
   - ✅ Health checks
   - ✅ Métricas de performance

6. **Knowledge** (`/admin/knowledge`)
   - ✅ Gerenciar base de conhecimento
   - ✅ Ingestão de documentos
   - ✅ Fontes de dados (web, documentos)

7. **Settings** (`/admin/settings`)
   - ✅ Configurações da plataforma
   - ✅ Integrações
   - ✅ Segurança

8. **Developers** (`/admin/developers`)
   - ✅ Documentação da API
   - ✅ SDKs e exemplos
   - ✅ Testes de integração

### Autenticação

- ✅ Login com email/password
- ✅ Login com Google (OAuth)
- ✅ Registro de novos usuários
- ✅ Recuperação de senha
- ✅ Autenticação unificada (Firebase Auth)

---

## 🔍 Regulatory RAG API

### Busca Semântica em Regulamentações

#### Funcionalidades
- ✅ Busca semântica com Vertex AI Search
- ✅ Cache inteligente com Redis
- ✅ Quality scoring (relevância + recency)
- ✅ Filtros por domínio específico
- ✅ Múltiplos frameworks regulatórios

**Frameworks Suportados:**
- LGPD (Lei Geral de Proteção de Dados)
- GDPR (General Data Protection Regulation)
- SOX (Sarbanes-Oxley Act)
- ANEEL (Agência Nacional de Energia Elétrica)
- ONS (Operador Nacional do Sistema)
- E outros 18+ frameworks

---

## 📄 Document Generator Engine

### Geração de Documentos

#### Funcionalidades
- ✅ Conversão BPMN para Mermaid
- ✅ Geração de templates de documentos
- ✅ Automação de documentação de processos
- ✅ Exportação em múltiplos formatos

---

## 🔌 MCP Servers

### Model Context Protocol

#### Servidores Disponíveis

1. **n.process MCP**
   - ✅ Operações de compliance
   - ✅ Geração de diagramas
   - ✅ Análise de processos

2. **Regulatory RAG MCP**
   - ✅ Busca de regulamentações
   - ✅ Consultas semânticas

3. **Document Generator MCP**
   - ✅ Conversão BPMN → Mermaid
   - ✅ Geração de documentos

4. **Regulatory Crawler MCP**
   - ✅ Crawling automatizado de regulamentações

5. **MCP Gateway**
   - ✅ Gateway HTTP para servidores MCP
   - ✅ Roteamento de requisições
   - ✅ Autenticação e validação

---

## 🚀 Funcionalidades Planejadas

### Fase 1 (Alta Prioridade)

1. **Webhooks e Notificações** ✅ (Implementado)
   - Sistema completo de webhooks
   - Retry automático
   - Assinatura HMAC SHA256

2. **Versionamento de Processos** ✅ (Implementado)
   - Histórico de versões
   - Comparação entre versões
   - Rollback

3. **Compliance Score em Tempo Real** ✅ (Implementado)
   - Cálculo automático
   - Atualização em tempo real
   - Alertas

### Fase 2 (Média Prioridade)

4. **Workflow de Aprovação**
   - Workflows customizáveis
   - Aprovadores por função
   - Notificações

5. **Dashboard de Compliance por Domínio**
   - Visão por domínio regulatório
   - Gráficos de tendências
   - Heatmap de compliance

6. **Tags e Categorização Avançada**
   - Tags hierárquicas
   - Tags automáticas (IA)
   - Filtros avançados

### Fase 3 (Baixa Prioridade)

7. **Busca Avançada**
   - Busca full-text
   - Busca semântica (IA)
   - Autocomplete

8. **Templates de Processos**
   - Templates pré-definidos
   - Personalização
   - Variáveis em templates

9. **Backup e Restore**
   - Backup automático
   - Restore seletivo
   - Exportação/importação

### Fase 4 (Futuro)

10. **IA para Sugestão de Melhorias**
    - Análise automática
    - Sugestões de otimização
    - Identificação de gargalos

11. **Marketplace de Templates**
    - Marketplace público
    - Compartilhamento de templates
    - Ratings e reviews

---

## 🔐 Segurança

### Funcionalidades de Segurança

- ✅ Autenticação unificada (Firebase Auth)
- ✅ API Key authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Criptografia AES-256-GCM
- ✅ Hash bcrypt para senhas
- ✅ Rate limiting
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Audit logs completos
- ✅ Armazenamento seguro de secrets (Secret Manager)

---

## 📊 Monitoramento e Observabilidade

### Funcionalidades

- ✅ Health checks
- ✅ Métricas de performance
- ✅ Logs estruturados
- ✅ Tracing distribuído
- ✅ Integração com Cloud Monitoring
- ✅ Alertas configuráveis
- ✅ Dashboard de métricas

---

## 🌐 Integrações

### Integrações Disponíveis

- ✅ Google Cloud Platform (GCP)
- ✅ Firebase (Auth, Firestore, Hosting)
- ✅ Vertex AI (Gemini, Search)
- ✅ Cloud Storage
- ✅ Secret Manager
- ✅ Cloud Billing
- ✅ Cloud Logging
- ✅ Cloud Monitoring

### Integrações Planejadas

- 🔄 Google Drive
- 🔄 SharePoint
- 🔄 NotebookLM
- 🔄 Slack (notificações)
- 🔄 Email (notificações)

---

## 📈 Métricas e Analytics

### Métricas Disponíveis

- ✅ Uso de API (requests/min, day, month)
- ✅ Custos por serviço
- ✅ Custos por consumidor
- ✅ Taxa de erro
- ✅ Latência (P50, P95, P99)
- ✅ Uptime
- ✅ Compliance scores
- ✅ Volume de processos analisados

---

## 🎯 Resumo Executivo

### Funcionalidades Core ✅

1. ✅ Geração de diagramas BPMN com IA
2. ✅ Análise de compliance multi-framework
3. ✅ Gerenciamento de API keys
4. ✅ Chat com Gemini para operações admin
5. ✅ FinOps e controle de custos
6. ✅ Monitoramento de serviços
7. ✅ Audit logs completos
8. ✅ Autenticação unificada
9. ✅ RBAC (Role-Based Access Control)
10. ✅ Busca semântica em regulamentações (RAG)

### Interfaces ✅

1. ✅ Client Portal (Next.js)
2. ✅ Admin Dashboard
3. ✅ API REST (FastAPI)
4. ✅ MCP Servers (para ferramentas de IA)

### Infraestrutura ✅

1. ✅ Deploy no Google Cloud Run
2. ✅ Firebase Hosting (Client Portal)
3. ✅ Cloud SQL (PostgreSQL)
4. ✅ Firestore (NoSQL)
5. ✅ Redis (Cache)
6. ✅ Cloud Storage (Backups)

---

**Total de Funcionalidades Implementadas**: 50+  
**Total de Endpoints API**: 30+  
**Status**: ✅ Produção

---

**Última Atualização**: 27 de Dezembro de 2024

