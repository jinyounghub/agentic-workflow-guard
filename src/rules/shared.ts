import { parseUses } from "../catalog/ai-actions.js";
import type { ParsedWorkflow, RuleResult, Severity, WorkflowJob, WorkflowStep } from "../types.js";
import { findLineColumn, isRecord } from "../workflow-parser.js";

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

const prHeadContextPattern =
  /github\.event\.pull_request\.head\.(?:sha|ref|repo\.full_name)|github\.head_ref/i;
const refsPullHeadPattern = /refs\/pull\/[^/]+\/(?:head|merge)/i;
