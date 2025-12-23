# 🚀 Quick Start - ComplianceEngine API

## Status Atual

### ✅ O que está pronto:
- ✅ **Código commitado** no GitHub: `https://github.com/resper1965/nprocess.git`
- ✅ **Autenticação GCP** configurada (você está autenticado)
- ✅ **Projeto GCP** configurado: `nprocess`
- ✅ **Arquivo .env** criado

### ⚠️ O que precisa:
- ⚠️ **Billing habilitado** para fazer deploy no GCP
- ⚠️ **API não está rodando** localmente (precisa iniciar)

---

## 🏃 Iniciar API Localmente (AGORA)

### Passo 1: Verificar Dependências

```bash
cd /home/resper/nProcess/nprocess

# Verificar se Python está instalado
python3 --version

# Verificar se pip está instalado
pip3 --version
```

### Passo 2: Instalar Dependências

```bash
# Criar ambiente virtual (recomendado)
python3 -m venv .venv
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### Passo 3: Verificar Autenticação GCP

```bash
# Você já está autenticado! Verificar:
gcloud auth list
gcloud config get-value project  # Deve mostrar: nprocess

# Testar token
gcloud auth application-default print-access-token
```

### Passo 4: Iniciar API

```bash
# Opção 1: Python direto
python -m app.main

# Opção 2: Uvicorn (recomendado, com hot reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080

# Opção 3: Makefile
make run-reload
```

### Passo 5: Testar API

Abra no navegador ou use curl:

```bash
# Health check
curl http://localhost:8080/health

# Ver documentação
curl http://localhost:8080/v1/docs

# Ver prompts
curl http://localhost:8080/v1/docs/prompts
```

Ou acesse no navegador:
- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc

---

## ☁️ Deploy no GCP (Quando Billing Estiver Habilitado)

### 1. Habilitar Billing

Acesse: https://console.cloud.google.com/billing?project=nprocess

### 2. Habilitar APIs

```bash
gcloud services enable \
    aiplatform.googleapis.com \
    firestore.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    --project=nprocess
```

### 3. Criar Firestore

```bash
gcloud firestore databases create \
    --location=us-central1 \
    --project=nprocess
```

### 4. Deploy

```bash
gcloud builds submit --config cloudbuild.yaml --project=nprocess
```

---

## 📋 Resumo Rápido

### Para rodar LOCALMENTE (agora):
```bash
cd /home/resper/nProcess/nprocess
source .venv/bin/activate  # se usar venv
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

### Para DEPLOY no GCP (depois):
1. Habilitar billing
2. `gcloud services enable ...`
3. `gcloud builds submit --config cloudbuild.yaml --project=nprocess`

---

**Você está autenticado e pronto para rodar localmente!** 🎉

