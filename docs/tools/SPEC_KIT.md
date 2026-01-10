# GitHub Spec Kit - Guia de Uso

**Status**: ✅ Instalado e Configurado  
**Ferramenta**: `specify-cli`  
**Versão**: Instalada via `uv`

---

## 🎯 Visão Geral

O **GitHub Spec Kit** é uma ferramenta de desenvolvimento que facilita o processo de desenvolvimento orientado por especificações. Ele funciona como uma ponte entre suas ideias e a implementação, usando IA para transformar especificações em código funcional.

---

## 🚀 Quick Start

### 1. Verificar Instalação

```bash
specify --help
```

### 2. Inicializar em um Projeto

```bash
# No diretório do seu projeto
specify init . --ai claude
```

### 3. Usar no Agente de IA

No Claude Desktop, Cursor ou outro agente configurado:

```
/speckit.specify Descreva o que você quer construir
/speckit.plan Defina a arquitetura técnica
/speckit.tasks Gere tarefas acionáveis
/speckit.implement Comece a implementação
```

---

## 📋 Comandos do Spec Kit

### Dentro do Agente de IA

#### `/speckit.specify <descrição>`
Descreve o que você quer construir. Foque nos requisitos e objetivos, não na implementação.

**Exemplo:**
```
/speckit.specify Criar uma API REST para gerenciar tarefas com autenticação JWT, suporte a CRUD completo, filtros por status e data, e paginação.
```

#### `/speckit.plan <arquitetura>`
Define as escolhas técnicas e a arquitetura do projeto.

**Exemplo:**
```
/speckit.plan Usar FastAPI para a API, PostgreSQL como banco de dados, SQLAlchemy como ORM, JWT para autenticação, e Docker para containerização.
```

#### `/speckit.tasks`
Gera uma lista de tarefas acionáveis baseada nas especificações e plano.

#### `/speckit.implement`
Inicia a implementação das tarefas geradas.

---

## 🔧 Comandos CLI

### `specify init`

Inicializa o Spec Kit em um projeto.

```bash
# Novo projeto
specify init meu-projeto --ai claude

# Diretório atual
specify init . --ai claude
```

**Opções:**
- `--ai <AGENTE>`: Especifica o agente de IA (claude, copilot)

### `specify --help`

Mostra ajuda geral ou ajuda de um comando específico.

---

## 📁 Estrutura Criada

Após inicializar:

```
projeto/
├── .spec-kit/
│   └── config.yaml      # Configurações do Spec Kit
├── specs/
│   └── *.md            # Especificações do projeto
├── plans/
│   └── *.md            # Planos técnicos
└── tasks/
    └── *.md            # Tarefas geradas
```

---

## 💡 Exemplos de Uso

### Exemplo 1: API REST

```
/speckit.specify Criar uma API REST para gerenciar produtos de uma loja online. A API deve suportar CRUD completo, busca por categoria, filtros por preço e disponibilidade, e upload de imagens.

/speckit.plan Usar FastAPI com Python 3.11+, PostgreSQL com SQLAlchemy ORM, armazenamento de imagens no S3, autenticação JWT, e documentação automática com Swagger.

/speckit.tasks

/speckit.implement
```

### Exemplo 2: Aplicação Web

```
/speckit.specify Desenvolver uma aplicação web de gestão de projetos. Os usuários podem criar projetos, adicionar tarefas, atribuir membros da equipe, e visualizar progresso em dashboards.

/speckit.plan Frontend com Next.js 14 e React 19, backend com FastAPI, banco de dados PostgreSQL, autenticação com Firebase Auth, e deploy no Vercel (frontend) e Cloud Run (backend).

/speckit.tasks

/speckit.implement
```

---

## 🔄 Fluxo de Trabalho

```
┌─────────────────┐
│  Especificar    │ → Descrever o que quer construir
└─────────────────┘
         ↓
┌─────────────────┐
│    Planejar     │ → Definir arquitetura técnica
└─────────────────┘
         ↓
┌─────────────────┐
│   Gerar Tarefas │ → Lista de tarefas acionáveis
└─────────────────┘
         ↓
┌─────────────────┐
│  Implementar    │ → Começar desenvolvimento
└─────────────────┘
```

---

## ⚙️ Configuração

### Agentes Suportados

#### Claude Desktop

```bash
# Configurar no Claude Desktop
specify init . --ai claude
```

#### GitHub Copilot

```bash
# Configurar para Copilot
specify init . --ai copilot
```

---

## 🆘 Solução de Problemas

### Comando `specify` não encontrado

```bash
# Adicionar ao PATH
export PATH="$HOME/.local/bin:$PATH"

# Ou adicionar ao ~/.bashrc ou ~/.zshrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### Erro ao inicializar

Certifique-se de:
1. Estar em um diretório válido
2. Ter permissões de escrita
3. Ter o agente de IA configurado corretamente

### Comandos do Spec Kit não funcionam no agente

Verifique:
1. Se o projeto foi inicializado com `specify init`
2. Se o agente está configurado corretamente
3. Se está usando a sintaxe correta (`/speckit.specify`, etc.)

---

## 📚 Recursos Adicionais

- **Documentação Oficial**: https://github.github.com/spec-kit/
- **Repositório**: https://github.com/github/spec-kit
- **Quick Start**: https://github.github.com/spec-kit/quickstart.html
- **Instalação**: https://github.github.com/spec-kit/installation.html

---

## ✅ Checklist de Uso

- [ ] Spec Kit instalado (`specify --help` funciona)
- [ ] Projeto inicializado (`specify init . --ai claude`)
- [ ] Agente de IA configurado
- [ ] Comandos `/speckit.*` testados
- [ ] Estrutura `.spec-kit/` criada no projeto

---

**Última Atualização**: 10 de Janeiro de 2026
