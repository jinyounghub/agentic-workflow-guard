import { parseUses } from "../catalog/ai-actions.js";
import { type StepOutputReference, extractStepOutputReferences } from "../expressions.js";
import type { ParsedWorkflow, RuleResult, Severity, WorkflowJob, WorkflowStep } from "../types.js";
import { findLineColumn, isRecord, scalarToString } from "../workflow-parser.js";

export const sensitiveWritePermissions = [
  "actions",
  "checks",
  "contents",
  "deployments",
  "discussions",
  "id-token",
  "issues",
  "packages",
  "pages",
  "pull-requests",
  "repository-projects",
  "security-events",
  "statuses",
];

export function result(
  input: Omit<RuleResult, "references" | "tags"> & {
    references?: string[];
    tags?: string[];
  },
): RuleResult {
  return {
    ...input,
    references: input.references ?? [],
    tags: input.tags ?? [],
  };
}

export function effectivePermissions(workflow: ParsedWorkflow, job: WorkflowJob): unknown {
  return job.permissions ?? workflow.topLevelPermissions;
}

export function hasExplicitPermissions(workflow: ParsedWorkflow, job: WorkflowJob): boolean {
  return job.permissions !== undefined || workflow.topLevelPermissions !== undefined;
}

export function writePermissions(value: unknown): string[] {
  if (value === "write-all") {
    return [...sensitiveWritePermissions];
  }
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .filter(([, permissionValue]) => permissionValue === "write")
    .map(([permissionName]) => permissionName);
}

export function permissionsSeverity(writes: string[]): Severity {
  if (
    writes.some((permission) =>
      ["actions", "contents", "id-token", "packages"].includes(permission),
    )
  ) {
    return "high";
  }
  return "medium";
}

export function aiOutputExpression(step: WorkflowStep): RegExp | undefined {
  if (!step.id) {
    return undefined;
  }
  return new RegExp(
    String.raw`\$\{\{\s*steps\.${escapeRegExp(step.id)}\.outputs\.[A-Za-z0-9_-]+\s*\}\}`,
    "g",
  );
}

export function findAiOutputReferences(command: string, step: WorkflowStep): string[] {
  const pattern = aiOutputExpression(step);
  if (!pattern) {
    return [];
  }
  return [...command.matchAll(pattern)].map((match) => match[0]);
}

export interface AiDerivedReference {
  kind: "step-output" | "env";
  raw: string;
  source: string;
  stepId: string;
  outputName: string;
  envName?: string;
  flow: string;
}

export function findAiDerivedReferencesInRun(
  run: string,
  aiStep: WorkflowStep,
  stepEnv?: Record<string, unknown>,
): AiDerivedReference[] {
  if (!aiStep.id) {
    return [];
  }

  const references: AiDerivedReference[] = [];
  for (const reference of extractStepOutputReferences(run).filter(
    (item) => item.stepId === aiStep.id,
  )) {
    references.push({
      kind: "step-output",
      raw: reference.expression?.raw ?? reference.raw,
      source: formatStepOutputSource(reference),
      stepId: reference.stepId,
      outputName: reference.outputName,
      flow: "direct expression -> run",
    });
  }

  for (const [envName, envValue] of Object.entries(stepEnv ?? {})) {
    const envText = scalarToString(envValue);
    if (!envText) {
      continue;
    }

    const outputReferences = extractStepOutputReferences(envText).filter(
      (item) => item.stepId === aiStep.id,
    );
    if (outputReferences.length === 0 || !runUsesEnvName(run, envName)) {
      continue;
    }

    for (const reference of outputReferences) {
      references.push({
        kind: "env",
        raw: envUsageEvidence(run, envName) ?? envName,
        source: formatStepOutputSource(reference),
        stepId: reference.stepId,
        outputName: reference.outputName,
        envName,
        flow: `env ${envName} -> ${envUsageEvidence(run, envName) ?? "run"}`,
      });
    }
  }

  return dedupeAiDerivedReferences(references);
}

export function aiDerivedEvidence(references: AiDerivedReference[], step: WorkflowStep): string[] {
  const sinkName = step.name ?? step.id ?? `step ${step.index + 1}`;
  return references.flatMap((reference) => [
    `source: ${reference.source}`,
    `sink: run step "${sinkName}"`,
    `flow: ${reference.flow}`,
  ]);
}

export function hasPrHeadCheckout(workflow: ParsedWorkflow): boolean {
  return pwnRequestCheckoutSteps(workflow).length > 0;
}

export function pwnRequestCheckoutSteps(workflow: ParsedWorkflow): WorkflowStep[] {
  const matches: WorkflowStep[] = [];
  for (const job of workflow.jobs) {
    for (const step of job.steps) {
      if (isCheckoutStep(step) && checkoutTargetsPullRequestHead(step)) {
        matches.push(step);
      }
      if (step.run && refsPullHeadPattern.test(step.run)) {
        matches.push(step);
      }
    }
  }
  return matches;
}

export function isCheckoutStep(step: WorkflowStep): boolean {
  const parsed = parseUses(step.uses);
  return parsed?.owner === "actions" && parsed.repo === "checkout";
}

export function checkoutTargetsPullRequestHead(step: WorkflowStep): boolean {
  const ref = String(step.with?.ref ?? "");
  const repository = String(step.with?.repository ?? "");
  return (
    prHeadContextPattern.test(ref) ||
    prHeadContextPattern.test(repository) ||
    refsPullHeadPattern.test(ref) ||
    refsPullHeadPattern.test(repository)
  );
}

export function locationForEvidence(
  content: string,
  step: WorkflowStep,
  evidence: string,
): { line: number; column: number } {
  const location = findLineColumn(content, [evidence, step.uses, step.run, step.id, step.name]);
  return location;
}

export function usesRefIsPinnedToSha(uses: string): boolean {
  const parsed = parseUses(uses);
  return Boolean(parsed?.ref && /^[a-f0-9]{40}$/i.test(parsed.ref));
}

export function usesRefLooksFloating(uses: string): boolean {
  const parsed = parseUses(uses);
  if (!parsed?.ref) {
    return true;
  }
  if (usesRefIsPinnedToSha(uses)) {
    return false;
  }
  return /^(v?\d+|main|master|latest|stable|next|canary|beta|alpha)$/i.test(parsed.ref);
}

export function relativeEvidencePath(file: string): string {
  return file.replace(/\\/g, "/");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatStepOutputSource(reference: StepOutputReference): string {
  return `steps.${reference.stepId}.outputs.${reference.outputName}`;
}

function runUsesEnvName(run: string, envName: string): boolean {
  return envUsagePattern(envName).test(run);
}

function envUsageEvidence(run: string, envName: string): string | undefined {
  return run.match(envUsagePattern(envName))?.[0];
}

function envUsagePattern(envName: string): RegExp {
  const escaped = escapeRegExp(envName);
  return new RegExp(
    String.raw`(?:\$\{${escaped}\}|\$${escaped}\b|\$env:${escaped}\b|%${escaped}%)`,
    "i",
  );
}

function dedupeAiDerivedReferences(references: AiDerivedReference[]): AiDerivedReference[] {
  const seen = new Set<string>();
  const deduped: AiDerivedReference[] = [];
  for (const reference of references) {
    const key = [
      reference.kind,
      reference.raw,
      reference.source,
      reference.envName ?? "",
      reference.flow,
    ].join("\0");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(reference);
  }
  return deduped;
}

const prHeadContextPattern =
  /github\.event\.pull_request\.head\.(?:sha|ref|repo\.full_name)|github\.head_ref/i;
const refsPullHeadPattern = /refs\/pull\/[^/]+\/(?:head|merge)/i;
