# Security Policy

## Supported versions

No released versions are supported yet. Security handling begins with the first public release.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub Security Advisories once the repository is public. Until then, contact the maintainer directly.

Include:

- A minimal synthetic workflow that reproduces the issue
- Expected and actual scanner behavior
- Whether the issue is a false negative, false positive, crash, or packaging concern

Do not include real secrets, private repository data, or exploit payloads against third-party repositories.

## Scope

In scope:

- Scanner false negatives for documented rules
- Scanner crashes on valid workflow YAML
- SARIF output issues that hide findings
- GitHub Action packaging issues

Out of scope:

- Vulnerabilities in third-party workflows
- Requests to exploit public repositories
- Social engineering or secret exfiltration demonstrations
