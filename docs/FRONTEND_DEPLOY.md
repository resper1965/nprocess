# Deploy do Frontend - ComplianceEngine

**Data**: 2025-12-23  
**Status**: ✅ **DEPLOYED**

---

## 🌐 URL do Frontend

- **URL Principal**: https://compliance-engine-frontend-273624403528.us-central1.run.app
- **URL Alternativa**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app

**Status**: ✅ **FUNCIONANDO** (verificado em 2025-12-23 16:45 UTC)

---

## 📊 Informações do Deploy

### Serviço Cloud Run

- **Nome**: `compliance-engine-frontend`
- **Região**: `us-central1`
- **Plataforma**: Managed
- **Status**: ✅ Ready
- **Último Deploy**: 2025-12-23T16:37:41Z
- **Commit SHA**: `60c308046f15b81f5a9818673d988e445eefe984`

### Configuração de Recursos

- **Memória**: 1Gi
- **CPU**: 1
- **Timeout**: 300s
- **Max Instances**: 10
- **Min Instances**: 0 (scale to zero)
- **Porta**: 3000
- **Autenticação**: Pública (allow-unauthenticated)

### Variáveis de Ambiente

- `NEXT_PUBLIC_API_URL=https://compliance-engine-5wqihg7s7a-uc.a.run.app`
- `NODE_ENV=production`
- `PORT=3000`

---

## 🎨 Funcionalidades do Frontend

- ✅ **Dashboard**: Visão geral e status da API
- ✅ **Gerar Diagrama**: Converte texto em diagrama BPMN
- ✅ **Processos**: Lista e gerencia processos
- ✅ **Análise de Compliance**: Analisa processos contra regulamentações
- ✅ **Documentação**: Acesso a prompts e manual de integração

---

## 🔧 Tecnologias

- **Next.js 16**: Framework React
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Mermaid.js**: Renderização de diagramas
- **Axios**: Cliente HTTP

---

## 🔗 Links Úteis

- **Frontend**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
- **API Backend**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **API Docs**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs

---

## 📝 Comandos Úteis

### Ver Logs

```bash
gcloud run services logs read compliance-engine-frontend --region us-central1
```

### Atualizar Deploy

```bash
cd frontend
COMMIT_SHA=$(cd .. && git rev-parse HEAD)
SHORT_SHA=$(cd .. && git rev-parse --short HEAD)
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=COMMIT_SHA=$COMMIT_SHA,SHORT_SHA=$SHORT_SHA
```

---

**Última Atualização**: 2025-12-23 16:40 UTC

