# Relatório de Auditoria Completa do Repositório

**Data:** 26/12/2025
**Escopo:** Frontend (`client-portal`), Backend (`app`), Documentação e Dependências.

## 1. Segurança e Dependências (Critical)

### 🔴 Frontend (`client-portal`)

Foram encontradas **4 vulnerabilidades** (3 High, 1 Critical) no pacote `next`.

- **Issues:** SSRF in Middleware, Cache Poisoning, Denial of Service.
- **Causa:** Versão atual `14.2.15` está vulnerável.
- **Correção Necessária:** Atualizar para `next@14.2.35` ou superior.
  - Comando sugerido: `cd client-portal && npm audit fix --force` (Atenção: Breaking changes possíveis).

### 🟡 Backend (`requirements.txt`)

- `firebase-admin==6.4.0` é uma versão extremamente antiga (mais de 2 anos).
  - **Risco:** Falta de suporte a novas APIs do Firebase e possíveis vulnerabilidades não patchadas.
  - **Recomendação:** Atualizar para `firebase-admin>=6.5.0` ou a v6 mais recente (ou migrar para v7 se viável).
- `langchain` recém adicionado (v0.3.0) é bleeding edge. Monitorar compatibilidade.

## 2. Erros de Codificação e Boas Práticas

### 🟡 Uso de `print()` vs Logging

Detectado uso de `print()` em vez de `logger` em vários arquivos de produção. Isso impede que os logs sejam capturados corretamente pelo Cloud Logging (Severity levels).

- **Arquivos Afetados:** (Lista será preenchida após varredura) `app/main.py`, `app/services/firebase_service.py` (checked manual).
- **Ação:** Substituir todos os `print()` por `logger.info()` ou `logger.error()`.

### 🟡 Tratamento de Erros

- O `ingestion/orchestrator.py` levanta `ValueError` mas não há um handler global explícito no `main.py` para capturar e retornar 400 Bad Request. Isso pode causar 500 Internal Server Error para erros de input do usuário.

## 3. Conformidade Arquitetural

### ✅ Pontos Fortes

- **Strategy Pattern:** Implementado corretamente em `app/services/ingestion`. Codebase limpa e extensível.
- **Stateless:** API mantém-se stateless.
- **RBAC:** Adicionado no Frontend (`AdminGuard`).

### 🔴 Gaps de Conformidade

- **Admin Dashboard Archive:** A pasta `admin-dashboard` antiga ainda existe, criando confusão com o novo `client-portal/src/app/admin`.
  - **Ação:** Mover para `_archive/` ou deletar.
- **Testes:** A pasta `tests/` parece desatualizada em relação à nova estrutura de `ingestion`. Não há testes unitários visíveis para as novas Strategies.

## 4. Depreciação

### 🟡 Vertex AI Preview

- Encontrada referência a `from vertexai.preview import caching` na documentação `GOOGLE_AI_STACK.md`.
- **Ação:** Verificar se a feature já está em GA (General Availability) na versão `vertexai==1.71.1` instalada e atualizar o import.

## 5. Plano de Ação Recomendado

1.  **Frontend Security Patch:** Executar `npm audit fix` no `client-portal`.
2.  **Cleanup:** Deletar `admin-dashboard` antigo.
3.  **Refactor:** Substituir `print` por `logger` no backend.
4.  **Tests:** Escrever 1 teste unitário para `LegalTextStrategy` para garantir que o regex de "Artigo" funciona.

---

**Status Geral:** 🟠 **ATENÇÃO NECESSÁRIA** (Devido a vuln do Next.js e lib antiga do Firebase).
