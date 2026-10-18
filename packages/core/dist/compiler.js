"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = compile;
const system_prompt_1 = require("./system-prompt");
const tier_router_1 = require("./tier-router");
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
async function compile(chineseInput, provider, options) {
    // 1. Determine the tier
    const tier = options?.tier != null && options.tier !== 'auto'
        ? options.tier
        : (0, tier_router_1.detectTier)(chineseInput);
    // 2. Build the system prompt
    const systemPrompt = (0, system_prompt_1.buildSystemPrompt)(tier, options?.workspaceContext);
    // 3. Build the user message
    const userMessage = `[Tier: ${tier}]\n\n${chineseInput}`;
    // 4. Call the LLM provider
    const rawResponse = await provider.generate(systemPrompt, userMessage);
    // 5. Parse the JSON response
    let compiledPrompt;
    let tradeoffSummary;
    try {
        const parsed = JSON.parse(rawResponse);
        compiledPrompt = parsed.compiledPrompt ?? rawResponse;
        tradeoffSummary = parsed.tradeoffSummary ?? '（解析失败，返回原始结果）';
    }
    catch {
        // JSON parsing failed — use raw response as fallback
        compiledPrompt = rawResponse;
        tradeoffSummary = '（解析失败，返回原始结果）';
    }
    // 6. Estimate tokens (rough heuristic: ~4 chars per token)
    const tokenEstimate = Math.ceil(compiledPrompt.length / 4);
    // 7. Return the result
    return {
        compiledPrompt,
        detectedTier: tier,
        tradeoffSummary,
        tokenEstimate,
    };
}
//# sourceMappingURL=compiler.js.map