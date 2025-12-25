# Como Configurar Credenciais - Admin Dashboard

Este guia explica como configurar credenciais de acesso ao Admin Dashboard.

## 🎯 Opções Disponíveis

### Opção 1: Modificar Credenciais Mock (Rápido - Desenvolvimento)

**Para desenvolvimento/testes rápidos**, você pode modificar as credenciais mock diretamente no código.

#### Passo 1: Editar arquivo de autenticação

Edite: `admin-dashboard/src/app/api/auth/[...nextauth]/route.ts`

```typescript
const mockUsers = [
  {
    id: "1",
    name: "Seu Nome",
    email: "seu-email@company.com",
    password: "$2a$12$...", // Hash bcrypt da senha
    role: "Super Admin"
  }
]
```

#### Passo 2: Gerar hash da senha

Para gerar o hash bcrypt da senha, você pode usar:

```bash
# No Node.js
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('sua-senha', 12).then(h => console.log(h))"
```

Ou criar um script temporário:

```javascript
// hash-password.js
const bcrypt = require('bcryptjs');
bcrypt.hash('sua-senha-aqui', 12).then(hash => {
  console.log('Hash:', hash);
});
```

Execute: `node hash-password.js`

#### Passo 3: Atualizar e fazer deploy

```bash
cd admin-dashboard
git add src/app/api/auth/[...nextauth]/route.ts
git commit -m "feat: atualiza credenciais mock"
git push origin main

# Deploy
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)
gcloud builds submit --config=cloudbuild.yaml \
  --project=nprocess \
  --substitutions=COMMIT_SHA=$COMMIT_SHA,SHORT_SHA=$SHORT_SHA
```

**⚠️ Limitação**: Credenciais mock são apenas para desenvolvimento. Não use em produção!

---

### Opção 2: Google OAuth (Recomendado - Produção)

**Para produção**, configure Google OAuth para autenticação segura.

#### Passo 1: Criar Credenciais OAuth no Google Cloud

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess
2. Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Configure:
   - **Application type**: Web application
   - **Name**: `nProcess Admin Dashboard`
   - **Authorized JavaScript origins**:
     ```
     https://nprocess.ness.com.br
     https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app
     ```
   - **Authorized redirect URIs**:
     ```
     https://nprocess.ness.com.br/api/auth/callback/google
     https://compliance-engine-admin-dashboard-5wqihg7s7a-uc.a.run.app/api/auth/callback/google
     ```
4. Clique em **CREATE**
5. **Copie o Client ID e Client Secret**

#### Passo 2: Criar Secrets no Secret Manager

```bash
# Substitua pelos valores reais
CLIENT_ID="seu-client-id.apps.googleusercontent.com"
CLIENT_SECRET="seu-client-secret"

# Criar secrets
echo -n "$CLIENT_ID" | gcloud secrets create google-client-id \
  --data-file=- \
  --project=nprocess \
  --replication-policy="automatic"

echo -n "$CLIENT_SECRET" | gcloud secrets create google-client-secret \
  --data-file=- \
  --project=nprocess \
  --replication-policy="automatic"
```

#### Passo 3: Configurar Permissões IAM

```bash
PROJECT_NUMBER=273624403528

# Adicionar permissões
gcloud secrets add-iam-policy-binding google-client-id \
  --project=nprocess \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding google-client-secret \
  --project=nprocess \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### Passo 4: Atualizar cloudbuild.yaml

Edite: `admin-dashboard/cloudbuild.yaml`

Adicione os secrets no deploy:

```yaml
- '--set-secrets=GOOGLE_CLIENT_ID=google-client-id:latest'
- '--set-secrets=GOOGLE_CLIENT_SECRET=google-client-secret:latest'
```

#### Passo 5: Configurar Domínios Permitidos

Edite: `admin-dashboard/src/app/api/auth/[...nextauth]/route.ts`

Atualize a lista de domínios permitidos:

```typescript
async signIn({ user, account, profile }) {
  if (account?.provider === "google") {
    const allowedDomains = ["company.com", "ness.com.br"] // Adicione seus domínios
    const email = user.email || ""
    const domain = email.split("@")[1]
    
    if (!allowedDomains.includes(domain)) {
      return false
    }
  }
  return true
}
```

#### Passo 6: Fazer Deploy

```bash
cd admin-dashboard
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)

gcloud builds submit --config=cloudbuild.yaml \
  --project=nprocess \
  --substitutions=COMMIT_SHA=$COMMIT_SHA,SHORT_SHA=$SHORT_SHA
```

**✅ Vantagens**: Seguro, escalável, integrado com Google Workspace

---

### Opção 3: Integração com Banco de Dados (Futuro)

Para uma solução completa, integre com PostgreSQL ou Firestore.

#### Estrutura de Tabela (PostgreSQL)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### Exemplo de Integração

```typescript
// admin-dashboard/src/lib/db.ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function getUserByEmail(email: string) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  return result.rows[0]
}
```

**📝 Nota**: Esta opção requer implementação adicional de:
- Conexão com banco de dados
- Migrations
- Gestão de usuários (CRUD)
- Recuperação de senha

---

## 🔐 Credenciais Atuais (Mock)

**Email**: `admin@company.com`  
**Senha**: `admin123`

**Email**: `john.doe@company.com`  
**Senha**: `admin123`

---

## 🚀 Recomendação

Para **produção**, use a **Opção 2 (Google OAuth)**:
- ✅ Mais seguro
- ✅ Integrado com Google Workspace
- ✅ SSO (Single Sign-On)
- ✅ Gestão centralizada de usuários
- ✅ 2FA automático (se configurado)

Para **desenvolvimento/testes**, use a **Opção 1 (Mock)**:
- ✅ Rápido de configurar
- ✅ Não requer configuração externa
- ⚠️ Não seguro para produção

---

## 📚 Referências

- [Google OAuth Setup Guide](GOOGLE_OAUTH_SETUP.md)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)

