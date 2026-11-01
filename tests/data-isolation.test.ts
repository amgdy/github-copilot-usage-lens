import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

/** Source files under one project folder, as paths relative to the project root. */
const sourceFiles = (directory: string): string[] =>
  globSync('**/*.{js,jsx,ts,tsx,cjs,mjs,cts,mts}', { cwd: join(ROOT, directory) })
    .map((file) => join(directory, file))
    .sort();

const literals = (text: string): string[] => text.match(/(['"`])(?:\\.|(?!\1)[^\\\r\n])*\1/g) ?? [];

it('does not import or read customer files from the samples directory', () => {
  const files = ['src', 'scripts', 'tests'].flatMap(sourceFiles);
  const violations: string[] = [];
  for (const path of files) {
    if (path.endsWith('data-isolation.test.ts')) continue;
    // Comments and documentation may warn about the directory; executable paths must not use it.
    // A bare 'samples' literal is a path segment too, as in join(dir, '..', 'samples').
    for (const literal of literals(readFileSync(join(ROOT, path), 'utf8'))) {
      if (/(?:\.\.\/|\.\/|\/)samples(?:\/|['"`])/.test(literal) || /^['"`]samples(?:\/[^'"`]*)?['"`]$/.test(literal)) {
        violations.push(`${path}: ${literal.slice(0, 100)}`);
      }
    }
  }
  expect(violations).toEqual([]);
});

/** The sample report button is the one way into the generator, and it downloads the generator only when clicked. */
const SAMPLE_LOADER = join('src', 'state', 'loadSample.ts');

it('keeps the made-up data generator behind the sample report button', () => {
  const demoDirectory = join('src', 'lib', 'demo');
  const importers: string[] = [];
  for (const path of sourceFiles('src')) {
    if (path.startsWith(demoDirectory)) continue;
    if (literals(readFileSync(join(ROOT, path), 'utf8')).some((literal) => /\/demo(?:\/|['"`])/.test(literal))) importers.push(path);
  }
  expect(importers).toEqual([SAMPLE_LOADER]);

  const loader = readFileSync(join(ROOT, SAMPLE_LOADER), 'utf8');
  expect(loader).toMatch(/await Promise\.all\(\[import\('\.\.\/lib\/demo\/generate'\), import\('\.\.\/lib\/demo\/github'\)\]\)/);
  expect(loader).not.toMatch(/^\s*import\b[^;]*from\s+['"][^'"]*\/demo\//m);
});
