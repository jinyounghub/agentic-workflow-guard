# Adoption Guide

Start in non-blocking mode so maintainers can inspect findings without breaking CI.

## Safe Trial Workflow

```yaml
name: Agentic Workflow Guard

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  awi-guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: jinyounghub/agentic-workflow-guard@v0
        with:
          paths: .github/workflows
          fail-on: never
          format: markdown
          output: awi-guard-report.md
```

## Recommended Rollout

1. Start with `fail-on: never`.
2. Review Markdown output in the workflow logs or artifacts.
3. Fix high-confidence findings involving untrusted prompt input, write permissions, secrets, or AI output flowing into scripts.
4. Use a baseline for existing findings that need planned cleanup.
5. Use narrow suppressions only when the finding is accepted and documented with a reason.
6. Move to `fail-on: critical`, then `fail-on: high` once the workflow is quiet.
7. Use SARIF upload only after the team is comfortable with the findings.

See [configuration](configuration.md) and [baselines and suppressions](baselines-and-suppressions.md).

## Responsible Use

Only scan repositories you own or are authorized to assess. Do not mass-report findings to public projects. Use synthetic examples for demos and issue reports.
