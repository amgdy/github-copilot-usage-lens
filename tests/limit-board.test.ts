import { describe, expect, it } from 'vitest';
import { budgetMap, limitBoard, limitFocus, shareOnDay, usedOnDay } from '../src/lib/collection';
import { buildStore } from '../src/lib/csv/ingest';
import { sampleCollection } from '../src/lib/demo/github';
import { END, budgetRecord, header, readLines, recordLine, seatRecord, sourceLine, type Line } from './collectionLines';
import { loadDemo, makeCsv, type RowSpec } from './helpers';

const storeOf = (rows: RowSpec[]) => buildStore([{ name: 'usage.csv', data: makeCsv(rows) }]);

/** A collection made on 2026-10-11 with a complete budgets source. */
const collectionOf = (lines: Line[], headerExtra: Line = {}) =>
  readLines([header({ months: ['2026-10'], startedAt: '2026-10-11T08:00:00Z', ...headerExtra }), ...lines, sourceLine('budgets', 'ok'), END]);

const budget = (id: string, extra: Line) => recordLine('budget', budgetRecord(id, extra));
const everyone = (amount: number) => budget('everyone', { budget_scope: 'multi_user_customer', budget_entity_name: '', budget_amount: amount, consumed_amount: null });
const forCostCenter = (id: string, name: string, amount: number) => budget(id, { budget_scope: 'multi_user_cost_center', budget_entity_name: name, budget_amount: amount, consumed_amount: null });
const own = (login: string, amount: number, consumed: number | null) => budget(`own-${login}`, { budget_scope: 'user', budget_entity_name: login, user: login, budget_amount: amount, consumed_amount: consumed });
const forOrganization = (name: string, amount: number, consumed: number) => budget(`org-${name}`, { budget_scope: 'organization', budget_entity_name: name, budget_amount: amount, consumed_amount: consumed });
const forRepository = (name: string, amount: number) => budget(`repo-${name}`, { budget_scope: 'repository', budget_entity_name: name, budget_amount: amount, consumed_amount: 1 });
const costCenter = (name: string, extra: Line = {}) => recordLine('cost-center', { id: `cc-${name}`, name, state: 'active', resources: [], ...extra });
const seat = (login: string, organization: string) => recordLine('seat', seatRecord(login, organization, 'business'));

/** Usage of `amount` USD a day for one user, from day `from` to day `to` of October 2026. */
function usageDays(user: string, from: number, to: number, extra: Partial<RowSpec> = {}, amount = 10): RowSpec[] {
  const rows: RowSpec[] = [];
  for (let day = from; day <= to; day++) rows.push({ date: `2026-10-${String(day).padStart(2, '0')}`, user, org: 'octo-apps', gross: amount, discount: amount, net: 0, ...extra });
  return rows;
}

describe('the limit map', () => {
  it('puts each user in the group of the limit that holds them, and lists each place with a spending limit', async () => {
    const store = await storeOf([...usageDays('mona', 1, 10), ...usageDays('hubot', 1, 2), ...usageDays('octocat', 1, 4, { costCenter: 'Mobile' })]);
    const collection = collectionOf([
      budget('ent', { budget_amount: 1000, consumed_amount: 200 }),
      budget('ent-copilot', { budget_amount: 3000, consumed_amount: 2700, budget_product_sku: 'copilot', budget_type: 'ProductPricing' }),
      forOrganization('octo-apps', 100, 90),
      budget('mobile', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 300, consumed_amount: 30 }),
      everyone(50),
      forCostCenter('mobile-limit', 'Mobile', 25),
      own('mona', 80, 100),
      costCenter('Mobile', { ai_credit_pool_enabled: true }),
    ]);
    const map = budgetMap(collection, store);
    const board = limitBoard(collection, store, map);

    expect(board.held).toEqual(map.held);
    // The order GitHub checks the limits of a user: own budget, cost center, limit for each user.
    expect(board.groups.map((group) => [group.kind, group.name, group.members.length, group.usedUp])).toEqual([
      ['own', '', 1, 1],
      ['cost-center', 'Mobile', 1, 1],
      ['everyone', '', 1, 0],
    ]);
    const byLogin = new Map(board.users.map((user) => [user.login, user]));
    expect(byLogin.get('mona')).toMatchObject({ kind: 'own', group: 0, limit: 80, used: 100, usedFrom: 'github', level: 'used-up' });
    expect(byLogin.get('octocat')).toMatchObject({ kind: 'cost-center', group: 1, costCenter: 'Mobile', limit: 25, used: 40, usedFrom: 'report', level: 'used-up' });
    expect(byLogin.get('hubot')).toMatchObject({ kind: 'everyone', group: 2, limit: 50, used: 20, level: 'low' });
    expect(board.everyone?.amount).toBe(50);
    expect(board.groups[1]).toMatchObject({ poolCapped: true });
    expect(board.groups[1].perUser?.amount).toBe(25);
    expect(board.groups[2].perUser?.amount).toBe(50);

    // The top shows the fullest limit: 90% of the budget for all of GitHub Copilot.
    expect(board.places.map((place) => [place.scope, place.name, place.top, place.gauge.budget.id])).toEqual([
      ['enterprise', 'octocorp', true, 'ent-copilot'],
      ['cost_center', 'Mobile', false, 'mobile'],
      ['organization', 'octo-apps', false, 'org-octo-apps'],
    ]);
    expect(board.top).toBe(0);
    expect(board.topName).toBe('octocorp');
    // The cost center place and group point at each other.
    expect(board.places[1].group).toBe(1);
    expect(board.groups[1].place).toBe(1);
    // The places that count each user's usage: every user used octo-apps, and octocat is in Mobile.
    expect(byLogin.get('octocat')?.places).toEqual([1, 2]);
    expect(byLogin.get('mona')?.places).toEqual([2]);
  });

  it('adds up the usage of each user day by day for playing the month', async () => {
    const store = await storeOf([...usageDays('mona', 2, 4, {}, 5), ...usageDays('hubot', 1, 1, {}, 7)]);
    const collection = collectionOf([everyone(20)]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.month).toEqual({ label: '2026-10', days: 31, lastDay: 4, collectedDay: 11 });
    const monaIndex = board.users.findIndex((user) => user.login === 'mona');
    const days = Array.from(board.cumulative.subarray(monaIndex * 4, monaIndex * 4 + 4));
    expect(days).toEqual([0, 5, 10, 15]);
    expect(shareOnDay(board, monaIndex, 3)).toBeCloseTo(0.5);
    expect(usedOnDay(board, monaIndex, 3)).toBe(10);
    // After the last day with rows, the share stays at the last value. Null means now.
    expect(shareOnDay(board, monaIndex, 30)).toBeCloseTo(0.75);
    expect(usedOnDay(board, monaIndex, null)).toBe(15);
  });

  it('puts users with no limit in a group of their own, and lists only places with a spending limit', async () => {
    const store = await storeOf([...usageDays('mona', 1, 3), ...usageDays('hubot', 1, 1)]);
    const collection = collectionOf([budget('ent', { budget_amount: 1000, consumed_amount: 30 })]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.everyone).toBeNull();
    expect(board.groups.map((group) => group.kind)).toEqual(['none']);
    // With no share, the user who used the most comes first.
    expect(board.groups[0].members.map((userIndex) => board.users[userIndex].login)).toEqual(['mona', 'hubot']);
    expect(board.users.map((user) => [user.login, user.kind, user.group, user.limit, user.share])).toEqual([
      ['mona', 'none', 0, null, null],
      ['hubot', 'none', 0, null, null],
    ]);
    expect(shareOnDay(board, 0, 3)).toBeNull();
    expect(board.places.map((place) => place.name)).toEqual(['octocorp']);
  });

  it('puts the fullest users first in their group', async () => {
    const rows = Array.from({ length: 12 }, (_, index) => usageDays(`dev-${String(index).padStart(2, '0')}`, 1, 1, {}, index + 1)).flat();
    const store = await storeOf(rows);
    const collection = collectionOf([everyone(12)]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const members = board.groups[0].members.map((userIndex) => board.users[userIndex]);
    expect(members[0]).toMatchObject({ login: 'dev-11', level: 'used-up' });
    expect(members.at(-1)?.login).toBe('dev-00');
    expect(board.groups[0].usedUp).toBe(1);
  });

  it('lists each organization and repository with a spending limit and finds the users they count', async () => {
    const organizations = Array.from({ length: 14 }, (_, index) => `org-${String(index).padStart(2, '0')}`);
    const store = await storeOf([
      ...organizations.flatMap((organization, index) => usageDays(`user-${index}`, 1, 2, { org: organization })),
      ...usageDays('user-0', 3, 3, { org: 'org-00', repo: 'repo-1' }),
      ...usageDays('user-1', 3, 3, { org: 'org-01', repo: 'org-00/repo-2' }),
      ...usageDays('user-2', 3, 3, { org: 'org-02', repo: 'org-02/repo-3' }),
    ]);
    const collection = collectionOf([
      everyone(40),
      ...organizations.flatMap((organization, index) => [seat(`user-${index}`, organization), ...(index % 3 === 0 ? [forOrganization(organization, 200, 20 * index)] : [])]),
      ...Array.from({ length: 30 }, (_, index) => forRepository(`org-00/repo-${index}`, 10)),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    // There is no spending limit for the enterprise, so it has no place.
    expect(board.top).toBe(-1);
    expect(board.places.some((place) => place.top)).toBe(false);
    const organizationPlaces = board.places.filter((place) => place.scope === 'organization');
    expect(organizationPlaces.map((place) => place.name).sort()).toEqual(['org-00', 'org-03', 'org-06', 'org-09', 'org-12']);
    expect(organizationPlaces.find((place) => place.name === 'org-03')?.seats).toBe(1);
    expect(board.places.filter((place) => place.scope === 'repository')).toHaveLength(30);

    const placeNames = (login: string) => board.users.find((user) => user.login === login)!.places.map((placeIndex) => board.places[placeIndex].name);
    // A repository budget named "org/repo" counts usage that the report names "repo" or "org/repo".
    expect(placeNames('user-0').sort()).toEqual(['org-00', 'org-00/repo-1']);
    expect(placeNames('user-1')).toEqual(['org-00/repo-2']);
    // The same name in another organization is a different repository.
    expect(placeNames('user-2')).toEqual([]);
    expect(placeNames('user-3')).toEqual(['org-03']);
    expect(placeNames('user-4')).toEqual([]);
  });

  it('sorts cost center groups A to Z and keeps every user', async () => {
    const centers = ['Data', 'Mobile', 'Web', 'Platform', 'Research'];
    const rows: RowSpec[] = [];
    for (let index = 0; index < 900; index++) rows.push(...usageDays(`dev-${index}`, 1, 1, { costCenter: centers[index % 7] ?? '' }, index % 40));
    const store = await storeOf(rows);
    const collection = collectionOf([everyone(30), ...centers.slice(0, 4).map((name, index) => forCostCenter(`limit-${name}`, name, 10 + index * 5)), ...centers.map((name) => costCenter(name)), own('dev-1', 100, null)]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.users).toHaveLength(900);
    expect(board.groups.map((group) => [group.kind, group.name])).toEqual([
      ['own', ''],
      ['cost-center', 'Data'],
      ['cost-center', 'Mobile'],
      ['cost-center', 'Platform'],
      ['cost-center', 'Web'],
      ['everyone', ''],
    ]);
    expect(board.groups.reduce((total, group) => total + group.members.length, 0)).toBe(900);
    expect(board.users.every((user) => board.groups[user.group].members.includes(board.users.indexOf(user)))).toBe(true);
  });

  it('finds what a selection holds and what holds it', async () => {
    const store = await storeOf([...usageDays('mona', 1, 2), ...usageDays('hubot', 1, 1, { costCenter: 'Mobile' }), ...usageDays('octocat', 1, 1, { org: 'octo-web' })]);
    const collection = collectionOf([
      budget('ent', { budget_amount: 1000, consumed_amount: 30 }),
      everyone(40),
      forCostCenter('mobile-limit', 'Mobile', 25),
      budget('mobile', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 300, consumed_amount: 30 }),
      forOrganization('octo-web', 100, 10),
      costCenter('Mobile'),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const userIndex = (login: string) => board.users.findIndex((user) => user.login === login);
    const placeIndex = (name: string) => board.places.findIndex((place) => place.name === name);
    const mobileGroup = board.groups.findIndex((group) => group.name === 'Mobile');
    const everyoneGroup = board.groups.findIndex((group) => group.kind === 'everyone');

    expect(limitFocus(board, { kind: 'all' })).toBeNull();
    expect(limitFocus(board, { kind: 'place', index: board.top })).toBeNull();
    // A user: their group, their cost center and the top.
    expect(limitFocus(board, { kind: 'user', index: userIndex('hubot') })).toEqual({
      places: new Set([placeIndex('Mobile'), board.top]),
      groups: new Set([mobileGroup]),
      users: new Set([userIndex('hubot')]),
    });
    // A group: its users, the place of its cost center and the places that count its users.
    expect(limitFocus(board, { kind: 'group', index: everyoneGroup })).toEqual({
      places: new Set([placeIndex('octo-web'), board.top]),
      groups: new Set([everyoneGroup]),
      users: new Set(board.groups[everyoneGroup].members),
    });
    // A place: the users it counts and their groups.
    expect(limitFocus(board, { kind: 'place', index: placeIndex('octo-web') })).toEqual({
      places: new Set([placeIndex('octo-web'), board.top]),
      groups: new Set([everyoneGroup]),
      users: new Set([userIndex('octocat')]),
    });
    expect(limitFocus(board, { kind: 'place', index: placeIndex('Mobile') })?.groups).toEqual(new Set([mobileGroup]));
  });

  it('works for the made-up GitHub data of the sample report', async () => {
    const { store } = await loadDemo({ start: '2026-08-01', end: '2026-10-20' });
    const collection = sampleCollection(store);
    const map = budgetMap(collection, store);
    const board = limitBoard(collection, store, map);
    expect(board.held).toEqual(map.held);
    expect(board.users.length).toBeGreaterThan(50);
    expect(board.groups.filter((group) => group.kind === 'cost-center').length).toBeGreaterThan(0);
    expect(board.groups.find((group) => group.kind === 'own')?.members).toHaveLength(2);
    expect(board.places[0].top).toBe(true);
    expect(board.places.filter((place) => place.scope === 'organization').length).toBeGreaterThan(0);
    // Most users are counted by some place under the top.
    expect(board.users.filter((user) => user.places.length > 0).length).toBeGreaterThan(board.users.length / 2);
  });
});
