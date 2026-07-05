# v0.2.0 Announcement Notes

`agentic-workflow-guard` is an early public OSS scanner for AI-agent GitHub Actions workflows.

## One-line Description

A deterministic GitHub Action and CLI for detecting AI-agent-specific workflow injection paths in GitHub Actions.

## Short Announcement

I released `agentic-workflow-guard` v0.2.0: a deterministic GitHub Action and CLI for spotting AI-agent-specific workflow injection paths in GitHub Actions. It focuses on untrusted issue, PR, comment, branch, or commit text reaching AI prompts and flowing toward scripts, write tokens, releases, package publishing, cloud CLIs, or secrets. Feedback is welcome.

## Medium Announcement

I am building `agentic-workflow-guard`, an early OSS scanner for GitHub Actions workflows that run AI coding agents or model-inference actions. It looks for patterns such as untrusted PR, issue, comment, branch, or commit text reaching AI prompt inputs, AI output flowing into `run` steps or sensitive CLIs, risky `pull_request_target` combinations, and secrets exposed to AI action environments.

The scanner is deterministic and does not call a model or send workflow contents to an API. v0.2.0 adds config files, baselines, narrow suppressions, improved one-step data-flow handling, verified AI action catalog metadata, and ready-to-copy adoption examples.

Feedback from maintainers experimenting with AI actions in CI is welcome, especially around false positives, missing AI action catalog entries, and safe workflow patterns.

## Technical Announcement

AI coding agents are moving into CI, but GitHub Actions workflows often mix untrusted event text, repository tokens, secrets, shell commands, and release or deploy operations. `agentic-workflow-guard` focuses on that workflow boundary: where agent prompts receive untrusted GitHub context and where agent-derived output flows next.

The project is intentionally narrow. It is not a general GitHub Actions scanner, an AI PR reviewer, or proof that a workflow is safe. It complements general tools such as `zizmor` by focusing on AI-agent-specific prompt and output paths.

## What It Detects

- Untrusted issue, PR, comment, branch, or commit text reaching AI prompt inputs.
- AI action jobs with risky write permissions.
- `pull_request_target` plus AI action risk patterns.
- AI-derived outputs flowing into scripts or sensitive commands.
- Secrets exposed directly to AI action environments.
- Floating AI action refs.
- Missing explicit permissions.

## What It Does Not Do

- It does not run a model.
- It does not send workflow contents to any API.
- It does not exploit repositories.
- It does not replace general GitHub Actions security scanners.
- It does not prove a workflow is safe.
- It does not claim external adoption.

## Responsible Use

Only scan repositories you own or are authorized to assess. Do not mass-report findings to public projects. Use synthetic examples for demos and issue reports, and describe findings as scanner output that needs human review.

## Feedback Request

If you maintain a repository using AI actions in GitHub Actions, feedback on false positives, missing AI action catalog entries, and safe workflow patterns is welcome.

Useful feedback includes:

- Workflows that should be treated as safe but produce noisy findings.
- AI action metadata that should be added to the catalog.
- Safe patterns for separating AI-generated text from privileged scripts.
- Documentation gaps that make rollout harder.

## Share Snippets

### X / Mastodon

```text
I released agentic-workflow-guard v0.2.0: a deterministic GitHub Action/CLI for spotting AI-agent-specific workflow injection paths in GitHub Actions. It focuses on untrusted issue/PR text reaching AI prompts and flowing toward scripts, write tokens, releases, or secrets. Feedback welcome.
```

### GitHub Discussion / Reddit

```text
I am building agentic-workflow-guard, an early OSS scanner for GitHub Actions workflows that run AI coding agents or model-inference actions. It looks for patterns such as untrusted PR/issue/comment text reaching AI prompt inputs, AI output flowing into run steps or sensitive CLIs, risky pull_request_target combinations, and secrets exposed to AI action environments. It is deterministic and does not call a model. I would appreciate feedback from maintainers experimenting with AI actions in CI.
```

### Technical Post Intro

```text
AI coding agents are moving into CI, but GitHub Actions workflows often mix untrusted event text, repository tokens, secrets, shell commands, and release/deploy operations. agentic-workflow-guard focuses on that workflow boundary: where agent prompts receive untrusted GitHub context and where agent-derived output flows next.
```

## Suggested Repository Topics

Recommended GitHub topics for discoverability:

- github-actions
- github-action
- security
- static-analysis
- workflow-security
- ci-security
- ai-security
- ai-agent
- prompt-injection
- sarif
- typescript

Repository topics are managed in GitHub repository settings, not through this document.

## Social Preview Note

GitHub repository social preview images are also managed in repository settings. A useful preview image should identify the project name and its narrow focus on AI-agent GitHub Actions workflow boundaries.
