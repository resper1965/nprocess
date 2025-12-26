# Auditoria de Segurança - OWASP Top 10 (2025)

**Data:** 26/12/2025
**Escopo:** n.process (Frontend + Backend Stateless)

## 1. Broken Access Control (A01)

- **Status:** ✅ Mitigado.
- **Análise:**
  - Frontend implementa `AdminGuard` em `/admin/*` checando `isAdmin` do token.
  - Backend valida `verify_firebase_token` e checa claims.
- **Gap Residual:** Garantir que todas as Cloud Functions de background também chequem permissões, não apenas autenticação.

## 2. Cryptographic Failures (A02)

- **Status:** ✅ Mitigado.
- **Ação Tomada:** HSTS ativado (`max-age=31536000`) no `firebase.json` e `main.py`. Tráfego forçado via HTTPS.
- **Dados em Repouso:** Firestore encripta por padrão.

## 3. Injection (A03)

- **Status:** ✅ Mitigado.
- **Análise:**
  - Firestore usa queries parametrizadas (NoSQL Injection safe).
  - Backend usa Pydantic para validação estrita de tipos.
- **Atenção:** O `Knowledge Ingestion` deve sanitizar HTML antes de vetorizar para evitar "Prompt Injection" nos LLMs futuramente.

## 4. Insecure Design (A04)

- **Status:** ⚠️ Monitorar.
- **Análise:** Rate Limiting implementado (`RateLimitMiddleware`).
- **Gap:** Falta Threat Modeling formal documentado para o fluxo de LLM (ex: custo excessivo via loop de requests).

## 5. Security Misconfiguration (A05)

- **Status:** ✅ Resolvido.
- **Ação Tomada:**
  - Removido diretório `admin-dashboard` (código morto).
  - Aplicado CSP e X-Frame-Options no `firebase.json`.
  - Criado `SECURITY.md`.

## 6. Vulnerable and Outdated Components (A06)

- **Status:** 🔄 Em Progresso.
- **Ação:** Next.js atualizado para corrigir CVEs críticas. `firebase-admin` atualizado.

## 7. Identification and Authentication Failures (A07)

- **Status:** ✅ Mitigado (Firebase Auth).
- **Análise:** Delegação completa para Google Identity Platform. MFA suportado nativamente.

## 8. Software and Data Integrity Failures (A08)

- **Status:** ✅ Mitigado.
- **Ação:** Imagens Docker devem usar SHA digest. CI/CD deve assinar builds (Futuro).

## 9. Security Logging and Monitoring Failures (A09)

- **Status:** ✅ Mitigado.
- **Ação:** Substituído `print` por `StructuredLoggingMiddleware`. Logs centralizados no Cloud Logging.

## 10. Server-Side Request Forgery (SSRF) (A10)

- **Status:** ⚠️ Atenção.
- **Análise:** O módulo `WebWatchStrategy` faz requests para URLs arbitrárias.
- **Correção:** Adicionar lista de domínios permitidos (Allowlist) ou rodar em ambiente sandboxed sem acesso à rede interna (VPC Egress traffic rules).
