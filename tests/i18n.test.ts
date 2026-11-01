import { existsSync, globSync, readFileSync, writeFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { parseAst } from 'vite';
import { describe, expect, it } from 'vitest';
import { placeholdersOf, type Dict, type Entry } from '../src/i18n/core';
import { METRICS } from '../src/lib/metrics/registry';
import type { MetricDoc } from '../src/lib/metrics/types';
import { LINKS } from '../src/lib/links';

/**
 * Keeps the Arabic version complete and the layout right-to-left safe:
 *  - every English text passed to t(), tp(), msg(), pluralize() or <T text> has an Arabic entry,
 *  - each Arabic entry keeps the {placeholders} of its English key,
 *  - no English key is defined in two dictionary files,
 *  - the user sees no raw English in JSX (text, text props, label/title/… object fields),
 *  - class names use start/end (ms, pe, start-0, text-end, border-s…) instead of left/right.
 * The source checks run on the paths in ENFORCED. While an area is being translated, run
 * `I18N_ENFORCE=pages/users/,components/user/ npx vitest run tests/i18n.test.ts` to check it.
 * Add `I18N_DUMP=/tmp/missing.json` to get the full list of texts that still need Arabic.
 */

const SOURCE_DIR = join(import.meta.dirname, '..', 'src');

const ENFORCED = [
  'pages/',
  'components/',
  'App.tsx',
  'components/Landing.tsx',
  'components/charts/',
  'components/layout/AppShell.tsx',
  'components/layout/CoverageNotice.tsx',
  'components/layout/DateRange.tsx',
  'components/layout/ExportMenu.tsx',
  'components/layout/FilterChips.tsx',
  'components/layout/FilterDrawer.tsx',
  'components/layout/LanguageButton.tsx',
  'components/layout/PrintHeader.tsx',
  'components/layout/Sidebar.tsx',
  'components/layout/TopBar.tsx',
  'components/layout/nav.tsx',
  'components/ui/',
  'lib/analytics/taxonomy.ts',
  'lib/analytics/',
  'lib/licenses/',
  'lib/collection/',
  'lib/export/',
  'lib/pricing/card.ts',
  'lib/metrics/settingRefs.ts',
  'lib/metrics/types.ts',
  'lib/types.ts',
  'pages/MethodologyPage.tsx',
  'pages/methodology/',
  'pages/shared.tsx',
  'state/filterChips.ts',
  'state/loadDataset.ts',
  'state/loadSample.ts',
];

const ENFORCE_EXTRA = (process.env.I18N_ENFORCE ?? '')
  .split(',')
  .map((path) => path.trim())
  .filter(Boolean);

/**
 * Metric explanation areas (or docs files such as 'docs/users.ts') whose texts must all have Arabic.
 * `I18N_DOCS_ENFORCE=docs/users.ts` checks one docs file while it is being translated.
 */
const DOCS_ENFORCED: string[] = ['*'];
const DOCS_ENFORCE_EXTRA = (process.env.I18N_DOCS_ENFORCE ?? '')
  .split(',')
  .map((area) => area.trim())
  .filter(Boolean);

const enforced = (file: string) => [...ENFORCED, ...ENFORCE_EXTRA].some((path) => file === path || (path.endsWith('/') && file.startsWith(path)));

// ---- Dictionaries ------------------------------------------------------------------------------

const DICT_FILES = import.meta.glob<{ default: Dict }>('../src/i18n/ar/*.ts', { eager: true });
const ARABIC: Dict = Object.assign({}, ...Object.values(DICT_FILES).map((dictionaryModule) => dictionaryModule.default));
const hasArabic = (key: string) => Object.hasOwn(ARABIC, key);

const expectNone = (problems: string[]) => expect(problems, problems.join('\n')).toEqual([]);
const same = (a: string[], b: string[]) => a.length === b.length && a.every((value, index) => value === b[index]);

/**
 * `I18N_DUMP=/tmp/missing.json` adds the full English text of every key that still needs Arabic to that
 * file (the failure message cuts long texts). Both checks append, so delete the file before a run.
 */
function dumpMissing(texts: string[]) {
  const path = process.env.I18N_DUMP;
  if (!path || !texts.length) return;
  const before: string[] = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : [];
  writeFileSync(path, JSON.stringify([...new Set([...before, ...texts])], null, 2));
}

function placeholderProblem(key: string, translation: Entry): string | null {
  const want = placeholdersOf(key);
  if (typeof translation === 'string') return same(placeholdersOf(translation), want) ? null : `{${want}} in English, {${placeholdersOf(translation)}} in Arabic`;
  for (const [form, text] of Object.entries(translation)) {
    if (typeof text !== 'string') continue;
    const extra = placeholdersOf(text).filter((placeholder) => !want.includes(placeholder));
    if (extra.length) return `form "${form}" has unknown {${extra}}`;
    // The singular and dual forms may spell the number out, so only {n} may be left out of them.
    const needed = form === 'one' || form === 'two' ? want.filter((placeholder) => placeholder !== 'n') : want;
    const missing = needed.filter((placeholder) => !placeholdersOf(text).includes(placeholder));
    if (missing.length) return `form "${form}" lacks {${missing}}`;
  }
  return null;
}

describe('i18n: Arabic dictionaries', () => {
  it('loads at least one dictionary file', () => {
    expect(Object.keys(DICT_FILES).length).toBeGreaterThan(0);
  });

  it('defines each English key in one file only', () => {
    const where = new Map<string, string[]>();
    for (const [path, dictionaryModule] of Object.entries(DICT_FILES)) {
      for (const key of Object.keys(dictionaryModule.default)) where.getOrInsertComputed(key, () => []).push(path.split('/').pop()!);
    }
    expectNone([...where].filter(([, files]) => files.length > 1).map(([key, files]) => `"${key}" is in ${files.join(' and ')}`));
  });

  it('keeps the {placeholders} of every key', () => {
    const bad: string[] = [];
    for (const [key, translation] of Object.entries(ARABIC)) {
      const problem = placeholderProblem(key, translation);
      if (problem) bad.push(`"${key.slice(0, 80)}": ${problem}`);
    }
    expectNone(bad);
  });

  it('has no empty translations', () => {
    const bad = Object.entries(ARABIC)
      .filter(([, translation]) => (typeof translation === 'string' ? !translation.trim() : Object.values(translation).some((text) => typeof text === 'string' && !text.trim())))
      .map(([key]) => `"${key.slice(0, 80)}" is empty`);
    expectNone(bad);
  });

  it('translates official guidance titles', () => {
    expectNone(Object.values(LINKS).map((link) => link.label).filter((label) => !hasArabic(label)));
  });
});

// ---- Source scan -------------------------------------------------------------------------------

interface AstNode {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

const isNode = (value: unknown): value is AstNode => typeof value === 'object' && value !== null && typeof (value as AstNode).type === 'string';

function childrenOf(node: AstNode): AstNode[] {
  const out: AstNode[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (key === 'type') continue;
    if (Array.isArray(value)) {
      for (const item of value) if (isNode(item)) out.push(item);
    } else if (isNode(value)) out.push(value);
  }
  return out;
}

const literal = (node: unknown): string | null => {
  if (!isNode(node)) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && (node.expressions as unknown[]).length === 0) return (node.quasis as { value: { cooked: string } }[])[0].value.cooked;
  return null;
};

/** The fixed text pieces of a string or template literal, for spotting raw English. */
const textPieces = (node: unknown): string[] => {
  if (!isNode(node)) return [];
  if (node.type === 'Literal' && typeof node.value === 'string') return [node.value];
  if (node.type === 'TemplateLiteral') return (node.quasis as { value: { cooked: string } }[]).map((quasi) => quasi.value.cooked);
  return [];
};

const WORDS = /[A-Za-z]{2,}/;
const TEXT_PROPS = new Set(['label', 'title', 'hint', 'description', 'subtitle', 'placeholder', 'aria-label', 'alt', 'caption', 'emptyText', 'tooltip', 'heading', 'note']);
const TEXT_KEYS = new Set(['label', 'title', 'hint', 'description', 'subtitle', 'placeholder', 'caption', 'tooltip', 'heading', 'note', 'detail', 'summary', 'why', 'action']);
const CODE_TAGS = new Set(['code', 'pre', 'kbd', 'samp']);
const PHYSICAL =
  /(?<![\w-])(?:[\w-]+:)*-?(?:ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|scroll-ml|scroll-mr|space-x-reverse|text-left|text-right|float-left|float-right)(?:-[\w./[\]%-]+)?(?![\w-])/g;

interface Found {
  file: string;
  line: number;
  text: string;
}

/** Every TypeScript source file under src, as paths relative to src. */
const sourceFiles = (): string[] => globSync('**/*.{ts,tsx}', { cwd: SOURCE_DIR }).filter((file) => !file.endsWith('.d.ts')).sort();

function scan() {
  const keys: Found[] = [];
  const raw: Found[] = [];
  const physical: Found[] = [];
  const parseErrors: string[] = [];

  for (const entry of sourceFiles()) {
    const path = join(SOURCE_DIR, entry);
    const file = entry.split(sep).join('/');
    if (file.startsWith('i18n/ar/') || file.startsWith('lib/metrics/docs/')) continue;
    const text = readFileSync(path, 'utf8');
    let program: AstNode;
    try {
      program = parseAst(text, { lang: path.endsWith('.tsx') ? 'tsx' : 'ts' }, path) as unknown as AstNode;
    } catch (error) {
      parseErrors.push(`${file}: ${String(error).slice(0, 120)}`);
      continue;
    }
    const lineOf = (node: AstNode) => text.slice(0, node.start).split('\n').length;
    const key = (node: AstNode, keyText: string | null) => keyText !== null && keys.push({ file, line: lineOf(node), text: keyText });
    const rawText = (node: AstNode, snippet: string) => raw.push({ file, line: lineOf(node), text: snippet.trim().slice(0, 80) });

    const classStrings = (node: AstNode) => {
      for (const piece of textPieces(node)) for (const match of piece.matchAll(PHYSICAL)) physical.push({ file, line: lineOf(node), text: match[0] });
      for (const child of childrenOf(node)) classStrings(child);
    };

    const visit = (node: AstNode, inCode: boolean) => {
      if (node.type === 'CallExpression' && isNode(node.callee) && node.callee.type === 'Identifier') {
        const name = node.callee.name as string;
        const args = node.arguments as AstNode[];
        if (name === 't' || name === 'msg') key(node, literal(args[0]));
        else if (name === 'tp') key(node, literal(args[2]));
        else if (name === 'pluralize') {
          const one = literal(args[1]);
          const many = args[2] ? literal(args[2]) : one === null ? null : `${one}s`;
          if (many !== null) key(node, `{n} ${many}`);
        } else if (name === 'cx') classStrings(node);
      }
      if (node.type === 'JSXElement') {
        const opening = node.openingElement as AstNode;
        const nameNode = opening.name as AstNode;
        const tag = nameNode.type === 'JSXIdentifier' ? (nameNode.name as string) : '';
        if (tag === 'T') {
          const textAttr = (opening.attributes as AstNode[]).find((attribute) => attribute.type === 'JSXAttribute' && (attribute.name as AstNode).name === 'text');
          const textValue = textAttr?.value as AstNode | undefined;
          key(node, literal(textValue?.type === 'JSXExpressionContainer' ? textValue.expression : textValue));
        }
        const code = inCode || CODE_TAGS.has(tag);
        for (const child of node.children as AstNode[]) {
          if (!code && child.type === 'JSXText' && WORDS.test(child.value as string)) rawText(child, child.value as string);
          if (!code && child.type === 'JSXExpressionContainer' && textPieces(child.expression).some((piece) => WORDS.test(piece))) rawText(child, textPieces(child.expression).join('…'));
        }
        visit(opening, code);
        for (const child of node.children as AstNode[]) visit(child, code);
        return;
      }
      if (node.type === 'JSXAttribute') {
        const name = (node.name as AstNode).name as string;
        const attributeValue = node.value as AstNode | null;
        const inner = attributeValue?.type === 'JSXExpressionContainer' ? (attributeValue.expression as AstNode) : attributeValue;
        if (/className$/i.test(name) && attributeValue) classStrings(attributeValue);
        else if (TEXT_PROPS.has(name) && inner && textPieces(inner).some((piece) => WORDS.test(piece))) rawText(node, `${name}="${textPieces(inner).join('…')}"`);
      }
      if (node.type === 'Property' && !node.computed && isNode(node.key)) {
        const propertyName = (node.key.name ?? node.key.value) as string | undefined;
        if (propertyName && /className$/i.test(propertyName)) classStrings(node.value as AstNode);
        else if (propertyName && TEXT_KEYS.has(propertyName) && textPieces(node.value).some((piece) => WORDS.test(piece))) rawText(node, `${propertyName}: ${textPieces(node.value).join('…')}`);
      }
      for (const child of childrenOf(node)) visit(child, inCode);
    };
    visit(program, false);
  }
  return { keys, raw, physical, parseErrors };
}

const SCAN = scan();
const formatFinding = (finding: Found, what: string) => `${finding.file}:${finding.line}: ${what}`;

describe('i18n: source', () => {
  it('parses every source file', () => {
    expectNone(SCAN.parseErrors);
  });

  it('finds the texts marked for translation', () => {
    expect(SCAN.keys.length).toBeGreaterThan(50);
  });

  it('has Arabic for every text passed to t, tp, msg, pluralize and <T> (enforced paths)', () => {
    const missing = SCAN.keys.filter((key) => enforced(key.file) && !hasArabic(key.text));
    dumpMissing(missing.map((key) => key.text));
    expectNone(missing.map((key) => formatFinding(key, `no Arabic for "${key.text.slice(0, 100)}"`)));
  });

  it('shows no raw English in JSX (enforced paths)', () => {
    expectNone(SCAN.raw.filter((rawText) => enforced(rawText.file)).map((rawText) => formatFinding(rawText, `wrap in t() or msg(): ${rawText.text}`)));
  });

  it('uses start/end classes instead of left/right (enforced paths)', () => {
    expectNone(SCAN.physical.filter((physicalClass) => enforced(physicalClass.file)).map((physicalClass) => formatFinding(physicalClass, `use a start/end class instead of "${physicalClass.text}"`)));
  });
});

// ---- Metric explanations -----------------------------------------------------------------------

const docTexts = (doc: MetricDoc): string[] => [doc.title, doc.meaning, doc.formula, ...(doc.steps ?? []), ...(doc.notes ?? []), ...(doc.example ? [doc.example] : [])];

/** Doc id → 'docs/<file>.ts', so a docs file can be checked on its own (areas span several files). */
const DOC_FILES = import.meta.glob<Record<string, unknown>>('../src/lib/metrics/docs/*.ts', { eager: true });
const FILE_OF = new Map<string, string>();
for (const [path, docsModule] of Object.entries(DOC_FILES)) {
  const name = `docs/${path.split('/').pop()}`;
  for (const exported of Object.values(docsModule)) if (Array.isArray(exported)) for (const doc of exported as MetricDoc[]) if (doc?.id) FILE_OF.set(doc.id, name);
}

describe('i18n: metric explanations', () => {
  it('have Arabic for every text in the translated areas or docs files', () => {
    const wanted = new Set([...DOCS_ENFORCED, ...DOCS_ENFORCE_EXTRA]);
    const inScope = (doc: MetricDoc) => wanted.has('*') || wanted.has(doc.area) || wanted.has(FILE_OF.get(doc.id) ?? '');
    const bad: string[] = [];
    for (const doc of METRICS) {
      if (!inScope(doc)) continue;
      for (const text of docTexts(doc)) if (!hasArabic(text)) bad.push(`${doc.id}: no Arabic for "${text.slice(0, 80)}"`);
    }
    dumpMissing(METRICS.filter(inScope).flatMap((doc) => docTexts(doc).filter((text) => !hasArabic(text))));
    expectNone(bad);
  });
});
