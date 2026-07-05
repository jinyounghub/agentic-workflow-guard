import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as core from "@actions/core";
import { renderJsonReport } from "./json-report.js";
import { renderMarkdownReport } from "./markdown-report.js";
import { renderSarifReport } from "./sarif.js";
import { scan, shouldFail } from "./scanner.js";
async function run() {
    const paths = splitInput(core.getInput("paths") || ".github/workflows");
    const failOn = (core.getInput("fail-on") || "high");
    const format = (core.getInput("format") || "sarif");
    const output = core.getInput("output") || defaultOutput(format);
    const uploadSarif = core.getBooleanInput("upload-sarif", { required: false });
    const configPath = core.getInput("config") || undefined;
    const baselinePath = core.getInput("baseline") || undefined;
    const result = await scan({ paths, failOn, configPath, baselinePath });
    const report = renderReport(format, result);
    const outputPath = path.resolve(process.cwd(), output);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report, "utf8");
    core.setOutput("report-path", outputPath);
    core.setOutput("findings", String(result.summary.findings));
    core.setOutput("critical", String(result.summary.bySeverity.critical));
    core.setOutput("high", String(result.summary.bySeverity.high));
    core.setOutput("medium", String(result.summary.bySeverity.medium));
    core.setOutput("low", String(result.summary.bySeverity.low));
    const markdown = renderMarkdownReport(result);
    try {
        await core.summary.addRaw(markdown).write();
    }
    catch (error) {
        core.warning(`Could not write GitHub job summary: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (uploadSarif) {
        core.warning("upload-sarif is a placeholder. Add github/codeql-action/upload-sarif after this action and pass the report path.");
    }
    if (shouldFail(result.results, failOn)) {
        core.setFailed(`agentic-workflow-guard found findings at or above ${failOn}.`);
    }
}
function renderReport(format, result) {
    if (format === "json") {
        return renderJsonReport(result);
    }
    if (format === "markdown") {
        return renderMarkdownReport(result);
    }
    return renderSarifReport(result);
}
function defaultOutput(format) {
    if (format === "json") {
        return "awi-guard.json";
    }
    if (format === "markdown") {
        return "awi-guard.md";
    }
    return "awi-guard.sarif";
}
function splitInput(value) {
    return value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
}
run().catch((error) => {
    core.setFailed(error instanceof Error ? error.message : String(error));
});
//# sourceMappingURL=action.js.map