# Project Metrics

This page tracks real, dated public project health and adoption signals. Do not inflate, estimate, or backfill adoption numbers.

## Snapshot: 2026-07-05 UTC after catalog verification PR merge

| Metric | Value | Evidence / notes |
| --- | ---: | --- |
| Latest GitHub release | `v0.1.1` | Latest published release; catalog verification metadata is unreleased |
| npm version | `0.1.1` | `npm view @jin0/agentic-workflow-guard version` |
| Main CI | Pass | Run `28740395037` after PR #13 merge |
| Merged pull requests | `5` | #9, #10, #11, #12, #13 |
| Open issues | `1` | #7 |
| Closed issues | `6` | #1, #2, #3, #4, #5, #6 |
| Latest unreleased changes | config/baseline/suppression, expression/data-flow precision, verified AI action catalog metadata | Merged through #13 |
| External adopters | `0` | No known external adopters yet |
| Owned repo adoption examples | `1` | `jinyounghub/approach-key-privacy` uses the GitHub Action in CI |

## Snapshot: 2026-07-05 UTC after data-flow PR merge

| Metric | Value | Evidence / notes |
| --- | ---: | --- |
| Latest GitHub release | `v0.1.1` | Latest published release; data-flow precision is unreleased |
| Main CI | Pass | Run `28739508904` after PR #11 merge |
| Merged pull requests | `3` | #9, #10, #11 |
| Open issues | `2` | #5, #7 |
| Closed issues | `5` | #1, #2, #3, #4, #6 |
| Latest unreleased changes | config/baseline/suppression, expression/data-flow precision | Merged through #9 and #11 |
| External adopters | `0` | No known external adopters yet |
| Owned repo adoption examples | `1` | `jinyounghub/approach-key-privacy` uses the GitHub Action in CI |

## Snapshot: 2026-07-05 UTC after config PR merge

| Metric | Value | Evidence / notes |
| --- | ---: | --- |
| Latest GitHub release | `v0.1.1` | Latest published release; config/baseline/suppression support is unreleased |
| Merged pull requests | `1` | #9 merged for config, baseline, and suppression support |
| Open issues | `3` | #2, #5, #7 |
| Closed issues | `4` | #1, #3, #4, #6 |
| Latest unreleased changes | config, baseline, and suppression support | Merged through #9 |
| External adopters | `0` | No known external adopters yet |
| Owned repo adoption examples | `1` | `jinyounghub/approach-key-privacy` uses the GitHub Action in CI |

## Snapshot: 2026-07-05 UTC after owned repo dogfooding

| Metric | Value | Evidence / notes |
| --- | ---: | --- |
| Latest GitHub release | `v0.1.1` | Published 2026-07-05 UTC |
| npm version | `0.1.1` | `npm view @jin0/agentic-workflow-guard version` |
| `v0` action tag | `v0.1.1` | `v0` and `v0.1.1` point to commit `c378ec6` |
| Owned repo adoption examples | `1` | `jinyounghub/approach-key-privacy` uses the GitHub Action in CI |
| Owned repo dogfooding workflow | Pass | `jinyounghub/approach-key-privacy` [run 28733900609](https://github.com/jinyounghub/approach-key-privacy/actions/runs/28733900609) |
| External adopters | `0` | No known external adopters yet |
| Open issues | `4` | #1, #2, #5, #7 |
| Closed issues | `3` | #3, #4, #6 |

## Snapshot: 2026-07-05 UTC after v0.1.1

| Metric | Value | Evidence / notes |
| --- | ---: | --- |
| Latest GitHub release | `v0.1.1` | Published 2026-07-05 UTC |
| npm version | `0.1.1` | `npm view @jin0/agentic-workflow-guard version` |
| npm dist tag | `latest: 0.1.1` | `npm view @jin0/agentic-workflow-guard dist-tags` |
| npm clean install smoke test | Pass | Tested after publish |
| `v0` action tag | `v0.1.1` | `v0` and `v0.1.1` point to commit `c378ec6` |
| Open issues | `5` | #1, #2, #5, #6, #7 |
| Closed issues | `2` | #3, #4 |
| External adopters | `0` | No known external adopters yet |
| Owned repo adoption examples | `0` | Next step |

## Snapshot: 2026-07-05 UTC

| Metric | Value | Evidence / notes |
| --- | ---: | --- |
| GitHub repository | `jinyounghub/agentic-workflow-guard` | Public repository |
| Latest GitHub release | `v0.1.0` | `v0.1.1` pending |
| npm package | `@jin0/agentic-workflow-guard` | Published package |
| npm version | `0.1.0` | `v0.1.1` pending |
| npm clean install smoke test | Pass | See `docs/npm-smoke-test.md` |
| `npx` smoke test | Pass | `agentic-workflow-guard`, `awi-guard`, scoped package invocation |
| CI | Configured | lint, tests, build, package smoke test, self-scan artifacts |
| GitHub stars | `0` | GitHub repository metadata |
| GitHub forks | `0` | GitHub repository metadata |
| Open issues | `5` | #1, #2, #5, #6, #7 |
| Closed issues | `2` | #3, #4 |
| Pull requests | `0` | GitHub repository metadata |
| External adopters | `0` | No known external adopters yet |
| Owned repo adoption examples | `0` | Next step |

## Snapshot: 2026-07-04 UTC

| Metric | Value | Evidence / notes |
| --- | ---: | --- |
| GitHub repository | `jinyounghub/agentic-workflow-guard` | Public repository |
| Default branch | `main` | GitHub repository metadata |
| Latest GitHub release | `v0.1.0` | Published 2026-07-04 UTC |
| npm package | `@jin0/agentic-workflow-guard` | Published package |
| npm version | `0.1.0` | `npm view @jin0/agentic-workflow-guard version` |
| npm dist tag | `latest: 0.1.0` | `npm view @jin0/agentic-workflow-guard dist-tags` |
| npm last-week downloads | `54` | npm downloads API for 2026-06-28 to 2026-07-04 |
| npm clean install smoke test | Pass | See `docs/npm-smoke-test.md` |
| `npx` smoke test | Pass | `agentic-workflow-guard`, `awi-guard`, scoped package invocation |
| CI | Configured | lint, tests, build, package smoke test, self-scan artifacts |
| GitHub stars | `0` | GitHub repository metadata |
| GitHub forks | `0` | GitHub repository metadata |
| Open issues | `7` | Public follow-up issues visible after v0.1.0 |
| Pull requests | `0` | GitHub repository metadata |
| External adopters | `0` | No known external adopters yet |
| Owned repo adoption examples | `0` | Planned next step |

## Public Maturity Interpretation

The project has the minimum public OSS foundation: repository, license, security policy, CI, release, npm package metadata, documentation, and real follow-up issues. It is still an early `v0.x` project and should not be described as broadly adopted until public adoption evidence exists.

Before broader promotion, collect at least:

- One real repository using the GitHub Action.
- One or more improvement PRs merged after `v0.1.0`.
- Verified npm package page and install test from a clean environment.
- A dated download/adoption snapshot.
- At least one public explanation post or external reference that describes the tool and responsible-use limits.

## Update Rules

- Add new dated snapshots instead of editing historical numbers.
- Use exact public numbers only.
- Keep external adopters at `0` until there is public evidence.
- Keep download counts tied to an npm API date range.
- Track owned-repo dogfooding separately from external adoption.
