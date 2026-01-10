# GitHub Spec Kit - Ferramenta de Desenvolvimento

**Ferramenta**: GitHub Spec Kit (`specify-cli`)  
**Versão**: Instalada via `uv`  
**Localização**: `~/.local/bin/specify`  
**Documentação Oficial**: https://github.github.com/spec-kit/

---

## 📋 O Que é Spec Kit?

O **Spec Kit** é uma ferramenta de desenvolvimento que facilita o processo de desenvolvimento orientado por especificações, permitindo transformar ideias em código funcional com o auxílio de IA.

### Características

- ✅ **Desenvolvimento orientado por especificações**: Foque nos requisitos, não na implementação
- ✅ **Integração com IA**: Funciona com Claude, Copilot e outros agentes de IA
- ✅ **CLI poderosa**: Interface de linha de comando simples e intuitiva
- ✅ **Geração de tarefas**: Converte especificações em tarefas acionáveis

---

## 🚀 Instalação

A ferramenta já está instalada via `uv`:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

**Verificar instalação:**
```bash
specify --help
```

**Localização:** `~/.local/bin/specify` (já está no PATH)

---

## 📖 Uso Básico

### 1. Inicializar um Projeto

```bash
# Inicializar um novo projeto
specify init <NOME_DO_PROJETO> --ai <AGENTE_IA>

# Inicializar no diretório atual
specify init . --ai claude
specify init . --ai copilot
```

**Agentes suportados:**
- `claude` - Claude Desktop/Anthropic
- `copilot` - GitHub Copilot

### 2. Criar Especificações

Dentro do ambiente do agente de IA, use os comandos do Spec Kit:

#### `/speckit.specify`
Descreva o que deseja construir, focando nos requisitos e objetivos:

```
/speckit.specify Desenvolver um aplicativo que ajude a organizar fotos em álbuns separados por data, permitindo reorganização por arrastar e soltar na página principal.
```

#### `/speckit.plan`
Detalhe as escolhas técnicas e a arquitetura:

```
/speckit.plan O aplicativo utilizará Vite com o mínimo de bibliotecas, empregando HTML, CSS e JavaScript puros sempre que possível. As imagens não serão enviadas para nenhum servidor, e os metadados serão armazenados em um banco de dados SQLite local.
```

#### `/speckit.tasks`
Gere uma lista de tarefas acionáveis:

```
/speckit.tasks
```

#### `/speckit.implement`
Inicie a implementação das tarefas:

```
/speckit.implement
```

---

## 🔧 Comandos Disponíveis

```bash
# Ver ajuda geral
specify --help

# Inicializar projeto
specify init [OPTIONS] [PROJECT_NAME]

# Outros comandos (consultar documentação oficial)
specify [COMMAND] --help
```

---

## 📁 Estrutura do Projeto

Após inicializar, o Spec Kit cria uma estrutura de diretórios:

```
projeto/
├── .spec-kit/          # Configurações do Spec Kit
├── specs/              # Especificações do projeto
├── plans/              # Planos técnicos
└── tasks/              # Tarefas geradas
```

---

## 🎯 Fluxo de Trabalho Recomendado

1. **Especificar** → Use `/speckit.specify` para descrever o que quer construir
2. **Planejar** → Use `/speckit.plan` para definir a arquitetura técnica
3. **Tarefas** → Use `/speckit.tasks` para gerar lista de tarefas
4. **Implementar** → Use `/speckit.implement` para começar a implementação

---

## 📚 Documentação

- **Documentação Oficial**: https://github.github.com/spec-kit/
- **Guia de Instalação**: https://github.github.com/spec-kit/installation.html
- **Quick Start**: https://github.github.com/spec-kit/quickstart.html
- **Repositório**: https://github.com/github/spec-kit

---

## 🔄 Atualização

Para atualizar o Spec Kit:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git --force
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

O Spec Kit pode usar variáveis de ambiente para configuração:

```bash
# Exemplo (consultar documentação para opções específicas)
export SPEC_KIT_AI_AGENT=claude
```

---

## 🆘 Troubleshooting

### Comando não encontrado

Se `specify` não for encontrado:

```bash
# Verificar se está no PATH
echo $PATH | grep -q ~/.local/bin || export PATH="$HOME/.local/bin:$PATH"

# Ou usar caminho completo
~/.local/bin/specify --help
```

### Problemas com IA Agent

Certifique-se de que o agente de IA está configurado corretamente:

- **Claude Desktop**: Verifique configuração em `~/.config/claude-desktop/`
- **GitHub Copilot**: Verifique configuração no VS Code/Cursor

---

## 📝 Notas

- O Spec Kit é uma **ferramenta de desenvolvimento**, não faz parte da aplicação final
- Mantido em `tools/spec-kit/` como documentação de referência
- Pode ser usado em qualquer projeto de desenvolvimento

---

**Última Atualização**: 10 de Janeiro de 2026
