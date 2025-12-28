# Threat Model: n.process

This document outlines the security architecture and potential threats using the **OWASP Threat Dragon** methodology (DFD + STRIDE).

## 1. Data Flow Diagram (DFD)

The following diagram illustrates the flow of data between the User, Client Portal, API, and External Services.

```mermaid
graph LR
    User[User / Browser] -- HTTPS (TLS 1.3) --> Firebase[Firebase Hosting (Front)]
    Firebase -- Auth Token --> Auth[Firebase Auth]
    User -- JSON/API --> CR[Cloud Run (Admin API)]
    CR -- Read/Write --> Firestore[(Firestore NoSQL)]
    CR -- Assess --> Vertex[Vertex AI (Gemini)]
    CR -- Audit Logs --> Logs[Cloud Logging]

    subgraph "Trust Boundary: Google Cloud"
    Firebase
    Auth
    CR
    Firestore
    Vertex
    Logs
    end

    style User fill:#f9f,stroke:#333
    style Firebase fill:#ff9,stroke:#f66
    style CR fill:#9f9,stroke:#333
```

## 2. STRIDE Analysis

We analyze the system boundaries for **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial of Service, and **E**levation of Privilege.

| Category            | Threat Description                                                | Mitigation Strategy                                                                         | Status           |
| :------------------ | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :--------------- |
| **Spoofing**        | Attacker impersonates a valid user using stolen credentials.      | **Firebase Auth** requires MFA (recommended) and short-lived tokens.                        | ✅ Mitigated     |
| **Tampering**       | Attacker modifies API requests (e.g., changes `role=admin`).      | **Pydantic Validation** enforces strict schemas. **Firestore Rules** validated server-side. | ✅ Mitigated     |
| **Repudiation**     | User denies performing a critical action (e.g., deleting a file). | **Cloud Logging** captures all API write operations with User ID.                           | ✅ Mitigated     |
| **Info Disclosure** | Sensitive data (PII) leaked in logs or error messages.            | **Pydantic** strips sensitive fields. **Cloud Run** env vars are secret-managed.            | ✅ Mitigated     |
| **DoS**             | Attacker floods the API to exhaust resources/quota.               | **Cloud Run** concurrency limits. **Firebase App Check** (future).                          | ⚠️ Accepted Risk |
| **Elevation**       | Standard user accesses Admin endpoints.                           | **RBAC** middleware checks `custom_claims['role'] == 'admin'` before execution.             | ✅ Mitigated     |

## 3. Asset Classification

- **High Value**: User Documents (PDFs), API Keys (Vertex AI).
- **Medium Value**: Assessment Reports, User Profiles.
- **Low Value**: Public Static Assets (Images, Global UI).

## 4. Security Controls

- **Encryption**: Data in Transit (TLS 1.3) and At Rest (Google Managed Keys).
- **Authentication**: OAuth2 / OIDC via Firebase.
- **Access Control**: Role-Based Access Control (RBAC).

_Generated on 2025-12-28_
