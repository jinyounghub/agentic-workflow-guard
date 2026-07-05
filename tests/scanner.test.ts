import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderJsonReport } from "../src/json-report.js";
import { renderMarkdownReport } from "../src/markdown-report.js";
import { writeBaselineFile } from "../src/noise-control.js";
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

  it("applies rule disable config without changing default behavior", async () => {
    const fixture = path.join(fixtures, "config", "disable-rule");

    const withoutConfig = await scan({ cwd: fixture, paths: ["workflow.yml"] });
    expect(withoutConfig.results.some((finding) => finding.id === "R107")).toBe(true);

    const withConfig = await scan({
      cwd: fixture,
      paths: ["workflow.yml"],
      configPath: "awi-guard.config.yml",
    });
    expect(withConfig.results.some((finding) => finding.id === "R107")).toBe(false);
  });

  it("applies severity overrides to reporting and fail thresholds", async () => {
    const fixture = path.join(fixtures, "config", "severity-override");
    const result = await scan({
      cwd: fixture,
      paths: ["workflow.yml"],
      configPath: "awi-guard.config.yml",
    });
    const finding = result.results.find((item) => item.id === "R108");

    expect(finding?.severity).toBe("medium");
    expect(finding?.effectiveSeverity).toBe("high");
    expect(shouldFail(result.results, "high")).toBe(true);
  });

  it("excludes configured paths before parsing workflows", async () => {
    const fixture = path.join(fixtures, "config", "exclude-path");
    const result = await scan({
      cwd: fixture,
      paths: ["workflow.yml"],
      configPath: "awi-guard.config.yml",
    });

    expect(result.summary.filesScanned).toBe(0);
    expect(result.results).toEqual([]);
  });

  it("marks config suppressions and excludes them from fail thresholds", async () => {
    const fixture = path.join(fixtures, "config", "suppression");
    const result = await scan({
      cwd: fixture,
      paths: ["workflow.yml"],
      configPath: "awi-guard.config.yml",
    });
    const suppressed = result.results.find((finding) => finding.id === "R104");

    expect(suppressed?.suppressed).toBe(true);
    expect(suppressed?.suppressionReason).toContain("printed as data");
    expect(result.summary.suppressedFindings).toBe(1);
    expect(shouldFail(result.results, "high")).toBe(false);
  });

  it("does not apply suppressions without reasons or with expired dates", async () => {
    const missingReason = path.join(fixtures, "config", "suppression-missing-reason");
    const missingReasonResult = await scan({
      cwd: missingReason,
      paths: ["workflow.yml"],
      configPath: "awi-guard.config.yml",
    });

    expect(missingReasonResult.results.some((finding) => finding.id === "R000")).toBe(true);
    expect(missingReasonResult.results.find((finding) => finding.id === "R104")?.suppressed).toBe(
      undefined,
    );

    const expired = path.join(fixtures, "config", "suppression-expired");
    const expiredResult = await scan({
      cwd: expired,
      paths: ["workflow.yml"],
      configPath: "awi-guard.config.yml",
    });

    expect(expiredResult.results.find((finding) => finding.id === "R104")?.suppressed).toBe(
      undefined,
    );
  });

  it("writes and applies baselines without failing on accepted findings", async () => {
    const fixture = path.join(fixtures, "baseline");
    const initial = await scan({ cwd: fixture, paths: ["workflow.yml"] });
    const outputDir = await mkdtemp(path.join(tmpdir(), "awi-baseline-"));
    const baselinePath = path.join(outputDir, "awi-guard.baseline.json");
    await writeBaselineFile(baselinePath, initial, fixture);

    const withBaseline = await scan({
      cwd: fixture,
      paths: ["workflow.yml"],
      baselinePath,
    });

    expect(withBaseline.results.every((finding) => finding.fingerprint)).toBe(true);
    expect(withBaseline.results.some((finding) => finding.baselined)).toBe(true);
    expect(withBaseline.summary.baselinedFindings).toBeGreaterThan(0);
    expect(shouldFail(withBaseline.results, "medium")).toBe(false);
  });

  it("applies the committed baseline fixture", async () => {
    const result = await scan({
      paths: [path.join(fixtures, "baseline", "workflow.yml")],
      baselinePath: path.join(fixtures, "baseline", "awi-guard.baseline.json"),
    });

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results.every((finding) => finding.baselined)).toBe(true);
    expect(shouldFail(result.results, "medium")).toBe(false);
  });

  it("reports missing config and malformed baseline files clearly", async () => {
    await expect(
      scan({
        paths: [path.join(fixtures, "safe")],
        configPath: "missing-awi-guard.config.yml",
      }),
    ).rejects.toThrow("Config file not found");

    const outputDir = await mkdtemp(path.join(tmpdir(), "awi-bad-baseline-"));
    const baselinePath = path.join(outputDir, "awi-guard.baseline.json");
    await writeFile(baselinePath, "not json", "utf8");

    await expect(
      scan({
        paths: [path.join(fixtures, "safe")],
        baselinePath,
      }),
    ).rejects.toThrow("Could not parse baseline JSON");
  });

  it("renders active, suppressed, and baselined state in reports", async () => {
    const fixture = path.join(fixtures, "config", "suppression");
    const result = await scan({
      cwd: fixture,
      paths: ["workflow.yml"],
      configPath: "awi-guard.config.yml",
    });

    const markdown = renderMarkdownReport(result, fixture);
    expect(markdown).toContain("Suppressed findings: 1");
    expect(markdown).toContain("suppressed");

    const json = JSON.parse(renderJsonReport(result)) as {
      results: Array<{ fingerprint?: string }>;
    };
    expect(json.results.every((finding) => finding.fingerprint)).toBe(true);

    const sarif = JSON.parse(renderSarifReport(result, fixture)) as { version: string };
    expect(sarif.version).toBe("2.1.0");
  });
});
