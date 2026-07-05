# Configuration

`agentic-workflow-guard` works without a config file. Add `awi-guard.config.yml` when a repository needs rule overrides, path excludes, or narrow suppressions.

```bash
npx agentic-workflow-guard scan --config awi-guard.config.yml
```

## Example

```yaml
rules:
  R107:
    enabled: false
  R102:
    severity: medium

exclude:
  paths:
    - ".github/workflows/legacy-*.yml"
    - "examples/**"

suppressions:
  - id: R104
    file: ".github/workflows/ai-review.yml"
    reason: "AI output is only printed as data and not executed."
    expires: "2026-12-31"
```

## Rule Overrides

Use `rules` to disable a rule or change its effective severity.

- `enabled: false` removes matching findings from reports.
- `severity` changes the effective severity used by summaries and `fail-on`.
- Valid severities are `low`, `medium`, `high`, and `critical`.

## Excluding Paths

Use `exclude.paths` to skip files before parsing. Patterns are matched against repository-relative paths and support `*`, `?`, and `**`.

Keep excludes narrow. Broad excludes can hide real workflow risk.

## Suppressions

Suppressions are exact rule/file matches. A `reason` is required. Suppressions without a reason are ignored and reported as configuration warnings.

Use `expires` for temporary acceptance. Expired suppressions are not applied.
