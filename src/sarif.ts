import path from "node:path";
import type { RuleResult, ScanResult, Severity } from "./types.js";

export function renderSarifReport(result: ScanResult, cwd = process.cwd()): string {
  return `${JSON.stringify(toSarif(result, cwd), null, 2)}\n`;
}

function toSarif(result: ScanResult, cwd: string) {
  const rules = uniqueRules(result.results);

  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "agentic-workflow-guard",
            informationUri: "https://github.com/jinyounghub/agentic-workflow-guard",
            semanticVersion: "0.1.0",
            rules: rules.map((finding) => ({
              id: finding.id,
              name: finding.id,
              shortDescription: {
                text: finding.title,
              },
              fullDescription: {
                text: finding.message,
              },
              help: {
                text: finding.recommendation,
                markdown: finding.recommendation,
              },
              defaultConfiguration: {
                level: sarifLevel(finding.effectiveSeverity ?? finding.severity),
              },
              properties: {
                tags: finding.tags,
                precision: finding.confidence,
              },
            })),
          },
        },
        results: result.results.map((finding) => ({
          ruleId: finding.id,
          level: sarifLevel(finding.effectiveSeverity ?? finding.severity),
          message: {
            text: `${finding.title}: ${finding.message}`,
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: path.relative(cwd, finding.file).replace(/\\/g, "/") || finding.file,
                },
                region: {
                  startLine: finding.line,
                  startColumn: finding.column,
                },
              },
            },
          ],
          suppressions: sarifSuppressions(finding),
          properties: {
            severity: finding.severity,
            effectiveSeverity: finding.effectiveSeverity ?? finding.severity,
            confidence: finding.confidence,
            evidence: finding.evidence,
            recommendation: finding.recommendation,
            references: finding.references,
            tags: finding.tags,
            fingerprint: finding.fingerprint,
            suppressed: Boolean(finding.suppressed),
            suppressionReason: finding.suppressionReason,
            suppressionSource: finding.suppressionSource,
            baselined: Boolean(finding.baselined),
          },
        })),
      },
    ],
  };
}

function sarifSuppressions(finding: RuleResult) {
  if (finding.suppressed) {
    return [
      {
        kind: "external",
        justification: finding.suppressionReason ?? "Suppressed by configuration.",
      },
    ];
  }
  if (finding.baselined) {
    return [
      {
        kind: "external",
        justification: "Accepted by baseline.",
      },
    ];
  }
  return undefined;
}

function uniqueRules(results: RuleResult[]): RuleResult[] {
  const byId = new Map<string, RuleResult>();
  for (const result of results) {
    if (!byId.has(result.id)) {
      byId.set(result.id, result);
    }
  }
  return [...byId.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function sarifLevel(severity: Severity): "error" | "warning" | "note" {
  if (severity === "critical" || severity === "high") {
    return "error";
  }
  if (severity === "medium") {
    return "warning";
  }
  return "note";
}
