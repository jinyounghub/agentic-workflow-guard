export function renderJsonReport(result) {
    return `${JSON.stringify({
        schemaVersion: "0.1.0",
        tool: "agentic-workflow-guard",
        summary: result.summary,
        results: result.results,
    }, null, 2)}\n`;
}
//# sourceMappingURL=json-report.js.map