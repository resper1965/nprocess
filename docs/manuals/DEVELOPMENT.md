# Development Guide

This guide covers development practices, coding standards, and workflows for ComplianceEngine.

## 🛠️ Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+ (for frontend components)
- Docker & Docker Compose
- Google Cloud SDK (for deployment)
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/resper1965/nprocess.git
cd nprocess

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install

# Copy environment file
cp .env.example .env
# Edit .env with your credentials
```

## 📝 Coding Standards

### Python

- **Style**: Follow PEP 8, use Black for formatting
- **Line Length**: 120 characters
- **Type Hints**: Use type hints for all functions
- **Docstrings**: Google-style docstrings for public APIs

```python
def process_compliance(
    process_id: str,
    framework: str,
    api_key: str
) -> ComplianceResult:
    """
    Analyze process compliance with a regulatory framework.

    Args:
        process_id: Unique identifier for the process
        framework: Regulatory framework name (e.g., 'LGPD')
        api_key: API key for authentication

    Returns:
        ComplianceResult with analysis details

    Raises:
        HTTPException: If process not found or invalid API key
    """
    pass
```

### TypeScript/JavaScript

- **Style**: ESLint + Prettier
- **Type Safety**: Use TypeScript strict mode
- **Components**: Functional components with hooks

## 🧪 Testing

### Running Tests

```bash
# All tests
make test
pytest tests/ -v

# Specific test file
pytest tests/test_api.py -v

# With coverage
pytest tests/ -v --cov=app --cov-report=html

# Watch mode
pytest-watch tests/
```

### Writing Tests

- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error conditions

```python
def test_create_api_key_success():
    """Test successful API key creation."""
    # Arrange
    user_id = "test_user"
    permissions = ["read", "write"]
    
    # Act
    result = create_api_key(user_id, permissions)
    
    # Assert
    assert result.key_id is not None
    assert result.permissions == permissions
```

## 🔍 Code Quality

### Linting

```bash
# Run all linters
make lint

# Individual tools
black --check app/ tests/
flake8 app/ tests/
mypy app/
```

### Formatting

```bash
# Auto-format code
make format

# Individual tools
black app/ tests/
isort app/ tests/
```

## 🔐 Security

### Security Scans

```bash
# Run security checks
make security-scan

# Individual tools
bandit -r app/
safety check
```

### Best Practices

- Never commit secrets or credentials
- Use Secret Manager for production secrets
- Validate all user input
- Use parameterized queries
- Keep dependencies updated

## 📦 Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add rate limiting to API endpoints
fix: resolve 403 error on favicon
docs: update deployment guide
refactor: simplify authentication logic
test: add tests for webhook service
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Run tests and linters
4. Update documentation if needed
5. Create PR with description
6. Request review
7. Address feedback
8. Merge after approval

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Secrets in Secret Manager
- [ ] Cloud Build configuration updated

### Deployment Commands

```bash
# Deploy API
make deploy-api

# Deploy Admin Dashboard
make deploy-admin

# Manual deployment
gcloud builds submit --config=cloudbuild.yaml
```

## 🐛 Debugging

### Local Debugging

```bash
# Run with debugger
python -m ipdb -c continue app/main.py

# Enable debug logging
export LOG_LEVEL=DEBUG
uvicorn app.main:app --reload
```

### Cloud Run Logs

```bash
# View logs
gcloud run services logs read compliance-engine \
  --region=us-central1 \
  --project=nprocess \
  --limit=50
```

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [Pytest Documentation](https://docs.pytest.org/)

