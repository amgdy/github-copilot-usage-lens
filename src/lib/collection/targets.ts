import type { DataStore } from '../types';
import { BLANK } from '../types';
import { daysInMonth, monthEndDay, monthStartDay } from '../utils/date';
import { budgetLevel, collectionMonth, recentRate, runOut, type BudgetLevel } from './budgets';
import { reportOrganizations } from './derive';
import { limitIndex, resolveUserLimit, type UserLimit } from './limits';
import type { Collection } from './types';

/** The limit of one user at GitHub, set against what the user used in the month the data was collected. */
export interface UserTarget {
  limit: UserLimit;
  /** YYYY-MM */
  month: string;
  monthDays: number;
  /** Day of the month the data was collected. */
  collectedDay: number;
  /** The last day of the month the report shows, up to the day of collection. 0 when the report has no rows in the month. */
  lastDay: number;
  /** Usage of the user in the report, added up day by day from day 1 to `lastDay`. */
  cumulative: number[];
  /** The amount used this month: what GitHub showed, or else the usage in the report. Null when neither is known. */
  used: number | null;
  usedFrom: 'github' | 'report' | null;
  share: number | null;
  level: BudgetLevel | null;
  /** Average usage per day over at most the last 7 days, from the report. */
  dailyRate: number;
  /** Expected usage at the end of the month. Null when the amount used is not known. */
  projected: number | null;
  /** Day of the month the user reaches the limit at the current pace. Null when not this month. */
  runOutDay: number | null;
}

/** The usage per day of one login in the month, and its latest cost center in the report. */
function reportMonth(collection: Collection, store: DataStore, login: string, start: number, end: number, lastDay: number): { daily: Float64Array; costCenter: string | undefined; inScope: boolean } {
  const daily = new Float64Array(lastDay);
  const wanted = login.toLowerCase();
  const ids = new Uint8Array(store.dicts.user.values.length);
  let any = false;
  store.dicts.user.values.forEach((value, id) => {
    if (value.toLowerCase() === wanted) {
      ids[id] = 1;
      any = true;
    }
  });
  let costCenter: string | undefined;
  let costCenterDay = -1;
  let inScope = false;
  const allowed = reportOrganizations(collection, store);
  if (!any || (collection.header.scope === 'organization' && allowed === null)) return { daily, costCenter, inScope };
  for (let i = 0; i < store.n; i++) {
    const day = store.day[i];
    if (ids[store.user[i]] === 0 || day > end || (allowed !== null && allowed[store.org[i]] === 0)) continue;
    inScope = true;
    if (day < start) continue;
    const dayIndex = day - start;
    if (dayIndex < lastDay) daily[dayIndex] += store.gross[i];
    const name = store.dicts.costCenter.values[store.costCenter[i]];
    if (day >= costCenterDay && name !== undefined && name !== BLANK) {
      costCenter = name;
      costCenterDay = day;
    }
  }
  return { daily, costCenter, inScope };
}

/**
 * The limit GitHub holds a user to, and how much of it the user has used in the month the data was collected.
 * A limit for users counts all AI credit usage, including what included credits pay for, so the report's usage is
 * used when GitHub did not list the user. Null when the applicable user limit cannot be identified.
 */
export function userTarget(collection: Collection, store: DataStore, login: string): UserTarget | null {
  const monthIndex = collectionMonth(collection);
  const monthDays = daysInMonth(monthIndex);
  const collectedDay = Number(collection.header.day.slice(8, 10));
  const start = monthStartDay(monthIndex);
  const end = Math.min(monthEndDay(monthIndex), start + collectedDay - 1);
  const allowed = reportOrganizations(collection, store);
  let lastDay = 0;
  for (let i = 0; i < store.n; i++) {
    const day = store.day[i];
    if (day < start || day > end || (collection.header.scope === 'organization' && (allowed === null || allowed[store.org[i]] === 0))) continue;
    lastDay = Math.max(lastDay, day - start + 1);
  }
  const report = reportMonth(collection, store, login, start, end, lastDay);
  const index = limitIndex(collection);
  const key = login.toLowerCase();
  const listed = collection.budgetUsers.some((state) => state.login.toLowerCase() === key);
  const seated = collection.seats.some((seat) => {
    const record = seat as { assignee?: { login?: unknown } };
    return typeof record.assignee?.login === 'string' && record.assignee.login.toLowerCase() === key;
  });
  if (collection.header.scope === 'organization' && !report.inScope && !listed && !seated && !index.own.has(key)) return null;
  const limit = resolveUserLimit(collection, index, login, report.costCenter);
  if (limit === null) return null;

  const cumulative: number[] = [];
  let total = 0;
  for (const amount of report.daily) cumulative.push((total += amount));
  const dailyRate = lastDay > 0 ? recentRate(report.daily, lastDay) : 0;
  const used = limit.githubUsed ?? (lastDay > 0 ? total : null);
  const usedFrom = limit.githubUsed !== null ? 'github' : used !== null ? 'report' : null;
  const share = used !== null && limit.amount > 0 ? used / limit.amount : null;
  const paceDay = usedFrom === 'github' || lastDay === 0 ? Math.max(1, collectedDay - 1) : lastDay;
  return {
    limit,
    month: collection.header.day.slice(0, 7),
    monthDays,
    collectedDay,
    lastDay,
    cumulative,
    used,
    usedFrom,
    share,
    level: limit.amount === 0 ? 'used-up' : share === null ? null : budgetLevel(share),
    dailyRate,
    projected: used === null ? null : used + dailyRate * (monthDays - paceDay),
    runOutDay: limit.amount === 0 ? paceDay : used === null ? null : runOut(limit.amount, used, paceDay, dailyRate, monthDays),
  };
}
