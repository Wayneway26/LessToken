import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Registers all MCP prompts on the given server instance.
 *
 * Currently registers:
 * - **compile-prompt** — compiles a rough Chinese developer request into a
 *   token-efficient, high-precision English prompt suitable for coding agents.
 *
 * @param server - The {@link McpServer} instance to register prompts on.
 */
export declare function registerPrompts(server: McpServer): void;
//# sourceMappingURL=prompts.d.ts.map