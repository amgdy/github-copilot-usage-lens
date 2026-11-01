import { COLLECTION_FORMAT, CollectionReader, type Collection } from '../src/lib/collection';

/** Builders for made-up GitHub data files, as the collector scripts write them. */

export type Line = Record<string, unknown>;

export const header = (extra: Line = {}): Line => ({
  kind: 'header',
  format: COLLECTION_FORMAT,
  version: 1,
  collector: 'collect.sh',
  collectorVersion: '1.0.0',
  host: 'github.com',
  scope: 'enterprise',
  enterprise: 'octocorp',
  organizations: [],
  months: ['2026-08', '2026-09'],
  startedAt: '2026-10-02T08:00:00Z',
  ...extra,
});

export const recordLine = (kind: string, record: Line, extra: Line = {}): Line => ({ kind, scope: 'enterprise', target: 'octocorp', record, ...extra });

export const sourceLine = (id: string, status: string, extra: Line = {}): Line => ({
  kind: 'source', id, scope: 'enterprise', target: 'octocorp', status, records: 1, http: 200, message: '', endpoint: '/x', ...extra,
});

export const END: Line = { kind: 'end', finishedAt: '2026-10-02T08:05:00Z', records: 0 };

export const textOf = (lines: readonly (Line | string)[]): string => lines.map((line) => (typeof line === 'string' ? line : JSON.stringify(line))).join('\n') + '\n';

export function readLines(lines: readonly (Line | string)[]): Collection {
  const reader = new CollectionReader();
  for (const line of textOf(lines).split('\n')) reader.push(line);
  return reader.finish('usage-lens-data.ndjson');
}

export function creditLine(month: string, gross: number, discount: number, net: number, extra: Line = {}): Line {
  return recordLine('ai-credit-usage', { product: 'Copilot', sku: 'Copilot AI Credits', model: 'GPT-5', unitType: 'credits', pricePerUnit: 0.01, grossQuantity: gross * 100, grossAmount: gross, discountAmount: discount, netAmount: net }, { month, ...extra });
}

export function seatRecord(login: string, organization: string, plan: string, team: string | null = null): Line {
  return {
    assignee: { login, type: 'User' },
    organization: { login: organization },
    assigning_team: team ? { slug: team, name: team } : null,
    plan_type: plan,
    created_at: '2026-01-05T10:00:00Z',
    last_activity_at: '2026-09-20T09:00:00Z',
    last_activity_editor: 'vscode',
  };
}

export const budgetRecord = (id: string, extra: Line): Line => ({
  id, budget_type: 'SkuPricing', budget_scope: 'enterprise', budget_entity_name: 'octocorp', budget_amount: 500, prevent_further_usage: true,
  budget_product_sku: 'ai_credits', consumed_amount: 100, budget_alerting: { will_alert: true, recipients: 1 }, ...extra,
});

/** One part of an AI usage report file, as the collector scripts write it: up to 1000 lines of the CSV file. */
export const usageReportPart = (month: string, file: number, part: number, lines: string[], report = 'report-1'): Line =>
  recordLine('usage-report', { report, file, part, lines }, { month });

/** The text of a Blob as it is stored. Blob.text() would drop a byte order mark at the start. */
export const storedText = async (blob: Blob): Promise<string> => new TextDecoder('utf-8', { ignoreBOM: true }).decode(await blob.arrayBuffer());
