import { findAiAction } from "../catalog/ai-actions.js";
import { result, usesRefLooksFloating } from "./shared.js";
export const floatingActionVersionRule = ({ workflow }) => {
    const findings = [];
    for (const job of workflow.jobs) {
        for (const step of job.steps) {
            if (!step.uses || !usesRefLooksFloating(step.uses)) {
                continue;
            }
            const aiAction = findAiAction(step.uses);
            if (!aiAction) {
                continue;
            }
            findings.push(result({
                id: "R107",
                title: "AI action uses a floating version",
                severity: "medium",
                confidence: aiAction.confidence,
                file: workflow.file.filePath,
                line: step.line,
                column: step.column,
                message: `AI action ${aiAction.owner}/${aiAction.repo} is not pinned to a full commit SHA.`,
                evidence: [`uses: ${step.uses}`],
                recommendation: "Pin third-party AI actions to a full commit SHA and review updates intentionally.",
                references: [
                    "https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions",
                ],
                tags: ["supply-chain", "pinning", "ai-action"],
            }));
        }
    }
    return findings;
};
//# sourceMappingURL=floating-action-version.js.map