import { t } from '../../i18n/core.ts';
import { earlierDay, readDay, todayIso } from '../licenses/dates';
import { MAX_SEATS } from '../licenses/json';
import { isoDate, parseIsoDay } from '../utils/date';
import {
  COLLECTION_FORMAT,
  COLLECTION_VERSION,
  type AuditEvent,
  type AuditKind,
  type BillingMonth,
  type BudgetUserState,
  type Collection,
  type CollectionHeader,
  type CollectionSource,
  type CostCenter,
  type GitHubBudget,
  type MetricsSummary,
  type SeatSummary,
  type SourceStatus,
  type UsageReportFile,
} from './types';

/** List sizes the reader keeps at most. A larger file is read in part and marked as capped. */
export const COLLECTION_LIMITS = {
  seats: MAX_SEATS,
  members: 500_000,
  budgets: 10_000,
  budgetUsers: 250_000,
  costCenters: 10_000,
  /** Users, organizations, teams and repositories of all cost centers together. */
  costCenterResources: 500_000,
  metricsUsers: 250_000,
  audit: 100_000,
  sources: 5_000,
  teams: 50_000,
  /** CSV files of the AI usage report, of all months together. */
  usageReportFiles: 1_000,
} as const;

/** A file that is not a collector file, or one this app cannot read. The message is for the person who loaded it. */
export class CollectionError extends Error {}

type Dict = Record<string, unknown>;

const isDict = (value: unknown): value is Dict => typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown, max = 200): string | undefined => (typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, max) : undefined);

function numberOf(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function countOf(value: unknown): number | null {
  const parsed = numberOf(value);
  return parsed !== null && parsed >= 0 ? Math.floor(parsed) : null;
}

const money = (value: unknown): number => numberOf(value) ?? 0;

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const SOURCE_STATUSES = new Set<SourceStatus>(['ok', 'partial', 'failed', 'skipped']);

const hasProblem = (status: SourceStatus): boolean => status === 'failed' || status === 'partial';

/**
 * Adds a later request of the same part to the part. The records add up. A part with both complete and failed
 * requests is complete only in part, and it keeps the message of the first request with a problem.
 */
function joinSource(part: CollectionSource, later: CollectionSource): void {
  part.records += later.records;
  if (later.status === 'skipped') return;
  if (part.status === 'skipped' || (hasProblem(later.status) && !hasProblem(part.status))) {
    part.message = later.message;
    part.http = later.http;
  } else {
    if (part.message === '') part.message = later.message;
    if (part.http === null) part.http = later.http;
  }
  part.status = part.status === 'skipped' || part.status === later.status ? later.status : 'partial';
}

const AI_CREDIT_SKU = /ai.?credit|premium.?request/i;
/** Budget scopes that limit each user. GitHub says these always stop usage once used up. */
const USER_LEVEL_SCOPES = new Set(['multi_user_customer', 'multi_user_cost_center', 'user']);
const SEAT_UNIT = /user.?months?/i;
const SEAT_SKU = /\b(business|enterprise)\b/i;

/** A day from an ISO text or from epoch milliseconds (the audit log uses both). */
function dayFrom(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return todayIso(value < 1e11 ? value * 1000 : value);
  return readDay(value) ?? undefined;
}

export const notCollection = (): CollectionError => new CollectionError(t('This is not a GitHub data file from the collector script.'));

function readHeader(line: Dict): CollectionHeader {
  if (line.kind !== 'header' || line.format !== COLLECTION_FORMAT) throw notCollection();
  const version = numberOf(line.version);
  if (version === null || version < 1) throw notCollection();
  if (version > COLLECTION_VERSION) {
    throw new CollectionError(t('This GitHub data file was made by a newer version of the collector script. Open the newest version of this app to read it.'));
  }
  const scope = line.scope === 'enterprise' ? 'enterprise' : line.scope === 'organization' ? 'organization' : null;
  if (scope === null) throw notCollection();
  const startedAt = text(line.startedAt, 40) ?? '';
  const day = readDay(startedAt) ?? todayIso();
  const list = (value: unknown, pattern?: RegExp): string[] =>
    Array.isArray(value) ? value.map((item) => text(item, 100)).filter((item): item is string => item !== undefined && (!pattern || pattern.test(item))) : [];
  return {
    collector: text(line.collector, 40) ?? '',
    collectorVersion: text(line.collectorVersion, 20) ?? '',
    host: text(line.host, 200) ?? 'github.com',
    scope,
    enterprise: text(line.enterprise, 100) ?? null,
    organizations: list(line.organizations),
    months: list(line.months, MONTH).sort(),
    startedAt,
    day,
  };
}

/** What an audit event is about, from its action name (for example copilot.cfb_seat_assignment_created). */
export function auditKind(action: string): AuditKind {
  const name = action.toLowerCase();
  if (name.includes('seat')) {
    if (/cancel|unassign|remov|delet|revok/.test(name)) return 'seat-removed';
    if (/add|creat|assign|reus|grant/.test(name)) return 'seat-added';
  }
  if (name.includes('budget')) return 'budget';
  if (/plan|upgrade|downgrade/.test(name)) return 'plan';
  if (/policy|setting|enable|disable|feature/.test(name)) return 'policy';
  return 'other';
}

interface MetricsAccumulator {
  login: string;
  days: number[];
  /** One bit set per feature used on that day: 1 completions, 2 chat, 4 agent, 8 GitHub Copilot CLI. */
  flags: number[];
  credits: number;
}

const COMPLETIONS = 1;
const CHAT = 2;
const AGENT = 4;
const CLI = 8;

function featureFlags(record: Dict): number {
  let flags = 0;
  if (record.used_chat === true) flags |= CHAT;
  if (record.used_agent === true || record.used_copilot_cloud_agent === true || record.used_copilot_coding_agent === true || record.used_vscode_agent === true) flags |= AGENT;
  if (record.used_cli === true) flags |= CLI;
  if (Array.isArray(record.totals_by_feature)) {
    for (const entry of record.totals_by_feature) {
      if (!isDict(entry) || typeof entry.feature !== 'string') continue;
      const activity = money(entry.code_generation_activity_count) + money(entry.code_acceptance_activity_count) + money(entry.user_initiated_interaction_count);
      if (activity <= 0) continue;
      const feature = entry.feature.toLowerCase();
      if (feature.includes('completion')) flags |= COMPLETIONS;
      else if (feature.includes('agent')) flags |= AGENT;
      else if (feature.includes('chat')) flags |= CHAT;
    }
  }
  return flags;
}

const ACTIVITY_COUNTS = ['user_initiated_interaction_count', 'code_generation_activity_count', 'code_acceptance_activity_count', 'loc_added_sum', 'ai_credits_used'];

/** True when a metrics line shows any use of GitHub Copilot that day: a count above zero or a feature that was used. */
function hasActivity(record: Dict, flags: number): boolean {
  if (flags !== 0) return true;
  if (ACTIVITY_COUNTS.some((key) => money(record[key]) > 0)) return true;
  return Object.entries(record).some(([key, value]) => key.startsWith('used_') && value === true);
}

function addBilling(list: BillingMonth[], index: Map<string, BillingMonth>, month: string, target: string, item: Dict, quantityKey: string): void {
  const key = `${month}\u0000${target}`;
  let line = index.get(key);
  if (line === undefined) {
    line = { month, target, gross: 0, discount: 0, net: 0, quantity: 0 };
    index.set(key, line);
    list.push(line);
  }
  line.gross += money(item.grossAmount);
  line.discount += money(item.discountAmount);
  line.net += money(item.netAmount);
  line.quantity += money(item[quantityKey] ?? item.quantity);
}

/** One CSV file of an AI usage report while its parts are read. */
interface UsageReportParts {
  scope: string;
  target: string;
  month: string;
  report: string;
  file: number;
  parts: Map<number, Blob>;
  lines: number;
  /** A part was damaged or came twice, so the file cannot be put back together. */
  broken: boolean;
}

/**
 * Reads the lines of a collector file one at a time and keeps what the app uses. Pass every line to `push`, call
 * `skipLine` for a line that was too long to read, then `finish`. The first line has to be the header: `push` throws a
 * CollectionError when it is not. Later lines that cannot be read are counted and left out.
 */
export class CollectionReader {
  private header: CollectionHeader | null = null;
  private complete = false;
  private records = 0;
  private skipped = 0;
  private capped = false;
  private readonly sources: CollectionSource[] = [];
  private readonly sourceIndex = new Map<string, CollectionSource>();
  private readonly organizations = new Set<string>();
  private readonly seats: unknown[] = [];
  private readonly seatTotals: { target: string; total: number }[] = [];
  private readonly seatSummaries: SeatSummary[] = [];
  private readonly members = new Set<string>();
  private readonly teams = new Map<string, string>();
  private readonly userTeams = new Map<string, Set<string>>();
  private readonly budgets: GitHubBudget[] = [];
  private readonly budgetUsers: BudgetUserState[] = [];
  private readonly costCenters: CostCenter[] = [];
  private costCenterResources = 0;
  private readonly aiCredits: BillingMonth[] = [];
  private readonly aiCreditIndex = new Map<string, BillingMonth>();
  private readonly summaryCredits: BillingMonth[] = [];
  private readonly summaryCreditIndex = new Map<string, BillingMonth>();
  private readonly seatCharges: BillingMonth[] = [];
  private readonly seatChargeIndex = new Map<string, BillingMonth>();
  private readonly metricsUsers = new Map<string, MetricsAccumulator>();
  private readonly metricsDays = new Set<number>();
  private metricsStart: string | undefined;
  private readonly audit: AuditEvent[] = [];
  private readonly usageReportParts = new Map<string, UsageReportParts>();

  /** True once the header line was read. */
  get started(): boolean {
    return this.header !== null;
  }

  skipLine(): void {
    if (this.header === null) throw notCollection();
    this.skipped++;
  }

  push(rawLine: string): void {
    const line = rawLine.trim();
    if (line === '') return;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      if (this.header === null) throw notCollection();
      this.skipped++;
      return;
    }
    if (this.header === null) {
      if (!isDict(value)) throw notCollection();
      this.header = readHeader(value);
      return;
    }
    if (!isDict(value) || typeof value.kind !== 'string' || !this.take(value)) this.skipped++;
  }

  private take(line: Dict): boolean {
    const kind = line.kind as string;
    if (kind === 'end') {
      this.complete = true;
      return true;
    }
    if (kind === 'source') return this.takeSource(line);
    if (kind === 'header') return false;
    const record = line.record;
    if (!isDict(record)) return false;
    const target = text(line.target, 100) ?? '';
    const month = typeof line.month === 'string' && MONTH.test(line.month) ? line.month : undefined;
    this.records++;
    switch (kind) {
      case 'organization': {
        const login = text(record.login, 100);
        if (login) this.organizations.add(login);
        return true;
      }
      case 'seat':
        if (this.seats.length >= COLLECTION_LIMITS.seats) this.capped = true;
        else this.seats.push(record);
        return true;
      case 'seat-total': {
        const total = countOf(record.total_seats);
        if (total !== null) this.seatTotals.push({ target, total });
        return true;
      }
      case 'seat-summary':
        this.seatSummaries.push(readSeatSummary(record, target));
        return true;
      case 'member': {
        const login = text(record.login, 100);
        if (login === undefined) return true;
        if (this.members.size >= COLLECTION_LIMITS.members) this.capped = true;
        else this.members.add(login.toLowerCase());
        return true;
      }
      case 'team': {
        const slug = text(record.slug, 200);
        if (slug !== undefined && (this.teams.has(slug) || this.teams.size < COLLECTION_LIMITS.teams)) {
          this.teams.set(slug, text(record.name, 200) ?? slug);
        }
        return true;
      }
      case 'team-member':
        this.addTeam(text(record.login, 100), text(line.parent, 200));
        return true;
      case 'user-teams':
        this.addTeam(text(record.user_login, 100), text(record.slug ?? record.team_slug, 200));
        return true;
      case 'budget':
        if (this.budgets.length >= COLLECTION_LIMITS.budgets) this.capped = true;
        else {
          const budget = readBudget(record);
          if (budget) this.budgets.push(budget);
        }
        return true;
      case 'budget-user': {
        const login = text(record.user, 100);
        const consumed = numberOf(record.consumed_amount);
        const limit = numberOf(record.target_amount);
        // A user with a budget of their own is held to that budget instead.
        const overridden = record.override_budget_id !== undefined && record.override_budget_id !== null && record.override_budget_id !== '';
        if (login === undefined || consumed === null || limit === null || overridden) return true;
        if (this.budgetUsers.length >= COLLECTION_LIMITS.budgetUsers) this.capped = true;
        else this.budgetUsers.push({ budgetId: text(line.parent, 200) ?? '', login, consumed, limit });
        return true;
      }
      case 'cost-center':
        this.addCostCenter(record);
        return true;
      case 'ai-credit-usage':
        if (month) addBilling(this.aiCredits, this.aiCreditIndex, month, target, record, 'grossQuantity');
        return true;
      case 'usage-summary': {
        if (!month) return true;
        const sku = `${text(record.sku) ?? ''} ${text(record.unitType) ?? ''}`;
        if (SEAT_UNIT.test(sku) || (SEAT_SKU.test(sku) && !AI_CREDIT_SKU.test(sku))) addBilling(this.seatCharges, this.seatChargeIndex, month, target, record, 'grossQuantity');
        else if (AI_CREDIT_SKU.test(sku)) addBilling(this.summaryCredits, this.summaryCreditIndex, month, target, record, 'grossQuantity');
        return true;
      }
      case 'user-metrics':
        this.addMetrics(record);
        return true;
      case 'audit-event': {
        const action = text(record.action, 200);
        if (action === undefined) return true;
        if (this.audit.length >= COLLECTION_LIMITS.audit) {
          this.capped = true;
          return true;
        }
        const event: AuditEvent = { action, kind: auditKind(action) };
        const day = dayFrom(record['@timestamp'] ?? record.created_at);
        if (day) event.day = day;
        const user = text(record.user, 100);
        if (user) event.user = user;
        const org = text(record.org, 100);
        if (org) event.org = org;
        this.audit.push(event);
        return true;
      }
      case 'usage-report':
        if (month) this.addUsageReportPart(record, text(line.scope, 40) ?? '', target, month);
        return true;
      default:
        // Kinds this version does not use, such as billing-usage and scope-metrics, are counted but not kept.
        return true;
    }
  }

  private takeSource(line: Dict): boolean {
    const id = text(line.id, 60);
    const status = line.status as SourceStatus;
    if (id === undefined || !SOURCE_STATUSES.has(status)) return false;
    const source: CollectionSource = {
      id,
      scope: text(line.scope, 40) ?? '',
      target: text(line.target, 100) ?? '',
      status,
      records: countOf(line.records) ?? 0,
      http: countOf(line.http) || null,
      message: text(line.message, 300) ?? '',
    };
    if (typeof line.month === 'string' && MONTH.test(line.month)) source.month = line.month;
    // Some parts take several requests, such as the users of each budget or each topic of the audit log.
    const key = `${source.id}|${source.scope}|${source.target}|${source.month ?? ''}`;
    const part = this.sourceIndex.get(key);
    if (part !== undefined) {
      joinSource(part, source);
      return true;
    }
    if (this.sources.length >= COLLECTION_LIMITS.sources) {
      this.capped = true;
      return true;
    }
    this.sources.push(source);
    this.sourceIndex.set(key, source);
    return true;
  }

  private addCostCenter(record: Dict): void {
    const name = text(record.name, 255);
    if (name === undefined || /^deleted$/i.test(text(record.state, 40) ?? '')) return;
    if (this.costCenters.length >= COLLECTION_LIMITS.costCenters) {
      this.capped = true;
      return;
    }
    const costCenter: CostCenter = { id: text(record.id, 200) ?? name, name, users: [], organizations: [], teams: [], repositories: [], poolCapped: record.ai_credit_pool_enabled === true };
    for (const resource of Array.isArray(record.resources) ? record.resources : []) {
      if (!isDict(resource)) continue;
      const resourceName = text(resource.name, 200);
      const list = resourceName === undefined ? undefined : resourceList(costCenter, text(resource.type, 60) ?? '');
      if (list === undefined || resourceName === undefined) continue;
      if (this.costCenterResources >= COLLECTION_LIMITS.costCenterResources) {
        this.capped = true;
        break;
      }
      list.push(resourceName);
      this.costCenterResources++;
    }
    this.costCenters.push(costCenter);
  }

  /** Keeps one part of an AI usage report file. Each part holds up to 1000 lines of the CSV file, in order. */
  private addUsageReportPart(record: Dict, scope: string, target: string, month: string): void {
    const report = text(record.report, 100);
    const file = countOf(record.file);
    if (report === undefined || file === null || file < 1) return;
    const key = `${scope}|${target}|${month}|${report}|${file}`;
    let entry = this.usageReportParts.get(key);
    if (entry === undefined) {
      if (this.usageReportParts.size >= COLLECTION_LIMITS.usageReportFiles) {
        this.capped = true;
        return;
      }
      entry = { scope, target, month, report, file, parts: new Map(), lines: 0, broken: false };
      this.usageReportParts.set(key, entry);
    }
    const part = countOf(record.part);
    const lines = record.lines;
    if (part === null || part < 1 || entry.parts.has(part) || !Array.isArray(lines) || lines.length === 0 || !lines.every((line) => typeof line === 'string')) {
      entry.broken = true;
      return;
    }
    // A Blob keeps the text out of the JavaScript heap until the usage report is read.
    entry.parts.set(part, new Blob([`${lines.join('\n')}\n`], { type: 'text/csv' }));
    entry.lines += lines.length;
  }

  /**
   * The AI usage report files of every month that the script saved in full: its source line says ok, every part of
   * every file is there, and the rows add up to the rows the script counted.
   */
  private usageReports(): UsageReportFile[] {
    const months = new Map<string, UsageReportParts[]>();
    for (const entry of this.usageReportParts.values()) {
      const key = `${entry.scope}|${entry.target}|${entry.month}`;
      months.set(key, [...(months.get(key) ?? []), entry]);
    }
    const out: UsageReportFile[] = [];
    for (const [key, files] of months) {
      const source = this.sourceIndex.get(`usage-report|${key}`);
      const reports = new Set(files.map((entry) => entry.report));
      const rows = files.reduce((total, entry) => total + entry.lines - 1, 0);
      const whole = (entry: UsageReportParts) => !entry.broken && [...entry.parts.keys()].every((part) => part <= entry.parts.size);
      if (source?.status !== 'ok' || reports.size !== 1 || rows !== source.records || !files.every(whole)) continue;
      files.sort((a, b) => a.file - b.file);
      for (const entry of files) {
        const parts = [...entry.parts.entries()].sort((a, b) => a[0] - b[0]).map(([, blob]) => blob);
        const name = files.length === 1 ? `ai-usage-report-${entry.month}.csv` : `ai-usage-report-${entry.month}-${entry.file}.csv`;
        out.push({ month: entry.month, name, data: new Blob(parts, { type: 'text/csv' }), lines: entry.lines });
      }
    }
    return out.sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));
  }

  private addTeam(login: string | undefined, slug: string | undefined): void {
    if (login === undefined || slug === undefined) return;
    const key = login.toLowerCase();
    let slugs = this.userTeams.get(key);
    if (slugs === undefined) {
      if (this.userTeams.size >= COLLECTION_LIMITS.members) {
        this.capped = true;
        return;
      }
      slugs = new Set();
      this.userTeams.set(key, slugs);
    }
    if (slugs.size < 50) slugs.add(slug);
  }

  private addMetrics(record: Dict): void {
    const login = text(record.user_login, 100);
    // A line of the 28-day report can carry its window instead of a day.
    const dayText = readDay(record.day) ?? readDay(record.report_end_day);
    if (login === undefined || !dayText) return;
    const windowStart = readDay(record.report_start_day);
    if (windowStart) this.metricsStart = earlierDay(this.metricsStart, windowStart);
    const flags = featureFlags(record);
    if (!hasActivity(record, flags)) return;
    const day = parseIsoDay(dayText);
    const key = login.toLowerCase();
    let user = this.metricsUsers.get(key);
    if (user === undefined) {
      if (this.metricsUsers.size >= COLLECTION_LIMITS.metricsUsers) {
        this.capped = true;
        return;
      }
      user = { login, days: [], flags: [], credits: 0 };
      this.metricsUsers.set(key, user);
    }
    this.metricsDays.add(day);
    user.credits += Math.max(0, money(record.ai_credits_used));
    // An organization file can list one user in the report of each organization: count the day once.
    const seen = user.days.lastIndexOf(day);
    if (seen === -1) {
      user.days.push(day);
      user.flags.push(flags);
    } else {
      user.flags[seen] |= flags;
    }
  }

  private metricsSummary(): MetricsSummary | null {
    if (this.metricsUsers.size === 0) return null;
    const days = [...this.metricsDays].sort((a, b) => a - b);
    const users = [...this.metricsUsers.values()].map((user) => {
      const flagged = (flag: number): number => user.flags.reduce((total, flags) => total + ((flags & flag) !== 0 ? 1 : 0), 0);
      return {
        login: user.login,
        days: user.days.length,
        firstDay: isoDate(Math.min(...user.days)),
        lastDay: isoDate(Math.max(...user.days)),
        credits: user.credits,
        completionDays: flagged(COMPLETIONS),
        chatDays: flagged(CHAT),
        agentDays: flagged(AGENT),
        cliDays: flagged(CLI),
      };
    });
    const firstDay = earlierDay(this.metricsStart, isoDate(days[0])) ?? isoDate(days[0]);
    return { firstDay, lastDay: isoDate(days[days.length - 1]), dayCount: days.length, users };
  }

  finish(fileName: string): Collection {
    if (this.header === null) throw new CollectionError(t('The GitHub data file is empty.'));
    const userTeams: Record<string, string[]> = {};
    for (const [login, slugs] of this.userTeams) userTeams[login] = [...slugs];
    return {
      fileName,
      header: this.header,
      complete: this.complete,
      sources: this.sources,
      records: this.records,
      skippedLines: this.skipped,
      organizations: [...this.organizations],
      seats: this.seats,
      seatTotals: this.seatTotals,
      seatSummaries: this.seatSummaries,
      members: [...this.members],
      teams: Object.fromEntries(this.teams),
      userTeams,
      budgets: this.budgets,
      budgetUsers: this.budgetUsers,
      costCenters: this.costCenters,
      aiCredits: this.aiCredits,
      summaryCredits: this.summaryCredits,
      seatCharges: this.seatCharges,
      metrics: this.metricsSummary(),
      audit: this.audit,
      usageReports: this.usageReports(),
      capped: this.capped,
    };
  }
}

/** The list of a cost center that a resource type goes in: User, Org, Repo or an enterprise team. */
function resourceList(costCenter: CostCenter, type: string): string[] | undefined {
  const kind = type.toLowerCase();
  if (kind === 'user') return costCenter.users;
  if (kind.startsWith('org')) return costCenter.organizations;
  if (kind.startsWith('repo')) return costCenter.repositories;
  if (kind.includes('team')) return costCenter.teams;
  return undefined;
}

function readSeatSummary(record: Dict, target: string): SeatSummary {
  const breakdown = isDict(record.seat_breakdown) ? record.seat_breakdown : {};
  return {
    org: target,
    total: countOf(breakdown.total),
    addedThisCycle: countOf(breakdown.added_this_cycle),
    pendingCancellation: countOf(breakdown.pending_cancellation),
    pendingInvitation: countOf(breakdown.pending_invitation),
    activeThisCycle: countOf(breakdown.active_this_cycle),
    inactiveThisCycle: countOf(breakdown.inactive_this_cycle),
    management: text(record.seat_management_setting, 40) ?? null,
    plan: text(record.plan_type, 40) ?? null,
    ideChat: text(record.ide_chat, 40) ?? null,
    platformChat: text(record.platform_chat, 40) ?? null,
    cli: text(record.cli, 40) ?? null,
  };
}

function readBudget(record: Dict): GitHubBudget | null {
  const id = text(record.id, 200);
  const amount = numberOf(record.budget_amount);
  if (id === undefined || amount === null || amount < 0) return null;
  const skus = Array.isArray(record.budget_product_skus) ? record.budget_product_skus.map((sku) => text(sku, 100)).filter((sku): sku is string => sku !== undefined) : [];
  const sku = text(record.budget_product_sku, 100) ?? skus.join(', ');
  const alerting = isDict(record.budget_alerting) ? record.budget_alerting : {};
  const aiCredits = AI_CREDIT_SKU.test(sku);
  const scope = text(record.budget_scope, 60) ?? '';
  const budget: GitHubBudget = {
    id,
    scope,
    entity: text(record.budget_entity_name, 200) ?? '',
    amount,
    consumed: numberOf(record.consumed_amount),
    stopsUsage: record.prevent_further_usage === true || USER_LEVEL_SCOPES.has(scope),
    willAlert: alerting.will_alert === true,
    type: text(record.budget_type, 40) ?? '',
    sku,
    aiCredits,
    copilot: aiCredits || /copilot/i.test(sku),
  };
  const user = text(record.user, 100);
  if (user) budget.user = user;
  const expiresAt = readDay(record.expires_at);
  if (expiresAt) budget.expiresAt = expiresAt;
  return budget;
}
