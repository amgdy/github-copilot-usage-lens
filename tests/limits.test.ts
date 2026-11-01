import { describe, expect, it } from 'vitest';
import {
  budgetMap,
  budgetOverview,
  budgetPace,
  deriveGitHub,
  fileCoversReport,
  heldUsers,
  limitIndex,
  resolveUserLimit,
  userTarget,
  usersAtLimit,
} from '../src/lib/collection';
import { buildStore } from '../src/lib/csv/ingest';
import { END, budgetRecord, header, readLines, recordLine, seatRecord, sourceLine, type Line } from './collectionLines';
import { makeCsv, type RowSpec } from './helpers';

const storeOf = (rows: RowSpec[]) => buildStore([{ name: 'usage.csv', data: makeCsv(rows) }]);

/** A collection made on 2026-10-11 with a complete budgets source. */
const collectionOf = (lines: Line[], headerExtra: Line = {}) =>
  readLines([header({ months: ['2026-10'], startedAt: '2026-10-11T08:00:00Z', ...headerExtra }), ...lines, sourceLine('budgets', 'ok'), END]);

const budget = (id: string, extra: Line) => recordLine('budget', budgetRecord(id, extra));
const everyone = (amount: number) => budget('everyone', { budget_scope: 'multi_user_customer', budget_entity_name: '', budget_amount: amount, consumed_amount: null });
const forCostCenter = (id: string, name: string, amount: number) => budget(id, { budget_scope: 'multi_user_cost_center', budget_entity_name: name, budget_amount: amount, consumed_amount: null });
const own = (login: string, amount: number, consumed: number | null, extra: Line = {}) =>
  budget(`own-${login}`, { budget_scope: 'user', budget_entity_name: login, user: login, budget_amount: amount, consumed_amount: consumed, ...extra });
const costCenter = (name: string, resources: { type: string; name: string }[], extra: Line = {}) =>
  recordLine('cost-center', { id: `cc-${name}`, name, state: 'active', resources, ...extra });
const listed = (budgetId: string, login: string, consumed: number, limit: number) => recordLine('budget-user', { user: login, consumed_amount: consumed, target_amount: limit }, { parent: budgetId });

/** Usage of 10 USD a day for one user, from day `from` to day `to` of October 2026. */
function usageDays(user: string, from: number, to: number, extra: Partial<RowSpec> = {}): RowSpec[] {
  const rows: RowSpec[] = [];
  for (let day = from; day <= to; day++) rows.push({ date: `2026-10-${String(day).padStart(2, '0')}`, user, org: 'octo-apps', gross: 10, discount: 10, net: 0, ...extra });
  return rows;
}

const limitOf = (collection: ReturnType<typeof collectionOf>, login: string, reportCostCenter?: string) => resolveUserLimit(collection, limitIndex(collection), login, reportCostCenter);

describe('the limit of a user', () => {
  it('takes the most specific limit: own budget, then cost center, then the limit for each user', () => {
    const collection = collectionOf([everyone(30), forCostCenter('mobile-limit', 'Mobile', 50), own('mona', 80, 12), costCenter('Mobile', [{ type: 'User', name: 'hubot' }, { type: 'User', name: 'mona' }])]);
    const mona = limitOf(collection, 'Mona')!;
    expect(mona.kind).toBe('own');
    expect(mona.amount).toBe(80);
    expect(mona.githubUsed).toBe(12);
    expect(mona.replaces.map((limit) => [limit.kind, limit.amount])).toEqual([
      ['cost-center', 50],
      ['everyone', 30],
    ]);
    const hubot = limitOf(collection, 'hubot')!;
    expect(hubot.kind).toBe('cost-center');
    expect(hubot.costCenter).toEqual({ name: 'Mobile', source: 'user' });
    expect(hubot.githubUsed).toBeNull();
    expect(limitOf(collection, 'octocat')!.kind).toBe('everyone');
  });

  it('has no limit when GitHub has no limit for users', () => {
    const collection = collectionOf([budget('ent', {})]);
    expect(limitOf(collection, 'mona')).toBeNull();
  });

  it('skips a budget of the user own that ended before the data was collected', () => {
    const collection = collectionOf([everyone(30), own('mona', 80, 12, { expires_at: '2026-10-01T00:00:00Z' })]);
    expect(limitOf(collection, 'mona')!.kind).toBe('everyone');
    expect(heldUsers(collection)).toEqual([]);
  });

  it('finds the cost center through the list of GitHub, a team, the seat organization or the report', () => {
    const collection = collectionOf([
      everyone(30),
      forCostCenter('mobile-limit', 'Mobile', 50),
      forCostCenter('data-limit', 'Data', 60),
      costCenter('Mobile', [{ type: 'EnterpriseTeam', name: 'Platform' }]),
      costCenter('Data', [{ type: 'Org', name: 'octo-data' }, { type: 'EnterpriseTeam', name: 'Analysts' }]),
      recordLine('team', { slug: 'ent:platform', name: 'Platform' }),
      recordLine('team', { slug: 'ent:analysts', name: 'Analysts' }),
      recordLine('team-member', { login: 'teamuser' }, { parent: 'ent:platform' }),
      recordLine('team-member', { login: 'twoteams' }, { parent: 'ent:platform' }),
      recordLine('team-member', { login: 'twoteams' }, { parent: 'ent:analysts' }),
      recordLine('seat', seatRecord('orguser', 'octo-data', 'business')),
      listed('data-limit', 'listeduser', 20, 60),
    ]);
    expect(limitOf(collection, 'listeduser')).toMatchObject({ kind: 'cost-center', amount: 60, githubUsed: 20, costCenter: { name: 'Data', source: 'budget' } });
    expect(limitOf(collection, 'teamuser')!.costCenter).toEqual({ name: 'Mobile', source: 'team', through: 'Platform' });
    expect(limitOf(collection, 'orguser')!.costCenter).toEqual({ name: 'Data', source: 'organization', through: 'octo-data' });
    // Teams of two cost centers: the file does not say which one GitHub picked, so the report decides.
    expect(limitOf(collection, 'twoteams')!.kind).toBe('everyone');
    expect(limitOf(collection, 'twoteams', 'Data')!.costCenter).toEqual({ name: 'Data', source: 'report' });
    expect(limitOf(collection, 'twoteams', 'Data')!.kind).toBe('cost-center');
  });

  it('does not let the seat organization decide when teams point to different cost centers', () => {
    const collection = collectionOf([
      everyone(30),
      forCostCenter('mobile-limit', 'Mobile', 50),
      forCostCenter('data-limit', 'Data', 60),
      forCostCenter('org-limit', 'Org', 90),
      costCenter('Mobile', [{ type: 'EnterpriseTeam', name: 'Platform' }]),
      costCenter('Data', [{ type: 'EnterpriseTeam', name: 'Analysts' }]),
      costCenter('Org', [{ type: 'Org', name: 'octo-org' }]),
      recordLine('team', { slug: 'ent:platform', name: 'Platform' }),
      recordLine('team', { slug: 'ent:analysts', name: 'Analysts' }),
      recordLine('team-member', { login: 'twoteams' }, { parent: 'ent:platform' }),
      recordLine('team-member', { login: 'twoteams' }, { parent: 'ent:analysts' }),
      recordLine('seat', seatRecord('twoteams', 'octo-org', 'business')),
    ]);
    expect(limitOf(collection, 'twoteams')).toMatchObject({ kind: 'everyone', costCenter: null });
    expect(limitOf(collection, 'twoteams', 'Data')).toMatchObject({ kind: 'cost-center', amount: 60, costCenter: { name: 'Data', source: 'report' } });
  });

  it('keeps a user GitHub listed under the limit for each user there, whatever the cost center', () => {
    const collection = collectionOf([everyone(30), forCostCenter('mobile-limit', 'Mobile', 50), costCenter('Mobile', [{ type: 'User', name: 'mona' }]), listed('everyone', 'mona', 5, 30)]);
    expect(limitOf(collection, 'mona')).toMatchObject({ kind: 'everyone', amount: 30, githubUsed: 5 });
  });

  it('holds listed users to their most specific limit only', () => {
    const collection = collectionOf([
      everyone(30),
      forCostCenter('mobile-limit', 'Mobile', 50),
      own('quiet', 40, null),
      listed('everyone', 'mona', 31, 30),
      listed('mobile-limit', 'mona', 20, 50),
      listed('everyone', 'hubot', 30, 30),
      listed('everyone', 'quiet', 50, 30),
    ]);
    expect(heldUsers(collection).map((user) => [user.login, user.kind, user.consumed])).toEqual([
      ['mona', 'cost-center', 20],
      ['hubot', 'everyone', 30],
    ]);
    expect(usersAtLimit(collection)).toEqual([{ login: 'hubot', consumed: 30, limit: 30 }]);
  });
});

describe('the target of a user', () => {
  it('does not give an organization default to an out-of-scope report user', async () => {
    const store = await storeOf([...usageDays('mona', 1, 10), ...usageDays('hubot', 1, 10, { org: 'octo-labs' })]);
    const collection = collectionOf([everyone(200)], { scope: 'organization', enterprise: null, organizations: ['octo-apps'] });
    expect(userTarget(collection, store, 'mona')?.limit.amount).toBe(200);
    expect(userTarget(collection, store, 'hubot')).toBeNull();

    const seated = collectionOf([everyone(200), recordLine('seat', seatRecord('hubot', 'octo-apps', 'business'))], { scope: 'organization', enterprise: null, organizations: ['octo-apps'] });
    expect(userTarget(seated, store, 'hubot')?.limit.amount).toBe(200);
    const listedUser = collectionOf([everyone(200), listed('everyone', 'hubot', 20, 200)], { scope: 'organization', enterprise: null, organizations: ['octo-apps'] });
    expect(userTarget(listedUser, store, 'hubot')?.used).toBe(20);
  });

  it('anchors GitHub amounts to collection rather than the last report day', async () => {
    const store = await storeOf(usageDays('mona', 1, 10));
    const collection = collectionOf([everyone(300), listed('everyone', 'mona', 200, 300)], { startedAt: '2026-10-20T08:00:00Z' });
    const target = userTarget(collection, store, 'mona')!;
    expect(target.lastDay).toBe(10);
    expect(target.dailyRate).toBe(10);
    expect(target.projected).toBe(320);
    expect(target.runOutDay).toBe(29);
  });

  it('does not treat an unrelated organization report as known zero usage', async () => {
    const store = await storeOf(usageDays('hubot', 1, 10, { org: 'octo-labs' }));
    const collection = collectionOf([everyone(200), recordLine('seat', seatRecord('mona', 'octo-apps', 'business'))], { scope: 'organization', enterprise: null, organizations: ['octo-apps'] });
    const target = userTarget(collection, store, 'mona')!;
    expect(target.lastDay).toBe(0);
    expect(target.used).toBeNull();
    expect(target.projected).toBeNull();

    const olderScope = await storeOf([...usageDays('hubot', 1, 10, { org: 'octo-labs' }), { date: '2026-09-30', user: 'mona', org: 'octo-apps', gross: 10 }]);
    expect(userTarget(collection, olderScope, 'mona')?.used).toBeNull();
  });

  it('ignores cost-center changes after collection', async () => {
    const store = await storeOf([...usageDays('mona', 1, 10, { costCenter: 'Mobile' }), ...usageDays('mona', 12, 20, { costCenter: 'Data' })]);
    const collection = collectionOf([forCostCenter('mobile', 'Mobile', 200), forCostCenter('data', 'Data', 500)]);
    expect(userTarget(collection, store, 'mona')?.limit.budget.id).toBe('mobile');
  });

  it('treats a zero user limit as already reached', async () => {
    const store = await storeOf(usageDays('mona', 1, 10));
    const target = userTarget(collectionOf([everyone(0)]), store, 'mona')!;
    expect(target.share).toBeNull();
    expect(target.level).toBe('used-up');
    expect(target.runOutDay).toBe(10);
  });

  it('sets the usage in the report against the limit when GitHub did not list the user', async () => {
    const store = await storeOf([...usageDays('mona', 1, 2), ...usageDays('hubot', 1, 10)]);
    const collection = collectionOf([everyone(50)]);
    const target = userTarget(collection, store, 'Mona')!;
    expect(target.limit.kind).toBe('everyone');
    expect(target.usedFrom).toBe('report');
    expect(target.lastDay).toBe(10);
    expect(target.cumulative).toHaveLength(10);
    expect(target.used).toBeCloseTo(20);
    expect(target.share).toBeCloseTo(0.4);
    expect(target.level).toBe('low');
  });

  it('uses the amount GitHub showed and finds the day the limit is reached', async () => {
    const store = await storeOf(usageDays('mona', 1, 10));
    const collection = collectionOf([everyone(200), listed('everyone', 'mona', 100, 200)]);
    const target = userTarget(collection, store, 'mona')!;
    expect(target.usedFrom).toBe('github');
    expect(target.used).toBe(100);
    expect(target.dailyRate).toBeCloseTo(10);
    expect(target.projected).toBeCloseTo(100 + 10 * 21);
    expect(target.runOutDay).toBe(20);
  });

  it('uses the cost center of the report when nothing else gives one', async () => {
    const store = await storeOf(usageDays('mona', 1, 3, { costCenter: 'Mobile' }));
    const collection = collectionOf([everyone(30), forCostCenter('mobile-limit', 'Mobile', 50)]);
    const target = userTarget(collection, store, 'mona')!;
    expect(target.limit.kind).toBe('cost-center');
    expect(target.limit.costCenter).toEqual({ name: 'Mobile', source: 'report' });
  });

  it('has no target without a limit for users', async () => {
    const store = await storeOf(usageDays('mona', 1, 3));
    expect(userTarget(collectionOf([budget('ent', {})]), store, 'mona')).toBeNull();
  });
});

describe('the budget map', () => {
  it('discovers report-only users only inside an organization file scope', async () => {
    const store = await storeOf([...usageDays('mona', 1, 10), ...usageDays('hubot', 1, 10, { org: 'octo-labs' })]);
    const collection = collectionOf([everyone(200)], { scope: 'organization', enterprise: null, organizations: ['octo-apps'] });
    expect(budgetMap(collection, store).held).toEqual({ own: 0, 'cost-center': 0, everyone: 1, none: 0 });
    const unrelated = collectionOf([everyone(200)], { scope: 'organization', enterprise: null, organizations: ['other'] });
    expect(budgetMap(unrelated, store).held.everyone).toBe(0);
  });

  it('does not combine several organization budgets into one outer limit', async () => {
    const store = await storeOf(usageDays('mona', 1, 10));
    const collection = collectionOf([
      budget('apps', { budget_scope: 'organization', budget_entity_name: 'octo-apps', budget_amount: 100 }),
      budget('labs', { budget_scope: 'organization', budget_entity_name: 'octo-labs', budget_amount: 1000 }),
    ], { scope: 'organization', enterprise: null, organizations: ['octo-apps', 'octo-labs'] });
    const map = budgetMap(collection, store);
    expect(map.top.limits).toEqual([]);
    expect(map.rooms.map((room) => [room.name, room.limits[0].budget.amount])).toEqual([['octo-apps', 100], ['octo-labs', 1000]]);
  });

  it('stacks the enterprise, the cost centers and organizations, and the limits for users', async () => {
    const store = await storeOf([...usageDays('mona', 1, 10), ...usageDays('hubot', 1, 2), ...usageDays('octocat', 1, 4, { costCenter: 'Mobile' })]);
    const collection = collectionOf([
      budget('ent', { budget_amount: 1000, consumed_amount: 200 }),
      budget('apps', { budget_scope: 'organization', budget_entity_name: 'octo-apps', budget_amount: 100, consumed_amount: 90 }),
      budget('mobile', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 300, consumed_amount: 30 }),
      everyone(50),
      forCostCenter('mobile-limit', 'Mobile', 25),
      own('mona', 80, 100),
      costCenter('Mobile', [], { ai_credit_pool_enabled: true }),
      costCenter('Empty', []),
    ]);
    const map = budgetMap(collection, store);
    expect(map.top).toMatchObject({ scope: 'enterprise', name: 'octocorp' });
    expect(map.top.limits.map((row) => row.budget.id)).toEqual(['ent']);
    expect(map.rooms.map((room) => [room.scope, room.name])).toEqual([
      ['cost_center', 'Mobile'],
      ['organization', 'octo-apps'],
    ]);
    const mobile = map.rooms[0];
    expect(mobile.poolCapped).toBe(true);
    expect(mobile.limits.map((row) => row.budget.id)).toEqual(['mobile']);
    // octocat used 40 USD of a limit of 25 USD.
    expect(mobile.perUser).toMatchObject({ users: 1, usedUp: 1 });
    expect(map.everyone).toMatchObject({ users: 1, usedUp: 0 });
    expect(map.own.map((limit) => [limit.login, limit.level])).toEqual([['mona', 'used-up']]);
    expect(map.held).toEqual({ own: 1, 'cost-center': 1, everyone: 1, none: 0 });
    expect(map.roomsWithoutLimit).toBe(1);
  });
});

describe('a GitHub data file for some organizations', () => {
  const orgFile = { scope: 'organization', enterprise: null, organizations: ['octo-apps'] };
  const orgBudget = (amount: number) => budget('apps', { budget_scope: 'organization', budget_entity_name: 'octo-apps', budget_amount: amount, consumed_amount: 10 });

  it('uses the budget of the organization only when the report has no other organization', async () => {
    const both = await storeOf([...usageDays('mona', 1, 3, { net: 5 }), ...usageDays('hubot', 1, 3, { org: 'octo-data', net: 5 })]);
    const onlyApps = await storeOf(usageDays('mona', 1, 3, { net: 5 }));
    const collection = collectionOf([orgBudget(100)], orgFile);
    expect(fileCoversReport(collection, both)).toBe(false);
    expect(fileCoversReport(collection, onlyApps)).toBe(true);
    expect(deriveGitHub(collection, both).budget).toBeNull();
    expect(deriveGitHub(collection, onlyApps).budget?.id).toBe('apps');
  });

  it('lists missing budgets only for the organizations of the file', async () => {
    const store = await storeOf([...usageDays('mona', 1, 3, { org: 'octo-data', net: 5, costCenter: 'Data' }), ...usageDays('hubot', 1, 3, { org: 'octo-apps', net: 5, costCenter: 'Data' })]);
    const collection = collectionOf([], orgFile);
    expect(budgetOverview(collection, store).unbudgeted).toEqual([{ scope: 'organization', name: 'octo-apps', billed: 15 }]);
  });
});

describe('the pace of a budget with no rows in the report', () => {
  it('falls back to the amount at GitHub when the budget names something the report does not have', async () => {
    const store = await storeOf(usageDays('mona', 1, 10, { net: 10 }));
    const collection = collectionOf([budget('gone', { budget_scope: 'organization', budget_entity_name: 'octo-gone', budget_amount: 300, consumed_amount: 100 })]);
    expect(budgetPace(collection, store, collection.budgets[0])!.basis).toBe('github');
  });
});
