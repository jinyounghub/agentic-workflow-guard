# Baselines and Suppressions

Baselines and suppressions are both ways to manage accepted findings, but they serve different jobs.

Use a baseline when a repository has existing findings and you want CI to focus on new findings. Use a suppression when a specific finding has been reviewed and accepted for a documented reason.

## Baselines

Create a baseline from the current scan:

```bash
npx agentic-workflow-guard scan --write-baseline awi-guard.baseline.json
```

When `--write-baseline` is used without an explicit `--fail-on`, the scan exits successfully after writing the baseline.

Use it in later scans:

```bash
npx agentic-workflow-guard scan --baseline awi-guard.baseline.json
```

Baseline files use stable fingerprints:

```json
{
  "version": 1,
  "findings": [
    {
      "id": "R107",
      "file": ".github/workflows/ai-review.yml",
      "fingerprint": "..."
    }
  ]
}
```

Baselined findings remain visible in Markdown, JSON, and SARIF output, but they do not trigger `fail-on`.

## Suppressions

Suppressions live in `awi-guard.config.yml`:

```yaml
suppressions:
  - id: R104
    file: ".github/workflows/ai-review.yml"
    reason: "AI output is only printed as data and not executed."
    expires: "2026-12-31"
```

Policy:

- `id`, `file`, and `reason` are required.
- `expires` is optional but recommended.
- Expired suppressions are ignored.
- Suppressions without reasons are ignored and reported as configuration warnings.
- Broad file-level or repository-level disable comments are not supported.

## Inline Suppression

Inline suppression is intentionally not enabled yet. A future version may support narrow comments with a rule id and reason, such as:

```yaml
# awi-guard-disable-next-line R107 -- reason: protected internal action tag
```

Until then, prefer config suppressions or baselines.
