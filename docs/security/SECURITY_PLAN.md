# Security Analysis & SSDLC Implementation Plan

## 1. Executive Summary

This document outlines the security posture of the `n.process` platform (B4B) and defines the roadmap for achieving compliance with **Secure Software Development Life Cycle (SSDLC)** and **OWASP Top 10** standards.
The goal is to shift security left, automating checks in CI/CD, and hardening production endpoints.

---

## 2. Current Security Posture (Analysis)

### ✅ Strengths

- **Infrastructure**: Production workloads on GCP Cloud Run (Managed) & Firebase Hosting (Secure by Default).
- **Authentication**: Firebase Authentication (OAuth2/JWT) used for Identity Management.
- **Input Validation**: Strict typing with Pydantic on the Backend.
- **CI/CD**: `bandit` (Python SAST) and `OWASP ZAP` (DAST) already integrated.
- **Secrets**: Secrets Management via Google Secret Manager (referenced in code).

### ⚠️ Identified Gaps

1.  **Missing Security Headers**: `firebase.json` lacks `Strict-Transport-Security`, `Content-Security-Policy`, and `Permissions-Policy`.
2.  **SCA (Software Composition Analysis)**: No automated check for vulnerable dependencies (`npm audit` / `pip-audit`).
3.  **Container Security**: Docker images are not scanned for OS-level vulnerabilities (e.g. `trivy`).
4.  **Logging & Monitoring**: No centralized SIEM or Alerting defined for security events (e.g. massive 403 spikes).
5.  **Documentation**: Missing a formal Incident Response Plan.

---

## 3. Implementation Roadmap (SSDLC)

### Phase 1: Endpoint Hardening (Immediate)

Focus: Reduce attack surface via HTTP Headers.

- [ ] **HSTS**: Force HTTPS for 1 year (`max-age=31536000; includeSubDomains`).
- [ ] **CSP**: Restrict script/style sources to trusted domains (`self`, `apis.google.com`, etc).
- [ ] **Permissions-Policy**: Disable unused browser features (camera, mic, geolocation).
- [ ] **Referrer-Policy**: Set to `strict-origin-when-cross-origin`.

### Phase 2: "Shift Left" (CI/CD)

Focus: Catch vulnerabilities before merge.

- [ ] **SCA (Backend)**: Add `pip-audit` to `deploy.yml`.
- [ ] **SCA (Frontend)**: Add `npm audit` to `deploy.yml`.
- [ ] **Container Scanning**: Add `trivy` to scan the Docker image before deploy.

### Phase 3: Ongoing Compliance

Focus: Policy and Process.

- [ ] **Secrets Rotation**: Establish schedule for Service Account Keys.
- [ ] **Penetration Testing**: Schedule manual Pentest using ZAP HUD or Burp Suite.

---

## 4. OWASP Top 10 Compliance Matrix

| ID      | Title                         | Mitigation Strategy                                                                                          | Status           |
| ------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| **A01** | **Broken Access Control**     | Enforce `Depends(get_current_active_user)` on all sensitive endpoints. Use Cloud IAM for service-to-service. | ✅ Implemented   |
| **A02** | **Cryptographic Failures**    | Force HTTPS (HSTS). Encrypt Data at Rest (Firestore default). Manage secrets via Secret Manager.             | ⚠️ Missing HSTS  |
| **A03** | **Injection**                 | Use Pydantic for validation. Use ORM/Firestore SDK (avoids SQLi). Sanitize LLM Inputs.                       | ✅ Implemented   |
| **A04** | **Insecure Design**           | Threat Model created (`THREAT_MODEL.md`).                                                                    | ✅ Implemented   |
| **A05** | **Security Misconfiguration** | Remove default accounts. Hardening headers.                                                                  | ⚠️ In Progress   |
| **A06** | **Vulnerable Components**     | Automated SCA (Phase 2).                                                                                     | ❌ Planned       |
| **A07** | **Auth Failures**             | Use Firebase Auth (MFA, brute-force protection managed by Google).                                           | ✅ Implemented   |
| **A08** | **Integrity Failures**        | Signed commits. Checksums on downloads. CI/CD Pipeline integrity.                                            | ✅ Partial       |
| **A09** | **Logging Failures**          | Centralized Logging (Cloud Logging).                                                                         | ✅ Implemented   |
| **A10** | **SSRF**                      | Validate URLs in user inputs (Document Intelligence module).                                                 | ⚠️ Review Needed |

---

## 5. Security Headers Specification (JSON)

Recommended `firebase.json` headers addition:

```json
[
  {
    "key": "Strict-Transport-Security",
    "value": "max-age=31536000; includeSubDomains; preload"
  },
  {
    "key": "Content-Security-Policy",
    "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://nprocess-api-prod-*.run.app https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;"
  },
  { "key": "X-Content-Type-Options", "value": "nosniff" },
  { "key": "X-Frame-Options", "value": "DENY" },
  { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
  {
    "key": "Permissions-Policy",
    "value": "camera=(), microphone=(), geolocation=(), payment=()"
  }
]
```
