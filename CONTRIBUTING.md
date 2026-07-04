# Contributing

Thanks for helping improve `agentic-workflow-guard`.

## Development setup

```bash
npm install
npm run lint
npm test
npm run build
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Rules

Rules live in `src/rules`. Each rule should:

- Use synthetic fixtures only
- Provide clear evidence and recommendations
- Avoid naming real vulnerable repositories
- Include at least one test when behavior changes
- Prefer deterministic analysis over model calls

## Fixtures

Add vulnerable examples under `tests/fixtures/vulnerable` and safe examples under `tests/fixtures/safe`. Do not include real secrets, real exploit payloads, or copied vulnerable workflows from public projects.

## Pull requests

Before opening a PR, run:

```bash
npm run lint
npm test
npm run build
```
