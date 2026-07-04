# Rule Catalog

## R001: AI action detected

Records AI-related actions for inventory and correlation.

- Severity: low
- Confidence: high for catalog matches, low for pattern matches
- Tags: `ai-action`, `inventory`

## R101: Untrusted GitHub context reaches AI prompt

Flags prompt-like AI action inputs containing untrusted GitHub event context such as issue bodies, PR bodies, comments, review comments, commit messages, sender login, PR head refs, or `inputs.*`.

- Severity: high
- Tags: `prompt-to-agent`, `untrusted-context`, `prompt-injection`

## R102: AI agent has write-scoped token permissions

Flags AI steps in jobs with write permissions. `contents`, `actions`, `packages`, and `id-token` write scopes are treated as higher risk.

- Severity: medium or high
- Tags: `permissions`, `over-privileged-agent`

## R103: AI action runs on pull_request_target

Flags AI actions in `pull_request_target` workflows. Escalates to critical when combined with write permissions or PR head checkout patterns.

- Severity: high or critical
- Tags: `pull_request_target`, `prompt-to-agent`, `pwn-request`

## R104: AI output flows into a script step

Flags `${{ steps.<ai-step>.outputs.* }}` references in later `run:` steps in the same job. Escalates to critical for dynamic execution patterns such as `bash -c`, `sh -c`, `eval`, `node -e`, or `python -c`.

- Severity: high or critical
- Tags: `prompt-to-script`, `data-flow`, `ai-output`

## R105: AI output flows into a sensitive sink

Flags AI output reaching privileged commands such as GitHub CLI writes, package publishing, container pushes, cloud CLIs, or deployment tools.

- Severity: high or critical
- Tags: `prompt-to-script`, `sensitive-sink`, `ai-output`

## R106: Privileged workflow checks out pull request head code

Flags PR head checkout in `pull_request_target` or `workflow_run` workflows, including `github.event.pull_request.head.sha`, `github.event.pull_request.head.repo.full_name`, and `refs/pull/*/head`.

- Severity: high, or critical when AI actions are present
- Tags: `pwn-request`, `pull_request_target`, `checkout`

## R107: AI action uses a floating version

Flags AI actions using floating refs such as `@v1`, `@v0`, `@main`, `@master`, `@latest`, `@stable`, or missing refs. Full 40-character commit SHAs are considered pinned.

- Severity: medium
- Tags: `supply-chain`, `pinning`, `ai-action`

## R108: AI workflow is missing explicit permissions

Flags AI jobs when neither workflow-level nor job-level `permissions` are declared.

- Severity: medium
- Tags: `permissions`, `least-privilege`

## R109: Secrets are exposed to an AI action

Flags `secrets.*` values in AI action `env`. Provider-only API keys are medium. GitHub, cloud, package, deployment, or multiple high-risk secrets are high or critical.

- Severity: medium, high, or critical
- Tags: `secrets`, `ai-action`, `exfiltration`
