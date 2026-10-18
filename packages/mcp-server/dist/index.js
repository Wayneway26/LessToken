#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const prompts_js_1 = require("./prompts.js");
/**
 * PromptCompiler MCP Server
 *
 * A lightweight stdio-based MCP server that exposes the PromptCompiler
 * as an MCP Prompt. Clients can invoke the `compile-prompt` prompt to
 * translate Chinese developer requests into optimised English prompts.
 */
const server = new mcp_js_1.McpServer({
    name: 'prompt-compiler',
    version: '0.1.0',
});
(0, prompts_js_1.registerPrompts)(server);
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('PromptCompiler MCP server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map