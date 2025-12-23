# Configuração de Branch Protection

Este documento explica como configurar branch protection rules para a branch `main`.

## Por que Proteger a Branch Main?

- Previne pushes diretos na branch principal
- Exige Pull Requests para mudanças
- Garante que testes passem antes de merge
- Mantém histórico limpo e auditável

## Como Configurar (via GitHub Web UI)

### 1. Acesse as Configurações do Repositório

1. Vá para: `https://github.com/resper1965/nprocess/settings/branches`
2. Ou: Settings → Branches → Add rule

### 2. Configure a Regra para `main`

**Branch name pattern**: `main`

**Proteções Recomendadas**:

- ✅ **Require a pull request before merging**
  - Require approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners (se CODEOWNERS estiver configurado)

- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Status checks:
    - `test` (workflow de testes)
    - `deploy` (workflow de deploy, opcional)

- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits** (opcional, mas recomendado)

- ✅ **Require linear history** (opcional)

- ✅ **Include administrators** (aplicar regras também para admins)

- ❌ **Allow force pushes** (NÃO permitir)
- ❌ **Allow deletions** (NÃO permitir)

### 3. Salve a Configuração

Clique em "Create" ou "Save changes"

## Configuração via API (Avançado)

Se você tiver permissões de admin e quiser configurar via API:

```bash
# Exemplo usando GitHub CLI
gh api repos/resper1965/nprocess/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

## Verificação

Após configurar, teste:

1. Tente fazer push direto na `main`:
   ```bash
   git checkout main
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test"
   git push origin main
   ```
   
   Deve falhar com: "remote: error: GH006: Protected branch update failed"

2. Crie uma branch de feature e PR:
   ```bash
   git checkout -b feature/test-protection
   # faça mudanças
   git push origin feature/test-protection
   # Crie PR no GitHub
   ```

## Notas

- Branch protection só funciona para branches que já existem
- Admins podem ainda fazer bypass em emergências (se não marcado "Include administrators")
- Status checks precisam estar configurados nos workflows do GitHub Actions

