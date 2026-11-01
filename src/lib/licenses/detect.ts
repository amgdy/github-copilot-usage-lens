import { CsvTokenizer, detectDelimiter } from '../csv/tokenizer';
import { hasDateColumn, hasLoginColumn, hasUsageColumn, isUsageHeader, normalizeHeader } from './columns';
import { listTokens, looksTabular } from './list';
import { readLogin } from './login';

/** The number of characters the detector reads. Larger files are judged by their first lines only. */
export const SNIFF_CHARS = 4096;

/** Where an uploaded file belongs: a usage report, a license export, a GitHub data file of the collector scripts, or neither (the caller decides). */
export type UploadKind = 'usage' | 'license' | 'collection' | 'unknown';

/** The header line of a GitHub data file (scripts/collect.sh and scripts/collect.ps1). */
const COLLECTION_HEADER_KIND = /"kind"\s*:\s*"header"/;
const COLLECTION_HEADER_FORMAT = /"format"\s*:\s*"github-copilot-usage-lens-data"/;

/** Keys that only a seat list of the GitHub API has. They sit in the first few hundred characters of the response. */
const LICENSE_JSON_KEY =
  /"seats"\s*:\s*\[|"(?:total_seats|assignee|plan_type|last_activity_at|last_authenticated_at|pending_cancellation_date|assigning_team)"\s*:/;
const LIST_NAME = /\.(txt|list|logins)$/i;
const NAMED_LIST_SHARE = 0.8;

function firstRow(head: string): string[] {
  const found: string[][] = [];
  const tokenizer = new CsvTokenizer(detectDelimiter(head), (fields) => {
    if (found.length === 0) found.push(fields);
  });
  const end = head.indexOf('\n');
  tokenizer.push(end === -1 ? head : head.slice(0, end + 1));
  tokenizer.end();
  return found[0] ?? [];
}

/** The head of a text that ended in the middle of a line: cut at the last separator so no half token is judged. */
function wholeTokens(head: string, truncated: boolean): string {
  if (!truncated) return head;
  let lastSeparatorIndex = -1;
  for (const separator of ['\n', '\r', ',', ';', ' ', '\t']) lastSeparatorIndex = Math.max(lastSeparatorIndex, head.lastIndexOf(separator));
  return lastSeparatorIndex > 0 ? head.slice(0, lastSeparatorIndex) : head;
}

function isLoginList(head: string, truncated: boolean, fileName: string): boolean {
  const text = wholeTokens(head, truncated);
  if (looksTabular(text)) return false;
  if (LIST_NAME.test(fileName)) {
    const tokens = listTokens(text);
    const valid = tokens.filter((token) => readLogin(token) !== null).length;
    return valid >= 1 && valid / tokens.length >= NAMED_LIST_SHARE;
  }
  // Without a list-like name, only a column of logins (one per line, at least two lines) is taken for a list.
  const lines = text
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#') && !line.startsWith('//'));
  return lines.length >= 2 && lines.every((line) => readLogin(line) !== null);
}

/**
 * Decides from the first few kilobytes whether a file is a license export or a usage report. The usage check
 * always comes first: a header with usage columns, or a date column next to a login column, is a usage report
 * and never a license file. License files are the REST seats JSON (it has keys like "seats" or "assignee"),
 * a CSV with a login column and no usage or date column (the Activity report), and a plain list of logins.
 * A GitHub data file of the collector scripts starts with its header line; its seat lines would also look like a seat list.
 */
export function classifyUpload(text: string, fileName?: string): UploadKind {
  const truncated = text.length > SNIFF_CHARS;
  const head = text.slice(0, SNIFF_CHARS).replace(/^\uFEFF/, '').trimStart();
  if (head === '') return 'unknown';
  if (head[0] === '{') {
    const firstLine = head.split('\n', 1)[0];
    if (COLLECTION_HEADER_KIND.test(firstLine) && COLLECTION_HEADER_FORMAT.test(firstLine)) return 'collection';
  }
  if (head[0] === '{' || head[0] === '[') return LICENSE_JSON_KEY.test(head) ? 'license' : 'unknown';

  const names = firstRow(head).map(normalizeHeader);
  if (names.length > 1) {
    if (isUsageHeader(names)) return 'usage';
    if (hasLoginColumn(names)) return 'license';
  } else if (names.length === 1 && (hasUsageColumn(names) || hasDateColumn(names))) {
    return 'unknown';
  }
  return isLoginList(head, truncated, fileName ?? '') ? 'license' : 'unknown';
}

/** Whether a file is a license export (see `classifyUpload`). Cheap for large files. */
export const looksLikeLicenseFile = (text: string, fileName?: string): boolean => classifyUpload(text, fileName) === 'license';
