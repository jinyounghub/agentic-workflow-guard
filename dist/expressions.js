const expressionPattern = /\$\{\{([\s\S]*?)\}\}/g;
const stepOutputPattern = /\bsteps\s*\.\s*([A-Za-z0-9_-]+)\s*\.\s*outputs\s*\.\s*([A-Za-z0-9_-]+)\b/g;
export function extractGitHubExpressions(value) {
    return [...value.matchAll(expressionPattern)].map((match) => ({
        raw: match[0],
        body: match[1] ?? "",
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
    }));
}
export function normalizeExpressionBody(value) {
    return value.trim().replace(/\s+/g, " ");
}
export function expressionMentions(value, pattern) {
    return extractGitHubExpressions(value).some((expression) => {
        pattern.lastIndex = 0;
        return pattern.test(normalizeExpressionBody(expression.body));
    });
}
export function extractStepOutputReferences(value) {
    const expressions = extractGitHubExpressions(value);
    if (expressions.length === 0) {
        return referencesInText(value);
    }
    return expressions.flatMap((expression) => referencesInText(expression.body).map((reference) => ({
        ...reference,
        expression,
    })));
}
function referencesInText(value) {
    return [...value.matchAll(stepOutputPattern)].map((match) => ({
        raw: normalizeReference(match[0]),
        stepId: match[1] ?? "",
        outputName: match[2] ?? "",
    }));
}
function normalizeReference(value) {
    return value.replace(/\s+/g, "");
}
//# sourceMappingURL=expressions.js.map