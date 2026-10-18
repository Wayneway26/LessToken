#!/usr/bin/env python3
"""Deterministic tier detector for the LessToken skill.

Ports `packages/core/src/tier-router.ts` so the skill and the TypeScript engine
agree on routing. Reads the Chinese request from argv or stdin.

Usage:
    python detect_tier.py "帮我把返回类型改成 Promise<string>"
    python detect_tier.py --json "重构状态管理，保证数据一致性"
    echo "给设置页加个开关" | python detect_tier.py
"""

from __future__ import annotations

import json
import sys

HEAVY_KEYWORDS = (
    "重构",
    "迁移",
    "架构",
    "模块",
    "状态管理",
    "数据治理",
    "多表",
    "事务",
    "并发",
    "性能优化",
    "数据一致性",
    "回滚",
)

COMPONENT_KEYWORDS = (
    "重构",
    "迁移",
    "架构",
    "模块",
    "状态管理",
    "数据治理",
    "批量",
    "多个文件",
    "组件",
)

LIGHT_MAX_CHARS = 80
LIGHT_MAX_NEWLINES = 1
HEAVY_MIN_CHARS = 500
HEAVY_MIN_NEWLINES = 3
HEAVY_MIN_HITS = 2


def detect_tier(text: str) -> dict:
    """Return the tier plus the signals that produced it."""
    stripped = text.strip()
    newlines = stripped.count("\n")
    heavy_hits = [kw for kw in HEAVY_KEYWORDS if kw in stripped]

    if len(heavy_hits) >= HEAVY_MIN_HITS:
        tier, reason = "heavy", f"{len(heavy_hits)} heavy keywords"
    elif len(stripped) > HEAVY_MIN_CHARS and newlines > HEAVY_MIN_NEWLINES:
        tier, reason = "heavy", f"{len(stripped)} chars with {newlines} newlines"
    elif (
        len(stripped) <= LIGHT_MAX_CHARS
        and newlines <= LIGHT_MAX_NEWLINES
        and not any(kw in stripped for kw in COMPONENT_KEYWORDS)
    ):
        tier, reason = "light", "short input without component keywords"
    else:
        tier, reason = "standard", "default"

    return {
        "tier": tier,
        "reason": reason,
        "length": len(stripped),
        "newlines": newlines,
        "heavy_hits": heavy_hits,
    }


def main(argv: list[str]) -> int:
    args = [a for a in argv[1:] if a != "--json"]
    as_json = "--json" in argv[1:]

    text = " ".join(args) if args else sys.stdin.read()
    if not text.strip():
        print("usage: detect_tier.py [--json] <chinese request>", file=sys.stderr)
        return 2

    result = detect_tier(text)
    if as_json:
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(result["tier"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
