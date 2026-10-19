#!/usr/bin/env node
/**
 * Renders one canonical spec into the plugin format of each agent host.
 *
 * The spec (spec/enhance.md) is the single source of truth. Each host gets the same
 * body wrapped in its own frontmatter, with {{REQUEST}} resolved to whatever that
 * host calls "the input the user typed".
 *
 * Usage: node packages/agent-plugin/build.mjs
 */

import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');

const SPEC = readFileSync(join(ROOT, 'spec', 'enhance.md'), 'utf8').trim();

const DESCRIPTION =
  'Compile a rough Chinese developer request into a precise, token-efficient English prompt for a coding agent.';

const TARGETS = [
  {
    id: 'claude-code',
    files: [
      {
        path: '.claude-plugin/plugin.json',
        json: {
          name: 'less-token',
          version: '0.1.0',
          description: DESCRIPTION,
          author: { name: 'LessToken' },
          keywords: ['prompt', 'chinese', 'translation', 'prompt-engineering'],
        },
      },
      {
        path: 'commands/enhance.md',
        request: 'the text after this command (`$ARGUMENTS`)',
        frontmatter: {
          description: DESCRIPTION,
          'argument-hint': '<chinese request>',
        },
      },
      {
        path: 'skills/less-token/SKILL.md',
        request: "the user's current message",
        frontmatter: {
          name: 'less-token',
          description: `${DESCRIPTION} Use when a Chinese request must become an English prompt for another agent, or when the user asks to 优化提示词 / 压缩 prompt / 写成 master prompt.`,
        },
      },
    ],
  },
  {
    id: 'codex',
    files: [
      {
        path: 'prompts/enhance.md',
        request: 'the text after this command (`$ARGUMENTS`)',
        frontmatter: {
          description: DESCRIPTION,
          'argument-hint': '<chinese request>',
        },
      },
    ],
  },
  {
    id: 'workbuddy',
    files: [
      {
        path: 'skills/less-token/SKILL.md',
        request: "the user's current message",
        frontmatter: {
          name: 'less-token',
          description: `${DESCRIPTION} Use when a Chinese request must become an English prompt for another agent, or when the user asks to 优化提示词 / 压缩 prompt / 写成 master prompt.`,
          agent_created: true,
        },
      },
    ],
  },
  {
    id: 'cursor',
    files: [
      {
        path: '.cursor/rules/less-token.mdc',
        request: "the user's current message",
        frontmatter: {
          description: DESCRIPTION,
          alwaysApply: false,
        },
      },
    ],
  },
];

function renderFrontmatter(fields) {
  const lines = Object.entries(fields).map(([key, value]) => {
    const text = String(value);
    return `${key}: ${/[:#]/.test(text) ? JSON.stringify(text) : text}`;
  });
  return `---\n${lines.join('\n')}\n---\n\n`;
}

function renderBody(request) {
  return SPEC.replaceAll('{{REQUEST}}', request);
}

rmSync(DIST, { recursive: true, force: true });

let written = 0;
for (const target of TARGETS) {
  for (const file of target.files) {
    const outPath = join(DIST, target.id, file.path);
    mkdirSync(dirname(outPath), { recursive: true });

    const content = file.json
      ? `${JSON.stringify(file.json, null, 2)}\n`
      : renderFrontmatter(file.frontmatter) + renderBody(file.request);

    writeFileSync(outPath, content, 'utf8');
    written += 1;
    console.log(`  ${target.id}/${file.path.replaceAll('\\', '/')}`);
  }
}

console.log(`\n${written} files written to ${DIST}`);
