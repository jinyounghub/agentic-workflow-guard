import { effectivePermissions, permissionsSeverity, result, writePermissions } from "./shared.js";
export const privilegedAgentTokenRule = ({ workflow }) => {
    const findings = [];
    for (const aiStep of workflow.aiSteps) {
        const writes = writePermissions(effectivePermissions(workflow, aiStep.job));
        if (writes.length === 0) {
            continue;
        }
        findings.push(result({
            id: "R102",
            title: "AI agent has write-scoped token permissions",
            severity: permissionsSeverity(writes),
            confidence: "high",
            file: workflow.file.filePath,
            line: aiStep.step.line,
            column: aiStep.step.column,
            message: `AI action in job ${aiStep.job.id} can run with write permissions: ${writes.join(", ")}.`,
            evidence: writes.map((permission) => `${permission}: write`),
            recommendation: "Start with top-level permissions: contents: read, then grant write scopes only to narrow non-AI jobs after explicit review gates.",
            references: [
                "https://docs.github.com/en/actions/security-guides/automatic-token-authentication",
            ],
            tags: ["permissions", "over-privileged-agent"],
        }));
    }
    return findings;
};
//# sourceMappingURL=privileged-agent-token.js.map