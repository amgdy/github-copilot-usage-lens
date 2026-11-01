import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { DataTable, Figures, type Column } from '../src/components/ui';
import { applyDigitStyle, applyLocale } from '../src/i18n/core';
import { fmtMultiple, fmtPct, fmtUSD, fmtUSDCompact } from '../src/lib/utils/format';
import { splitFigures } from '../src/lib/utils/figures';

/**
 * Figures that answer the question (money, percents, multiples) are set semibold in sentences, so the eye finds them first.
 * Counts, dates, logins and model names stay as they are, so the bold keeps its meaning.
 */

const figuresOf = (text: string): string[] => splitFigures(text).filter((part) => part.figure).map((part) => part.text);

afterEach(() => {
  applyLocale('en', {});
  applyDigitStyle('arabic');
});

describe('splitFigures', () => {
  it('finds money, percents and multiples in English', () => {
    const sentence = `Cash, about ${fmtUSD(9651, 0)} a year. Pool utilization ${fmtPct(0.67, 0)}, ${fmtMultiple(2.5)} the median, ${fmtUSDCompact(12_400)} in total.`;
    expect(figuresOf(sentence)).toEqual(['$9,651', '67%', '2.5×', '$12.4K']);
  });

  it('keeps the sign with the figure', () => {
    expect(figuresOf('Usage went -$5.00 and billed +12.5% versus last month.')).toEqual(['-$5.00', '+12.5%']);
  });

  it('finds the same figures in Arabic digits', () => {
    applyLocale('ar', {});
    const money = fmtUSD(12345.6, 2);
    const share = fmtPct(0.125);
    expect(figuresOf(`استخدام ${money} أي ${share} من المجموع`)).toEqual([money, share]);
    expect(money).toBe('$١٢٬٣٤٥٫٦٠');
    expect(share).toBe('١٢٫٥٪');
  });

  it('leaves counts, dates, logins, model names and variables alone', () => {
    const sentence = 'KofiIto_nwind and busy-1 used GPT-5.2 and Claude Sonnet 4.5 on Aug 1, 2026: 138 users, 4 high-priority actions, $GITHUB_TOKEN, v2.5%.';
    expect(figuresOf(sentence)).toEqual([]);
    expect(splitFigures(sentence)).toEqual([{ text: sentence, figure: false }]);
  });

  it('keeps every character of the sentence, in order', () => {
    const sentence = 'Billed $419 of $1,200 (35%) this month.';
    expect(
      splitFigures(sentence)
        .map((part) => part.text)
        .join(''),
    ).toBe(sentence);
    expect(figuresOf(sentence)).toEqual(['$419', '$1,200', '35%']);
  });

  it('returns nothing for an empty sentence', () => {
    expect(splitFigures('')).toEqual([]);
  });
});

describe('Figures', () => {
  const render = (text: unknown) => renderToStaticMarkup(createElement(Figures, { text: text as string }));

  it('sets each figure in a semibold span and keeps the words as text', () => {
    expect(render('Pool utilization 67% · Auto 24% of usage · 138 active users')).toBe(
      'Pool utilization <span class="fig">67%</span> · Auto <span class="fig">24%</span> of usage · 138 active users',
    );
  });

  it('leaves a sentence without figures, and anything that is not a string, as it is', () => {
    expect(render('Nothing to act on for this period.')).toBe('Nothing to act on for this period.');
    expect(renderToStaticMarkup(createElement(Figures, { text: createElement('em', null, '$5') }))).toBe('<em>$5</em>');
  });

  it('shows a figure typed into the text in the digits the reader chose', () => {
    applyLocale('ar', {});
    expect(render('saves $20 per seat, 80% of the allotment')).toBe('saves <span class="fig">$٢٠</span> per seat, <span class="fig">٨٠٪</span> of the allotment');
    applyDigitStyle('latin');
    expect(render('saves $20 per seat')).toBe('saves <span class="fig">$20</span> per seat');
  });
});

describe('the strong column of a table', () => {
  interface Row {
    name: string;
    usage: number;
    share: number;
  }
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Name', value: (row) => row.name },
    { key: 'usage', header: 'Usage', align: 'end', strong: true, value: (row) => row.usage, render: (row) => fmtUSD(row.usage) },
    { key: 'share', header: 'Share', align: 'end', value: (row) => row.share, render: (row) => fmtPct(row.share) },
  ];

  it('is semibold in the full text color, and the other columns are not', () => {
    const html = renderToStaticMarkup(createElement(DataTable<Row>, { rows: [{ name: 'octo', usage: 12.5, share: 0.4 }], columns, rowKey: (row) => row.name }));
    expect(html).toMatch(/<td class="[^"]*font-semibold text-fg[^"]*">\$12\.50<\/td>/);
    expect(html).toMatch(/<td class="(?![^"]*font-semibold)[^"]*">40\.0%<\/td>/);
  });
});

describe('the figure style', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

  it('is semibold with even-width digits and never wraps', () => {
    const rule = /\.fig \{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(rule).toContain('font-weight: 600');
    expect(rule).toContain('font-variant-numeric: tabular-nums');
    expect(rule).toContain('white-space: nowrap');
  });

  it('takes the full text color inside gray text', () => {
    expect(css).toMatch(/:is\(\.text-fg-muted, \.text-fg-subtle\) > \.fig \{\s*color: var\(--fg\);/);
  });
});
