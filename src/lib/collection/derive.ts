import { parseLicenseValue } from '../licenses/parse';
import type { LicenseParse } from '../licenses/types';
import { BLANK, type DataStore } from '../types';
import { heldUsers } from './limits';
import { monthEndDay, monthIndexOf, monthStartDay, parseIsoDay } from '../utils/date';
import type { AuditEvent, BillingAmounts, BillingMonth, Collection, CollectionSource, GitHubBudget, MetricsUser, SeatSummary } from './types';

/** Days the usage report may miss at the start or end of a month and still count as covering it (quiet weekends). */
const EDGE_DAYS = 3;
/** Amounts closer than this share (or one dollar) count as the same. */
const MATCH_SHARE = 0.02;

export type MonthCheckStatus = 'match' | 'lower' | 'higher' | 'partial' | 'open' | 'outside' | 'missing';

/** One billing month of the GitHub data file set against the loaded usage report. */
export interface MonthCheck {
  /** YYYY-MM */
  month: string;
  /**
   * match: the same amounts. lower: the report has less than GitHub billing. higher: the report has more.
   * partial: the report covers only part of the month. open: the month was not over when the data was collected.
   * outside: the report has no days in the month or no matching organization. missing: the GitHub data file has no billing for the month.
   */
  status: MonthCheckStatus;
  report: BillingAmounts;
  github: BillingAmounts | null;
  /** GitHub billing minus the report, in USD. */
  grossGap: number;
  netGap: number;
}

/** The whole GitHub Copilot bill of one month: seat charges plus AI credits billed. */
export interface MonthBill {
  /** YYYY-MM */
  month: string;
  /** Seat charges billed (USD). Null when the billing summary for the month is missing. */
  seats: number | null;
  /** Seat-months behind the seat charges. */
  seatMonths: number | null;
  /** AI credits billed (USD). Null when GitHub gave no AI credit billing for the month. */
  aiCredits: number | null;
  /** Seat charges plus AI credits billed. Null when either part is missing. */
  total: number | null;
  /** The month was not over when the data was collected, so the amounts can still grow. */
  open: boolean;
}

/** A user who has used up a budget for users. GitHub always stops their usage of AI credits until the next billing cycle or a higher budget. */
export interface UserAtLimit {
  login: string;
  consumed: number;
  limit: number;
}

export interface SeatOverview {
  /** The seat summary of GitHub, added up over organizations. Null when GitHub gave none. */
  total: number | null;
  addedThisCycle: number | null;
  pendingCancellation: number | null;
  pendingInvitation: number | null;
  activeThisCycle: number | null;
  inactiveThisCycle: number | null;
  /** The seat summary of each organization, A to Z. */
  orgs: SeatSummary[];
  /** Organizations that give a seat to every member. */
  assignAll: string[];
  /** People with a seat in the file. */
  seatCount: number;
  /** Members of the enterprise or organizations. Null when the file has no complete member list. */
  memberCount: number | null;
  /** Members who have no seat. Null when the member list or the seat list is missing or incomplete. */
  membersWithoutSeat: number | null;
}

export interface ActivityOverview {
  /** YYYY-MM-DD: the days the GitHub Copilot usage metrics cover. */
  firstDay: string;
  lastDay: string;
  dayCount: number;
  activeUsers: number;
  completionUsers: number;
  chatUsers: number;
  agentUsers: number;
  cliUsers: number;
  /** Active users who have no row in the usage report on the same days. Null when the report does not cover those days. */
  withoutUsage: string[] | null;
}

export interface AuditMonth {
  /** YYYY-MM */
  month: string;
  added: number;
  removed: number;
}

export interface AuditOverview {
  seatsAdded: number;
  seatsRemoved: number;
  planChanges: number;
  budgetChanges: number;
  policyChanges: number;
  other: number;
  /** Seat changes by month, oldest first. */
  months: AuditMonth[];
}

/** What the GitHub data file adds to the loaded usage report. */
export interface GitHubData {
  collection: Collection;
  /**
   * The AI credit budget of the same enterprise or organization, used as the monthly budget when Settings has none.
   * Null when the file covers only some organizations of the report, because the budget does not limit the others.
   */
  budget: GitHubBudget | null;
  /** Budgets about GitHub Copilot: the one in use first, then the others by scope, name and amount. */
  copilotBudgets: GitHubBudget[];
  /** Budgets for other products, which are not shown. */
  otherBudgets: number;
  /** Users who have used up their budget, most over first. */
  usersAtLimit: UserAtLimit[];
  months: MonthCheck[];
  /** The organizations the month check is limited to. Empty when it uses every row of the report. */
  checkedOrgs: string[];
  bills: MonthBill[];
  seats: SeatOverview | null;
  activity: ActivityOverview | null;
  audit: AuditOverview | null;
  /** Sources that failed or gave only part of their data. */
  problems: CollectionSource[];
}

const zero = (): BillingAmounts => ({ gross: 0, discount: 0, net: 0, quantity: 0 });

function addAmounts(total: BillingAmounts, line: BillingAmounts): void {
  total.gross += line.gross;
  total.discount += line.discount;
  total.net += line.net;
  total.quantity += line.quantity;
}

function sumMonth(lines: readonly BillingMonth[], month: string): BillingAmounts {
  const total = zero();
  for (const line of lines) if (line.month === month) addAmounts(total, line);
  return total;
}

/** True when a source ran for the month (or for every target without a month) and every run was complete. */
export function sourceComplete(sources: readonly CollectionSource[], id: string, month?: string): boolean {
  const runs = sources.filter((source) => source.id === id && (month === undefined || source.month === month));
  return runs.length > 0 && runs.every((source) => source.status === 'ok');
}

/** What GitHub billing says about AI credits in a month: the AI credit report, or else the billing summary. Null when neither is complete. */
export function githubCredits(collection: Collection, month: string): BillingAmounts | null {
  if (sourceComplete(collection.sources, 'ai-credit-usage', month)) return sumMonth(collection.aiCredits, month);
  if (sourceComplete(collection.sources, 'usage-summary', month)) return sumMonth(collection.summaryCredits, month);
  return null;
}

/** The month index of a YYYY-MM month of the GitHub data file. */
export const monthOfKey = (month: string): number => monthIndexOf(parseIsoDay(`${month}-01`));

/** The organizations a check should keep, as dictionary ids of the report. Null when no report organization matches. */
function organizationFilter(store: DataStore, organizations: readonly string[]): { allowed: Uint8Array; names: string[] } | null {
  if (organizations.length === 0) return null;
  const wanted = new Set(organizations.map((name) => name.toLowerCase()));
  const allowed = new Uint8Array(store.dicts.org.values.length);
  const names: string[] = [];
  store.dicts.org.values.forEach((name, id) => {
    if (!wanted.has(name.toLowerCase())) return;
    allowed[id] = 1;
    names.push(name);
  });
  return names.length > 0 ? { allowed, names } : null;
}

/** The organizations of an organization file. An enterprise file is compared with the whole report. */
const fileOrganizations = (collection: Collection): string[] =>
  collection.header.scope === 'organization' ? (collection.header.organizations.length > 0 ? collection.header.organizations : collection.organizations) : [];

/** The report organizations of an organization file, as flags by dictionary id. Null for an enterprise file, or when no report organization matches. */
export const reportOrganizations = (collection: Collection, store: DataStore): Uint8Array | null =>
  collection.header.scope === 'organization' ? (organizationFilter(store, fileOrganizations(collection))?.allowed ?? null) : null;

/**
 * True when the budgets of the file cover all usage of the report: an enterprise file, or an organization file that
 * has every organization of the report. A budget of one organization says nothing about the others.
 */
export function fileCoversReport(collection: Collection, store: DataStore): boolean {
  if (collection.header.scope === 'enterprise') return true;
  const organizations = new Set(fileOrganizations(collection).map((name) => name.toLowerCase()));
  return store.dicts.org.values.every((name) => name === BLANK || organizations.has(name.toLowerCase()));
}

/** Usage report totals by month index, over every row or only the given organizations. */
function reportTotals(store: DataStore, allowed: Uint8Array | null): Map<number, BillingAmounts> {
  const totals = new Map<number, BillingAmounts>();
  for (let i = 0; i < store.n; i++) {
    if (allowed !== null && allowed[store.org[i]] === 0) continue;
    const month = monthIndexOf(store.day[i]);
    let total = totals.get(month);
    if (total === undefined) {
      total = zero();
      totals.set(month, total);
    }
    total.gross += store.gross[i];
    total.discount += store.discount[i];
    total.net += store.net[i];
    total.quantity += store.qty[i];
  }
  return totals;
}

function compareAmounts(report: BillingAmounts, github: BillingAmounts): 'match' | 'lower' | 'higher' {
  const tolerance = (left: number, right: number): number => Math.max(1, MATCH_SHARE * Math.max(Math.abs(left), Math.abs(right)));
  const grossGap = github.gross - report.gross;
  if (Math.abs(grossGap) > tolerance(github.gross, report.gross)) return grossGap > 0 ? 'lower' : 'higher';
  const netGap = github.net - report.net;
  if (Math.abs(netGap) > tolerance(github.net, report.net)) return netGap > 0 ? 'lower' : 'higher';
  return 'match';
}

/** Sets every billing month of the GitHub data file against the usage report. */
export function checkMonths(collection: Collection, store: DataStore): { months: MonthCheck[]; checkedOrgs: string[] } {
  const filter = organizationFilter(store, fileOrganizations(collection));
  const organizationScoped = collection.header.scope === 'organization';
  const allowed = organizationScoped ? filter?.allowed ?? new Uint8Array(store.dicts.org.values.length) : null;
  const totals = reportTotals(store, allowed);
  const collectedDay = parseIsoDay(collection.header.day);
  const months = collection.header.months.map((month): MonthCheck => {
    const monthIndex = monthOfKey(month);
    const start = monthStartDay(monthIndex);
    const end = monthEndDay(monthIndex);
    const report = totals.get(monthIndex) ?? zero();
    const github = githubCredits(collection, month);
    const gaps = { grossGap: github ? github.gross - report.gross : 0, netGap: github ? github.net - report.net : 0 };
    let status: MonthCheckStatus;
    if (github === null) status = 'missing';
    else if (organizationScoped && filter === null) status = 'outside';
    else if (end >= collectedDay) status = 'open';
    else if (store.n === 0 || store.maxDay < start || store.minDay > end) status = 'outside';
    else if (store.minDay > start + EDGE_DAYS || store.maxDay < end - EDGE_DAYS) status = 'partial';
    else status = compareAmounts(report, github);
    return { month, status, report, github, ...gaps };
  });
  return { months, checkedOrgs: filter?.names ?? [] };
}

/** Seat charges plus AI credits billed, month by month. */
export function monthBills(collection: Collection): MonthBill[] {
  const collectedDay = parseIsoDay(collection.header.day);
  return collection.header.months.map((month) => {
    const summary = sourceComplete(collection.sources, 'usage-summary', month);
    const seatLine = summary ? sumMonth(collection.seatCharges, month) : null;
    const credits = githubCredits(collection, month);
    const seats = seatLine?.net ?? null;
    const aiCredits = credits?.net ?? null;
    return {
      month,
      seats,
      seatMonths: seatLine?.quantity ?? null,
      aiCredits,
      total: seats !== null && aiCredits !== null ? seats + aiCredits : null,
      open: monthEndDay(monthOfKey(month)) >= collectedDay,
    };
  });
}

/**
 * The AI credit budget that limits the billed amount of the usage report: a budget for AI credits (SKU level) set on the
 * same enterprise, or on the one organization of an organization file. When several apply, the smallest one binds first.
 * Product budgets for all of GitHub Copilot are not used, because they can also count seat charges.
 */
export function pickBudget(collection: Collection): GitHubBudget | null {
  const { header } = collection;
  const organization = header.scope === 'organization' && header.organizations.length === 1 ? header.organizations[0].toLowerCase() : null;
  const enterprise = header.enterprise?.toLowerCase() ?? null;
  const fits = (budget: GitHubBudget): boolean => {
    if (!budget.aiCredits || budget.amount <= 0) return false;
    if (header.scope === 'enterprise') return budget.scope === 'enterprise' && (budget.entity === '' || enterprise === null || budget.entity.toLowerCase() === enterprise);
    return organization !== null && budget.scope === 'organization' && budget.entity.toLowerCase() === organization;
  };
  let best: GitHubBudget | null = null;
  for (const budget of collection.budgets) if (fits(budget) && (best === null || budget.amount < best.amount)) best = budget;
  return best;
}

/** Users who have used up the limit GitHub holds them to: the most specific of their own budget, their cost center's limit and the limit for each user. */
export function usersAtLimit(collection: Collection): UserAtLimit[] {
  return heldUsers(collection)
    .filter((user) => user.consumed >= user.limit)
    .map((user) => ({ login: user.login, consumed: user.consumed, limit: user.limit }))
    .sort((a, b) => b.consumed / b.limit - a.consumed / a.limit || a.login.localeCompare(b.login));
}

const SCOPE_ORDER = ['enterprise', 'organization', 'cost_center', 'multi_user_customer', 'multi_user_cost_center', 'repository', 'user'];

function sortBudgets(budgets: GitHubBudget[], inUse: GitHubBudget | null): GitHubBudget[] {
  const rank = (budget: GitHubBudget): number => {
    if (budget === inUse) return -1;
    const index = SCOPE_ORDER.indexOf(budget.scope);
    return index === -1 ? SCOPE_ORDER.length : index;
  };
  return [...budgets].sort((a, b) => rank(a) - rank(b) || a.entity.localeCompare(b.entity) || a.amount - b.amount);
}

const sumOrNull = (values: (number | null)[]): number | null => (values.some((value) => value !== null) ? values.reduce<number>((total, value) => total + (value ?? 0), 0) : null);

/** The seat list of the file in the shape the license list uses. Team memberships fill in seats without an assigning team. */
export function collectionLicenseParse(collection: Collection): LicenseParse {
  const total = collection.seatTotals.length > 0 ? collection.seatTotals.reduce((sum, line) => sum + line.total, 0) : undefined;
  const parse = parseLicenseValue({ total_seats: total, seats: collection.seats });
  parse.exportedAt = collection.header.day;
  for (const seat of parse.seats) {
    if (seat.teams.length > 0) continue;
    const slugs = collection.userTeams[seat.login.toLowerCase()];
    if (slugs !== undefined) seat.teams = [...slugs].sort();
  }
  return parse;
}

function seatOverview(collection: Collection): SeatOverview | null {
  const hasSeats = collection.seats.length > 0;
  if (!hasSeats && collection.seatSummaries.length === 0) return null;
  const orgs = [...collection.seatSummaries].sort((a, b) => a.org.localeCompare(b.org));
  const seatLogins = new Set<string>();
  for (const seat of collection.seats) {
    const assignee = (seat as { assignee?: { login?: unknown } }).assignee;
    if (typeof assignee?.login === 'string') seatLogins.add(assignee.login.toLowerCase());
  }
  const membersKnown = sourceComplete(collection.sources, 'members') && collection.members.length > 0;
  const seatsKnown = sourceComplete(collection.sources, 'seats') && hasSeats;
  return {
    total: sumOrNull(orgs.map((org) => org.total)),
    addedThisCycle: sumOrNull(orgs.map((org) => org.addedThisCycle)),
    pendingCancellation: sumOrNull(orgs.map((org) => org.pendingCancellation)),
    pendingInvitation: sumOrNull(orgs.map((org) => org.pendingInvitation)),
    activeThisCycle: sumOrNull(orgs.map((org) => org.activeThisCycle)),
    inactiveThisCycle: sumOrNull(orgs.map((org) => org.inactiveThisCycle)),
    orgs,
    assignAll: orgs.filter((org) => org.management === 'assign_all').map((org) => org.org),
    seatCount: seatLogins.size,
    memberCount: membersKnown ? collection.members.length : null,
    membersWithoutSeat: membersKnown && seatsKnown ? collection.members.filter((login) => !seatLogins.has(login)).length : null,
  };
}

function activityOverview(collection: Collection, store: DataStore): ActivityOverview | null {
  const metrics = collection.metrics;
  if (metrics === null) return null;
  const count = (pick: (user: MetricsUser) => number): number => metrics.users.filter((user) => pick(user) > 0).length;
  const first = parseIsoDay(metrics.firstDay);
  const last = parseIsoDay(metrics.lastDay);
  const from = Math.max(first, store.minDay);
  const to = Math.min(last, store.maxDay);
  let withoutUsage: string[] | null = null;
  if (store.n > 0 && from <= to) {
    const seen = new Uint8Array(store.dicts.user.values.length);
    for (let i = 0; i < store.n; i++) if (store.day[i] >= from && store.day[i] <= to) seen[store.user[i]] = 1;
    const reportUsers = new Set<string>();
    store.dicts.user.values.forEach((login, id) => {
      if (seen[id] === 1) reportUsers.add(login.toLowerCase());
    });
    withoutUsage = metrics.users
      .filter((user) => parseIsoDay(user.lastDay) >= from && parseIsoDay(user.firstDay) <= to && !reportUsers.has(user.login.toLowerCase()))
      .map((user) => user.login)
      .sort((a, b) => a.localeCompare(b));
  }
  return {
    firstDay: metrics.firstDay,
    lastDay: metrics.lastDay,
    dayCount: metrics.dayCount,
    activeUsers: metrics.users.length,
    completionUsers: count((user) => user.completionDays),
    chatUsers: count((user) => user.chatDays),
    agentUsers: count((user) => user.agentDays),
    cliUsers: count((user) => user.cliDays),
    withoutUsage,
  };
}

function auditOverview(events: readonly AuditEvent[]): AuditOverview | null {
  if (events.length === 0) return null;
  const tally = { 'seat-added': 0, 'seat-removed': 0, plan: 0, budget: 0, policy: 0, other: 0 };
  const byMonth = new Map<string, AuditMonth>();
  for (const event of events) {
    tally[event.kind]++;
    if ((event.kind !== 'seat-added' && event.kind !== 'seat-removed') || event.day === undefined) continue;
    const month = event.day.slice(0, 7);
    let line = byMonth.get(month);
    if (line === undefined) {
      line = { month, added: 0, removed: 0 };
      byMonth.set(month, line);
    }
    if (event.kind === 'seat-added') line.added++;
    else line.removed++;
  }
  return {
    seatsAdded: tally['seat-added'],
    seatsRemoved: tally['seat-removed'],
    planChanges: tally.plan,
    budgetChanges: tally.budget,
    policyChanges: tally.policy,
    other: tally.other,
    months: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)),
  };
}

/** Everything the app shows from a GitHub data file, set against the loaded usage report. */
export function deriveGitHub(collection: Collection, store: DataStore): GitHubData {
  const budget = fileCoversReport(collection, store) ? pickBudget(collection) : null;
  const copilot = collection.budgets.filter((item) => item.copilot);
  const { months, checkedOrgs } = checkMonths(collection, store);
  return {
    collection,
    budget,
    copilotBudgets: sortBudgets(copilot, budget),
    otherBudgets: collection.budgets.length - copilot.length,
    usersAtLimit: usersAtLimit(collection),
    months,
    checkedOrgs,
    bills: monthBills(collection),
    seats: seatOverview(collection),
    activity: activityOverview(collection, store),
    audit: auditOverview(collection.audit),
    problems: collection.sources.filter((source) => source.status === 'failed' || source.status === 'partial'),
  };
}
