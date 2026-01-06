# Configuração de WAF - Cloud Armor

**Status**: ⚠️ Requer permissões especiais do GCP

## 📋 Pré-requisitos

1. **Permissões necessárias**:
   - `roles/compute.securityAdmin`
   - `roles/compute.admin`
   - Acesso ao Cloud Armor API

2. **APIs habilitadas**:
   - `compute.googleapis.com`
   - `cloudarmor.googleapis.com` (requer permissões especiais)

## 🚀 Configuração Manual

### 1. Habilitar APIs

```bash
gcloud services enable compute.googleapis.com --project=nprocess
gcloud services enable cloudarmor.googleapis.com --project=nprocess
```

**Nota**: `cloudarmor.googleapis.com` pode requerer permissões de administrador do projeto.

### 2. Criar Security Policy

```bash
gcloud compute security-policies create compliance-engine-waf \
    --project=nprocess \
    --description="WAF policy for ComplianceEngine API" \
    --default-action=deny-403
```

### 3. Adicionar Regras

#### Rate Limiting
```bash
gcloud compute security-policies rules create 1000 \
    --project=nprocess \
    --security-policy=compliance-engine-waf \
    --expression="true" \
    --action=rate-based-ban \
    --rate-limit-threshold-count=100 \
    --rate-limit-threshold-interval-sec=60 \
    --ban-duration-sec=300 \
    --conform-action=allow \
    --exceed-action=deny-429 \
    --enforce-on-key=IP
```

#### Allow Health Checks
```bash
gcloud compute security-policies rules create 2000 \
    --project=nprocess \
    --security-policy=compliance-engine-waf \
    --expression="request.path.matches('/health') || request.path.matches('/docs')" \
    --action=allow
```

#### Allow API Requests with API Key
```bash
gcloud compute security-policies rules create 3000 \
    --project=nprocess \
    --security-policy=compliance-engine-waf \
    --expression="request.headers['x-api-key'].exists() || request.headers['authorization'].exists()" \
    --action=allow
```

### 4. Anexar ao Backend Service

Cloud Armor precisa ser anexado ao backend service do Cloud Run. Isso requer:
1. Criar um Load Balancer
2. Configurar backend service
3. Anexar security policy

**Nota**: Cloud Run não suporta Cloud Armor diretamente. É necessário usar Load Balancer na frente.

## 🔄 Alternativa: Rate Limiting no Application Layer

Como Cloud Armor requer Load Balancer, o ComplianceEngine já implementa rate limiting no application layer:

- **Middleware**: `app/middleware/rate_limit.py`
- **Redis**: Usado para tracking de rate limits
- **Configuração**: Via variáveis de ambiente

## ✅ Status Atual

- ✅ Rate limiting implementado (application layer)
- ✅ API Key authentication
- ⚠️ Cloud Armor WAF (requer Load Balancer e permissões especiais)

## 📝 Recomendações

Para produção, considere:
1. **Load Balancer** com Cloud Armor (mais robusto)
2. **Cloud CDN** para cache
3. **Cloud Armor** para proteção DDoS e WAF
4. **Cloud Monitoring** para alertas

