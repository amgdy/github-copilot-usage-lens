import type { DataStore } from '../types';
import { BLANK } from '../types';
import { daysInMonth, monthEndDay, monthStartDay } from '../utils/date';
import type { BudgetMap } from './budgetMap';
import { budgetLevel, collectionMonth, type BudgetLevel, type BudgetRow } from './budgets';
import { sourceComplete } from './derive';
import { costCenterOf, limitIndex, resolveUserLimit, type ReplacedLimit, type UserLimitKind } from './limits';
import type { Collection, GitHubBudget } from './types';

/**
 * The limit map. The enterprise (or organization) limit is the frame around all spending. Inside it, each user sits in
 * one lane: the spending limit GitHub checks for their billed usage. Each user also has one user limit of their own.
 */

/** A cost center, an organization, only the top limit, or a spending limit the file cannot settle. */
export type LaneKind = 'cost_center' | 'organization' | 'top' | 'unclear';

/** Which limit a lane reaches first: its own spending limit or the top limit. */
export type ReachedFirst = 'own' | 'top' | null;

/** The default user limit of the people in a lane who have no individual limit. */
export interface LaneDefault {
  kind: 'cost-center' | 'everyone';
  budget: GitHubBudget;
}

/** The users whose billed usage checks the same spending limit. */
export interface LimitLane {
  kind: LaneKind;
  /** The cost center or organization, else ''. */
  name: string;
  /** Its own spending limits on the amount billed, smallest first. Empty when it has none. */
  limits: BudgetRow[];
  /** Its limit reached first: the least room left, else the smallest. Null without limits of its own. */
  gauge: BudgetRow | null;
  /** The smallest of its own limits: the most it can be billed. Null without limits of its own. */
  capacity: number | null;
  /** Amount left before a spending limit is reached: its own or the top's, the smaller one. Null when not known. */
  room: number | null;
  reachedFirst: ReachedFirst;
  /**
   * The top limit counts the billed usage of this lane. False for a cost center in an organization file: GitHub bills
   * its members to the cost center of the enterprise, so the organization limit does not count them.
   */
  countedByTop: boolean;
  perUser: LaneDefault | null;
  /** The cost center may use only the included credits of its own members. */
  poolCapped: boolean;
  /** Seats of an organization. Null when GitHub did not say, and for other lanes. */
  seats: number | null;
  /** Its users, the fullest first. */
  members: number[];
  usedUp: number;
}

/** The enterprise, or the organization of an organization file: the frame around all other limits. */
export interface LimitTop {
  scope: 'enterprise' | 'organization';
  name: string;
  /** Spending limits on the amount billed, smallest first. */
  limits: BudgetRow[];
  /** The limit reached first. Null when there is no top limit. */
  wall: BudgetRow | null;
  room: number | null;
  /** The smallest top limit: the most all users together can be billed. */
  capacity: number | null;
  /** The capacity of every lane it counts with a limit of its own, added up. */
  inside: number;
  /** Inside ÷ capacity. Null without a top limit. */
  insideShare: number | null;
  /** The budgets were read in full, so a missing top limit means none is set. */
  known: boolean;
}

export interface LimitUser {
  login: string;
  kind: UserLimitKind | 'none';
  lane: number;
  costCenter: string | null;
  /** The organizations of the user's seats. */
  organizations: string[];
  /** The amount of the limit (USD). Null when no limit holds the user. */
  limit: number | null;
  /** The amount used this month: what GitHub showed, or else the usage in the report. */
  used: number;
  usedFrom: 'github' | 'report';
  share: number | null;
  level: BudgetLevel | null;
  /** Broader per-user limits replaced by the effective limit, not shared spending budgets. */
  replaces: ReplacedLimit[];
  /** Independent of whether the user has an individual limit. */
  poolCapped: boolean;
}

export interface LimitBoard {
  top: LimitTop;
  /**
   * Cost centers, then organizations with a spending limit, then only the top limit, then not clear. Lanes the top
   * limit does not count come last. Repository budgets stay in the budget table.
   */
  lanes: LimitLane[];
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

/** Amount left before a spending limit is reached. Null when GitHub gave no amount used. */
export const roomOf = (row: BudgetRow): number | null => (row.budget.consumed === null ? null : row.budget.amount - row.budget.consumed);

/** The limit reached first: the least room left, the smaller amount on a tie. Without amounts used, the smallest. */
function bindingOf(limits: BudgetRow[]): BudgetRow | null {
  let best: BudgetRow | null = null;
  let bestRoom = Number.POSITIVE_INFINITY;
  for (const row of limits) {
    const room = roomOf(row);
    if (room === null) continue;
    if (best === null || room < bestRoom || (room === bestRoom && row.budget.amount < best.budget.amount)) {
      best = row;
      bestRoom = room;
    }
  }
  return best ?? limits.reduce<BudgetRow | null>((smallest, row) => (smallest === null || row.budget.amount < smallest.budget.amount ? row : smallest), null);
}

/** The lowest room left wins: a lane stops at its own limit or at the top limit, whichever has less room. */
function laneRoom(own: BudgetRow | null, topRoom: number | null): { room: number | null; reachedFirst: ReachedFirst } {
  if (own !== null) {
    const ownRoom = roomOf(own);
    if (ownRoom === null) return { room: null, reachedFirst: null };
    return topRoom !== null && topRoom < ownRoom ? { room: topRoom, reachedFirst: 'top' } : { room: ownRoom, reachedFirst: 'own' };
  }
  return topRoom !== null ? { room: topRoom, reachedFirst: 'top' } : { room: null, reachedFirst: null };
}

interface MonthEntry {
  login: string;
  daily: Float64Array;
  /** The latest cost center in the report. */
  costCenter: string | undefined;
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
      };
      byLogin.set(key, entry);
    }
    entry.daily[day - start] += store.gross[i];
    if (day >= (latest.get(key) ?? -1)) {
      const costCenter = store.dicts.costCenter.values[store.costCenter[i]];
      if (costCenter !== undefined && costCenter !== BLANK) entry.costCenter = costCenter;
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

const LANE_RANK: Record<LaneKind, number> = { cost_center: 0, organization: 1, top: 2, unclear: 3 };

/** Builds the limit map for the month of the data. The filters of the report do not change it. */
export function limitBoard(collection: Collection, store: DataStore, map: BudgetMap): LimitBoard {
  const index = limitIndex(collection);
  const seatOrganizations = seatOrganizationsOf(collection);
  const seatCounts = seatCountsOf(collection, seatOrganizations);
  const month = monthRows(collection, store);
  const monthIndex = collectionMonth(collection);
  const collectedDay = Number(collection.header.day.slice(8, 10));
  const enterprise = map.top.scope === 'enterprise';

  // Every user who used something this month or whom GitHub listed against a limit, as in the budget map.
  const logins = new Map<string, string>();
  for (const [key, entry] of month.byLogin) logins.set(key, entry.login);
  for (const state of collection.budgetUsers) if (!logins.has(state.login.toLowerCase())) logins.set(state.login.toLowerCase(), state.login);
  for (const [key, budget] of index.own) if (!logins.has(key)) logins.set(key, budget.user ?? budget.entity);

  const wall = bindingOf(map.top.limits);
  const topRoom = wall === null ? null : roomOf(wall);
  const everyoneDefault: LaneDefault | null = map.everyone !== null ? { kind: 'everyone', budget: map.everyone.budget } : null;
  const cappedCenters = new Set(collection.costCenters.filter((center) => center.poolCapped).map((center) => center.name.toLowerCase()));
  const roomsByKey = new Map(map.rooms.map((room) => [`${room.scope}|${room.name.toLowerCase()}`, room]));

  const laneByKey = new Map<string, LimitLane>();
  const laneOf = (key: string, kind: LaneKind, name: string, limits: BudgetRow[], perUser: LaneDefault | null, poolCapped: boolean, seats: number | null, countedByTop = true): LimitLane => {
    let lane = laneByKey.get(key);
    if (lane === undefined) {
      const gauge = bindingOf(limits);
      const room = kind === 'unclear' ? { room: null, reachedFirst: null } : laneRoom(gauge, countedByTop ? topRoom : null);
      // Limits are sorted smallest first, so the first one is the most the lane can be billed.
      lane = { kind, name, limits, gauge, capacity: limits[0]?.budget.amount ?? null, ...room, countedByTop, perUser, poolCapped, seats, members: [], usedUp: 0 };
      laneByKey.set(key, lane);
    }
    return lane;
  };
  const costCenterLane = (name: string): LimitLane => {
    const key = `cost_center|${name.toLowerCase()}`;
    const room = roomsByKey.get(key);
    const perUser: LaneDefault | null = room?.perUser ? { kind: 'cost-center', budget: room.perUser.budget } : everyoneDefault;
    return laneOf(key, 'cost_center', room?.name ?? name, room?.limits ?? [], perUser, room?.poolCapped || cappedCenters.has(name.toLowerCase()), null, enterprise);
  };
  const organizationLane = (name: string): LimitLane => {
    const key = `organization|${name.toLowerCase()}`;
    const room = roomsByKey.get(key);
    return laneOf(key, 'organization', room?.name ?? name, room?.limits ?? [], everyoneDefault, false, seatCounts.get(name.toLowerCase()) ?? null);
  };
  const topLane = () => laneOf('top', 'top', '', [], everyoneDefault, false, null);
  const unclearLane = () => laneOf('unclear', 'unclear', '', [], everyoneDefault, false, null);

  // Every spending limit inside the frame gets a lane, even with no users this month.
  const organizationsWithLimit = new Set<string>();
  if (enterprise) {
    for (const room of map.rooms) {
      if (room.limits.length === 0) continue;
      if (room.scope === 'cost_center') costCenterLane(room.name);
      if (room.scope === 'organization') {
        organizationLane(room.name);
        organizationsWithLimit.add(room.name.toLowerCase());
      }
    }
  }

  const users: LimitUser[] = [];
  const lanesOfUsers: LimitLane[] = [];
  const dailyOf: Float64Array[] = [];
  const held: BudgetMap['held'] = { own: 0, 'cost-center': 0, everyone: 0, none: 0 };
  for (const [key, login] of logins) {
    const report = month.byLogin.get(key);
    const limit = resolveUserLimit(collection, index, login, report?.costCenter);
    const reportUsed = report === undefined ? 0 : report.daily.reduce((total, amount) => total + amount, 0);
    const used = limit?.githubUsed ?? reportUsed;
    const share = limit !== null && limit.amount > 0 ? used / limit.amount : null;
    const kind = limit?.kind ?? 'none';
    const organizations = seatOrganizations.get(key) ?? [];
    const costCenter = costCenterOf(collection, index, login, report?.costCenter)?.name ?? null;
    held[kind]++;

    // GitHub checks the cost center's spending limit, else the seat organization's, else only the top limit. With
    // seats in several organizations, GitHub picks one each billing cycle, so the file cannot say which. Cost centers
    // belong to the enterprise: in an organization file, their members sit outside the organization limit.
    let lane: LimitLane;
    if (costCenter !== null) lane = costCenterLane(costCenter);
    else if (!enterprise) lane = topLane();
    else {
      const withLimit = organizations.filter((name) => organizationsWithLimit.has(name.toLowerCase()));
      if (organizationsWithLimit.size === 0 || (organizations.length > 0 && withLimit.length === 0)) lane = topLane();
      else if (organizations.length === 1) lane = organizationLane(organizations[0]);
      else lane = unclearLane();
    }
    lanesOfUsers.push(lane);

    users.push({
      login,
      kind,
      lane: -1,
      costCenter,
      organizations,
      limit: limit?.amount ?? null,
      used,
      usedFrom: limit !== null && limit.githubUsed !== null ? 'github' : 'report',
      share,
      level: limit?.amount === 0 ? 'used-up' : share === null ? null : budgetLevel(share),
      replaces: limit?.replaces ?? [],
      poolCapped: costCenter !== null && cappedCenters.has(costCenter.toLowerCase()),
    });
    dailyOf.push(report?.daily ?? new Float64Array(month.lastDay));
  }

  const fullness = (lane: LimitLane): number => lane.gauge?.share ?? -1;
  const lanes = [...laneByKey.values()].sort(
    (a, b) =>
      Number(b.countedByTop) - Number(a.countedByTop) ||
      LANE_RANK[a.kind] - LANE_RANK[b.kind] ||
      b.limits.length - a.limits.length ||
      fullness(b) - fullness(a) ||
      a.name.localeCompare(b.name),
  );
  const laneIndex = new Map(lanes.map((lane, position) => [lane, position]));
  users.forEach((user, userIndex) => {
    user.lane = laneIndex.get(lanesOfUsers[userIndex]) ?? -1;
    lanes[user.lane]?.members.push(userIndex);
  });
  const fullestFirst = byShare(users);
  for (const lane of lanes) {
    lane.members.sort(fullestFirst);
    lane.usedUp = lane.members.filter((userIndex) => users[userIndex].level === 'used-up').length;
  }

  const capacity = map.top.limits[0]?.budget.amount ?? null;
  const inside = lanes.reduce((total, lane) => total + (lane.countedByTop ? (lane.capacity ?? 0) : 0), 0);
  const cumulative = new Float32Array(users.length * month.lastDay);
  dailyOf.forEach((daily, userIndex) => {
    let total = 0;
    for (let day = 0; day < month.lastDay; day++) cumulative[userIndex * month.lastDay + day] = total += daily[day] ?? 0;
  });

  return {
    top: {
      scope: map.top.scope,
      name: map.top.name,
      limits: map.top.limits,
      wall,
      room: topRoom,
      capacity,
      inside,
      insideShare: capacity !== null && capacity > 0 ? inside / capacity : null,
      known: sourceComplete(collection.sources, 'budgets'),
    },
    lanes,
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

/** What is selected on the map: everything, the frame, one lane or one user. */
export type LimitTarget = { kind: 'all' | 'top' } | { kind: 'lane' | 'user'; index: number };

/** The lanes and users a selection holds. Other users are faded. */
export interface LimitFocus {
  lanes: Set<number>;
  users: Set<number>;
}

/** A user sits in one lane. A lane holds its members. The frame and the whole picture fade nobody. */
export function limitFocus(board: LimitBoard, target: LimitTarget): LimitFocus | null {
  if (target.kind === 'user') {
    const user = board.users[target.index];
    return user === undefined ? null : { lanes: new Set([user.lane]), users: new Set([target.index]) };
  }
  if (target.kind === 'lane') {
    const lane = board.lanes[target.index];
    return lane === undefined ? null : { lanes: new Set([target.index]), users: new Set(lane.members) };
  }
  return null;
}
