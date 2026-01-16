---
status: filled
generated: 2026-01-16
---

# Development Workflow

## Branching & Releases

### Git Workflow
- **Main Branch**: `main` (production-ready code)
- **Feature Branches**: `feature/*` for new features
- **Bug Fixes**: `fix/*` for bug fixes
- **Hotfixes**: `hotfix/*` for urgent production fixes

### Release Strategy
- **Semantic Versioning**: `v1.0.0` (major.minor.patch)
- **Tags**: Git tags for releases
- **Changelog**: Maintained in `CHANGELOG.md`

## Local Development

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**Environment Variables**: Create `.env` file:
```
FIREBASE_PROJECT_ID=your-project-id
GCP_PROJECT_ID=your-gcp-project
VERTEX_AI_LOCATION=us-central1
```

**Run Backend**:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
```

**Environment Variables**: Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

**Run Frontend**:
```bash
npm run dev  # Starts on http://localhost:3000
```

### Testing

**Backend Tests**:
```bash
cd backend
pytest tests/
```

**Frontend Tests**:
```bash
cd frontend
npm run test
```

## Code Review Expectations

### Checklist
- [ ] Code follows project conventions (Clean Architecture)
- [ ] All endpoints use `get_current_user` dependency
- [ ] Tenant isolation enforced (`tenant_id` in all queries)
- [ ] Tests added/updated for new features
- [ ] Documentation updated (if applicable)
- [ ] No secrets committed (check `.gitignore`)

### Review Process
1. Create feature branch
2. Make changes and commit
3. Push to GitHub
4. Create Pull Request
5. Request review from maintainers
6. Address feedback
7. Merge after approval

## Development Tools

### GitHub Spec Kit
- **Purpose**: Spec-driven development tool
- **Location**: `tools/spec-kit/`
- **Usage**: Use `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`

### AI Context
- **Purpose**: Semantic context for AI agents
- **Location**: `.context/`
- **Usage**: See `.context/docs/README.md`

## Onboarding Tasks

### First Steps
1. Read [Project Overview](./project-overview.md)
2. Review [Architecture](./architecture.md)
3. Set up local development environment
4. Run tests to verify setup
5. Pick a "good first issue" from GitHub

### Key Files to Understand
- `backend/app/main.py` - FastAPI app entry point
- `backend/app/core/deps.py` - Dependencies (auth, DB)
- `backend/app/routers/` - API endpoints
- `frontend/app/` - Next.js pages
- `frontend/components/` - React components

### Resources
- [Essential Documents](../../docs/essential/) - Core project specifications
- [Backend Spec](../../docs/essential/02_BACKEND_SPEC.md) - Backend architecture
- [Frontend UX](../../docs/essential/03_FRONTEND_UX.md) - Frontend guidelines
- [Security RBAC](../../docs/essential/05_SECURITY_RBAC.md) - Security model
