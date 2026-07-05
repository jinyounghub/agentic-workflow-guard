import { dynamicExecutionPattern } from "../catalog/sensitive-sinks.js";
import type { Rule, Severity } from "../types.js";
import {
  type AiDerivedReference,
  aiDerivedEvidence,
  findAiDerivedReferencesInRun,
  locationForEvidence,
  result,
} from "./shared.js";

export const promptToScriptRule: Rule = ({ workflow }) => {
  const findings = [];

  for (const aiStep of workflow.aiSteps) {
    for (const step of aiStep.job.steps) {
      if (step.index <= aiStep.step.index || !step.run) {
        continue;
      }

      const references = findAiDerivedReferencesInRun(step.run, aiStep.step, step.env);
      if (references.length === 0) {
        continue;
      }

      const severity = severityForRun(step.run, references);
      const location = locationForEvidence(workflow.file.content, step, references[0]?.raw);
      findings.push(
        result({
          id: "R104",
          title: "AI output flows into a script step",
          severity,
          confidence: "high",
          file: workflow.file.filePath,
          line: location.line,
          column: location.column,
          message: `A later run step consumes output from AI step "${aiStep.step.id}".`,
          evidence: aiDerivedEvidence(references, step),
          recommendation:
            "Treat AI output as untrusted data. Do not execute it directly; validate it, store it as an artifact, or require human approval before script execution.",
          references: ["https://arxiv.org/pdf/2605.07135"],
          tags: ["prompt-to-script", "data-flow", "ai-output"],
        }),
      );
    }
  }

  return findings;
};

function severityForRun(run: string, references: AiDerivedReference[]): Severity {
  if (hasDynamicAiDerivedUse(run, references)) {
    return "critical";
  }
  if (isRecognizedDataOnlyRun(run)) {
    return "medium";
  }
  return "high";
}

function hasDynamicAiDerivedUse(run: string, references: AiDerivedReference[]): boolean {
  if (dynamicExecutionPattern.test(run)) {
    return true;
  }
  if (!/(?:\$\(|`)/.test(run)) {
    return false;
  }
  return references.some(
    (reference) => run.includes(reference.raw) || run.includes(reference.source),
  );
}

function isRecognizedDataOnlyRun(run: string): boolean {
  if (dynamicExecutionPattern.test(run) || /(?:\$\(|`)/.test(run)) {
    return false;
  }

  const lines = run
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  return (
    lines.length > 0 &&
    lines.every(
      (line) => !/[|;&]/.test(line) && /^(?:echo\b|printf\b|mkdir\b|cat\s+<<|tee\b|:)/.test(line),
    )
  );
}
