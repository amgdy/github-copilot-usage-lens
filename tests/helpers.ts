import { vi } from 'vitest';
import { analyze, type Analysis } from '../src/lib/analytics/analyze';
import { emptyFilters, type Filters } from '../src/lib/analytics/filters';
import { prepareStore, type Prepared } from '../src/lib/analytics/prepare';
import { mergeSettings, type Settings } from '../src/lib/analytics/settings';
import { deriveGitHub, type Collection } from '../src/lib/collection';
import { buildStore, type TextSource } from '../src/lib/csv/ingest';
import { generateDemo, type DemoOptions, type DemoResult } from '../src/lib/demo/generate';
import { buildModelTable, type ModelTable } from '../src/lib/pricing/models';
import type { DataStore } from '../src/lib/types';

// When other processes build or test on the same machine, every worker can freeze for several seconds; the
// default 5 s limit would then fail fast tests that merely waited for their turn. Real slowness is still
// caught by the explicit timing assertions (demo, analyze, perf).
vi.setConfig({ testTimeout: 30_000, hookTimeout: 60_000 });

export interface Pipeline {
  store: DataStore;
  prep: Prepared;
  models: ModelTable;
  settings: Settings;
  filters: Filters;
  /** Runs the analysis again; the filters and settings default to the ones the pipeline was created with. */
  run(filters?: Filters, settings?: Settings): Analysis;
  analysis: Analysis;
}

/** Runs prepare + model table + analyze on an already ingested store, with the GitHub data file when one is given. */
export function pipelineOf(
  store: DataStore,
  options: { filters?: Partial<Filters>; settings?: Partial<Settings>; collection?: Collection } = {},
): Pipeline {
  const prepared = prepareStore(store);
  const settings = mergeSettings(options.settings ?? {});
  const models = buildModelTable(store, settings.modelOverrides);
  const filters = { ...emptyFilters(), ...options.filters };
  const github = options.collection ? deriveGitHub(options.collection, store) : null;
  const run = (activeFilters: Filters = filters, activeSettings: Settings = settings): Analysis =>
    analyze({ store, prep: prepared, models, filters: activeFilters, settings: activeSettings, github });
  return { store, prep: prepared, models, settings, filters, run, analysis: run() };
}

/** Pipeline over in-memory CSV sources (for synthetic data). */
export async function analyzeSources(
  sources: TextSource[],
  options: { filters?: Partial<Filters>; settings?: Partial<Settings>; dedupe?: boolean } = {},
): Promise<Pipeline> {
  const store = await buildStore(sources, { dedupe: options.dedupe });
  return pipelineOf(store, options);
}

export const analyzeCsv = (
  csv: string,
  options: { filters?: Partial<Filters>; settings?: Partial<Settings> } = {},
): Promise<Pipeline> => analyzeSources([{ name: 'synthetic.csv', data: csv }], options);

const demoCache = new Map<string, Promise<{ demo: DemoResult; store: DataStore }>>();

/** The synthetic demo dataset, ingested once per test file and shared (stores are read-only). */
export function loadDemo(options: DemoOptions = {}): Promise<{ demo: DemoResult; store: DataStore }> {
  const key = JSON.stringify(options);
  let cached = demoCache.get(key);
  if (!cached) {
    const demo = generateDemo(options);
    cached = buildStore([{ name: 'demo.csv', data: demo.csv }]).then((store) => ({ demo, store }));
    demoCache.set(key, cached);
  }
  return cached;
}

export async function analyzeDemo(
  options: { demo?: DemoOptions; filters?: Partial<Filters>; settings?: Partial<Settings> } = {},
): Promise<Pipeline & { demo: DemoResult }> {
  const { demo, store } = await loadDemo(options.demo);
  return { demo, ...pipelineOf(store, options) };
}

/** Independent, naive parser for the (fully quoted) sample files. */
export function naiveRows(text: string): Record<string, string>[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim().length > 0);
  const split = (line: string) => [...line.matchAll(/"((?:[^"]|"")*)"|([^,]+)|(?<=,)(?=,)/g)].map((match) => match[1] ?? match[2] ?? '');
  const head = split(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row: Record<string, string> = {};
    head.forEach((column, index) => (row[column] = cells[index] ?? ''));
    return row;
  });
}

export const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

export type NaiveRow = Record<string, string>;

// The tests count days with Temporal, so they check the app's own date math with a separate calendar.
const EPOCH = Temporal.PlainDate.from('1970-01-01');

/** Days since 1970-01-01 for an ISO date. */
export const dayNum = (iso: string): number => Temporal.PlainDate.from(iso.slice(0, 10)).since(EPOCH).days;
export const isoOf = (day: number): string => EPOCH.add({ days: day }).toString();
export const addDays = (iso: string, days: number): string => isoOf(dayNum(iso) + days);
/** Monday = 0 … Sunday = 6. */
export const weekdayOf = (iso: string): number => Temporal.PlainDate.from(iso.slice(0, 10)).dayOfWeek - 1;
export const numOf = (row: NaiveRow, column: string): number => Number(row[column] || 0);
export const isAutoRow = (row: NaiveRow): boolean => /^auto(\s*[:：\-–—]|$)/i.test(row.model.trim());
export const modelOfRow = (row: NaiveRow): string => row.model.trim().replace(/^auto\s*[:：\-–—]\s*/i, '');

export function groupSum<T>(rows: T[], key: (row: T) => string, value: (row: T) => number): Map<string, number> {
  const sumByKey = new Map<string, number>();
  for (const row of rows) sumByKey.set(key(row), (sumByKey.get(key(row)) ?? 0) + value(row));
  return sumByKey;
}

/** Totals of the rows of a CSV, recomputed from the raw text. */
export function naiveTotals(rows: NaiveRow[]) {
  return {
    rows: rows.length,
    gross: sum(rows.map((row) => numOf(row, 'gross_amount'))),
    discount: sum(rows.map((row) => numOf(row, 'discount_amount'))),
    net: sum(rows.map((row) => numOf(row, 'net_amount'))),
    credits: sum(rows.map((row) => numOf(row, 'quantity'))),
    users: new Set(rows.map((row) => row.username).filter(Boolean)).size,
  };
}

export const CSV_HEADER = [
  'date', 'username', 'product', 'sku', 'model', 'quantity', 'unit_type', 'applied_cost_per_quantity', 'gross_amount', 'discount_amount', 'net_amount',
  'total_monthly_quota', 'organization', 'app_client_id', 'repository', 'cost_center_name', 'aic_quantity', 'aic_gross_amount', 'input', 'output', 'cache_read', 'cache_write',
] as const;

export interface RowSpec {
  date: string;
  user?: string;
  product?: string;
  sku?: string;
  model?: string;
  /** Gross USD (quantity = gross / 0.01 credits). */
  gross: number;
  /** Explicit billing split. Without it the row is fully covered, or drawn from the simulated pool. */
  discount?: number;
  net?: number;
  /** Monthly quota in credits; defaults to 1900 for named users and 0 for repo-level rows. */
  quota?: number;
  org?: string;
  app?: string;
  repo?: string;
  costCenter?: string;
  input?: number;
  output?: number;
  cacheRead?: number;
  cacheWrite?: number;
}

export interface MakeCsvOptions {
  /** Drain one pool per calendar month (the sum of the quotas of the users seen that month) in date order. */
  pool?: boolean;
  bom?: boolean;
  /** Only emit these columns (header order is kept). */
  columns?: readonly string[];
}

const round9 = (value: number): number => Math.round(value * 1e9) / 1e9;
const cell = (value: number): string => String(Number(value.toFixed(9)));
const quote = (text: string): string => `"${text.replace(/"/g, '""')}"`;

/** Builds a fully quoted usage CSV in the GitHub export format from row specs. */
export function makeCsv(specs: RowSpec[], options: MakeCsvOptions = {}): string {
  const rows = specs.map((spec, index) => ({ s: spec, seq: index }));
  rows.sort((a, b) => (a.s.date < b.s.date ? -1 : a.s.date > b.s.date ? 1 : a.seq - b.seq));
  const remaining = new Map<string, number>();
  if (options.pool) {
    const seen = new Set<string>();
    for (const { s: spec } of rows) {
      if (!spec.user) continue;
      const month = spec.date.slice(0, 7);
      const key = `${month}|${spec.user}`;
      if (seen.has(key)) continue;
      seen.add(key);
      remaining.set(month, (remaining.get(month) ?? 0) + (spec.quota ?? 1900) * 0.01);
    }
  }
  const columns = options.columns;
  const header = columns ? CSV_HEADER.filter((column) => columns.includes(column)) : [...CSV_HEADER];
  const lines = [header.map(quote).join(',')];
  for (const { s: spec } of rows) {
    const gross = round9(spec.gross);
    let discount: number;
    let net: number;
    if (spec.discount !== undefined || spec.net !== undefined) {
      discount = spec.discount ?? round9(gross - (spec.net ?? 0));
      net = spec.net ?? round9(gross - discount);
    } else if (options.pool) {
      const month = spec.date.slice(0, 7);
      const left = remaining.get(month) ?? 0;
      discount = round9(Math.min(gross, left));
      remaining.set(month, left - discount);
      net = round9(gross - discount);
    } else {
      discount = gross;
      net = 0;
    }
    const values: Record<string, string> = {
      date: spec.date,
      username: spec.user ?? '',
      product: spec.product ?? 'copilot',
      sku: spec.sku ?? 'copilot_ai_credit',
      model: spec.model ?? 'GPT-5.6 Terra',
      quantity: cell(round9(gross / 0.01)),
      unit_type: 'ai-credits',
      applied_cost_per_quantity: '0.01',
      gross_amount: cell(gross),
      discount_amount: cell(discount),
      net_amount: cell(net),
      total_monthly_quota: String(spec.quota ?? (spec.user ? 1900 : 0)),
      organization: spec.org ?? 'acme',
      app_client_id: spec.app ?? '',
      repository: spec.repo ?? '',
      cost_center_name: spec.costCenter ?? '',
      aic_quantity: '0',
      aic_gross_amount: '0',
      input: String(spec.input ?? 0),
      output: String(spec.output ?? 0),
      cache_read: String(spec.cacheRead ?? 0),
      cache_write: String(spec.cacheWrite ?? 0),
    };
    lines.push(header.map((column) => quote(values[column])).join(','));
  }
  return `${options.bom === false ? '' : '\uFEFF'}${lines.join('\n')}\n`;
}

/** Text that must never leak into anything a user reads. */
export const BAD_TEXT = /NaN|undefined|Infinity|\[object/;

/** Small deterministic PRNG (mulberry32) returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Every user-facing string of an analysis (headline and recommendations). */
export function analysisTexts(analysis: Analysis): string[] {
  const out = [analysis.headline.title, analysis.headline.detail];
  for (const recommendation of analysis.recs) {
    out.push(recommendation.title, recommendation.summary, ...recommendation.evidence, ...recommendation.actions);
    if (recommendation.caveat) out.push(recommendation.caveat);
    for (const link of recommendation.docs ?? []) out.push(link.label, link.url);
    if (recommendation.jump) out.push(recommendation.jump.label);
  }
  return out;
}
