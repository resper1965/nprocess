# Checklist de Produção - Process & Compliance Engine

**Data**: 27 de Dezembro de 2024  
**Use este checklist antes do deploy em produção**

---

## ✅ Pré-Deploy

### Infraestrutura

- [ ] Projeto GCP de produção criado (`nprocess-prod`)
- [ ] Billing habilitado e limites configurados
- [ ] Quotas aumentadas para produção
- [ ] Domínio customizado configurado
- [ ] SSL/TLS certificados válidos
- [ ] Cloud SQL instance de produção criada
- [ ] Firestore database de produção configurado
- [ ] Cloud Storage buckets criados
- [ ] Secret Manager secrets criados

### Segurança

- [ ] Service accounts criados com permissões mínimas
- [ ] IAM roles configurados corretamente
- [ ] Firestore Security Rules revisadas e testadas
- [ ] Cloud Storage Rules revisadas
- [ ] CORS configurado apenas para domínios permitidos
- [ ] Rate limiting implementado e testado
- [ ] WAF (Cloud Armor) configurado
- [ ] Security headers implementados
- [ ] Secrets rotacionados e no Secret Manager
- [ ] Autenticação obrigatória em todos os endpoints admin
- [ ] RBAC testado e funcionando

### Código

- [ ] Todas as funcionalidades implementadas
- [ ] Dados mock removidos
- [ ] APIs conectadas e funcionais
- [ ] Error handling completo
- [ ] Logging estruturado implementado
- [ ] Variáveis de ambiente documentadas
- [ ] Build scripts testados
- [ ] Dockerfiles otimizados
- [ ] Dependências atualizadas e sem vulnerabilidades conhecidas

### Dados

- [ ] Backup do banco de dados de dev
- [ ] Migrações de banco testadas
- [ ] Dados de seed preparados (se necessário)
- [ ] Firestore indexes criados
- [ ] Estrutura de dados validada
- [ ] Plano de migração de dados (se houver)

### Testes

- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Testes de carga executados
- [ ] Testes de segurança executados
- [ ] Testes de regressão executados
- [ ] Smoke tests definidos

### Documentação

- [ ] README atualizado
- [ ] Documentação de API completa
- [ ] Runbooks de operação criados
- [ ] Procedimentos de rollback documentados
- [ ] Contatos de emergência definidos
- [ ] Planejamento de produção documentado

---

## 🚀 Deploy

### Antes do Deploy

- [ ] Backup completo do ambiente atual
- [ ] Notificar equipe sobre o deploy
- [ ] Verificar que não há deploys em andamento
- [ ] Validar que todos os testes passaram
- [ ] Revisar mudanças no código
- [ ] Confirmar variáveis de ambiente

### Durante o Deploy

- [ ] Deploy n.process API
- [ ] Deploy Admin Control Plane
- [ ] Deploy Client Portal
- [ ] Deploy Firestore rules e indexes
- [ ] Validar health checks após cada deploy

### Após o Deploy

- [ ] Health checks passando
- [ ] Smoke tests passando
- [ ] Login funcionando
- [ ] APIs respondendo corretamente
- [ ] Logs sem erros críticos
- [ ] Métricas aparecendo no Monitoring
- [ ] Alertas configurados e funcionando

---

## 🔍 Validação Pós-Deploy

### Funcionalidades Core

- [ ] Login email/password funciona
- [ ] Login Google funciona
- [ ] Dashboard carrega dados reais
- [ ] API Keys: criar funciona
- [ ] API Keys: listar funciona
- [ ] API Keys: revogar funciona
- [ ] Admin Overview mostra métricas
- [ ] Chat com Gemini funciona
- [ ] Análise de compliance funciona
- [ ] Geração de diagramas funciona

### Performance

- [ ] Tempo de carregamento < 2s
- [ ] API response time < 500ms (P95)
- [ ] Sem erros no console do navegador
- [ ] Sem memory leaks
- [ ] Assets carregando corretamente

### Segurança

- [ ] Autenticação obrigatória funcionando
- [ ] Roles funcionando (admin vs user)
- [ ] CORS configurado corretamente
- [ ] Security headers presentes
- [ ] Rate limiting ativo
- [ ] WAF bloqueando requisições suspeitas

### Monitoramento

- [ ] Logs aparecendo no Cloud Logging
- [ ] Métricas aparecendo no Cloud Monitoring
- [ ] Alertas configurados
- [ ] Uptime checks funcionando
- [ ] Dashboards criados

---

## 📊 Monitoramento Contínuo

### Diário

- [ ] Verificar alertas críticos
- [ ] Revisar logs de erro
- [ ] Verificar custos do dia
- [ ] Validar uptime dos serviços

### Semanal

- [ ] Revisar métricas de performance
- [ ] Analisar custos por serviço
- [ ] Revisar logs de segurança
- [ ] Validar backups automáticos

### Mensal

- [ ] Atualizar dependências
- [ ] Revisar e otimizar custos
- [ ] Análise de capacidade
- [ ] Revisão de segurança completa
- [ ] Rotação de secrets

---

## 🆘 Procedimentos de Emergência

### Rollback

- [ ] Procedimento de rollback documentado
- [ ] Testado em ambiente de staging
- [ ] Tempo estimado de rollback conhecido
- [ ] Contatos de emergência definidos

### Incident Response

- [ ] Plano de resposta a incidentes
- [ ] Escalação definida
- [ ] Comunicação com usuários planejada

---

**Status**: ⬜ Não Iniciado | 🟡 Em Progresso | ✅ Completo | ❌ Bloqueado

