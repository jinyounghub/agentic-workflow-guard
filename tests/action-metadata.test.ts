import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("GitHub Action metadata", () => {
  it("declares every output emitted by the action runtime", async () => {
    const metadataText = await readFile(path.join(root, "action.yml"), "utf8");
    const actionSource = await readFile(path.join(root, "src", "action.ts"), "utf8");
    const metadata = parse(metadataText) as {
      outputs?: Record<string, { description?: string }>;
    };

    const declaredOutputs = Object.keys(metadata.outputs ?? {}).sort();
    const runtimeOutputs = [...actionSource.matchAll(/core\.setOutput\("([^"]+)"/g)]
      .map((match) => match[1])
      .sort();

    expect(declaredOutputs).toEqual(runtimeOutputs);
    expect(Object.values(metadata.outputs ?? {}).every((output) => output.description)).toBe(true);
  });
});
