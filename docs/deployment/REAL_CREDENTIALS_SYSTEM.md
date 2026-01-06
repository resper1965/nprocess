# Sistema de Credenciais Real

Este documento descreve o sistema de credenciais real implementado com PostgreSQL.

## 🏗️ Arquitetura

O sistema de credenciais real utiliza:

- **PostgreSQL**: Banco de dados para armazenar usuários
- **Admin Control Plane API**: API FastAPI que gerencia usuários e autenticação
- **Admin Dashboard**: Interface Next.js que consome a API para autenticação

## 📊 Estrutura do Banco de Dados

### Tabela `users`

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(tenant_id),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🔐 Autenticação

### Fluxo de Autenticação

1. **Admin Dashboard** → NextAuth.js recebe credenciais
2. **NextAuth** → Chama `/v1/auth/verify` no Admin Control Plane
3. **Admin Control Plane** → Valida credenciais no PostgreSQL
4. **Resposta** → Retorna dados do usuário autenticado

### Endpoints da API

#### `POST /v1/auth/verify`

Verifica credenciais do usuário (usado pelo NextAuth).

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "email": "admin@company.com",
  "name": "Admin User",
  "role": "super_admin",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "last_login_at": "2024-01-01T00:00:00Z"
}
```

#### `POST /v1/auth/login`

Login completo (retorna token JWT no futuro).

#### `GET /v1/auth/me`

Obter usuário atual (requer autenticação JWT).

## 👥 Gestão de Usuários

### Criar Usuário

```bash
POST /v1/admin/users
{
  "email": "newuser@company.com",
  "name": "New User",
  "password": "securepassword123",
  "role": "admin"
}
```

### Listar Usuários

```bash
GET /v1/admin/users?limit=100&offset=0
```

### Atualizar Usuário

```bash
PATCH /v1/admin/users/{user_id}
{
  "name": "Updated Name",
  "role": "viewer",
  "status": "inactive"
}
```

### Deletar Usuário

```bash
DELETE /v1/admin/users/{user_id}
```

## 🌱 Seed de Usuários Iniciais

### Executar Seed

```bash
cd admin-control-plane
python scripts/seed_users.py
```

### Usuários Padrão

O script cria os seguintes usuários:

1. **Admin User**
   - Email: `admin@company.com`
   - Senha: `admin123`
   - Role: `super_admin`

2. **John Doe**
   - Email: `john.doe@company.com`
   - Senha: `admin123`
   - Role: `admin`

**⚠️ IMPORTANTE**: Altere as senhas padrão em produção!

## 🔒 Segurança

### Hash de Senhas

- **Algoritmo**: bcrypt
- **Rounds**: 12
- **Salt**: Gerado automaticamente

### Validação

- Senhas devem ter no mínimo 8 caracteres
- Emails devem ser válidos e únicos
- Roles válidas: `super_admin`, `admin`, `finops_manager`, `auditor`, `user`, `viewer`

## 🚀 Configuração

### Variáveis de Ambiente

#### Admin Control Plane

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

#### Admin Dashboard

```bash
NEXT_PUBLIC_ADMIN_API_URL=https://admin-control-plane-5wqihg7s7a-uc.a.run.app
NEXTAUTH_SECRET=your-secret-key
```

### Deploy

1. **Deploy Admin Control Plane**:
   ```bash
   cd admin-control-plane
   gcloud builds submit --config=cloudbuild.yaml --project=nprocess
   ```

2. **Deploy Admin Dashboard**:
   ```bash
   cd admin-dashboard
   gcloud builds submit --config=cloudbuild.yaml --project=nprocess
   ```

3. **Executar Seed**:
   ```bash
   # Conectar ao Cloud Run e executar seed
   # Ou executar localmente apontando para o banco de produção
   python admin-control-plane/scripts/seed_users.py
   ```

## 📝 Migração de Mock para Real

O sistema foi migrado de credenciais mock para banco de dados real:

### Antes (Mock)

- Usuários hardcoded em `route.ts`
- Sem persistência
- Apenas para desenvolvimento

### Depois (Real)

- Usuários no PostgreSQL
- Persistência completa
- Pronto para produção

## 🔧 Troubleshooting

### Erro: "Database connection failed"

- Verifique `DATABASE_URL` está configurada
- Verifique se o PostgreSQL está acessível
- Verifique permissões de rede/firewall

### Erro: "Invalid credentials"

- Verifique se o usuário existe no banco
- Verifique se a senha está correta
- Verifique se o usuário está ativo (`is_active = true`)

### Erro: "User already exists"

- O email já está cadastrado
- Use outro email ou atualize o usuário existente

## 📚 Referências

- [Admin Control Plane API Docs](../admin-control-plane/README.md)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [bcrypt Documentation](https://pypi.org/project/bcrypt/)

