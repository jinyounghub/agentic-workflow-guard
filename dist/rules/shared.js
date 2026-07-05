import { parseUses } from "../catalog/ai-actions.js";
import { extractStepOutputReferences } from "../expressions.js";
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
export function result(input) {
    return {
        ...input,
        references: input.references ?? [],
        tags: input.tags ?? [],
    };
}
export function effectivePermissions(workflow, job) {
    return job.permissions ?? workflow.topLevelPermissions;
}
export function hasExplicitPermissions(workflow, job) {
    return job.permissions !== undefined || workflow.topLevelPermissions !== undefined;
}
export function writePermissions(value) {
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
export function permissionsSeverity(writes) {
    if (writes.some((permission) => ["actions", "contents", "id-token", "packages"].includes(permission))) {
        return "high";
    }
    return "medium";
}
export function aiOutputExpression(step) {
    if (!step.id) {
        return undefined;
    }
    return new RegExp(String.raw `\$\{\{\s*steps\.${escapeRegExp(step.id)}\.outputs\.[A-Za-z0-9_-]+\s*\}\}`, "g");
}
export function findAiOutputReferences(command, step) {
    const pattern = aiOutputExpression(step);
    if (!pattern) {
        return [];
    }
    return [...command.matchAll(pattern)].map((match) => match[0]);
}
export function findAiDerivedReferencesInRun(run, aiStep, stepEnv) {
    if (!aiStep.id) {
        return [];
    }
    const references = [];
    for (const reference of extractStepOutputReferences(run).filter((item) => item.stepId === aiStep.id)) {
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
        const outputReferences = extractStepOutputReferences(envText).filter((item) => item.stepId === aiStep.id);
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
export function aiDerivedEvidence(references, step) {
    const sinkName = step.name ?? step.id ?? `step ${step.index + 1}`;
    return references.flatMap((reference) => [
        `source: ${reference.source}`,
        `sink: run step "${sinkName}"`,
        `flow: ${reference.flow}`,
    ]);
}
export function hasPrHeadCheckout(workflow) {
    return pwnRequestCheckoutSteps(workflow).length > 0;
}
export function pwnRequestCheckoutSteps(workflow) {
    const matches = [];
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
export function isCheckoutStep(step) {
    const parsed = parseUses(step.uses);
    return parsed?.owner === "actions" && parsed.repo === "checkout";
}
export function checkoutTargetsPullRequestHead(step) {
    const ref = String(step.with?.ref ?? "");
    const repository = String(step.with?.repository ?? "");
    return (prHeadContextPattern.test(ref) ||
        prHeadContextPattern.test(repository) ||
        refsPullHeadPattern.test(ref) ||
        refsPullHeadPattern.test(repository));
}
export function locationForEvidence(content, step, evidence) {
    const location = findLineColumn(content, [evidence, step.uses, step.run, step.id, step.name]);
    return location;
}
export function usesRefIsPinnedToSha(uses) {
    const parsed = parseUses(uses);
    return Boolean(parsed?.ref && /^[a-f0-9]{40}$/i.test(parsed.ref));
}
export function usesRefLooksFloating(uses) {
    const parsed = parseUses(uses);
    if (!parsed?.ref) {
        return true;
    }
    if (usesRefIsPinnedToSha(uses)) {
        return false;
    }
    return /^(v?\d+|main|master|latest|stable|next|canary|beta|alpha)$/i.test(parsed.ref);
}
export function relativeEvidencePath(file) {
    return file.replace(/\\/g, "/");
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function formatStepOutputSource(reference) {
    return `steps.${reference.stepId}.outputs.${reference.outputName}`;
}
function runUsesEnvName(run, envName) {
    return envUsagePattern(envName).test(run);
}
function envUsageEvidence(run, envName) {
    return run.match(envUsagePattern(envName))?.[0];
}
function envUsagePattern(envName) {
    const escaped = escapeRegExp(envName);
    return new RegExp(String.raw `(?:\$\{${escaped}\}|\$${escaped}\b|\$env:${escaped}\b|%${escaped}%)`, "i");
}
function dedupeAiDerivedReferences(references) {
    const seen = new Set();
    const deduped = [];
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
const prHeadContextPattern = /github\.event\.pull_request\.head\.(?:sha|ref|repo\.full_name)|github\.head_ref/i;
const refsPullHeadPattern = /refs\/pull\/[^/]+\/(?:head|merge)/i;
//# sourceMappingURL=shared.js.map