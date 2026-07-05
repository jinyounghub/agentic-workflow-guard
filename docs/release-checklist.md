# Release Checklist

Use this checklist for patch and minor releases.

## Before Release

- Confirm `git status -sb` is clean or only contains intended release changes.
- Run `npm ci` after dependency changes.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build`.
- Run `npm audit --audit-level=moderate`.
- Run `npm pack --dry-run` and confirm only intended package files are included.
- Smoke test the packed tarball in a fresh temporary project.
- Run self-scan:

```bash
node dist/cli.js scan .github/workflows --format markdown --fail-on never
node dist/cli.js scan tests/fixtures --format markdown --fail-on never
node dist/cli.js scan tests/fixtures/dataflow --format json --fail-on never
node dist/cli.js scan tests/fixtures/dataflow --format sarif --output awi-dataflow.sarif --fail-on never
node -e "JSON.parse(require('node:fs').readFileSync('awi-dataflow.sarif','utf8')); console.log('sarif ok')"
```

On Windows PowerShell, write temporary SARIF files under `$env:TEMP` or the
workspace and use `npm.cmd` if execution policy blocks `npm.ps1`.

## Versioning

- Patch releases: packaging, docs, CI, small rule fixes.
- Minor releases: new rules, config support, baseline support, suppression support, parser improvements.
- Update `package.json`.
- Update `package-lock.json`.
- Update `CHANGELOG.md`.

## Publish

```bash
npm publish --access public
```

Then verify:

```bash
npm view @jin0/agentic-workflow-guard version
npm view @jin0/agentic-workflow-guard dist-tags
npm install --save-dev @jin0/agentic-workflow-guard@<version>
npx agentic-workflow-guard --help
npx awi-guard --help
npx agentic-workflow-guard scan --help
```

## GitHub

- Create or update the Git tag.
- Publish GitHub release notes.
- Upload the npm tarball only when useful for traceability.
- Move the `v0` action tag to the latest compatible v0.x release.
- Confirm owned-repository dogfooding after moving `v0`.

## After Release

- Confirm the GitHub Action example still references a valid tag.
- Confirm CI passes on `main`.
- Add a new snapshot to `docs/metrics.md`.
- Comment on or close any issues completed by the release.
