---
status: filled
generated: 2026-01-16
---

# Glossary & Domain Concepts

## Type Definitions
- **AuthUser** (interface) — [`AuthUser`](frontend/lib/auth.ts#L28)
- **CustomClaims** (interface) — [`CustomClaims`](frontend/lib/auth.ts#L19)

## Core Terms

- **Control Plane**: Console de administracao para integrações e gestao de tenants.
- **Process Engine**: Motor BPMN que gera diagramas 2.0 a partir de texto.
- **Compliance Guard**: Auditoria de processos contra normas com RAG.
- **Document Factory**: Gerador de documentos (PDFs, manuais).
- **Knowledge Store**: Base de conhecimento com busca vetorial.
- **Tenant**: Organizacao isolada na plataforma.
- **Custom Claims**: Permissoes embedadas no JWT (Firebase).
- **Waiting Room**: Tela de bloqueio para usuarios pendentes.

## Acronyms & Abbreviations

- **RAG**: Retrieval Augmented Generation
- **MCP**: Model Context Protocol
- **RBAC**: Role-Based Access Control
- **BPMN**: Business Process Model and Notation
- **GCP**: Google Cloud Platform

## Personas / Actors

- **Super Admin**: Staff ness. com acesso total.
- **Org Admin**: Admin do cliente com acesso ao tenant.
- **Developer**: Usuario operacional com acesso limitado.
- **Guest**: Usuario pendente de aprovacao.

## Domain Rules & Invariants

- Todas as queries devem aplicar tenant isolation via `org_id`.
- Usuarios `pending` nao acessam endpoints protegidos.
- API Keys sao geradas e mostradas uma unica vez.
