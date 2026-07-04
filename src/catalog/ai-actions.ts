import type { AiActionCatalogEntry, AiActionMatch, Confidence } from "../types.js";

export const aiActionCatalog: AiActionCatalogEntry[] = [
  {
    owner: "openai",
    repo: "codex-action",
    knownInputsPromptBoundary: [
      "prompt",
      "task",
      "instruction",
      "instructions",
      "user-prompt",
      "user_prompt",
    ],
    knownOutputsAgentDerived: ["response", "result", "summary", "changes", "output"],
    defaultCapabilities: ["repository-read", "optional-code-changes", "tool-use"],
    docsUrl: "https://github.com/openai/codex-action",
    notes: "Runs Codex from GitHub Actions with a configurable prompt and provider API key.",
  },
  {
    owner: "anthropics",
    repo: "claude-code-action",
    knownInputsPromptBoundary: [
      "prompt",
      "direct_prompt",
      "custom_instructions",
      "instructions",
      "claude_args",
    ],
    knownOutputsAgentDerived: ["response", "result", "conclusion", "summary"],
    defaultCapabilities: ["repository-read", "optional-code-changes", "github-api"],
    docsUrl: "https://github.com/anthropics/claude-code-action",
    notes: "Runs Claude Code for issue, PR, and custom automation workflows.",
  },
  {
    owner: "google-github-actions",
    repo: "run-gemini-cli",
    knownInputsPromptBoundary: ["prompt", "instructions", "settings", "gemini_cli_args"],
    knownOutputsAgentDerived: ["summary", "response", "output", "result"],
    defaultCapabilities: ["repository-read", "optional-code-changes", "github-api"],
    docsUrl: "https://github.com/google-github-actions/run-gemini-cli",
    notes: "Runs Gemini CLI from GitHub Actions as an autonomous or on-demand collaborator.",
  },
  {
    owner: "actions",
    repo: "ai-inference",
    knownInputsPromptBoundary: ["prompt", "system-prompt", "system_prompt"],
    knownOutputsAgentDerived: ["response"],
    defaultCapabilities: ["models-read"],
    docsUrl: "https://github.com/marketplace/actions/ai-inference",
    notes:
      "GitHub Models AI inference action. It is model inference rather than a coding agent, but prompt-to-script paths still matter.",
  },
];

const aiNamePattern = /\b(codex|claude|gemini|copilot|llm|openai|anthropic|ai-inference)\b/i;

export interface ParsedUses {
  owner: string;
  repo: string;
  ref?: string;
}

export function parseUses(value: string | undefined): ParsedUses | undefined {
  if (
    !value ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("docker://")
  ) {
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

export function findAiAction(uses: string | undefined): AiActionMatch | undefined {
  const parsed = parseUses(uses);
  if (!parsed) {
    return undefined;
  }

  const catalogEntry = aiActionCatalog.find(
    (entry) => entry.owner === parsed.owner && entry.repo === parsed.repo,
  );

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
  if (aiNamePattern.test(joined)) {
    return {
      owner: parsed.owner,
      repo: parsed.repo,
      ref: parsed.ref,
      confidence: "low" satisfies Confidence,
      source: "pattern",
    };
  }

  return undefined;
}

export function promptBoundaryInputNames(match: AiActionMatch): string[] {
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
