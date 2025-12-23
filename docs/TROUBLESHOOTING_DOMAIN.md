# Troubleshooting - Domínio nprocess.ness.com.br

**Data**: 2025-12-23

---

## 🔍 Diagnóstico Atual

### ✅ O Que Está Funcionando

- ✅ **DNS está resolvendo**: O domínio resolve para IPs do Google
- ✅ **HTTP funciona**: Retorna 302 (redireciona para HTTPS)
- ✅ **Domain mapping criado**: Configurado no Cloud Run
- ✅ **Frontend funcionando**: URL original funciona perfeitamente

### ⚠️ Problema Identificado

- ⚠️ **SSL/Certificado ainda não provisionado**: O Google está aguardando verificação DNS e provisionamento do certificado SSL

---

## 📋 Status do Domain Mapping

```
Status: Unknown
Reason: CertificatePending
Message: Waiting for certificate provisioning. You must configure your DNS records for certificate issuance to begin.
```

**OU**

```
Status: Unknown
Reason: CertificatePending
Message: Certificate issuance pending.
```

---

## ⏱️ Tempo de Provisionamento

O Google Cloud Run precisa:

1. **Verificar DNS** (5-30 minutos após configurar)
2. **Provisionar certificado SSL** (até 1 hora após DNS verificado)

**Tempo total estimado**: 30 minutos - 1 hora

---

## ✅ Como Verificar Progresso

### 1. Verificar Status do Domain Mapping

```bash
gcloud alpha run domain-mappings list --region us-central1
```

**Status esperado**:
- `Unknown` → Aguardando (normal)
- `True` ou `Active` → Pronto! ✅

### 2. Verificar DNS

```bash
# Linux/Mac
dig nprocess.ness.com.br +short
# Deve retornar: ghs.googlehosted.com ou IPs do Google

# Windows
nslookup nprocess.ness.com.br
```

### 3. Testar Acesso

```bash
# HTTP (deve redirecionar)
curl -I http://nprocess.ness.com.br

# HTTPS (pode falhar até certificado estar pronto)
curl -I https://nprocess.ness.com.br
```

---

## 🔧 Soluções

### Solução 1: Aguardar (Recomendado)

O Google provisiona o certificado automaticamente. Aguarde:

- **Mínimo**: 30 minutos
- **Médio**: 1 hora
- **Máximo**: 2 horas

### Solução 2: Verificar Configuração DNS

Certifique-se de que o CNAME está correto:

```
Tipo: CNAME
Nome: nprocess
Valor: ghs.googlehosted.com
```

**Verificar**:
- O registro está salvo no provedor DNS?
- O TTL já expirou? (pode levar alguns minutos)
- Não há outros registros conflitantes?

### Solução 3: Forçar Verificação (se necessário)

```bash
# Deletar e recriar domain mapping (último recurso)
gcloud alpha run domain-mappings delete nprocess.ness.com.br --region us-central1
gcloud alpha run domain-mappings create --service compliance-engine-frontend --domain nprocess.ness.com.br --region us-central1
```

---

## 🚨 Problemas Comuns

### Erro: SSL_ERROR_SYSCALL

**Causa**: Certificado SSL ainda não foi provisionado

**Solução**: Aguardar (até 1 hora)

### Erro: 404 Not Found

**Causa**: Domain mapping não está ativo ou DNS incorreto

**Solução**: 
1. Verificar DNS: `dig nprocess.ness.com.br`
2. Verificar domain mapping: `gcloud alpha run domain-mappings list --region us-central1`

### Erro: 403 Forbidden

**Causa**: Permissões IAM

**Solução**:
```bash
gcloud run services add-iam-policy-binding compliance-engine-frontend \
  --region us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

### DNS não resolve

**Causa**: CNAME não configurado ou ainda propagando

**Solução**:
1. Verificar se o CNAME está salvo no provedor DNS
2. Aguardar propagação (até 48 horas, geralmente mais rápido)

---

## 📞 Verificar Logs

```bash
# Logs do Frontend
gcloud run services logs read compliance-engine-frontend --region us-central1 --limit 20

# Verificar domain mapping
gcloud alpha run domain-mappings list --region us-central1 --format="yaml"
```

---

## ✅ Checklist

- [ ] DNS CNAME configurado (`nprocess` → `ghs.googlehosted.com`)
- [ ] DNS propagado (verificar com `dig` ou `nslookup`)
- [ ] Domain mapping criado no Cloud Run
- [ ] Aguardando provisionamento SSL (até 1 hora)
- [ ] Status do domain mapping mudou para `Active`

---

## 🎯 Próximos Passos

1. **Aguardar 30-60 minutos** para provisionamento SSL
2. **Verificar status periodicamente**:
   ```bash
   gcloud alpha run domain-mappings list --region us-central1
   ```
3. **Testar acesso** quando status mudar para `Active`:
   ```bash
   curl -I https://nprocess.ness.com.br
   ```

---

**Última Atualização**: 2025-12-23

