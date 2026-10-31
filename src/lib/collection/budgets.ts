import type { DataStore } from '../types';
import { BLANK } from '../types';
import { daysInMonth, monthEndDay, monthIndexOf, monthStartDay, parseIsoDay } from '../utils/date';
import { reportOrganizations, sourceComplete } from './derive';
import { heldUsers, limitIndex, type UserLimitKind } from './limits';
import type { AuditEvent, Collection, GitHubBudget } from './types';

/** How full a budget is: used up (100% or more), near the limit (80% to 100%), half used (50% to 80%) or low (under 50%). */
export type BudgetLevel = 'low' | 'half' | 'near' | 'used-up';

/** The levels from positive to negative. */
export const BUDGET_LEVELS: BudgetLevel[] = ['low', 'half', 'near', 'used-up'];

export const NEAR_SHARE = 0.8;
export const HALF_SHARE = 0.5;
/** The projection rate is the average billed per day over at most this many of the last days. */
export const PACE_DAYS = 7;

export function budgetLevel(share: number): BudgetLevel {
  if (share >= 1) return 'used-up';
  if (share >= NEAR_SHARE) return 'near';
  if (share >= HALF_SHARE) return 'half';
  return 'low';
}

/** A budget for GitHub Copilot that is not for a single user, with the share of it used. */
export interface BudgetRow {
  budget: GitHubBudget;
  /** Amount used ÷ budget. Null when GitHub gave no amount used or the budget is 0. */
  share: number | null;
  level: BudgetLevel | null;
}

/** One user held to a budget: a user of a shared budget, or a budget for that user alone. */
export interface BudgetUserRow {
  login: string;
  consumed: number;
  limit: number;
  share: number;
  level: BudgetLevel;
  budgetId: string;
  /** The kind of limit the user is held to. */
  kind: UserLimitKind;
}

/** An organization or cost center with billed usage in the budget month and no budget of its own. */
export interface UnbudgetedScope {
  scope: 'organization' | 'cost_center';
  name: string;
  billed: number;
}

/** How a budget fills up during the month the data was collected. */
export interface BudgetPace {
  /** YYYY-MM */
  month: string;
  monthDays: number;
  /** Day of the month the data was collected. */
  collectedDay: number;
  /** report: from the billed amounts of the usage report. github: from the amount used that GitHub showed. */
  basis: 'report' | 'github';
  /** Billed so far at the end of each day of the month, from day 1 to `lastDay`. Empty for the github basis. */
  cumulative: number[];
  /** Day of the month of the last known amount. */
  lastDay: number;
  /** Amount used at the end of `lastDay`. */
  used: number;
  /** Average billed per day used for the projection. */
  dailyRate: number;
  /** Expected amount used at the end of the month. */
  projected: number;
  /** Day of the month on which the amount reaches the budget. Null when it does not reach it this month. */
  runOutDay: number | null;
  /** The budget was already used up on `lastDay`. */
  usedUp: boolean;
}

export interface BudgetOverview {
  /** YYYY-MM month of the day the data was collected. */
  month: string;
  /** Every budget for GitHub Copilot. */
  total: number;
  /** Budgets for GitHub Copilot that stop usage when used up, and those that only send alerts. */
  stopping: number;
  alerting: number;
  /** The budgets for GitHub Copilot of the enterprise, organizations, cost centers and repositories, fullest first. Budgets for users are in `users`. */
  budgets: BudgetRow[];
  usedUp: number;
  near: number;
  /** Budgets expected to be used up before the month ends, not counting those already used up. */
  projectedOut: BudgetRow[];
  users: BudgetUserRow[];
  /** User counts by level, in the order of BUDGET_LEVELS. */
  userLevels: Record<BudgetLevel, number>;
  /** Null when the budgets were not read in full, so a missing budget cannot be told apart from a failed read. */
  unbudgeted: UnbudgetedScope[] | null;
  /** True when a budget for the whole enterprise covers usage that has no budget of its own. */
  enterpriseBudget: boolean;
  changes: AuditEvent[];
  /** The billed amount per day of the month for each budget in `budgets`, for the month pace. */
  billed: MonthBilled;
}

const shareOf = (consumed: number | null, amount: number): number | null => (consumed === null || amount <= 0 ? null : consumed / amount);
const lower = (value: string) => value.toLowerCase();

/** The month the data was collected in, as a month index. */
export function collectionMonth(collection: Collection): number {
  return monthIndexOf(parseIsoDay(collection.header.day));
}

type MatchField = 'org' | 'costCenter' | 'repo' | 'user';

/** The report rows a budget covers: every row, or the rows of some ids of one field. */
type BudgetMatch = { field: 'all' } | { field: MatchField; ids: number[] };

/** Report ids by lower-case name, built once for each field that a budget needs. */
function nameIndex(store: DataStore): (field: MatchField) => Map<string, number[]> {
  const built = new Map<MatchField, Map<string, number[]>>();
  return (field) => {
    let names = built.get(field);
    if (names === undefined) {
      names = new Map();
      store.dicts[field].values.forEach((value, id) => {
        const key = lower(value);
        const ids = names!.get(key);
        if (ids === undefined) names!.set(key, [id]);
        else ids.push(id);
      });
      built.set(field, names);
    }
    return names;
  };
}

/** The rows of the report that a budget covers. Null when the budget matches no row, so the amount GitHub showed is used instead. */
function matchBudget(collection: Collection, budget: GitHubBudget, names: (field: MatchField) => Map<string, number[]>): BudgetMatch | null {
  const idsOf = (field: MatchField, wanted: Iterable<string>): BudgetMatch | null => {
    const lookup = names(field);
    const ids = new Set<number>();
    for (const name of wanted) for (const id of lookup.get(lower(name)) ?? []) ids.add(id);
    return ids.size > 0 ? { field, ids: [...ids] } : null;
  };
  const entity = lower(budget.entity);
  switch (budget.scope) {
    case 'enterprise':
      return collection.header.scope === 'enterprise' ? { field: 'all' } : null;
    case 'organization':
      return idsOf('org', [entity]);
    case 'cost_center':
      return idsOf('costCenter', [entity]);
    case 'repository':
      return idsOf('repo', entity.includes('/') ? [entity, entity.slice(entity.indexOf('/') + 1)] : [entity]);
    case 'user':
      return idsOf('user', [budget.user ?? budget.entity]);
    default: {
      // Budgets for a group of users: the users GitHub listed for the budget.
      const users = limitIndex(collection).states.get(budget.id);
      return users === undefined ? null : idsOf('user', users.keys());
    }
  }
}

/** The billed amount per day of the month the data was collected, for each budget that matches rows of the report. */
export interface MonthBilled {
  /** YYYY-MM */
  month: string;
  monthDays: number;
  /** Day of the month the data was collected. */
  collectedDay: number;
  /** The last day of the month the report can show: the day of collection, or the report's last day when that is earlier. 0 when the report has no rows in the month. */
  lastDay: number;
  /** Billed per day, from day 1 to `lastDay`, by budget id. */
  daily: Map<string, Float64Array>;
}

/**
 * Adds up the billed amount of the report day by day for each budget for AI credits, in one pass over the rows.
 * Budgets that cover all of GitHub Copilot can also count seat charges, which the report does not have, so they are left out.
 */
export function monthBilled(collection: Collection, store: DataStore, budgets: readonly GitHubBudget[]): MonthBilled {
  const monthIndex = collectionMonth(collection);
  const monthDays = daysInMonth(monthIndex);
  const collectedDay = Number(collection.header.day.slice(8, 10));
  const start = monthStartDay(monthIndex);
  const end = monthEndDay(monthIndex);
  const hasRows = store.n > 0 && store.maxDay >= start && store.minDay <= end;
  // The report can end before the day of collection; it cannot know later days.
  const lastDay = hasRows ? Math.min(monthDays, collectedDay, Math.max(1, store.maxDay - start + 1)) : 0;
  const daily = new Map<string, Float64Array>();
  const result: MonthBilled = { month: collection.header.day.slice(0, 7), monthDays, collectedDay, lastDay, daily };
  if (lastDay === 0) return result;

  const names = nameIndex(store);
  const matches: [GitHubBudget, BudgetMatch][] = [];
  for (const budget of budgets) {
    if (!budget.aiCredits) continue;
    const match = matchBudget(collection, budget, names);
    if (match !== null) matches.push([budget, match]);
  }
  if (matches.length === 0) return result;

  const wantsAll = matches.some(([, match]) => match.field === 'all');
  const totalDaily = new Float64Array(lastDay);
  const byId = new Map<MatchField, Map<number, Float64Array>>();
  for (const [, match] of matches) {
    if (match.field === 'all') continue;
    let perId = byId.get(match.field);
    if (perId === undefined) {
      perId = new Map();
      byId.set(match.field, perId);
    }
    for (const id of match.ids) if (!perId.has(id)) perId.set(id, new Float64Array(lastDay));
  }
  const fieldIds = [...byId.entries()].map(([field, perId]) => ({ ids: store[field], perId }));
  for (let i = 0; i < store.n; i++) {
    const dayIndex = store.day[i] - start;
    const billed = store.net[i];
    if (dayIndex < 0 || dayIndex >= lastDay || billed === 0) continue;
    if (wantsAll) totalDaily[dayIndex] += billed;
    for (const { ids, perId } of fieldIds) {
      const days = perId.get(ids[i]);
      if (days !== undefined) days[dayIndex] += billed;
    }
  }
  for (const [budget, match] of matches) {
    if (match.field === 'all') {
      daily.set(budget.id, totalDaily);
      continue;
    }
    const perId = byId.get(match.field)!;
    const sum = new Float64Array(lastDay);
    for (const id of match.ids) {
      const days = perId.get(id)!;
      for (let day = 0; day < lastDay; day++) sum[day] += days[day];
    }
    daily.set(budget.id, sum);
  }
  return result;
}

/** The day of the month an amount reaches a budget at a rate per day, or null when it does not this month. */
export function runOut(amount: number, used: number, lastDay: number, dailyRate: number, monthDays: number): number | null {
  if (amount <= 0) return null;
  if (used >= amount) return lastDay;
  if (dailyRate <= 0) return null;
  const day = lastDay + Math.ceil((amount - used) / dailyRate);
  return day <= monthDays ? day : null;
}

/** The average per day over at most the last PACE_DAYS days, counted from the first day with an amount. */
export function recentRate(daily: ArrayLike<number>, lastDay: number): number {
  let firstDay = 0;
  for (let day = 1; day <= lastDay; day++) {
    if (daily[day - 1] > 0) {
      firstDay = day;
      break;
    }
  }
  if (firstDay === 0) return 0;
  const windowStart = Math.max(firstDay, lastDay - PACE_DAYS + 1);
  let windowTotal = 0;
  for (let day = windowStart; day <= lastDay; day++) windowTotal += daily[day - 1];
  return windowTotal / (lastDay - windowStart + 1);
}

function paceFromGitHub(budget: GitHubBudget, month: string, monthDays: number, collectedDay: number): BudgetPace | null {
  if (budget.consumed === null) return null;
  const elapsed = Math.max(1, collectedDay - 1);
  const dailyRate = budget.consumed / elapsed;
  return {
    month,
    monthDays,
    collectedDay,
    basis: 'github',
    cumulative: [],
    lastDay: elapsed,
    used: budget.consumed,
    dailyRate,
    projected: budget.consumed + dailyRate * (monthDays - elapsed),
    runOutDay: runOut(budget.amount, budget.consumed, elapsed, dailyRate, monthDays),
    usedUp: budget.amount > 0 && budget.consumed >= budget.amount,
  };
}

/**
 * How a budget fills up in the month the data was collected. It adds up the billed amount of the report rows that
 * the budget covers, day by day, and projects the rest of the month from the average billed per day since billing
 * started, over at most the last 7 days. When the report does not cover the month or the budget, or the budget also
 * counts seat charges, it uses the amount GitHub showed and spreads it evenly over the days so far.
 * Pass `billed` from `monthBilled` to reuse one pass over the report for many budgets.
 */
export function budgetPace(collection: Collection, store: DataStore, budget: GitHubBudget, billed?: MonthBilled): BudgetPace | null {
  const month = billed ?? monthBilled(collection, store, [budget]);
  const daily = month.daily.get(budget.id);
  if (daily === undefined || month.lastDay === 0) return paceFromGitHub(budget, month.month, month.monthDays, month.collectedDay);
  const { lastDay, monthDays } = month;
  const cumulative: number[] = [];
  let total = 0;
  for (const amount of daily) cumulative.push((total += amount));
  const dailyRate = recentRate(daily, lastDay);
  return {
    month: month.month,
    monthDays,
    collectedDay: month.collectedDay,
    basis: 'report',
    cumulative,
    lastDay,
    used: total,
    dailyRate,
    projected: total + dailyRate * (monthDays - lastDay),
    runOutDay: runOut(budget.amount, total, lastDay, dailyRate, monthDays),
    usedUp: budget.amount > 0 && total >= budget.amount,
  };
}

/**
 * Every user held to a limit for users, one line per login. GitHub holds a user to the most specific limit: a
 * budget of their own, then the limit of their cost center, then the limit for each user.
 */
export function budgetUsers(collection: Collection): BudgetUserRow[] {
  return heldUsers(collection)
    .map((user): BudgetUserRow => {
      const share = user.consumed / user.limit;
      return { login: user.login, consumed: user.consumed, limit: user.limit, share, level: budgetLevel(share), budgetId: user.budgetId, kind: user.kind };
    })
    .sort((a, b) => b.share - a.share || a.login.localeCompare(b.login));
}

/**
 * Organizations and cost centers with billed usage in the month and no budget of their own, most billed first.
 * An organization file only knows the budgets of its own organizations, so only their rows count and cost centers are left out.
 */
function unbudgetedScopes(store: DataStore, collection: Collection): UnbudgetedScope[] {
  const withBudget = new Set(collection.budgets.filter((budget) => budget.copilot).map((budget) => `${budget.scope}|${lower(budget.entity)}`));
  const organizationFile = collection.header.scope === 'organization';
  const allowed = organizationFile ? reportOrganizations(collection, store) : null;
  if (organizationFile && allowed === null) return [];
  const monthIndex = collectionMonth(collection);
  const start = monthStartDay(monthIndex);
  const end = monthEndDay(monthIndex);
  const orgBilled = new Float64Array(store.dicts.org.values.length);
  const costCenterBilled = new Float64Array(store.dicts.costCenter.values.length);
  for (let i = 0; i < store.n; i++) {
    if (store.day[i] < start || store.day[i] > end || store.net[i] <= 0) continue;
    if (allowed !== null && allowed[store.org[i]] === 0) continue;
    orgBilled[store.org[i]] += store.net[i];
    if (!organizationFile) costCenterBilled[store.costCenter[i]] += store.net[i];
  }
  const out: UnbudgetedScope[] = [];
  const collect = (scope: UnbudgetedScope['scope'], values: readonly string[], billedById: Float64Array): void => {
    // One name can appear in more than one case; add them up under the first spelling.
    const byName = new Map<string, UnbudgetedScope>();
    values.forEach((name, id) => {
      if (name === BLANK || billedById[id] <= 0 || withBudget.has(`${scope}|${lower(name)}`)) return;
      const had = byName.get(lower(name));
      if (had !== undefined) had.billed += billedById[id];
      else byName.set(lower(name), { scope, name, billed: billedById[id] });
    });
    out.push(...byName.values());
  };
  collect('organization', store.dicts.org.values, orgBilled);
  collect('cost_center', store.dicts.costCenter.values, costCenterBilled);
  return out.sort((a, b) => b.billed - a.billed || a.name.localeCompare(b.name));
}

/** Everything the Budgets page shows from a GitHub data file and the usage report. */
export function budgetOverview(collection: Collection, store: DataStore): BudgetOverview {
  const copilot = collection.budgets.filter((budget) => budget.copilot);
  const budgets = copilot
    .filter((budget) => budget.scope !== 'user' && !budget.scope.startsWith('multi_user'))
    .map((budget): BudgetRow => {
      const share = shareOf(budget.consumed, budget.amount);
      return { budget, share, level: share === null ? null : budgetLevel(share) };
    })
    .sort((a, b) => (b.share ?? -1) - (a.share ?? -1) || a.budget.entity.localeCompare(b.budget.entity));
  const billed = monthBilled(
    collection,
    store,
    budgets.map((row) => row.budget),
  );
  const projectedOut = budgets.filter((row) => {
    if (row.level === 'used-up') return false;
    const pace = budgetPace(collection, store, row.budget, billed);
    return pace !== null && pace.runOutDay !== null && !pace.usedUp;
  });
  const users = budgetUsers(collection);
  const userLevels: Record<BudgetLevel, number> = { low: 0, half: 0, near: 0, 'used-up': 0 };
  for (const user of users) userLevels[user.level]++;
  const changes = collection.audit.filter((event) => event.kind === 'budget').sort((a, b) => (b.day ?? '').localeCompare(a.day ?? ''));
  return {
    month: collection.header.day.slice(0, 7),
    total: copilot.length,
    stopping: copilot.filter((budget) => budget.stopsUsage).length,
    alerting: copilot.filter((budget) => !budget.stopsUsage).length,
    budgets,
    usedUp: budgets.filter((row) => row.level === 'used-up').length,
    near: budgets.filter((row) => row.level === 'near').length,
    projectedOut,
    users,
    userLevels,
    unbudgeted: sourceComplete(collection.sources, 'budgets') ? unbudgetedScopes(store, collection) : null,
    enterpriseBudget: collection.budgets.some((budget) => budget.copilot && budget.scope === 'enterprise'),
    changes,
    billed,
  };
}
