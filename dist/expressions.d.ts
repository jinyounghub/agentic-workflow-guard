export interface GitHubExpression {
    raw: string;
    body: string;
    start: number;
    end: number;
}
export interface StepOutputReference {
    raw: string;
    stepId: string;
    outputName: string;
    expression?: GitHubExpression;
}
export declare function extractGitHubExpressions(value: string): GitHubExpression[];
export declare function normalizeExpressionBody(value: string): string;
export declare function expressionMentions(value: string, pattern: RegExp): boolean;
export declare function extractStepOutputReferences(value: string): StepOutputReference[];
