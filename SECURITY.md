# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Use [GitHub's private vulnerability reporting](https://github.com/luongnv89/sleek-ui/security/advisories/new)
3. Include detailed steps to reproduce the vulnerability
4. Allow up to 48 hours for an initial response

### What to Include

- Type of vulnerability
- Full paths of affected source files
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

### What to Expect

- Acknowledgment of your report within 48 hours
- Regular updates on our progress
- Credit in the security advisory (if desired)
- Notification when the issue is fixed

## Security Best Practices

When contributing to this project:

- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Follow secure coding practices
- Report any security concerns immediately

## Scope

sleek-ui is a static web application serving pre-authored JSON design files. The
attack surface is limited, but the following areas warrant particular attention:

- CSS injection via design token values (designs are curated, not user-submitted)
- `localStorage` usage in `ThemeContext` for persisting applied designs
- Third-party font loading from Google Fonts CDN
