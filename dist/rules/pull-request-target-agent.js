import { effectivePermissions, hasPrHeadCheckout, result, writePermissions } from "./shared.js";
export const pullRequestTargetAgentRule = ({ workflow }) => {
    if (!workflow.triggers.includes("pull_request_target") || workflow.aiSteps.length === 0) {
        return [];
    }
    const hasPwnCheckout = hasPrHeadCheckout(workflow);
    return workflow.aiSteps.map((aiStep) => {
        const writes = writePermissions(effectivePermissions(workflow, aiStep.job));
        const hasWrite = writes.length > 0;
        const severity = hasPwnCheckout || hasWrite ? "critical" : "high";
        return result({
            id: "R103",
            title: "AI action runs on pull_request_target",
            severity,
            confidence: "high",
            file: workflow.file.filePath,
            line: aiStep.step.line,
            column: aiStep.step.column,
            message: "AI action executes in a pull_request_target workflow, where base repository token and secret boundaries are easy to misuse.",
            evidence: [
                "on: pull_request_target",
                ...(hasPwnCheckout ? ["PR head checkout pattern also detected"] : []),
                ...writes.map((permission) => `${permission}: write`),
            ],
            recommendation: "Prefer pull_request for untrusted PR analysis. If pull_request_target is required, avoid checking out fork code and keep AI steps read-only with explicit maintainer approval before writes.",
            references: [
                "https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/",
                "https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target",
            ],
            tags: ["pull_request_target", "prompt-to-agent", "pwn-request"],
        });
    });
};
//# sourceMappingURL=pull-request-target-agent.js.map