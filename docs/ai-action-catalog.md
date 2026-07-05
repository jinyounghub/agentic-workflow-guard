# AI Action Catalog

The scanner uses a small verified catalog for high-confidence AI action detection.
Entries in this file are based on public action metadata from each official GitHub
repository. The catalog is intentionally conservative: it records action names,
prompt-like inputs, documented outputs, and authentication-related inputs that are
useful for workflow review.

Last verified: 2026-07-05

| Action | Kind | Prompt boundary inputs | Agent-derived outputs | Auth/token inputs | Verified source |
| --- | --- | --- | --- | --- | --- |
| `openai/codex-action` | Coding agent | `prompt`, `prompt-file`, `codex-args` | `final-message` | `openai-api-key` | [repository](https://github.com/openai/codex-action), [action.yml](https://github.com/openai/codex-action/blob/main/action.yml) |
| `anthropics/claude-code-action` | Coding agent | `prompt`, `settings`, `claude_args` | `execution_file`, `structured_output` | `anthropic_api_key`, `claude_code_oauth_token`, `anthropic_federation_rule_id`, `anthropic_organization_id`, `anthropic_service_account_id`, `anthropic_workspace_id`, `anthropic_oidc_audience`, `github_token` | [repository](https://github.com/anthropics/claude-code-action), [action.yml](https://github.com/anthropics/claude-code-action/blob/main/action.yml) |
| `google-github-actions/run-gemini-cli` | Coding agent | `prompt`, `settings` | `summary`, `error` | `gemini_api_key`, `google_api_key`, `gcp_service_account`, `gcp_workload_identity_provider`, `gcp_token_format`, `gcp_access_token_scopes` | [repository](https://github.com/google-github-actions/run-gemini-cli), [action.yml](https://github.com/google-github-actions/run-gemini-cli/blob/main/action.yml) |
| `actions/ai-inference` | AI inference | `prompt`, `prompt-file`, `system-prompt`, `system-prompt-file` | `response`, `response-file` | `token`, `github-mcp-token` | [repository](https://github.com/actions/ai-inference), [action.yml](https://github.com/actions/ai-inference/blob/main/action.yml), [marketplace](https://github.com/marketplace/actions/ai-inference) |

## Detection Behavior

Catalog matches are reported as high-confidence `R001` findings with the action
kind, last verification date, and public documentation URL in evidence.

The scanner also has a low-confidence pattern detector for action names containing
terms such as `codex`, `claude`, `gemini`, `copilot`, `llm`, `openai`, or
`anthropic`. Pattern findings include the matched term in evidence so reviewers can
quickly decide whether the action should be added to the catalog or ignored.

## Maintenance Notes

- Use public official repositories or action metadata as the source of truth.
- Prefer exact action input and output names from `action.yml` over guessed generic names.
- Keep synthetic fixtures for tests. Do not include real third-party finding details.
- Keep adoption metrics separate from catalog metadata unless public evidence exists.
