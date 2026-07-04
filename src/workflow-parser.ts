import { parse as parseYaml } from "yaml";
import { findAiAction } from "./catalog/ai-actions.js";
import type {
  AiStep,
  Location,
  ParsedWorkflow,
  WorkflowFile,
  WorkflowJob,
  WorkflowStep,
} from "./types.js";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

export function scalarToString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

export function findLineColumn(content: string, needles: Array<string | undefined>): Location {
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

export function collectTriggers(onValue: unknown): string[] {
  if (typeof onValue === "string") {
    return [onValue];
  }
  if (Array.isArray(onValue)) {
    return onValue.filter((item): item is string => typeof item === "string");
  }
  if (isRecord(onValue)) {
    return Object.keys(onValue);
  }
  return [];
}

function parseSteps(job: WorkflowJob, stepsValue: unknown, content: string): WorkflowStep[] {
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

function parseJobs(data: Record<string, unknown>, content: string): WorkflowJob[] {
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
    const job: WorkflowJob = {
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

export function parseWorkflowFile(filePath: string, content: string): ParsedWorkflow {
  const data = parseYaml(content) as unknown;
  const root = asRecord(data) ?? {};
  const file: WorkflowFile = {
    filePath,
    content,
    data,
  };
  const jobs = parseJobs(root, content);
  const aiSteps: AiStep[] = [];

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

export function workflowHasTrigger(workflow: ParsedWorkflow, trigger: string): boolean {
  return workflow.triggers.includes(trigger);
}

export function valueContainsExpression(value: unknown, pattern: RegExp): boolean {
  const asText = typeof value === "string" ? value : JSON.stringify(value);
  return pattern.test(asText ?? "");
}
