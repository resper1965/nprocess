# 🔄 Plano de Rollback - Process & Compliance Engine

**Data**: 27 de Dezembro de 2024  
**Versão**: 1.0.0

---

## 🎯 Objetivo

Documentar procedimentos para reverter deploy em produção em caso de problemas críticos.

**RTO (Recovery Time Objective)**: 30 minutos  
**RPO (Recovery Point Objective)**: 1 hora (último backup)

---

## ⚠️ Quando Fazer Rollback

### Critérios para Rollback Imediato

- ❌ Taxa de erro > 10%
- ❌ Serviço completamente indisponível
- ❌ Vazamento de dados ou segurança comprometida
- ❌ Performance degradada > 50%
- ❌ Funcionalidade crítica quebrada

### Critérios para Rollback Planejado

- ⚠️ Taxa de erro entre 5-10%
- ⚠️ Performance degradada 20-50%
- ⚠️ Problemas não críticos mas impactantes

---

## 🔄 Procedimentos de Rollback

### 1. Rollback Cloud Run (n.process API)

```bash
# 1. Listar revisões disponíveis
gcloud run revisions list \
  --service nprocess-api-prod \
  --region us-central1 \
  --project nprocess-prod \
  --format="table(metadata.name,status.conditions[0].lastTransitionTime)"

# 2. Identificar revisão anterior estável
# Exemplo: nprocess-api-prod-00042-abc

# 3. Fazer rollback para revisão anterior
gcloud run services update-traffic nprocess-api-prod \
  --to-revisions nprocess-api-prod-00042-abc=100 \
  --region us-central1 \
  --project nprocess-prod

# 4. Validar rollback
curl https://nprocess-api-prod-XXXXX.run.app/health
```

### 2. Rollback Cloud Run (Admin Control Plane)

```bash
# 1. Listar revisões
gcloud run revisions list \
  --service nprocess-admin-api-prod \
  --region us-central1 \
  --project nprocess-prod

# 2. Rollback
gcloud run services update-traffic nprocess-admin-api-prod \
  --to-revisions REVISION_NAME=100 \
  --region us-central1 \
  --project nprocess-prod

# 3. Validar
curl https://nprocess-admin-api-prod-XXXXX.run.app/health
```

### 3. Rollback Firebase Hosting (Client Portal)

#### Opção A: Via Firebase Console (Recomendado)

1. Acessar [Firebase Console](https://console.firebase.google.com/project/nprocess-prod/hosting)
2. Ir em Hosting > Releases
3. Selecionar versão anterior estável
4. Clicar em "Rollback"

#### Opção B: Via CLI

```bash
# 1. Listar releases
firebase hosting:channel:list --project nprocess-prod

# 2. Deploy versão anterior (se tiver backup)
cd client-portal
git checkout <commit-hash-anterior>
npm run build
firebase deploy --only hosting:client-portal --project nprocess-prod
```

### 4. Rollback Cloud SQL (Database)

```bash
# 1. Listar backups disponíveis
gcloud sql backups list \
  --instance nprocess-db-prod \
  --project nprocess-prod

# 2. Restaurar backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance nprocess-db-prod \
  --restore-instance nprocess-db-prod \
  --project nprocess-prod

# ⚠️ ATENÇÃO: Isso irá sobrescrever dados atuais!
```

### 5. Rollback Firestore

```bash
# 1. Listar exports disponíveis
gsutil ls gs://nprocess-backups-prod/firestore/

# 2. Restaurar export (requer Cloud Console ou script customizado)
# ⚠️ Processo complexo - consultar documentação do Firestore
```

---

## 📋 Checklist de Rollback

### Antes do Rollback

- [ ] Identificar problema específico
- [ ] Confirmar necessidade de rollback
- [ ] Notificar equipe
- [ ] Documentar problema
- [ ] Identificar revisão/versão anterior estável
- [ ] Verificar disponibilidade de backups

### Durante o Rollback

- [ ] Executar rollback em ordem:
  1. Backend Services (APIs)
  2. Frontend (Client Portal)
  3. Database (se necessário)
- [ ] Validar cada serviço após rollback
- [ ] Monitorar logs e métricas

### Após o Rollback

- [ ] Validar funcionalidades críticas
- [ ] Executar smoke tests
- [ ] Verificar logs sem erros críticos
- [ ] Confirmar que problema foi resolvido
- [ ] Documentar rollback
- [ ] Investigar causa raiz do problema
- [ ] Planejar correção e novo deploy

---

## 🚨 Rollback de Emergência (5 minutos)

### Procedimento Rápido

```bash
# 1. Rollback APIs (simultâneo)
gcloud run services update-traffic nprocess-api-prod \
  --to-revisions PREVIOUS_REVISION=100 \
  --region us-central1 \
  --project nprocess-prod &

gcloud run services update-traffic nprocess-admin-api-prod \
  --to-revisions PREVIOUS_REVISION=100 \
  --region us-central1 \
  --project nprocess-prod &

wait

# 2. Rollback Frontend (via Console - mais rápido)
# Acessar Firebase Console e fazer rollback manual

# 3. Validar
curl https://nprocess-api-prod-XXXXX.run.app/health
curl https://nprocess-admin-api-prod-XXXXX.run.app/health
```

---

## 📊 Validação Pós-Rollback

### Health Checks

```bash
# API Principal
curl https://nprocess-api-prod-XXXXX.run.app/health

# Admin API
curl https://nprocess-admin-api-prod-XXXXX.run.app/health

# Frontend
curl -I https://nprocess.ness.com.br
```

### Smoke Tests

1. ✅ Login funciona
2. ✅ Dashboard carrega
3. ✅ API Keys: criar/listar funciona
4. ✅ Chat responde
5. ✅ Sem erros no console

### Monitoramento

- [ ] Taxa de erro < 1%
- [ ] Latência P95 < 500ms
- [ ] Uptime > 99.9%
- [ ] Sem alertas críticos

---

## 🔍 Investigação Pós-Rollback

### Perguntas a Responder

1. **O que causou o problema?**
   - Revisar logs da versão problemática
   - Analisar métricas
   - Verificar mudanças no código

2. **Como prevenir no futuro?**
   - Melhorar testes
   - Adicionar validações
   - Implementar canary deployments

3. **O que precisa ser corrigido?**
   - Identificar bug específico
   - Criar issue/ticket
   - Planejar hotfix

---

## 📝 Template de Comunicação

### Notificação de Rollback

```
🚨 ROLLBACK EM PRODUÇÃO

Data/Hora: [DATA/HORA]
Serviços Afetados: [LISTA]
Causa: [DESCRIÇÃO BREVE]
Ação: Rollback para versão [VERSÃO]
Status: [EM ANDAMENTO/CONCLUÍDO]
Duração Estimada: [TEMPO]

Equipe: [NOMES]
```

---

## 🔄 Blue-Green Deployment (Prevenção)

Para evitar necessidade de rollback, considerar:

1. **Deploy em novo serviço (green)**
2. **Testar green completamente**
3. **Trocar tráfego gradualmente (10% → 50% → 100%)**
4. **Manter blue por período de observação**
5. **Remover blue após validação**

---

## 📚 Referências

- [Cloud Run Rollback](https://cloud.google.com/run/docs/rollbacks)
- [Firebase Hosting Rollback](https://firebase.google.com/docs/hosting/manage-hosting)
- [Cloud SQL Backup Restore](https://cloud.google.com/sql/docs/postgres/backup-recovery/restoring)

---

**Última Atualização**: 27 de Dezembro de 2024  
**Versão**: 1.0.0  
**Próxima Revisão**: Após primeiro deploy em produção

