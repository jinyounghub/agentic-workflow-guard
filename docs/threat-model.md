# Threat Model

`agentic-workflow-guard` analyzes GitHub Actions workflow files for Agentic Workflow Injection risks. The scanner assumes workflow YAML is available locally and uses deterministic static analysis only.

## Assets

- Repository contents and protected branches
- `GITHUB_TOKEN` permissions
- Repository, organization, cloud, package registry, and deployment secrets
- Release, package, and deployment workflows
- Maintainer trust in AI-generated comments, patches, and commands

## Trust boundaries

Untrusted or semi-trusted data can enter a workflow through:

- Issue title and body
- Pull request title and body
- Issue and pull request comments
- Reviews and review comments
- Discussions and discussion comments
- Commit messages
- Pull request head refs, SHAs, and fork repository names
- `workflow_dispatch` inputs when caller access is unclear

AI agent prompts are a boundary because the model may interpret untrusted text as instructions. Agent outputs are another boundary because a later step may treat model output as a shell command, CLI argument, release note, or API request.

## Attack patterns

### 1. Prompt-to-Agent

Untrusted issue, PR, comment, or commit text is interpolated directly into an AI action prompt. The agent can mistake that text for instructions and perform privileged operations such as commenting, editing files, opening PRs, approving changes, or calling GitHub APIs.

The scanner flags this with `R101` and correlates it with `R102`, `R103`, `R108`, and `R109`.

### 2. Prompt-to-Script

Untrusted content reaches an AI prompt. The AI output is stored as a step output, environment value, or file. A later `run:` step consumes that output, especially through dynamic execution such as `bash -c`, `sh -c`, `eval`, `node -e`, or `python -c`.

The scanner flags this with `R104` and escalates when the command is dynamically executed.

### 3. AI output to sensitive sink

Agent-derived output is passed to commands such as `gh pr merge`, `gh release create`, `git push`, `npm publish`, `twine upload`, `docker push`, `aws`, `gcloud`, `az`, `kubectl`, or `helm upgrade`.

The scanner flags this with `R105`.

### 4. Pwn request

A `pull_request_target` or `workflow_run` workflow checks out fork PR head code while running with base repository token, secrets, or cache trust. This is dangerous even without AI, and more dangerous when AI automation is present in the same workflow.

The scanner flags this with `R106` and escalates when AI actions are also present.

### 5. Over-privileged AI agent

An AI action runs in a job with write permissions such as `contents: write`, `pull-requests: write`, `issues: write`, `actions: write`, `packages: write`, or `id-token: write`.

The scanner flags this with `R102`. Missing explicit permissions are flagged with `R108`.

### 6. Secret exposure

Secrets are injected into AI action environment variables. Provider API keys may be required, but cloud, package, deployment, GitHub, and broad token secrets should not be exposed to a prompt-processing step.

The scanner flags this with `R109`.

## Non-goals

- Perfect semantic analysis of LLM prompts
- Automatic exploit generation
- Automatic public vulnerability reporting
- MCP server internals analysis
- AI-generated code quality review
- Replacement for general GitHub Actions scanners

## Safer workflow pattern

Prefer a two-phase design:

1. Run untrusted PR, issue, or comment analysis in a read-only job with `permissions: contents: read`.
2. Store results as data, not commands.
3. Require maintainer approval or a separate trusted workflow before writes, releases, publishing, or deployments.
4. Keep AI provider secrets isolated from GitHub, cloud, package, and deployment credentials.
