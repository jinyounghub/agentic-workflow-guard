import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { aiActionCatalog, findAiAction } from "../src/catalog/ai-actions.js";
import { scan } from "../src/scanner.js";

describe("AI action catalog", () => {
  it("carries public verification metadata for each catalog entry", () => {
    const names = new Set<string>();

    for (const entry of aiActionCatalog) {
      const name = `${entry.owner}/${entry.repo}`;
      expect(names.has(name), `${name} should be unique`).toBe(false);
      names.add(name);

      expect(entry.owner).toBe(entry.owner.toLowerCase());
      expect(entry.repo).toBe(entry.repo.toLowerCase());
      expect(entry.kind).toMatch(/^(coding-agent|ai-inference|assistant|unknown)$/);
      expect(entry.knownInputsPromptBoundary.length).toBeGreaterThan(0);
      expect(entry.knownOutputsAgentDerived.length).toBeGreaterThan(0);
      expect(entry.docsUrl).toMatch(/^https:\/\/github\.com\//);
      expect(entry.sourceUrl).toMatch(/^https:\/\/github\.com\//);
      expect(entry.actionYmlUrl).toMatch(/^https:\/\/github\.com\/.+\/blob\/main\/action\.yml$/);
      expect(entry.lastVerified).toBe("2026-07-05");
      expect(entry.verificationNotes).toContain("action.yml");
    }
  });

  it("returns matched pattern evidence for low-confidence action names", () => {
    expect(findAiAction("example/claude-helper@v1")).toEqual(
      expect.objectContaining({
        confidence: "low",
        source: "pattern",
        matchedPattern: "claude",
      }),
    );
  });

  it("includes catalog verification metadata in R001 evidence", async () => {
    const fixtureRoot = await mkdtemp(path.join(tmpdir(), "awi-catalog-"));
    const workflowDir = path.join(fixtureRoot, ".github", "workflows");
    await mkdir(workflowDir, { recursive: true });
    const workflowPath = path.join(workflowDir, "agent.yml");

    await writeFile(
      workflowPath,
      [
        "name: Agent",
        "on:",
        "  workflow_dispatch:",
        "jobs:",
        "  review:",
        "    runs-on: ubuntu-latest",
        "    permissions:",
        "      contents: read",
        "    steps:",
        "      - uses: openai/codex-action@v1",
        "        with:",
        "          prompt: Summarize this repository.",
        "",
      ].join("\n"),
      "utf8",
    );

    const result = await scan({ cwd: fixtureRoot, paths: [workflowPath] });
    const finding = result.results.find((item) => item.id === "R001");

    expect(finding?.confidence).toBe("high");
    expect(finding?.evidence).toEqual(
      expect.arrayContaining([
        "source: catalog",
        "confidence: high",
        "kind: coding-agent",
        "lastVerified: 2026-07-05",
        "docs: https://github.com/openai/codex-action",
      ]),
    );
    expect(finding?.references).toEqual(
      expect.arrayContaining(["https://github.com/openai/codex-action/blob/main/action.yml"]),
    );
  });
});
