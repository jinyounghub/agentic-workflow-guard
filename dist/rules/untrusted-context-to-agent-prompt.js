import { promptBoundaryInputNames } from "../catalog/ai-actions.js";
import { findUntrustedContexts } from "../catalog/untrusted-contexts.js";
import { findLineColumn } from "../workflow-parser.js";
import { result } from "./shared.js";
const promptNamePattern = /(prompt|instruction|task|message|query|body|comment|review|request)/i;
export const untrustedContextToAgentPromptRule = ({ workflow }) => {
    const findings = [];
    for (const aiStep of workflow.aiSteps) {
        const boundaryNames = promptBoundaryInputNames(aiStep.action).map((name) => name.toLowerCase());
        for (const [inputName, inputValue] of Object.entries(aiStep.step.with ?? {})) {
            const lowerName = inputName.toLowerCase();
            if (!boundaryNames.includes(lowerName) && !promptNamePattern.test(lowerName)) {
                continue;
            }
            const value = typeof inputValue === "string" ? inputValue : JSON.stringify(inputValue);
            if (!value) {
                continue;
            }
            const matches = findUntrustedContexts(value);
            if (matches.length === 0) {
                continue;
            }
            const location = findLineColumn(workflow.file.content, [value, inputName, aiStep.step.uses]);
            findings.push(result({
                id: "R101",
                title: "Untrusted GitHub context reaches AI prompt",
                severity: "high",
                confidence: matches.some((match) => match.confidence === "high") ? "high" : "medium",
                file: workflow.file.filePath,
                line: location.line,
                column: location.column,
                message: `AI action input "${inputName}" includes untrusted GitHub event context.`,
                evidence: matches.map((match) => `${match.expression}: ${match.reason}`),
                recommendation: "Do not pass raw issue, PR, comment, or commit content directly as agent instructions. Quote it as data, summarize in a read-only phase, or require maintainer approval before privileged steps.",
                references: [
                    "https://www.aikido.dev/blog/promptpwnd-github-actions-ai-agents",
                    "https://arxiv.org/pdf/2605.07135",
                ],
                tags: ["prompt-to-agent", "untrusted-context", "prompt-injection"],
            }));
        }
    }
    return findings;
};
//# sourceMappingURL=untrusted-context-to-agent-prompt.js.map