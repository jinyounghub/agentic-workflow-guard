import type { Rule } from "../types.js";
import { result } from "./shared.js";

export const aiActionDetectedRule: Rule = ({ workflow }) =>
  workflow.aiSteps.map(({ job, step, action }) =>
    result({
      id: "R001",
      title: "AI action detected",
      severity: "low",
      confidence: action.confidence,
      file: workflow.file.filePath,
      line: step.line,
      column: step.column,
      message: `AI-related action ${action.owner}/${action.repo} is used in job ${job.id}.`,
      evidence: [
        `uses: ${step.uses ?? `${action.owner}/${action.repo}`}`,
        `source: ${action.source}`,
      ],
      recommendation:
        "Review the AI step prompt boundary, token permissions, secrets, and any downstream script usage.",
      references: [action.catalogEntry?.docsUrl ?? "https://docs.github.com/en/actions"],
      tags: ["ai-action", "inventory"],
    }),
  );
