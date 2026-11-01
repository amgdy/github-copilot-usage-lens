/**
 * Finds the figures in a sentence that a reader looks for first: money ($1,234.50, -$5, $1.2K), percents (67%, +12.5%) and
 * multiples (2.5×), in Latin or Arabic-Indic digits. Plain counts, dates, logins and model names are left alone, because
 * they never hold a "$", "%" or "×" sign.
 */

export interface SentencePart {
  text: string;
  /** True for a money, percent or multiple figure. */
  figure: boolean;
}

const DIGIT = '[0-9\\u0660-\\u0669]';
// Latin "," and "." or the Arabic separators "٬" and "٫" between digit groups.
const NUMBER = `${DIGIT}+(?:[,.\\u066B\\u066C]${DIGIT}+)*`;
const MONEY = `[-+\\u2212]?\\$${NUMBER}(?:[KMBT](?![\\p{L}\\p{N}]))?`;
const PERCENT = `[-+\\u2212]?${NUMBER}[%\\u066A]`;
const MULTIPLE = `${NUMBER}\\u00D7`;
// A figure never starts in the middle of a word or number, so "v2.5%" or "abc$5" are not split.
const FIGURE_PATTERN = new RegExp(`(?<![\\p{L}\\p{N}_$]|\\p{N}[,.\\u066B\\u066C])(?:${MONEY}|${PERCENT}|${MULTIPLE})`, 'gu');

export function splitFigures(text: string): SentencePart[] {
  const parts: SentencePart[] = [];
  let start = 0;
  for (const match of text.matchAll(FIGURE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > start) parts.push({ text: text.slice(start, index), figure: false });
    parts.push({ text: match[0], figure: true });
    start = index + match[0].length;
  }
  if (start < text.length) parts.push({ text: text.slice(start), figure: false });
  return parts;
}
