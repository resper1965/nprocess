---
status: filled
generated: 2026-01-16
---

# Testing Strategy

## Test Types

- **Unit**: Services isolados no backend (pytest).
- **Integration**: `backend/scripts/test_api.py` com servidor local.
- **Lint**: `npm run lint` no frontend.

## Running Tests

- Backend unit/integration:
  - `cd backend && .venv/bin/pytest`
- Frontend lint:
  - `cd frontend && npm run lint`

## Quality Gates

- Lint sem erros no frontend.
- Testes backend passando (minimo smoke tests).
- Nenhum endpoint protegido sem `get_current_user`.

## Troubleshooting

- Se pytest falhar por conexao: iniciar `uvicorn app.main:app --reload --port 8000`.
- Se lint falhar: corrigir `react/no-unescaped-entities` e `no-explicit-any`.
