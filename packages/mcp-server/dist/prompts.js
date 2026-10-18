"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPrompts = registerPrompts;
const prompt_compiler_core_1 = require("prompt-compiler-core");
const zod_1 = require("zod");
/**
 * Registers all MCP prompts on the given server instance.
 *
 * Currently registers:
 * - **compile-prompt** — compiles a rough Chinese developer request into a
 *   token-efficient, high-precision English prompt suitable for coding agents.
 *
 * @param server - The {@link McpServer} instance to register prompts on.
 */
function registerPrompts(server) {
    server.prompt('compile-prompt', 'Compiles a rough Chinese developer request into a token-efficient, high-precision English prompt. Use this BEFORE sending to your coding agent.', {
        chineseInput: zod_1.z.string().describe('The Chinese developer request to compile'),
        tier: zod_1.z.enum(['auto', 'light', 'standard', 'heavy']).optional().describe('Complexity tier override. Default: auto-detect.'),
        apiKey: zod_1.z.string().optional().describe('OpenAI-compatible API key'),
        baseUrl: zod_1.z.string().optional().describe('API base URL (default: https://api.openai.com/v1)'),
        model: zod_1.z.string().optional().describe('Model name (default: gpt-4o-mini)'),
    }, async ({ chineseInput, tier, apiKey, baseUrl, model }) => {
        // Require an API key since MCP server runs outside VS Code
        const resolvedApiKey = apiKey ?? process.env.OPENAI_API_KEY;
        if (!resolvedApiKey) {
            return {
                messages: [{
                        role: 'user',
                        content: {
                            type: 'text',
                            text: 'Error: No API key provided. Pass apiKey argument or set OPENAI_API_KEY environment variable.',
                        },
                    }],
            };
        }
        const provider = new prompt_compiler_core_1.OpenAICompatProvider({
            apiKey: resolvedApiKey,
            baseUrl: baseUrl ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
            model: model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        });
        const result = await (0, prompt_compiler_core_1.compile)(chineseInput, provider, {
            tier: tier ?? 'auto',
        });
        return {
            messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: result.compiledPrompt,
                    },
                }],
            description: `[${result.detectedTier}] ${result.tradeoffSummary}`,
        };
    });
}
//# sourceMappingURL=prompts.js.map