import { readDay } from '../licenses/dates';
import type { BudgetUserState, Collection, GitHubBudget } from './types';

/**
 * The limits GitHub sets for each user, from the most specific to the broadest: a budget for one user, a limit for
 * each user in a cost center, and a limit for each user of the enterprise or organization. The most specific one
 * that applies is the one GitHub holds the user to.
 */
export type UserLimitKind = 'own' | 'cost-center' | 'everyone';

/** The kinds from the most specific to the broadest. */
export const USER_LIMIT_KINDS: UserLimitKind[] = ['own', 'cost-center', 'everyone'];

const KIND_OF_SCOPE: Record<string, UserLimitKind> = { user: 'own', multi_user_cost_center: 'cost-center', multi_user_customer: 'everyone' };

/** The kind of a limit for users, or null for a spending limit (enterprise, organization, cost center, repository). */
export const limitKindOf = (budget: GitHubBudget): UserLimitKind | null => KIND_OF_SCOPE[budget.scope] ?? null;

/**
 * How the cost center of a user was found, from the surest to the least sure: GitHub lists the user under the
 * cost center's limit, the user is assigned to the cost center, one of the user's teams is, the organization of the
 * user's seat is, or the usage report gives the cost center.
 */
export type CostCenterSource = 'budget' | 'user' | 'team' | 'organization' | 'report';

export interface UserCostCenter {
  name: string;
  source: CostCenterSource;
  /** The team or organization that links the user to the cost center. */
  through?: string;
}

/** A limit that the limit of a user replaces, because the user's limit is more specific. */
export interface ReplacedLimit {
  kind: UserLimitKind;
  budget: GitHubBudget;
  amount: number;
}

/** The limit GitHub holds one user to. */
export interface UserLimit {
  login: string;
  kind: UserLimitKind;
  budget: GitHubBudget;
  /** The amount for this user (USD). */
  amount: number;
  /** The amount used this month as GitHub showed it. Null when GitHub did not list the user. */
  githubUsed: number | null;
  /** The cost center of the user, when the app could find it. */
  costCenter: UserCostCenter | null;
  /** Broader limits that no longer apply to this user, most specific first. */
  replaces: ReplacedLimit[];
}

/** Everything needed to find the limit of any user, built once for a GitHub data file. */
export interface LimitIndex {
  /** The day the data was collected (YYYY-MM-DD). */
  day: string;
  /** Budgets for one user that have not ended, by login in lower case. */
  own: Map<string, GitHubBudget>;
  /** Limits for each user in a cost center, by cost center name in lower case. */
  costCenterLimits: Map<string, GitHubBudget>;
  /** The limit for each user of the enterprise or organization. */
  everyone: GitHubBudget | null;
  /** The users GitHub listed for each budget, by budget id and then login in lower case. */
  states: Map<string, Map<string, BudgetUserState>>;
  /** The cost center each user is listed under by GitHub, from the users of the limits for cost centers. */
  listed: Map<string, string>;
  /** Cost center names by login, team and organization in lower case, from the cost centers of the file. */
  byUser: Map<string, string>;
  byTeam: Map<string, string>;
  byOrganization: Map<string, string>;
  /** Organizations of each user's seats, by login in lower case. */
  seatOrganizations: Map<string, string[]>;
}

const lower = (value: string): string => value.toLowerCase();

/** True when a budget for one user ended before the day the data was collected. GitHub then holds the user to a broader limit. */
export function budgetEnded(budget: GitHubBudget, day: string): boolean {
  if (budget.expiresAt === undefined) return false;
  const ends = readDay(budget.expiresAt);
  return typeof ends === 'string' && ends < day;
}

/** The smaller of two limits, because the smaller one stops usage first. */
const smaller = (current: GitHubBudget | undefined | null, next: GitHubBudget): GitHubBudget => (current && current.amount <= next.amount ? current : next);

const cache = new WeakMap<Collection, LimitIndex>();

/** Builds, or takes from the cache, the index of the limits for users of a GitHub data file. */
export function limitIndex(collection: Collection): LimitIndex {
  const cached = cache.get(collection);
  if (cached !== undefined) return cached;
  const day = collection.header.day;
  const own = new Map<string, GitHubBudget>();
  const costCenterLimits = new Map<string, GitHubBudget>();
  let everyone: GitHubBudget | null = null;
  const budgetsById = new Map<string, GitHubBudget>();
  for (const budget of collection.budgets) {
    if (!budget.copilot || budget.amount < 0) continue;
    const kind = limitKindOf(budget);
    if (kind === null) continue;
    budgetsById.set(budget.id, budget);
    if (kind === 'own') {
      const login = budget.user ?? budget.entity;
      if (login !== '' && !budgetEnded(budget, day)) own.set(lower(login), smaller(own.get(lower(login)), budget));
    } else if (kind === 'cost-center') {
      if (budget.entity !== '') costCenterLimits.set(lower(budget.entity), smaller(costCenterLimits.get(lower(budget.entity)), budget));
    } else everyone = smaller(everyone, budget);
  }

  const states = new Map<string, Map<string, BudgetUserState>>();
  const listed = new Map<string, string>();
  for (const state of collection.budgetUsers) {
    let users = states.get(state.budgetId);
    if (users === undefined) {
      users = new Map();
      states.set(state.budgetId, users);
    }
    users.set(lower(state.login), state);
    const budget = budgetsById.get(state.budgetId);
    if (budget !== undefined && budget.scope === 'multi_user_cost_center' && !listed.has(lower(state.login))) listed.set(lower(state.login), budget.entity);
  }

  const byUser = new Map<string, string>();
  const byTeam = new Map<string, string>();
  const byOrganization = new Map<string, string>();
  for (const costCenter of collection.costCenters) {
    for (const login of costCenter.users) if (!byUser.has(lower(login))) byUser.set(lower(login), costCenter.name);
    for (const team of costCenter.teams) if (!byTeam.has(lower(team))) byTeam.set(lower(team), costCenter.name);
    for (const organization of costCenter.organizations) if (!byOrganization.has(lower(organization))) byOrganization.set(lower(organization), costCenter.name);
  }

  const seatOrganizations = new Map<string, string[]>();
  if (byOrganization.size > 0) {
    for (const seat of collection.seats) {
      const record = seat as { assignee?: { login?: unknown }; organization?: { login?: unknown } };
      const login = record.assignee?.login;
      const organization = record.organization?.login;
      if (typeof login !== 'string' || typeof organization !== 'string') continue;
      const list = seatOrganizations.get(lower(login));
      if (list === undefined) seatOrganizations.set(lower(login), [organization]);
      else if (!list.includes(organization)) list.push(organization);
    }
  }

  const index: LimitIndex = { day, own, costCenterLimits, everyone, states, listed, byUser, byTeam, byOrganization, seatOrganizations };
  cache.set(collection, index);
  return index;
}

/** The one cost center that a list of names points to, or null when it points to none or to more than one. */
function onlyCostCenter(names: readonly string[], lookup: Map<string, string>): { name: string; through: string } | null {
  let found: { name: string; through: string } | null = null;
  for (const name of names) {
    const costCenter = lookup.get(lower(name));
    if (costCenter === undefined) continue;
    if (found !== null && lower(found.name) !== lower(costCenter)) return null;
    found ??= { name: costCenter, through: name };
  }
  return found;
}

/**
 * The cost center of a user, the way GitHub assigns AI credit usage: the user's own assignment first, then an
 * enterprise team, then the organization that gave the seat. GitHub's list of a limit's users comes before all of
 * them, and the cost center of the usage report comes last. A user who is in teams or organizations of different
 * cost centers is left to the report, because the file does not say which one GitHub picked.
 */
export function costCenterOf(collection: Collection, index: LimitIndex, login: string, reportCostCenter?: string): UserCostCenter | null {
  const key = lower(login);
  const listed = index.listed.get(key);
  if (listed !== undefined) return { name: listed, source: 'budget' };
  const direct = index.byUser.get(key);
  if (direct !== undefined) return { name: direct, source: 'user' };
  const slugs = collection.userTeams[key] ?? [];
  if (slugs.length > 0 && index.byTeam.size > 0) {
    const names = slugs.flatMap((slug) => (collection.teams[slug] !== undefined ? [slug, collection.teams[slug]] : [slug]));
    const team = onlyCostCenter(names, index.byTeam);
    if (team !== null) return { name: team.name, source: 'team', through: collection.teams[team.through] ?? team.through };
  }
  const organizations = index.seatOrganizations.get(key) ?? [];
  const organization = onlyCostCenter(organizations, index.byOrganization);
  if (organization !== null) return { name: organization.name, source: 'organization', through: organization.through };
  if (reportCostCenter !== undefined && reportCostCenter !== '') return { name: reportCostCenter, source: 'report' };
  return null;
}

/**
 * The limit GitHub holds a user to, or null when no limit for users applies. A budget for the user comes first.
 * Then GitHub's own lists: a user listed under the limit of a cost center, or under the limit for each user, is held
 * to that one. Last, the user's cost center decides: its limit if it has one, or else the limit for each user.
 */
export function resolveUserLimit(collection: Collection, index: LimitIndex, login: string, reportCostCenter?: string): UserLimit | null {
  const key = lower(login);
  const stateOf = (budget: GitHubBudget): BudgetUserState | undefined => index.states.get(budget.id)?.get(key);
  const amountFor = (budget: GitHubBudget): number => {
    const state = stateOf(budget);
    return state !== undefined && state.limit > 0 ? state.limit : budget.amount;
  };
  const listedUnderEveryone = index.everyone !== null && stateOf(index.everyone) !== undefined;
  const costCenter = costCenterOf(collection, index, login, reportCostCenter);
  const costCenterLimit = costCenter !== null && !(listedUnderEveryone && costCenter.source !== 'budget') ? (index.costCenterLimits.get(lower(costCenter.name)) ?? null) : null;

  const candidates: { kind: UserLimitKind; budget: GitHubBudget }[] = [];
  const ownBudget = index.own.get(key);
  if (ownBudget !== undefined) candidates.push({ kind: 'own', budget: ownBudget });
  if (costCenterLimit !== null) candidates.push({ kind: 'cost-center', budget: costCenterLimit });
  if (index.everyone !== null) candidates.push({ kind: 'everyone', budget: index.everyone });
  const [held, ...broader] = candidates;
  if (held === undefined) return null;

  const githubUsed = held.kind === 'own' ? held.budget.consumed : (stateOf(held.budget)?.consumed ?? null);
  return {
    login,
    kind: held.kind,
    budget: held.budget,
    amount: amountFor(held.budget),
    githubUsed,
    costCenter,
    replaces: broader.map((limit) => ({ kind: limit.kind, budget: limit.budget, amount: amountFor(limit.budget) })),
  };
}

/** One user that GitHub listed against a limit for users, with the amount used. */
export interface HeldUser {
  login: string;
  kind: UserLimitKind;
  budgetId: string;
  consumed: number;
  limit: number;
}

/**
 * Every user that GitHub shows with an amount used against a limit for users, held to the most specific limit only:
 * a budget of their own, then the limit of their cost center, then the limit for each user. Budgets for one user that
 * ended before the data was collected are left out, because GitHub then holds the user to a broader limit.
 */
export function heldUsers(collection: Collection): HeldUser[] {
  const day = collection.header.day;
  const budgets = new Map(collection.budgets.map((budget) => [budget.id, budget]));
  const rank = (kind: UserLimitKind): number => USER_LIMIT_KINDS.indexOf(kind);
  const byLogin = new Map<string, HeldUser | null>();
  const keep = (entry: HeldUser | null, login: string): void => {
    const key = lower(login);
    if (!byLogin.has(key)) {
      byLogin.set(key, entry);
      return;
    }
    const had = byLogin.get(key);
    // A budget of the user's own with no amount from GitHub still decides the limit: the user is then left out.
    if (had === null || had === undefined) return;
    if (entry === null) {
      if (had.kind !== 'own') byLogin.set(key, null);
      return;
    }
    const closer = rank(entry.kind) - rank(had.kind);
    if (closer < 0 || (closer === 0 && entry.consumed / entry.limit > had.consumed / had.limit)) byLogin.set(key, entry);
  };
  for (const budget of collection.budgets) {
    const login = budget.user ?? budget.entity;
    if (budget.scope !== 'user' || !budget.copilot || login === '' || budget.amount <= 0 || budgetEnded(budget, day)) continue;
    keep(budget.consumed === null ? null : { login, kind: 'own', budgetId: budget.id, consumed: budget.consumed, limit: budget.amount }, login);
  }
  for (const state of collection.budgetUsers) {
    const budget = budgets.get(state.budgetId);
    if ((budget !== undefined && !budget.copilot) || state.login === '' || state.limit <= 0) continue;
    const kind = budget !== undefined ? (limitKindOf(budget) ?? 'everyone') : 'everyone';
    keep({ login: state.login, kind, budgetId: state.budgetId, consumed: state.consumed, limit: state.limit }, state.login);
  }
  return [...byLogin.values()].filter((entry): entry is HeldUser => entry !== null && entry !== undefined);
}
