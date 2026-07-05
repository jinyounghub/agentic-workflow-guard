# npm Smoke Test

This document records installation checks for the published npm package. It is intentionally factual: it only records commands that were run and the observed result.

## Snapshot: 2026-07-05 UTC after v0.2.0

Environment:

| Check | Result |
| --- | --- |
| Node.js | `v24.16.0` |
| npm | `11.13.0` |
| Package | `@jin0/agentic-workflow-guard` |
| Version | `0.2.0` |
| Dist tag | `latest: 0.2.0` |
| Registry visibility | `public` |

Registry metadata:

```json
{
  "name": "@jin0/agentic-workflow-guard",
  "version": "0.2.0",
  "dist-tags": {
    "latest": "0.2.0"
  }
}
```

Fresh install check:

```bash
npm init -y
npm install --save-dev @jin0/agentic-workflow-guard@0.2.0
npx agentic-workflow-guard --help
npx awi-guard --help
npx agentic-workflow-guard scan --help
```

Observed result:

| Check | Result |
| --- | --- |
| Install from npm | Pass |
| Installed dependency audit | `found 0 vulnerabilities` |
| `npx agentic-workflow-guard --help` | Pass, exit code 0 |
| `npx awi-guard --help` | Pass, exit code 0 |
| `npx agentic-workflow-guard scan --help` | Pass, exit code 0 |

## Snapshot: 2026-07-04 UTC

Environment:

| Check | Result |
| --- | --- |
| Node.js | `v24.16.0` |
| npm | `11.13.0` |
| Package | `@jin0/agentic-workflow-guard` |
| Version | `0.1.0` |
| Dist tag | `latest: 0.1.0` |
| Registry visibility | `public` |

Registry metadata:

```json
{
  "name": "@jin0/agentic-workflow-guard",
  "version": "0.1.0",
  "dist-tags": {
    "latest": "0.1.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jinyounghub/agentic-workflow-guard.git"
  },
  "bin": {
    "agentic-workflow-guard": "dist/cli.js",
    "awi-guard": "dist/cli.js"
  }
}
```

Fresh install check:

```bash
npm init -y
npm install --save-dev @jin0/agentic-workflow-guard@0.1.0
npx agentic-workflow-guard --help
npx awi-guard --help
npx @jin0/agentic-workflow-guard scan --help
```

Observed result:

| Check | Result |
| --- | --- |
| Install from npm | Pass |
| Installed dependency audit | `found 0 vulnerabilities` |
| `npx agentic-workflow-guard --help` | Pass, exit code 0 |
| `npx awi-guard --help` | Pass, exit code 0 |
| `npx @jin0/agentic-workflow-guard scan --help` | Pass, exit code 0 |

Package dry-run check:

```bash
npm pack --dry-run
```

Expected package contents:

- `dist/`
- `action.yml`
- `README.md`
- `LICENSE`
- `SECURITY.md`
- `package.json`

The npm package intentionally excludes source, tests, fixtures, and project planning docs. The GitHub repository remains the source of truth for development materials.
