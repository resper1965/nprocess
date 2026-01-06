# Guia de Contribuição - n.process

Obrigado pelo interesse em contribuir para o n.process. Este é um repositório privado e proprietário.

## Processo de Desenvolvimento

1.  **Issues**: Toda mudança deve começar com uma Issue no GitHub Projects.
2.  **Branches**:
    - `main`: Produção (Protegida).
    - `staging`: Pre-prod.
    - `feat/nome-da-feature`: Desenvolvimento.
    - `fix/nome-do-bug`: Correções.

## Padrões de Código

- **Frontend**: Next.js, TypeScript, TailwindCSS (Siga as regras do ESLint configurado).
- **Backend**: Python (FastAPI), PEP8 (Siga as regras do `ruff`/`black`).
- **Commits**: Conventional Commits (ex: `feat: add login`, `fix: cors error`).

## Pull Requests

1.  Abra o PR apontando para `main` (ou `staging` se aplicável).
2.  O PR deve passar em todos os checks do CI/CD (Lint, Test, Security).
3.  Requer aprovação de pelo menos 1 Code Owner.

## Segurança

- NUNCA comite segredos (chaves, senhas) no repositório.
- Utilize o Secret Manager do GCP para variáveis sensíveis.
