export interface SensitiveSinkMatch {
    label: string;
    severity: "high" | "critical";
    pattern: RegExp;
    reason: string;
}
export declare const sensitiveSinkPatterns: SensitiveSinkMatch[];
export declare const dynamicExecutionPattern: RegExp;
export declare function findSensitiveSinks(command: string): SensitiveSinkMatch[];
