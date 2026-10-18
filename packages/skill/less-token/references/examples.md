# Few-Shot Calibration

Read a pair that resembles the request at hand. Match the *shape*, not the wording.

---

## 1 — Light, with defensive fluff

**Chinese:** 把这个函数的返回值类型改成 Promise<void>，千万别改错了，改错我就完了

**Compiled:**

> Change this function's return type to `Promise<void>`.

**Why:** two sentences of anxiety, one sentence of intent. The anxiety is not a constraint — it is deleted, not translated.

---

## 2 — Light that looks heavy

**Chinese:**
```
我们现在这个项目的命名规范有点乱，我看了一下，主要是这个变量叫 data 太模糊了，读代码的时候完全看不出来是什么，
所以我想把它改个名字叫 userList，这样以后别人看代码就清楚了，麻烦你帮我改一下，谢谢！
```

**Compiled:**

> Rename the variable `data` to `userList` in this file.

**Why:** 100+ characters, still a rename. Tier is complexity, not verbosity. Mention the de-escalation in the trade-off summary.

---

## 3 — Standard, with workspace context

Context available: active file `src/pages/Settings.tsx`, language `typescript`, selected symbol `SettingsForm`.

**Chinese:** 给设置页加个深色模式开关，切换后存 localStorage，别动现有的主题逻辑

**Compiled:**

```xml
<context>
`src/pages/Settings.tsx` (TypeScript/React). Theme handling already exists in the theme module; `SettingsForm` is the component in scope.
</context>

<goal>
Add a dark mode toggle to `SettingsForm` that persists the user's choice to localStorage and restores it on mount.
</goal>

<constraints>
- Reuse the existing theme module's public API; do not modify its internals.
- Persist under one localStorage key; read it once at startup.
- The toggle reflects the stored value on mount instead of defaulting to off.
</constraints>
```

**Why:** paths and symbols are referenced, not pasted. "别动现有的主题逻辑" became a boundary on the module's API.

**Note:** the detector returns `light` here (44 chars, no component keyword), yet this is component work — new state, persistence, and a mount-time read. Escalate by judgement and record the deviation in the trade-off summary.

---

## 4 — Standard, script task

**Chinese:** 写个脚本，把这个目录下所有 csv 的第二列抽出来合成一个文件，注意有些文件可能有表头有些没有

**Compiled:**

```xml
<context>
Directory of CSV files with inconsistent schema: some include a header row, some do not. Target runtime is Python 3.
</context>

<goal>
Produce a single consolidated file containing column 2 from every CSV in the directory, one value per row.
</goal>

<constraints>
- Detect the header per file; do not assume a uniform layout.
- Skip files with fewer than two columns and report them at the end.
- Preserve source order; write output with UTF-8 encoding.
</constraints>
```

**Why:** "有些文件可能有表头有些没有" is the only real requirement in the sentence — it becomes the first constraint, and the failure path (short files) gets an explicit policy.

---

## 5 — Heavy, refactor

**Chinese:** 帮我重构这个模块的状态管理，千万别破坏现有的接口，最好顺手把性能也优化一下

**Compiled:**

```xml
<context>
State management module in a TypeScript monorepo. Mutable state is spread across three stores consumed by roughly 20 components.
</context>

<goal>
Consolidate state into a single store with derived selectors, preserve every existing public API, and remove redundant re-renders on the hot path.
</goal>

<tool_strategy>
- Before modifying, search the codebase with grep for every import of the three store modules and list all call sites.
- Run the TypeScript compiler in no-emit mode after each step to confirm no public signature changed.
- Treat the existing test suite as the behavioural oracle; do not infer behaviour from memory.
</tool_strategy>

<tradeoff_and_constraints>
- Value: single source of truth, predictable updates, lower re-render cost.
- Risk: components reading store internals break silently; subscription order changes can alter update timing.
- Invariants: exported signatures unchanged; no component observes a partial update; no state is dropped during migration.
</tradeoff_and_constraints>

<workflow_instruction>
Phase 1 — Audit: enumerate all consumers, classify direct-internal vs. public-API access, list files in scope. Exit when every call site is accounted for.
Phase 2 — Implement: migrate one consumer group per step; keep the type check green after each step.
Phase 3 — Verify: run the type check and full test suite, re-grep for removed imports, report any invariant that could not be proven.
</workflow_instruction>
```

**Why:** "千万别破坏接口" → invariant + type-check gate. "顺手优化性能" → a scoped goal (re-renders on the hot path), not an open-ended performance project.

---

## 6 — Heavy, data migration

**Chinese:** 我们要把订单表拆成订单主表和明细表，历史数据要迁过去，不能丢数据，线上也不能停

**Compiled:**

```xml
<context>
Order storage is a single table holding both order headers and line items. The application reads and writes it in production with no maintenance window available.
</context>

<goal>
Split the table into an order header table and an order line-item table, migrate all historical rows, and keep the application serving traffic throughout.
</goal>

<tool_strategy>
- Before modifying, grep for every query against the orders table and classify reads, writes, and joins.
- Inspect the live schema and row counts before writing the migration.
- Run the migration in a transaction on a staging copy first; compare row counts and checksums against production.
</tool_strategy>

<tradeoff_and_constraints>
- Value: normalized schema, cheaper line-item queries, room for per-item attributes.
- Risk: dual-write drift during cutover; joins that assume a single table fail silently.
- Invariants: zero row loss; every historical order remains readable; the old read path stays valid until the new one is verified.
</tradeoff_and_constraints>

<workflow_instruction>
Phase 1 — Audit: map every query, count rows, define the mapping between old and new columns. Exit when the mapping is total and no query is unclassified.
Phase 2 — Implement: add new tables, enable dual-write, backfill in batches, switch reads behind a flag. Exit when backfill reconciles to zero diff.
Phase 3 — Verify: compare counts and checksums, exercise rollback on staging, remove the old path only after a full traffic cycle.
</workflow_instruction>
```

**Why:** "不能丢数据" and "不能停" are the whole task, so they become invariants plus a phased cutover — not two more sentences of urgency.

---

## 7 — Ambiguous request

**Chinese:** 优化一下这个页面

**Compiled:**

> Scope this request first: which metric defines "optimize" — load time, bundle size, render count, or accessibility? Name the page and the metric; do not change behaviour until the target is fixed.

**Why:** the intent is genuinely underspecified. Rather than inventing a goal, the compiled prompt makes the missing decision explicit and blocks premature edits. Note the gap in the trade-off summary instead of hiding it.

---

## 8 — Mixed-language input

**Chinese:** 帮我把这个 API 的 error handling 统一一下，现在有的地方 try-catch 有的地方直接 throw，太乱了

**Compiled:**

```xml
<context>
HTTP API layer with inconsistent error handling: some handlers wrap calls in try/catch, others let errors propagate.
</context>

<goal>
Unify error handling across the API layer under a single strategy, so every handler fails the same way.
</goal>

<constraints>
- One strategy for the whole layer; state it explicitly before changing handlers.
- Preserve existing HTTP status codes and response shapes.
- Do not swallow errors that currently reach the global handler.
</constraints>
```

**Why:** embedded English terms stay English; the emotional judgement ("太乱了") is dropped and replaced with the observable symptom.
