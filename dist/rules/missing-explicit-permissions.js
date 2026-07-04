import { hasExplicitPermissions, result } from "./shared.js";
export const missingExplicitPermissionsRule = ({ workflow }) => {
    const findings = [];
    for (const aiStep of workflow.aiSteps) {
        if (hasExplicitPermissions(workflow, aiStep.job)) {
            continue;
        }
        findings.push(result({
            id: "R108",
            title: "AI workflow is missing explicit permissions",
            severity: "medium",
            confidence: "high",
            file: workflow.file.filePath,
            line: aiStep.job.line,
            column: aiStep.job.column,
            message: `Job ${aiStep.job.id} uses an AI action without explicit workflow or job permissions.`,
            evidence: ["permissions key is absent at workflow and job level"],
            recommendation: "Declare top-level permissions: contents: read, then grant job-specific write scopes only where necessary.",
            references: [
                "https://docs.github.com/en/actions/security-guides/automatic-token-authentication",
            ],
            tags: ["permissions", "least-privilege"],
        }));
    }
    return findings;
};
//# sourceMappingURL=missing-explicit-permissions.js.map