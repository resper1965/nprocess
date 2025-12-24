# Configuração de Acesso ao Admin Dashboard

## 🔐 Problema: "Forbidden - Your client does not have permission"

Este erro ocorre porque o Admin Dashboard está configurado com `--no-allow-unauthenticated` (acesso restrito).

## ✅ Solução: Adicionar Permissões IAM

### Opção 1: Permitir Acesso ao Seu Usuário

```bash
# Adicionar seu próprio usuário
gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
  --region=us-central1 \
  --member="user:seu-email@example.com" \
  --role="roles/run.invoker" \
  --project=nprocess
```

### Opção 2: Permitir Acesso a Múltiplos Usuários

```bash
# Adicionar usuário específico
gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
  --region=us-central1 \
  --member="user:admin@company.com" \
  --role="roles/run.invoker" \
  --project=nprocess

# Adicionar outro usuário
gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
  --region=us-central1 \
  --member="user:outro@company.com" \
  --role="roles/run.invoker" \
  --project=nprocess
```

### Opção 3: Permitir Acesso a um Grupo/Service Account

```bash
# Adicionar grupo do Google Workspace
gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
  --region=us-central1 \
  --member="group:admins@company.com" \
  --role="roles/run.invoker" \
  --project=nprocess

# Adicionar service account
gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
  --region=us-central1 \
  --member="serviceAccount:service-account@project.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --project=nprocess
```

### Opção 4: Permitir Acesso Público (NÃO RECOMENDADO para Admin Dashboard)

⚠️ **ATENÇÃO**: Isso permite acesso público ao Admin Dashboard. Use apenas para desenvolvimento/testes.

```bash
# Permitir acesso público
gcloud run services update compliance-engine-admin-dashboard \
  --region=us-central1 \
  --allow-unauthenticated \
  --project=nprocess
```

## 🔍 Verificar Permissões Atuais

```bash
# Listar todas as permissões
gcloud run services get-iam-policy compliance-engine-admin-dashboard \
  --region=us-central1 \
  --project=nprocess
```

## 📋 Membros Suportados

- `user:email@example.com` - Usuário específico
- `group:group@example.com` - Grupo do Google Workspace
- `serviceAccount:sa@project.iam.gserviceaccount.com` - Service Account
- `allUsers` - Todos (público) - ⚠️ Use com cuidado
- `allAuthenticatedUsers` - Todos os usuários autenticados do Google

## 🔐 Segurança Recomendada

Para um Admin Dashboard, recomenda-se:

1. **Usar acesso restrito** (`--no-allow-unauthenticated`)
2. **Adicionar apenas usuários específicos** que precisam de acesso
3. **Usar grupos** para facilitar gerenciamento
4. **Revisar permissões regularmente**

## 🛠️ Script de Configuração Rápida

```bash
#!/bin/bash
# Adicionar múltiplos usuários de uma vez

USERS=(
  "admin@company.com"
  "devops@company.com"
  "security@company.com"
)

for user in "${USERS[@]}"; do
  gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
    --region=us-central1 \
    --member="user:${user}" \
    --role="roles/run.invoker" \
    --project=nprocess
done
```

## ✅ Após Configurar Permissões

1. Aguarde alguns segundos para as permissões serem propagadas
2. Tente acessar novamente: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
3. Você será redirecionado para o login do Google (se OAuth estiver configurado)

## 🔗 Links Úteis

- [Cloud Run IAM](https://cloud.google.com/run/docs/securing/managing-access)
- [IAM Members](https://cloud.google.com/iam/docs/overview#concepts_related_identity)


