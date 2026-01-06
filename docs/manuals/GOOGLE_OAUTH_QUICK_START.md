# 🚀 Guia Rápido: Configurar Google OAuth

## Passo 1: Criar Credenciais no Google Console

1. **Acesse**: https://console.cloud.google.com/apis/credentials?project=nprocess

2. **Configure OAuth Consent Screen** (se ainda não fez):
   - Clique em **OAuth consent screen**
   - Escolha **Internal** ou **External**
   - Preencha: App name = `nProcess Admin Dashboard`
   - Adicione scopes: `email`, `profile`, `openid`
   - Salve

3. **Crie OAuth Client ID**:
   - Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Tipo: **Web application**
   - Name: `nProcess Admin Dashboard`
   - **Authorized JavaScript origins**:
     ```
     https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
   - Clique em **CREATE**
   - **Copie o Client ID e Client Secret** (você precisará deles!)

## Passo 2: Configurar Secrets (Método Automatizado)

Use o script fornecido:

```bash
cd /home/resper/nProcess/nprocess
./scripts/setup-google-oauth.sh <CLIENT_ID> <CLIENT_SECRET>
```

**Exemplo:**
```bash
./scripts/setup-google-oauth.sh \
  123456789-abc.apps.googleusercontent.com \
  GOCSPX-abc123xyz456
```

## Passo 2 (Alternativo): Configurar Manualmente

Se preferir fazer manualmente:

```bash
# Definir variáveis
CLIENT_ID="seu-client-id.apps.googleusercontent.com"
CLIENT_SECRET="seu-client-secret"

# Criar secrets
echo -n "$CLIENT_ID" | gcloud secrets create google-client-id \
  --data-file=- --project=nprocess

echo -n "$CLIENT_SECRET" | gcloud secrets create google-client-secret \
  --data-file=- --project=nprocess

# Configurar permissões
PROJECT_NUMBER=273624403528
gcloud secrets add-iam-policy-binding google-client-id \
  --project=nprocess \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding google-client-secret \
  --project=nprocess \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Passo 3: Fazer Novo Deploy

O `cloudbuild.yaml` já está configurado para usar os secrets. Faça um novo deploy:

```bash
cd admin-dashboard
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)

gcloud builds submit --config=cloudbuild.yaml \
  --project=nprocess \
  --substitutions=COMMIT_SHA=$COMMIT_SHA,SHORT_SHA=$SHORT_SHA
```

## Passo 4: Testar

1. Acesse: https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
2. Clique em **Sign in with Google**
3. Selecione sua conta
4. Autorize o acesso

## ✅ Checklist

- [ ] OAuth Consent Screen configurado
- [ ] OAuth Client ID criado
- [ ] URIs de redirecionamento adicionadas
- [ ] Secrets criados no Secret Manager
- [ ] Permissões IAM configuradas
- [ ] Novo deploy realizado
- [ ] Login testado com sucesso

## 🆘 Problemas Comuns

### "redirect_uri_mismatch"
- Verifique se a URI no Google Console está **exatamente** igual à configurada
- Formato: `https://seu-dominio.com/api/auth/callback/google`

### "access_denied"
- Se OAuth screen for **External**, adicione seu email em **Test users**
- Se for **Internal**, apenas usuários do domínio podem acessar

### Secrets não encontrados
- Verifique se os secrets foram criados: `gcloud secrets list --project=nprocess | grep google`
- Verifique permissões IAM do service account

## 📚 Documentação Completa

Para mais detalhes, veja: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)


