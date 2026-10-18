import type { TierLevel } from './types';
/**
 * Keywords that signal a complex, multi-module, or architectural task.
 * Used by {@link detectTier} to identify Heavy (Tier 3) inputs.
 */
export declare const HEAVY_KEYWORDS: readonly string[];
/**
 * Keywords that indicate a component-level or scripting task.
 * These overlap with heavy keywords and are used for Light-tier exclusion
 * in {@link detectTier}.
 */
export declare const COMPONENT_KEYWORDS: readonly string[];
/**
 * Heuristically detect the appropriate compilation tier from a Chinese
 * developer input string.
 *
 * **Rules:**
 * - **Light (Tier 1):** Input ≤ 80 chars, at most 1 newline, and does not
 *   contain any {@link COMPONENT_KEYWORDS}.
 * - **Heavy (Tier 3):** Input contains ≥ 2 {@link HEAVY_KEYWORDS}, OR input
 *   is > 500 chars with > 3 newlines.
 * - **Standard (Tier 2):** Everything else.
 *
 * @param chineseInput - The raw Chinese developer request.
 * @returns The detected tier level (never `'auto'`).
 */
export declare function detectTier(chineseInput: string): Exclude<TierLevel, 'auto'>;
//# sourceMappingURL=tier-router.d.ts.map