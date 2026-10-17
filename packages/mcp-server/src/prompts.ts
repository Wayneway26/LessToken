import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { compile, OpenAICompatProvider } from 'prompt-compiler-core';
import type { TierLevel } from 'prompt-compiler-core';
import { z } from 'zod';

/**
 * Registers all MCP prompts on the given server instance.
 *
 * Currently registers:
 * - **compile-prompt** — compiles a rough Chinese developer request into a
 *   token-efficient, high-precision English prompt suitable for coding agents.
 *
 * @param server - The {@link McpServer} instance to register prompts on.
 */
export function registerPrompts(server: McpServer): void {
  server.prompt(
    'compile-prompt',
    'Compiles a rough Chinese developer request into a token-efficient, high-precision English prompt. Use this BEFORE sending to your coding agent.',
    {
      chineseInput: z.string().describe('The Chinese developer request to compile'),
      tier: z.enum(['auto', 'light', 'standard', 'heavy']).optional().describe('Complexity tier override. Default: auto-detect.'),
      apiKey: z.string().optional().describe('OpenAI-compatible API key'),
      baseUrl: z.string().optional().describe('API base URL (default: https://api.openai.com/v1)'),
      model: z.string().optional().describe('Model name (default: gpt-4o-mini)'),
    },
    async ({ chineseInput, tier, apiKey, baseUrl, model }) => {
      // Require an API key since MCP server runs outside VS Code
      const resolvedApiKey = apiKey ?? process.env.OPENAI_API_KEY;
      if (!resolvedApiKey) {
        return {
          messages: [{
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: 'Error: No API key provided. Pass apiKey argument or set OPENAI_API_KEY environment variable.',
            },
          }],
        };
      }

      const provider = new OpenAICompatProvider({
        apiKey: resolvedApiKey,
        baseUrl: baseUrl ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
        model: model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      });

      const result = await compile(chineseInput, provider, {
        tier: (tier as TierLevel) ?? 'auto',
      });

      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: result.compiledPrompt,
          },
        }],
        description: `[${result.detectedTier}] ${result.tradeoffSummary}`,
      };
    }
  );
}
