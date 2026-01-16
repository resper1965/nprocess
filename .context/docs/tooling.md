---
status: filled
generated: 2026-01-16
---

# Tooling & Productivity Guide

## Required Tooling

- **Node.js 18+**: Frontend Next.js
- **Python 3.11+**: Backend FastAPI
- **npm**: Gerenciamento de dependencias frontend
- **pip/venv**: Ambiente virtual backend

## Recommended Automation

- **Frontend Lint**: `cd frontend && npm run lint`
- **Backend Tests**: `cd backend && .venv/bin/pytest`
- **Spec Kit**: `tools/spec-kit` para especificacoes

## IDE / Editor Setup

- **Cursor/VS Code** com extensoes:
  - ESLint
  - TailwindCSS IntelliSense
  - Python (Pylance)

## Productivity Tips

- Use `.context/docs` para manter o contexto de desenvolvimento atualizado.
- Padronize variaveis de ambiente com `.env` no backend e `.env.local` no frontend.
- Use `backend/scripts/` para tarefas administrativas (tenants, keys, ingest).
