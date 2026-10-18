/**
 * Tier level for prompt compilation.
 *
 * - `'auto'` — Automatically detect the appropriate tier from the input.
 * - `'light'` — Tier 1: simple queries, single-line fixes.
 * - `'standard'` — Tier 2: component / script-level tasks.
 * - `'heavy'` — Tier 3: complex refactoring, multi-module, data governance.
 */
export type TierLevel = 'auto' | 'light' | 'standard' | 'heavy';
/**
 * Describes the developer's current workspace state.
 * Used to enrich the compiled prompt with relevant context.
 */
export interface WorkspaceContext {
    /** Absolute path of the currently active editor file. */
    activeFilePath?: string;
    /** Language identifier of the active file (e.g. `'typescript'`, `'python'`). */
    activeLanguageId?: string;
    /** Paths of all currently open editor tabs. */
    openTabPaths?: string[];
    /** Symbol names (functions, classes, variables) currently selected or in scope. */
    selectedSymbols?: string[];
    /** Root directory of the workspace / project. */
    workspaceRoot?: string;
}
/**
 * Options passed to the {@link compile} function to control compilation behavior.
 */
export interface CompilerOptions {
    /** The target tier level. Use `'auto'` to let the router decide. */
    tier: TierLevel;
    /** Optional workspace context to enrich the compiled prompt. */
    workspaceContext?: WorkspaceContext;
    /** Locale hint (e.g. `'zh-CN'`). Reserved for future use. */
    locale?: string;
}
/**
 * The result produced by the prompt compiler.
 */
export interface CompileResult {
    /** The compiled, token-efficient English prompt ready for a downstream coding agent. */
    compiledPrompt: string;
    /** The tier that was actually used for compilation (never `'auto'`). */
    detectedTier: Exclude<TierLevel, 'auto'>;
    /** A 2-line Chinese summary of the key trade-off considered during compilation. */
    tradeoffSummary: string;
    /** Rough token count estimate for the compiled prompt (`≈ length / 4`). */
    tokenEstimate: number;
}
//# sourceMappingURL=types.d.ts.map