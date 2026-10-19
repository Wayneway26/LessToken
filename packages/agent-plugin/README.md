# Agent plugin — Enhance Prompt

One idea, packaged for every agent host that can carry it: turn a rough Chinese request into a precise English prompt, inside the tool you already have open.

The idea itself lives in one file — [`spec/enhance.md`](spec/enhance.md). Everything under `dist/` is generated from it, wrapped in each host's own frontmatter. Edit the spec, never the output.

## What each host gets

| Host | Artifact | How it fires | Install |
|---|---|---|---|
| **Claude Code** | `.claude-plugin/plugin.json` + `commands/enhance.md` + `skills/less-token/` | `/enhance <text>`, or auto-trigger via the skill | copy `dist/claude-code` → `~/.claude/plugins/less-token/` |
| **Codex CLI** | `prompts/enhance.md` | `/enhance <text>` | copy `dist/codex/prompts/enhance.md` → `~/.codex/prompts/enhance.md` |
| **WorkBuddy** | `skills/less-token/SKILL.md` | natural language, e.g. "把这段编译成英文 prompt" | copy `dist/workbuddy/skills/less-token` → `~/.workbuddy-ai/skills/less-token` |
| **Cursor** | `.cursor/rules/less-token.mdc` | agent applies the rule when relevant | copy `dist/cursor/.cursor` → project root |
| **Any MCP client** | `packages/mcp-server` (already in this repo) | `compile-prompt` prompt | see the root README |

Two packaging strategies, deliberately kept separate:

- **Instruction-only** (this package) — the host's own model does the compilation. No key, no server, no latency, works offline. This is the default.
- **MCP server** (existing) — a separate process calls a model. Needed only when the host's model should not spend tokens on compilation, or when you want one fixed model regardless of host.

## Install

### Claude Code

```bash
mkdir -p ~/.claude/plugins
cp -r packages/agent-plugin/dist/claude-code ~/.claude/plugins/less-token
```

Then `/enhance 帮我把这个模块的状态管理重构一下`. The bundled skill also lets you skip the command and just ask.

### Codex CLI

```bash
mkdir -p ~/.codex/prompts
cp packages/agent-plugin/dist/codex/prompts/enhance.md ~/.codex/prompts/enhance.md
```

Then `/enhance <your Chinese request>`.

### WorkBuddy

```bash
cp -r packages/agent-plugin/dist/workbuddy/skills/less-token ~/.workbuddy-ai/skills/less-token
```

### Cursor

```bash
cp -r packages/agent-plugin/dist/cursor/.cursor ./
```

## Editing the idea

```bash
# 1. edit the spec
$EDITOR packages/agent-plugin/spec/enhance.md

# 2. regenerate every host artifact
node packages/agent-plugin/build.mjs

# 3. commit both the spec and dist/
```

`{{REQUEST}}` in the spec is the placeholder for "the input the user typed" — the build resolves it to `$ARGUMENTS` for command-style hosts and to "the user's current message" for skill/rule hosts.

## Why there is no hook (yet)

A hook would rewrite the prompt automatically on submit — the closest thing to "always on". Both Claude Code (`UserPromptSubmit`) and WorkBuddy expose one. It is not shipped here because:

- Silently rewriting what the user typed is surprising; a wrong rewrite is worse than no rewrite.
- It doubles token cost on every turn, including the ones that never needed compiling.
- The rewrite has to be reversible — without an undo affordance, users lose trust on the first bad edit.

The command form keeps the user in control: explicit, one keystroke, visible result. Revisit hooks once the command form has real usage.

## Status

Spec and all four adapters are authored against current host formats (Claude Code plugin layout, Codex `~/.codex/prompts`, WorkBuddy skills, Cursor `.mdc` rules). None has been verified end-to-end in a live host yet — the first install of each is the test.
