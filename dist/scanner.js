import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { rules } from "./rules/index.js";
import { emptySeverityCounts, isAtLeastSeverity } from "./types.js";
import { parseWorkflowFile } from "./workflow-parser.js";
const workflowGlob = ["**/*.yml", "**/*.yaml"];
export async function scan(options = {}) {
    const cwd = options.cwd ?? process.cwd();
    const files = await collectWorkflowFiles(options.paths ?? [".github/workflows"], cwd);
    const workflows = [];
    const results = [];
    for (const file of files) {
        const content = await readFile(file, "utf8");
        try {
            const workflow = parseWorkflowFile(file, content);
            workflows.push(workflow);
            for (const rule of rules) {
                results.push(...rule({ workflow }));
            }
        }
        catch (error) {
            results.push(parseErrorResult(file, error));
        }
    }
    return {
        workflows,
        results: sortResults(results),
        summary: summarize(files.length, results),
    };
}
export function shouldFail(results, threshold) {
    return results.some((finding) => isAtLeastSeverity(finding.severity, threshold));
}
async function collectWorkflowFiles(inputs, cwd) {
    const files = new Set();
    for (const input of inputs.filter(Boolean)) {
        const resolved = path.resolve(cwd, input);
        if (await exists(resolved)) {
            const details = await stat(resolved);
            if (details.isDirectory()) {
                const matches = await fg(workflowGlob, {
                    cwd: resolved,
                    absolute: true,
                    onlyFiles: true,
                    dot: true,
                });
                for (const match of matches) {
                    files.add(path.normalize(match));
                }
            }
            else if (details.isFile() && /\.(ya?ml)$/i.test(resolved)) {
                files.add(path.normalize(resolved));
            }
            continue;
        }
        const matches = await fg(input, {
            cwd,
            absolute: true,
            onlyFiles: true,
            dot: true,
        });
        for (const match of matches.filter((candidate) => /\.(ya?ml)$/i.test(candidate))) {
            files.add(path.normalize(match));
        }
    }
    return [...files].sort();
}
async function exists(file) {
    try {
        await access(file);
        return true;
    }
    catch {
        return false;
    }
}
function parseErrorResult(file, error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
        id: "R000",
        title: "Workflow YAML parse error",
        severity: "critical",
        confidence: "high",
        file,
        line: 1,
        column: 1,
        message: `Could not parse workflow YAML: ${message}`,
        evidence: [message],
        recommendation: "Fix the workflow YAML syntax before running agentic-workflow-guard again.",
        references: ["https://yaml.org/spec/"],
        tags: ["parser", "yaml"],
    };
}
function summarize(filesScanned, results) {
    const bySeverity = emptySeverityCounts();
    for (const result of results) {
        bySeverity[result.severity] += 1;
    }
    return {
        filesScanned,
        findings: results.length,
        bySeverity,
    };
}
function sortResults(results) {
    const severityWeight = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
    };
    return [...results].sort((left, right) => {
        const severity = severityWeight[left.severity] - severityWeight[right.severity];
        if (severity !== 0) {
            return severity;
        }
        const file = left.file.localeCompare(right.file);
        if (file !== 0) {
            return file;
        }
        return left.line - right.line || left.column - right.column || left.id.localeCompare(right.id);
    });
}
//# sourceMappingURL=scanner.js.map