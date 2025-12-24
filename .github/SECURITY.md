# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public issue
2. Email security concerns to: security@ness.com.br
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices

### API Keys
- Never commit API keys to the repository
- Use Secret Manager for production secrets
- Rotate keys regularly
- Use least privilege principle

### Authentication
- Always use HTTPS in production
- Implement rate limiting
- Use strong password policies
- Enable MFA where possible

### Dependencies
- Keep dependencies up to date
- Review security advisories regularly
- Use Dependabot for automated updates

### Infrastructure
- Follow principle of least privilege
- Enable audit logging
- Regular security scans
- Encrypt data at rest and in transit

## Security Features

- ✅ API Key authentication with bcrypt hashing
- ✅ JWT tokens for session management
- ✅ Rate limiting per API key
- ✅ CORS protection
- ✅ Input validation with Pydantic
- ✅ Secret Manager integration
- ✅ Audit logging
- ✅ HTTPS only in production

