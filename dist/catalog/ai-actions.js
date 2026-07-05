export const aiActionCatalog = [
    {
        owner: "openai",
        repo: "codex-action",
        kind: "coding-agent",
        knownInputsPromptBoundary: ["prompt", "prompt-file", "codex-args"],
        knownOutputsAgentDerived: ["final-message"],
        knownAuthInputs: ["openai-api-key"],
        knownSecretEnv: [],
        defaultCapabilities: ["repository-read", "optional-code-changes", "tool-use"],
        docsUrl: "https://github.com/openai/codex-action",
        sourceUrl: "https://github.com/openai/codex-action",
        actionYmlUrl: "https://github.com/openai/codex-action/blob/main/action.yml",
        lastVerified: "2026-07-05",
        verificationNotes: "Verified against the public repository action.yml.",
        notes: "Runs Codex from GitHub Actions with a configurable prompt and provider API key.",
    },
    {
        owner: "anthropics",
        repo: "claude-code-action",
        kind: "coding-agent",
        knownInputsPromptBoundary: ["prompt", "settings", "claude_args"],
        knownOutputsAgentDerived: ["execution_file", "structured_output"],
        knownAuthInputs: [
            "anthropic_api_key",
            "claude_code_oauth_token",
            "anthropic_federation_rule_id",
            "anthropic_organization_id",
            "anthropic_service_account_id",
            "anthropic_workspace_id",
            "anthropic_oidc_audience",
            "github_token",
        ],
        knownSecretEnv: [],
        defaultCapabilities: ["repository-read", "optional-code-changes", "github-api"],
        docsUrl: "https://github.com/anthropics/claude-code-action",
        sourceUrl: "https://github.com/anthropics/claude-code-action",
        actionYmlUrl: "https://github.com/anthropics/claude-code-action/blob/main/action.yml",
        lastVerified: "2026-07-05",
        verificationNotes: "Verified against the public repository action.yml.",
        notes: "Runs Claude Code for issue, PR, and custom automation workflows.",
    },
    {
        owner: "google-github-actions",
        repo: "run-gemini-cli",
        kind: "coding-agent",
        knownInputsPromptBoundary: ["prompt", "settings"],
        knownOutputsAgentDerived: ["summary", "error"],
        knownAuthInputs: [
            "gemini_api_key",
            "google_api_key",
            "gcp_service_account",
            "gcp_workload_identity_provider",
            "gcp_token_format",
            "gcp_access_token_scopes",
        ],
        knownSecretEnv: [],
        defaultCapabilities: ["repository-read", "optional-code-changes", "github-api"],
        docsUrl: "https://github.com/google-github-actions/run-gemini-cli",
        sourceUrl: "https://github.com/google-github-actions/run-gemini-cli",
        actionYmlUrl: "https://github.com/google-github-actions/run-gemini-cli/blob/main/action.yml",
        lastVerified: "2026-07-05",
        verificationNotes: "Verified against the public repository action.yml.",
        notes: "Runs Gemini CLI from GitHub Actions as an autonomous or on-demand collaborator.",
    },
    {
        owner: "actions",
        repo: "ai-inference",
        kind: "ai-inference",
        knownInputsPromptBoundary: ["prompt", "prompt-file", "system-prompt", "system-prompt-file"],
        knownOutputsAgentDerived: ["response", "response-file"],
        knownAuthInputs: ["token", "github-mcp-token"],
        knownSecretEnv: [],
        defaultCapabilities: ["models-read"],
        docsUrl: "https://github.com/actions/ai-inference",
        sourceUrl: "https://github.com/actions/ai-inference",
        marketplaceUrl: "https://github.com/marketplace/actions/ai-inference",
        actionYmlUrl: "https://github.com/actions/ai-inference/blob/main/action.yml",
        lastVerified: "2026-07-05",
        verificationNotes: "Verified against the public repository action.yml.",
        notes: "GitHub Models AI inference action. It is model inference rather than a coding agent, but prompt-to-script paths still matter.",
    },
];
const aiNamePattern = /\b(codex|claude|gemini|copilot|llm|openai|anthropic|ai-inference)\b/i;
export function parseUses(value) {
    if (!value ||
        value.startsWith("./") ||
        value.startsWith("../") ||
        value.startsWith("docker://")) {
        return undefined;
    }
    const [repository, ref] = value.split("@", 2);
    const parts = repository.split("/");
    if (parts.length < 2) {
        return undefined;
    }
    return {
        owner: parts[0].toLowerCase(),
        repo: parts[1].toLowerCase(),
        ref,
    };
}
export function findAiAction(uses) {
    const parsed = parseUses(uses);
    if (!parsed) {
        return undefined;
    }
    const catalogEntry = aiActionCatalog.find((entry) => entry.owner === parsed.owner && entry.repo === parsed.repo);
    if (catalogEntry) {
        return {
            owner: parsed.owner,
            repo: parsed.repo,
            ref: parsed.ref,
            confidence: "high",
            source: "catalog",
            catalogEntry,
        };
    }
    const joined = `${parsed.owner}/${parsed.repo}`;
    const patternMatch = joined.match(aiNamePattern);
    if (patternMatch) {
        return {
            owner: parsed.owner,
            repo: parsed.repo,
            ref: parsed.ref,
            confidence: "low",
            source: "pattern",
            matchedPattern: patternMatch[1].toLowerCase(),
        };
    }
    return undefined;
}
export function promptBoundaryInputNames(match) {
    const catalogNames = match.catalogEntry?.knownInputsPromptBoundary ?? [];
    return [
        ...new Set([
            ...catalogNames,
            "prompt",
            "prompts",
            "instruction",
            "instructions",
            "task",
            "message",
            "query",
            "body",
            "comment",
            "review",
            "request",
        ]),
    ];
}
//# sourceMappingURL=ai-actions.js.map