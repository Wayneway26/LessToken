# Agent plugin — Enhance Prompt

One idea, packaged for every agent host that can carry it: turn a rough Chinese request into a precise English prompt, inside the tool you already have open.

The idea itself lives in one file — [`spec/enhance.md`](spec/enhance.md). Everything under `dist/` is generated from it, wrapped in each host's own frontmatter. Edit the spec, never the output.

## What each host gets

| Host | Artifact | How it fires | Install |
|---|---|---|---|
| **Claude Code** | `.claude-plugin/plugin.json` + `commands/enhance.md` + `skills/less-token/` | `/enhance <text>`, or auto-trigger via the skill | copy `dist/claude-code` → `~/.claude/plugins/less-token/` |
| **Codex CLI** | `prompts/enhance.md` | `/enhance <text>` | copy `dist/codex/prompts/enhance.md` → `~/.codex/prompts/enhance.md` |
| **WorkBuddy** | `.codebuddy-plugin/plugin.json` + `commands/enhance.md` + `skills/less-token/` | `/enhance <text>` from the input box, or auto-trigger via the skill | local marketplace, see below |
| **Cursor** | `.cursor/rules/less-token.mdc` | agent applies the rule when relevant | copy `dist/cursor/.cursor` → project root |
| **Any MCP client** | `packages/mcp-server` (already in this repo) | `compile-prompt` prompt | see the root README |

Two packaging strategies, deliberately kept separate:

- **Instruction-only** (this package) — the host's own model does the compilation. No key, no server, no latency, works offline. This is the default.
- **MCP server** (existing) — a separate process calls a model. Needed only when the host's model should not spend tokens on compilation, or when you want one fixed model regardless of host.

## Why there is no button in the input box

WorkBuddy's plugin surface has exactly these component directories: `commands/`, `skills/`,
`agents/`, `hooks/`, `output-styles/` (plus `themes/` and `monitors/`, recognized but not
loaded), and the manifest's `mcpServers` / `lspServers`. Every one of them extends what
the *model* can do or what appears in the `/` menu. None of them can inject UI into the chat
input. The renderer is a packed asar with no extension point, so "put a button next to Send"
is not something a third-party plugin can do on any current host — Claude Code, Codex, Cursor
and WorkBuddy are all the same here.

There is a related finding worth recording: WorkBuddy already ships the backend for this.
`app.asar` contains an IPC channel `llm:enhancePrompt`, a feature id `enhance-prompt`, and a
ready-made prompt-engineering system prompt ("You are a Prompt Engineering Expert specializing
in improving user prompts for a development code assistant…"), reaching an
`/api/v1/llm/completions` endpoint. Nothing in the renderer calls it — the provider function
exists, no component imports it. So the capability is present but unexposed in this build.
That is an official feature waiting to be turned on, not a hook we can reach from a plugin.

What is actually reachable, closest first:

1. `/enhance` — a `/` menu entry, one keystroke. Shipped here.
2. `UserPromptSubmit` hook — zero clicks, but it appends `additionalContext`; it cannot replace
   the text the user typed, and silent rewriting is exactly the failure mode we avoid.
3. An always-on-top overlay anchored to the input box — a real button that also works over
   every other app, but it lives outside the host, as a separate process.

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

WorkBuddy's extension unit is a **plugin**, not a skill directory. The manifest is
`.codebuddy-plugin/plugin.json`; anything in `commands/` becomes a `/name` entry in the
input box, which is the closest thing to an inline "Enhance" button that the host exposes.

`dist/marketplace/` is a ready-made **directory marketplace** containing the plugin:

```
dist/marketplace/
├── .codebuddy-plugin/marketplace.json
└── less-token/
    ├── .codebuddy-plugin/plugin.json
    ├── commands/enhance.md
    └── skills/less-token/SKILL.md
```

Install it one of two ways.

**A. Through the app (preferred)** — open the plugin/skill marketplace panel, add a local
marketplace, and point it at `packages/agent-plugin/dist/marketplace`. The plugin appears as
`less-token`; enable it, then restart the app.

**B. By hand** — copy the plugin into the versioned cache and register it in three files:

```bash
CFG=~/.workbuddy-ai
mkdir -p "$CFG/plugins/cache/less-token-local/less-token/0.1.0"
cp -r packages/agent-plugin/dist/marketplace/less-token/. "$CFG/plugins/cache/less-token-local/less-token/0.1.0/"
```

Then add, respectively:

- `plugins/known_marketplaces.json` → a `less-token-local` entry of `type: "directory"`
- `plugins/installed_plugins.json` → `"less-token@less-token-local"` with `installPath` and `version`
- `settings.json` → `enabledPlugins["less-token@less-token-local"] = true`

Restart WorkBuddy. `/enhance` should appear in the `/` menu; typing
`/enhance 帮我把这个模块的状态管理重构一下` compiles the text after the command.

The same files also work as a plain skill if you only want the natural-language trigger:
copy `dist/workbuddy/skills/less-token` → `~/.workbuddy-ai/skills/less-token`.

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

Spec and all four adapters are authored against current host formats (Claude Code plugin layout, Codex `~/.codex/prompts`, WorkBuddy plugin + command, Cursor `.mdc` rules). The WorkBuddy plugin has been registered on this machine but not yet observed in a restarted app — the `/enhance` entry is the thing to check. The other three have not been verified end-to-end at all.
