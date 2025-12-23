# Status da Aplicação - ComplianceEngine

**Data**: 2025-12-23  
**Última Verificação**: 2025-12-23

---

## ✅ Status Geral

**Status**: ✅ **TUDO FUNCIONANDO**

---

## 🌐 URLs de Acesso

### Frontend (Interface Web)

- **URL Principal**: https://compliance-engine-frontend-273624403528.us-central1.run.app
- **Domínio Customizado**: https://nprocess.ness.com.br
- **Status**: ✅ Funcionando

### API Backend

- **URL**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **API Docs**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **Health Check**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/health
- **Status**: ✅ Funcionando

---

## 📊 Status dos Serviços Cloud Run

### Frontend

- **Serviço**: `compliance-engine-frontend`
- **Região**: `us-central1`
- **Status**: ✅ Ready
- **Recursos**: 1Gi RAM, 1 CPU
- **Porta**: 3000

### API

- **Serviço**: `compliance-engine`
- **Região**: `us-central1`
- **Status**: ✅ Ready
- **Recursos**: 2Gi RAM, 2 CPU
- **Porta**: 8080

---

## 🔗 Domain Mapping

- **Domínio**: `nprocess.ness.com.br`
- **Serviço**: `compliance-engine-frontend`
- **Status**: Verificando...

Para verificar status:
```bash
gcloud alpha run domain-mappings list --region us-central1
```

---

## ✅ Funcionalidades Disponíveis

### Frontend
- ✅ Dashboard
- ✅ Gerar Diagramas BPMN
- ✅ Gerenciar Processos
- ✅ Análise de Compliance
- ✅ Documentação

### API
- ✅ Geração de diagramas
- ✅ Gestão de processos
- ✅ Análise de compliance
- ✅ Webhooks
- ✅ Versionamento
- ✅ Templates
- ✅ Tags
- ✅ Aprovações
- ✅ Busca avançada
- ✅ Dashboard
- ✅ Backup/Restore
- ✅ IA para melhorias
- ✅ Score em tempo real
- ✅ Marketplace

---

## 🔐 Segurança

- ✅ API Keys com hash bcrypt
- ✅ Validação de permissões
- ✅ Rate limiting
- ✅ MCP Gateway seguro
- ✅ Webhooks com HMAC SHA256

---

## 📈 Métricas

Para ver logs e métricas:

```bash
# Logs do Frontend
gcloud run services logs read compliance-engine-frontend --region us-central1

# Logs da API
gcloud run services logs read compliance-engine --region us-central1

# Métricas no Console
# https://console.cloud.google.com/run/detail/us-central1/compliance-engine-frontend/metrics?project=nprocess
```

---

## 🚨 Troubleshooting

### Verificar Status dos Serviços

```bash
gcloud run services list --region us-central1
```

### Verificar Health Check

```bash
# API
curl https://compliance-engine-5wqihg7s7a-uc.a.run.app/health

# Frontend
curl -I https://compliance-engine-frontend-273624403528.us-central1.run.app/
```

### Verificar Domain Mapping

```bash
gcloud alpha run domain-mappings list --region us-central1
```

---

**Última Atualização**: 2025-12-23

