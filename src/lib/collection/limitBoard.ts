import type { DataStore } from '../types';
import { BLANK } from '../types';
import { daysInMonth, monthEndDay, monthStartDay } from '../utils/date';
import type { BudgetMap } from './budgetMap';
import { budgetLevel, collectionMonth, type BudgetLevel, type BudgetRow } from './budgets';
import { limitIndex, resolveUserLimit, type UserLimitKind } from './limits';
import type { Collection, GitHubBudget } from './types';

/**
 * Every GitHub Copilot limit on one map, for the limit map of the Budgets page. At the top are the places with spending
 * limits on the amount billed: the enterprise (or the organization of an organization file), then cost centers,
 * organizations and repositories. Below, every user is in the group of the one limit that holds them: their own
 * budget, the limit for each user of their cost center, the limit for each user of the enterprise, or no limit. Each
 * user also knows the places whose spending limits count their usage, so the map can show the path GitHub checks.
 */

export type PlaceScope = 'enterprise' | 'organization' | 'cost_center' | 'repository';

/** A place with spending limits on the amount billed: the top, a cost center, an organization or a repository. */
export interface LimitPlace {
  scope: PlaceScope;
  name: string;
  /** The enterprise, or the organization of an organization file. */
  top: boolean;
  /** Spending limits on the amount billed, smallest first. */
  limits: BudgetRow[];
  /** The limit with the largest share used. */
  gauge: BudgetRow;
  /** Seats of an organization. Null when GitHub did not say, and for other scopes. */
  seats: number | null;
  /** The group of the users held to the limit for each user of the same cost center, else -1. */
  group: number;
}

/** The users held to one limit. */
export interface LimitGroup {
  kind: UserLimitKind | 'none';
  /** The cost center of a cost center group, else ''. */
  name: string;
  /** The limit for each user of the group: the cost center's or the enterprise's. Null for own budgets and no limit. */
  perUser: GitHubBudget | null;
  /** The cost center may use only the included credits of its own members. */
  poolCapped: boolean;
  /** The place of the cost center, when it has spending limits too, else -1. */
  place: number;
  /** Its users, the fullest first. */
  members: number[];
  usedUp: number;
}

export interface LimitUser {
  login: string;
  kind: UserLimitKind | 'none';
  group: number;
  costCenter: string | null;
  organization: string | null;
  /** The amount of the limit (USD). Null when no limit holds the user. */
  limit: number | null;
  /** The amount used this month: what GitHub showed, or else the usage in the report. */
  used: number;
  usedFrom: 'github' | 'report';
  share: number | null;
  level: BudgetLevel | null;
  /** Places under the top whose spending limits count usage of this user: their cost center, organizations and repositories. */
  places: number[];
}

export interface LimitBoard {
  topName: string;
  topScope: 'enterprise' | 'organization';
  /** The place of the enterprise or organization, else -1 when it has no spending limit. */
  top: number;
  /** The top first, then cost centers, organizations and repositories as the budget map orders them. Only places with spending limits. */
  places: LimitPlace[];
  /** Own budgets, then cost centers A to Z, then the limit for each user, then no limit: the order GitHub checks. */
  groups: LimitGroup[];
  users: LimitUser[];
  /** The limit for each user of the enterprise or organization. Null when none is set. */
  everyone: GitHubBudget | null;
  /** Cost centers with no limit of their own. */
  costCentersWithoutLimit: number;
  /** The month of the data. `lastDay` is the last day with report rows, up to the day of collection, or 0. */
  month: { label: string; days: number; lastDay: number; collectedDay: number };
  /** Usage of each user in the report added up day by day: user × lastDay values, day 1 first. */
  cumulative: Float32Array;
  held: BudgetMap['held'];
}

/** The row with the largest share used, the smallest amount first on a tie. */
function gaugeOf(limits: BudgetRow[]): BudgetRow | null {
  let best: BudgetRow | null = null;
  for (const row of limits) if (best === null || (row.share ?? -1) > (best.share ?? -1)) best = row;
  return best;
}

interface MonthEntry {
  login: string;
  daily: Float64Array;
  /** The latest cost center and organization in the report. */
  costCenter: string | undefined;
  organization: string | undefined;
  /** Every organization and repository with usage of the user this month, in lower case. */
  organizations: Set<string>;
  repositories: Set<string>;
}

interface MonthRows {
  lastDay: number;
  byLogin: Map<string, MonthEntry>;
}

/** The usage of each user per day in the month of the data, up to the day of collection. */
function monthRows(collection: Collection, store: DataStore): MonthRows {
  const monthIndex = collectionMonth(collection);
  const start = monthStartDay(monthIndex);
  const collectedDay = Number(collection.header.day.slice(8, 10));
  const end = Math.min(monthEndDay(monthIndex), start + collectedDay - 1);
  const covered = store.n > 0 && store.maxDay >= start && store.minDay <= end;
  const lastDay = covered ? Math.max(1, Math.min(end, store.maxDay) - start + 1) : 0;
  const users = store.dicts.user.values;
  const keyOf = users.map((login) => (login === BLANK ? '' : login.toLowerCase()));
  const byLogin = new Map<string, MonthEntry>();
  const latest = new Map<string, number>();
  for (let i = 0; i < store.n; i++) {
    const day = store.day[i];
    if (day < start || day > end) continue;
    const key = keyOf[store.user[i]];
    if (key === '') continue;
    let entry = byLogin.get(key);
    if (entry === undefined) {
      entry = {
        login: users[store.user[i]],
        daily: new Float64Array(lastDay),
        costCenter: undefined,
        organization: undefined,
        organizations: new Set<string>(),
        repositories: new Set<string>(),
      };
      byLogin.set(key, entry);
    }
    entry.daily[day - start] += store.gross[i];
    const organization = store.dicts.org.values[store.org[i]];
    const repository = store.dicts.repo.values[store.repo[i]];
    if (organization !== undefined && organization !== BLANK) entry.organizations.add(organization.toLowerCase());
    if (repository !== undefined && repository !== BLANK) entry.repositories.add(repository.toLowerCase());
    if (day >= (latest.get(key) ?? -1)) {
      const costCenter = store.dicts.costCenter.values[store.costCenter[i]];
      if (costCenter !== undefined && costCenter !== BLANK) entry.costCenter = costCenter;
      if (organization !== undefined && organization !== BLANK) entry.organization = organization;
      latest.set(key, day);
    }
  }
  return { lastDay, byLogin };
}

/** The organizations of each user's seats, by login in lower case. */
function seatOrganizationsOf(collection: Collection): Map<string, string[]> {
  const byLogin = new Map<string, string[]>();
  for (const seat of collection.seats) {
    const record = seat as { assignee?: { login?: unknown }; organization?: { login?: unknown } };
    const login = record.assignee?.login;
    const organization = record.organization?.login;
    if (typeof login !== 'string' || typeof organization !== 'string' || organization === '') continue;
    const key = login.toLowerCase();
    const list = byLogin.get(key) ?? [];
    if (!list.includes(organization)) list.push(organization);
    byLogin.set(key, list);
  }
  return byLogin;
}

/** Seats of each organization, by name in lower case: what GitHub reported, else the seats in the file. */
function seatCountsOf(collection: Collection, seatOrganizations: Map<string, string[]>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const organizations of seatOrganizations.values()) for (const name of organizations) counts.set(name.toLowerCase(), (counts.get(name.toLowerCase()) ?? 0) + 1);
  for (const summary of collection.seatSummaries) if (summary.total !== null) counts.set(summary.org.toLowerCase(), summary.total);
  return counts;
}

/** The fullest first, then the largest amount used, then A to Z. */
const byShare = (users: LimitUser[]) => (a: number, b: number): number =>
  (users[b].share ?? -1) - (users[a].share ?? -1) || users[b].used - users[a].used || users[a].login.localeCompare(users[b].login);

/** Builds the limit map for the month of the data. The filters of the report do not change it. */
export function limitBoard(collection: Collection, store: DataStore, map: BudgetMap): LimitBoard {
  const index = limitIndex(collection);
  const seatOrganizations = seatOrganizationsOf(collection);
  const seatCounts = seatCountsOf(collection, seatOrganizations);
  const month = monthRows(collection, store);
  const monthIndex = collectionMonth(collection);
  const collectedDay = Number(collection.header.day.slice(8, 10));

  // Every user who used something this month or whom GitHub listed against a limit, as in the budget map.
  const logins = new Map<string, string>();
  for (const [key, entry] of month.byLogin) logins.set(key, entry.login);
  for (const state of collection.budgetUsers) if (!logins.has(state.login.toLowerCase())) logins.set(state.login.toLowerCase(), state.login);
  for (const [key, budget] of index.own) if (!logins.has(key)) logins.set(key, budget.user ?? budget.entity);

  // The places: the top first, then cost centers, organizations and repositories as the map orders them.
  const places: LimitPlace[] = [];
  const topGauge = gaugeOf(map.top.limits);
  if (topGauge !== null) {
    const seats = map.top.scope === 'organization' ? (seatCounts.get(map.top.name.toLowerCase()) ?? null) : null;
    places.push({ scope: map.top.scope, name: map.top.name, top: true, limits: map.top.limits, gauge: topGauge, seats, group: -1 });
  }
  for (const room of map.rooms) {
    const gauge = gaugeOf(room.limits);
    if (gauge === null) continue;
    const seats = room.scope === 'organization' ? (seatCounts.get(room.name.toLowerCase()) ?? null) : null;
    places.push({ scope: room.scope, name: room.name, top: false, limits: room.limits, gauge, seats, group: -1 });
  }
  const placeOf = new Map<string, number>();
  places.forEach((place, placeIndex) => {
    if (place.top) return;
    const name = place.name.toLowerCase();
    placeOf.set(`${place.scope}|${name}`, placeIndex);
    // A repository budget can name "org/app"; the report can name the repository "app".
    if (place.scope === 'repository' && name.includes('/')) placeOf.set(`repository|${name.slice(name.indexOf('/') + 1)}`, placeIndex);
  });

  const users: LimitUser[] = [];
  const dailyOf: Float64Array[] = [];
  const held: BudgetMap['held'] = { own: 0, 'cost-center': 0, everyone: 0, none: 0 };
  /** The cost center of each user held to a cost center limit, and that limit. */
  const costCenterOf = new Map<number, { name: string; perUser: GitHubBudget }>();
  for (const [key, login] of logins) {
    const report = month.byLogin.get(key);
    const limit = resolveUserLimit(collection, index, login, report?.costCenter);
    const reportUsed = report === undefined ? 0 : report.daily.reduce((total, amount) => total + amount, 0);
    const used = limit?.githubUsed ?? reportUsed;
    const share = limit !== null && limit.amount > 0 ? used / limit.amount : null;
    const kind = limit?.kind ?? 'none';
    const costCenter = limit?.costCenter?.name ?? report?.costCenter ?? null;
    held[kind]++;
    if (kind === 'cost-center' && limit !== null) costCenterOf.set(users.length, { name: limit.budget.entity, perUser: limit.budget });

    const userPlaces = new Set<number>();
    const addPlace = (scope: PlaceScope, name: string) => {
      const found = placeOf.get(`${scope}|${name.toLowerCase()}`);
      if (found !== undefined) userPlaces.add(found);
    };
    if (costCenter !== null) addPlace('cost_center', costCenter);
    for (const organization of seatOrganizations.get(key) ?? []) addPlace('organization', organization);
    for (const organization of report?.organizations ?? []) addPlace('organization', organization);
    for (const repository of report?.repositories ?? []) addPlace('repository', repository);

    users.push({
      login,
      kind,
      group: -1,
      costCenter,
      organization: seatOrganizations.get(key)?.[0] ?? report?.organization ?? null,
      limit: limit?.amount ?? null,
      used,
      usedFrom: limit !== null && limit.githubUsed !== null ? 'github' : 'report',
      share,
      level: share === null ? null : budgetLevel(share),
      places: [...userPlaces].sort((a, b) => a - b),
    });
    dailyOf.push(report?.daily ?? new Float64Array(month.lastDay));
  }

  // The groups, in the order GitHub checks the limits of a user: own budget, cost center, limit for each user, none.
  const groups: LimitGroup[] = [];
  const newGroup = (kind: LimitGroup['kind'], name: string, perUser: GitHubBudget | null, poolCapped = false): LimitGroup => ({ kind, name, perUser, poolCapped, place: -1, members: [], usedUp: 0 });
  if (held.own > 0) groups.push(newGroup('own', '', null));
  const costCenterGroups = new Map<string, LimitGroup>();
  for (const room of map.rooms) {
    if (room.scope !== 'cost_center' || room.perUser === null) continue;
    costCenterGroups.set(room.name.toLowerCase(), newGroup('cost-center', room.name, room.perUser.budget, room.poolCapped));
  }
  // A cost center limit GitHub applies but the map left out still gets a group, so every user has a place.
  for (const found of costCenterOf.values()) {
    if (!costCenterGroups.has(found.name.toLowerCase())) costCenterGroups.set(found.name.toLowerCase(), newGroup('cost-center', found.name, found.perUser));
  }
  groups.push(...[...costCenterGroups.values()].sort((a, b) => a.name.localeCompare(b.name)));
  if (map.everyone !== null || held.everyone > 0) groups.push(newGroup('everyone', '', map.everyone?.budget ?? null));
  if (held.none > 0) groups.push(newGroup('none', '', null));

  const groupOfKind = new Map(groups.filter((group) => group.kind !== 'cost-center').map((group) => [group.kind, groups.indexOf(group)]));
  const groupOfCostCenter = new Map(groups.flatMap((group, groupIndex) => (group.kind === 'cost-center' ? [[group.name.toLowerCase(), groupIndex] as const] : [])));
  users.forEach((user, userIndex) => {
    const costCenter = costCenterOf.get(userIndex);
    user.group = costCenter !== undefined ? (groupOfCostCenter.get(costCenter.name.toLowerCase()) ?? -1) : (groupOfKind.get(user.kind) ?? -1);
    groups[user.group]?.members.push(userIndex);
  });
  const fullestFirst = byShare(users);
  for (const group of groups) {
    group.members.sort(fullestFirst);
    group.usedUp = group.members.filter((userIndex) => users[userIndex].level === 'used-up').length;
  }

  // A cost center with a limit for each user and spending limits of its own: the group and the place point at each other.
  places.forEach((place, placeIndex) => {
    if (place.scope !== 'cost_center') return;
    const groupIndex = groupOfCostCenter.get(place.name.toLowerCase());
    if (groupIndex === undefined) return;
    place.group = groupIndex;
    groups[groupIndex].place = placeIndex;
  });

  const cumulative = new Float32Array(users.length * month.lastDay);
  dailyOf.forEach((daily, userIndex) => {
    let total = 0;
    for (let day = 0; day < month.lastDay; day++) cumulative[userIndex * month.lastDay + day] = total += daily[day] ?? 0;
  });

  return {
    topName: map.top.name,
    topScope: map.top.scope,
    top: places.findIndex((place) => place.top),
    places,
    groups,
    users,
    everyone: map.everyone?.budget ?? null,
    costCentersWithoutLimit: map.roomsWithoutLimit,
    month: { label: collection.header.day.slice(0, 7), days: daysInMonth(monthIndex), lastDay: month.lastDay, collectedDay },
    cumulative,
    held,
  };
}

/** The amount a user had used by the end of a day of the month (1 = day 1), from the report. Null for now. */
export function usedOnDay(board: LimitBoard, userIndex: number, day: number | null): number {
  if (day === null || board.month.lastDay === 0) return board.users[userIndex].used;
  return board.cumulative[userIndex * board.month.lastDay + Math.max(0, Math.min(board.month.lastDay, day) - 1)];
}

/** The share of the limit a user had used by the end of a day of the month (1 = day 1), from the report. */
export function shareOnDay(board: LimitBoard, userIndex: number, day: number): number | null {
  const user = board.users[userIndex];
  if (user.limit === null || user.limit <= 0 || board.month.lastDay === 0) return null;
  return usedOnDay(board, userIndex, day) / user.limit;
}

/** What is selected on the map. */
export type LimitTarget = { kind: 'all' } | { kind: 'place' | 'group' | 'user'; index: number };

/** What a selection holds and what holds it. Everything else on the map is dimmed. */
export interface LimitFocus {
  places: Set<number>;
  groups: Set<number>;
  users: Set<number>;
}

/**
 * The parts of the map that belong to a selection. A user brings their group and every place whose spending limits
 * count their usage. A group brings its users, the place of its cost center and every place that counts its users. A
 * it counts and their groups. Null for the whole picture and the top, which count everyone.
 */
export function limitFocus(board: LimitBoard, target: LimitTarget): LimitFocus | null {
  const withTop = (places: Iterable<number>): Set<number> => new Set([...places, ...(board.top >= 0 ? [board.top] : [])]);
  if (target.kind === 'user') {
    const user = board.users[target.index];
    if (user === undefined) return null;
    return { places: withTop(user.places), groups: new Set([user.group]), users: new Set([target.index]) };
  }
  if (target.kind === 'group') {
    const group = board.groups[target.index];
    if (group === undefined) return null;
    const places = new Set(group.place >= 0 ? [group.place] : []);
    for (const userIndex of group.members) for (const placeIndex of board.users[userIndex].places) places.add(placeIndex);
    return { places: withTop(places), groups: new Set([target.index]), users: new Set(group.members) };
  }
  if (target.kind === 'place') {
    const place = board.places[target.index];
    if (place === undefined || place.top) return null;
    const users = new Set<number>();
    board.users.forEach((user, userIndex) => {
      if (user.places.includes(target.index)) users.add(userIndex);
    });
    const groups = new Set([...users].map((userIndex) => board.users[userIndex].group));
    if (place.group >= 0) groups.add(place.group);
    return { places: withTop([target.index]), groups, users };
  }
  return null;
}
