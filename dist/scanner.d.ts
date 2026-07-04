import type { FailThreshold, RuleResult, ScanOptions, ScanResult } from "./types.js";
export declare function scan(options?: ScanOptions): Promise<ScanResult>;
export declare function shouldFail(results: RuleResult[], threshold: FailThreshold): boolean;
