# Security Policy

## Supported Versions

| Version     | Supported          |
| ----------- | ------------------ |
| latest main | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please use one of the following methods:

1. **GitHub Security Advisories**: Use the "Report a vulnerability" button on the [Security tab](../../security/advisories/new) of this repository to file a private advisory.
2. **Email**: Send details to the repository maintainer with the subject line `[SECURITY] prompt-crafting vulnerability report`.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours of report submission
- **Initial assessment**: Within 5 business days
- **Resolution target**: Critical vulnerabilities within 14 days; others within 30 days

### Disclosure Policy

We follow coordinated disclosure. Please allow us reasonable time to address the vulnerability before any public disclosure. We will credit reporters in the advisory (unless anonymity is requested).

## Security Measures

This project implements the following security controls:

- **CI/CD**: Automated linting, type checking, testing, npm audit, CodeQL SAST, and dependency review on every PR
- **Dependency monitoring**: Dependabot daily scans for npm, pip, and GitHub Actions dependencies
- **SBOM**: CycloneDX Software Bill of Materials generated with each build
- **Input sanitization**: DOMPurify for all user-supplied HTML/Markdown
- **Authentication**: bcrypt password hashing, server-side session validation
- **Authorization**: Role-based access control with workspace-scoped data isolation
- **Secrets**: Environment variable management; no hardcoded credentials in source
