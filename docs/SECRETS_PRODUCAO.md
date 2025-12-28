# 🔐 Secrets de Produção - nprocess-prod

**Data**: 27 de Dezembro de 2024  
**Projeto**: `nprocess-prod`

---

## 📋 Lista de Secrets

### 1. nprocess-db-password-prod
- **Tipo**: Senha do PostgreSQL (Cloud SQL)
- **Uso**: Conexão do Admin Control Plane ao banco de dados
- **Service Accounts com Acesso**:
  - `nprocess-api-prod@nprocess-prod.iam.gserviceaccount.com`
  - `nprocess-admin-prod@nprocess-prod.iam.gserviceaccount.com`
- **Como Acessar**:
  ```bash
  gcloud secrets versions access latest \
    --secret=nprocess-db-password-prod \
    --project=nprocess-prod
  ```

### 2. nprocess-gemini-api-key
- **Tipo**: API Key do Google Gemini (Vertex AI)
- **Uso**: Autenticação com Vertex AI para análises de compliance
- **Status**: ✅ **Chave real configurada**
- **Versão**: 2 (chave real)
- **Service Accounts com Acesso**:
  - `nprocess-api-prod@nprocess-prod.iam.gserviceaccount.com`
- **Como Acessar**:
  ```bash
  gcloud secrets versions access latest \
    --secret=nprocess-gemini-api-key \
    --project=nprocess-prod
  ```

### 3. nprocess-firebase-admin-sdk
- **Tipo**: Service Account JSON do Firebase Admin SDK
- **Uso**: Autenticação do Admin Control Plane com Firebase
- **Service Account**: `firebase-admin-prod@nprocess-prod.iam.gserviceaccount.com`
- **Service Accounts com Acesso**:
  - `nprocess-admin-prod@nprocess-prod.iam.gserviceaccount.com`
- **Alternativa**: Pode usar Application Default Credentials (ADC) do GCP
- **Como Acessar**:
  ```bash
  gcloud secrets versions access latest \
    --secret=nprocess-firebase-admin-sdk \
    --project=nprocess-prod
  ```

### 4. nprocess-google-oauth-client-id
- **Tipo**: Google OAuth 2.0 Client ID
- **Uso**: Autenticação OAuth do Google (Firebase Authentication)
- **Valor**: `905989981186-vpbehck2l1se9kn2jtco9om2ni1ogfq0.apps.googleusercontent.com`
- **Service Accounts com Acesso**:
  - `nprocess-admin-prod@nprocess-prod.iam.gserviceaccount.com`
- **Como Acessar**:
  ```bash
  gcloud secrets versions access latest \
    --secret=nprocess-google-oauth-client-id \
    --project=nprocess-prod
  ```

### 5. nprocess-google-oauth-client-secret
- **Tipo**: Google OAuth 2.0 Client Secret
- **Uso**: Autenticação OAuth do Google (Firebase Authentication)
- **Service Accounts com Acesso**:
  - `nprocess-admin-prod@nprocess-prod.iam.gserviceaccount.com`
- **Como Acessar**:
  ```bash
  gcloud secrets versions access latest \
    --secret=nprocess-google-oauth-client-secret \
    --project=nprocess-prod
  ```

---

## 🔄 Rotação de Secrets

### Política de Rotação
- **Senhas de Banco**: A cada 90 dias
- **API Keys**: Conforme necessário (se comprometidas)
- **OAuth Secrets**: A cada 180 dias ou se comprometidos

### Como Rotacionar

#### 1. Criar Nova Versão
```bash
# Exemplo: Rotacionar senha do banco
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo -n "$NEW_PASSWORD" | \
  gcloud secrets versions add nprocess-db-password-prod \
  --data-file=- \
  --project=nprocess-prod
```

#### 2. Atualizar no Cloud SQL
```bash
gcloud sql users set-password nprocess_admin \
  --instance=nprocess-db-prod \
  --password="$NEW_PASSWORD" \
  --project=nprocess-prod
```

#### 3. Atualizar Aplicação
- A aplicação automaticamente usa a versão `latest` do secret
- Se necessário, reiniciar serviços Cloud Run para carregar nova versão

---

## 🔒 Segurança

### Boas Práticas
1. ✅ **Nunca commitar** secrets no código
2. ✅ **Usar Secret Manager** para todos os secrets
3. ✅ **Princípio do Menor Privilégio**: Service Accounts com acesso mínimo necessário
4. ✅ **Auditar acesso**: Revisar logs de acesso regularmente
5. ✅ **Rotacionar regularmente**: Conforme política acima
6. ✅ **Versionamento**: Manter versões antigas por 30 dias antes de deletar

### Auditoria
```bash
# Ver logs de acesso aos secrets
gcloud logging read "resource.type=secretmanager.googleapis.com/Secret" \
  --project=nprocess-prod \
  --limit=50 \
  --format=json
```

### Listar Todas as Versões
```bash
# Exemplo: Listar versões de um secret
gcloud secrets versions list nprocess-db-password-prod \
  --project=nprocess-prod
```

---

## 📝 Variáveis de Ambiente

### Cloud Run - Admin Control Plane
```bash
# Usar secrets como variáveis de ambiente
gcloud run services update nprocess-admin-api-prod \
  --update-secrets=DATABASE_PASSWORD=nprocess-db-password-prod:latest \
  --update-secrets=GEMINI_API_KEY=nprocess-gemini-api-key:latest \
  --update-secrets=GOOGLE_OAUTH_CLIENT_ID=nprocess-google-oauth-client-id:latest \
  --update-secrets=GOOGLE_OAUTH_CLIENT_SECRET=nprocess-google-oauth-client-secret:latest \
  --project=nprocess-prod \
  --region=us-central1
```

### Cloud Run - n.process API
```bash
gcloud run services update nprocess-api-prod \
  --update-secrets=GEMINI_API_KEY=nprocess-gemini-api-key:latest \
  --project=nprocess-prod \
  --region=us-central1
```

---

## ⚠️ Ações Pendentes

1. **Atualizar GEMINI_API_KEY**
   - Status: Placeholder atual
   - Ação: Obter chave real e atualizar secret
   - Script: `./scripts/fase2-atualizar-gemini-key.sh [API_KEY]`

2. **Validar OAuth Credentials**
   - Status: Criados
   - Ação: Testar autenticação OAuth no Client Portal
   - Verificar: Firebase Console > Authentication > Sign-in method > Google

---

## 🔗 Links Úteis

- **Secret Manager Console**: https://console.cloud.google.com/security/secret-manager?project=nprocess-prod
- **Firebase Console**: https://console.firebase.google.com/project/nprocess-prod
- **Google Cloud Console**: https://console.cloud.google.com/project/nprocess-prod

---

**Última Atualização**: 27 de Dezembro de 2024

