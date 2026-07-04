import { pwnRequestCheckoutSteps, result } from "./shared.js";
export const pwnRequestCheckoutRule = ({ workflow }) => {
    if (!workflow.triggers.includes("pull_request_target") &&
        !workflow.triggers.includes("workflow_run")) {
        return [];
    }
    const checkoutSteps = pwnRequestCheckoutSteps(workflow);
    const hasAiAction = workflow.aiSteps.length > 0;
    const severity = hasAiAction ? "critical" : "high";
    return checkoutSteps.map((step) => result({
        id: "R106",
        title: "Privileged workflow checks out pull request head code",
        severity,
        confidence: "high",
        file: workflow.file.filePath,
        line: step.line,
        column: step.column,
        message: "A pull_request_target or workflow_run workflow appears to check out contributor-controlled PR head code.",
        evidence: [
            workflow.triggers.includes("pull_request_target")
                ? "on: pull_request_target"
                : "on: workflow_run",
            step.uses ? `uses: ${step.uses}` : "run step references refs/pull/*/head",
            ...(step.with?.ref ? [`ref: ${String(step.with.ref)}`] : []),
            ...(step.with?.repository ? [`repository: ${String(step.with.repository)}`] : []),
        ],
        recommendation: "Do not execute fork PR head code in privileged workflows. Check out the base ref for analysis, or split untrusted analysis and privileged writes into separate workflows.",
        references: [
            "https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/",
        ],
        tags: ["pwn-request", "pull_request_target", "checkout"],
    }));
};
//# sourceMappingURL=pwn-request-checkout.js.map