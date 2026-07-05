import type { ParsedWorkflow, RuleResult, Severity, WorkflowJob, WorkflowStep } from "../types.js";
export declare const sensitiveWritePermissions: string[];
export declare function result(input: Omit<RuleResult, "references" | "tags"> & {
    references?: string[];
    tags?: string[];
}): RuleResult;
export declare function effectivePermissions(workflow: ParsedWorkflow, job: WorkflowJob): unknown;
export declare function hasExplicitPermissions(workflow: ParsedWorkflow, job: WorkflowJob): boolean;
export declare function writePermissions(value: unknown): string[];
export declare function permissionsSeverity(writes: string[]): Severity;
export declare function aiOutputExpression(step: WorkflowStep): RegExp | undefined;
export declare function findAiOutputReferences(command: string, step: WorkflowStep): string[];
export interface AiDerivedReference {
    kind: "step-output" | "env";
    raw: string;
    source: string;
    stepId: string;
    outputName: string;
    envName?: string;
    flow: string;
}
export declare function findAiDerivedReferencesInRun(run: string, aiStep: WorkflowStep, stepEnv?: Record<string, unknown>): AiDerivedReference[];
export declare function aiDerivedEvidence(references: AiDerivedReference[], step: WorkflowStep): string[];
export declare function hasPrHeadCheckout(workflow: ParsedWorkflow): boolean;
export declare function pwnRequestCheckoutSteps(workflow: ParsedWorkflow): WorkflowStep[];
export declare function isCheckoutStep(step: WorkflowStep): boolean;
export declare function checkoutTargetsPullRequestHead(step: WorkflowStep): boolean;
export declare function locationForEvidence(content: string, step: WorkflowStep, evidence: string): {
    line: number;
    column: number;
};
export declare function usesRefIsPinnedToSha(uses: string): boolean;
export declare function usesRefLooksFloating(uses: string): boolean;
export declare function relativeEvidencePath(file: string): string;
