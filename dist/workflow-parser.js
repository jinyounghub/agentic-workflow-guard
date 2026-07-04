import { parse as parseYaml } from "yaml";
import { findAiAction } from "./catalog/ai-actions.js";
export function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function asString(value) {
    return typeof value === "string" ? value : undefined;
}
export function asRecord(value) {
    return isRecord(value) ? value : undefined;
}
export function scalarToString(value) {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    return undefined;
}
export function findLineColumn(content, needles) {
    for (const needle of needles) {
        if (!needle) {
            continue;
        }
        const index = content.indexOf(needle);
        if (index >= 0) {
            const before = content.slice(0, index);
            const lines = before.split(/\r\n|\r|\n/);
            return {
                line: lines.length,
                column: lines[lines.length - 1].length + 1,
            };
        }
    }
    return { line: 1, column: 1 };
}
export function collectTriggers(onValue) {
    if (typeof onValue === "string") {
        return [onValue];
    }
    if (Array.isArray(onValue)) {
        return onValue.filter((item) => typeof item === "string");
    }
    if (isRecord(onValue)) {
        return Object.keys(onValue);
    }
    return [];
}
function parseSteps(job, stepsValue, content) {
    if (!Array.isArray(stepsValue)) {
        return [];
    }
    return stepsValue.flatMap((stepValue, index) => {
        const raw = asRecord(stepValue);
        if (!raw) {
            return [];
        }
        const id = asString(raw.id);
        const name = asString(raw.name);
        const uses = asString(raw.uses);
        const run = asString(raw.run);
        const location = findLineColumn(content, [uses, run, id, name]);
        return [
            {
                id,
                name,
                uses,
                run,
                with: asRecord(raw.with),
                env: asRecord(raw.env),
                raw,
                index,
                line: location.line,
                column: location.column,
            },
        ];
    });
}
function parseJobs(data, content) {
    const jobsValue = asRecord(data.jobs);
    if (!jobsValue) {
        return [];
    }
    return Object.entries(jobsValue).flatMap(([id, jobValue]) => {
        const raw = asRecord(jobValue);
        if (!raw) {
            return [];
        }
        const location = findLineColumn(content, [`${id}:`, asString(raw.name)]);
        const job = {
            id,
            name: asString(raw.name),
            permissions: raw.permissions,
            steps: [],
            raw,
            line: location.line,
            column: location.column,
        };
        job.steps = parseSteps(job, raw.steps, content);
        return [job];
    });
}
export function parseWorkflowFile(filePath, content) {
    const data = parseYaml(content);
    const root = asRecord(data) ?? {};
    const file = {
        filePath,
        content,
        data,
    };
    const jobs = parseJobs(root, content);
    const aiSteps = [];
    for (const job of jobs) {
        for (const step of job.steps) {
            const action = findAiAction(step.uses);
            if (action) {
                aiSteps.push({ job, step, action });
            }
        }
    }
    return {
        file,
        triggers: collectTriggers(root.on),
        topLevelPermissions: root.permissions,
        jobs,
        aiSteps,
    };
}
export function workflowHasTrigger(workflow, trigger) {
    return workflow.triggers.includes(trigger);
}
export function valueContainsExpression(value, pattern) {
    const asText = typeof value === "string" ? value : JSON.stringify(value);
    return pattern.test(asText ?? "");
}
//# sourceMappingURL=workflow-parser.js.map