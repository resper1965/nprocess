# nProcess - Ferramentas de Desenvolvimento

Repositório de ferramentas de desenvolvimento para o projeto n.process.

---

## 🛠️ Ferramentas Disponíveis

### GitHub Spec Kit

**Status**: ✅ Instalado e Configurado

O **GitHub Spec Kit** (`specify-cli`) é uma ferramenta de desenvolvimento orientado por especificações que facilita o processo de transformar ideias em código funcional com o auxílio de IA.

**Instalação:**
```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

**Uso:**
```bash
# Verificar instalação
specify --help

# Inicializar em um projeto
specify init . --ai claude
```

**Documentação:**
- [Guia Completo](tools/spec-kit/README.md)
- [Documentação de Uso](docs/tools/SPEC_KIT.md)
- [Documentação Oficial](https://github.github.com/spec-kit/)

---

## 📁 Estrutura

```
nProcess/
├── tools/              # Ferramentas de desenvolvimento
│   └── spec-kit/       # GitHub Spec Kit
│       └── README.md   # Documentação da ferramenta
├── docs/               # Documentação
│   └── tools/          # Documentação das ferramentas
│       └── SPEC_KIT.md # Guia de uso do Spec Kit
├── .gitignore          # Git ignore
└── README.md           # Este arquivo
```

---

## 🚀 Quick Start

### Usar Spec Kit em um Projeto

1. **Navegue até o diretório do seu projeto**
   ```bash
   cd /caminho/do/seu/projeto
   ```

2. **Inicialize o Spec Kit**
   ```bash
   specify init . --ai claude
   ```

3. **Use no agente de IA** (Claude Desktop, Cursor, etc.)
   ```
   /speckit.specify Descreva o que você quer construir
   /speckit.plan Defina a arquitetura técnica
   /speckit.tasks Gere tarefas acionáveis
   /speckit.implement Comece a implementação
   ```

---

## 📚 Documentação

### Documentos Essenciais

Os 6 documentos fundamentais do projeto estão em `docs/essential/`:

1. **[00_PROJECT_MANIFESTO.md](docs/essential/00_PROJECT_MANIFESTO.md)** - Visão do produto, branding e os 4 motores
2. **[01_ARCHITECTURE_STACK.md](docs/essential/01_ARCHITECTURE_STACK.md)** - Stack técnico GCP Native e FinOps
3. **[02_BACKEND_SPEC.md](docs/essential/02_BACKEND_SPEC.md)** - Especificação do backend com RAG avançado
4. **[03_FRONTEND_UX.md](docs/essential/03_FRONTEND_UX.md)** - Especificação do Console (Control Plane)
5. **[04_DATA_MODEL.md](docs/essential/04_DATA_MODEL.md)** - Modelo de dados Firestore
6. **[05_SECURITY_RBAC.md](docs/essential/05_SECURITY_RBAC.md)** - Segurança, RBAC & Onboarding (Multi-tenant)

### Ferramentas

- **Spec Kit**: [docs/tools/SPEC_KIT.md](docs/tools/SPEC_KIT.md)
- **Ferramentas**: [tools/](tools/)

### Boot Prompt

Para iniciar o desenvolvimento com Spec Kit, use o prompt em:
**[docs/essential/BOOT_PROMPT.md](docs/essential/BOOT_PROMPT.md)**

### Framework RPI

Documentação sobre o framework **Research, Plan, Implement**:
**[docs/RPI_FRAMEWORK.md](docs/RPI_FRAMEWORK.md)**

---

## 📝 Notas

- Este repositório contém **ferramentas de desenvolvimento** e **documentação essencial** do projeto
- As ferramentas são instaladas globalmente via `uv` e podem ser usadas em qualquer projeto
- Documentação local serve como referência rápida e fonte de verdade para o projeto

---

**Última Atualização**: 10 de Janeiro de 2026
