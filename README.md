# agentic-workflow-guard

Static analyzer and GitHub Action for detecting Agentic Workflow Injection risks in AI-powered GitHub Actions workflows.

`agentic-workflow-guard` is not an AI PR reviewer, an AGENTS.md linter, an MCP scanner, or a replacement for general GitHub Actions security scanners. It focuses on one boundary: untrusted GitHub event data reaching AI agent prompts, then flowing into write permissions, scripts, release commands, or secrets.

Use zizmor for general GitHub Actions security. Use agentic-workflow-guard for AI-agent-specific workflow injection paths.

## Why this exists

AI coding agents are moving into CI for issue triage, PR review, code changes, release notes, and repository automation. That creates a new workflow-level attack path:

1. A user-controlled issue, PR body, comment, branch name, or commit message is passed into an AI prompt.
2. The AI step runs with a privileged GitHub token or sensitive secrets.
3. Agent-derived output is consumed by a later `run:` step, GitHub CLI command, release command, package publish, or cloud CLI.

This project detects those paths with deterministic static analysis. It does not require an API key and does not send workflow contents to a model.

## Install

```bash
npm install --save-dev agentic-workflow-guard
```

For local development in this repository:

```bash
npm install
npm run build
npm test
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## CLI usage

```bash
npx agentic-workflow-guard scan
npx agentic-workflow-guard scan .github/workflows
npx agentic-workflow-guard scan --format markdown
npx agentic-workflow-guard scan --format json
npx agentic-workflow-guard scan --format sarif --output awi-guard.sarif
npx agentic-workflow-guard scan --fail-on high
```

Supported options:

| Option | Values | Default |
| --- | --- | --- |
| `--path` or positional path | file, directory, or glob | `.github/workflows` |
| `--format` | `markdown`, `json`, `sarif` | `markdown` |
| `--output` | file path | stdout |
| `--fail-on` | `low`, `medium`, `high`, `critical`, `never` | `high` |
| `--config` | reserved | none |
| `--baseline` | reserved | none |
| `--no-color` | reserved | false |
| `--verbose` | true or false | false |

## GitHub Action usage

The action syntax below is the planned v0 release form. Do not use the `jinyounghub/agentic-workflow-guard@v0` reference until the repository is public and the tag exists.

```yaml
name: Agentic Workflow Guard

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  security-events: write

jobs:
  awi-guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: jinyounghub/agentic-workflow-guard@v0
        with:
          paths: .github/workflows
          fail-on: high
          format: sarif
          output: awi-guard.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: awi-guard.sarif
```

## Rules

| Rule | Severity | Detects |
| --- | --- | --- |
| `R001` | Low | AI-related GitHub Action inventory |
| `R101` | High | Untrusted issue, PR, comment, commit, or dispatch input reaching an AI prompt |
| `R102` | Medium/High | AI step in a job with write-scoped token permissions |
| `R103` | High/Critical | AI action running in `pull_request_target` |
| `R104` | High/Critical | AI step output consumed by a later `run:` step |
| `R105` | High/Critical | AI output reaching sensitive sinks such as `gh pr merge`, `git push`, `npm publish`, cloud CLIs, or deployment commands |
| `R106` | High/Critical | `pull_request_target` or `workflow_run` checking out PR head code |
| `R107` | Medium | AI action not pinned to a full commit SHA |
| `R108` | Medium | AI workflow without explicit `permissions` |
| `R109` | Medium/High/Critical | Secrets exposed directly to an AI action environment |

Severity is intentionally conservative. High and critical findings represent paths where untrusted text, privileged tokens, scripts, or secrets can meet. Medium findings are hardening gaps that often become high risk when combined with other workflow choices.

## Current AI action catalog

The initial catalog includes verified public action names:

- `openai/codex-action`
- `anthropics/claude-code-action`
- `google-github-actions/run-gemini-cli`
- `actions/ai-inference`

The scanner also has a low-confidence pattern detector for action names containing terms such as `codex`, `claude`, `gemini`, `copilot`, `llm`, `openai`, or `anthropic`.

## False positives

This project is conservative by design. Common false positive areas:

- A prompt contains PR text but the agent is truly sandboxed and read-only.
- AI output is printed as data in a later `run:` step.
- A provider API key is necessary for the AI action and is isolated from other secrets.
- A version tag is protected by repository policy even though it is not a full SHA.

For v0.1.0, suppressions are intentionally not implemented. Prefer narrowing workflow permissions and splitting untrusted analysis from privileged writes. Baseline and inline suppression support are planned.

## How this differs from nearby tools

- `zizmor`, `poutine`, and other workflow scanners cover broad GitHub Actions supply-chain risks. This tool focuses on AI prompt boundaries and agent-derived data flow.
- `actionlint` validates workflow syntax, expressions, and action metadata. This tool looks for AI-specific security paths.
- Snyk `agent-scan` and Ramparts focus on AI agent configuration, MCP servers, skills, and tool poisoning. This tool focuses on GitHub Actions workflows.
- AgentLint and AgentLinter focus on agent instruction/config files. This tool focuses on CI workflow execution boundaries.
- PR-Agent and similar tools perform AI review. This tool reviews the workflow that runs AI tools.

## Responsible use

Only scan repositories you own or are authorized to assess. Do not use this project to mass-report public repository issues or generate exploit payloads. The test suite uses synthetic vulnerable workflows only.

See [docs/responsible-disclosure.md](docs/responsible-disclosure.md) and [SECURITY.md](SECURITY.md).

## Development

```bash
npm install
npm run lint
npm test
npm run build
node dist/cli.js scan tests/fixtures --format markdown --fail-on never
```

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## License

MIT
