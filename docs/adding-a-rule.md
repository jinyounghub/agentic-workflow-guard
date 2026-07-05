# Adding a Rule

This guide is for small contributor PRs that add or improve deterministic scanner
rules. Keep the first PR narrow: one behavior change, one or more synthetic
fixtures, and focused tests.

## Rule ID Convention

Rule IDs are stable public API. Do not reuse an ID for a different finding.

| Range | Meaning |
| --- | --- |
| `R001` | AI action inventory and correlation |
| `R101`-`R199` | Prompt boundary, permission, trigger, data-flow, and secret handling rules |

For a new rule, choose the next available `R1xx` ID and add it to:

- `src/rules`
- `src/rules/index.ts`
- `docs/rule-catalog.md`
- README rule table
- Tests and fixtures

## Severity Convention

Use severity for the workflow risk, not for how easy the finding is to fix.

| Severity | Use when |
| --- | --- |
| Low | Inventory or informational correlation, such as an AI action being present |
| Medium | Hardening gaps that are risky in combination, such as floating refs or missing explicit permissions |
| High | Untrusted input, write permissions, privileged triggers, secrets, or AI output can cross a trust boundary |
| Critical | A high-risk path reaches dynamic execution or a privileged sink with little separation |

When unsure, prefer a conservative default and explain the evidence clearly.

## Implementation Checklist

1. Add or update a rule in `src/rules`.
2. Emit precise evidence strings that help a maintainer find the workflow edge.
3. Include a recommendation that tells the user how to reduce risk.
4. Add references to public documentation when useful.
5. Export the rule from `src/rules/index.ts`.
6. Add synthetic fixtures under `tests/fixtures`.
7. Add or update Vitest coverage in `tests`.
8. Update `docs/rule-catalog.md` and README when the public rule surface changes.
9. Run the local checks before opening a PR.

## Test Expectations

Every rule behavior change should include at least one vulnerable fixture and,
when possible, one safe fixture that demonstrates the intended boundary.

Good tests check the rule ID, severity, and evidence that matters. Avoid
snapshotting a whole report unless the full report format is the thing being
tested.

Useful commands:

```bash
npm run lint
npm test
npm run build
npm pack --dry-run
node dist/cli.js scan tests/fixtures --format markdown --fail-on never
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Fixture Rules

Use [fixture conventions](fixture-conventions.md) for file names and folder
choices. Fixtures must be synthetic and should not copy vulnerable workflows
from real repositories.
