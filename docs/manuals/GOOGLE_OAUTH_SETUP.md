# Configuração do Google OAuth para Admin Dashboard

Este guia explica como configurar o Google OAuth para autenticação no Admin Dashboard.

## 📋 Pré-requisitos

- Acesso ao Google Cloud Console (projeto `nprocess`)
- Permissões para criar credenciais OAuth
- Acesso ao Secret Manager

## 🔧 Passo 1: Criar Credenciais OAuth no Google Cloud Console

### 1.1 Acessar o Console de APIs e Serviços

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess
2. Ou navegue: **APIs & Services** → **Credentials**

### 1.2 Configurar Tela de Consentimento OAuth

1. Clique em **OAuth consent screen** (lado esquerdo)
2. Escolha **Internal** (para uso dentro da organização) ou **External** (para uso público)
3. Preencha os campos:
   - **App name**: `nProcess Admin Dashboard`
   - **User support email**: Seu email
   - **Developer contact information**: Seu email
4. Clique em **Save and Continue**
5. Em **Scopes**, clique em **Add or Remove Scopes**
   - Adicione: `email`, `profile`, `openid`
6. Clique em **Save and Continue**
7. Em **Test users** (se External), adicione emails de teste
8. Clique em **Save and Continue** e depois **Back to Dashboard**

### 1.3 Criar Credenciais OAuth 2.0

1. Volte para **Credentials**
2. Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Selecione **Application type**: **Web application**
4. Preencha:
   - **Name**: `nProcess Admin Dashboard`
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
5. Clique em **CREATE**
6. **IMPORTANTE**: Copie o **Client ID** e **Client Secret** (você precisará deles!)

## 🔐 Passo 2: Armazenar Credenciais no Secret Manager

Execute os seguintes comandos no terminal:

```bash
# Definir variáveis (substitua pelos valores reais)
CLIENT_ID="seu-client-id-aqui.apps.googleusercontent.com"
CLIENT_SECRET="seu-client-secret-aqui"

# Criar secrets no Secret Manager
echo -n "$CLIENT_ID" | gcloud secrets create google-client-id \
  --data-file=- \
  --project=nprocess

echo -n "$CLIENT_SECRET" | gcloud secrets create google-client-secret \
  --data-file=- \
  --project=nprocess

# Verificar se os secrets foram criados
gcloud secrets list --project=nprocess | grep google
```

## 🔑 Passo 3: Atualizar Permissões IAM

Garanta que o service account do Cloud Run tem acesso aos secrets:

```bash
PROJECT_NUMBER=273624403528

# Adicionar permissão para google-client-id
gcloud secrets add-iam-policy-binding google-client-id \
  --project=nprocess \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Adicionar permissão para google-client-secret
gcloud secrets add-iam-policy-binding google-client-secret \
  --project=nprocess \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 📝 Passo 4: Atualizar cloudbuild.yaml

O `cloudbuild.yaml` já está configurado para usar os secrets. Verifique se está assim:

```yaml
- '--set-secrets=NEXTAUTH_SECRET=nextauth-secret:latest'
- '--set-secrets=GOOGLE_CLIENT_ID=google-client-id:latest'
- '--set-secrets=GOOGLE_CLIENT_SECRET=google-client-secret:latest'
```

## 🔄 Passo 5: Fazer Novo Deploy

Após configurar os secrets, faça um novo deploy:

```bash
cd admin-dashboard
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)

gcloud builds submit --config=cloudbuild.yaml \
  --project=nprocess \
  --substitutions=COMMIT_SHA=$COMMIT_SHA,SHORT_SHA=$SHORT_SHA
```

## ✅ Passo 6: Testar Autenticação

1. Acesse: `https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app`
2. Clique em **Sign in with Google**
3. Selecione sua conta Google
4. Autorize o acesso
5. Você deve ser redirecionado para o dashboard

## 🛠️ Troubleshooting

### Erro: "redirect_uri_mismatch"

- Verifique se a URI de redirecionamento no Google Console está exatamente igual à configurada no NextAuth
- Formato correto: `https://seu-dominio.com/api/auth/callback/google`

### Erro: "access_denied"

- Verifique se o email está na lista de test users (se OAuth consent screen for External)
- Para Internal, apenas usuários do domínio podem acessar

### Erro: "invalid_client"

- Verifique se o Client ID e Client Secret estão corretos no Secret Manager
- Verifique se os secrets foram criados corretamente

### Secrets não encontrados no Cloud Run

- Verifique as permissões IAM do service account
- Execute os comandos do Passo 3 novamente

## 📚 Referências

- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)


