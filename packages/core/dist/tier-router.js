"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPONENT_KEYWORDS = exports.HEAVY_KEYWORDS = void 0;
exports.detectTier = detectTier;
/**
 * Keywords that signal a complex, multi-module, or architectural task.
 * Used by {@link detectTier} to identify Heavy (Tier 3) inputs.
 */
exports.HEAVY_KEYWORDS = [
    '重构',
    '迁移',
    '架构',
    '模块',
    '状态管理',
    '数据治理',
    '多表',
    '事务',
    '并发',
    '性能优化',
    '数据一致性',
    '回滚',
];
/**
 * Keywords that indicate a component-level or scripting task.
 * These overlap with heavy keywords and are used for Light-tier exclusion
 * in {@link detectTier}.
 */
exports.COMPONENT_KEYWORDS = [
    '重构',
    '迁移',
    '架构',
    '模块',
    '状态管理',
    '数据治理',
    '批量',
    '多个文件',
    '组件',
];
/**
 * Heuristically detect the appropriate compilation tier from a Chinese
 * developer input string.
 *
 * **Rules:**
 * - **Light (Tier 1):** Input ≤ 80 chars, at most 1 newline, and does not
 *   contain any {@link COMPONENT_KEYWORDS}.
 * - **Heavy (Tier 3):** Input contains ≥ 2 {@link HEAVY_KEYWORDS}, OR input
 *   is > 500 chars with > 3 newlines.
 * - **Standard (Tier 2):** Everything else.
 *
 * @param chineseInput - The raw Chinese developer request.
 * @returns The detected tier level (never `'auto'`).
 */
function detectTier(chineseInput) {
    const input = chineseInput.trim();
    const newlineCount = (input.match(/\n/g) || []).length;
    // --- Heavy detection ---
    const heavyHitCount = exports.HEAVY_KEYWORDS.reduce((count, kw) => count + (input.includes(kw) ? 1 : 0), 0);
    if (heavyHitCount >= 2) {
        return 'heavy';
    }
    if (input.length > 500 && newlineCount > 3) {
        return 'heavy';
    }
    // --- Light detection ---
    if (input.length <= 80 && newlineCount <= 1) {
        const hasComponentKeyword = exports.COMPONENT_KEYWORDS.some((kw) => input.includes(kw));
        if (!hasComponentKeyword) {
            return 'light';
        }
    }
    // --- Default ---
    return 'standard';
}
//# sourceMappingURL=tier-router.js.map