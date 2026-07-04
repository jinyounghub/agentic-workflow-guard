import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderJsonReport } from "../src/json-report.js";
import { renderSarifReport } from "../src/sarif.js";
import { scan, shouldFail } from "../src/scanner.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(dirname, "fixtures");

describe("agentic-workflow-guard scanner", () => {
  it("detects the MVP rule set in synthetic vulnerable workflows", async () => {
    const result = await scan({ paths: [path.join(fixtures, "vulnerable")] });
    const ids = new Set(result.results.map((finding) => finding.id));

    for (const id of ["R101", "R102", "R103", "R104", "R105", "R106", "R107", "R108", "R109"]) {
      expect(ids.has(id), `${id} should be detected`).toBe(true);
    }

    expect(shouldFail(result.results, "high")).toBe(true);
  });

  it("keeps safe fixtures below high severity", async () => {
    const result = await scan({ paths: [path.join(fixtures, "safe")] });
    const highOrCritical = result.results.filter(
      (finding) => finding.severity === "high" || finding.severity === "critical",
    );

    expect(highOrCritical).toEqual([]);
  });

  it("renders valid JSON and SARIF output", async () => {
    const result = await scan({
      paths: [path.join(fixtures, "vulnerable", "ai_output_to_gh_pr_merge.yml")],
    });

    const json = JSON.parse(renderJsonReport(result)) as { tool: string };
    expect(json.tool).toBe("agentic-workflow-guard");

    const sarif = JSON.parse(renderSarifReport(result)) as { version: string };
    expect(sarif.version).toBe("2.1.0");
  });
});
