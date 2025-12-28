# Runbook de Produção - Process & Compliance Engine

**Data**: 27 de Dezembro de 2024  
**Versão**: 1.0.0

---

## 📋 Índice

1. [Comandos Essenciais](#comandos-essenciais)
2. [Procedimentos Comuns](#procedimentos-comuns)
3. [Troubleshooting](#troubleshooting)
4. [Procedimentos de Emergência](#procedimentos-de-emergência)

---

## 🔧 Comandos Essenciais

### Ver Status dos Serviços

```bash
# Listar todos os serviços
gcloud run services list --region us-central1 --project nprocess-prod

# Ver detalhes de um serviço
gcloud run services describe nprocess-api-prod \
  --region us-central1 \
  --project nprocess-prod

# Ver health check
curl https://nprocess-api-prod-XXXXX.run.app/health
```

### Ver Logs

```bash
# Logs da API
gcloud run services logs read nprocess-api-prod \
  --region us-central1 \
  --limit 100 \
  --project nprocess-prod

# Logs do Admin
gcloud run services logs read nprocess-admin-api-prod \
  --region us-central1 \
  --limit 100 \
  --project nprocess-prod

# Logs em tempo real
gcloud run services logs tail nprocess-api-prod \
  --region us-central1 \
  --project nprocess-prod
```

### Ver Métricas

```bash
# Ver métricas no console
# https://console.cloud.google.com/monitoring?project=nprocess-prod

# Via CLI
gcloud monitoring time-series list \
  --filter='resource.type="cloud_run_revision"' \
  --project nprocess-prod
```

### Ver Custos

```bash
# Ver custos do projeto
gcloud billing accounts list
gcloud billing projects describe nprocess-prod

# Ver budget
gcloud billing budgets list --billing-account=BILLING_ACCOUNT_ID
```

---

## 🔄 Procedimentos Comuns

### Deploy de Nova Versão

```bash
# 1. Testar localmente
npm test
python -m pytest

# 2. Deploy
./scripts/deploy-production.sh

# 3. Validar
curl https://nprocess-api-prod-XXXXX.run.app/health
```

### Rollback

```bash
# Listar revisões
gcloud run revisions list \
  --service nprocess-api-prod \
  --region us-central1 \
  --project nprocess-prod

# Rollback para revisão anterior
gcloud run services update-traffic nprocess-api-prod \
  --to-revisions REVISION_NAME=100 \
  --region us-central1 \
  --project nprocess-prod
```

### Atualizar Variáveis de Ambiente

```bash
# Atualizar env vars
gcloud run services update nprocess-api-prod \
  --update-env-vars "KEY=VALUE" \
  --region us-central1 \
  --project nprocess-prod
```

### Escalar Serviço

```bash
# Aumentar min instances
gcloud run services update nprocess-api-prod \
  --min-instances 2 \
  --region us-central1 \
  --project nprocess-prod
```

---

## 🔍 Troubleshooting

### Serviço Não Responde

1. Verificar logs
2. Verificar health check
3. Verificar quotas
4. Verificar billing

### Erro de Autenticação

1. Verificar Firebase Auth config
2. Verificar tokens
3. Verificar Firestore rules
4. Verificar service accounts

### Performance Degradada

1. Verificar métricas de latência
2. Verificar uso de CPU/memória
3. Verificar conexões de banco
4. Verificar cache

### Custos Elevados

1. Verificar uso por serviço
2. Verificar Vertex AI calls
3. Verificar instâncias ativas
4. Revisar quotas

---

## 🆘 Procedimentos de Emergência

### Serviço Down

1. Verificar status no GCP Console
2. Verificar logs de erro
3. Tentar restart do serviço
4. Se necessário, rollback

### Vazamento de Dados

1. Isolar serviço afetado
2. Revogar API keys comprometidas
3. Notificar equipe de segurança
4. Investigar logs
5. Aplicar correções

### Ataque DDoS

1. Ativar rate limiting mais agressivo
2. Bloquear IPs no Cloud Armor
3. Escalar serviços se necessário
4. Monitorar métricas

---

**Última Atualização**: 27 de Dezembro de 2024

