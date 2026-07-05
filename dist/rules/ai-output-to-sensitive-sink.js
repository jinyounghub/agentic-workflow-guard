import { findSensitiveSinks } from "../catalog/sensitive-sinks.js";
import { aiDerivedEvidence, findAiDerivedReferencesInRun, locationForEvidence, result, } from "./shared.js";
export const aiOutputToSensitiveSinkRule = ({ workflow }) => {
    const findings = [];
    for (const aiStep of workflow.aiSteps) {
        for (const step of aiStep.job.steps) {
            if (step.index <= aiStep.step.index || !step.run) {
                continue;
            }
            const references = findAiDerivedReferencesInRun(step.run, aiStep.step, step.env);
            if (references.length === 0) {
                continue;
            }
            const sinks = findSensitiveSinks(step.run);
            if (sinks.length === 0) {
                continue;
            }
            const severity = sinks.some((sink) => sink.severity === "critical")
                ? "critical"
                : "high";
            const location = locationForEvidence(workflow.file.content, step, references[0]?.raw);
            findings.push(result({
                id: "R105",
                title: "AI output flows into a sensitive sink",
                severity,
                confidence: "high",
                file: workflow.file.filePath,
                line: location.line,
                column: location.column,
                message: "Agent-derived output is passed to a privileged CLI or deployment command.",
                evidence: [
                    ...aiDerivedEvidence(references, step),
                    ...sinks.map((sink) => `sink: ${sink.label} - ${sink.reason}`),
                ],
                recommendation: "Separate AI analysis from privileged operations. Use allowlisted commands, human approval, and typed inputs rather than free-form model output.",
                references: ["https://arxiv.org/pdf/2605.07135"],
                tags: ["prompt-to-script", "sensitive-sink", "ai-output"],
            }));
        }
    }
    return findings;
};
//# sourceMappingURL=ai-output-to-sensitive-sink.js.map