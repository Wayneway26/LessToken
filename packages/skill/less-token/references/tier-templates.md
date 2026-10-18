# Tier Templates

Three output shapes. Pick one — never blend. The tier decides the shape; the request decides the content.

---

## Tier 1 — Light

**Shape:** plain imperative English, 1–3 sentences, no XML, no headings.

**Rules**

- One action per sentence, imperative mood.
- Keep the identifier and the target value exactly as the user wrote them.
- Drop all reassurance, urgency, and apology.
- If the request names a file or symbol, keep the name inline — do not wrap it in `<context>`.

**Skeleton**

```
<Verb> <object> to <target value> [in <file/symbol>].
```

**Example**

| Chinese input | Compiled prompt |
|---|---|
| 帮我把这个函数的返回类型改成 Promise<string>，千万别改错了 | Change the return type of this function to `Promise<string>`. |
| 这个变量名改成 userCount | Rename this variable to `userCount`. |
| 把日志级别从 info 调成 warn | Change the log level from `info` to `warn`. |

**Do not:** add a workflow, add acceptance criteria, add "please verify" — a single-line edit needs none of it.

---

## Tier 2 — Standard

**Shape:** lightweight XML with exactly three tags.

```xml
<context>
What the code is, relevant file paths, language/framework. Reference only — never paste bodies.
</context>

<goal>
What to achieve, one direct paragraph. State the observable end state.
</goal>

<constraints>
- Specific rules, edge cases, DO / DON'T.
- Objective and checkable.
</constraints>
```

**Rules**

- `<context>` answers "where am I standing" in ≤ 2 sentences.
- `<goal>` answers "what must be true when done" — not the steps.
- `<constraints>` holds 2–6 bullets; each one is testable. "Be careful" is not a constraint; "Do not change the exported signature" is.
- No `<workflow_instruction>` at this tier. Steps belong to heavy.

**Example**

Input: `给设置页加一个深色模式开关，切换后要存到 localStorage，别动现有的主题逻辑`

```xml
<context>
Settings page component in a React + TypeScript app. Theme handling already exists in the theme module; the active file is the settings page.
</context>

<goal>
Add a dark mode toggle to the settings page that persists the user's choice to localStorage and restores it on load.
</goal>

<constraints>
- Reuse the existing theme module's API; do not modify its internal logic.
- Persist under a single localStorage key; read it once at startup.
- Toggle state must reflect the stored value on mount, not default to off.
</constraints>
```

---

## Tier 3 — Heavy

**Shape:** full 5-pillar XML with five tags. See `5-pillar.md` for the definition of each pillar.

```xml
<context>
System shape, relevant modules and file paths, language/framework, current behaviour that must be preserved.
</context>

<goal>
The end state in one paragraph, plus the single success criterion.
</goal>

<tool_strategy>
- Before modifying, search the codebase with grep/find for all references to <symbol>.
- Use <type checker / test suite / AST query> to confirm the change compiles.
- Do not infer call sites from memory; enumerate them.
</tool_strategy>

<tradeoff_and_constraints>
- Value: <what the refactor buys — maintainability, latency, correctness>.
- Risk: <what can regress, and the blast radius>.
- Invariants: <must remain true — public API, data integrity, ordering>.
</tradeoff_and_constraints>

<workflow_instruction>
Phase 1 — Audit: map every caller, state the root cause, list the files in scope.
Phase 2 — Implement: change one module at a time; keep the build green after each step.
Phase 3 — Verify: run <tests / type check>, confirm <invariants>, report any deviation.
</workflow_instruction>
```

**Rules**

- Every emotional warning in the source becomes an invariant. "千万别删数据" → "Preserve all existing records; writes are append-only."
- `<tool_strategy>` must name the actual commands or tools available in the target environment.
- `<tradeoff_and_constraints>` always carries both sides. A one-sided trade-off means the audit is incomplete.
- `<workflow_instruction>` has exactly three phases, in this order. Each phase states its exit condition.
- Keep the whole prompt under roughly 600 tokens. If it grows past that, the audit was not done — the scope is still fuzzy.

**Example**

Input: `帮我重构这个模块的状态管理，千万别破坏现有的接口，最好能顺手把性能也优化一下`

```xml
<context>
State management module in a TypeScript monorepo. Current implementation spreads mutable state across three stores consumed by ~20 components.
</context>

<goal>
Consolidate state into a single store with derived selectors, preserving every existing public API, and remove redundant re-renders on the hot path.
</goal>

<tool_strategy>
- Before modifying, search the codebase with grep for every import of the store modules and list all call sites.
- Use the TypeScript compiler in no-emit mode to confirm no public signature changed.
- Use the existing test suite as the behavioural oracle; do not reason about behaviour from memory.
</tool_strategy>

<tradeoff_and_constraints>
- Value: fewer state sources, predictable updates, lower re-render cost on the hot path.
- Risk: components reading store internals directly may silently break; subscription order changes can alter update timing.
- Invariants: exported function signatures unchanged; no component may observe a partial update; no data is dropped during migration.
</tradeoff_and_constraints>

<workflow_instruction>
Phase 1 — Audit: enumerate all consumers, classify direct-internal vs. public-API access, and list files in scope. Exit when every call site is accounted for.
Phase 2 — Implement: migrate one consumer group per step; keep the type check green after each step.
Phase 3 — Verify: run type check and the full test suite, re-grep for removed imports, and report any invariant that could not be proven.
</workflow_instruction>
```

---

## Escalation and de-escalation

- **Escalate** to heavy when the audit reveals > 3 files or any cross-module contract change, even if the tier router said standard.
- **De-escalate** to light when the user's paragraph reduces to a single mechanical edit. Say so in the trade-off summary.
