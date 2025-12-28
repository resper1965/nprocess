# 🔧 Fase 2: Configuração de Ambiente - Checklist

**Data de Início**: 27 de Dezembro de 2024  
**Status**: 🟡 Em Progresso

---

## 📋 Checklist de Infraestrutura

### Cloud SQL
- [x] Cloud SQL instance criada (`nprocess-db-prod`) ✅
- [x] Database criado (`nprocess`) ✅
- [x] Usuário de banco criado (`nprocess_admin`) ✅
- [x] Senha do banco armazenada no Secret Manager ✅
- [x] Connection string gerada e documentada ✅
- [x] Backup automático configurado ✅
- [x] Manutenção agendada configurada ✅

### Firestore
- [x] Firestore database criado (native mode) ✅
- [x] Location definida (us-central1) ✅
- [x] Security Rules deployadas ✅
- [ ] Indexes criados (se necessário)
- [ ] Backup automático configurado

### Cloud Storage
- [x] Bucket criado para uploads de documentos ✅
- [x] Bucket criado para assets estáticos ✅
- [x] CORS configurado ✅
- [x] Lifecycle policies configuradas ✅
- [x] IAM policies aplicadas ✅

### Secret Manager
- [x] Secret para senha do banco criado ✅
- [x] Secret para GEMINI_API_KEY criado ✅ (chave real configurada)
- [x] Secret para Firebase Admin SDK criado ✅ (usando Service Account)
- [x] Secret para Google OAuth Client ID criado ✅
- [x] Secret para Google OAuth Client Secret criado ✅
- [ ] Secret para outras API keys criados (se necessário)
- [x] Permissões de acesso configuradas ✅

---

## 🔐 Checklist de Segurança

### Service Accounts
- [x] Service Account para API criado (`nprocess-api-prod`) ✅
- [x] Service Account para Admin criado (`nprocess-admin-prod`) ✅
- [x] IAM roles atribuídos (princípio do menor privilégio) ✅
- [x] Permissões documentadas ✅
- [ ] Keys geradas (se necessário para CI/CD)

### IAM e Permissões
- [ ] Cloud SQL: Service Account com acesso ao banco
- [ ] Firestore: Service Account com acesso de leitura/escrita
- [ ] Cloud Storage: Service Account com acesso aos buckets
- [ ] Secret Manager: Service Account com acesso aos secrets
- [ ] Cloud Run: Service Account configurado nos serviços

### Security Rules
- [ ] Firestore Rules revisadas e deployadas
- [ ] Cloud Storage Rules configuradas
- [ ] CORS configurado (apenas domínios permitidos)

---

## 📊 Checklist de Monitoramento

### Logging
- [ ] Cloud Logging configurado
- [ ] Logs estruturados validados
- [ ] Logs de erro configurados

### Monitoring
- [ ] Cloud Monitoring dashboards criados
- [ ] Alertas configurados
- [ ] Métricas principais definidas

---

## 🔄 Próximos Passos

1. ⏳ Criar Cloud SQL instance
2. ⏳ Criar Firestore database
3. ⏳ Criar Service Accounts
4. ⏳ Configurar Secret Manager
5. ⏳ Criar Cloud Storage buckets
6. ⏳ Configurar IAM e permissões
7. ⏳ Deploy Security Rules
8. ⏳ Validar todas as configurações

---

**Última Atualização**: 27 de Dezembro de 2024

