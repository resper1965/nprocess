# 💰 Análise de Custos - Recursos Overkill

**Data**: 06 de Janeiro de 2026  
**Projetos Analisados**: `nprocess-8e801` (Firebase) e `nprocess-prod` (GCP)

---

## 📊 Resumo Executivo

Foram identificados **vários recursos que podem estar gerando custos desnecessários**:

1. ✅ **Firebase Hosting**: 2 sites duplicados
2. ⚠️ **Cloud Run**: Serviço frontend não utilizado
3. ⚠️ **Cloud Run**: Configurações podem ser otimizadas
4. ⚠️ **Cloud Storage**: Buckets podem ter lifecycle policies
5. ⚠️ **Quotas**: Quotas muito altas solicitadas

---

## 🔴 Problemas Identificados

### 1. Firebase Hosting - Sites Duplicados ⚠️ **OVERKILL**

**Problema**: Existem **2 sites** no Firebase Hosting, mas apenas 1 está sendo usado.

#### Sites Encontrados:
- ✅ `nprocess-8e801-4711d` - **ATIVO** (usado atualmente)
  - URL: https://nprocess-8e801-4711d.web.app
  - Deploy recente: ✅
  
- ❌ `nprocess-8e801` - **INATIVO** (não usado)
  - URL: https://nprocess-8e801.web.app
  - Deploy: Provavelmente antigo

**Impacto no Custo**: 
- Firebase Hosting tem tier gratuito generoso, mas sites duplicados podem causar confusão
- **Ação**: Deletar o site `nprocess-8e801` se não estiver sendo usado

**Como Verificar**:
```bash
# Verificar qual site está ativo
firebase hosting:sites:list --project=nprocess-8e801

# Verificar deploys recentes
firebase hosting:channel:list --project=nprocess-8e801
```

---

### 2. Cloud Run - Serviço Frontend Não Utilizado ✅ **RESOLVIDO**

**Status**: ✅ **DELETADO em 06/01/2026**

**Problema**: Existia um serviço `nprocess-frontend-prod` no Cloud Run, mas o frontend está hospedado no **Firebase Hosting**.

#### Serviço que foi deletado:
- ❌ `nprocess-frontend-prod` - **DELETADO**
  - URL: ~~https://nprocess-frontend-prod-fur76izi3a-uc.a.run.app~~ (não existe mais)
  - CPU: 1000m (1 vCPU)
  - Memória: 512Mi
  - Status: **DELETADO**

**Economia Realizada**: 
- ✅ Serviço deletado com sucesso
- **Economia estimada**: ~$10-30/mês

**Ação Executada**:
```bash
gcloud run services delete nprocess-frontend-prod \
  --project=nprocess-prod \
  --region=us-central1 \
  --quiet
```

**Resultado**: 
- ✅ Serviço removido do Cloud Run
- ✅ Frontend continua funcionando no Firebase Hosting
- ✅ Economia de custos implementada

---

### 3. Cloud Run - Configurações Potencialmente Overkill ⚠️

#### Serviços Ativos:

**nprocess-api-prod**:
- CPU: 1 vCPU
- Memória: 1 GiB
- Concorrência: 80 requisições/instância
- Min Instances: **0** ✅ (não configurado = 0, bom!)
- Max Instances: **10**
- Startup CPU Boost: Ativado

**nprocess-admin-api-prod**:
- CPU: 1 vCPU
- Memória: 1 GiB
- Concorrência: 80 requisições/instância
- Min Instances: **0** ✅ (não configurado = 0, bom!)
- Max Instances: **5**
- Startup CPU Boost: Ativado
- Cloud SQL: Conectado

**nprocess-frontend-prod**:
- CPU: 1000m (1 vCPU)
- Memória: 512 MiB
- Concorrência: 80 requisições/instância
- Min Instances: **0** ✅ (não configurado = 0)
- Max Instances: **20** ⚠️ (muito alto se não usado)
- Startup CPU Boost: Ativado

**Status Atual**:
1. ✅ **Min Instances = 0**: Configurado corretamente (não cobra 24/7)
2. ⚠️ **Concorrência 80**: Pode ser muito alto para APIs que fazem chamadas a Vertex AI (que são lentas)
3. ⚠️ **Max Instances**: Frontend com max=20 pode ser excessivo se não usado
4. ✅ **Memória 1 GiB**: Razoável para APIs

**Recomendações**:
- ✅ **Min Instances = 0**: Já configurado corretamente!
- ⚠️ **Concorrência = 10-20**: Para APIs que fazem chamadas a Vertex AI, reduzir para evitar timeouts
- ⚠️ **Max Instances Frontend**: Reduzir de 20 para 5 se não usado
- ✅ **Memória**: Manter 1 GiB (razoável)

**Custo Estimado Atual**:
- Com min-instances=0: ~$5-15/mês por serviço (apenas quando há tráfego) ✅
- **Total estimado**: ~$15-45/mês para os 3 serviços (dependendo do tráfego)

---

### 4. Cloud Storage - Lifecycle Policies ⚠️

#### Buckets Encontrados:
- `gs://nprocess-assets-prod/` - **0 B** (vazio) ✅
- `gs://nprocess-documents-prod/` - **0 B** (vazio) ✅
- `gs://nprocess-prod_cloudbuild/` (gerado automaticamente)
- `gs://run-sources-nprocess-prod-us-central1/` (gerado automaticamente)

**Problemas Potenciais**:
1. **Sem Lifecycle Policies**: Arquivos antigos podem acumular e gerar custos
2. **Storage Class**: Pode estar usando Standard (mais caro) quando poderia usar Nearline/Coldline
3. **Versões**: Se versionamento estiver ativo, pode duplicar custos

**Recomendações**:
1. Configurar **Lifecycle Policies** para mover arquivos antigos para classes mais baratas
2. Mover arquivos não acessados há >30 dias para **Nearline**
3. Mover arquivos não acessados há >90 dias para **Coldline**
4. Deletar arquivos de build antigos automaticamente

**Economia Potencial**: 50-70% em custos de storage

---

### 5. Quotas Solicitadas - Muito Altas ⚠️ **OVERKILL**

#### Quotas Encontradas (baseado na documentação):
- Cloud Run CPU: **200 CPUs** ✅ Aprovado
- Cloud Run Memory: **200 GB** ✅ Aprovado
- Cloud Run Instances: **30 instâncias** ✅ Aprovado
- Vertex AI Requests: **1000/min** ✅ Aprovado
- Cloud SQL Connections: **200 conexões** ✅ Aprovado

**Problema**: Essas quotas são **muito altas** para um projeto em produção inicial.

**Análise**:
- **200 CPUs**: Com 3 serviços usando 1 CPU cada, máximo seria ~3-10 CPUs
- **200 GB Memory**: Com 3 serviços usando 1 GiB cada, máximo seria ~3-10 GB
- **30 Instances**: Provavelmente nunca vai usar 30 instâncias simultâneas
- **1000 req/min Vertex AI**: Muito alto para início, pode reduzir

**Impacto**: Quotas altas não geram custo direto, mas podem indicar planejamento excessivo.

**Recomendação**: Manter quotas altas para crescimento futuro, mas monitorar uso real.

---

### 6. Cloud SQL - Não Verificado ⚠️

**Status**: Não foi possível verificar instâncias Cloud SQL.

**Possíveis Problemas**:
1. **Tier muito alto**: db-n1-standard-2 pode ser excessivo
2. **Storage muito grande**: 100GB pode ser muito para início
3. **Backups**: Múltiplos backups podem gerar custos
4. **High Availability**: Se configurado, dobra o custo

**Recomendação**: Verificar configuração do Cloud SQL e otimizar se necessário.

---

## 💡 Recomendações de Otimização

### Prioridade Alta (Economia Imediata)

1. **Deletar `nprocess-frontend-prod`** se não estiver sendo usado
   - **Economia**: ~$10-30/mês
   - **Risco**: Baixo (frontend está no Firebase Hosting)

2. ~~**Configurar Min Instances = 0** nos serviços Cloud Run~~ ✅ **JÁ CONFIGURADO**
   - **Status**: Min instances já está em 0 (não configurado = 0)
   - **Economia**: Já está economizando!

3. **Deletar site Firebase Hosting duplicado** (`nprocess-8e801`)
   - **Economia**: Mínima (gratuito), mas reduz confusão
   - **Risco**: Baixo

### Prioridade Média (Economia a Médio Prazo)

4. **Configurar Lifecycle Policies no Cloud Storage**
   - **Economia**: 50-70% em storage
   - **Risco**: Baixo

5. **Reduzir Concorrência** nos serviços Cloud Run (80 → 10-20)
   - **Economia**: Melhor uso de recursos
   - **Risco**: Médio (pode precisar mais instâncias)

6. **Otimizar Memória** dos serviços Cloud Run
   - **Economia**: 20-30% em custos
   - **Risco**: Baixo (monitorar primeiro)

### Prioridade Baixa (Monitoramento)

7. **Revisar Quotas** (manter altas para crescimento)
8. **Verificar Cloud SQL** e otimizar se necessário
9. **Monitorar uso real** e ajustar recursos

---

## 📋 Checklist de Ações

- [x] ~~Verificar uso do `nprocess-frontend-prod` e deletar se não usado~~ ✅ **DELETADO em 06/01/2026**
- [ ] Configurar `min-instances=0` nos serviços Cloud Run
- [ ] Deletar site Firebase Hosting duplicado (`nprocess-8e801`)
- [ ] Configurar Lifecycle Policies no Cloud Storage
- [ ] Reduzir concorrência nos serviços Cloud Run (80 → 10-20)
- [ ] Verificar e otimizar Cloud SQL
- [ ] Monitorar uso real de recursos

---

## 💰 Estimativa de Economia

| Ação | Economia Mensal | Risco |
|------|----------------|-------|
| ~~Deletar `nprocess-frontend-prod`~~ ✅ **DELETADO** | ✅ $10-30/mês | - |
| ~~Min Instances = 0~~ | ✅ **Já configurado** | - |
| Deletar site Firebase duplicado | $0 (gratuito) | Baixo |
| Reduzir max instances frontend | $0-5 | Baixo |
| Lifecycle Policies (Storage) | $0-5 | Baixo (buckets vazios) |
| **TOTAL POTENCIAL** | **$10-40/mês** | **Baixo** |

---

## 🔍 Como Verificar Uso Real

```bash
# Verificar uso de Cloud Run
gcloud run services list --project=nprocess-prod --format="table(metadata.name,status.url)"

# Verificar métricas de uso
gcloud monitoring time-series list \
  --project=nprocess-prod \
  --filter='resource.type="cloud_run_revision"'

# Verificar uso de Cloud Storage
gsutil du -sh gs://nprocess-*

# Verificar custos no GCP Console
# https://console.cloud.google.com/billing
```

---

**Última Atualização**: 06 de Janeiro de 2026
