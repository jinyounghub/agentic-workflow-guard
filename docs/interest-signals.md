# Interest Signals

This project tracks only public or aggregate interest signals. Do not infer private user identity from aggregate metrics.

## Signals We Can Observe

| Signal | Source | What it means | Limitations |
| --- | --- | --- | --- |
| Stars | GitHub repo | Lightweight interest or bookmarking | Not usage |
| Forks | GitHub repo | Possible experimentation | Not always active usage |
| Issues, PRs, comments | GitHub repo | Direct engagement | Low volume early |
| Clones | GitHub traffic API | Repo was cloned | Aggregate only, last 14 days |
| Views | GitHub traffic API | Repo pages were viewed | Aggregate only, last 14 days |
| Referrers | GitHub traffic API | Where visitors came from | Aggregate only |
| Popular paths | GitHub traffic API | Which pages users opened | Aggregate only |
| npm downloads | npm registry downloads API | Package installs or downloads | Includes CI, bots, and caches |
| Owned dogfooding | Maintainer repos | Maintainer usage | Not external adoption |
| External adopters | Public evidence | Real outside usage | Keep at 0 until verified |

## GitHub Traffic Commands

Requires repository write or admin access through `gh`:

```bash
gh api repos/jinyounghub/agentic-workflow-guard/traffic/views
gh api repos/jinyounghub/agentic-workflow-guard/traffic/clones
gh api repos/jinyounghub/agentic-workflow-guard/traffic/popular/referrers
gh api repos/jinyounghub/agentic-workflow-guard/traffic/popular/paths
```

## npm Download Commands

```bash
npm view @jin0/agentic-workflow-guard version
npm view @jin0/agentic-workflow-guard dist-tags
```

If `curl` is available:

```bash
curl -s "https://api.npmjs.org/downloads/point/last-week/@jin0%2Fagentic-workflow-guard"
curl -s "https://api.npmjs.org/downloads/range/last-month/@jin0%2Fagentic-workflow-guard"
```

## Weekly Snapshot Template

```md
## Snapshot: YYYY-MM-DD UTC

| Metric | Value | Notes |
| --- | ---: | --- |
| GitHub stars |  | Public repo |
| GitHub forks |  | Public repo |
| GitHub views, 14d |  | GitHub traffic API |
| GitHub unique visitors, 14d |  | GitHub traffic API |
| GitHub clones, 14d |  | GitHub traffic API |
| GitHub unique cloners, 14d |  | GitHub traffic API |
| Top referrers |  | GitHub traffic API |
| npm downloads, last week |  | npm downloads API |
| External adopters | 0 | Keep 0 until public evidence |
| Owned dogfooding | 1 | Maintainer-owned repo |
```

## Rules

- Do not count private usage as external adoption.
- Do not inflate download numbers.
- Do not treat stars as active users.
- Do not publish private analytics tokens.
- Record source and date for every metric.
