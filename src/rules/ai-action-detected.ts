import type { AiActionMatch, Rule, WorkflowStep } from "../types.js";
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
      evidence: aiActionEvidence(step, action),
      recommendation:
        "Review the AI step prompt boundary, token permissions, secrets, and any downstream script usage.",
      references: aiActionReferences(action),
      tags: ["ai-action", "inventory"],
    }),
  );

function aiActionEvidence(step: WorkflowStep, action: AiActionMatch): string[] {
  const evidence = [
    `uses: ${step.uses ?? `${action.owner}/${action.repo}`}`,
    `source: ${action.source}`,
    `confidence: ${action.confidence}`,
  ];

  if (action.catalogEntry) {
    evidence.push(
      `kind: ${action.catalogEntry.kind}`,
      `lastVerified: ${action.catalogEntry.lastVerified}`,
      `docs: ${action.catalogEntry.docsUrl}`,
    );
  }

  if (action.matchedPattern) {
    evidence.push(`matchedPattern: ${action.matchedPattern}`);
  }

  return evidence;
}

function aiActionReferences(action: AiActionMatch): string[] {
  if (!action.catalogEntry) {
    return ["https://docs.github.com/en/actions"];
  }

  return [
    action.catalogEntry.docsUrl,
    action.catalogEntry.sourceUrl,
    action.catalogEntry.actionYmlUrl,
  ].filter((url, index, urls) => urls.indexOf(url) === index);
}
