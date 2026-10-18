import type { LLMProvider } from './providers/types';
import type { CompileResult, CompilerOptions } from './types';
/**
 * Compile a Chinese developer request into a token-efficient English prompt
 * for a downstream AI coding agent.
 *
 * This is the main entry point of the PromptCompiler SDK. It:
 * 1. Routes the input to the appropriate tier (auto-detection or explicit).
 * 2. Builds a specialized system prompt based on the tier and workspace context.
 * 3. Calls the provided LLM to perform the compilation.
 * 4. Parses the structured JSON response (with graceful fallback on parse failure).
 *
 * @param chineseInput - The raw Chinese developer request to compile.
 * @param provider - An {@link LLMProvider} implementation to call for generation.
 * @param options - Optional compilation options (tier override, workspace context, locale).
 * @returns A {@link CompileResult} containing the compiled prompt, detected tier,
 *          trade-off summary, and token estimate.
 *
 * @example
 * ```typescript
 * import { compile, OpenAICompatProvider } from 'prompt-compiler-core';
 *
 * const provider = new OpenAICompatProvider({
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   baseUrl: 'https://api.openai.com/v1',
 *   model: 'gpt-4o',
 * });
 *
 * const result = await compile('帮我重构这个模块的状态管理', provider, {
 *   tier: 'auto',
 * });
 * console.log(result.compiledPrompt);
 * ```
 */
export declare function compile(chineseInput: string, provider: LLMProvider, options?: CompilerOptions): Promise<CompileResult>;
//# sourceMappingURL=compiler.d.ts.map