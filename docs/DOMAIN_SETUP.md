# Configuração de Domínio Customizado

**Domínio**: `nprocess.ness.com.br`  
**Serviço**: `compliance-engine-admin-dashboard`  
**Região**: `us-central1`

## 📋 Passos para Configuração

### 1. Criar Domain Mapping no GCP

```bash
gcloud run domain-mappings create \
    --service=compliance-engine-admin-dashboard \
    --domain=nprocess.ness.com.br \
    --project=nprocess \
    --region=us-central1
```

Ou via Console:
1. Acesse: https://console.cloud.google.com/run/domains?project=nprocess
2. Clique em "Create Domain Mapping"
3. Preencha:
   - **Domain**: `nprocess.ness.com.br`
   - **Service**: `compliance-engine-admin-dashboard`
   - **Region**: `us-central1`

### 2. Configurar DNS

Após criar o mapeamento, o GCP fornecerá instruções DNS. Configure no provedor do domínio:

**Opção 1: CNAME**
```
Tipo: CNAME
Nome: nprocess.ness.com.br
Valor: (fornecido pelo GCP após criar o mapeamento)
```

**Opção 2: A Records** (se fornecido pelo GCP)

### 3. Verificar Status

```bash
# Verificar mapeamento
gcloud run domain-mappings describe nprocess.ness.com.br \
    --project=nprocess \
    --region=us-central1

# Verificar DNS
dig nprocess.ness.com.br
nslookup nprocess.ness.com.br
```

### 4. Aguardar Propagação

- DNS pode levar até 48 horas para propagar
- SSL certificate será provisionado automaticamente após DNS estar correto
- Verificar status: `gcloud run domain-mappings describe nprocess.ness.com.br`

## ✅ Verificação

Após configuração, acesse:
- **URL**: https://nprocess.ness.com.br
- **Status**: Deve retornar HTTP 200 ou 403 (se autenticação requerida)

## 🔧 Troubleshooting

### Domínio não resolve
- Verifique DNS com `dig` ou `nslookup`
- Aguarde propagação (pode levar até 48h)
- Verifique se CNAME está correto

### SSL não provisionado
- Verifique se DNS está correto
- Aguarde até 24h após DNS correto
- Verifique status no console do GCP

### 403 Forbidden
- Verifique IAM permissions do serviço
- Verifique se `--no-allow-unauthenticated` está configurado
- Adicione permissões se necessário: `gcloud run services add-iam-policy-binding`

