# Guia de Autenticação - ComplianceEngine API

## 📋 Status Atual

### ✅ Commit no GitHub
- **Repositório**: `https://github.com/resper1965/nprocess.git`
- **Branch**: `main`
- **Último commit**: `fcc447c` - "feat: Adicionar endpoints de documentação na API"
- **Status**: ✅ Tudo commitado e no GitHub

### ⚠️ Deploy no GCP
- **Status**: ⏳ Aguardando billing habilitado
- **Projeto**: `nprocess` (Project Number: 273624403528)
- **Problema**: Billing account não encontrado

---

## 🔐 Autenticação no GCP

### 1. Autenticação para Desenvolvimento Local

Para rodar a API localmente e acessar serviços do GCP (Firestore, Vertex AI):

```bash
# 1. Autenticar no GCP
gcloud auth login

# 2. Configurar Application Default Credentials (ADC)
gcloud auth application-default login

# 3. Configurar projeto
gcloud config set project nprocess

# 4. Verificar autenticação
gcloud auth list
gcloud config get-value project
```

### 2. Verificar Autenticação Atual

```bash
# Ver conta ativa
gcloud auth list

# Ver projeto configurado
gcloud config get-value project

# Testar ADC
gcloud auth application-default print-access-token
```

### 3. Configurar Quota Project (se necessário)

Se você receber aviso sobre quota project:

```bash
gcloud auth application-default set-quota-project nprocess
```

---

## 🚀 Rodar API Localmente

### Opção 1: Python Direto

```bash
cd /home/resper/nProcess/nprocess

# 1. Criar ambiente virtual (se não existir)
python3 -m venv .venv
source .venv/bin/activate  # ou: .venv\Scripts\activate no Windows

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com: GOOGLE_CLOUD_PROJECT=nprocess

# 4. Rodar API
python -m app.main
# ou
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

### Opção 2: Docker Compose

```bash
cd /home/resper/nProcess/nprocess

# 1. Configurar .env
cp .env.example .env
# Edite .env

# 2. Rodar com docker-compose
docker-compose up
```

### Opção 3: Makefile

```bash
cd /home/resper/nProcess/nprocess

# Instalar dependências
make install-dev

# Rodar API
make run

# Ou com hot reload
make run-reload
```

---

## 🌐 Acessar API Local

Após iniciar a API, acesse:

- **API Base**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Documentação Swagger**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc
- **Prompts**: http://localhost:8080/v1/docs/prompts
- **Integração**: http://localhost:8080/v1/docs/integration

---

## ☁️ Deploy no GCP (Cloud Run)

### Pré-requisitos

1. **Billing habilitado** no projeto `nprocess`
2. **APIs habilitadas**:
   - aiplatform.googleapis.com
   - firestore.googleapis.com
   - run.googleapis.com
   - cloudbuild.googleapis.com

### Passo a Passo

#### 1. Habilitar Billing

```bash
# Verificar se billing está habilitado
gcloud billing projects describe nprocess

# Se não estiver, você precisa fazer via Console:
# https://console.cloud.google.com/billing?project=nprocess
```

#### 2. Habilitar APIs

```bash
gcloud services enable \
    aiplatform.googleapis.com \
    firestore.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    --project=nprocess
```

#### 3. Configurar Firestore

```bash
# Criar Firestore Database (Native mode)
gcloud firestore databases create \
    --location=us-central1 \
    --project=nprocess
```

#### 4. Fazer Deploy

```bash
# Opção 1: Cloud Build (Recomendado)
gcloud builds submit --config cloudbuild.yaml --project=nprocess

# Opção 2: Script de deploy
./deploy.sh dev
```

#### 5. Verificar Deploy

```bash
# Listar serviços
gcloud run services list --project=nprocess --region=us-central1

# Obter URL
gcloud run services describe compliance-engine \
    --project=nprocess \
    --region=us-central1 \
    --format='value(status.url)'

# Ver logs
gcloud run services logs read compliance-engine \
    --project=nprocess \
    --region=us-central1
```

---

## 🔑 Autenticação em Produção (Cloud Run)

### Opção 1: Público (Atual)

A API está configurada como `--allow-unauthenticated`, então não precisa autenticação.

### Opção 2: Autenticado (Recomendado para Produção)

```bash
# Deploy com autenticação
gcloud run deploy compliance-engine \
    --image gcr.io/nprocess/compliance-engine:latest \
    --platform managed \
    --region us-central1 \
    --no-allow-unauthenticated \
    --project=nprocess
```

Para acessar API autenticada:

```bash
# Obter token
gcloud auth print-identity-token

# Usar em requisições
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
    https://compliance-engine-xxxxx-uc.a.run.app/health
```

---

## 🐛 Troubleshooting

### Erro: "Billing account not found"

**Solução**: Habilitar billing no Console do GCP:
1. Acesse: https://console.cloud.google.com/billing?project=nprocess
2. Selecione ou crie uma conta de billing
3. Associe ao projeto `nprocess`

### Erro: "Application Default Credentials not found"

**Solução**:
```bash
gcloud auth application-default login
```

### Erro: "Permission denied" ao acessar Firestore/Vertex AI

**Solução**: Verificar permissões da conta de serviço:
```bash
# Ver permissões da conta atual
gcloud projects get-iam-policy nprocess \
    --flatten="bindings[].members" \
    --filter="bindings.members:user:$(gcloud config get-value account)"
```

### Erro: "Port 8080 already in use"

**Solução**:
```bash
# Ver o que está usando a porta
sudo lsof -i :8080
# ou
sudo netstat -tulpn | grep 8080

# Matar processo ou usar outra porta
uvicorn app.main:app --port 8081
```

### API não inicia localmente

**Solução**:
1. Verificar se todas as dependências estão instaladas: `pip install -r requirements.txt`
2. Verificar variáveis de ambiente: `cat .env`
3. Verificar logs: `python -m app.main` (sem uvicorn para ver erros)
4. Verificar autenticação GCP: `gcloud auth application-default print-access-token`

---

## 📝 Checklist de Autenticação

- [ ] `gcloud auth login` executado
- [ ] `gcloud auth application-default login` executado
- [ ] `gcloud config set project nprocess` executado
- [ ] Billing habilitado no projeto (para deploy)
- [ ] APIs habilitadas (para deploy)
- [ ] Firestore criado (para deploy)
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Dependências instaladas (requirements.txt)

---

**Última atualização**: 2025-12-22

