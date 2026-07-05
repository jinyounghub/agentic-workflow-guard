import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { isRecord } from "./workflow-parser.js";
const validSeverities = new Set(["low", "medium", "high", "critical"]);
export async function loadGuardConfig(configPath, cwd) {
    if (!configPath) {
        return { config: {}, diagnostics: [] };
    }
    const configFile = path.resolve(cwd, configPath);
    await assertReadable(configFile, `Config file not found: ${configPath}`);
    const raw = await readFile(configFile, "utf8");
    const parsed = parseYaml(raw);
    const configDir = path.dirname(configFile);
    if (parsed === null || parsed === undefined) {
        return { config: {}, configFile, diagnostics: [] };
    }
    if (!isRecord(parsed)) {
        throw new Error(`Config file must contain a YAML object: ${configPath}`);
    }
    const diagnostics = [];
    const config = {};
    const rules = parseRules(parsed.rules, configPath);
    if (rules) {
        config.rules = rules;
    }
    const exclude = parseExclude(parsed.exclude, configPath, cwd, configDir);
    if (exclude) {
        config.exclude = exclude;
    }
    const suppressions = parseSuppressions(parsed.suppressions, configFile, cwd, configDir, diagnostics);
    if (suppressions.length > 0) {
        config.suppressions = suppressions;
    }
    return { config, configFile, diagnostics };
}
export async function loadBaselineFile(baselinePath, cwd) {
    if (!baselinePath) {
        return undefined;
    }
    const baselineFile = path.resolve(cwd, baselinePath);
    await assertReadable(baselineFile, `Baseline file not found: ${baselinePath}`);
    const raw = await readFile(baselineFile, "utf8");
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch (error) {
        throw new Error(`Could not parse baseline JSON ${baselinePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.findings)) {
        throw new Error(`Baseline file must match schema { version: 1, findings: [...] }: ${baselinePath}`);
    }
    const findings = parsed.findings.map((item, index) => {
        if (!isRecord(item)) {
            throw new Error(`Baseline finding at index ${index} must be an object`);
        }
        if (typeof item.id !== "string" || typeof item.file !== "string") {
            throw new Error(`Baseline finding at index ${index} must include string id and file`);
        }
        if (typeof item.fingerprint !== "string" || item.fingerprint.trim() === "") {
            throw new Error(`Baseline finding at index ${index} must include a fingerprint`);
        }
        return {
            id: item.id,
            file: normalizePathForMatch(item.file),
            fingerprint: item.fingerprint,
        };
    });
    return { version: 1, findings };
}
export function isExcludedByConfig(file, cwd, config) {
    return (config.exclude?.paths ?? []).some((pattern) => pathMatches(pattern, file, cwd));
}
export function applyResultControls(input) {
    const baselineKeys = new Set((input.baseline?.findings ?? []).map((finding) => `${finding.id}\0${normalizePathForMatch(finding.file)}\0${finding.fingerprint}`));
    const results = [...(input.diagnostics ?? []), ...input.results];
    const controlled = [];
    for (const finding of results) {
        const ruleConfig = input.config.rules?.[finding.id];
        if (ruleConfig?.enabled === false) {
            continue;
        }
        const effectiveSeverity = ruleConfig?.severity ?? finding.effectiveSeverity ?? finding.severity;
        const fingerprint = finding.fingerprint ?? fingerprintFinding(finding, input.cwd);
        const next = {
            ...finding,
            effectiveSeverity,
            fingerprint,
        };
        const suppression = matchingSuppression(next, input.cwd, input.config.suppressions ?? []);
        if (suppression) {
            next.suppressed = true;
            next.suppressionReason = suppression.reason;
            next.suppressionSource = "config";
        }
        const relativeFile = relativePath(next.file, input.cwd);
        if (baselineKeys.has(`${next.id}\0${relativeFile}\0${fingerprint}`)) {
            next.baselined = true;
        }
        controlled.push(next);
    }
    return controlled;
}
export async function writeBaselineFile(baselinePath, result, cwd) {
    const output = path.resolve(cwd, baselinePath);
    const findings = result.results
        .filter((finding) => !finding.suppressed && finding.id !== "R000")
        .map((finding) => ({
        id: finding.id,
        file: relativePath(finding.file, cwd),
        fingerprint: finding.fingerprint ?? fingerprintFinding(finding, cwd),
    }));
    const unique = new Map();
    for (const finding of findings) {
        unique.set(`${finding.id}\0${finding.file}\0${finding.fingerprint}`, finding);
    }
    const baseline = {
        version: 1,
        findings: [...unique.values()].sort((left, right) => left.file.localeCompare(right.file) ||
            left.id.localeCompare(right.id) ||
            left.fingerprint.localeCompare(right.fingerprint)),
    };
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
}
export function relativePath(file, cwd) {
    return normalizePathForMatch(path.relative(cwd, file) || file);
}
function parseRules(value, configPath) {
    if (value === undefined) {
        return undefined;
    }
    if (!isRecord(value)) {
        throw new Error(`Config rules must be an object: ${configPath}`);
    }
    const rules = {};
    for (const [id, rawConfig] of Object.entries(value)) {
        if (!isRecord(rawConfig)) {
            throw new Error(`Config for rule ${id} must be an object`);
        }
        const ruleConfig = {};
        if (rawConfig.enabled !== undefined) {
            if (typeof rawConfig.enabled !== "boolean") {
                throw new Error(`Config for rule ${id} has non-boolean enabled value`);
            }
            ruleConfig.enabled = rawConfig.enabled;
        }
        if (rawConfig.severity !== undefined) {
            if (typeof rawConfig.severity !== "string" ||
                !validSeverities.has(rawConfig.severity)) {
                throw new Error(`Config for rule ${id} has invalid severity value`);
            }
            ruleConfig.severity = rawConfig.severity;
        }
        rules[id] = ruleConfig;
    }
    return rules;
}
function parseExclude(value, configPath, cwd, configDir) {
    if (value === undefined) {
        return undefined;
    }
    if (!isRecord(value)) {
        throw new Error(`Config exclude must be an object: ${configPath}`);
    }
    if (value.paths === undefined) {
        return undefined;
    }
    if (!Array.isArray(value.paths) || !value.paths.every((item) => typeof item === "string")) {
        throw new Error(`Config exclude.paths must be a list of strings: ${configPath}`);
    }
    return { paths: value.paths.map((item) => normalizeConfigPathPattern(item, cwd, configDir)) };
}
function parseSuppressions(value, configFile, cwd, configDir, diagnostics) {
    if (value === undefined) {
        return [];
    }
    if (!Array.isArray(value)) {
        throw new Error("Config suppressions must be a list");
    }
    const suppressions = [];
    value.forEach((item, index) => {
        if (!isRecord(item)) {
            diagnostics.push(configDiagnostic(configFile, `Suppression at index ${index} must be an object`));
            return;
        }
        const id = typeof item.id === "string" ? item.id.trim() : "";
        const file = typeof item.file === "string" ? item.file.trim() : "";
        const reason = typeof item.reason === "string" ? item.reason.trim() : "";
        const expires = typeof item.expires === "string" ? item.expires.trim() : undefined;
        if (!id || !file) {
            diagnostics.push(configDiagnostic(configFile, `Suppression at index ${index} must include id and file`));
            return;
        }
        if (!reason) {
            diagnostics.push(configDiagnostic(configFile, `Suppression for ${id} in ${file} is ignored because reason is required`));
            return;
        }
        if (expires && !/^\d{4}-\d{2}-\d{2}$/.test(expires)) {
            diagnostics.push(configDiagnostic(configFile, `Suppression for ${id} in ${file} is ignored because expires must be YYYY-MM-DD`));
            return;
        }
        suppressions.push({
            id,
            file: normalizeConfigPathPattern(file, cwd, configDir),
            reason,
            expires,
        });
    });
    return suppressions;
}
function matchingSuppression(finding, cwd, suppressions) {
    const file = relativePath(finding.file, cwd);
    return suppressions.find((suppression) => suppression.id === finding.id &&
        normalizePathForMatch(suppression.file) === file &&
        !isExpired(suppression.expires));
}
function fingerprintFinding(finding, cwd) {
    const payload = [
        finding.id,
        relativePath(finding.file, cwd),
        normalizeText(finding.message),
        normalizeText(finding.evidence.join("|")),
    ].join("\0");
    return createHash("sha256").update(payload).digest("hex").slice(0, 24);
}
function pathMatches(pattern, file, cwd) {
    const candidate = normalizeCase(relativePath(file, cwd));
    const normalizedPattern = normalizeCase(normalizePathForMatch(pattern));
    if (!hasGlob(normalizedPattern)) {
        return (candidate === normalizedPattern ||
            candidate.startsWith(`${normalizedPattern.replace(/\/$/, "")}/`));
    }
    return globToRegExp(normalizedPattern).test(candidate);
}
function globToRegExp(pattern) {
    let source = "^";
    for (let index = 0; index < pattern.length; index += 1) {
        const char = pattern[index];
        const next = pattern[index + 1];
        if (char === "*" && next === "*") {
            source += ".*";
            index += 1;
        }
        else if (char === "*") {
            source += "[^/]*";
        }
        else if (char === "?") {
            source += "[^/]";
        }
        else {
            source += escapeRegExp(char);
        }
    }
    return new RegExp(`${source}$`);
}
function hasGlob(pattern) {
    return /[*?]/.test(pattern);
}
function normalizePathForMatch(value) {
    return value.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+/g, "/");
}
function normalizeConfigPathPattern(value, cwd, configDir) {
    if (path.isAbsolute(value)) {
        return normalizePathForMatch(path.relative(cwd, value));
    }
    return normalizePathForMatch(path.relative(cwd, path.resolve(configDir, value)));
}
function normalizeCase(value) {
    return process.platform === "win32" ? value.toLowerCase() : value;
}
function normalizeText(value) {
    return value.replace(/\s+/g, " ").trim();
}
function isExpired(expires) {
    if (!expires) {
        return false;
    }
    return expires < new Date().toISOString().slice(0, 10);
}
function configDiagnostic(file, message) {
    return {
        id: "R000",
        title: "Configuration warning",
        severity: "medium",
        confidence: "high",
        file,
        line: 1,
        column: 1,
        message,
        evidence: [message],
        recommendation: "Fix the configuration entry or remove it.",
        references: [],
        tags: ["config"],
    };
}
async function assertReadable(file, errorMessage) {
    try {
        await access(file);
    }
    catch {
        throw new Error(errorMessage);
    }
}
function escapeRegExp(value) {
    return value.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}
//# sourceMappingURL=noise-control.js.map