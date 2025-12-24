# Repository Organization

This document describes the organization and structure of the ComplianceEngine repository, following InfraOps and SDLC best practices.

## 📁 Directory Structure

```
nprocess/
├── .github/                 # GitHub configuration
│   ├── workflows/          # CI/CD workflows
│   ├── CODEOWNERS         # Code ownership
│   ├── CONTRIBUTING.md    # Contribution guidelines
│   ├── SECURITY.md        # Security policy
│   └── dependabot.yml     # Dependency updates
├── app/                    # Main FastAPI application
│   ├── main.py            # Application entry point
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   ├── schemas/           # Pydantic models
│   └── middleware/        # Custom middleware
├── admin-dashboard/       # Admin interface (Next.js)
├── admin-control-plane/   # Admin API service
├── client-portal/         # Client-facing interface
├── mcp-servers/          # MCP protocol servers
├── regulatory-rag-api/   # RAG service
├── document-generator-engine/  # Document generation
├── docs/                 # Documentation
│   ├── architecture/     # Architecture docs
│   ├── deployment/       # Deployment guides
│   ├── development/     # Development guides
│   └── api/             # API documentation
├── tests/                # Test suite
├── scripts/              # Utility scripts
├── specs/                # Technical specifications
├── examples/             # Code examples
├── .editorconfig        # Editor configuration
├── .gitignore           # Git ignore rules
├── .pre-commit-config.yaml  # Pre-commit hooks
├── Makefile             # Development commands
├── pyproject.toml       # Python tool configuration
├── requirements.txt     # Production dependencies
├── requirements-dev.txt # Development dependencies
├── docker-compose.yml   # Local development
├── Dockerfile           # API Docker image
├── cloudbuild.yaml      # Cloud Build config
├── CHANGELOG.md         # Version history
├── LICENSE              # MIT License
└── README.md            # Main documentation
```

## 📚 Documentation Organization

### Root Level
- `README.md` - Main project documentation
- `CHANGELOG.md` - Version history
- `LICENSE` - License file

### docs/ Directory
- **Getting Started**: Quick start, authentication, integration
- **Architecture**: System design, project overview
- **Development**: Development guides, coding standards
- **Deployment**: Deployment guides, status
- **API**: API documentation
- **Troubleshooting**: Common issues and solutions

### Legacy Documents
Historical documents moved to `docs/` for reference:
- Session summaries
- Proposals
- Analysis documents

## 🔧 Configuration Files

### Development
- `.editorconfig` - Editor settings
- `.pre-commit-config.yaml` - Pre-commit hooks
- `pyproject.toml` - Python tool config
- `Makefile` - Development commands
- `pytest.ini` - Test configuration

### CI/CD
- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/cd.yml` - Continuous Deployment
- `.github/dependabot.yml` - Dependency updates

### Infrastructure
- `cloudbuild.yaml` - Google Cloud Build
- `docker-compose.yml` - Local development
- `Dockerfile` - Container image

## 🧪 Testing Structure

```
tests/
├── unit/              # Unit tests
├── integration/      # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test fixtures
```

## 📦 Service Organization

Each service follows a consistent structure:

```
service-name/
├── app/              # Application code
├── tests/            # Service tests
├── Dockerfile        # Container definition
├── requirements.txt  # Dependencies
└── README.md        # Service documentation
```

## 🔐 Security Files

- `.github/SECURITY.md` - Security policy
- `docs/SECURITY.md` - Security practices
- `.gitignore` - Excludes secrets and credentials

## 📝 Best Practices Applied

### InfraOps
- ✅ Infrastructure as Code (Cloud Build, Docker)
- ✅ CI/CD pipelines
- ✅ Automated testing
- ✅ Monitoring and logging
- ✅ Secret management
- ✅ Environment configuration

### SDLC
- ✅ Version control (Git)
- ✅ Code review process
- ✅ Automated quality checks
- ✅ Documentation standards
- ✅ Testing strategy
- ✅ Release management
- ✅ Change tracking (CHANGELOG)

## 🚀 Quick Reference

```bash
# Development
make install          # Install dependencies
make test            # Run tests
make lint            # Check code quality
make format          # Format code

# Docker
make docker-up       # Start services
make docker-down     # Stop services
make docker-logs     # View logs

# Deployment
make deploy-api      # Deploy API
make deploy-admin    # Deploy Admin Dashboard
```

## 📋 Maintenance

- **Dependencies**: Updated weekly via Dependabot
- **Security**: Scanned regularly
- **Documentation**: Updated with code changes
- **Tests**: Run on every commit
- **Releases**: Tagged and documented in CHANGELOG

