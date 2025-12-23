# Instruções DNS - nprocess.ness.com.br

**Data**: 2025-12-23  
**Status**: ✅ Domain mapping criado - ⚠️ Aguardando configuração DNS

---

## 🎯 O Que Você Precisa Fazer

Configure o seguinte registro DNS no provedor onde `ness.com.br` está hospedado:

---

## 📋 Registro DNS

### Registro CNAME

```
Tipo: CNAME
Nome/Host: nprocess
Valor/Destino: ghs.googlehosted.com
TTL: 3600 (ou padrão)
```

**Nota**: Alguns provedores podem exigir o ponto final (`.`) no valor: `ghs.googlehosted.com.`

---

## 🔧 Instruções por Provedor

### Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio `ness.com.br`
3. Vá em **DNS** > **Records**
4. Clique em **Add record**
5. Configure:
   - **Type**: `CNAME`
   - **Name**: `nprocess`
   - **Target**: `ghs.googlehosted.com`
   - **Proxy status**: ⚠️ **Desabilitado** (DNS only - importante!)
   - **TTL**: Auto
6. Clique em **Save**

### Google Domains / Cloud DNS

1. Acesse: https://console.cloud.google.com/net-services/dns/zones
2. Selecione a zona DNS de `ness.com.br`
3. Clique em **Add record set** ou **Create record set**
4. Configure:
   - **DNS name**: `nprocess.ness.com.br.` (com ponto final)
   - **Resource record type**: `CNAME`
   - **TTL**: `3600`
   - **CNAME data**: `ghs.googlehosted.com.` (com ponto final)
5. Clique em **Create**

### Registro.br

1. Acesse: https://registro.br
2. Faça login e vá em **Meus Domínios**
3. Clique em `ness.com.br` > **DNS**
4. Clique em **Adicionar**
5. Configure:
   - **Tipo**: `CNAME`
   - **Nome**: `nprocess`
   - **Valor**: `ghs.googlehosted.com`
   - **TTL**: `3600`
6. Clique em **Salvar**

### GoDaddy

1. Acesse: https://www.godaddy.com
2. Vá em **My Products** > **DNS**
3. Selecione `ness.com.br`
4. Role até **Records** e clique em **Add**
5. Configure:
   - **Type**: `CNAME`
   - **Name**: `nprocess`
   - **Value**: `ghs.googlehosted.com`
   - **TTL**: `600` (ou padrão)
6. Clique em **Save**

### Namecheap

1. Acesse: https://www.namecheap.com
2. Vá em **Domain List** > **Manage** em `ness.com.br`
3. Vá em **Advanced DNS**
4. Clique em **Add New Record**
5. Configure:
   - **Type**: `CNAME Record`
   - **Host**: `nprocess`
   - **Value**: `ghs.googlehosted.com`
   - **TTL**: Automatic
6. Clique em **Save All Changes**

### Outros Provedores

Configure um registro CNAME com:
- **Nome**: `nprocess`
- **Valor**: `ghs.googlehosted.com`
- **TTL**: `3600` (ou padrão)

---

## ⏱️ Tempo de Propagação

- **Mínimo**: 5-15 minutos
- **Médio**: 30 minutos - 2 horas
- **Máximo**: 24-48 horas (raro)

---

## ✅ Como Verificar

### 1. Verificar DNS

```bash
# Linux/Mac
dig nprocess.ness.com.br +short
# Deve retornar: ghs.googlehosted.com ou IPs do Google

# Windows
nslookup nprocess.ness.com.br
# Deve retornar: ghs.googlehosted.com
```

### 2. Verificar Status no Google Cloud

```bash
gcloud alpha run domain-mappings list --region us-central1
```

O status mudará para `ACTIVE` quando o DNS estiver correto.

### 3. Testar Acesso

Após a propagação DNS e ativação do SSL (pode levar até 1 hora):

```bash
curl -I https://nprocess.ness.com.br
# Deve retornar: HTTP/2 200
```

---

## 🔒 SSL/TLS

O Google Cloud Run configura **automaticamente** SSL/TLS:

- ✅ Certificado SSL automático (Let's Encrypt)
- ✅ Renovação automática
- ✅ HTTPS obrigatório
- ⏱️ Pode levar até 1 hora após o DNS estar configurado

**Não é necessário configurar SSL manualmente!**

---

## 🚨 Problemas Comuns

### DNS não está propagando

- Aguarde até 48 horas (geralmente é mais rápido)
- Verifique se o registro está correto
- Certifique-se de que o CNAME aponta para `ghs.googlehosted.com`
- Use `dig` ou `nslookup` para verificar

### Domain mapping não fica ACTIVE

- Verifique se o DNS está correto
- Certifique-se de que o CNAME está configurado
- Aguarde a verificação automática do Google (pode levar alguns minutos)

### Erro 404 ou 403

- Verifique se o serviço está rodando
- Verifique permissões IAM do serviço
- Certifique-se de que o domain mapping está ativo

### SSL não está funcionando

- Aguarde até 1 hora após o DNS estar configurado
- Verifique se o DNS está correto
- O Google configura SSL automaticamente

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs: `gcloud alpha run domain-mappings list --region us-central1`
2. Verifique o DNS: `dig nprocess.ness.com.br`
3. Consulte a documentação: https://cloud.google.com/run/docs/mapping-custom-domains

---

**Última Atualização**: 2025-12-23

