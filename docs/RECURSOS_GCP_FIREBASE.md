# 📊 Recursos GCP e Firebase - Process & Compliance Engine

**Data**: 27 de Dezembro de 2024  
**Projeto**: `nprocess-prod`  
**Ambiente**: Produção

---

## 📋 Índice

1. [Google Cloud Platform (GCP)](#google-cloud-platform-gcp)
   - [Cloud Run](#cloud-run)
   - [Cloud SQL](#cloud-sql)
   - [Cloud Storage](#cloud-storage)
   - [Secret Manager](#secret-manager)
   - [Vertex AI](#vertex-ai)
   - [Cloud Build](#cloud-build)
   - [Artifact Registry](#artifact-registry)
   - [Cloud Logging](#cloud-logging)
   - [Cloud Monitoring](#cloud-monitoring)
   - [IAM & Service Accounts](#iam--service-accounts)
   - [VPC & Networking](#vpc--networking)

2. [Firebase](#firebase)
   - [Firebase Hosting](#firebase-hosting)
   - [Firestore](#firestore)
   - [Firebase Authentication](#firebase-authentication)
   - [Firebase Security Rules](#firebase-security-rules)

3. [Custos Estimados](#custos-estimados)
4. [Quotas e Limites](#quotas-e-limites)
5. [Arquitetura de Recursos](#arquitetura-de-recursos)

---

## 🚀 Google Cloud Platform (GCP)

### Cloud Run

**Descrição**: Plataforma serverless para executar containers. Usado para hospedar as APIs (n.process API e Admin Control Plane).

#### Recursos Configurados

**n.process API**
- **Serviço**: `nprocess-api-prod`
- **Região**: `us-central1`
- **Container**: Docker image do n.process API
- **CPU**: 1 vCPU
- **Memória**: 1 GiB
- **Instâncias**: 0-10 (auto-scaling)
- **Timeout**: 300 segundos
- **Concorrência**: 80 requisições por instância
- **Service Account**: `nprocess-api-prod@nprocess-prod.iam.gserviceaccount.com`
- **Variáveis de Ambiente**:
  - `GCP_PROJECT_ID=nprocess-prod`
  - `VERTEX_AI_LOCATION=us-central1`
  - `VERTEX_AI_MODEL=gemini-1.5-pro-002`
  - `FIRESTORE_DATABASE=(default)`
  - `CORS_ORIGINS=https://nprocess.ness.com.br`

**Admin Control Plane**
- **Serviço**: `nprocess-admin-api-prod`
- **Região**: `us-central1`
- **Container**: Docker image do Admin Control Plane
- **CPU**: 1 vCPU
- **Memória**: 1 GiB
- **Instâncias**: 0-5 (auto-scaling)
- **Timeout**: 300 segundos
- **Concorrência**: 80 requisições por instância
- **Service Account**: `nprocess-admin-prod@nprocess-prod.iam.gserviceaccount.com`
- **Variáveis de Ambiente**:
  - `GCP_PROJECT_ID=nprocess-prod`
  - `DATABASE_URL=postgresql://...` (via Cloud SQL)
  - `ALLOWED_ORIGINS=https://nprocess.ness.com.br`

#### Características
- **Auto-scaling**: Escala automaticamente baseado em requisições
- **HTTPS**: SSL/TLS automático via Google-managed certificates
- **Logging**: Logs automáticos via Cloud Logging
- **Monitoring**: Métricas automáticas via Cloud Monitoring
- **Cold Start**: ~1-3 segundos para primeira requisição
- **Warm Instances**: Mantém instâncias ativas durante tráfego

#### Custos
- **CPU**: $0.00002400 por vCPU-segundo
- **Memória**: $0.00000250 por GiB-segundo
- **Requisições**: $0.40 por milhão de requisições
- **Estimativa Mensal**: ~$50-150 (dependendo do tráfego)

---

### Cloud SQL

**Descrição**: Banco de dados PostgreSQL gerenciado. Usado pelo Admin Control Plane para armazenar dados estruturados (API Keys, usuários, configurações).

#### Recursos Configurados

**Instância PostgreSQL**
- **Nome**: `nprocess-db-prod`
- **Versão**: PostgreSQL 15
- **Região**: `us-central1-c`
- **Tier**: `db-f1-micro` (1 vCPU compartilhado, 0.6 GB RAM)
- **Storage**: 20 GB SSD (auto-increase habilitado)
- **Backup**: Automático diário às 02:00 UTC
- **Manutenção**: Domingo às 03:00 UTC
- **IP Público**: `34.68.113.124`
- **Connection Name**: `nprocess-prod:us-central1:nprocess-db-prod`

**Database**
- **Nome**: `nprocess`
- **Charset**: UTF8
- **Collation**: en_US.UTF8

**Usuário**
- **Nome**: `nprocess_admin`
- **Tipo**: PostgreSQL user
- **Permissões**: Full access ao database `nprocess`
- **Senha**: Armazenada no Secret Manager (`nprocess-db-password-prod`)

#### Características
- **High Availability**: Opcional (não configurado inicialmente)
- **Backup Automático**: 7 dias de retenção
- **Point-in-Time Recovery**: Disponível
- **Connection Pooling**: Via Cloud SQL Proxy
- **Private IP**: Disponível via VPC (não configurado inicialmente)
- **SSL/TLS**: Obrigatório para conexões externas

#### Custos
- **Instância**: $7.67/mês (db-f1-micro)
- **Storage**: $0.17/GB/mês (SSD)
- **Backup**: $0.08/GB/mês
- **Network Egress**: $0.12/GB (primeiros 10 GB gratuitos)
- **Estimativa Mensal**: ~$10-15

---

### Cloud Storage

**Descrição**: Armazenamento de objetos. Usado para documentos de compliance, assets estáticos, e backups.

#### Buckets Configurados

**nprocess-documents-prod**
- **Propósito**: Armazenar documentos de compliance enviados pelos usuários
- **Região**: `us-central1`
- **Storage Class**: Standard (frequente acesso)
- **Lifecycle Policy**:
  - Após 90 dias → Nearline (acesso menos frequente)
  - Após 365 dias → Coldline (arquivamento)
- **CORS**: Configurado para `https://nprocess.ness.com.br`
- **IAM**: Service Accounts com `objectAdmin`
- **Versioning**: Desabilitado (pode ser habilitado se necessário)

**nprocess-assets-prod**
- **Propósito**: Assets estáticos (imagens, CSS, JS)
- **Região**: `us-central1`
- **Storage Class**: Standard
- **CORS**: Configurado para todos os domínios (leitura pública)
- **IAM**: Público com `objectViewer`, Service Accounts com `objectAdmin`
- **CDN**: Pode ser integrado com Cloud CDN

#### Características
- **Durabilidade**: 99.999999999% (11 noves)
- **Disponibilidade**: 99.99% (Standard)
- **Encryption**: AES-256 (automático)
- **Access Control**: IAM + ACLs
- **Lifecycle Management**: Automático via policies

#### Custos
- **Storage**: $0.020/GB/mês (Standard)
- **Operations**: $0.05 por 10.000 operações (Class A)
- **Network Egress**: $0.12/GB (primeiros 10 GB gratuitos)
- **Estimativa Mensal**: ~$5-20 (dependendo do volume)

---

### Secret Manager

**Descrição**: Gerenciamento centralizado de secrets (senhas, API keys, credenciais).

#### Secrets Configurados

**nprocess-db-password-prod**
- **Tipo**: Senha do PostgreSQL
- **Uso**: Conexão do Admin Control Plane ao Cloud SQL
- **Acesso**: Service Accounts (`nprocess-api-prod`, `nprocess-admin-prod`)
- **Rotação**: Manual (recomendado: mensal)

**nprocess-gemini-api-key**
- **Tipo**: API Key do Google Gemini (Vertex AI)
- **Uso**: Autenticação com Vertex AI para análises de compliance
- **Acesso**: Service Account `nprocess-api-prod`
- **Rotação**: Manual (conforme necessário)

**nprocess-firebase-admin-sdk**
- **Tipo**: JSON credentials do Firebase Admin SDK
- **Uso**: Autenticação do Admin Control Plane com Firebase
- **Acesso**: Service Account `nprocess-admin-prod`
- **Rotação**: Manual (conforme necessário)

#### Características
- **Encryption**: AES-256 (automático)
- **Replication**: Automática (multi-region)
- **Versioning**: Suportado (múltiplas versões)
- **Access Audit**: Logs de acesso via Cloud Audit Logs
- **IAM Integration**: Controle de acesso granular

#### Custos
- **Secrets**: $0.06 por secret/mês
- **Versions**: $0.06 por versão/mês
- **Operations**: $0.03 por 10.000 operações
- **Estimativa Mensal**: ~$1-2

---

### Vertex AI

**Descrição**: Plataforma de Machine Learning. Usado para análises de compliance usando o modelo Gemini.

#### Recursos Configurados

**Modelo Gemini**
- **Modelo**: `gemini-1.5-pro-002`
- **Location**: `us-central1`
- **Uso**: Análise de documentos de compliance, geração de insights
- **Context Window**: 1M tokens
- **Output Tokens**: Até 8.192 tokens por resposta

**Endpoints**
- **API Endpoint**: `us-central1-aiplatform.googleapis.com`
- **Autenticação**: Service Account (`nprocess-api-prod`)
- **Rate Limiting**: Configurado via quotas

#### Características
- **Serverless**: Sem necessidade de provisionar infraestrutura
- **Auto-scaling**: Escala automaticamente
- **Multi-modal**: Suporta texto, imagens, PDFs
- **Streaming**: Suporta streaming de respostas
- **Safety Filters**: Filtros de segurança automáticos

#### Custos
- **Input Tokens**: $1.25 por 1M tokens (Gemini 1.5 Pro)
- **Output Tokens**: $5.00 por 1M tokens (Gemini 1.5 Pro)
- **Estimativa Mensal**: ~$50-200 (dependendo do volume de análises)

---

### Cloud Build

**Descrição**: CI/CD para build e deploy de containers.

#### Recursos Configurados

**Builds Automáticos**
- **Trigger**: Push para branch `main` ou `production`
- **Build Steps**:
  1. Build Docker image
  2. Push para Artifact Registry
  3. Deploy para Cloud Run
- **Timeout**: 600 segundos
- **Machine Type**: `n1-standard-1` (1 vCPU, 3.75 GB RAM)

**Service Account**
- **Nome**: `905989981186@cloudbuild.gserviceaccount.com`
- **Permissões**: Cloud Run Admin, Artifact Registry Writer

#### Características
- **Parallel Builds**: Até 10 builds simultâneos
- **Caching**: Cache de layers Docker
- **Logs**: Integrado com Cloud Logging
- **Notifications**: Pode ser integrado com Slack/Email

#### Custos
- **Build Minutes**: $0.003 por minuto (primeiros 120 minutos/dia gratuitos)
- **Estimativa Mensal**: ~$5-15 (dependendo da frequência de deploys)

---

### Artifact Registry

**Descrição**: Repositório de containers Docker.

#### Recursos Configurados

**Repositório**
- **Nome**: `nprocess-containers`
- **Formato**: Docker
- **Região**: `us-central1`
- **Imagens**:
  - `nprocess-api-prod:latest`
  - `nprocess-admin-api-prod:latest`

#### Características
- **Vulnerability Scanning**: Automático (opcional)
- **IAM**: Controle de acesso granular
- **Lifecycle Policies**: Pode configurar retenção automática
- **Multi-region**: Suporte a replicação

#### Custos
- **Storage**: $0.10/GB/mês
- **Operations**: $0.05 por 10.000 operações
- **Estimativa Mensal**: ~$2-5

---

### Cloud Logging

**Descrição**: Sistema de logs centralizado.

#### Recursos Configurados

**Logs Coletados**
- **Cloud Run Logs**: Logs de stdout/stderr dos containers
- **Cloud SQL Logs**: Logs de queries e erros
- **Firestore Logs**: Logs de operações (se habilitado)
- **Audit Logs**: Logs de acesso e operações administrativas

**Sinks**
- **Default**: Logs armazenados por 30 dias
- **Export**: Pode exportar para BigQuery, Cloud Storage, Pub/Sub

#### Características
- **Structured Logging**: Suporte a JSON logs
- **Log-based Metrics**: Criar métricas baseadas em logs
- **Logs Explorer**: Interface web para busca e análise
- **Alerting**: Pode criar alertas baseados em logs

#### Custos
- **Ingestion**: $0.50 por GB (primeiros 50 GB/mês gratuitos)
- **Storage**: $0.01 por GB/mês (primeiros 50 GB/mês gratuitos)
- **Estimativa Mensal**: ~$5-20 (dependendo do volume)

---

### Cloud Monitoring

**Descrição**: Monitoramento e alertas.

#### Recursos Configurados

**Métricas Coletadas**
- **Cloud Run**: CPU, memória, requisições, latência, erros
- **Cloud SQL**: CPU, memória, conexões, queries
- **Firestore**: Reads, writes, deletes
- **Custom Metrics**: Métricas customizadas da aplicação

**Dashboards**
- **Cloud Run Dashboard**: Métricas dos serviços
- **Cloud SQL Dashboard**: Métricas do banco de dados
- **Application Dashboard**: Métricas customizadas

**Alertas**
- **High Error Rate**: > 5% de erros
- **High Latency**: P95 > 1 segundo
- **High CPU**: > 80% de CPU
- **Database Connections**: > 80% do limite

#### Características
- **Real-time Monitoring**: Métricas em tempo real
- **SLO Monitoring**: Service Level Objectives
- **Uptime Checks**: Verificação de disponibilidade
- **Notification Channels**: Email, Slack, PagerDuty

#### Custos
- **Métricas**: $0.258 por métrica/mês (primeiras 150 métricas gratuitas)
- **API Calls**: $0.01 por 1.000 calls
- **Estimativa Mensal**: ~$10-30

---

### IAM & Service Accounts

**Descrição**: Gerenciamento de identidades e permissões.

#### Service Accounts Criados

**nprocess-api-prod**
- **Email**: `nprocess-api-prod@nprocess-prod.iam.gserviceaccount.com`
- **Uso**: Cloud Run service para n.process API
- **Permissões**:
  - `roles/cloudsql.client` - Conectar ao Cloud SQL
  - `roles/secretmanager.secretAccessor` - Ler secrets
  - `roles/datastore.user` - Acessar Firestore
  - `roles/storage.objectUser` - Acessar Cloud Storage
  - `roles/aiplatform.user` - Usar Vertex AI

**nprocess-admin-prod**
- **Email**: `nprocess-admin-prod@nprocess-prod.iam.gserviceaccount.com`
- **Uso**: Cloud Run service para Admin Control Plane
- **Permissões**:
  - `roles/cloudsql.client` - Conectar ao Cloud SQL
  - `roles/secretmanager.secretAccessor` - Ler secrets
  - `roles/datastore.user` - Acessar Firestore
  - `roles/storage.objectUser` - Acessar Cloud Storage
  - `roles/logging.logWriter` - Escrever logs
  - `roles/monitoring.metricWriter` - Escrever métricas

#### Características
- **Principle of Least Privilege**: Permissões mínimas necessárias
- **Key Rotation**: Suporte a rotação de keys
- **Audit Logs**: Todas as operações são auditadas
- **Conditional Access**: Pode adicionar condições às permissões

#### Custos
- **Gratuito**: Service Accounts não têm custo adicional

---

### VPC & Networking

**Descrição**: Rede virtual e conectividade.

#### Recursos Configurados

**VPC Connector** (Opcional - não configurado inicialmente)
- **Propósito**: Conectar Cloud Run ao Cloud SQL via Private IP
- **Região**: `us-central1`
- **Tipo**: Serverless VPC Access

**Cloud SQL Private IP** (Opcional - não configurado inicialmente)
- **Propósito**: Conexão privada ao Cloud SQL (mais seguro)
- **Vantagem**: Não expõe IP público

#### Características
- **Public IP**: Atualmente usando IP público (Cloud SQL)
- **Private IP**: Disponível via VPC (recomendado para produção)
- **Cloud NAT**: Para egress de instâncias sem IP público

#### Custos
- **VPC Connector**: $0.10 por vCPU-hora + $0.05 por GB processado
- **Cloud NAT**: $0.045 por GB processado
- **Estimativa Mensal**: ~$10-30 (se configurado)

---

## 🔥 Firebase

### Firebase Hosting

**Descrição**: Hospedagem estática para o Client Portal (Next.js).

#### Recursos Configurados

**Site**
- **Project ID**: `nprocess-prod`
- **Site ID**: `nprocess-prod` (ou custom domain)
- **Build**: Next.js export estático
- **Deploy**: Via Firebase CLI ou CI/CD

**Custom Domain** (Opcional)
- **Domínio**: `nprocess.ness.com.br` (planejado)
- **SSL**: Automático via Let's Encrypt
- **DNS**: Configuração via Firebase Console

#### Características
- **CDN Global**: Distribuição global via CDN
- **HTTPS**: SSL/TLS automático
- **Custom Headers**: Headers de segurança configurados
- **Rewrites**: Rewrites para SPA routing
- **Preview Channels**: Canais de preview para testes

#### Custos
- **Hosting**: Gratuito até 10 GB storage + 360 MB/dia transfer
- **Excedente**: $0.026/GB storage, $0.15/GB transfer
- **Estimativa Mensal**: ~$0-10 (dependendo do tráfego)

---

### Firestore

**Descrição**: Banco de dados NoSQL serverless. Usado para perfis de usuários, sessões, e dados não estruturados.

#### Recursos Configurados

**Database**
- **Project ID**: `nprocess-prod`
- **Database ID**: `(default)`
- **Location**: `us-central1`
- **Mode**: Native (Firestore)
- **Edition**: Standard

**Collections Principais**
- **users**: Perfis de usuários
  - `uid`: User ID (Firebase Auth)
  - `email`: Email do usuário
  - `role`: RBAC role (super_admin, admin, user, etc.)
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **api_keys**: API Keys geradas pelos usuários
  - `key_id`: ID único
  - `user_id`: Owner
  - `name`: Nome descritivo
  - `created_at`: Timestamp
  - `last_used`: Timestamp

- **sessions**: Sessões de chat
  - `session_id`: ID único
  - `user_id`: Owner
  - `messages`: Array de mensagens
  - `created_at`: Timestamp

#### Características
- **Real-time Updates**: Listeners em tempo real
- **Offline Support**: Suporte offline (Client SDK)
- **Transactions**: Transações ACID
- **Queries**: Queries complexas com índices
- **Security Rules**: Regras de segurança granulares

#### Custos
- **Document Reads**: $0.06 por 100.000 reads
- **Document Writes**: $0.18 por 100.000 writes
- **Document Deletes**: $0.02 por 100.000 deletes
- **Storage**: $0.18/GB/mês
- **Estimativa Mensal**: ~$20-50 (dependendo do uso)

---

### Firebase Authentication

**Descrição**: Autenticação de usuários.

#### Recursos Configurados

**Providers**
- **Email/Password**: Habilitado
- **Google Sign-In**: Habilitado
- **Custom Claims**: Suporte a roles (RBAC)

**Configurações**
- **Authorized Domains**: `nprocess.ness.com.br`, `*.firebaseapp.com`
- **Email Verification**: Opcional
- **Password Reset**: Habilitado
- **Session Management**: Tokens JWT

#### Características
- **Multi-factor Authentication**: Disponível (não configurado)
- **Phone Authentication**: Disponível (não configurado)
- **Custom Tokens**: Suporte a tokens customizados
- **User Management**: Via Firebase Console ou Admin SDK

#### Custos
- **Gratuito**: Até 50.000 MAU (Monthly Active Users)
- **Excedente**: $0.0055 por MAU adicional
- **Estimativa Mensal**: ~$0 (até 50k usuários)

---

### Firebase Security Rules

**Descrição**: Regras de segurança para Firestore e Storage.

#### Regras Configuradas

**Firestore Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && 
                      request.auth.uid == userId &&
                      !exists(/databases/$(database)/documents/users/$(userId));
    }
    
    // API Keys collection
    match /api_keys/{keyId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
  }
}
```

**Storage Rules** (se configurado)
- Acesso baseado em autenticação
- Validação de tipos de arquivo
- Limites de tamanho

#### Características
- **Real-time Validation**: Validação em tempo real
- **Simulator**: Teste de regras localmente
- **Versioning**: Controle de versão das regras
- **Deploy**: Via Firebase CLI

#### Custos
- **Gratuito**: Sem custo adicional

---

## 💰 Custos Estimados

### Resumo Mensal

| Serviço | Custo Estimado | Notas |
|---------|----------------|-------|
| Cloud Run | $50-150 | Depende do tráfego |
| Cloud SQL | $10-15 | db-f1-micro |
| Cloud Storage | $5-20 | Depende do volume |
| Secret Manager | $1-2 | 3-5 secrets |
| Vertex AI | $50-200 | Depende do volume de análises |
| Cloud Build | $5-15 | Depende da frequência de deploys |
| Artifact Registry | $2-5 | Storage de imagens |
| Cloud Logging | $5-20 | Depende do volume de logs |
| Cloud Monitoring | $10-30 | Métricas e alertas |
| Firebase Hosting | $0-10 | Geralmente gratuito |
| Firestore | $20-50 | Depende do uso |
| Firebase Auth | $0 | Gratuito até 50k MAU |
| **TOTAL** | **~$158-522/mês** | Varia conforme uso |

### Otimizações de Custo

1. **Cloud SQL**: Upgrade para tier maior apenas quando necessário
2. **Cloud Run**: Ajustar min/max instances baseado em tráfego
3. **Vertex AI**: Cache de respostas quando possível
4. **Cloud Storage**: Usar lifecycle policies para mover para tiers mais baratos
5. **Logging**: Configurar retenção e export para reduzir custos
6. **Monitoring**: Limitar número de métricas customizadas

---

## 📊 Quotas e Limites

### Quotas Configuradas

| Recurso | Quota Atual | Limite Necessário |
|---------|-------------|-------------------|
| Cloud Run CPU | 200 CPUs | ✅ Aprovado |
| Cloud Run Memory | 200 GB | ✅ Aprovado |
| Cloud Run Instances | 30 instâncias | ✅ Aprovado |
| Vertex AI Requests | 1000/min | ✅ Aprovado |
| Cloud SQL Connections | 200 conexões | ✅ Aprovado |
| Firestore Reads | 10.000/dia | ✅ Aprovado |
| Firestore Writes | 5.000/dia | ✅ Aprovado |

### Limites Importantes

- **Cloud Run**: 1000 serviços por projeto
- **Cloud SQL**: 40 instâncias por projeto
- **Firestore**: 1M writes/dia (free tier), ilimitado (paid)
- **Firebase Auth**: 50k MAU (free tier), ilimitado (paid)
- **Secret Manager**: 10.000 secrets por projeto

---

## 🏗️ Arquitetura de Recursos

```
┌─────────────────────────────────────────────────────────────┐
│                     nprocess-prod (GCP)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  Cloud Run   │      │  Cloud Run   │                    │
│  │  n.process   │      │  Admin API   │                    │
│  │     API      │      │              │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                      │                             │
│         ├──────────────────────┼─────────────────────┐        │
│         │                      │                   │         │
│  ┌──────▼───────┐    ┌────────▼────────┐  ┌──────▼──────┐ │
│  │  Vertex AI   │    │   Cloud SQL      │  │ Firestore  │ │
│  │  (Gemini)    │    │  (PostgreSQL)    │  │  (NoSQL)   │ │
│  └──────────────┘    └──────────────────┘  └────────────┘ │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐                     │
│  │Cloud Storage│    │Secret Manager│                     │
│  │  (Buckets)  │    │   (Secrets)  │                     │
│  └──────────────┘    └──────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase (nprocess-prod)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Hosting    │      │  Firestore   │                    │
│  │ (Client      │      │  (Database)  │                    │
│  │  Portal)     │      │              │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                      │                             │
│         └──────────┬──────────┘                             │
│                    │                                         │
│         ┌──────────▼──────────┐                             │
│         │  Authentication     │                             │
│         │  (Firebase Auth)    │                             │
│         └─────────────────────┘                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas Importantes

### Segurança
- Todos os secrets estão no Secret Manager
- Service Accounts seguem princípio do menor privilégio
- Firestore Security Rules implementadas
- HTTPS obrigatório em todos os serviços
- CORS configurado apenas para domínios permitidos

### Escalabilidade
- Cloud Run auto-scales baseado em requisições
- Firestore escala automaticamente
- Cloud SQL pode ser upgradeado conforme necessário
- Vertex AI serverless (sem limite de escala)

### Disponibilidade
- Cloud Run: 99.95% SLA
- Cloud SQL: 99.95% SLA (com HA)
- Firestore: 99.999% SLA
- Firebase Hosting: 99.95% SLA

### Backup e DR
- Cloud SQL: Backup automático diário (7 dias)
- Firestore: Point-in-time recovery disponível
- Cloud Storage: Versioning opcional
- Secrets: Versioning automático

---

**Última Atualização**: 27 de Dezembro de 2024  
**Versão**: 1.0.0

