export interface UntrustedContextMatch {
    expression: string;
    reason: string;
    confidence: "medium" | "high";
}
export declare function findUntrustedContexts(value: string): UntrustedContextMatch[];
