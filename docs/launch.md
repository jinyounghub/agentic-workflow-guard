# v0.2.0 Launch Notes

`agentic-workflow-guard` is an early public OSS GitHub Action and CLI for detecting AI-agent-specific workflow injection paths in GitHub Actions.

## One-line Description

A deterministic scanner for AI-agent GitHub Actions workflows, focused on untrusted GitHub event text reaching AI prompts and flowing toward scripts, write tokens, release commands, package publishing, cloud CLIs, or secrets.

## Short Announcement

I released `agentic-workflow-guard v0.2.0`, a deterministic GitHub Action/CLI for spotting AI-agent-specific workflow injection paths in GitHub Actions. It does not call a model. It focuses on patterns like untrusted issue, PR, or comment text reaching AI prompts and agent-derived output flowing toward scripts, write-scoped tokens, releases, packages, or secrets. Feedback welcome.

## Medium Announcement

AI coding agents are moving into CI for triage, review, release notes, and repository automation. `agentic-workflow-guard` checks the workflow boundary around those agents: where untrusted GitHub event text enters prompt inputs, and where AI-derived output flows next. v0.2.0 adds config files, baselines, suppressions, better data-flow detection, verified AI action catalog metadata, and adoption examples.

## Technical Announcement

GitHub Actions workflows can combine untrusted issue, PR, or comment text, AI prompts, repository tokens, secrets, shell commands, and release or deploy operations. `agentic-workflow-guard` is a deterministic static scanner for those AI-agent-specific workflow injection paths. It produces Markdown, JSON, and SARIF output and is intended to complement, not replace, general GitHub Actions security scanners.

## What It Detects

- Untrusted issue, PR, comment, commit, or dispatch input reaching AI prompt boundaries.
- AI actions running with risky write permissions.
- `pull_request_target` plus AI action combinations.
- AI-derived outputs flowing into scripts or sensitive commands.
- Secrets exposed directly to AI action environments.
- Floating AI action refs.
- Missing explicit permissions.

## What It Does Not Do

- It does not call a model.
- It does not send workflow contents to any API.
- It does not exploit repositories.
- It does not replace general GitHub Actions security scanners.
- It does not prove a workflow is safe.
- It does not claim broad adoption.

## Feedback Request

Feedback is welcome from maintainers experimenting with AI actions in GitHub Actions, especially around false positives, missing AI action catalog entries, and safe workflow patterns.

## Suggested Sharing Order

1. Update GitHub repository topics.
2. Add a social preview image.
3. Share the short announcement on X or Mastodon.
4. Share the medium announcement in a relevant GitHub Actions, AppSec, or AI security community.
5. Watch traffic, referrer, and npm signals for 7 days.

## Suggested GitHub Topics

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

Repository topics are managed in GitHub repository settings. A maintainer can apply them with:

```bash
gh repo edit jinyounghub/agentic-workflow-guard \
  --add-topic github-actions \
  --add-topic github-action \
  --add-topic security \
  --add-topic static-analysis \
  --add-topic workflow-security \
  --add-topic ci-security \
  --add-topic ai-security \
  --add-topic ai-agent \
  --add-topic prompt-injection \
  --add-topic sarif \
  --add-topic typescript
```

## Social Preview Checklist

- Create a 1280x640 PNG.
- Include the project name and one-line description.
- Upload it in GitHub repository settings.
- Keep the image under 1 MB.

## Related Docs

- [Announcement notes](announcement.md)
- [Interest signals](interest-signals.md)
- [Metrics](metrics.md)
