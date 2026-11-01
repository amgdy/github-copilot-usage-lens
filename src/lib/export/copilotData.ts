import type { Analysis } from '../analytics/analyze';
import { coverageIssues } from '../analytics/coverage';
import { recValue, SEVERITY_ORDER, type Recommendation } from '../analytics/recommendations';
import { PLAN_CREDITS, PLAN_PRICE, type Settings } from '../analytics/settings';
import type { Taxonomy, TaxonomyItem } from '../analytics/taxonomy';
import type { GroupStat, UserProfile } from '../analytics/users';
import { budgetMap, budgetOverview, limitBoard, type BudgetRow, type GitHubData, type LimitBoard, type LimitUser } from '../collection';
import { AUTO_DISCOUNT, CARD_AS_OF, VENDORS } from '../pricing/card';
import type { ModelTable } from '../pricing/models';
import { CATEGORIES, labelOf, type DataStore, type DimKey } from '../types';
import { t } from '../../i18n/core';
import { dowOf, isoDate } from '../utils/date';

/** Long lists of organizations and spending limits are cut, so a large enterprise still fits in one prompt. */
const ORG_SEAT_ROWS = 25;
const LIMIT_ROWS = 40;

export type CopilotTask = 'leadership' | 'patterns' | 'seats' | 'budgets' | 'models' | 'user-groups';

/** A filter of the current view, already in words. `user` marks a filter on one user, so its value is a login. */
export interface CopilotFilter {
  group: string;
  value: string;
  user?: boolean;
}

export interface CopilotDataInput {
  analysis: Analysis;
  store: DataStore;
  models: ModelTable;
  settings: Settings;
  taxonomy: Taxonomy;
  github: GitHubData | null;
  /** The name of the loaded report. */
  label: string;
  filters: CopilotFilter[];
  /** A search text filters the view, but the text itself is left out for privacy. */
  searchOmitted: boolean;
  sample: boolean;
}

// ---------------------------------------------------------------------------------------------------------------------
// User names
// ---------------------------------------------------------------------------------------------------------------------

/** Turns user logins into aliases (user-01, user-02, ...) or keeps them, the same way in tables and in free text. */
export interface UserNamer {
  readonly anonymous: boolean;
  /** The alias of the first user, such as user-01 or user-001, to show the admin and the model what the labels look like. */
  readonly example: string;
  /** The alias of one login. A login seen for the first time gets the next free alias. */
  user(name: string): string;
  /** Replaces every known login that stands as a whole word in a text. */
  text(text: string): string;
}

const LOGIN_TOKEN = /[A-Za-z0-9_-]+/g;
const PLAIN_LOGIN = /^[a-z0-9_-]+$/;
const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Aliases follow the order of `names`, so the first name is user-01. Pass the users with the most usage first. An alias
 * that is also a real login is skipped, so a text never mixes the two. Logins are matched without case.
 */
export function createUserNamer(names: Iterable<string>, anonymous: boolean): UserNamer {
  const realNames = new Set<string>();
  const orderedNames: string[] = [];
  for (const name of names) {
    const key = name.trim().toLowerCase();
    if (key && !realNames.has(key)) {
      realNames.add(key);
      orderedNames.push(key);
    }
  }
  const width = Math.max(2, String(orderedNames.length).length);
  const aliasOf = (aliasNumber: number): string => `user-${String(aliasNumber).padStart(width, '0')}`;
  if (!anonymous) return { anonymous, example: aliasOf(1), user: (name) => name, text: (text) => text };
  const aliases = new Map<string, string>();
  let nextNumber = 1;
  let specialNames: string[] | null = null;
  const allocate = (key: string): string => {
    let alias = aliasOf(nextNumber);
    while (realNames.has(alias)) {
      nextNumber++;
      alias = aliasOf(nextNumber);
    }
    nextNumber++;
    aliases.set(key, alias);
    specialNames = null;
    return alias;
  };
  for (const key of orderedNames) allocate(key);

  return {
    anonymous,
    example: aliases.get(orderedNames[0] ?? '') ?? aliasOf(1),
    user(name: string): string {
      const key = name.trim().toLowerCase();
      if (!key) return name;
      const known = aliases.get(key);
      if (known) return known;
      realNames.add(key);
      return allocate(key);
    },
    text(text: string): string {
      // Logins with characters outside the usual set (a dot, an @) cannot be found token by token, so they go first.
      specialNames ??= [...aliases.keys()].filter((key) => !PLAIN_LOGIN.test(key)).sort((a, b) => b.length - a.length);
      let result = text;
      for (const key of specialNames) {
        const matcher = new RegExp(`(^|[^A-Za-z0-9_-])${escapeRegex(key)}(?=$|[^A-Za-z0-9_-])`, 'gi');
        result = result.replace(matcher, (_match, prefix: string) => `${prefix}${aliases.get(key)}`);
      }
      return result.replace(LOGIN_TOKEN, (token) => aliases.get(token.toLowerCase()) ?? token);
    },
  };
}

/** Replaces whole-word user logins in a text with aliases, in the order the names are given. */
export function anonymizeUserNames(text: string, userNames: readonly string[]): string {
  return createUserNamer(userNames, true).text(text);
}

// ---------------------------------------------------------------------------------------------------------------------
// Compact format
// ---------------------------------------------------------------------------------------------------------------------

export type Cell = string | number | boolean | null | undefined;

interface FieldsSection {
  kind: 'fields';
  name: string;
  fields: [string, Cell][];
}

interface TableSection {
  kind: 'table';
  name: string;
  columns: string[];
  rows: Cell[][];
  /** Rows before the cut, when only the first rows are shown. */
  total?: number;
  /** How the rows are chosen or sorted. */
  note?: string;
}

type Section = FieldsSection | TableSection;

const EASTERN_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g;

/** Latin digits in data, whatever the app shows. The Arabic separators become a comma and a dot. */
export function latinDigits(text: string): string {
  return text
    .replace(EASTERN_DIGITS, (digit) => String(digit.charCodeAt(0) & 0xf))
    .replace(/\u066C/g, ',')
    .replace(/\u066B/g, '.');
}

/** A plain number with at most `digits` decimals and no trailing zeros. '-' when it is not known. */
export function compactNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  const rounded = Number(value.toFixed(digits));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

/** One value of a table or a field: y/n for yes and no, '-' when unknown, quoted when it holds a comma or a quote. */
export function compactCell(value: Cell): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'y' : 'n';
  if (typeof value === 'number') return compactNumber(value);
  const text = latinDigits(value).replace(/\s+/g, ' ').replace(/`{3,}/g, "'''").trim();
  if (!text || text === '-') return '-';
  return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function renderSection(section: Section): string {
  if (section.kind === 'fields') {
    const lines = section.fields.filter(([, value]) => value !== undefined).map(([key, value]) => `  ${key}: ${compactCell(value)}`);
    return [`${section.name}:`, ...lines].join('\n');
  }
  const count = section.total !== undefined && section.total > section.rows.length ? `${section.rows.length}/${section.total}` : String(section.rows.length);
  return [
    ...(section.note ? [`# ${latinDigits(section.note)}`] : []),
    `${section.name}[${count}]{${section.columns.join(',')}}:`,
    ...section.rows.map((row) => row.map(compactCell).join(',')),
  ].join('\n');
}

const usd = (value: number | null | undefined): string => compactNumber(value, 2);
/** A share from 0 to 1 as a percentage from 0 to 100. */
const pct = (share: number | null | undefined): string => (share === null || share === undefined ? '-' : compactNumber(share * 100, 1));
const millions = (tokens: number): string => compactNumber(tokens / 1e6, 3);
const ratio = (part: number, whole: number): number => (whole > 0 ? part / whole : Number.NaN);
const day = (value: number | null | undefined): string => (value === null || value === undefined || !Number.isFinite(value) ? '-' : isoDate(value));
const WEEKDAY_IDS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------------------------------------------------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------------------------------------------------

interface Context {
  input: CopilotDataInput;
  task: CopilotTask;
  namer: UserNamer;
  /** Users in the view, the most usage first. */
  profiles: UserProfile[];
  board: LimitBoard | null;
}

function reportSection({ input, namer }: Context): Section {
  const { analysis, github, filters } = input;
  const { range, agg: aggregates, coverage, headline } = analysis;
  const header = github?.collection.header;
  const filterText = filters.map((filter) => `${filter.group}: ${filter.user ? namer.user(filter.value) : filter.value}`).join('; ');
  return {
    kind: 'fields',
    name: 'report',
    fields: [
      ['file', input.label],
      ['sample', input.sample],
      ['period', `${isoDate(range.start)}..${isoDate(range.end)}`],
      ['days', range.length],
      ['days_with_rows', Number.isFinite(aggregates.firstDay) ? `${isoDate(aggregates.firstDay)}..${isoDate(aggregates.lastDay)}` : null],
      ['months', analysis.pool.months.map((month) => month.key).join(' ')],
      ['filters', filterText || 'none'],
      ['search_text', input.searchOmitted ? 'left out for privacy' : undefined],
      ['segment_filter', analysis.segmentFiltered],
      ['github_account', header ? `${header.scope} ${header.enterprise ?? header.organizations.join(' ')}` : 'not loaded'],
      ['github_collected_on', header?.day],
      ['has_billing_split', coverage.billing],
      ['has_seat_sizes', coverage.quota],
      ['has_users', coverage.users],
      ['has_models', coverage.models],
      ['has_tokens', coverage.tokens],
      ['price_card_as_of', CARD_AS_OF],
      ['auto_discount_rate_pct', pct(AUTO_DISCOUNT)],
      ['seat_included_usd', Object.entries(PLAN_PRICE).map(([plan, price]) => `${plan}=${price}`).join(' ')],
      ['seat_included_credits', Object.entries(PLAN_CREDITS).map(([plan, credits]) => `${plan}=${credits}`).join(' ')],
      ['headline_status', headline.status],
      ['headline', namer.text(`${headline.title}. ${headline.detail}`)],
    ],
  };
}

function totalsSection({ input }: Context): Section {
  const { analysis } = input;
  const { totals } = analysis.agg;
  const { pool, previous, trend, auto } = analysis;
  const flow = analysis.users.poolFlow;
  const tokens = analysis.coverage.tokens;
  return {
    kind: 'fields',
    name: 'totals',
    fields: [
      ['usage_usd', usd(totals.gross)],
      ['covered_usd', usd(totals.discount)],
      ['billed_usd', usd(totals.net)],
      ['credits', compactNumber(totals.credits, 0)],
      ['users', totals.users],
      ['usage_per_user_usd', usd(ratio(totals.gross, totals.users))],
      ['usage_per_day_usd', usd(ratio(totals.gross, analysis.range.length))],
      ['repo_level_usd', usd(totals.unattributedGross)],
      ['priced_pct', pct(ratio(totals.pricedGross, totals.gross))],
      ['unpriced_usd', usd(totals.unpricedGross)],
      ['long_context_extra_usd', usd(totals.longPremium)],
      ['auto_usage_usd', usd(totals.autoGross)],
      ['auto_share_pct', pct(ratio(totals.autoGross, totals.gross))],
      ['auto_discount_received_usd', usd(auto.discount)],
      ['auto_missed_usd', usd(auto.missed)],
      ['input_mtok', tokens ? millions(totals.input) : undefined],
      ['output_mtok', tokens ? millions(totals.output) : undefined],
      ['cache_read_mtok', tokens ? millions(totals.cacheRead) : undefined],
      ['cache_write_mtok', tokens ? millions(totals.cacheWrite) : undefined],
      ['cache_hit_pct', tokens ? pct(ratio(totals.cacheRead, totals.input + totals.cacheRead + totals.cacheWrite)) : undefined],
      ['previous_period', previous ? `${isoDate(previous.from)}..${isoDate(previous.to)}` : 'not in the data'],
      ['previous_usage_usd', previous ? usd(previous.totals.gross) : undefined],
      ['previous_billed_usd', previous ? usd(previous.totals.net) : undefined],
      ['previous_users', previous?.totals.users],
      ['usage_change_pct', previous ? pct(ratio(totals.gross, previous.totals.gross) - 1) : undefined],
      ['last_7_days_usd', usd(trend.recent)],
      ['prior_7_days_usd', usd(trend.prior)],
      ['week_change_pct', pct(trend.change)],
      ['week_change_reliable', trend.reliable],
      ['pool_usd', pool.capacityExceeded ? 'unknown' : usd(pool.capacity)],
      ['pool_is_lower_bound', pool.capacityIsLowerBound],
      ['pool_used_pct', pool.capacityExceeded ? 'unknown' : pct(pool.utilization)],
      ['months_pool_ran_out', pool.monthsExhausted],
      ['users_above_own_share', flow.takers],
      ['usage_above_own_share_usd', usd(flow.takenUsd)],
      ['users_below_own_share', flow.lenders],
      ['unused_own_share_usd', usd(flow.lentUsd)],
    ],
  };
}

function monthsSection({ input }: Context): Section {
  return {
    kind: 'table',
    name: 'months',
    note: t('pool_* is the shared pool of included credits; proj_* is the projection for a month that is not over'),
    columns: ['month', 'days', 'complete', 'usage_usd', 'covered_usd', 'billed_usd', 'users', 'pool_usd', 'pool_used_pct', 'pool_ran_out', 'proj_usage_usd', 'proj_billed_usd', 'proj_billed_low', 'proj_billed_high', 'proj_pool_out'],
    rows: input.analysis.pool.months.map((month) => [
      month.key,
      `${month.daysObserved}/${month.daysInMonth}`,
      month.complete,
      usd(month.gross),
      usd(month.discount),
      usd(month.net),
      month.users,
      month.capacityExceeded ? 'unknown' : usd(month.capacity),
      month.capacityExceeded ? 'unknown' : pct(month.utilization),
      day(month.exhaustedOn),
      month.projection ? usd(month.projection.projGross) : null,
      month.projection ? usd(month.projection.projNet) : null,
      month.projection ? usd(month.projection.projNetLow) : null,
      month.projection ? usd(month.projection.projNetHigh) : null,
      month.projection ? day(month.projection.exhaustionDate) : null,
    ]),
  };
}

const DAILY_LIMIT = 120;

interface WeekTotals {
  days: number;
  gross: number;
  net: number;
  peakActive: number;
  activeSum: number;
}

function daysSection({ input }: Context, weekly: boolean): Section {
  const { days, range } = input.analysis.agg;
  if (!weekly && range.length <= DAILY_LIMIT) {
    const rows: Cell[][] = [];
    for (let i = 0; i < range.length; i++) {
      const date = range.start + i;
      rows.push([isoDate(date), WEEKDAY_IDS[dowOf(date)], usd(days.gross[i]), usd(days.discount[i]), usd(days.net[i]), days.activeUsers[i], days.anyUsers[i]]);
    }
    return { kind: 'table', name: 'days', columns: ['date', 'weekday', 'usage_usd', 'covered_usd', 'billed_usd', 'active_users', 'users'], rows };
  }
  const weeks = new Map<number, WeekTotals>();
  for (let i = 0; i < range.length; i++) {
    const date = range.start + i;
    const weekStart = date - dowOf(date);
    let entry = weeks.get(weekStart);
    if (!entry) {
      entry = { days: 0, gross: 0, net: 0, peakActive: 0, activeSum: 0 };
      weeks.set(weekStart, entry);
    }
    entry.days++;
    entry.gross += days.gross[i];
    entry.net += days.net[i];
    entry.peakActive = Math.max(entry.peakActive, days.activeUsers[i]);
    entry.activeSum += days.activeUsers[i];
  }
  return {
    kind: 'table',
    name: 'weeks',
    note: t('weeks start on Monday; the first and last week can be partial'),
    columns: ['week_start', 'days', 'usage_usd', 'billed_usd', 'avg_active_users', 'peak_active_users'],
    rows: [...weeks].map(([start, week]) => [isoDate(start), week.days, usd(week.gross), usd(week.net), compactNumber(week.activeSum / week.days, 1), week.peakActive]),
  };
}

function weekdaysSection({ input }: Context): Section {
  const { agg: aggregates, range } = input.analysis;
  const dayCounts = new Array<number>(7).fill(0);
  for (let i = 0; i < range.length; i++) dayCounts[dowOf(range.start + i)]++;
  return {
    kind: 'table',
    name: 'weekdays',
    columns: ['weekday', 'days_in_period', 'usage_usd', 'share_pct', 'usage_per_day_usd'],
    rows: WEEKDAY_IDS.map((weekday, index) => [weekday, dayCounts[index], usd(aggregates.dow.gross[index]), pct(ratio(aggregates.dow.gross[index], aggregates.totals.gross)), usd(ratio(aggregates.dow.gross[index], dayCounts[index]))]),
  };
}

function spikesSection({ input, namer }: Context, limit: number): Section {
  const { anomalies } = input.analysis;
  const userNames = input.store.dicts.user.values;
  const modelNames = input.store.dicts.model.values;
  const sorted = [...anomalies].sort((a, b) => b.gross - a.gross).slice(0, limit);
  return {
    kind: 'table',
    name: 'spikes',
    note: t('days far above the usual level; top_* lists who and what drove the day as name:usd'),
    total: anomalies.length,
    columns: ['date', 'weekday', 'usage_usd', 'usual_usd', 'times_usual', 'z_score', 'top_users', 'top_models'],
    rows: sorted.map((anomaly) => [
      isoDate(anomaly.day),
      WEEKDAY_IDS[dowOf(anomaly.day)],
      usd(anomaly.gross),
      usd(anomaly.baseline),
      compactNumber(anomaly.multiple, 1),
      compactNumber(anomaly.z, 1),
      anomaly.topUsers.map((top) => `${namer.user(userNames[top.id] ?? '')}:${usd(top.gross)}`).join('|'),
      anomaly.topModels.map((top) => `${labelOf('model', modelNames[top.id] ?? '')}:${usd(top.gross)}`).join('|'),
    ]),
  };
}

function quantile(sorted: number[], fraction: number): number {
  if (!sorted.length) return Number.NaN;
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function distributionSection({ profiles }: Context): Section {
  const ascending = profiles.map((profile) => profile.gross).sort((a, b) => a - b);
  const total = ascending.reduce((sum, value) => sum + value, 0);
  const topShare = (count: number): number => ratio(profiles.slice(0, count).reduce((sum, profile) => sum + profile.gross, 0), total);
  let weighted = 0;
  for (let i = 0; i < ascending.length; i++) weighted += (i + 1) * ascending[i];
  const gini = ascending.length > 1 && total > 0 ? (2 * weighted) / (ascending.length * total) - (ascending.length + 1) / ascending.length : Number.NaN;
  return {
    kind: 'fields',
    name: 'user_spread',
    fields: [
      ['users', profiles.length],
      ['p50_usd', usd(quantile(ascending, 0.5))],
      ['p75_usd', usd(quantile(ascending, 0.75))],
      ['p90_usd', usd(quantile(ascending, 0.9))],
      ['p99_usd', usd(quantile(ascending, 0.99))],
      ['max_usd', usd(ascending.at(-1))],
      ['mean_usd', usd(ratio(total, ascending.length))],
      ['top_1_user_pct', pct(topShare(1))],
      ['top_5_users_pct', pct(topShare(5))],
      ['top_10_users_pct', pct(topShare(10))],
      ['top_10pct_of_users_pct', pct(topShare(Math.max(1, Math.round(profiles.length / 10))))],
      ['gini', compactNumber(gini, 3)],
      ['users_above_own_share', profiles.filter((profile) => profile.utilization > 1).length],
      ['users_below_10pct_of_own_share', profiles.filter((profile) => profile.allotment > 0 && profile.utilization < 0.1).length],
      ['users_with_billed_usage', profiles.filter((profile) => profile.net > 0.005).length],
    ],
  };
}

function modelsSection({ input }: Context, limit: number): Section {
  const { agg: aggregates } = input.analysis;
  const { models, store } = input;
  const tokens = input.analysis.coverage.tokens;
  const indexes: number[] = [];
  for (let i = 0; i < aggregates.model.gross.length; i++) if (aggregates.model.gross[i] > 0) indexes.push(i);
  indexes.sort((a, b) => aggregates.model.gross[b] - aggregates.model.gross[a]);
  const shown = indexes.slice(0, limit);
  return {
    kind: 'table',
    name: 'models',
    note: t('by usage; price_* is the price card in USD per 1M tokens; usd_per_mtok is usage divided by all tokens'),
    total: indexes.length,
    columns: [
      'model',
      'class',
      'vendor',
      'priced',
      'usage_usd',
      'share_pct',
      'billed_usd',
      'users',
      'auto_pct',
      ...(tokens ? ['input_mtok', 'output_mtok', 'cache_read_mtok', 'cache_write_mtok', 'cache_hit_pct', 'usd_per_mtok'] : []),
      'price_in',
      'price_out',
    ],
    rows: shown.map((modelIndex) => {
      const gross = aggregates.model.gross[modelIndex];
      const inputTokens = aggregates.model.input[modelIndex];
      const cacheRead = aggregates.model.cacheRead[modelIndex];
      const cacheWrite = aggregates.model.cacheWrite[modelIndex];
      const output = aggregates.model.output[modelIndex];
      const allTokens = inputTokens + cacheRead + cacheWrite + output;
      const rates = models.meta[modelIndex]?.base ?? null;
      return [
        labelOf('model', store.dicts.model.values[modelIndex] ?? ''),
        CATEGORIES[models.cat[modelIndex]] ?? 'Unknown',
        VENDORS[models.vendor[modelIndex]] ?? 'Other',
        models.priced[modelIndex] === 1,
        usd(gross),
        pct(ratio(gross, aggregates.totals.gross)),
        usd(aggregates.model.net[modelIndex]),
        aggregates.usersIn.model[modelIndex],
        pct(ratio(aggregates.modelExtra.autoGross[modelIndex], gross)),
        ...(tokens
          ? [millions(inputTokens), millions(output), millions(cacheRead), millions(cacheWrite), pct(ratio(cacheRead, inputTokens + cacheRead + cacheWrite)), compactNumber(ratio(gross, allTokens) * 1e6, 3)]
          : []),
        rates ? compactNumber(rates.input, 3) : null,
        rates ? compactNumber(rates.output, 3) : null,
      ];
    }),
  };
}

function modelClassesSection({ input }: Context): Section {
  const { totals } = input.analysis.agg;
  return {
    kind: 'table',
    name: 'model_classes',
    note: t('Powerful = top models, Versatile = everyday models, Lightweight = fast low-cost models'),
    columns: ['class', 'usage_usd', 'share_pct'],
    rows: CATEGORIES.map((category, index) => [category, usd(totals.tierGross[index]), pct(ratio(totals.tierGross[index], totals.gross))]).filter((row) => row[1] !== '0'),
  };
}

type DimensionName = 'product' | 'app' | 'org' | 'costCenter' | 'repo';

function dimensionSection({ input }: Context, dimension: DimensionName, name: string, limit: number): Section {
  const measures = input.analysis.agg[dimension];
  const values = input.store.dicts[dimension as DimKey].values;
  const indexes: number[] = [];
  for (let i = 0; i < measures.gross.length; i++) if (measures.gross[i] > 0) indexes.push(i);
  indexes.sort((a, b) => measures.gross[b] - measures.gross[a]);
  const total = input.analysis.agg.totals.gross;
  return {
    kind: 'table',
    name,
    total: indexes.length,
    columns: ['name', 'usage_usd', 'share_pct', 'billed_usd', 'users'],
    rows: indexes.slice(0, limit).map((index) => [labelOf(dimension as DimKey, values[index] ?? ''), usd(measures.gross[index]), pct(ratio(measures.gross[index], total)), usd(measures.net[index]), input.analysis.agg.usersIn[dimension][index]]),
  };
}

type GroupDimension = 'tier' | 'persona' | 'engagement' | 'lifecycle' | 'profile' | 'pareto' | 'autoUse' | 'trait';

const GROUP_IDS: Record<GroupDimension, string> = {
  tier: 'tier',
  persona: 'persona',
  engagement: 'engagement',
  lifecycle: 'lifecycle',
  profile: 'profile',
  pareto: 'pareto',
  autoUse: 'auto_use',
  trait: 'trait',
};

function groupsSection({ input }: Context, dimensions: GroupDimension[]): Section {
  const { groups, totals } = input.analysis.users;
  const rows: Cell[][] = [];
  for (const dimension of dimensions) {
    for (const [id, stat] of Object.entries(groups[dimension] as Record<string, GroupStat>)) {
      if (stat.users === 0) continue;
      rows.push([GROUP_IDS[dimension], id, stat.users, usd(stat.gross), pct(ratio(stat.gross, totals.gross)), usd(stat.net), usd(stat.allotment), usd(stat.potential)]);
    }
  }
  return {
    kind: 'table',
    name: 'groups',
    note: t('users can be in several traits; savable_usd overlaps between groups'),
    columns: ['dimension', 'id', 'users', 'usage_usd', 'usage_pct', 'billed_usd', 'own_share_usd', 'savable_usd'],
    rows,
  };
}

const TAXONOMY_OF: Record<GroupDimension, keyof Taxonomy> = {
  tier: 'tiers',
  persona: 'personas',
  engagement: 'engagement',
  lifecycle: 'engagement',
  profile: 'profiles',
  pareto: 'pareto',
  autoUse: 'autoUse',
  trait: 'traits',
};

function groupDefinitionsSection({ input, namer }: Context, dimensions: GroupDimension[], withAction: boolean): Section {
  const { groups } = input.analysis.users;
  const rows: Cell[][] = [];
  const seen = new Set<string>();
  for (const dimension of dimensions) {
    const present = groups[dimension] as Record<string, GroupStat>;
    for (const item of input.taxonomy[TAXONOMY_OF[dimension]] as TaxonomyItem[]) {
      const key = `${GROUP_IDS[dimension]}:${item.id}`;
      if (seen.has(key) || !present[item.id]?.users) continue;
      seen.add(key);
      rows.push([GROUP_IDS[dimension], item.id, item.label, namer.text(item.description), ...(withAction ? [namer.text(item.action)] : [])]);
    }
  }
  return { kind: 'table', name: 'group_meaning', columns: ['dimension', 'id', 'label', 'meaning', ...(withAction ? ['suggested_action'] : [])], rows };
}

function groupMixSection({ input, profiles }: Context, by: ('persona' | 'org' | 'costCenter')[]): Section {
  const rows: Cell[][] = [];
  const total = input.analysis.agg.totals.gross;
  for (const key of by) {
    const buckets = new Map<string, UserProfile[]>();
    for (const profile of profiles) {
      const bucket = key === 'persona' ? profile.persona : key === 'org' ? labelOf('org', profile.org) : labelOf('costCenter', profile.costCenter);
      let list = buckets.get(bucket);
      if (!list) buckets.set(bucket, (list = []));
      list.push(profile);
    }
    const ordered = [...buckets].map(([bucket, list]) => ({ bucket, list, gross: list.reduce((sum, profile) => sum + profile.gross, 0) })).sort((a, b) => b.gross - a.gross);
    for (const { bucket, list, gross } of ordered.slice(0, key === 'persona' ? 10 : 12)) {
      const weighted = (share: (profile: UserProfile) => number): string => pct(ratio(list.reduce((sum, profile) => sum + (Number.isFinite(share(profile)) ? share(profile) * profile.gross : 0), 0), gross));
      const recent = list.reduce((sum, profile) => sum + profile.recent, 0);
      const prior = list.reduce((sum, profile) => sum + profile.prior, 0);
      rows.push([
        key === 'costCenter' ? 'cost_center' : key,
        bucket,
        list.length,
        usd(gross),
        pct(ratio(gross, total)),
        usd(ratio(gross, list.length)),
        compactNumber(list.reduce((sum, profile) => sum + profile.activeDays, 0) / list.length, 1),
        weighted((profile) => profile.powerfulShare),
        weighted((profile) => profile.lightweightShare),
        weighted((profile) => profile.autoShare),
        weighted((profile) => profile.cacheHit),
        weighted((profile) => profile.longShare),
        pct(prior > 0 ? recent / prior - 1 : Number.NaN),
        usd(list.reduce((sum, profile) => sum + profile.net, 0)),
      ]);
    }
  }
  return {
    kind: 'table',
    name: 'group_mix',
    note: t('shares are weighted by usage; trend_pct compares the last 7 days with the 7 days before'),
    columns: ['by', 'group', 'users', 'usage_usd', 'usage_pct', 'usage_per_user_usd', 'avg_active_days', 'powerful_pct', 'lightweight_pct', 'auto_pct', 'cache_hit_pct', 'long_context_pct', 'trend_pct', 'billed_usd'],
    rows,
  };
}

function lifecycleOf(profile: UserProfile): string {
  if (profile.isNew) return 'new';
  if (profile.lapsed) return 'lapsed';
  return '-';
}

function usersSection(context: Context, limit: number, perPersona: number, withLimits: boolean): Section {
  const { input, namer, profiles, board } = context;
  const chosen = profiles.slice(0, limit);
  if (perPersona > 0) {
    const picked = new Set(chosen);
    const perGroup = new Map<string, number>();
    for (const profile of chosen) perGroup.set(profile.persona, (perGroup.get(profile.persona) ?? 0) + 1);
    for (const profile of profiles) {
      const count = perGroup.get(profile.persona) ?? 0;
      if (count >= perPersona || picked.has(profile)) continue;
      chosen.push(profile);
      picked.add(profile);
      perGroup.set(profile.persona, count + 1);
    }
  }
  const licenses = input.analysis.licenses !== null;
  const metrics = new Map((input.github?.collection.metrics?.users ?? []).map((user) => [user.login.toLowerCase(), user]));
  const limits = withLimits && board ? new Map<string, LimitUser>(board.users.map((user) => [user.login.toLowerCase(), user])) : null;
  const tokens = input.analysis.coverage.tokens;
  return {
    kind: 'table',
    name: 'users',
    note: perPersona > 0
      ? t('the top {limit} by usage, plus up to {more} more of each persona', { limit, more: perPersona })
      : t('the top {limit} by usage', { limit }),
    total: profiles.length,
    columns: [
      'user',
      'org',
      'cost_center',
      'plan',
      'usage_usd',
      'billed_usd',
      'share_pct',
      'own_share_used_pct',
      'active_days',
      'active_pct',
      'days_since_last',
      'trend_pct',
      'persona',
      'tier',
      'engagement',
      'lifecycle',
      'profile',
      'auto_use',
      'traits',
      'powerful_pct',
      'versatile_pct',
      'lightweight_pct',
      'auto_pct',
      ...(tokens ? ['cache_hit_pct'] : []),
      'long_context_pct',
      'peak_day_pct',
      'top_model',
      'top_model_pct',
      'models_used',
      'auto_missed_usd',
      'savable_usd',
      'efficiency',
      ...(licenses ? ['seat', 'seat_plan', 'seat_last_active', 'seat_days_idle', 'seat_surface', 'seat_status', 'seat_cancel_on'] : []),
      ...(metrics.size ? ['gh_active_days', 'completion_days', 'chat_days', 'agent_days', 'cli_days'] : []),
      ...(limits ? ['limit_kind', 'limit_usd', 'limit_used_usd', 'limit_used_pct'] : []),
    ],
    rows: chosen.map((profile) => {
      const license = profile.license;
      const metric = metrics.get(profile.name.toLowerCase());
      const limit = limits?.get(profile.name.toLowerCase());
      return [
        namer.user(profile.name),
        labelOf('org', profile.org),
        labelOf('costCenter', profile.costCenter),
        profile.plan,
        usd(profile.gross),
        usd(profile.net),
        pct(profile.share),
        profile.allotment > 0 ? pct(profile.utilization) : null,
        profile.activeDays,
        pct(profile.activeRate),
        profile.daysSinceLast,
        pct(profile.trend),
        profile.persona,
        profile.tier,
        profile.engagement,
        lifecycleOf(profile),
        profile.profile,
        profile.autoUse,
        profile.traits.join('|'),
        pct(profile.powerfulShare),
        pct(profile.versatileShare),
        pct(profile.lightweightShare),
        pct(profile.autoShare),
        ...(tokens ? [pct(profile.cacheHit)] : []),
        pct(profile.longShare),
        pct(profile.peakShare),
        profile.topModel ? labelOf('model', profile.topModel) : null,
        pct(profile.topModelShare),
        profile.modelCount,
        usd(profile.autoMissed),
        usd(profile.potential),
        compactNumber(profile.efficiency, 0),
        ...(licenses
          ? [license ? license.seat : null, license?.plan || null, license?.lastActivityAt || null, license?.daysSinceActivity ?? null, license?.lastSurface || null, license?.status ?? null, license?.pendingCancellation || null]
          : []),
        ...(metrics.size ? [metric?.days ?? 0, metric?.completionDays ?? 0, metric?.chatDays ?? 0, metric?.agentDays ?? 0, metric?.cliDays ?? 0] : []),
        ...(limits ? [limit?.kind ?? 'none', limit?.limit ?? null, limit ? usd(limit.used) : null, limit ? pct(limit.share) : null] : []),
      ];
    }),
  };
}

function seatSections({ input, namer }: Context, limit: number): Section[] {
  const { seats } = input.analysis;
  const lists: [string, typeof seats.idle][] = [
    ['idle', seats.idle],
    ['downgrade', seats.downgrade],
    ['unused', seats.unused],
    ['keep', seats.keep ?? []],
  ];
  const all = lists.flatMap(([list, candidates]) => candidates.map((candidate) => ({ list, candidate })));
  return [
    {
      kind: 'fields',
      name: 'seat_review',
      fields: [
        ['idle_seats', seats.idle.length],
        ['idle_monthly_usd', usd(seats.idleValue)],
        ['downgrade_seats', seats.downgrade.length],
        ['downgrade_monthly_usd', usd(seats.downgradeValue)],
        ['unused_seats', seats.unused.length],
        ['unused_monthly_usd', usd(seats.unusedValue)],
        ['keep_seats', seats.keep?.length],
        ['keep_monthly_usd', seats.keepValue === undefined ? undefined : usd(seats.keepValue)],
      ],
    },
    {
      kind: 'table',
      name: 'seat_candidates',
      note: t('idle = little use; downgrade = Enterprise seat that never needed more than Business; unused = seat not in the report; keep = not in the report but active by the license data (not a saving)'),
      total: all.length,
      columns: ['user', 'list', 'plan', 'seat_monthly_usd', 'usage_usd', 'own_share_used_pct', 'seat_last_active', 'seat_days_idle', 'seat_surface', 'seat_status'],
      rows: all.slice(0, limit).map(({ list, candidate }) => [
        namer.user(candidate.name),
        list,
        candidate.plan,
        usd(candidate.value),
        usd(candidate.gross),
        pct(candidate.utilization),
        candidate.license?.lastActivityAt || null,
        candidate.license?.daysSinceActivity ?? null,
        candidate.license?.lastSurface || null,
        candidate.license?.status ?? null,
      ]),
    },
  ];
}

function licenseSections({ input, namer }: Context, withLists: boolean, limit: number): Section[] {
  const report = input.analysis.licenses;
  if (!report) return [];
  const sections: Section[] = [
    {
      kind: 'fields',
      name: 'license_list',
      fields: [
        ['as_of', report.asOf],
        ['seats', report.seats],
        ['business', report.byPlan.Business],
        ['enterprise', report.byPlan.Enterprise],
        ['other_plans', report.byPlan.other],
        ['seat_cost_monthly_usd', usd(report.seatCost)],
        ['report_users', report.reportUsers],
        ['seats_in_report', report.matched],
        ['seats_not_in_report', report.neverSeen],
        ['seats_seen_outside_view', report.seenOutsideScope],
        ['report_users_without_seat', report.unmatched.length],
        ['usage_without_seat_usd', usd(report.unmatchedUsage)],
        ['has_activity_dates', report.hasActivity],
        ...Object.entries(report.byStatus).map(([status, count]): [string, Cell] => [`status_${status.replace('-', '_')}`, count]),
        ['reclaim_seats', report.reclaim.length],
        ['reclaim_monthly_usd', usd(report.reclaimValue)],
        ['fading_seats', report.fading.length],
        ['seats_without_activity_date', report.noActivityDate.length],
        ['quiet_seats', report.quiet.length],
        ['pending_cancellation', report.pending.length],
        ['new_seats', report.newSeats.length],
      ],
    },
  ];
  if (!withLists) return sections;
  const lists: [string, typeof report.reclaim][] = [
    ['reclaim', report.reclaim],
    ['fading', report.fading],
    ['quiet', report.quiet],
    ['no_activity_date', report.noActivityDate],
    ['pending', report.pending],
    ['new', report.newSeats],
  ];
  const rows: Cell[][] = lists.flatMap(([list, findings]) =>
    findings.map((finding): Cell[] => [namer.user(finding.login), list, finding.plan || null, finding.org || null, finding.team || null, finding.lastActivityAt || null, finding.daysSinceActivity, finding.lastSurface || null, usd(finding.usage), finding.pendingCancellation || null]),
  );
  for (const user of report.unmatched) rows.push([namer.user(user.name), 'no_seat', user.plan || null, user.org || null, null, null, null, null, usd(user.usage), null]);
  sections.push({
    kind: 'table',
    name: 'license_findings',
    note: t('reclaim = no activity for a long time; fading = activity getting old; quiet = seat with activity but no usage in the report; no_seat = in the report but not in the license list'),
    total: rows.length,
    columns: ['user', 'list', 'plan', 'org', 'team', 'last_active', 'days_idle', 'surface', 'usage_usd', 'cancel_on'],
    rows: rows.slice(0, limit),
  });
  return sections;
}

function githubSeatSections({ input }: Context): Section[] {
  const seats = input.github?.seats;
  if (!seats) return [];
  return [
    {
      kind: 'fields',
      name: 'github_seats',
      fields: [
        ['seats', seats.total ?? seats.seatCount],
        ['added_this_cycle', seats.addedThisCycle],
        ['pending_cancellation', seats.pendingCancellation],
        ['pending_invitation', seats.pendingInvitation],
        ['active_this_cycle', seats.activeThisCycle],
        ['inactive_this_cycle', seats.inactiveThisCycle],
        ['members', seats.memberCount],
        ['members_without_seat', seats.membersWithoutSeat],
        ['orgs_that_give_every_member_a_seat', seats.assignAll.join(' ') || 'none'],
      ],
    },
    {
      kind: 'table',
      name: 'org_seats',
      note: t('the most seats first'),
      total: seats.orgs.length,
      columns: ['org', 'seats', 'added', 'pending_cancel', 'pending_invite', 'active', 'inactive', 'assignment', 'plan', 'ide_chat', 'github_chat', 'cli'],
      rows: [...seats.orgs].sort((a, b) => (b.total ?? -1) - (a.total ?? -1) || a.org.localeCompare(b.org)).slice(0, ORG_SEAT_ROWS).map((org) => [org.org, org.total, org.addedThisCycle, org.pendingCancellation, org.pendingInvitation, org.activeThisCycle, org.inactiveThisCycle, org.management, org.plan, org.ideChat, org.platformChat, org.cli]),
    },
  ];
}

function activitySections({ input, namer }: Context, listLimit: number): Section[] {
  const activity = input.github?.activity;
  if (!activity) return [];
  const sections: Section[] = [
    {
      kind: 'fields',
      name: 'github_activity',
      fields: [
        ['period', `${activity.firstDay}..${activity.lastDay}`],
        ['days', activity.dayCount],
        ['active_users', activity.activeUsers],
        ['completion_users', activity.completionUsers],
        ['chat_users', activity.chatUsers],
        ['agent_users', activity.agentUsers],
        ['cli_users', activity.cliUsers],
        ['active_without_report_usage', activity.withoutUsage === null ? 'unknown' : activity.withoutUsage.length],
      ],
    },
  ];
  if (listLimit > 0 && activity.withoutUsage?.length) {
    sections.push({
      kind: 'table',
      name: 'active_without_report_usage',
      note: t('active in GitHub metrics (for example code completions) but with no usage in the report'),
      total: activity.withoutUsage.length,
      columns: ['user'],
      rows: activity.withoutUsage.slice(0, listLimit).map((login) => [namer.user(login)]),
    });
  }
  return sections;
}

function auditSections({ input }: Context): Section[] {
  const audit = input.github?.audit;
  if (!audit) return [];
  return [
    {
      kind: 'fields',
      name: 'audit_log',
      fields: [
        ['seats_added', audit.seatsAdded],
        ['seats_removed', audit.seatsRemoved],
        ['plan_changes', audit.planChanges],
        ['budget_changes', audit.budgetChanges],
        ['policy_changes', audit.policyChanges],
        ['other', audit.other],
      ],
    },
    { kind: 'table', name: 'audit_months', columns: ['month', 'seats_added', 'seats_removed'], rows: audit.months.map((month) => [month.month, month.added, month.removed]) },
  ];
}

function billSections({ input }: Context, withCheck: boolean): Section[] {
  const github = input.github;
  if (!github) return [];
  const sections: Section[] = [];
  if (github.bills.length) {
    sections.push({
      kind: 'table',
      name: 'github_bills',
      note: t('from GitHub billing; open = the month is not closed yet'),
      columns: ['month', 'seats', 'seat_months', 'ai_credits_usd', 'total_usd', 'open'],
      rows: github.bills.map((bill) => [bill.month, bill.seats, compactNumber(bill.seatMonths, 1), usd(bill.aiCredits), usd(bill.total), bill.open]),
    });
  }
  if (withCheck && github.months.length) {
    sections.push({
      kind: 'table',
      name: 'billing_check',
      note: t('the report compared with what GitHub billing shows'),
      columns: ['month', 'status', 'report_usage_usd', 'github_usage_usd', 'usage_gap_usd', 'report_billed_usd', 'github_billed_usd', 'billed_gap_usd'],
      rows: github.months.map((month) => [month.month, month.status, usd(month.report.gross), month.github ? usd(month.github.gross) : null, usd(month.grossGap), usd(month.report.net), month.github ? usd(month.github.net) : null, usd(month.netGap)]),
    });
  }
  return sections;
}

function budgetStatusSection({ input }: Context): Section | null {
  const budget = input.analysis.pool.budget;
  if (!budget) return null;
  return {
    kind: 'fields',
    name: 'monthly_budget',
    fields: [
      ['source', input.analysis.budgetSource],
      ['month', input.analysis.pool.months.at(-1)?.key ?? budget.month],
      ['limit_usd', usd(budget.monthlyBudget)],
      ['billed_so_far_usd', usd(budget.billedToDate)],
      ['projected_billed_usd', usd(budget.projectedBilled)],
      ['used_pct', pct(budget.burn)],
      ['projected_used_pct', pct(budget.projectedBurn)],
      ['projected_limit_day', day(budget.hitDate)],
    ],
  };
}

function githubBudgetsSection({ input, namer }: Context, limit: number): Section | null {
  const github = input.github;
  if (!github) return null;
  const shareOf = (amount: number, consumed: number | null): number | null => (consumed === null || amount <= 0 ? null : consumed / amount);
  const budgets = [...github.copilotBudgets].sort((a, b) => (shareOf(b.amount, b.consumed) ?? -1) - (shareOf(a.amount, a.consumed) ?? -1));
  return {
    kind: 'table',
    name: 'github_budgets',
    note: t('the fullest first; {count} budgets for other products are left out', { count: github.otherBudgets }),
    total: budgets.length,
    columns: ['scope', 'for', 'covers', 'limit_usd', 'used_usd', 'used_pct', 'stops_use', 'alerts'],
    rows: budgets.slice(0, limit).map((budget) => [
      budget.scope,
      budget.scope === 'user' ? namer.user(budget.user ?? budget.entity) : budget.entity || null,
      budget.aiCredits ? 'ai_credits' : budget.sku || 'copilot',
      usd(budget.amount),
      usd(budget.consumed),
      pct(shareOf(budget.amount, budget.consumed)),
      budget.stopsUsage,
      budget.willAlert,
    ]),
  };
}

/** Every limit of a frame or row as "amount used amount stops|alert-only", split by |. Null when it has none. */
const limitList = (rows: BudgetRow[]): string | null =>
  rows.map((row) => `${usd(row.budget.amount)} used ${usd(row.budget.consumed)} ${row.budget.stopsUsage ? 'stops' : 'alert-only'}`).join('|') || null;

function limitSections({ board, namer }: Context, userLimit: number): Section[] {
  if (!board) return [];
  const { top } = board;
  const usersByShare = [...board.users].sort((a, b) => (b.share ?? -1) - (a.share ?? -1) || b.used - a.used);
  const lanes = [...board.lanes].sort(
    (a, b) => Number(b.limits.length > 0) - Number(a.limits.length > 0) || (b.gauge?.share ?? -1) - (a.gauge?.share ?? -1) || b.members.length - a.members.length,
  );
  return [
    {
      kind: 'fields',
      name: 'limit_frame',
      fields: [
        ['month', board.month.label],
        ['scope', top.scope],
        ['name', top.name],
        ['limits', limitList(top.limits) ?? 'none'],
        ['stopping_limit_reached_first_usd', top.wall ? usd(top.wall.budget.amount) : null],
        ['room_left_usd', usd(top.room)],
        ['capacity_usd', usd(top.capacity)],
        ['inner_limits_sum_usd', usd(top.inside)],
        ['inner_limits_vs_frame_pct', pct(top.insideShare)],
        ['budgets_read_in_full', top.known],
        ['limit_for_each_user_usd', board.everyone ? usd(board.everyone.amount) : 'none'],
        ['cost_centers_without_limit', board.costCentersWithoutLimit],
        ...Object.entries(board.held).map(([kind, count]): [string, Cell] => [`users_held_by_${kind.replace('-', '_')}`, count]),
      ],
    },
    {
      kind: 'table',
      name: 'limit_rows',
      note: t('each row is the spending limit that a group of users checks, rows with own limits and the fullest first; limits lists every own limit as "amount used amount stops|alert-only"; capacity_usd is the smallest limit that stops use; room_left_usd is the smaller of its own room and the frame room'),
      total: lanes.length,
      columns: ['kind', 'name', 'limits', 'capacity_usd', 'room_left_usd', 'reached_first', 'counted_by_frame', 'per_user_limit', 'per_user_usd', 'own_credits_only', 'seats', 'users', 'users_at_limit'],
      rows: lanes.slice(0, LIMIT_ROWS).map((lane) => [
        lane.kind,
        lane.name || null,
        limitList(lane.limits),
        usd(lane.capacity),
        usd(lane.room),
        lane.reachedFirst,
        lane.countedByTop,
        lane.perUser?.kind ?? null,
        lane.perUser ? usd(lane.perUser.budget.amount) : null,
        lane.poolCapped,
        lane.seats,
        lane.members.length,
        lane.usedUp,
      ]),
    },
    {
      kind: 'table',
      name: 'limit_users',
      note: t('the fullest first; kind: own = individual limit, cost-center = cost center default, everyone = universal limit, none = no user limit'),
      total: usersByShare.length,
      columns: ['user', 'kind', 'row', 'cost_center', 'orgs', 'limit_usd', 'used_usd', 'used_pct', 'used_from', 'own_credits_only'],
      rows: usersByShare.slice(0, userLimit).map((user) => [
        namer.user(user.login),
        user.kind,
        board.lanes[user.lane]?.name || board.lanes[user.lane]?.kind || null,
        user.costCenter,
        user.organizations.join('|') || null,
        usd(user.limit),
        usd(user.used),
        pct(user.share),
        user.usedFrom,
        user.poolCapped,
      ]),
    },
  ];
}

function usersAtLimitSection({ input, namer }: Context, limit: number): Section | null {
  const github = input.github;
  if (!github) return null;
  return {
    kind: 'table',
    name: 'users_at_limit',
    total: github.usersAtLimit.length,
    columns: ['user', 'used_usd', 'limit_usd', 'used_pct'],
    rows: github.usersAtLimit.slice(0, limit).map((user) => [namer.user(user.login), usd(user.consumed), usd(user.limit), pct(ratio(user.consumed, user.limit))]),
  };
}

function autoSections({ input }: Context): Section[] {
  const { auto } = input.analysis;
  return [
    {
      kind: 'fields',
      name: 'auto',
      fields: [
        ['auto_usage_usd', usd(auto.billed)],
        ['original_price_usd', usd(auto.original)],
        ['discount_received_usd', usd(auto.discount)],
        ['discount_rate_pct', pct(auto.rate)],
        ['discount_estimated_usd', usd(auto.estimated)],
        ['measured_pct', pct(auto.measuredShare)],
        ['hand_picked_usage_usd', usd(auto.direct)],
        ['auto_share_pct', pct(auto.share)],
        ['discount_missed_usd', usd(auto.missed)],
        ['assumed_rate_pct', pct(auto.assumedRate)],
      ],
    },
    {
      kind: 'table',
      name: 'auto_by_plan',
      columns: ['plan', 'credits', 'users', 'auto_usage_usd', 'measured_usd', 'observed_rate_pct', 'rate_pct', 'source'],
      rows: auto.plans.map((plan) => [plan.label, plan.credits, plan.users, usd(plan.billed), usd(plan.measuredBilled), pct(plan.observed), pct(plan.rate), plan.source]),
    },
  ];
}

function savingsSections({ input }: Context): Section[] {
  const { plan, levers, seats, range } = input.analysis;
  return [
    {
      kind: 'table',
      name: 'savings_steps',
      note: t('saving_usd is for the whole period and applied one after the other, so the steps do not overlap; alone_usd is each step on its own and does overlap'),
      columns: ['id', 'label', 'saving_usd', 'alone_usd'],
      rows: levers.steps.map((step) => [step.id, step.label, usd(step.savings), usd(step.standalone)]),
    },
    {
      kind: 'fields',
      name: 'savings_plan',
      fields: [
        ['period_days', range.length],
        ['usage_before_usd', usd(levers.baseline)],
        ['usage_after_usd', usd(levers.final)],
        ['usage_saving_usd', usd(levers.total)],
        ['seat_value_monthly_usd', usd(plan.seatValue)],
        ['cost_before_usd', usd(plan.baseCost)],
        ['cost_after_usd', usd(plan.newCost)],
        ['combined_saving_usd', usd(plan.saving)],
        ['combined_saving_per_month_usd', usd(plan.perMonth)],
        ['idle_seats_monthly_usd', usd(seats.idleValue)],
        ['downgrade_monthly_usd', usd(seats.downgradeValue)],
        ['unused_seats_monthly_usd', usd(seats.unusedValue)],
      ],
    },
  ];
}

const TASK_RECOMMENDATIONS: Record<CopilotTask, string[]> = {
  leadership: [],
  patterns: ['anomalies', 'spiky', 'trend-up', 'trend-down', 'concentration', 'runaway', 'multi-org', 'unattributed', 'group-balance'],
  seats: ['idle-seats', 'downgrade', 'seat-auto-assign', 'lapsed', 'new-users', 'report-gap', 'multi-org', 'data-coverage'],
  budgets: ['overage', 'pool-exhaustion', 'pool-underuse', 'budgets', 'budget-no-stop', 'budget-stop-ahead', 'user-budget-reached', 'runaway', 'cost-center-coverage', 'unattributed', 'concentration'],
  models: ['model-rightsizing', 'auto-adoption', 'cache', 'context', 'long-context', 'runaway', 'concentration'],
  'user-groups': ['champions', 'group-balance', 'lapsed', 'new-users', 'trend-down', 'trend-up', 'spiky', 'runaway', 'auto-adoption', 'idle-seats'],
};

const recommendationOrder = (a: Recommendation, b: Recommendation): number => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || recValue(b) - recValue(a);

function recommendationSections({ input, task, namer }: Context, limit: number, detailLimit: number): Section[] {
  const relevantIds = new Set(TASK_RECOMMENDATIONS[task]);
  const relevant = input.analysis.recs.filter((recommendation) => relevantIds.size === 0 || relevantIds.has(recommendation.id)).sort(recommendationOrder);
  const others = input.analysis.recs.filter((recommendation) => !relevant.includes(recommendation)).sort(recommendationOrder);
  const ordered = [...relevant, ...others];
  const text = (value: string): string => namer.text(value);
  const detailed = relevant.slice(0, detailLimit);
  return [
    {
      kind: 'table',
      name: 'recommendations',
      note: t('from the app; for the task first, then by severity and value; monthly_usd values overlap and must never be added'),
      total: ordered.length,
      columns: ['id', 'for_task', 'severity', 'theme', 'audience', 'confidence', 'monthly_usd', 'value_kind', 'cash_usd', 'affected_users', 'title'],
      rows: ordered.slice(0, limit).map((recommendation) => [
        recommendation.id,
        relevantIds.size === 0 || relevantIds.has(recommendation.id),
        recommendation.severity,
        recommendation.theme,
        recommendation.audience.join('|'),
        recommendation.confidence,
        usd(recValue(recommendation)),
        recommendation.impactKind,
        usd(recommendation.cashUsd),
        recommendation.affectedCount,
        text(recommendation.title),
      ]),
    },
    {
      kind: 'table',
      name: 'recommendation_details',
      note: t('parts of a list are split by " / "'),
      columns: ['id', 'summary', 'evidence', 'actions', 'caveat', 'some_affected_users'],
      rows: detailed.map((recommendation) => [
        recommendation.id,
        text(recommendation.summary),
        recommendation.evidence.slice(0, 4).map(text).join(' / '),
        recommendation.actions.slice(0, 3).map(text).join(' / '),
        recommendation.caveat ? text(recommendation.caveat) : null,
        recommendation.affected.slice(0, 5).map((user) => namer.user(user.name)).join('|') || null,
      ]),
    },
  ];
}

function dataNotesSection({ input, namer }: Context): Section {
  const { analysis, github, settings } = input;
  const rows: Cell[][] = coverageIssues(analysis.coverage, analysis.users.fallbackQuotaCredits).map((issue) => ['report', issue.severity, namer.text(`${issue.title}. ${issue.detail}`)]);
  if (analysis.pool.capacityExceeded) rows.push(['pool', 'warn', t('More was covered than the seats in the file can fund, so the pool size is unknown. Do not state pool or seat figures as facts.')]);
  else if (analysis.pool.capacityIsLowerBound) rows.push(['pool', 'info', t('The pool size counts only seats with usage in the report, so it is a lower bound.')]);
  if (!settings.roster.length && !input.sample) rows.push(['licenses', 'info', t('No license list is loaded, so seats without usage are not known.')]);
  if (!github) rows.push(['github', 'info', t('No GitHub data file is loaded: no budgets, seats, bills or activity from GitHub.')]);
  for (const source of github?.problems ?? []) rows.push([`github:${source.id}`, source.status, `${source.target}${source.month ? ` ${source.month}` : ''}: ${source.message || source.status}`]);
  rows.push(['report', 'info', t('Code completions and next edit suggestions are not in the usage report.')]);
  return { kind: 'table', name: 'data_notes', columns: ['about', 'level', 'note'], rows };
}

// ---------------------------------------------------------------------------------------------------------------------
// Task packs
// ---------------------------------------------------------------------------------------------------------------------

const ALL_GROUPS: GroupDimension[] = ['tier', 'persona', 'engagement', 'lifecycle', 'profile', 'pareto', 'autoUse', 'trait'];

function boardOf(input: CopilotDataInput): LimitBoard | null {
  const github = input.github;
  if (!github) return null;
  const { header } = github.collection;
  if (header.scope !== 'enterprise' && header.organizations.length !== 1) return null;
  if (budgetOverview(github.collection, input.store).total === 0) return null;
  return limitBoard(github.collection, input.store, budgetMap(github.collection, input.store));
}

function sectionsFor(context: Context): (Section | null)[] {
  const hasCostCenters = context.input.analysis.users.hasCostCenters;
  const common = [reportSection(context), totalsSection(context)];
  switch (context.task) {
    case 'leadership':
      return [
        ...common,
        monthsSection(context),
        daysSection(context, true),
        distributionSection(context),
        modelClassesSection(context),
        modelsSection(context, 8),
        dimensionSection(context, 'org', 'orgs', 10),
        hasCostCenters ? dimensionSection(context, 'costCenter', 'cost_centers', 8) : null,
        groupsSection(context, ['tier', 'persona']),
        groupDefinitionsSection(context, ['tier', 'persona'], false),
        usersSection(context, 10, 0, false),
        ...seatSections(context, 0).slice(0, 1),
        ...licenseSections(context, false, 0),
        budgetStatusSection(context),
        githubBudgetsSection(context, 10),
        spikesSection(context, 5),
        ...savingsSections(context),
        ...recommendationSections(context, 12, 6),
        dataNotesSection(context),
      ];
    case 'patterns':
      return [
        ...common,
        monthsSection(context),
        daysSection(context, false),
        weekdaysSection(context),
        spikesSection(context, 15),
        distributionSection(context),
        modelClassesSection(context),
        modelsSection(context, 20),
        dimensionSection(context, 'product', 'products', 10),
        dimensionSection(context, 'app', 'apps', 10),
        dimensionSection(context, 'org', 'orgs', 15),
        hasCostCenters ? dimensionSection(context, 'costCenter', 'cost_centers', 15) : null,
        dimensionSection(context, 'repo', 'repos', 10),
        groupsSection(context, ALL_GROUPS),
        groupDefinitionsSection(context, ALL_GROUPS, false),
        groupMixSection(context, hasCostCenters ? ['persona', 'org', 'costCenter'] : ['persona', 'org']),
        usersSection(context, 40, 0, false),
        ...activitySections(context, 0),
        ...auditSections(context),
        ...autoSections(context).slice(0, 1),
        ...recommendationSections(context, 15, 6),
        dataNotesSection(context),
      ];
    case 'seats':
      return [
        ...common,
        monthsSection(context),
        distributionSection(context),
        ...seatSections(context, 60),
        ...licenseSections(context, true, 60),
        ...githubSeatSections(context),
        ...activitySections(context, 40),
        ...auditSections(context),
        ...billSections(context, false),
        groupsSection(context, ['engagement', 'lifecycle', 'persona', 'tier']),
        groupDefinitionsSection(context, ['engagement', 'lifecycle', 'persona', 'tier'], false),
        ...recommendationSections(context, 12, 6),
        dataNotesSection(context),
      ];
    case 'budgets':
      return [
        ...common,
        monthsSection(context),
        daysSection(context, true),
        distributionSection(context),
        budgetStatusSection(context),
        ...billSections(context, true),
        githubBudgetsSection(context, 30),
        ...limitSections(context, 40),
        usersAtLimitSection(context, 30),
        dimensionSection(context, 'org', 'orgs', 15),
        hasCostCenters ? dimensionSection(context, 'costCenter', 'cost_centers', 15) : null,
        groupsSection(context, ['tier', 'persona']),
        groupDefinitionsSection(context, ['tier', 'persona'], false),
        usersSection(context, 20, 0, true),
        spikesSection(context, 5),
        ...savingsSections(context),
        ...recommendationSections(context, 12, 6),
        dataNotesSection(context),
      ];
    case 'models':
      return [
        ...common,
        monthsSection(context),
        modelClassesSection(context),
        modelsSection(context, 30),
        dimensionSection(context, 'product', 'products', 10),
        dimensionSection(context, 'app', 'apps', 10),
        ...autoSections(context),
        distributionSection(context),
        groupsSection(context, ['profile', 'autoUse', 'trait', 'tier']),
        groupDefinitionsSection(context, ['profile', 'autoUse', 'trait', 'tier'], false),
        groupMixSection(context, ['persona']),
        usersSection(context, 25, 0, false),
        ...savingsSections(context),
        ...recommendationSections(context, 12, 6),
        dataNotesSection(context),
      ];
    case 'user-groups':
      return [
        ...common,
        monthsSection(context),
        distributionSection(context),
        groupsSection(context, ALL_GROUPS),
        groupDefinitionsSection(context, ALL_GROUPS, true),
        groupMixSection(context, hasCostCenters ? ['persona', 'org', 'costCenter'] : ['persona', 'org']),
        usersSection(context, 30, 3, false),
        dimensionSection(context, 'org', 'orgs', 15),
        hasCostCenters ? dimensionSection(context, 'costCenter', 'cost_centers', 15) : null,
        ...activitySections(context, 0),
        ...seatSections(context, 0).slice(0, 1),
        ...recommendationSections(context, 12, 6),
        dataNotesSection(context),
      ];
  }
}

/** Every login the data may name, the most usage first, so aliases follow usage: user-01 is the top user. */
function namesInOrder(input: CopilotDataInput, profiles: UserProfile[]): string[] {
  const { analysis, store, settings, github } = input;
  const collection = github?.collection;
  return [
    ...profiles.map((profile) => profile.name),
    ...[...analysis.population.profiles].sort((a, b) => b.gross - a.gross).map((profile) => profile.name),
    ...store.dicts.user.values,
    ...settings.roster.map((entry) => entry.user),
    ...(collection?.budgets.flatMap((budget) => (budget.scope === 'user' ? [budget.user ?? budget.entity] : [])) ?? []),
    ...(collection?.budgetUsers.map((user) => user.login) ?? []),
    ...(collection?.costCenters.flatMap((center) => center.users) ?? []),
    ...(collection?.metrics?.users.map((user) => user.login) ?? []),
    ...(github?.usersAtLimit.map((user) => user.login) ?? []),
    ...(github?.activity?.withoutUsage ?? []),
  ];
}

export interface CopilotData {
  /** The data block: one section after another, separated by a blank line. */
  text: string;
  /** Section names in order. */
  sections: string[];
  namer: UserNamer;
}

/** The data a task needs, in a compact form that is cheap to read for a language model. Pure: it reads the analysis only. */
export function buildCopilotData(input: CopilotDataInput, task: CopilotTask, includeNames: boolean): CopilotData {
  const profiles = [...input.analysis.users.profiles].sort((a, b) => b.gross - a.gross);
  const namer = createUserNamer(namesInOrder(input, profiles), !includeNames);
  const board = task === 'budgets' ? boardOf(input) : null;
  const sections = sectionsFor({ input, task, namer, profiles, board }).filter((section): section is Section => section !== null);
  return { text: sections.map(renderSection).join('\n\n'), sections: sections.map((section) => section.name), namer };
}
