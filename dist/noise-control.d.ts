import type { BaselineFile, GuardConfig, RuleResult, ScanResult } from "./types.js";
export interface LoadedGuardConfig {
    config: GuardConfig;
    configFile?: string;
    diagnostics: RuleResult[];
}
export declare function loadGuardConfig(configPath: string | undefined, cwd: string): Promise<LoadedGuardConfig>;
export declare function loadBaselineFile(baselinePath: string | undefined, cwd: string): Promise<BaselineFile | undefined>;
export declare function isExcludedByConfig(file: string, cwd: string, config: GuardConfig): boolean;
export declare function applyResultControls(input: {
    results: RuleResult[];
    cwd: string;
    config: GuardConfig;
    diagnostics?: RuleResult[];
    baseline?: BaselineFile;
}): RuleResult[];
export declare function writeBaselineFile(baselinePath: string, result: ScanResult, cwd: string): Promise<void>;
export declare function relativePath(file: string, cwd: string): string;
