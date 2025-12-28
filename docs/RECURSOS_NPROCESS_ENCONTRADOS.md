# Recursos "nprocess*" Encontrados no GCP

**Data da Busca:** 2025-12-28  
**Projeto Atual:** `nprocess-prod`  
**Padrão de Busca:** `nprocess*` (qualquer recurso que comece com "nprocess")

## 📊 Resumo Executivo

Foram encontrados **2 projetos** e **4 serviços Cloud Run** relacionados a "nprocess*" no GCP.

---

## 🔴 Serviços de Desenvolvimento (REMOVIDOS)

### 1. `nprocess-api-dev` ❌ REMOVIDO

**Status:** ✅ Removido em 2025-12-28

- **Nome:** `nprocess-api-dev`
- **URL:** ~~https://nprocess-api-dev-fur76izi3a-uc.a.run.app~~ (não existe mais)
- **Projeto:** `nprocess-prod`
- **Ambiente:** `dev`
- **Removido para:** Evitar custos desnecessários

### 2. `nprocess-admin-api-dev` ❌ REMOVIDO

**Status:** ✅ Removido em 2025-12-28

- **Nome:** `nprocess-admin-api-dev`
- **URL:** ~~https://nprocess-admin-api-dev-fur76izi3a-uc.a.run.app~~ (não existe mais)
- **Projeto:** `nprocess-prod`
- **Ambiente:** `dev`
- **Removido para:** Evitar custos desnecessários

---

## ✅ Projetos Encontrados

### 1. `nprocess-prod` (GCP Production)
- **Nome:** nProcess Production
- **Project Number:** 905989981186
- **Status:** ACTIVE
- **Tipo:** Projeto GCP de produção atual

### 2. `nprocess-8e801` (Firebase)
- **Nome:** nProcess
- **Project Number:** 43006907338
- **Status:** ACTIVE
- **Tipo:** Projeto Firebase (usado para Client Portal)
- **Service Account:** `firebase-adminsdk-fbsvc@nprocess-8e801.iam.gserviceaccount.com`

---

## ✅ Serviços Cloud Run no Projeto `nprocess-prod`

| Nome | URL | Ambiente | Status |
|------|-----|----------|--------|
| `nprocess-api-prod` | https://nprocess-api-prod-fur76izi3a-uc.a.run.app | Produção | ✅ Ativo |
| `nprocess-admin-api-prod` | https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app | Produção | ✅ Ativo |
| ~~`nprocess-api-dev`~~ | ~~https://nprocess-api-dev-fur76izi3a-uc.a.run.app~~ | ~~Desenvolvimento~~ | ❌ **REMOVIDO** |
| ~~`nprocess-admin-api-dev`~~ | ~~https://nprocess-admin-api-dev-fur76izi3a-uc.a.run.app~~ | ~~Desenvolvimento~~ | ❌ **REMOVIDO** |

---

## 📦 Outros Recursos no Projeto `nprocess-prod`

### Cloud SQL
- `nprocess-db-prod` (us-central1, PostgreSQL 15)

### Cloud Storage Buckets
- `nprocess-assets-prod` (US-CENTRAL1)
- `nprocess-documents-prod` (US-CENTRAL1)
- `nprocess-prod_cloudbuild` (US)
- `run-sources-nprocess-prod-us-central1` (US-CENTRAL1)

### Artifact Registry
- `nprocess-containers` (DOCKER)
- `gcr.io` (DOCKER)
- `cloud-run-source-deploy` (DOCKER)

### Secrets (Secret Manager)
- `nprocess-db-password-prod`
- `nprocess-firebase-admin-sdk`
- `nprocess-gemini-api-key`
- `nprocess-google-oauth-client-id`
- `nprocess-google-oauth-client-secret`

### Service Accounts
- `nprocess-admin-prod@nprocess-prod.iam.gserviceaccount.com` (n.process Admin Production)
- `nprocess-api-prod@nprocess-prod.iam.gserviceaccount.com` (n.process API Production)
- `firebase-admin-prod@nprocess-prod.iam.gserviceaccount.com` (Firebase Admin SDK)

---

## ✅ Ações Realizadas

1. **✅ Serviços de desenvolvimento removidos:**
   - `nprocess-api-dev` - ✅ Removido em 2025-12-28
   - `nprocess-admin-api-dev` - ✅ Removido em 2025-12-28
   - **Resultado:** Nenhum custo será gerado por esses serviços

2. **📊 Status atual:**
   - Apenas serviços de produção estão ativos
   - Custos reduzidos ao mínimo necessário

---

## 📝 Comandos Executados (Histórico)

### ✅ Serviços de desenvolvimento removidos:
```bash
# API Dev - REMOVIDO
gcloud run services delete nprocess-api-dev \
  --region=us-central1 \
  --project=nprocess-prod \
  --quiet

# Admin API Dev - REMOVIDO
gcloud run services delete nprocess-admin-api-dev \
  --region=us-central1 \
  --project=nprocess-prod \
  --quiet
```

**Data da remoção:** 2025-12-28  
**Motivo:** Reduzir custos desnecessários

---

## ✅ Conclusão

- **✅ 2 serviços de desenvolvimento REMOVIDOS:**
  - ~~`nprocess-api-dev`~~ - ✅ Removido
  - ~~`nprocess-admin-api-dev`~~ - ✅ Removido
- **2 projetos** encontrados: `nprocess-prod` (GCP) e `nprocess-8e801` (Firebase)
- **2 serviços Cloud Run** ativos (apenas produção):
  - `nprocess-api-prod` ✅
  - `nprocess-admin-api-prod` ✅
- Todos os outros recursos pertencem ao projeto de produção atual

**✅ Status:** Serviços de desenvolvimento removidos com sucesso. Nenhum custo será gerado por esses serviços.

