import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { budgetMap, limitBoard, limitFocus, shareOnDay, usedOnDay, type LimitBoard, type LimitTarget } from '../src/lib/collection';
import { buildStore } from '../src/lib/csv/ingest';
import { sampleCollection } from '../src/lib/demo/github';
import { END, budgetRecord, header, readLines, recordLine, seatRecord, sourceLine, type Line } from './collectionLines';
import { loadDemo, makeCsv, type RowSpec } from './helpers';
import { Board, SQUARES_SHOWN } from '../src/pages/budgets/limitMap/Board';
import { Details } from '../src/pages/budgets/limitMap/Details';
import { sharesOn } from '../src/pages/budgets/limitMap/parts';
import { levelLabel } from '../src/pages/budgets/levels';

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

const renderBoard = (board: LimitBoard, target: LimitTarget = { kind: 'all' }, openLanes = new Set<number>()) =>
  renderToStaticMarkup(createElement(Board, {
    board, shares: sharesOn(board, null), day: null, target, focus: limitFocus(board, target), highlight: null, openLanes, onOpenLane: () => {}, choose: () => {},
  }));

const renderDetails = (board: LimitBoard, store: Awaited<ReturnType<typeof storeOf>>, target: LimitTarget, day: number | null = null) =>
  renderToStaticMarkup(createElement(Details, { board, target, shares: sharesOn(board, day), day, store, userIds: new Map<string, number>(), choose: () => {} }));

describe('the limit map', () => {
  it('leaves report-only users from other organizations outside the file scope', async () => {
    const store = await storeOf([...usageDays('mona', 1, 10), ...usageDays('hubot', 1, 10, { org: 'octo-labs' })]);
    const collection = collectionOf([forOrganization('octo-apps', 100, 20), everyone(50)], { scope: 'organization', enterprise: null, organizations: ['octo-apps'] });
    const map = budgetMap(collection, store);
    const board = limitBoard(collection, store, map);
    expect(board.users.map((user) => user.login)).toEqual(['mona']);
    expect(board.held).toEqual(map.held);
    const unrelated = collectionOf([everyone(50)], { scope: 'organization', enterprise: null, organizations: ['other'] });
    expect(limitBoard(unrelated, store, budgetMap(unrelated, store)).users).toEqual([]);
  });

  it('keeps alert thresholds visible without using them as spending walls', async () => {
    const store = await storeOf(usageDays('mona', 1, 10));
    const collection = collectionOf([
      budget('alert', { budget_amount: 100, consumed_amount: 100, prevent_further_usage: false }),
      budget('stop', { budget_amount: 1000, consumed_amount: 200 }),
      budget('org-alert', { budget_scope: 'organization', budget_entity_name: 'octo-apps', budget_amount: 10, consumed_amount: 10, prevent_further_usage: false }),
      seat('mona', 'octo-apps'),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.top.limits).toHaveLength(2);
    expect(board.top.wall?.budget.id).toBe('stop');
    expect(board.top.capacity).toBe(1000);
    expect(board.top.room).toBe(800);
    const lane = board.lanes.find((entry) => entry.name === 'octo-apps')!;
    expect(lane.limits).toHaveLength(1);
    expect(lane.gauge).toBeNull();
    expect(lane.capacity).toBeNull();
    expect(lane.room).toBe(800);
    expect(lane.reachedFirst).toBe('top');

    const alertsOnly = collectionOf([budget('alert', { consumed_amount: 500, prevent_further_usage: false })]);
    expect(limitBoard(alertsOnly, store, budgetMap(alertsOnly, store)).top).toMatchObject({ wall: null, room: null, capacity: null });
  });

  it('puts each user in the lane of the spending limit GitHub checks, inside the enterprise limit', async () => {
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
      seat('mona', 'octo-apps'),
      seat('hubot', 'octo-web'),
    ]);
    const map = budgetMap(collection, store);
    const board = limitBoard(collection, store, map);

    expect(board.held).toEqual(map.held);
    // The frame: the limit with the least room left is reached first, here the one for all of GitHub Copilot.
    expect(board.top).toMatchObject({ scope: 'enterprise', name: 'octocorp', room: 300, capacity: 1000, inside: 400, known: true });
    expect(board.top.wall?.budget.id).toBe('ent-copilot');
    expect(board.top.insideShare).toBeCloseTo(0.4);
    // Cost centers first, then organizations with a limit, then only the enterprise limit.
    expect(board.lanes.map((lane) => [lane.kind, lane.name, lane.members.length, lane.usedUp, lane.room, lane.reachedFirst])).toEqual([
      ['cost_center', 'Mobile', 1, 1, 270, 'own'],
      ['organization', 'octo-apps', 1, 1, 10, 'own'],
      ['top', '', 1, 0, 300, 'top'],
    ]);
    expect(board.lanes[0]).toMatchObject({ capacity: 300, poolCapped: true, perUser: { kind: 'cost-center' } });
    expect(board.lanes[0].perUser?.budget.amount).toBe(25);
    expect(board.lanes[1]).toMatchObject({ capacity: 100, seats: 1, perUser: { kind: 'everyone' } });
    expect(board.lanes[2]).toMatchObject({ capacity: null, gauge: null, limits: [] });

    const byLogin = new Map(board.users.map((user) => [user.login, user]));
    // An individual limit replaces the user defaults, not the spending limit of the lane.
    expect(byLogin.get('mona')).toMatchObject({ kind: 'own', lane: 1, organizations: ['octo-apps'], limit: 80, used: 100, usedFrom: 'github', level: 'used-up' });
    expect(byLogin.get('octocat')).toMatchObject({ kind: 'cost-center', lane: 0, costCenter: 'Mobile', limit: 25, used: 40, usedFrom: 'report', level: 'used-up', poolCapped: true });
    expect(byLogin.get('hubot')).toMatchObject({ kind: 'everyone', lane: 2, organizations: ['octo-web'], limit: 50, used: 20, level: 'low' });
    expect(byLogin.get('mona')?.replaces.map((limit) => limit.kind)).toEqual(['everyone']);
    expect(board.everyone?.amount).toBe(50);

    const markup = renderBoard(board);
    expect(markup).toContain('Enterprise limit');
    expect(markup).toContain('Only the enterprise limit');
    expect(markup).toContain('Limits inside add up to');
    expect(markup).not.toContain('They cannot all be used in full');
    // Each limit type has its icon: the enterprise, a cost center and an organization. The text names the type, so icons stay hidden.
    expect(markup).toContain('lucide-globe');
    expect(markup).toContain('lucide-briefcase-business');
    expect(markup).toContain('lucide-building-2');
    expect((markup.match(/<svg[^>]*>/g) ?? []).every((icon) => icon.includes('aria-hidden="true"'))).toBe(true);
  });

  it('takes the least room left: the lane limit or the enterprise limit around it', async () => {
    const store = await storeOf([...usageDays('mona', 1, 1, { costCenter: 'Mobile' }), ...usageDays('hubot', 1, 1)]);
    const collection = collectionOf([
      budget('ent', { budget_amount: 100, consumed_amount: 95 }),
      budget('mobile', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 300, consumed_amount: 30 }),
      forOrganization('octo-apps', 100, 99),
      costCenter('Mobile'),
      seat('hubot', 'octo-apps'),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const lane = (name: string) => board.lanes.find((candidate) => candidate.name === name);
    expect(lane('Mobile')).toMatchObject({ room: 5, reachedFirst: 'top' });
    expect(lane('octo-apps')).toMatchObject({ room: 1, reachedFirst: 'own' });
    // The limits inside add up to four times the enterprise limit, so they cannot all be used in full.
    expect(board.top.inside).toBe(400);
    expect(board.top.insideShare).toBeCloseTo(4);
    const markup = renderBoard(board);
    expect(markup).toContain('the limit around it is reached first');
    expect(markup).toContain('They cannot all be used in full');
    const details = renderDetails(board, store, { kind: 'lane', index: board.lanes.indexOf(lane('Mobile')!) });
    expect(details).toContain('The enterprise limit is reached first.');
    // The file does not say whether a cost center is left out of the enterprise limit.
    expect(details).toContain('by default, the enterprise limit');
    expect(details).toContain('GitHub can leave a cost center out of it');
    expect(renderDetails(board, store, { kind: 'lane', index: board.lanes.indexOf(lane('octo-apps')!) })).not.toContain('GitHub can leave a cost center out of it');
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

  it('puts everyone in one lane when only the enterprise has a limit', async () => {
    const store = await storeOf([...usageDays('mona', 1, 3), ...usageDays('hubot', 1, 1)]);
    const collection = collectionOf([budget('ent', { budget_amount: 1000, consumed_amount: 30 })]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.everyone).toBeNull();
    expect(board.lanes.map((lane) => [lane.kind, lane.room])).toEqual([['top', 970]]);
    // With no share, the user who used the most comes first.
    expect(board.lanes[0].members.map((userIndex) => board.users[userIndex].login)).toEqual(['mona', 'hubot']);
    expect(board.users.map((user) => [user.login, user.kind, user.lane, user.limit, user.share])).toEqual([
      ['mona', 'none', 0, null, null],
      ['hubot', 'none', 0, null, null],
    ]);
    expect(shareOnDay(board, 0, 3)).toBeNull();
    expect(board.top.inside).toBe(0);
    expect(renderBoard(board)).not.toContain('Limits inside');
  });

  it('draws a dashed frame when no enterprise limit is set, and says so only when the budgets were read in full', async () => {
    const store = await storeOf(usageDays('mona', 1, 1));
    const read = collectionOf([everyone(20)]);
    const board = limitBoard(read, store, budgetMap(read, store));
    expect(board.top).toMatchObject({ wall: null, room: null, capacity: null, insideShare: null, known: true });
    const markup = renderBoard(board);
    expect(markup).toContain('border-dashed');
    expect(markup).toContain('No spending limit is set here.');

    const unread = readLines([header({ months: ['2026-10'], startedAt: '2026-10-11T08:00:00Z' }), everyone(20), sourceLine('budgets', 'failed'), END]);
    const unknown = limitBoard(unread, store, budgetMap(unread, store));
    expect(unknown.top.known).toBe(false);
    expect(renderBoard(unknown)).toContain('this limit is not known');
  });

  it('puts the fullest users first in their lane', async () => {
    const rows = Array.from({ length: 12 }, (_, index) => usageDays(`dev-${String(index).padStart(2, '0')}`, 1, 1, {}, index + 1)).flat();
    const store = await storeOf(rows);
    const collection = collectionOf([everyone(12)]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const members = board.lanes[0].members.map((userIndex) => board.users[userIndex]);
    expect(members[0]).toMatchObject({ login: 'dev-11', level: 'used-up' });
    expect(members.at(-1)?.login).toBe('dev-00');
    expect(board.lanes[0].usedUp).toBe(1);
  });

  it('gives each organization with a limit a lane, fullest first, and leaves repository budgets out', async () => {
    const organizations = Array.from({ length: 14 }, (_, index) => `org-${String(index).padStart(2, '0')}`);
    const store = await storeOf([
      ...organizations.flatMap((organization, index) => usageDays(`user-${index}`, 1, 2, { org: organization })),
      ...usageDays('user-0', 3, 3, { org: 'org-00', repo: 'repo-1' }),
      ...usageDays('user-2', 3, 3, { org: 'org-02', repo: 'org-02/repo-3' }),
    ]);
    const collection = collectionOf([
      everyone(40),
      ...organizations.flatMap((organization, index) => [seat(`user-${index}`, organization), ...(index % 3 === 0 ? [forOrganization(organization, 200, 20 * index)] : [])]),
      ...Array.from({ length: 30 }, (_, index) => forRepository(`org-00/repo-${index}`, 10)),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.top.wall).toBeNull();
    expect(board.lanes.map((lane) => [lane.kind, lane.name])).toEqual([
      ['organization', 'org-12'],
      ['organization', 'org-09'],
      ['organization', 'org-06'],
      ['organization', 'org-03'],
      ['organization', 'org-00'],
      ['top', ''],
    ]);
    expect(board.lanes[3]).toMatchObject({ seats: 1, capacity: 200, reachedFirst: 'own' });
    // Users whose seat organization has no limit check only the enterprise limit.
    expect(board.lanes[5].members).toHaveLength(9);
    expect(board.top.inside).toBe(1000);
    expect(board.top.insideShare).toBeNull();
    expect(collection.budgets.filter((budget) => budget.scope === 'repository')).toHaveLength(30);
  });

  it('cannot say which organization limit applies to users with several seat organizations or none', async () => {
    const store = await storeOf([...usageDays('mona', 1, 1), ...usageDays('hubot', 1, 1), ...usageDays('octocat', 1, 1), ...usageDays('monalisa', 1, 1)]);
    const collection = collectionOf([
      costCenter('Mobile', { resources: [{ type: 'User', name: 'mona' }] }),
      seat('mona', 'seat-one'), seat('mona', 'seat-two'),
      seat('hubot', 'seat-one'), seat('hubot', 'seat-two'),
      seat('octocat', 'seat-two'),
      forOrganization('seat-one', 100, 10),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const laneOf = (login: string) => board.lanes[board.users.find((user) => user.login === login)!.lane];
    // A cost center settles it. Without one, GitHub picks one seat organization each billing cycle.
    expect(laneOf('mona')).toMatchObject({ kind: 'cost_center', name: 'Mobile' });
    expect(board.users.find((user) => user.login === 'mona')).toMatchObject({ kind: 'none', costCenter: 'Mobile', organizations: ['seat-one', 'seat-two'] });
    expect(laneOf('hubot')).toMatchObject({ kind: 'unclear', room: null, reachedFirst: null });
    expect(laneOf('monalisa').kind).toBe('unclear');
    expect(laneOf('octocat').kind).toBe('top');
    expect(renderBoard(board)).toContain('Spending limit not clear');
  });

  it('bounds the squares of a large lane and still draws a searched user', async () => {
    const centers = ['Data', 'Mobile', 'Web', 'Platform', 'Research'];
    const rows: RowSpec[] = [];
    for (let index = 0; index < 900; index++) rows.push(...usageDays(`dev-${index}`, 1, 1, { costCenter: centers[index % 7] ?? '' }, index % 40));
    const store = await storeOf(rows);
    const collection = collectionOf([everyone(30), ...centers.slice(0, 4).map((name, index) => forCostCenter(`limit-${name}`, name, 10 + index * 5)), ...centers.map((name) => costCenter(name)), own('dev-1', 100, null)]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.users).toHaveLength(900);
    // Cost centers without a spending limit still get a lane: GitHub checks their limit, not the organization's.
    expect(board.lanes.map((lane) => [lane.kind, lane.name])).toEqual([
      ['cost_center', 'Data'],
      ['cost_center', 'Mobile'],
      ['cost_center', 'Platform'],
      ['cost_center', 'Research'],
      ['cost_center', 'Web'],
      ['top', ''],
    ]);
    expect(board.lanes.reduce((total, lane) => total + lane.members.length, 0)).toBe(900);
    expect(board.users.every((user, userIndex) => board.lanes[user.lane].members.includes(userIndex))).toBe(true);

    const hidden = board.users.findIndex((user) => user.login === 'dev-880');
    const topLane = board.lanes.at(-1)!;
    expect(topLane.members.indexOf(hidden)).toBeGreaterThanOrEqual(SQUARES_SHOWN);
    const target = { kind: 'user', index: hidden } as const;
    const markup = renderBoard(board, target);
    const drawn = board.lanes.reduce((total, lane) => total + Math.min(SQUARES_SHOWN, lane.members.length), 0);
    expect(markup.match(/data-square=/g)!.length).toBe(drawn);
    expect(markup).toContain(`data-anchor="user-${hidden}"`);
    expect(markup).toContain('Show all');
    expect(renderBoard(board, target, new Set([board.lanes.length - 1])).match(/data-square=/g)!.length).toBe(drawn - SQUARES_SHOWN + topLane.members.length);
  });

  it('keeps an individual limit separate from the spending limits that also apply', async () => {
    const store = await storeOf([...usageDays('mona', 1, 1, { costCenter: 'Mobile' }, 16), ...usageDays('hubot', 1, 1, { costCenter: 'Mobile' }, 4)]);
    const collection = collectionOf([
      everyone(30), forCostCenter('mobile-default', 'Mobile', 20), own('mona', 50, 16),
      costCenter('Mobile', { ai_credit_pool_enabled: true }),
      budget('mobile-spending', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 1000 }),
      forOrganization('octo-apps', 100, 100), budget('enterprise', {}),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const userIndex = board.users.findIndex((user) => user.login === 'mona');
    const user = board.users[userIndex];
    expect(user).toMatchObject({ kind: 'own', limit: 50, share: 0.32, costCenter: 'Mobile', poolCapped: true, organizations: [] });
    expect(user.replaces.map((replaced) => replaced.amount)).toEqual([20, 30]);
    const mobileLane = board.lanes.findIndex((lane) => lane.name === 'Mobile');
    expect(user.lane).toBe(mobileLane);
    expect(limitFocus(board, { kind: 'user', index: userIndex })).toEqual({ lanes: new Set([mobileLane]), users: new Set([userIndex]) });
    const markup = renderDetails(board, store, { kind: 'user', index: userIndex });
    expect(markup).toContain('Effective user limit');
    expect(markup).toContain('Replaced user limits');
    expect(markup).toContain('Spending limits that also apply');
    expect(markup).toContain('Mobile');
    expect(markup).toContain('An individual limit does not remove that control.');
    expect(markup).toContain('GitHub can leave a cost center out of it');
    expect(markup).not.toContain('only limit that holds');
    expect(renderBoard(board, { kind: 'user', index: userIndex })).toContain('border-2 border-fg');
  });

  it('distinguishes zero from missing limits and uses the played day for used-up counts', async () => {
    const store = await storeOf([...usageDays('zero', 1, 2, {}, 0), ...usageDays('mona', 1, 2), ...usageDays('missing', 1, 2)]);
    const collection = collectionOf([own('zero', 0, 0), own('mona', 15, 20)]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const zeroIndex = board.users.findIndex((user) => user.login === 'zero');
    const missingIndex = board.users.findIndex((user) => user.login === 'missing');
    expect(board.users[zeroIndex].level).toBe('used-up');
    expect(sharesOn(board, 1)[zeroIndex]).toBe(1);
    expect(sharesOn(board, 1)[missingIndex]).toBeNaN();
    const laneIndex = board.users[zeroIndex].lane;
    expect(renderDetails(board, store, { kind: 'lane', index: laneIndex }, 1)).toMatch(/Reached their user limit<\/span><span[^>]*>1<\/span>/);
    expect(renderDetails(board, store, { kind: 'lane', index: laneIndex }, 2)).toMatch(/Reached their user limit<\/span><span[^>]*>2<\/span>/);
    expect(renderBoard(board)).toContain('border-dashed border-fg-subtle');
    expect(renderBoard(board)).toContain('2 reached their user limit');
    expect(levelLabel('used-up')).toBe('100% or more');
  });

  it('fades nobody for the whole picture or the frame, and only the members for a lane', async () => {
    const store = await storeOf([...usageDays('mona', 1, 2), ...usageDays('hubot', 1, 1, { costCenter: 'Mobile' })]);
    const collection = collectionOf([
      budget('ent', { budget_amount: 1000, consumed_amount: 30 }),
      everyone(40),
      budget('mobile', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 300, consumed_amount: 30 }),
      costCenter('Mobile'),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const hubot = board.users.findIndex((user) => user.login === 'hubot');
    const mobileLane = board.lanes.findIndex((lane) => lane.name === 'Mobile');
    expect(limitFocus(board, { kind: 'all' })).toBeNull();
    expect(limitFocus(board, { kind: 'top' })).toBeNull();
    expect(limitFocus(board, { kind: 'lane', index: mobileLane })).toEqual({ lanes: new Set([mobileLane]), users: new Set([hubot]) });
    expect(limitFocus(board, { kind: 'user', index: hubot })).toEqual({ lanes: new Set([mobileLane]), users: new Set([hubot]) });
    const all = renderDetails(board, store, { kind: 'all' });
    expect(all).toContain('How GitHub checks a request');
    expect(all).toContain('This file cannot confirm the full billing path');
    expect(renderDetails(board, store, { kind: 'top' })).toContain('Limits inside, added up');
  });

  it('frames an organization file with the organization limit, and keeps cost center users outside it', async () => {
    const store = await storeOf([...usageDays('mona', 1, 1), ...usageDays('hubot', 1, 1, { costCenter: 'Mobile' })]);
    const collection = collectionOf([forOrganization('octo-apps', 200, 50), everyone(30)], { scope: 'organization', enterprise: null, organizations: ['octo-apps'] });
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.top).toMatchObject({ scope: 'organization', name: 'octo-apps', room: 150, inside: 0 });
    // GitHub bills a cost center member to the cost center of the enterprise, so the organization limit does not count them.
    expect(board.lanes.map((lane) => [lane.kind, lane.name, lane.countedByTop, lane.room, lane.reachedFirst])).toEqual([
      ['top', '', true, 150, 'top'],
      ['cost_center', 'Mobile', false, null, null],
    ]);
    const markup = renderBoard(board);
    expect(markup).toContain('Organization limit');
    expect(markup).toContain('Only the organization limit');
    expect(markup).toContain('Outside the organization limit');
    expect(markup).toContain('Its spending limit is set in the enterprise and is not in this file.');
    const outsideBox = markup.slice(markup.indexOf('Outside the organization limit'));
    expect(outsideBox).not.toContain('Room left');
    expect(markup.indexOf('Only the organization limit')).toBeLessThan(markup.indexOf('Outside the organization limit'));
    const hubot = board.users.findIndex((user) => user.login === 'hubot');
    const details = renderDetails(board, store, { kind: 'user', index: hubot });
    expect(details).toContain('so the organization limit does not count it');
    expect(details).not.toContain('Organization limit');
    expect(details).not.toContain('GitHub can leave a cost center out of it');
  });

  it('fills the strip from the smallest limit of a row, the one that sets its width', async () => {
    const store = await storeOf(usageDays('mona', 1, 1, { costCenter: 'Mobile' }));
    const collection = collectionOf([
      budget('ent', { budget_amount: 1000, consumed_amount: 100 }),
      budget('mobile-credits', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 100, consumed_amount: 20 }),
      budget('mobile-copilot', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 500, consumed_amount: 490, budget_product_sku: 'copilot', budget_type: 'ProductPricing' }),
      costCenter('Mobile'),
    ]);
    const board = limitBoard(collection, store, budgetMap(collection, store));
    const lane = board.lanes.find((candidate) => candidate.name === 'Mobile')!;
    // The limit for all of GitHub Copilot has less room, so it is reached first. The smaller AI credits limit sets the width.
    expect(lane).toMatchObject({ capacity: 100, room: 10, reachedFirst: 'own' });
    expect(lane.gauge?.budget.id).toBe('mobile-copilot');
    const markup = renderBoard(board);
    expect(markup).toMatch(/data-tip="Mobile\s\$100, 20% used"/);
    expect(markup).toContain('width:20%');
  });

  it('works for the made-up GitHub data of the sample report', async () => {
    const { store } = await loadDemo({ start: '2026-08-01', end: '2026-10-20' });
    const collection = sampleCollection(store);
    const map = budgetMap(collection, store);
    const board = limitBoard(collection, store, map);
    expect(board.held).toEqual(map.held);
    expect(board.users.length).toBeGreaterThan(50);
    expect(board.top.scope).toBe('enterprise');
    expect(board.top.limits.every((row) => !row.budget.stopsUsage)).toBe(true);
    expect(board.top.wall).toBeNull();
    expect(board.lanes.filter((lane) => lane.kind === 'cost_center').length).toBeGreaterThan(0);
    expect(board.lanes.filter((lane) => lane.kind === 'organization').length).toBeGreaterThan(0);
    expect(board.users.filter((user) => user.kind === 'own')).toHaveLength(2);
    expect(board.users.every((user) => user.lane >= 0)).toBe(true);
    expect(board.lanes.reduce((total, lane) => total + lane.members.length, 0)).toBe(board.users.length);
    expect(renderBoard(board)).toContain('Enterprise limit');
  });
});
