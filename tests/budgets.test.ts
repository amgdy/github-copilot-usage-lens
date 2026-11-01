import { describe, expect, it } from 'vitest';
import { budgetLevel, budgetOverview, budgetPace, budgetUsers } from '../src/lib/collection';
import { buildStore } from '../src/lib/csv/ingest';
import { END, budgetRecord, header, readLines, recordLine, sourceLine, type Line } from './collectionLines';
import { makeCsv, type RowSpec } from './helpers';

function storeOf(rows: RowSpec[]) {
  return buildStore([{ name: 'usage.csv', data: makeCsv(rows) }]);
}

/** A collection made on 2026-10-11, with the given budget lines and a complete budgets source. */
function collectionOf(lines: Line[], extra: Line[] = []) {
  return readLines([header({ months: ['2026-10'], startedAt: '2026-10-11T08:00:00Z' }), ...lines, sourceLine('budgets', 'ok'), ...extra, END]);
}

const budget = (id: string, extra: Line) => recordLine('budget', budgetRecord(id, extra));

/** Billed rows of 10 USD a day for the given organization, from day `from` to day `to` of October 2026. */
function billedDays(from: number, to: number, org: string, extra: Partial<RowSpec> = {}): RowSpec[] {
  const rows: RowSpec[] = [];
  for (let day = from; day <= to; day++) rows.push({ date: `2026-10-${String(day).padStart(2, '0')}`, user: 'mona', org, gross: 10, discount: 0, net: 10, ...extra });
  return rows;
}

describe('budget levels', () => {
  it('sorts a share into low, half, near and used up', () => {
    expect([0, 0.49, 0.5, 0.79, 0.8, 0.99, 1, 1.4].map(budgetLevel)).toEqual(['low', 'low', 'half', 'half', 'near', 'near', 'used-up', 'used-up']);
  });
});

describe('budget pace', () => {
  it('uses GitHub amounts or unknown when report billing columns are missing', async () => {
    const data = makeCsv(billedDays(1, 10, 'octo-apps'), { columns: ['date', 'username', 'organization', 'gross_amount'] });
    const store = await buildStore([{ name: 'usage.csv', data }]);
    const collection = collectionOf([budget('ent', { budget_amount: 300, consumed_amount: 100 })]);
    const pace = budgetPace(collection, store, collection.budgets[0])!;
    expect(pace.basis).toBe('github');
    expect(pace.used).toBe(100);
    expect(pace.dailyRate).toBe(10);
    expect(pace.runOutDay).toBe(30);
    expect(budgetOverview(collection, store).projectedOut).toHaveLength(1);
    expect(budgetOverview(collection, store).unbudgeted).toBeNull();

    const unknown = collectionOf([budget('ent', { consumed_amount: null })]);
    expect(budgetPace(unknown, store, unknown.budgets[0])).toBeNull();
  });

  it('adds up the billed amount of the budget scope and projects the month end', async () => {
    const store = await storeOf([...billedDays(1, 10, 'octo-apps'), ...billedDays(1, 10, 'octo-data')]);
    const collection = collectionOf([budget('apps', { budget_scope: 'organization', budget_entity_name: 'Octo-Apps', budget_amount: 200, consumed_amount: 100 })]);
    const pace = budgetPace(collection, store, collection.budgets[0])!;
    expect(pace.basis).toBe('report');
    expect(pace.monthDays).toBe(31);
    expect(pace.lastDay).toBe(10);
    expect(pace.cumulative).toHaveLength(10);
    expect(pace.used).toBeCloseTo(100);
    expect(pace.dailyRate).toBeCloseTo(10);
    expect(pace.projected).toBeCloseTo(100 + 10 * 21);
    expect(pace.runOutDay).toBe(20);
    expect(pace.usedUp).toBe(false);
  });

  it('starts the pace on the first billed day, so days covered by included credits do not slow it down', async () => {
    const store = await storeOf([...billedDays(1, 6, 'octo-apps', { discount: 10, net: 0 }), ...billedDays(7, 10, 'octo-apps')]);
    const collection = collectionOf([budget('ent', { budget_amount: 1000 })]);
    const pace = budgetPace(collection, store, collection.budgets[0])!;
    expect(pace.used).toBeCloseTo(40);
    expect(pace.dailyRate).toBeCloseTo(10);
  });

  it('uses the amount at GitHub when the report does not cover the month or the budget counts seats too', async () => {
    const store = await storeOf(billedDays(1, 5, 'octo-apps').map((row) => ({ ...row, date: row.date.replace('2026-10', '2026-09') })));
    const collection = collectionOf([budget('ent', { budget_amount: 300, consumed_amount: 100 })]);
    const pace = budgetPace(collection, store, collection.budgets[0])!;
    expect(pace.basis).toBe('github');
    expect(pace.dailyRate).toBeCloseTo(10);
    expect(pace.runOutDay).toBe(30);

    const product = collectionOf([budget('copilot', { budget_type: 'ProductPricing', budget_product_sku: 'copilot', budget_amount: 300, consumed_amount: 100 })]);
    const october = await storeOf(billedDays(1, 10, 'octo-apps'));
    expect(budgetPace(product, october, product.budgets[0])!.basis).toBe('github');
  });

  it('has no pace without a report month or an amount at GitHub', async () => {
    const store = await storeOf(billedDays(1, 5, 'octo-apps').map((row) => ({ ...row, date: row.date.replace('2026-10', '2026-09') })));
    const collection = collectionOf([budget('ent', { consumed_amount: null })]);
    expect(budgetPace(collection, store, collection.budgets[0])).toBeNull();
  });

  it('matches a budget for a group of users through the users GitHub listed for it', async () => {
    const store = await storeOf([...billedDays(1, 10, 'octo-apps'), ...billedDays(1, 10, 'octo-apps', { user: 'hubot' })]);
    const collection = collectionOf(
      [budget('group', { budget_scope: 'multi_user_customer', budget_entity_name: '', budget_amount: 500 })],
      [recordLine('budget-user', { user: 'Mona', consumed_amount: 50, target_amount: 100 }, { parent: 'group' })],
    );
    expect(budgetPace(collection, store, collection.budgets[0])!.used).toBeCloseTo(100);
  });
});

describe('budget users', () => {
  it('keeps one line per login, held to the most specific limit, fullest first', () => {
    const collection = collectionOf(
      [
        budget('group', { budget_scope: 'multi_user_customer', budget_entity_name: '' }),
        budget('mona', { budget_scope: 'user', budget_entity_name: 'mona', user: 'mona', budget_amount: 50, consumed_amount: 45 }),
      ],
      [
        recordLine('budget-user', { user: 'Mona', consumed_amount: 10, target_amount: 100 }, { parent: 'group' }),
        recordLine('budget-user', { user: 'hubot', consumed_amount: 120, target_amount: 100 }, { parent: 'group' }),
      ],
    );
    const users = budgetUsers(collection);
    expect(users.map((user) => [user.login, user.level])).toEqual([
      ['hubot', 'used-up'],
      ['mona', 'near'],
    ]);
  });
});

describe('budget overview', () => {
  it('counts the budgets, finds billed usage with no budget and lists the budget changes', async () => {
    const store = await storeOf([...billedDays(1, 10, 'octo-apps', { costCenter: 'Mobile' }), ...billedDays(1, 10, 'octo-data', { costCenter: 'Data' })]);
    const collection = collectionOf(
      [
        budget('ent', { budget_amount: 1000, consumed_amount: 200, prevent_further_usage: false }),
        budget('apps', { budget_scope: 'organization', budget_entity_name: 'octo-apps', budget_amount: 100, consumed_amount: 100 }),
        budget('mobile', { budget_scope: 'cost_center', budget_entity_name: 'Mobile', budget_amount: 120, consumed_amount: 90 }),
        budget('actions', { budget_type: 'ProductPricing', budget_product_sku: 'actions', budget_amount: 50 }),
      ],
      [
        recordLine('audit-event', { action: 'business.budget_updated', '@timestamp': '2026-10-03T10:00:00Z', user: 'admin' }),
        recordLine('audit-event', { action: 'business.budget_created', '@timestamp': '2026-10-05T10:00:00Z', user: 'admin' }),
        recordLine('audit-event', { action: 'copilot.cfb_seat_assignment_created', '@timestamp': '2026-10-05T10:00:00Z' }),
      ],
    );
    const overview = budgetOverview(collection, store);
    expect(overview.month).toBe('2026-10');
    expect(overview.budgets.map((row) => row.budget.id)).toEqual(['apps', 'mobile', 'ent']);
    expect([overview.total, overview.stopping, overview.alerting, overview.usedUp, overview.near]).toEqual([3, 2, 1, 1, 0]);
    // Mobile is billed 100 by day 10 at 10 a day, so it reaches 120 on day 12. The enterprise reaches 1000 on day 50.
    expect(overview.projectedOut.map((row) => row.budget.id)).toEqual(['mobile']);
    expect(overview.unbudgeted).toEqual([
      { scope: 'cost_center', name: 'Data', billed: 100 },
      { scope: 'organization', name: 'octo-data', billed: 100 },
    ]);
    expect(overview.enterpriseBudget).toBe(true);
    expect(overview.changes.map((event) => event.day)).toEqual(['2026-10-05', '2026-10-03']);
  });

  it('does not list missing budgets when the budgets were not read in full', async () => {
    const store = await storeOf(billedDays(1, 3, 'octo-apps'));
    const collection = readLines([header({ months: ['2026-10'], startedAt: '2026-10-11T08:00:00Z' }), sourceLine('budgets', 'failed', { http: 403 }), END]);
    expect(budgetOverview(collection, store).unbudgeted).toBeNull();
  });
});
