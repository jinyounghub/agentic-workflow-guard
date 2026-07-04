export type Severity = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";
export type ReportFormat = "markdown" | "json" | "sarif";
export type FailThreshold = Severity | "never";

export interface RuleResult {
  id: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  file: string;
  line: number;
  column: number;
  message: string;
  evidence: string[];
  recommendation: string;
  references: string[];
  tags: string[];
}

export interface Location {
  line: number;
  column: number;
}

export interface WorkflowFile {
  filePath: string;
  content: string;
  data: unknown;
}

export interface WorkflowStep {
  id?: string;
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, unknown>;
  raw: Record<string, unknown>;
  index: number;
  line: number;
  column: number;
}

export interface WorkflowJob {
  id: string;
  name?: string;
  permissions?: unknown;
  steps: WorkflowStep[];
  raw: Record<string, unknown>;
  line: number;
  column: number;
}

export interface AiActionMatch {
  owner: string;
  repo: string;
  ref?: string;
  confidence: Confidence;
  source: "catalog" | "pattern";
  catalogEntry?: AiActionCatalogEntry;
}

export interface AiStep {
  job: WorkflowJob;
  step: WorkflowStep;
  action: AiActionMatch;
}

export interface AiActionCatalogEntry {
  owner: string;
  repo: string;
  knownInputsPromptBoundary: string[];
  knownOutputsAgentDerived: string[];
  defaultCapabilities: string[];
  docsUrl: string;
  notes: string;
}

export interface ParsedWorkflow {
  file: WorkflowFile;
  triggers: string[];
  topLevelPermissions?: unknown;
  jobs: WorkflowJob[];
  aiSteps: AiStep[];
}

export interface ScanOptions {
  paths?: string[];
  failOn?: FailThreshold;
  cwd?: string;
}

export interface ScanSummary {
  filesScanned: number;
  findings: number;
  bySeverity: Record<Severity, number>;
}

export interface ScanResult {
  results: RuleResult[];
  workflows: ParsedWorkflow[];
  summary: ScanSummary;
}

export interface RuleContext {
  workflow: ParsedWorkflow;
}

export type Rule = (context: RuleContext) => RuleResult[];

export const severityOrder: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function isAtLeastSeverity(severity: Severity, threshold: FailThreshold): boolean {
  if (threshold === "never") {
    return false;
  }
  return severityOrder[severity] >= severityOrder[threshold];
}

export function emptySeverityCounts(): Record<Severity, number> {
  return {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
}
