# Contributing to n.process

## Coding Standards

### Python (Backend)

- **Style**: PEP 8.
- **Type Hinting**: Required for all function signatures.
- **Logging**: Use `logging` module, never `print()`.
- **Error Handling**: Use `try/except` blocks and raise standard HTTPExceptions.
- **Security**: Validate all inputs (Pydantic). Sanitize outputs.

### TypeScript (Frontend)

- **Framework**: Next.js (App Router).
- **Style**: Prettier + ESLint strict config.
- **Components**: Shadcn UI.
- **State**: React Hooks / Context / Zustand.

## Pull Request Process

1.  Ensure local tests pass.
2.  Update documentation for any API changes.
3.  Sign commits (GPG) if possible.
4.  Add a description of security impacts.

## InfraOps

- **Docker**: Use multi-stage builds. Run as non-root user.
- **IaC**: Terraform/CloudBuild. Avoid hardcoded secrets.
