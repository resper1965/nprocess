# 🚀 Setup do Repositório GitHub - n.process

**Data**: 10 de Janeiro de 2026  
**Status**: ⏳ Aguardando criação do repositório no GitHub

---

## 📋 Repositório Git Local

✅ **Repositório git inicializado** em `/home/resper/nProcess/`
- Branch: `main`
- Configuração: Pronta para conectar ao GitHub

---

## 🔧 Criar Repositório no GitHub

### Opção 1: Via Interface Web (Recomendado)

1. **Acesse**: https://github.com/new
2. **Configure o repositório:**
   - **Repository name**: `n.process`
   - **Description**: `ness. (n.process) - Middleware de Inteligência. Control Plane de infraestrutura que fornece capacidades de IA (BPMN, Compliance, Docs) para outros sistemas via API e MCP. Powered by ness.`
   - **Visibility**: Public ou Private (sua escolha)
   - **NÃO** inicialize com README, .gitignore ou license (já temos no projeto)
3. **Clique em "Create repository"**

### Opção 2: Via GitHub CLI (se tiver `gh` instalado)

```bash
gh repo create n.process \
  --public \
  --description "ness. (n.process) - Middleware de Inteligência. Control Plane de infraestrutura que fornece capacidades de IA (BPMN, Compliance, Docs) para outros sistemas via API e MCP. Powered by ness." \
  --source=. \
  --remote=origin \
  --push
```

### Opção 3: Via API (se tiver token com permissões)

```bash
curl -X POST \
  -H "Authorization: token SEU_TOKEN_GITHUB" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{
    "name": "n.process",
    "description": "ness. (n.process) - Middleware de Inteligência. Control Plane de infraestrutura que fornece capacidades de IA (BPMN, Compliance, Docs) para outros sistemas via API e MCP. Powered by ness.",
    "private": false,
    "auto_init": false
  }'
```

**Permissões necessárias no token:**
- `repo` (acesso completo aos repositórios)

---

## 🔗 Conectar Repositório Local ao GitHub

Após criar o repositório no GitHub, execute:

```bash
cd /home/resper/nProcess

# Adicionar remote
git remote add origin https://github.com/resper1965/n.process.git

# Ou se usar SSH:
# git remote add origin git@github.com:resper1965/n.process.git

# Verificar remote
git remote -v

# Fazer primeiro commit
git add -A
git commit -m "Initial commit: n.process - Middleware de Inteligência

- Adiciona 5 documentos essenciais do projeto
- Configura GitHub Spec Kit como ferramenta de desenvolvimento
- Estrutura inicial do Control Plane de infraestrutura"

# Push para GitHub
git push -u origin main
```

---

## 📝 Configuração do Git (se necessário)

Se o git user ainda não estiver configurado:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

---

## ✅ Verificação

Após conectar:

```bash
# Verificar remote
git remote -v

# Deve mostrar:
# origin  https://github.com/resper1965/n.process.git (fetch)
# origin  https://github.com/resper1965/n.process.git (push)

# Verificar status
git status

# Verificar branches remotas
git branch -r
```

---

## 🎯 URLs do Repositório

Após criar, o repositório estará disponível em:

- **GitHub**: https://github.com/resper1965/n.process
- **Clone HTTPS**: `https://github.com/resper1965/n.process.git`
- **Clone SSH**: `git@github.com:resper1965/n.process.git`

---

## 📚 Recursos

- **GitHub Docs**: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- **Git Remote**: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes

---

**Última Atualização**: 10 de Janeiro de 2026
