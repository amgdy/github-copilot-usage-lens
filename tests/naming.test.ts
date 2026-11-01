import { existsSync, globSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The product is always called "GitHub Copilot", never just "Copilot". This scans the source, the scripts, the docs and the
 * Arabic dictionaries. Identifiers such as GitHubCopilotIcon and lower-case ids or URLs such as /copilot/ are fine.
 */

const ROOT = join(import.meta.dirname, '..');
const BARE = /(?<!GitHub\s)(?<![\w/.\-])Copilot\b/g;

const FILES = [
  ...globSync('{src,scripts,docs}/**/*.{ts,tsx,css,md,html,sh,ps1}', { cwd: ROOT })
    .sort()
    .map((file) => join(ROOT, file)),
  ...['index.html', 'README.md', 'AGENTS.md', 'package.json'].map((file) => join(ROOT, file)).filter(existsSync),
];

describe('naming', () => {
  it('scans a reasonable number of files', () => {
    expect(FILES.length).toBeGreaterThan(50);
  });

  it('always says "GitHub Copilot", not just "Copilot"', () => {
    const bad: string[] = [];
    for (const file of FILES) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(BARE)) {
        const line = text.slice(0, match.index).split('\n').length;
        const lineText = text.split('\n')[line - 1].trim();
        bad.push(`${relative(ROOT, file)}:${line}: ${lineText.slice(0, 120)}`);
      }
    }
    expect(bad, `Write "GitHub Copilot" in:\n${bad.join('\n')}`).toEqual([]);
  });
});
