# Status de Deploy - ComplianceEngine

**Última atualização**: 2025-12-23

## ✅ Status Geral

- **API Backend**: ✅ Deployado e funcionando
- **Frontend**: ✅ Deployado e funcionando
- **Custom Domain**: ⏳ Aguardando SSL

---

## 🔗 URLs

### API Backend
- **URL**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **Health Check**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/health
- **Swagger UI**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/docs
- **ReDoc**: https://compliance-engine-5wqihg7s7a-uc.a.run.app/redoc

### Frontend
- **URL**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
- **Custom Domain**: https://nprocess.ness.com.br (aguardando SSL)

---

## 📦 Último Deploy

**Commit**: `e2fc94d`  
**Data**: 2025-12-23  
**Funcionalidades**:
- ✅ Gestão de API Keys para usuários (self-service)
- ✅ Endpoints `/v1/my/api-keys` no backend
- ✅ Página `/api-keys` no frontend
- ✅ Visualização de consumo e estatísticas
- ✅ Preparação para exibição de custos

---

## 🆕 Novas Funcionalidades

### Gestão de API Keys (Self-Service)

**Backend**:
- `POST /v1/my/api-keys` - Criar nova API key
- `GET /v1/my/api-keys` - Listar minhas API keys
- `GET /v1/my/api-keys/{key_id}` - Detalhes de uma API key
- `POST /v1/my/api-keys/{key_id}/revoke` - Revogar API key
- `GET /v1/my/api-keys/{key_id}/usage` - Estatísticas de uso

**Frontend**:
- Página `/api-keys` para gerenciar chaves
- Criar, listar, revogar API keys
- Visualizar consumo (hoje, mês, total)
- Ver validade e status
- Placeholder para custos (futuro)

---

## 🔍 Verificação

Para verificar se os serviços estão funcionando:

```bash
# Health check da API
curl https://compliance-engine-5wqihg7s7a-uc.a.run.app/health

# Listar API keys (requer autenticação)
curl -H "Authorization: Bearer <api-key>" \
  https://compliance-engine-5wqihg7s7a-uc.a.run.app/v1/my/api-keys
```

---

## 📝 Próximos Passos

1. ⏳ Configurar SSL para custom domain
2. 🔐 Implementar autenticação de usuários (JWT)
3. 💰 Integrar sistema de pagamento/custos
4. 📊 Dashboard de analytics completo
