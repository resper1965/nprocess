# 🆘 Contatos de Emergência - Process & Compliance Engine

**Data**: 27 de Dezembro de 2024  
**Projeto**: nprocess-prod

---

## 👥 Equipe de Produção

### DevOps Lead
- **Nome**: [DEFINIR]
- **Email**: [DEFINIR]
- **Telefone**: [DEFINIR]
- **Slack**: [DEFINIR]
- **Responsabilidades**: Infraestrutura, deploys, monitoramento

### Security Lead
- **Nome**: [DEFINIR]
- **Email**: [DEFINIR]
- **Telefone**: [DEFINIR]
- **Slack**: [DEFINIR]
- **Responsabilidades**: Segurança, incidentes de segurança, compliance

### Product Owner
- **Nome**: [DEFINIR]
- **Email**: [DEFINIR]
- **Telefone**: [DEFINIR]
- **Slack**: [DEFINIR]
- **Responsabilidades**: Decisões de produto, priorização

### On-Call Engineer (Rotativo)
- **Semana 1**: [DEFINIR]
- **Semana 2**: [DEFINIR]
- **Semana 3**: [DEFINIR]
- **Semana 4**: [DEFINIR]

### Desenvolvedor Sênior
- **Nome**: [DEFINIR]
- **Email**: [DEFINIR]
- **Telefone**: [DEFINIR]
- **Slack**: [DEFINIR]
- **Responsabilidades**: Suporte técnico, debugging

---

## 📞 Escalação de Incidentes

### Nível 1: Incidente Menor
- **Contato**: On-Call Engineer
- **Tempo de Resposta**: 1 hora
- **Exemplos**: Erros não críticos, performance degradada < 20%

### Nível 2: Incidente Moderado
- **Contato**: DevOps Lead + On-Call Engineer
- **Tempo de Resposta**: 30 minutos
- **Exemplos**: Funcionalidade quebrada, performance degradada 20-50%

### Nível 3: Incidente Crítico
- **Contato**: DevOps Lead + Security Lead + Product Owner
- **Tempo de Resposta**: 15 minutos
- **Exemplos**: Serviço down, vazamento de dados, segurança comprometida

### Nível 4: Emergência
- **Contato**: Toda a equipe + Gerência
- **Tempo de Resposta**: Imediato
- **Exemplos**: Ataque DDoS, vazamento massivo de dados, indisponibilidade total

---

## 🔔 Canais de Comunicação

### Slack
- **Canal Principal**: `#nprocess-prod`
- **Canal de Incidentes**: `#nprocess-incidents`
- **Canal de Deploy**: `#nprocess-deploys`

### Email
- **Lista de Produção**: `nprocess-prod@ness.com.br`
- **Lista de Incidentes**: `nprocess-incidents@ness.com.br`

### PagerDuty / Opsgenie
- **Service**: Process & Compliance Engine Production
- **Escalation Policy**: [DEFINIR]

---

## 📋 Procedimento de Notificação

### Em Caso de Incidente

1. **Identificar Severidade**
   - Usar critérios acima

2. **Notificar Equipe Apropriada**
   - Criar ticket/incident
   - Notificar via Slack
   - Enviar email se crítico

3. **Documentar**
   - Criar issue no sistema de tracking
   - Documentar em `docs/INCIDENTES.md`

4. **Comunicar Usuários** (se necessário)
   - Status page
   - Email para clientes afetados

---

## 🔗 Links Úteis

- **GCP Console**: https://console.cloud.google.com/project/nprocess-prod
- **Firebase Console**: https://console.firebase.google.com/project/nprocess-prod
- **Cloud Monitoring**: https://console.cloud.google.com/monitoring?project=nprocess-prod
- **Cloud Logging**: https://console.cloud.google.com/logs?project=nprocess-prod
- **Status Page**: [DEFINIR URL]

---

## 📝 Template de Notificação de Incidente

```
🚨 INCIDENTE EM PRODUÇÃO

Severidade: [NÍVEL]
Data/Hora: [DATA/HORA]
Serviços Afetados: [LISTA]
Causa: [DESCRIÇÃO BREVE]
Impacto: [DESCRIÇÃO]
Ação: [O QUE ESTÁ SENDO FEITO]
Status: [EM INVESTIGAÇÃO/EM RESOLUÇÃO/RESOLVIDO]
ETA: [TEMPO ESTIMADO]

Equipe: [NOMES]
Ticket: [NÚMERO]
```

---

**⚠️ IMPORTANTE**: Preencher todos os campos [DEFINIR] antes do deploy em produção.

**Última Atualização**: 27 de Dezembro de 2024

