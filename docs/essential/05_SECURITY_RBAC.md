# Segurança, RBAC & Onboarding

## 1. Estratégia de Identidade (Firebase + Custom Claims)
Utilizaremos **Firebase Custom Claims** para embutir as permissões diretamente no Token JWT. Isso evita consultas ao banco de dados em cada request.

### O Token JWT (Payload)
Além dos dados padrão, o token deve conter:
```json
{
  "uid": "123...",
  "role": "super_admin" | "org_admin" | "developer",
  "org_id": "tenant_uuid_v4" | "system",
  "status": "active" | "pending"
}
```

## 2. Hierarquia de Papéis (Roles)

### `super_admin` (Ness Staff):
- Acesso total (God Mode).
- Pode ver todos os Tenants.
- Pode gerenciar o "Marketplace de Leis".
- Pode aprovar novos Tenants.

### `org_admin` (Cliente - Gestor):
- Acesso apenas aos dados do seu `org_id`.
- Pode criar API Keys.
- Pode convidar outros devs para sua Org.
- Pode gerenciar o Contexto Privado (Uploads).

### `developer` (Cliente - Operacional):
- Acesso apenas leitura/execução.
- Pode usar o Playground e copiar Keys.
- Não pode deletar Keys ou alterar Faturamento.

### `guest` (Default no Cadastro):
- Estado inicial pós-cadastro.
- Não tem acesso a nada. Vê apenas a tela "Aguardando Aprovação".

## 3. Fluxo de Onboarding ("The Waiting Room")

1. **Sign Up**: Usuário cria conta (Google/Email).
2. **Trigger automático**: Cria documento em `users` com `role: guest`, `status: pending`.
3. **Aprovação (Via Super Admin):**
   - O Super Admin vê o usuário na lista "Pending Users".
   - Ação: "Assign to Tenant". O Admin seleciona a Organização (ou cria uma nova) e o Role.
4. **Ativação:**
   - O Backend usa `firebase-admin` para injetar `org_id` e `role` nas claims do usuário.
   - Na próxima sessão, o usuário entra no Dashboard correto.

## 4. Segurança na API

- Todo endpoint deve usar o Dependency `get_current_user`.
- **Tenant Isolation**: O `org_id` extraído do Token deve ser obrigatoriamente injetado em todas as queries do Firestore (`where("tenant_id", "==", user.org_id)`).
