export interface SensitiveSinkMatch {
  label: string;
  severity: "high" | "critical";
  pattern: RegExp;
  reason: string;
}

export const sensitiveSinkPatterns: SensitiveSinkMatch[] = [
  {
    label: "gh issue edit",
    severity: "high",
    pattern: /\bgh\s+issue\s+edit\b/i,
    reason: "Edits issue state through the GitHub CLI.",
  },
  {
    label: "gh pr comment",
    severity: "high",
    pattern: /\bgh\s+pr\s+comment\b/i,
    reason: "Posts agent-derived text back to pull requests.",
  },
  {
    label: "gh pr merge",
    severity: "critical",
    pattern: /\bgh\s+pr\s+merge\b/i,
    reason: "Merges pull requests through the GitHub CLI.",
  },
  {
    label: "gh release create",
    severity: "critical",
    pattern: /\bgh\s+release\s+create\b/i,
    reason: "Creates releases through the GitHub CLI.",
  },
  {
    label: "git push",
    severity: "critical",
    pattern: /\bgit\s+push\b/i,
    reason: "Pushes repository changes.",
  },
  {
    label: "npm publish",
    severity: "critical",
    pattern: /\bnpm\s+publish\b/i,
    reason: "Publishes packages.",
  },
  {
    label: "twine upload",
    severity: "critical",
    pattern: /\btwine\s+upload\b/i,
    reason: "Publishes Python packages.",
  },
  {
    label: "docker push",
    severity: "critical",
    pattern: /\bdocker\s+push\b/i,
    reason: "Pushes container images.",
  },
  {
    label: "aws",
    severity: "high",
    pattern: /(^|\s)aws\s+[A-Za-z0-9_-]+/i,
    reason: "Calls AWS APIs from a workflow step.",
  },
  {
    label: "gcloud",
    severity: "high",
    pattern: /(^|\s)gcloud\s+[A-Za-z0-9_-]+/i,
    reason: "Calls Google Cloud APIs from a workflow step.",
  },
  {
    label: "az",
    severity: "high",
    pattern: /(^|\s)az\s+[A-Za-z0-9_-]+/i,
    reason: "Calls Azure APIs from a workflow step.",
  },
  {
    label: "kubectl",
    severity: "high",
    pattern: /\bkubectl\s+/i,
    reason: "Modifies or reads Kubernetes clusters.",
  },
  {
    label: "helm upgrade",
    severity: "critical",
    pattern: /\bhelm\s+upgrade\b/i,
    reason: "Deploys workloads to Kubernetes clusters.",
  },
  {
    label: "curl pipe shell",
    severity: "critical",
    pattern: /\bcurl\b[\s\S]*\|\s*(?:bash|sh)\b/i,
    reason: "Pipes remote content directly to a shell.",
  },
  {
    label: "bash -c",
    severity: "critical",
    pattern: /\bbash\s+-c\b/i,
    reason: "Executes a dynamically constructed shell command.",
  },
  {
    label: "sh -c",
    severity: "critical",
    pattern: /(^|\s)sh\s+-c\b/i,
    reason: "Executes a dynamically constructed shell command.",
  },
];

export const dynamicExecutionPattern =
  /\b(eval|bash\s+-c|sh\s+-c|node\s+-e|python\s+-c|python3\s+-c)\b/i;

export function findSensitiveSinks(command: string): SensitiveSinkMatch[] {
  return sensitiveSinkPatterns.filter((sink) => sink.pattern.test(command));
}
