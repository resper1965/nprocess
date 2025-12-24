# Admin Dashboard - Status do Deploy

## ✅ Deploy Concluído

O Admin Dashboard foi **deployado com sucesso** no Google Cloud Run!

## 🔗 URL do Serviço

Para obter a URL do serviço, execute:

```bash
gcloud run services describe compliance-engine-admin-dashboard \
  --region=us-central1 \
  --project=nprocess \
  --format='value(status.url)'
```

## 🔐 Autenticação

O Admin Dashboard está configurado com `--no-allow-unauthenticated`, então apenas usuários autenticados podem acessar.

### Configurar Acesso

Para permitir acesso a usuários específicos:

```bash
# Adicionar usuário específico
gcloud run services add-iam-policy-binding compliance-engine-admin-dashboard \
  --region=us-central1 \
  --member=user:seu-email@example.com \
  --role=roles/run.invoker \
  --project=nprocess
```

### Credenciais de Login

O Admin Dashboard usa NextAuth.js com credenciais mock:

- **Email**: `admin@company.com`
- **Senha**: `admin123`

**⚠️ IMPORTANTE**: Em produção, configure autenticação adequada (Google OAuth ou outro provedor).

## 📋 Configurações Aplicadas

- ✅ Secret Manager API habilitada
- ✅ Secret `nextauth-secret` criado e configurado
- ✅ Permissões IAM configuradas
- ✅ Build do Next.js bem-sucedido
- ✅ Deploy no Cloud Run concluído
- ✅ Autenticação requerida (`--no-allow-unauthenticated`)

## 🔧 Variáveis de Ambiente

O serviço está configurado com:
- `NEXT_PUBLIC_API_URL`: `https://compliance-engine-5wqihg7s7a-uc.a.run.app`
- `NEXTAUTH_SECRET`: Secret do Secret Manager
- `PORT`: `8080`

## 📝 Próximos Passos

1. Obter a URL do serviço
2. Configurar IAM para permitir acesso aos administradores
3. Configurar Google OAuth (opcional, para produção)
4. Testar login e funcionalidades

## 🔗 Links Relacionados

- **API Principal**: https://compliance-engine-5wqihg7s7a-uc.a.run.app
- **Frontend Demo**: https://compliance-engine-frontend-5wqihg7s7a-uc.a.run.app
- **Admin Dashboard**: URL a ser obtida via `gcloud run services describe`

