# Contributing to ComplianceEngine

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/nprocess.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit with conventional commits: `git commit -m "feat: add new feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests
pytest tests/ -v

# Run linters
black app/ tests/
flake8 app/ tests/
mypy app/
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add rate limiting to API endpoints`

## Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if needed
3. Add tests for new features
4. Ensure all tests pass
5. Update CHANGELOG.md
6. Request review from maintainers

## Code Style

### Python
- Follow PEP 8
- Use Black for formatting (line length: 120)
- Type hints where possible
- Docstrings for public functions/classes

### TypeScript/JavaScript
- Follow ESLint rules
- Use Prettier for formatting
- TypeScript strict mode

## Testing

- Write tests for new features
- Maintain or improve test coverage
- Test edge cases and error conditions

## Documentation

- Update README.md for user-facing changes
- Add/update docstrings for code changes
- Update API documentation if endpoints change

## Questions?

Open an issue with the `question` label or contact the maintainers.

