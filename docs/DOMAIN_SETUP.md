# Configuração de Domínio Customizado - nprocess.ness.com.br

**Data**: 2025-12-23  
**Status**: ⚠️ **AGUARDANDO CONFIGURAÇÃO DNS**

---

## 🌐 Domínio

- **Domínio**: `nprocess.ness.com.br`
- **Serviço**: `compliance-engine-frontend`
- **Região**: `us-central1`

---

## 📋 Configuração DNS

### Passo 1: Obter Informações do Mapeamento

Após criar o domain mapping no Cloud Run, execute:

```bash
gcloud run domain-mappings describe nprocess.ness.com.br --region us-central1
```

Isso retornará informações sobre os registros DNS necessários.

### Passo 2: Configurar no DNS

**✅ Domain mapping criado com sucesso!**

Agora você precisa configurar o seguinte registro DNS no provedor onde `ness.com.br` está hospedado:

#### 📝 Registro DNS Necessário

```
Tipo: CNAME
Nome: nprocess
Valor: ghs.googlehosted.com.
TTL: 3600 (ou padrão do provedor)
```

**⚠️ IMPORTANTE**: 
- O valor deve terminar com ponto (`.`) se o provedor exigir
- Use `ghs.googlehosted.com` (sem ponto) se o provedor não aceitar ponto final
- O Google configurará automaticamente o SSL após o DNS estar correto

### Passo 3: Verificar Configuração

Após configurar o DNS, verifique o status:

```bash
# Verificar status do domain mapping
gcloud run domain-mappings describe nprocess.ness.com.br --region us-central1

# Verificar DNS
dig nprocess.ness.com.br
nslookup nprocess.ness.com.br
```

### Passo 4: Aguardar Propagação

- **Tempo estimado**: 5-30 minutos
- O Google Cloud Run verificará automaticamente quando o DNS estiver configurado
- O status mudará de `ACTIVE` quando estiver pronto

---

## 🔧 Comandos Úteis

### Criar Domain Mapping

```bash
gcloud run domain-mappings create \
  --service compliance-engine-frontend \
  --domain nprocess.ness.com.br \
  --region us-central1
```

### Listar Domain Mappings

```bash
gcloud run domain-mappings list --region us-central1
```

### Descrever Domain Mapping

```bash
gcloud run domain-mappings describe nprocess.ness.com.br --region us-central1
```

### Deletar Domain Mapping

```bash
gcloud run domain-mappings delete nprocess.ness.com.br --region us-central1
```

---

## 📝 Exemplo de Configuração por Provedor

### Cloudflare

1. Acesse o dashboard do Cloudflare
2. Selecione o domínio `ness.com.br`
3. Vá em **DNS** > **Records**
4. Adicione:
   - **Type**: `CNAME`
   - **Name**: `nprocess`
   - **Target**: `ghs.googlehosted.com`
   - **Proxy status**: Desabilitado (DNS only)
   - **TTL**: Auto

### Google Domains / Cloud DNS

1. Acesse o Cloud Console > **Network Services** > **Cloud DNS**
2. Selecione a zona DNS de `ness.com.br`
3. Clique em **Add record set**
4. Configure:
   - **DNS name**: `nprocess.ness.com.br.`
   - **Resource record type**: `CNAME`
   - **TTL**: `3600`
   - **CNAME data**: `ghs.googlehosted.com.`

### Registro.br / Outros Provedores

1. Acesse o painel de controle do provedor
2. Vá em **DNS** ou **Zona DNS**
3. Adicione registro:
   - **Tipo**: `CNAME`
   - **Nome/Host**: `nprocess`
   - **Valor/Destino**: `ghs.googlehosted.com`
   - **TTL**: `3600`

---

## ✅ Verificação

Após configurar o DNS, verifique:

1. **DNS está propagado**:
   ```bash
   dig nprocess.ness.com.br +short
   # Deve retornar: ghs.googlehosted.com ou IPs do Google
   ```

2. **Domain mapping está ativo**:
   ```bash
   gcloud run domain-mappings describe nprocess.ness.com.br --region us-central1
   # Status deve ser: ACTIVE
   ```

3. **Acesso ao site**:
   ```bash
   curl -I https://nprocess.ness.com.br
   # Deve retornar: HTTP/2 200
   ```

---

## 🔒 SSL/TLS

O Google Cloud Run **configura automaticamente** SSL/TLS para domínios customizados:

- ✅ Certificado SSL automático (Let's Encrypt)
- ✅ Renovação automática
- ✅ HTTPS obrigatório
- ⏱️ Pode levar até 1 hora após o DNS estar configurado

---

## 🚨 Troubleshooting

### DNS não está propagando

- Aguarde até 48 horas (geralmente é mais rápido)
- Verifique se o registro está correto
- Use `dig` ou `nslookup` para verificar

### Domain mapping não fica ACTIVE

- Verifique se o DNS está correto
- Certifique-se de que o CNAME aponta para `ghs.googlehosted.com`
- Aguarde a verificação automática do Google

### Erro 404 ou 403

- Verifique se o serviço está rodando
- Verifique permissões IAM do serviço
- Certifique-se de que o domain mapping está ativo

### SSL não está funcionando

- Aguarde até 1 hora após o DNS estar configurado
- Verifique se o DNS está correto
- O Google configura SSL automaticamente

---

## 📚 Referências

- [Google Cloud Run - Custom Domains](https://cloud.google.com/run/docs/mapping-custom-domains)
- [Cloud DNS Documentation](https://cloud.google.com/dns/docs)

---

**Última Atualização**: 2025-12-23

