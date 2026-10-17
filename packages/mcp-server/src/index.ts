#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerPrompts } from './prompts.js';

/**
 * PromptCompiler MCP Server
 *
 * A lightweight stdio-based MCP server that exposes the PromptCompiler
 * as an MCP Prompt. Clients can invoke the `compile-prompt` prompt to
 * translate Chinese developer requests into optimised English prompts.
 */
const server = new McpServer({
  name: 'prompt-compiler',
  version: '0.1.0',
});

registerPrompts(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('PromptCompiler MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
