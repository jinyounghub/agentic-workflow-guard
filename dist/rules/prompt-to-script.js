import { dynamicExecutionPattern } from "../catalog/sensitive-sinks.js";
import { findAiOutputReferences, locationForEvidence, result } from "./shared.js";
export const promptToScriptRule = ({ workflow }) => {
    const findings = [];
    for (const aiStep of workflow.aiSteps) {
        for (const step of aiStep.job.steps) {
            if (step.index <= aiStep.step.index || !step.run) {
                continue;
            }
            const references = findAiOutputReferences(step.run, aiStep.step);
            if (references.length === 0) {
                continue;
            }
            const severity = dynamicExecutionPattern.test(step.run) ? "critical" : "high";
            const location = locationForEvidence(workflow.file.content, step, references[0]);
            findings.push(result({
                id: "R104",
                title: "AI output flows into a script step",
                severity,
                confidence: "high",
                file: workflow.file.filePath,
                line: location.line,
                column: location.column,
                message: `A later run step consumes output from AI step "${aiStep.step.id}".`,
                evidence: references,
                recommendation: "Treat AI output as untrusted data. Do not execute it directly; validate it, store it as an artifact, or require human approval before script execution.",
                references: ["https://arxiv.org/pdf/2605.07135"],
                tags: ["prompt-to-script", "data-flow", "ai-output"],
            }));
        }
    }
    return findings;
};
//# sourceMappingURL=prompt-to-script.js.map