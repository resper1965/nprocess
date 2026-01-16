---
status: filled
generated: 2026-01-16
---

# Security & Compliance Notes

## Authentication & Authorization

### Firebase Auth with Custom Claims

**Identity Provider**: Firebase Auth (Identity Platform)
**Token Format**: JWT with Custom Claims embedded

**JWT Payload Structure**:
```json
{
  "uid": "firebase_user_id",
  "role": "super_admin" | "org_admin" | "developer" | "guest",
  "org_id": "tenant_uuid_v4" | "system",
  "status": "active" | "pending"
}
```

### Role Hierarchy

**`super_admin`** (Ness Staff)
- God Mode access
- Can view all Tenants
- Can manage "Marketplace de Leis"
- Can approve new Tenants and assign roles

**`org_admin`** (Client - Manager)
- Access only to their `org_id` data
- Can create API Keys
- Can invite developers to their Org
- Can manage Private Context (Uploads)

**`developer`** (Client - Operational)
- Read/execute access only
- Can use Playground and copy Keys
- Cannot delete Keys or change Billing

**`guest`** (Default on Signup)
- Initial state after signup
- No access to anything
- Sees "Waiting Room" screen only

### Onboarding Flow ("The Waiting Room")

1. **Sign Up**: User creates account (Google/Email)
2. **Auto-trigger**: Creates document in `users` collection with `role: guest`, `status: pending`
3. **Approval (Via Super Admin)**:
   - Super Admin sees user in "Pending Users" list
   - Action: "Assign to Tenant" - Admin selects Organization (or creates new) and Role
4. **Activation**:
   - Backend uses `firebase-admin` to inject `org_id` and `role` into user's custom claims
   - On next session, user enters correct Dashboard

### API Security

**Dependency**: All endpoints must use `get_current_user` dependency (`backend/app/core/deps.py`)

**Tenant Isolation**: The `org_id` extracted from the JWT token must be **mandatorily** injected into all Firestore queries:
```python
where("tenant_id", "==", user.org_id)
```

**Role-Based Access Control**: Use `require_role` dependency for role-specific endpoints:
```python
@router.get("/admin/system")
async def admin_endpoint(user: CurrentUser = Depends(require_role("super_admin"))):
    ...
```

## Secrets & Sensitive Data

### Secret Storage
- **Google Secret Manager**: For API keys, service account credentials
- **Environment Variables**: For local development (`.env` files, not committed)
- **Firebase Admin SDK**: For Firebase service account credentials

### Encryption
- **In Transit**: HTTPS/TLS for all API communications
- **At Rest**: Firestore encryption at rest (GCP managed)
- **API Keys**: Stored as hashes (never plaintext)

### Data Classifications
- **Sensitive**: API keys, user tokens, credentials
- **Personal**: User emails, names, org affiliations
- **Public**: Public knowledge base documents (if marked as public)

## Compliance & Policies

### Multi-Tenancy
- **Tenant Isolation**: Enforced at database level (all queries scoped by `tenant_id`)
- **Data Segregation**: Each tenant's data is completely isolated

### Audit Trail
- All user actions logged (Firestore `jobs` collection)
- API key usage tracked
- Document ingestion/access logged

### Privacy
- **User Data**: Stored in Firestore `users` collection
- **Custom Claims**: Permissions embedded in JWT (no DB queries needed)
- **GDPR**: User can request data deletion (via Super Admin)

## Incident Response

### Detection
- Cloud Run logs monitoring (structured logging)
- Firestore query monitoring (unusual patterns)
- API rate limiting alerts

### Response Steps
1. Identify incident scope (single tenant vs. system-wide)
2. Isolate affected tenant (if applicable)
3. Revoke compromised API keys
4. Review audit logs
5. Notify affected users (if required)

### Recovery
- API keys can be regenerated
- Tenant data can be restored from Firestore backups
- Service Account credentials can be rotated via GCP Console
