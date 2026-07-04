import type { Rule, Severity } from "../types.js";
import { findLineColumn } from "../workflow-parser.js";
import { result } from "./shared.js";

const providerSecretPattern =
  /^(OPENAI_API_KEY|AZURE_OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_CODE_OAUTH_TOKEN|GEMINI_API_KEY|GOOGLE_API_KEY)$/i;
const highRiskSecretPattern =
  /(GITHUB|GH|AWS|GCP|GOOGLE_APPLICATION|AZURE|NPM|PYPI|DOCKER|KUBE|HELM|CLOUD|TOKEN|PAT|SECRET|PRIVATE)/i;

export const secretsExposedToAgentRule: Rule = ({ workflow }) => {
  const findings = [];

  for (const aiStep of workflow.aiSteps) {
    const exposed = Object.entries(aiStep.step.env ?? {}).filter(([, value]) =>
      String(value).includes("secrets."),
    );
    if (exposed.length === 0) {
      continue;
    }

    const allProviderOnly = exposed.every(([name]) => providerSecretPattern.test(name));
    const hasHighRisk = exposed.some(([name, value]) =>
      highRiskSecretPattern.test(`${name} ${String(value)}`),
    );
    let severity: Severity = allProviderOnly ? "medium" : "high";
    if (exposed.length > 1 && hasHighRisk && !allProviderOnly) {
      severity = "critical";
    }

    const firstEvidence = `${exposed[0][0]}: ${String(exposed[0][1])}`;
    const location = findLineColumn(workflow.file.content, [
      firstEvidence,
      exposed[0][0],
      aiStep.step.uses,
    ]);

    findings.push(
      result({
        id: "R109",
        title: "Secrets are exposed to an AI action",
        severity,
        confidence: "high",
        file: workflow.file.filePath,
        line: location.line,
        column: location.column,
        message: `AI action environment includes ${exposed.length} secret value(s).`,
        evidence: exposed.map(([name, value]) => `${name}: ${String(value)}`),
        recommendation:
          "Avoid passing repository, cloud, package, or deployment secrets to AI agent steps. Provider API keys may be necessary, but keep them isolated from write-capable tokens and untrusted prompts.",
        references: [
          "https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions",
        ],
        tags: ["secrets", "ai-action", "exfiltration"],
      }),
    );
  }

  return findings;
};
