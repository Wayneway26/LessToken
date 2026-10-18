import type { TierLevel, WorkspaceContext } from './types';
/**
 * Build the full system prompt for the PromptCompiler LLM call.
 *
 * Combines the master system prompt template with the active tier instruction
 * and optional workspace context metadata. Only workspace fields that are
 * defined (not `undefined`) are included in the context section.
 *
 * @param tier - The resolved tier level (must not be `'auto'`).
 * @param context - Optional workspace context to embed in the prompt.
 * @returns The fully assembled system prompt string.
 */
export declare function buildSystemPrompt(tier: Exclude<TierLevel, 'auto'>, context?: WorkspaceContext): string;
//# sourceMappingURL=system-prompt.d.ts.map