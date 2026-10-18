# PromptCompiler — LessToken

> Chinese → English Master Prompt Optimizer for AI Coding Agents

A developer tool that intercepts rough Chinese requests **before** they reach your coding Agent, automatically translating and compiling them into token-efficient, high-precision English prompts.

## 🏗 Architecture

```
packages/
├── core/          # prompt-compiler-core — 3-Tier Routing & 5-Pillar Engine
├── vscode-ext/    # prompt-compiler-vscode — VS Code Extension
├── mcp-server/    # prompt-compiler-mcp — MCP Prompt Server
└── skill/         # less-token — Agent Skill (no API key required)
```

### Core Engine (3-Tier Adaptive Routing)

| Tier | Trigger | Output Style |
|------|---------|--------------|
| **Light** | Short queries, single-line fixes (≤80 chars) | Clean imperative English (1-3 sentences) |
| **Standard** | Component tasks, scripts | Lightweight XML (`<context>`, `<goal>`, `<constraints>`) |
| **Heavy** | Refactoring, multi-module, data governance | Full 5-Pillar XML workflow |

### 5-Pillar Master Workflow (Heavy Tier)

1. **XML Isolation** — Structured `<context>`, `<goal>`, `<tool_strategy>`, `<tradeoff_and_constraints>`, `<workflow_instruction>`
2. **Zero Defensive Patches** — Emotional warnings → objective rules
3. **Capability Decoupling** — Force grep/find/AST over guessing
4. **Bilateral Trade-off Balance** — Value AND risk, always
5. **3-Phase Loop** — Audit → Implement → Verify

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- VS Code ≥ 1.90

### Install Dependencies

```bash
# Root workspace (core + mcp-server)
npm install

# VS Code extension
cd packages/vscode-ext && npm install
```

### Build

```bash
# Build all packages
npx tsc --build tsconfig.build.json
```

### Launch Extension (F5)

1. Open this repo in VS Code
2. Press **F5** (or Run → Start Debugging)
3. In the Extension Development Host window:
   - **Cmd+Alt+P** with text selected → Compile & Replace
   - **Cmd+Shift+P** → "PromptCompiler: Compile from Input Box" → result copied to clipboard
   - Click the ✨ icon in the Activity Bar → Sidebar panel with tier selector

### Configure Provider

By default, the extension uses **VS Code Language Model API** (zero-config, requires GitHub Copilot or similar).

To use your own API key, add to `settings.json`:

```json
{
  "promptCompiler.provider": "openai-compat",
  "promptCompiler.apiKey": "sk-...",
  "promptCompiler.apiBaseUrl": "https://api.openai.com/v1",
  "promptCompiler.modelName": "gpt-4o-mini"
}
```

Compatible with OpenAI, Gemini, DeepSeek, and any OpenAI-compatible API.

### MCP Server

Register in your MCP client config:

```json
{
  "mcpServers": {
    "prompt-compiler": {
      "command": "node",
      "args": ["./packages/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

Then use the `compile-prompt` slash command in any MCP-compatible client.

## 📦 Packages

| Package | Description | Entry |
|---------|-------------|-------|
| `prompt-compiler-core` | SDK: compile(), detectTier(), buildSystemPrompt() | `packages/core/dist/index.js` |
| `prompt-compiler-vscode` | VS Code extension with commands + webview panel | `packages/vscode-ext/dist/extension.js` |
| `prompt-compiler-mcp` | MCP stdio server with `compile-prompt` Prompt | `packages/mcp-server/dist/index.js` |
| `less-token` (skill) | Agent Skill — in-context compiler, zero config | `packages/skill/less-token/SKILL.md` |

## 🧩 Agent Skill (no API key)

`packages/skill/less-token/` packages the same routing rules and 5-pillar workflow as an
Agent Skill. The host agent performs the compilation in-context, so there is no provider,
no key, and no network call.

```bash
# install for all workspaces
cp -r packages/skill/less-token ~/.workbuddy-ai/skills/less-token
```

Then ask, in Chinese, for a prompt — or invoke it explicitly:

> 帮我把这段需求编译成英文 prompt

The skill returns the compiled English prompt plus a 2-line Chinese trade-off summary.
Tier routing can be checked deterministically:

```bash
python packages/skill/less-token/scripts/detect_tier.py --json "重构状态管理，保证数据一致性"
# → {"tier": "heavy", "reason": "3 heavy keywords", ...}
```

Build a distributable zip with `python <skill-creator>/scripts/package_skill.py packages/skill/less-token`.

## 🔑 API

```typescript
import { compile, OpenAICompatProvider } from 'prompt-compiler-core';

const provider = new OpenAICompatProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
});

const result = await compile(
  '帮我重构这个模块的状态管理，千万别破坏现有的接口',
  provider,
  { tier: 'auto' }
);

console.log(result.compiledPrompt);
// → Full 5-Pillar XML prompt in English (auto-detected as Heavy)
console.log(result.detectedTier);
// → 'heavy'
console.log(result.tradeoffSummary);
// → 2-line Chinese trade-off summary
```

## License

MIT
