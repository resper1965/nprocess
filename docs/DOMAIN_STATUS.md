# Status do Domínio nprocess.ness.com.br

## 📋 Informações do Mapeamento

Para verificar o que está apontado para `nprocess.ness.com.br`, execute:

```bash
# Verificar domain mappings
gcloud beta run domain-mappings list --region=us-central1 --project=nprocess

# Ver detalhes específicos
gcloud beta run domain-mappings describe nprocess.ness.com.br \
  --region=us-central1 \
  --project=nprocess
```

## 🔍 Verificação Rápida

```bash
# Verificar DNS
dig nprocess.ness.com.br +short

# Testar acesso HTTP
curl -I http://nprocess.ness.com.br

# Testar acesso HTTPS
curl -I https://nprocess.ness.com.br
```

## 📝 O Que Deve Estar Configurado

Baseado na documentação existente:

- **Domínio**: `nprocess.ness.com.br`
- **Serviço Mapeado**: `compliance-engine-frontend`
- **Região**: `us-central1`
- **Registro DNS**: CNAME apontando para `ghs.googlehosted.com`

## 🔗 Serviços Disponíveis

Atualmente temos 3 serviços no Cloud Run:

1. **compliance-engine** (API)
   - URL: https://compliance-engine-5wqihg7s7a-uc.a.run.app

2. **compliance-engine-frontend** (Frontend Demo)
   - URL: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
   - **Este é o serviço mapeado para nprocess.ness.com.br**

3. **compliance-engine-admin-dashboard** (Admin Dashboard)
   - URL: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app


