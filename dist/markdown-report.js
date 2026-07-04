import path from "node:path";
export function renderMarkdownReport(result, cwd = process.cwd()) {
    const lines = [
        "# Agentic Workflow Guard Report",
        "",
        `Scanned ${result.summary.filesScanned} workflow file(s). Found ${result.summary.findings} finding(s).`,
        "",
        "| Severity | Count |",
        "| --- | ---: |",
        `| Critical | ${result.summary.bySeverity.critical} |`,
        `| High | ${result.summary.bySeverity.high} |`,
        `| Medium | ${result.summary.bySeverity.medium} |`,
        `| Low | ${result.summary.bySeverity.low} |`,
        "",
    ];
    if (result.results.length === 0) {
        lines.push("No Agentic Workflow Injection findings were detected.", "");
        return `${lines.join("\n")}\n`;
    }
    lines.push("| Rule | Severity | Location | Finding |");
    lines.push("| --- | --- | --- | --- |");
    for (const finding of result.results) {
        lines.push(`| ${escapeCell(finding.id)} | ${finding.severity} | ${escapeCell(location(finding, cwd))} | ${escapeCell(`${finding.title}: ${finding.message}`)} |`);
    }
    lines.push("");
    lines.push("## Details");
    lines.push("");
    for (const finding of result.results) {
        lines.push(`### ${finding.id}: ${finding.title}`);
        lines.push("");
        lines.push(`- Severity: ${finding.severity}`);
        lines.push(`- Confidence: ${finding.confidence}`);
        lines.push(`- Location: ${location(finding, cwd)}`);
        lines.push(`- Message: ${finding.message}`);
        lines.push(`- Recommendation: ${finding.recommendation}`);
        if (finding.evidence.length > 0) {
            lines.push(`- Evidence: ${finding.evidence.map((item) => `\`${item}\``).join(", ")}`);
        }
        if (finding.references.length > 0) {
            lines.push(`- References: ${finding.references.join(", ")}`);
        }
        lines.push("");
    }
    return `${lines.join("\n")}\n`;
}
function location(finding, cwd) {
    const relative = path.relative(cwd, finding.file) || finding.file;
    return `${relative.replace(/\\/g, "/")}:${finding.line}:${finding.column}`;
}
function escapeCell(value) {
    return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
//# sourceMappingURL=markdown-report.js.map