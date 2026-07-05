#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderJsonReport } from "./json-report.js";
import { renderMarkdownReport } from "./markdown-report.js";
import { writeBaselineFile } from "./noise-control.js";
import { renderSarifReport } from "./sarif.js";
import { scan, shouldFail } from "./scanner.js";
import type { FailThreshold, ReportFormat } from "./types.js";

interface CliOptions {
  paths: string[];
  format: ReportFormat;
  output?: string;
  failOn: FailThreshold;
  configPath?: string;
  baselinePath?: string;
  writeBaselinePath?: string;
  failOnProvided: boolean;
  verbose: boolean;
}

const validFormats = new Set(["markdown", "json", "sarif"]);
const validThresholds = new Set(["low", "medium", "high", "critical", "never"]);

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await scan({
    paths: options.paths,
    failOn: options.failOn,
    configPath: options.configPath,
    baselinePath: options.baselinePath,
  });
  const report = renderReport(options.format, result);

  if (options.writeBaselinePath) {
    await writeBaselineFile(options.writeBaselinePath, result, process.cwd());
    if (options.verbose) {
      console.error(`Wrote baseline to ${path.resolve(process.cwd(), options.writeBaselinePath)}`);
    }
  }

  if (options.output) {
    const output = path.resolve(process.cwd(), options.output);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, report, "utf8");
    if (options.verbose) {
      console.error(`Wrote ${options.format} report to ${output}`);
    }
  } else {
    process.stdout.write(report);
  }

  if (shouldFail(result.results, options.failOn)) {
    process.exitCode = 1;
  }
}

function renderReport(format: ReportFormat, result: Awaited<ReturnType<typeof scan>>): string {
  if (format === "json") {
    return renderJsonReport(result);
  }
  if (format === "sarif") {
    return renderSarifReport(result);
  }
  return renderMarkdownReport(result);
}

function parseArgs(args: string[]): CliOptions {
  const queue = [...args];
  const command = queue[0] && !queue[0].startsWith("-") ? queue.shift() : "scan";
  if (command !== "scan") {
    usage(`Unknown command: ${command}`);
  }

  const options: CliOptions = {
    paths: [],
    format: "markdown",
    failOn: "high",
    failOnProvided: false,
    verbose: false,
  };

  while (queue.length > 0) {
    const arg = queue.shift();
    if (!arg) {
      continue;
    }

    if (arg === "--path") {
      options.paths.push(requireValue(arg, queue));
    } else if (arg === "--format") {
      const value = requireValue(arg, queue);
      if (!validFormats.has(value)) {
        usage(`Invalid --format value: ${value}`);
      }
      options.format = value as ReportFormat;
    } else if (arg === "--output") {
      options.output = requireValue(arg, queue);
    } else if (arg === "--fail-on") {
      const value = requireValue(arg, queue);
      if (!validThresholds.has(value)) {
        usage(`Invalid --fail-on value: ${value}`);
      }
      options.failOn = value as FailThreshold;
      options.failOnProvided = true;
    } else if (arg === "--config") {
      options.configPath = requireValue(arg, queue);
    } else if (arg === "--baseline") {
      options.baselinePath = requireValue(arg, queue);
    } else if (arg === "--write-baseline") {
      options.writeBaselinePath = requireValue(arg, queue);
    } else if (arg === "--no-color") {
      // Reports are plain text today; this option is reserved for CLI compatibility.
    } else if (arg === "--verbose") {
      options.verbose = true;
    } else if (arg === "--help" || arg === "-h") {
      usage();
    } else if (arg.startsWith("-")) {
      usage(`Unknown option: ${arg}`);
    } else {
      options.paths.push(arg);
    }
  }

  if (options.paths.length === 0) {
    options.paths = [".github/workflows"];
  }
  if (options.writeBaselinePath && !options.failOnProvided) {
    options.failOn = "never";
  }

  return options;
}

function requireValue(option: string, queue: string[]): string {
  const value = queue.shift();
  if (!value || value.startsWith("-")) {
    usage(`${option} requires a value`);
  }
  return value;
}

function usage(error?: string): never {
  if (error) {
    console.error(error);
    console.error("");
  }
  console.error(`Usage:
  agentic-workflow-guard scan [path] [--config file] [--baseline file] [--format markdown|json|sarif] [--output file] [--fail-on low|medium|high|critical|never]

Examples:
  agentic-workflow-guard scan
  agentic-workflow-guard scan .github/workflows --format markdown
  agentic-workflow-guard scan --config awi-guard.config.yml --baseline awi-guard.baseline.json
  agentic-workflow-guard scan --write-baseline awi-guard.baseline.json
  agentic-workflow-guard scan --format sarif --output awi-guard.sarif --fail-on high`);
  process.exit(error ? 2 : 0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exitCode = 1;
});
