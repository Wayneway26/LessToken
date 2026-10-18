# The 5-Pillar Master Workflow

Heavy-tier only. Each pillar fixes a specific failure mode of long Chinese prompts handed to coding agents.

---

## Pillar 1 — XML Isolation

**Failure it fixes:** the agent cannot tell background from instruction, so it treats context as a task.

**Rule:** every block of the prompt lives in a named tag with a single job.

| Tag | Job |
|-----|-----|
| `<context>` | Where the code lives and what must not change |
| `<goal>` | The observable end state |
| `<tool_strategy>` | Which tools to use, and in what order, instead of guessing |
| `<tradeoff_and_constraints>` | Value, risk, and invariants |
| `<workflow_instruction>` | The three-phase execution loop |

**Anti-pattern:** prose paragraphs mixing "the system currently does X" with "please change it to Y". Split them.

---

## Pillar 2 — Zero Defensive Patches

**Failure it fixes:** emotional emphasis ("千万别错", "务必仔细", "一定要") inflates tokens and gives the agent nothing checkable.

**Rule:** every warning becomes a measurable invariant, or it is deleted.

| Chinese source | Bad compiled output | Good compiled output |
|---|---|---|
| 千万别删除数据 | "Be very careful not to delete data" | "Preserve all existing records; writes are append-only." |
| 一定要保证接口不变 | "Make sure the API stays the same" | "All exported signatures remain byte-identical; verify with the type checker." |
| 别搞崩线上 | "Don't break production" | "No schema migration in this change; the deployment must be rollback-safe." |
| 仔细检查 | (delete) | (delete — verification lives in Phase 3) |

Test for a candidate constraint: *can a reviewer mark it pass or fail?* If not, rewrite or drop it.

---

## Pillar 3 — Capability Decoupling

**Failure it fixes:** the agent invents call sites, file locations, and APIs from memory.

**Rule:** `<tool_strategy>` must force discovery before mutation. Name the concrete tools available in the target environment.

Standard opening line:

> Before modifying, search the codebase with grep/find for all references to `<symbol>`.

Then add the verification tool — type checker, test suite, AST query, linter — and the order to use them. Never write "check that it still works"; name the command.

**Anti-pattern:** "You may want to look at related files." That is permission, not a strategy.

---

## Pillar 4 — Bilateral Trade-off Balance

**Failure it fixes:** prompts sell only the upside, so the agent optimizes the goal and ignores the regression.

**Rule:** `<tradeoff_and_constraints>` carries three lines, all mandatory:

- **Value** — what this change buys.
- **Risk** — what can regress, and how far the blast radius reaches.
- **Invariants** — what must remain true regardless of implementation choice.

A one-sided trade-off means Phase 1 was skipped. Go back and audit.

---

## Pillar 5 — 3-Phase Loop

**Failure it fixes:** the agent makes a large speculative change and reports success without evidence.

**Rule:** `<workflow_instruction>` has exactly three phases, each with an exit condition.

| Phase | Content | Exit condition |
|---|---|---|
| **1 — Audit & root cause** | Map call sites, state the root cause, list files in scope | Every reference accounted for |
| **2 — Incremental implementation** | One module per step, build stays green | Each step compiles and tests pass |
| **3 — Deterministic verification** | Run named checks, re-grep, confirm invariants | Every invariant proven or reported as unproven |

**Anti-pattern:** "Phase 1: understand the code. Phase 2: make the changes. Phase 3: test." That is a mood, not a procedure — no exit condition, no tool.

---

## Assembly order

Compose the prompt in pillar order: `<context>` → `<goal>` → `<tool_strategy>` → `<tradeoff_and_constraints>` → `<workflow_instruction>`. A reader must be able to answer, in order: where am I, what is done, how do I find out, what can break, how do I proceed.

## Budget

Target ≤ 600 tokens. When over budget, cut in this order:

1. Restated context the agent can grep.
2. Constraints that duplicate Phase 3 checks.
3. Adjectives and hedges.
4. Never cut invariants or tool names.
