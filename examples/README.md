# Examples

These examples show common `v0.2` adoption paths. Start with advisory mode, use
config and baselines to manage known findings, then move to blocking mode once
the workflow is quiet.

| Example | Use when |
| --- | --- |
| [advisory.yml](advisory.yml) | You want visibility without failing CI yet |
| [config-and-baseline.yml](config-and-baseline.yml) | You have existing findings and want CI to focus on new risk |
| [fail-on-high.yml](fail-on-high.yml) | You are ready to block high and critical findings |
| [sarif-upload.yml](sarif-upload.yml) | You want code scanning alerts from SARIF output |

## Example Config and Baseline Files

- [awi-guard.config.example.yml](awi-guard.config.example.yml) shows rule
  overrides, path excludes, and a narrow suppression.
- [awi-guard.baseline.example.json](awi-guard.baseline.example.json) shows the
  baseline file shape. Generate real baselines with:

```bash
npx @jin0/agentic-workflow-guard scan --write-baseline awi-guard.baseline.json
```

Keep suppressions and baselines narrow. Prefer fixing high-risk workflow patterns
when possible.
