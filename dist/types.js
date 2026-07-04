export const severityOrder = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
};
export function isAtLeastSeverity(severity, threshold) {
    if (threshold === "never") {
        return false;
    }
    return severityOrder[severity] >= severityOrder[threshold];
}
export function emptySeverityCounts() {
    return {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
    };
}
//# sourceMappingURL=types.js.map