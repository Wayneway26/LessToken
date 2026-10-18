---
name: less-token
description: Compile rough Chinese developer requests into token-efficient, high-precision English prompts for downstream AI coding agents. This skill should be used when a request is written in Chinese and needs to become an English prompt, when the user asks to 压缩/优化/翻译 prompt, 优化提示词, 写成 master prompt, 给 Cursor/Claude Code/Copilot 的提示词, or when a Chinese requirement must be handed to another agent in English. Applies 3-tier routing (light / standard / heavy) and the 5-pillar master workflow, and returns a compiled prompt plus a 2-line Chinese trade-off summary.
agent_created: true
---

# LessToken — Chinese → English Prompt Compiler

## Purpose

Convert a rough Chinese developer request into an English prompt that is shorter, more precise, and immediately usable by a coding agent. Compilation runs entirely in-context: the host agent is the compiler, so no API key, network call, or CLI install is required.

This skill reproduces the PromptCompiler engine (`packages/core`) as agent instructions — the same tier heuristics, the same 5-pillar heavy workflow, and the same output contract (`compiledPrompt` + `tradeoffSummary`).

## When to use

Use this skill when any of the following holds:

- The request is in Chinese and will be executed by a coding agent (or pasted into one).
- The user asks to translate, compress, optimize, or professionalize a prompt.
- The user asks for a "master prompt", an XML prompt, a 5-pillar prompt, or a spec-style prompt.
- The request carries emotional emphasis ("千万别错", "一定要小心", "绝对不能") that should become objective rules.
- A Chinese requirement must be re-stated for a different agent, model, or repo.

Do **not** use this skill when:

- The user wants the task executed — do the work instead of compiling a prompt.
- The text is prose for humans (docs, emails, articles).
- The source is already a clean English prompt; at most tighten it, and only if asked.

## Workflow

### Step 1 — Capture the request and its context

Take the user's raw Chinese text verbatim. If workspace context is available (active file, language, open tabs, selected symbols), collect identifiers and paths only — never paste file contents into the compiled prompt.

### Step 2 — Resolve the tier

Pick the tier honestly. Length and emotion are not complexity signals.

| Tier | Trigger | Output shape |
|------|---------|--------------|
| **light** | Single-line fix, rename, small edit; ≤ 80 chars and ≤ 1 newline, no component/refactor keyword | Plain imperative English, 1–3 sentences, no XML |
| **standard** | Component, script, or contained feature work | Lightweight XML: `<context>`, `<goal>`, `<constraints>` |
| **heavy** | Refactor, migration, architecture, state management, data governance, concurrency, multi-module | Full 5-pillar XML: `<context>`, `<goal>`, `<tool_strategy>`, `<tradeoff_and_constraints>`, `<workflow_instruction>` |

Apply these rules in order:

1. **heavy** — the input hits ≥ 2 heavy keywords (`重构`, `迁移`, `架构`, `模块`, `状态管理`, `数据治理`, `多表`, `事务`, `并发`, `性能优化`, `数据一致性`, `回滚`), or is > 500 chars with > 3 newlines.
2. **light** — the input is ≤ 80 chars with ≤ 1 newline and contains no component keyword (`重构`, `迁移`, `架构`, `模块`, `状态管理`, `数据治理`, `批量`, `多个文件`, `组件`).
3. **standard** — everything else.

For a deterministic result, run `scripts/detect_tier.py`. When script and judgement disagree, prefer judgement and explain the deviation in the trade-off summary.

### Step 3 — Compile

Follow the tier template in `references/tier-templates.md`. For **heavy**, also load `references/5-pillar.md`, which defines each pillar and the exact XML skeleton.

### Step 4 — Return the contract

Return exactly two blocks, in this order:

1. **Compiled prompt** — English only, paste-ready for a coding agent.
2. **Trade-off summary** — 2 lines of Chinese: what was traded away (breadth vs. precision, speed vs. safety, minimal diff vs. clean structure) and which risk the downstream agent should watch.

Keep surrounding framing to one short sentence.

### Step 5 — Self-check before answering

- No Chinese characters inside the compiled prompt.
- No invented requirements — the intent matches the user's words.
- No meta-commentary ("I have compiled your prompt…") inside the prompt body.
- Every defensive phrase is now an objective, checkable rule — or deleted.
- Files and symbols appear as references only, never as pasted code.
- Nothing survives that does not change the agent's behaviour.

## Bundled resources

| Resource | Load when |
|----------|-----------|
| `references/tier-templates.md` | Always — skeleton and do/don't per tier |
| `references/5-pillar.md` | Tier is heavy, or the user asks for a "master prompt" |
| `references/examples.md` | Few-shot calibration, or the request is ambiguous |
| `scripts/detect_tier.py` | A deterministic tier is needed, or the input sits near a threshold |

```bash
python scripts/detect_tier.py "帮我把这个函数的返回类型改成 Promise<string>"
# → light

python scripts/detect_tier.py --json "重构状态管理，保证数据一致性"
# → {"tier": "heavy", "length": 20, "newlines": 0, "heavy_hits": ["重构", "状态管理", "数据一致性"]}
```

## Critical rules

1. **English only in the compiled prompt.** The trade-off summary stays Chinese.
2. **Faithful translation, not expansion.** Do not add tasks, files, or acceptance criteria the user did not imply.
3. **Defensive fluff is a bug.** Emotional emphasis becomes a measurable constraint or disappears.
4. **Tier by complexity, not word count.** A one-line rename written as a paragraph is still light.
5. **Context by reference.** Paths, languages, and symbol names only.
6. **The prompt must be paste-ready.** No `<your file here>` placeholders unless the user's own request was underspecified — then leave a single clearly marked gap.
