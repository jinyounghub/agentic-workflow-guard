import type { AiActionCatalogEntry, AiActionMatch } from "../types.js";
export declare const aiActionCatalog: AiActionCatalogEntry[];
export interface ParsedUses {
    owner: string;
    repo: string;
    ref?: string;
}
export declare function parseUses(value: string | undefined): ParsedUses | undefined;
export declare function findAiAction(uses: string | undefined): AiActionMatch | undefined;
export declare function promptBoundaryInputNames(match: AiActionMatch): string[];
