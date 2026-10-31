import type { DataStore } from '../types';
import { BLANK } from '../types';
import { monthEndDay, monthStartDay } from '../utils/date';
import { budgetLevel, collectionMonth, type BudgetLevel, type BudgetRow } from './budgets';
import { budgetEnded, limitIndex, limitKindOf, resolveUserLimit, type UserLimitKind } from './limits';
import type { Collection, GitHubBudget } from './types';

/** A limit for each user, with how many users it holds and how many of them used it up. */
export interface PerUserLimit {
  budget: GitHubBudget;
  /** Users held to this limit: users with usage this month, or listed by GitHub. */
  users: number;
  usedUp: number;
}

/** A cost center, organization or repository with a limit of its own. */
export interface BudgetRoom {
  scope: 'cost_center' | 'organization' | 'repository';
  name: string;
  /** Spending limits on the amount billed for it, smallest first. */
  limits: BudgetRow[];
  /** The limit for each user of a cost center. */
  perUser: PerUserLimit | null;
  /** The cost center may use only its own share of the included credits. */
  poolCapped: boolean;
}

/** A budget for one user. */
export interface OwnLimit {
  budget: GitHubBudget;
  login: string;
  /** Amount used ÷ budget. Null when GitHub gave no amount used. */
  share: number | null;
  level: BudgetLevel | null;
}

/** How the budgets of GitHub fit together, from the top (the whole account) to the bottom (each user). */
export interface BudgetMap {
  /** The enterprise, or the organization of an organization file. */
  top: { scope: 'enterprise' | 'organization'; name: string; limits: BudgetRow[] };
  /** Cost centers first, then organizations, then repositories. Inside each, the fullest first. */
  rooms: BudgetRoom[];
  /** Cost centers in the file with no limit of any kind. */
  roomsWithoutLimit: number;
  /** Users with a budget of their own, fullest first. */
  own: OwnLimit[];
  /** The limit for each user of the enterprise or organization. */
  everyone: PerUserLimit | null;
  /** Users with usage this month or listed by GitHub, by the limit that holds them. */
  held: Record<UserLimitKind | 'none', number>;
}

const SCOPE_RANK: Record<BudgetRoom['scope'], number> = { cost_center: 0, organization: 1, repository: 2 };

const rowOf = (budget: GitHubBudget): BudgetRow => {
  const share = budget.consumed === null || budget.amount <= 0 ? null : budget.consumed / budget.amount;
  return { budget, share, level: share === null ? null : budgetLevel(share) };
};

const fullest = (room: BudgetRoom): number => Math.max(-1, ...room.limits.map((row) => row.share ?? -1));

/** Usage per login in lower case in the month the data was collected, up to that day, with the latest cost center of each. */
function monthUsage(collection: Collection, store: DataStore): Map<string, { login: string; usage: number; costCenter: string | undefined }> {
  const monthIndex = collectionMonth(collection);
  const start = monthStartDay(monthIndex);
  const end = Math.min(monthEndDay(monthIndex), start + Number(collection.header.day.slice(8, 10)) - 1);
  const users = store.dicts.user.values;
  const usage = new Float64Array(users.length);
  const seen = new Uint8Array(users.length);
  const costCenter = new Int32Array(users.length).fill(-1);
  const costCenterDay = new Int32Array(users.length).fill(-1);
  for (let i = 0; i < store.n; i++) {
    const day = store.day[i];
    if (day < start || day > end) continue;
    const user = store.user[i];
    seen[user] = 1;
    usage[user] += store.gross[i];
    if (day >= costCenterDay[user] && store.dicts.costCenter.values[store.costCenter[i]] !== BLANK) {
      costCenter[user] = store.costCenter[i];
      costCenterDay[user] = day;
    }
  }
  const byLogin = new Map<string, { login: string; usage: number; costCenter: string | undefined }>();
  users.forEach((login, id) => {
    if (seen[id] === 0 || login === BLANK) return;
    const key = login.toLowerCase();
    const name = costCenter[id] >= 0 ? store.dicts.costCenter.values[costCenter[id]] : undefined;
    const had = byLogin.get(key);
    if (had === undefined) byLogin.set(key, { login, usage: usage[id], costCenter: name });
    else {
      had.usage += usage[id];
      had.costCenter ??= name;
    }
  });
  return byLogin;
}

/**
 * Every budget for GitHub Copilot in one picture. The spending limits of the enterprise (or organization), of cost
 * centers, organizations and repositories cap the amount billed after included credits run out. The limits for users
 * cap what each user uses, included credits too: a budget of the user's own, the limit of their cost center, or the
 * limit for each user, and the most specific one applies.
 */
export function budgetMap(collection: Collection, store: DataStore): BudgetMap {
  const { header } = collection;
  const copilot = collection.budgets.filter((budget) => budget.copilot);
  const topScope = header.scope;
  const topName = topScope === 'enterprise' ? (header.enterprise ?? '') : header.organizations.length === 1 ? header.organizations[0] : '';
  const isTop = (budget: GitHubBudget): boolean =>
    budget.scope === 'enterprise' || (topScope === 'organization' && budget.scope === 'organization' && (topName === '' || budget.entity.toLowerCase() === topName.toLowerCase()));

  const top = copilot.filter(isTop).map(rowOf).sort((a, b) => a.budget.amount - b.budget.amount);
  const rooms = new Map<string, BudgetRoom>();
  const roomOf = (scope: BudgetRoom['scope'], name: string): BudgetRoom => {
    const key = `${scope}|${name.toLowerCase()}`;
    let room = rooms.get(key);
    if (room === undefined) {
      room = { scope, name, limits: [], perUser: null, poolCapped: false };
      rooms.set(key, room);
    }
    return room;
  };
  for (const budget of copilot) {
    if (isTop(budget) || limitKindOf(budget) !== null) continue;
    if (budget.scope === 'cost_center' || budget.scope === 'organization' || budget.scope === 'repository') roomOf(budget.scope, budget.entity).limits.push(rowOf(budget));
  }

  const index = limitIndex(collection);
  for (const budget of index.costCenterLimits.values()) roomOf('cost_center', budget.entity).perUser = { budget, users: 0, usedUp: 0 };
  const everyone: PerUserLimit | null = index.everyone !== null ? { budget: index.everyone, users: 0, usedUp: 0 } : null;

  // Every user who used something this month or whom GitHub listed against a limit.
  const usage = monthUsage(collection, store);
  const logins = new Map<string, string>();
  for (const [key, entry] of usage) logins.set(key, entry.login);
  for (const state of collection.budgetUsers) if (!logins.has(state.login.toLowerCase())) logins.set(state.login.toLowerCase(), state.login);
  for (const [key, budget] of index.own) if (!logins.has(key)) logins.set(key, budget.user ?? budget.entity);

  const held: BudgetMap['held'] = { own: 0, 'cost-center': 0, everyone: 0, none: 0 };
  for (const [key, login] of logins) {
    const report = usage.get(key);
    const limit = resolveUserLimit(collection, index, login, report?.costCenter);
    if (limit === null) {
      held.none++;
      continue;
    }
    held[limit.kind]++;
    const used = limit.githubUsed ?? report?.usage ?? 0;
    const usedUp = limit.amount > 0 && used >= limit.amount ? 1 : 0;
    const counter = limit.kind === 'everyone' ? everyone : limit.kind === 'cost-center' ? (rooms.get(`cost_center|${limit.budget.entity.toLowerCase()}`)?.perUser ?? null) : null;
    if (counter !== null) {
      counter.users++;
      counter.usedUp += usedUp;
    }
  }

  for (const costCenter of collection.costCenters) {
    const room = rooms.get(`cost_center|${costCenter.name.toLowerCase()}`);
    if (room !== undefined) room.poolCapped = costCenter.poolCapped;
  }
  const roomList = [...rooms.values()];
  for (const room of roomList) room.limits.sort((a, b) => a.budget.amount - b.budget.amount);
  roomList.sort((a, b) => SCOPE_RANK[a.scope] - SCOPE_RANK[b.scope] || fullest(b) - fullest(a) || a.name.localeCompare(b.name));
  const roomsWithoutLimit = collection.costCenters.filter((costCenter) => !rooms.has(`cost_center|${costCenter.name.toLowerCase()}`)).length;

  const own = copilot
    .filter((budget) => budget.scope === 'user' && (budget.user ?? budget.entity) !== '' && !budgetEnded(budget, header.day))
    .map((budget): OwnLimit => ({ ...rowOf(budget), login: budget.user ?? budget.entity }))
    .sort((a, b) => (b.share ?? -1) - (a.share ?? -1) || a.login.localeCompare(b.login));

  return { top: { scope: topScope, name: topName, limits: top }, rooms: roomList, roomsWithoutLimit, own, everyone, held };
}
