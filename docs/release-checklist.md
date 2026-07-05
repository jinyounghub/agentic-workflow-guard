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
```

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
npm install --save-dev @jin0/agentic-workflow-guard
npx agentic-workflow-guard --help
```

## GitHub

- Create or update the Git tag.
- Publish GitHub release notes.
- Upload the npm tarball only when useful for traceability.
- Move the `v0` action tag to the latest compatible v0.x release.

## After Release

- Confirm the GitHub Action example still references a valid tag.
- Confirm CI passes on `main`.
- Add a new snapshot to `docs/metrics.md`.
- Comment on or close any issues completed by the release.
