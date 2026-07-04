# OpenAI Codex for OSS Application Notes

This document prepares application material only. A human maintainer should submit the application and verify all metrics.

## Repository purpose

`agentic-workflow-guard` is a public OSS GitHub Action and npm CLI that helps maintainers safely adopt AI coding agents in GitHub Actions. It detects Agentic Workflow Injection risks such as untrusted issue or pull request content reaching agent prompts, over-privileged tokens, pwn-request patterns, secret exposure, and AI outputs flowing into scripts or release commands.

## Maintainer role

The maintainer is responsible for:

- Keeping the rule catalog current as AI GitHub Actions evolve
- Reviewing false positive reports
- Maintaining safe synthetic fixtures
- Publishing npm and GitHub releases
- Avoiding unauthorized public vulnerability disclosure

## Why this matters to OSS maintainers

Open source maintainers increasingly want AI assistance for triage, review, documentation, release notes, and maintenance automation. Those workflows often run inside GitHub Actions, where repository tokens, secrets, and shell commands are nearby. A deterministic safety gate helps maintainers adopt AI without making prompt text a privileged control plane.

## Relation to Codex and OpenAI workflows

The initial AI action catalog includes `openai/codex-action`. The scanner itself is model-free, but it can help maintainers run Codex in CI with safer prompts, narrower token scopes, explicit permissions, pinned action versions, and fewer prompt-to-script paths.

## API credits usage plan

API credits would be used only for core OSS maintenance and security workflows:

- Explaining scan findings in maintainer-friendly language
- Suggesting safer workflow rewrites
- Generating SARIF remediation text
- Testing Codex-based maintainer automation against safe synthetic fixtures
- Drafting documentation and rule examples

The scanner itself remains deterministic and does not require API access.

## Codex Security access justification

This project focuses on securing AI-agent workflows in public OSS repositories. Codex Security would help validate rule coverage, review high-risk workflow patterns, and harden remediation guidance for maintainers adopting Codex and other coding agents in CI.

## Current metrics

Do not invent metrics. As of the initial scaffold:

- Stars: 0 until the public repository exists
- Downloads: 0 until the npm package exists
- External adopters: 0 until real users are documented
- Releases: v0.1.0 GitHub release planned after CI passes

## Missing metrics before applying

Recommended evidence before submitting:

- Public GitHub repository
- v0.1.0 GitHub release
- npm package publication
- CI passing on the public repository
- At least one real repository using the action
- At least a few issues, discussions, or external feedback items
- Documentation showing comparison with nearby tools

## Application draft

### Why this repository qualifies

agentic-workflow-guard is a public OSS GitHub Action/CLI that helps maintainers safely adopt AI coding agents in GitHub Actions. It detects Agentic Workflow Injection risks such as untrusted issue/PR content reaching agent prompts, over-privileged tokens, pwn-request patterns, and AI outputs flowing into scripts or release commands.

### API credits usage

We will use API credits only for core OSS maintenance and security workflows: explaining scan findings, suggesting safer workflow rewrites, generating SARIF remediation text, and testing Codex-based maintainer automation against safe synthetic fixtures. The scanner itself runs deterministically without requiring API access.

### Codex Security justification

This project focuses on securing AI-agent workflows in public OSS repositories. Codex Security would help validate rule coverage, review high-risk workflow patterns, and harden remediation guidance for maintainers adopting Codex and other coding agents in CI.

## Application risk notes

The project should not apply immediately after a local scaffold. The application is stronger after public release, npm availability, real usage evidence, and active maintenance signals.
