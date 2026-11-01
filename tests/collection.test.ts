import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import {
  CollectionError,
  CollectionReader,
  auditKind,
  checkMonths,
  collectionLicenseParse,
  deriveGitHub,
  monthBills,
  pickBudget,
  readCollection,
  readHeadText,
  sourceComplete,
  usageReportState,
  usersAtLimit,
} from '../src/lib/collection';
import { EMPTY_REPORT_MESSAGE, OLD_EMPTY_REPORT_MESSAGE } from '../src/lib/collection/types';
import { buildStore } from '../src/lib/csv/ingest';
import { END, budgetRecord, creditLine, header, recordLine, readLines, seatRecord, sourceLine, storedText, textOf, usageReportPart, type Line } from './collectionLines';
import { makeCsv, type RowSpec } from './helpers';

function storeOf(rows: RowSpec[]) {
  return buildStore([{ name: 'usage.csv', data: makeCsv(rows) }]);
}

describe('reading a GitHub data file', () => {
  it('refuses a file that does not start with the header of the collector', () => {
    const reader = new CollectionReader();
    expect(() => reader.push('{"kind":"seat","record":{}}')).toThrow(CollectionError);
    expect(() => new CollectionReader().push('date,username')).toThrow(CollectionError);
    expect(() => new CollectionReader().push(JSON.stringify(header({ format: 'something-else' })))).toThrow(CollectionError);
    expect(() => new CollectionReader().finish('empty.ndjson')).toThrow(CollectionError);
  });

  it('says when the file is from a newer version of the script', () => {
    expect(() => new CollectionReader().push(JSON.stringify(header({ version: 2 })))).toThrow(/newer version/);
  });

  it('keeps the fields the app uses and counts lines it cannot read', () => {
    const collection = readLines([
      header({ months: ['2026-09', 'bad', '2026-08'] }),
      recordLine('organization', { login: 'octo-org', name: 'Octo Org' }),
      recordLine('seat', seatRecord('KofiIto_nwind', 'octo-org', 'enterprise', 'platform')),
      recordLine('seat-total', { total_seats: 3 }),
      recordLine('seat-summary', { seat_breakdown: { total: 3, added_this_cycle: 1, pending_cancellation: 1, pending_invitation: 0, active_this_cycle: 2, inactive_this_cycle: 1 }, seat_management_setting: 'assign_all', plan_type: 'business', ide_chat: 'enabled', platform_chat: 'disabled', cli: 'enabled' }, { scope: 'organization', target: 'octo-org' }),
      recordLine('member', { login: 'KofiIto_nwind', type: 'User' }),
      recordLine('member', { login: 'NoSeat_nwind', type: 'User' }),
      recordLine('team', { slug: 'ent:platform', name: 'Platform' }),
      recordLine('team', { slug: '__proto__', name: 'Reserved slug' }),
      recordLine('team-member', { login: 'MeiChen_nwind' }, { parent: 'ent:platform' }),
      recordLine('user-teams', { user_login: 'MeiChen_nwind', day: '2026-10-01', team_id: 1, slug: 'devs' }),
      recordLine('budget', budgetRecord('budget-1', {})),
      recordLine('budget-user', { user: 'KofiIto_nwind', consumed_amount: 21, target_amount: 20, override_budget_id: null }, { parent: 'budget-1' }),
      recordLine('budget-user', { user: 'MeiChen_nwind', consumed_amount: 50, target_amount: 20, override_budget_id: 'budget-9' }, { parent: 'budget-1' }),
      recordLine('cost-center', {
        id: 'cc-1',
        name: 'Platform',
        state: 'active',
        ai_credit_pool_enabled: true,
        resources: [
          { type: 'User', name: 'KofiIto_nwind' },
          { type: 'Org', name: 'octo-org' },
          { type: 'Repo', name: 'octo-org/app' },
          { type: 'EnterpriseTeam', name: 'platform' },
        ],
      }),
      recordLine('cost-center', { id: 'cc-2', name: 'Old', state: 'deleted', resources: [] }),
      creditLine('2026-08', 120, 90, 30),
      creditLine('2026-08', 10, 10, 0),
      recordLine('usage-summary', { product: 'Copilot', sku: 'Copilot Business', unitType: 'UserMonths', pricePerUnit: 19, grossQuantity: 2, grossAmount: 38, discountAmount: 0, netAmount: 38 }, { month: '2026-08' }),
      recordLine('usage-summary', { product: 'Copilot', sku: 'Copilot AI Credits', unitType: 'credits', grossQuantity: 13000, grossAmount: 130, discountAmount: 100, netAmount: 30 }, { month: '2026-08' }),
      recordLine('billing-usage', { date: '2026-08-01', product: 'Copilot', sku: 'Copilot Business', quantity: 2 }, { month: '2026-08' }),
      recordLine('audit-event', { action: 'copilot.cfb_seat_assignment_created', '@timestamp': Date.UTC(2026, 7, 3), user: 'MeiChen_nwind', org: 'octo-org' }),
      recordLine('audit-event', { action: 'copilot.cfb_seat_cancelled', created_at: '2026-09-04T10:00:00Z' }),
      sourceLine('seats', 'ok', { records: 1 }),
      sourceLine('budgets', 'partial', { http: 502, message: 'Some pages failed.' }),
      '{"kind":"seat", broken',
      '[1,2,3]',
      recordLine('mystery', { anything: true }),
      END,
    ]);
    expect(collection.header).toMatchObject({ scope: 'enterprise', enterprise: 'octocorp', months: ['2026-08', '2026-09'], day: '2026-10-02' });
    expect(collection.complete).toBe(true);
    expect(collection.skippedLines).toBe(2);
    expect(collection.organizations).toEqual(['octo-org']);
    expect(collection.seats).toHaveLength(1);
    expect(collection.seatTotals).toEqual([{ target: 'octocorp', total: 3 }]);
    expect(collection.seatSummaries).toEqual([
      { org: 'octo-org', total: 3, addedThisCycle: 1, pendingCancellation: 1, pendingInvitation: 0, activeThisCycle: 2, inactiveThisCycle: 1, management: 'assign_all', plan: 'business', ideChat: 'enabled', platformChat: 'disabled', cli: 'enabled' },
    ]);
    expect(collection.members).toEqual(['kofiito_nwind', 'noseat_nwind']);
    expect(collection.teams).toEqual(Object.fromEntries([['ent:platform', 'Platform'], ['__proto__', 'Reserved slug']]));
    expect(Object.hasOwn(collection.teams, '__proto__')).toBe(true);
    expect(collection.userTeams).toEqual({ meichen_nwind: ['ent:platform', 'devs'] });
    expect(collection.budgets).toEqual([
      { id: 'budget-1', scope: 'enterprise', entity: 'octocorp', amount: 500, consumed: 100, stopsUsage: true, willAlert: true, type: 'SkuPricing', sku: 'ai_credits', aiCredits: true, copilot: true },
    ]);
    // A user held to a budget of their own is left out of the shared budget.
    expect(collection.budgetUsers).toEqual([{ budgetId: 'budget-1', login: 'KofiIto_nwind', consumed: 21, limit: 20 }]);
    // Deleted cost centers are left out.
    expect(collection.costCenters).toEqual([
      { id: 'cc-1', name: 'Platform', users: ['KofiIto_nwind'], organizations: ['octo-org'], teams: ['platform'], repositories: ['octo-org/app'], poolCapped: true },
    ]);
    expect(collection.aiCredits).toEqual([{ month: '2026-08', target: 'octocorp', gross: 130, discount: 100, net: 30, quantity: 13000 }]);
    expect(collection.seatCharges).toEqual([{ month: '2026-08', target: 'octocorp', gross: 38, discount: 0, net: 38, quantity: 2 }]);
    expect(collection.summaryCredits).toEqual([{ month: '2026-08', target: 'octocorp', gross: 130, discount: 100, net: 30, quantity: 13000 }]);
    expect(collection.audit).toEqual([
      { action: 'copilot.cfb_seat_assignment_created', kind: 'seat-added', day: '2026-08-03', user: 'MeiChen_nwind', org: 'octo-org' },
      { action: 'copilot.cfb_seat_cancelled', kind: 'seat-removed', day: '2026-09-04' },
    ]);
    expect(collection.sources.map((source) => [source.id, source.status, source.http])).toEqual([['seats', 'ok', 200], ['budgets', 'partial', 502]]);
    expect(collection.capped).toBe(false);
  });

  it('joins the requests of one part into one line', () => {
    const collection = readLines([
      header(),
      sourceLine('budgets', 'ok', { records: 3 }),
      sourceLine('budgets', 'ok', { records: 2, endpoint: '/enterprises/octocorp/settings/billing/budgets/budget-2/user-states' }),
      sourceLine('audit-log', 'ok', { records: 3 }),
      sourceLine('audit-log', 'failed', { records: 0, http: 403, message: 'Resource not accessible by integration' }),
      sourceLine('audit-log', 'failed', { records: 0, http: 502, message: 'Server error' }),
      sourceLine('members', 'skipped', { records: 0, http: 0, message: 'Left out with --skip.' }),
      sourceLine('members', 'ok', { records: 4 }),
      sourceLine('seat-summary', 'ok', { scope: 'organization', target: 'octo-org' }),
      sourceLine('seat-summary', 'failed', { scope: 'organization', target: 'octo-labs', records: 0, http: 403, message: 'Must be an organization owner' }),
      sourceLine('ai-credit-usage', 'ok', { month: '2026-08' }),
      sourceLine('ai-credit-usage', 'failed', { month: '2026-09', records: 0, http: 404, message: 'Not Found' }),
      sourceLine('teams', 'skipped', { scope: '', target: '', records: 0, http: 0, message: 'Not selected.' }),
      END,
    ]);
    expect(collection.sources.map((source) => [source.id, source.target, source.month ?? '', source.status, source.records, source.http, source.message])).toEqual([
      ['budgets', 'octocorp', '', 'ok', 5, 200, ''],
      ['audit-log', 'octocorp', '', 'partial', 3, 403, 'Resource not accessible by integration'],
      ['members', 'octocorp', '', 'ok', 4, 200, ''],
      ['seat-summary', 'octo-org', '', 'ok', 1, 200, ''],
      ['seat-summary', 'octo-labs', '', 'failed', 0, 403, 'Must be an organization owner'],
      ['ai-credit-usage', 'octocorp', '2026-08', 'ok', 1, 200, ''],
      ['ai-credit-usage', 'octocorp', '2026-09', 'failed', 0, 404, 'Not Found'],
      ['teams', '', '', 'skipped', 0, null, 'Not selected.'],
    ]);
    expect(sourceComplete(collection.sources, 'budgets')).toBe(true);
    expect(sourceComplete(collection.sources, 'audit-log')).toBe(false);
    expect(sourceComplete(collection.sources, 'ai-credit-usage', '2026-08')).toBe(true);
    expect(sourceComplete(collection.sources, 'ai-credit-usage', '2026-09')).toBe(false);
  });

  it('knows why the AI usage report of a month is not in the file', () => {
    const failed = (month: string, message: string) => sourceLine('usage-report', 'failed', { month, records: 0, http: 0, message });
    const collection = readLines([
      header({ months: ['2026-06', '2026-07', '2026-08', '2026-09'] }),
      sourceLine('usage-report', 'ok', { month: '2026-06', records: 0, message: EMPTY_REPORT_MESSAGE }),
      // Older scripts marked a finished report without usage as failed.
      failed('2026-07', OLD_EMPTY_REPORT_MESSAGE),
      failed('2026-08', 'GitHub is still making the report. Run the script again in a few minutes. It uses the same report.'),
      failed('2026-09', 'Not Found'),
      END,
    ]);
    expect(collection.sources.map((source) => [source.month, source.status, source.message])).toEqual([
      ['2026-06', 'ok', EMPTY_REPORT_MESSAGE],
      ['2026-07', 'ok', EMPTY_REPORT_MESSAGE],
      ['2026-08', 'failed', 'GitHub is still making the report. Run the script again in a few minutes. It uses the same report.'],
      ['2026-09', 'failed', 'Not Found'],
    ]);
    expect(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'].map((month) => usageReportState(collection.sources, month))).toEqual([
      'complete', 'complete', 'waiting', 'missing', 'missing',
    ]);
  });

  it('adds up the activity of each user once per day', () => {
    const day = (login: string, date: string, extra: Line = {}): Line =>
      recordLine('user-metrics', { day: date, user_login: login, ai_credits_used: 10, code_generation_activity_count: 3, used_chat: false, used_agent: false, used_cli: false, totals_by_feature: [], ...extra });
    const collection = readLines([
      header(),
      day('KofiIto_nwind', '2026-09-01', { used_chat: true }),
      // The same user and day from the report of a second organization.
      day('kofiito_nwind', '2026-09-01', { used_cli: true }),
      day('KofiIto_nwind', '2026-09-03', { totals_by_feature: [{ feature: 'code_completion', code_generation_activity_count: 4 }] }),
      day('MeiChen_nwind', '2026-09-02', { used_copilot_cloud_agent: true }),
      // A line without any activity does not make the user active.
      day('Quiet_nwind', '2026-09-02', { ai_credits_used: 0, code_generation_activity_count: 0 }),
      // A line of the 28-day report with its window.
      recordLine('user-metrics', { report_start_day: '2026-08-20', report_end_day: '2026-09-16', user_login: 'SaraLind_nwind', user_initiated_interaction_count: 2 }),
    ]);
    expect(collection.complete).toBe(false);
    expect(collection.metrics).toEqual({
      firstDay: '2026-08-20',
      lastDay: '2026-09-16',
      dayCount: 4,
      users: [
        { login: 'KofiIto_nwind', days: 2, firstDay: '2026-09-01', lastDay: '2026-09-03', credits: 30, completionDays: 1, chatDays: 1, agentDays: 0, cliDays: 1 },
        { login: 'MeiChen_nwind', days: 1, firstDay: '2026-09-02', lastDay: '2026-09-02', credits: 10, completionDays: 0, chatDays: 0, agentDays: 1, cliDays: 0 },
        { login: 'SaraLind_nwind', days: 1, firstDay: '2026-09-16', lastDay: '2026-09-16', credits: 0, completionDays: 0, chatDays: 0, agentDays: 0, cliDays: 0 },
      ],
    });
  });

  it('names what an audit event is about', () => {
    expect(auditKind('copilot.cfb_seat_assignment_created')).toBe('seat-added');
    expect(auditKind('copilot.cfb_seat_assignment_reused')).toBe('seat-added');
    expect(auditKind('copilot.cfb_seat_cancelled')).toBe('seat-removed');
    expect(auditKind('copilot.cfb_seat_assignment_unassigned')).toBe('seat-removed');
    expect(auditKind('copilot.plan_changed')).toBe('plan');
    expect(auditKind('billing.budget_update')).toBe('budget');
    expect(auditKind('copilot.policy_update')).toBe('policy');
    expect(auditKind('copilot.something_new')).toBe('other');
  });

  it('reads plain and gzip files line by line', async () => {
    const text = textOf([header(), recordLine('member', { login: 'KofiIto_nwind' }), creditLine('2026-08', 5, 5, 0), END]);
    const plain = await readCollection(new Blob([text]), 'usage-lens-data.ndjson');
    const packed = await readCollection(new Blob([gzipSync(text)]), 'usage-lens-data.ndjson.gz');
    expect(plain.members).toEqual(['kofiito_nwind']);
    expect(packed).toEqual({ ...plain, fileName: 'usage-lens-data.ndjson.gz' });
    expect(packed.complete).toBe(true);
    // Windows line ends and a byte order mark are fine too.
    const windows = await readCollection(new Blob([`\uFEFF${text.replaceAll('\n', '\r\n')}`]), 'windows.ndjson');
    expect(windows.members).toEqual(['kofiito_nwind']);
    expect(windows.skippedLines).toBe(0);
  });

  it('keeps the lines before the cut when a gzip file is cut off', async () => {
    const lines: Line[] = [header()];
    for (let i = 0; i < 3000; i++) lines.push(recordLine('member', { login: `user${i}_nwind`, type: 'User' }));
    const packed = gzipSync(textOf([...lines, END]));
    const cut = await readCollection(new Blob([packed.subarray(0, Math.floor(packed.length * 0.6))]), 'cut.ndjson.gz');
    expect(cut.complete).toBe(false);
    expect(cut.members.length).toBeGreaterThan(0);
    expect(cut.members.length).toBeLessThan(3000);
    await expect(readCollection(new Blob([packed.subarray(0, 12)]), 'tiny.ndjson.gz')).rejects.toThrow();
  });

  it('skips a line that is too long without losing the next one', async () => {
    const long = JSON.stringify(recordLine('member', { login: 'x'.repeat(9 * 1024 * 1024) }));
    const text = textOf([header(), long, recordLine('member', { login: 'MeiChen_nwind' }), END]);
    const collection = await readCollection(new Blob([text]), 'long.ndjson');
    expect(collection.skippedLines).toBe(1);
    expect(collection.members).toEqual(['meichen_nwind']);
    expect(collection.complete).toBe(true);
  });

  it('puts the AI usage report back together from its parts', async () => {
    const csv = makeCsv([
      { date: '2026-09-02', user: 'KofiIto_nwind', gross: 1.5, costCenter: 'Team "North", \\ desk' },
      { date: '2026-09-03', user: 'MeiChen_nwind', gross: 0.25 },
      { date: '2026-09-04', user: 'SaraLind_nwind', gross: 2 },
    ]);
    const lines = csv.trimEnd().split('\n');
    const collection = readLines([
      header(),
      // The parts may come in any order. The second file holds only the column names.
      usageReportPart('2026-09', 1, 2, lines.slice(2)),
      usageReportPart('2026-09', 1, 1, lines.slice(0, 2)),
      usageReportPart('2026-09', 2, 1, lines.slice(0, 1)),
      sourceLine('usage-report', 'ok', { month: '2026-09', records: 3 }),
      END,
    ]);
    expect(collection.usageReports.map((report) => [report.month, report.name, report.lines])).toEqual([
      ['2026-09', 'ai-usage-report-2026-09-1.csv', 4],
      ['2026-09', 'ai-usage-report-2026-09-2.csv', 1],
    ]);
    expect(await storedText(collection.usageReports[0].data)).toBe(csv);
    const store = await buildStore(collection.usageReports.map((report) => ({ name: report.name, data: report.data })));
    expect(store.n).toBe(3);
  });

  it('leaves out a month of the AI usage report that is not complete', () => {
    const lines = makeCsv([{ date: '2026-09-02', user: 'KofiIto_nwind', gross: 1 }, { date: '2026-09-03', user: 'MeiChen_nwind', gross: 1 }]).trimEnd().split('\n');
    const month = (name: string, parts: Line[], source: Line | null) => {
      const collection = readLines([header(), ...parts, ...(source ? [source] : []), END]);
      return [name, collection.usageReports.length];
    };
    const ok = (records = 2) => sourceLine('usage-report', 'ok', { month: '2026-09', records });
    expect([
      month('complete', [usageReportPart('2026-09', 1, 1, lines)], ok()),
      month('no source line', [usageReportPart('2026-09', 1, 1, lines)], null),
      month('failed', [usageReportPart('2026-09', 1, 1, lines)], sourceLine('usage-report', 'failed', { month: '2026-09', records: 0 })),
      month('a part is missing', [usageReportPart('2026-09', 1, 2, lines.slice(1))], ok(1)),
      month('a part came twice', [usageReportPart('2026-09', 1, 1, lines), usageReportPart('2026-09', 1, 1, lines)], ok()),
      month('rows do not add up', [usageReportPart('2026-09', 1, 1, lines)], ok(3)),
      month('two reports', [usageReportPart('2026-09', 1, 1, lines), usageReportPart('2026-09', 2, 1, lines.slice(0, 1), 'report-2')], ok()),
      month('damaged lines', [usageReportPart('2026-09', 1, 1, lines), recordLine('usage-report', { report: 'report-1', file: 1, part: 2, lines: [1, 2] }, { month: '2026-09' })], ok()),
    ]).toEqual([
      ['complete', 1], ['no source line', 0], ['failed', 0], ['a part is missing', 0], ['a part came twice', 0],
      ['rows do not add up', 0], ['two reports', 0], ['damaged lines', 0],
    ]);
  });

  it('reads the start of a gzip file for sorting uploads', async () => {
    const text = textOf([header(), END]);
    expect(await readHeadText(new Blob([gzipSync(text)]), 40)).toBe(text.slice(0, 40));
    expect(await readHeadText(new Blob([text]), 4096)).toBe(text);
    expect(await readHeadText(new Blob([Uint8Array.from([0x1f, 0x8b, 1, 2, 3])]), 100)).toBe('');
  });
});

describe('what a GitHub data file adds', () => {
  it('uses the smallest AI credit budget of the same enterprise', () => {
    const collection = readLines([
      header(),
      recordLine('budget', budgetRecord('large', { budget_amount: 900 })),
      recordLine('budget', budgetRecord('small', { budget_amount: 400, prevent_further_usage: false })),
      recordLine('budget', budgetRecord('product', { budget_amount: 100, budget_type: 'ProductPricing', budget_product_sku: 'copilot' })),
      recordLine('budget', budgetRecord('other-enterprise', { budget_amount: 50, budget_entity_name: 'someone-else' })),
      recordLine('budget', budgetRecord('organization', { budget_amount: 10, budget_scope: 'organization', budget_entity_name: 'octo-org' })),
      recordLine('budget', budgetRecord('actions', { budget_amount: 5, budget_product_sku: 'actions' })),
      recordLine('budget', budgetRecord('zero', { budget_amount: 0 })),
    ]);
    expect(pickBudget(collection)?.id).toBe('small');
    const github = deriveGitHub(collection, emptyStoreLike());
    expect(github.copilotBudgets.map((budget) => budget.id)).toEqual(['small', 'zero', 'product', 'large', 'other-enterprise', 'organization']);
    expect(github.otherBudgets).toBe(1);
  });

  it('uses an organization budget only for a file of that one organization', () => {
    const budget = recordLine('budget', budgetRecord('org', { budget_scope: 'organization', budget_entity_name: 'Octo-Org', budget_amount: 80 }));
    const single = readLines([header({ scope: 'organization', enterprise: null, organizations: ['octo-org'] }), budget]);
    expect(pickBudget(single)?.id).toBe('org');
    const several = readLines([header({ scope: 'organization', enterprise: null, organizations: ['octo-org', 'octo-labs'] }), budget]);
    expect(pickBudget(several)).toBeNull();
  });

  it('lists the users who used up their budget', () => {
    const collection = readLines([
      header(),
      recordLine('budget', budgetRecord('shared', { budget_scope: 'multi_user_customer', budget_amount: 20 })),
      recordLine('budget-user', { user: 'KofiIto_nwind', consumed_amount: 20, target_amount: 20 }, { parent: 'shared' }),
      recordLine('budget-user', { user: 'MeiChen_nwind', consumed_amount: 19.99, target_amount: 20 }, { parent: 'shared' }),
      recordLine('budget', budgetRecord('own', { budget_scope: 'user', user: 'SaraLind_nwind', budget_amount: 10, consumed_amount: 30, prevent_further_usage: false })),
      recordLine('budget', budgetRecord('actions', { budget_scope: 'user', user: 'Builder_nwind', budget_amount: 1, consumed_amount: 5, budget_product_sku: 'actions' })),
    ]);
    expect(usersAtLimit(collection)).toEqual([
      { login: 'SaraLind_nwind', consumed: 30, limit: 10 },
      { login: 'KofiIto_nwind', consumed: 20, limit: 20 },
    ]);
  });

  it('treats every budget for users as one that stops usage', () => {
    const collection = readLines([
      header(),
      recordLine('budget', budgetRecord('own', { budget_scope: 'user', user: 'SaraLind_nwind', budget_amount: 10, prevent_further_usage: false })),
      recordLine('budget', budgetRecord('team', { budget_scope: 'multi_user_cost_center', budget_amount: 10, prevent_further_usage: false })),
      recordLine('budget', budgetRecord('alerts', { budget_amount: 10, prevent_further_usage: false })),
    ]);
    expect(collection.budgets.map((budget) => [budget.id, budget.stopsUsage])).toEqual([
      ['own', true],
      ['team', true],
      ['alerts', false],
    ]);
  });

  it('sets each billing month against the usage report', async () => {
    const store = await storeOf([
      { date: '2026-07-31', user: 'KofiIto_nwind', gross: 4 },
      { date: '2026-08-01', user: 'KofiIto_nwind', gross: 60, discount: 45, net: 15 },
      { date: '2026-08-30', user: 'MeiChen_nwind', gross: 70, discount: 55, net: 15 },
      { date: '2026-09-02', user: 'KofiIto_nwind', gross: 50 },
      { date: '2026-09-29', user: 'MeiChen_nwind', gross: 50 },
      { date: '2026-10-01', user: 'MeiChen_nwind', gross: 5 },
    ]);
    const collection = readLines([
      header({ months: ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'] }),
      ...['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'].map((month) => sourceLine('ai-credit-usage', month === '2026-06' ? 'failed' : 'ok', { month })),
      creditLine('2026-07', 4, 4, 0),
      creditLine('2026-08', 131, 100, 31),
      creditLine('2026-09', 140, 140, 0),
      creditLine('2026-10', 9, 9, 0),
    ]);
    const { months, checkedOrgs } = checkMonths(collection, store);
    expect(checkedOrgs).toEqual([]);
    expect(months.map((month) => [month.month, month.status])).toEqual([
      ['2026-06', 'missing'],
      ['2026-07', 'partial'],
      ['2026-08', 'match'],
      ['2026-09', 'lower'],
      ['2026-10', 'open'],
    ]);
    const september = months[3];
    expect(september.report.gross).toBeCloseTo(100, 6);
    expect(september.github?.gross).toBe(140);
    expect(september.grossGap).toBeCloseTo(40, 6);
  });

  it('compares only the organizations of an organization file', async () => {
    const store = await storeOf([
      { date: '2026-08-01', user: 'KofiIto_nwind', gross: 50, org: 'octo-org' },
      { date: '2026-08-31', user: 'MeiChen_nwind', gross: 50, org: 'octo-labs' },
    ]);
    const collection = readLines([
      header({ scope: 'organization', enterprise: null, organizations: ['OCTO-ORG'], months: ['2026-08'] }),
      sourceLine('ai-credit-usage', 'ok', { month: '2026-08' }),
      creditLine('2026-08', 50, 50, 0),
    ]);
    const { months, checkedOrgs } = checkMonths(collection, store);
    expect(checkedOrgs).toEqual(['octo-org']);
    expect(months[0]).toMatchObject({ status: 'match', report: { gross: 50 } });
  });

  it('does not compare an organization file with unrelated report rows', async () => {
    const store = await storeOf([
      { date: '2026-08-01', user: 'KofiIto_nwind', gross: 50, org: 'octo-org' },
      { date: '2026-08-31', user: 'MeiChen_nwind', gross: 50, org: 'octo-labs' },
    ]);
    const collection = readLines([
      header({ scope: 'organization', enterprise: null, organizations: ['missing-org'], months: ['2026-08'] }),
      sourceLine('ai-credit-usage', 'ok', { month: '2026-08' }),
      creditLine('2026-08', 100, 100, 0),
    ]);
    const { months, checkedOrgs } = checkMonths(collection, store);
    expect(checkedOrgs).toEqual([]);
    expect(months[0]).toMatchObject({ status: 'outside', report: { gross: 0 }, github: { gross: 100 } });
  });

  it('falls back to the billing summary and adds seat charges to the bill', () => {
    const collection = readLines([
      header({ months: ['2026-08', '2026-09'] }),
      sourceLine('ai-credit-usage', 'failed', { month: '2026-08' }),
      sourceLine('usage-summary', 'ok', { month: '2026-08' }),
      sourceLine('ai-credit-usage', 'ok', { month: '2026-09' }),
      recordLine('usage-summary', { product: 'Copilot', sku: 'Copilot Business', unitType: 'UserMonths', grossQuantity: 10, grossAmount: 190, discountAmount: 0, netAmount: 190 }, { month: '2026-08' }),
      recordLine('usage-summary', { product: 'Copilot', sku: 'Copilot AI Credits', unitType: 'credits', grossQuantity: 5000, grossAmount: 50, discountAmount: 20, netAmount: 30 }, { month: '2026-08' }),
      creditLine('2026-09', 60, 60, 0),
    ]);
    expect(monthBills(collection)).toEqual([
      { month: '2026-08', seats: 190, seatMonths: 10, aiCredits: 30, total: 220, open: false },
      { month: '2026-09', seats: null, seatMonths: null, aiCredits: 0, total: null, open: false },
    ]);
  });

  it('builds the license list from the seats with teams and the day of the file', () => {
    const collection = readLines([
      header(),
      recordLine('seat-total', { total_seats: 2 }),
      recordLine('seat', seatRecord('KofiIto_nwind', 'octo-org', 'enterprise', 'platform')),
      recordLine('seat', seatRecord('MeiChen_nwind', 'octo-org', 'business')),
      recordLine('team-member', { login: 'meichen_nwind' }, { parent: 'ent:web' }),
      recordLine('user-teams', { user_login: 'MeiChen_nwind', slug: 'devs' }),
      recordLine('team-member', { login: 'KofiIto_nwind' }, { parent: 'devs' }),
    ]);
    const parse = collectionLicenseParse(collection);
    expect(parse.kind).toBe('seats-json');
    expect(parse.total).toBe(2);
    expect(parse.exportedAt).toBe('2026-10-02');
    expect(parse.seats.map((seat) => [seat.login, seat.plan, seat.orgs, seat.teams, seat.source])).toEqual([
      ['KofiIto_nwind', 'Enterprise', ['octo-org'], ['platform'], 'api'],
      ['MeiChen_nwind', 'Business', ['octo-org'], ['devs', 'ent:web'], 'api'],
    ]);
  });

  it('counts members without a seat and users the usage report does not show', async () => {
    const store = await storeOf([
      { date: '2026-09-01', user: 'KofiIto_nwind', gross: 5 },
      { date: '2026-09-30', user: 'KofiIto_nwind', gross: 5 },
    ]);
    const metric = (login: string, day: string, extra: Line = {}): Line =>
      recordLine('user-metrics', { day, user_login: login, code_generation_activity_count: 2, ...extra });
    const collection = readLines([
      header(),
      sourceLine('seats', 'ok'),
      sourceLine('members', 'ok'),
      recordLine('seat', seatRecord('KofiIto_nwind', 'octo-org', 'business')),
      recordLine('seat', seatRecord('MeiChen_nwind', 'octo-org', 'business')),
      ...['KofiIto_nwind', 'MeiChen_nwind', 'NoSeat_nwind', 'Another_nwind'].map((login) => recordLine('member', { login })),
      recordLine('seat-summary', { seat_breakdown: { total: 2, inactive_this_cycle: 1 }, seat_management_setting: 'assign_all' }, { target: 'octo-org' }),
      recordLine('seat-summary', { seat_breakdown: { total: 1 }, seat_management_setting: 'assign_selected' }, { target: 'octo-labs' }),
      metric('KofiIto_nwind', '2026-09-10', { used_chat: true }),
      metric('MeiChen_nwind', '2026-09-11', { totals_by_feature: [{ feature: 'code_completion', code_generation_activity_count: 2 }] }),
      metric('Later_nwind', '2026-10-01'),
      recordLine('audit-event', { action: 'copilot.cfb_seat_assignment_created', created_at: '2026-08-03T10:00:00Z' }),
      recordLine('audit-event', { action: 'copilot.cfb_seat_assignment_created', created_at: '2026-09-03T10:00:00Z' }),
      recordLine('audit-event', { action: 'copilot.cfb_seat_cancelled', created_at: '2026-09-04T10:00:00Z' }),
      recordLine('audit-event', { action: 'billing.budget_update', created_at: '2026-09-05T10:00:00Z' }),
    ]);
    const github = deriveGitHub(collection, store);
    expect(github.seats).toMatchObject({ total: 3, inactiveThisCycle: 1, assignAll: ['octo-org'], seatCount: 2, memberCount: 4, membersWithoutSeat: 2 });
    expect(github.seats?.orgs.map((org) => org.org)).toEqual(['octo-labs', 'octo-org']);
    expect(github.activity).toMatchObject({ activeUsers: 3, chatUsers: 1, completionUsers: 1, firstDay: '2026-09-10', lastDay: '2026-10-01' });
    // Later_nwind was active only after the last day of the usage report, so it is not counted as missing from it.
    expect(github.activity?.withoutUsage).toEqual(['MeiChen_nwind']);
    expect(github.audit).toMatchObject({ seatsAdded: 2, seatsRemoved: 1, budgetChanges: 1, months: [{ month: '2026-08', added: 1, removed: 0 }, { month: '2026-09', added: 1, removed: 1 }] });
  });

  it('does not count members without a seat when the member list is incomplete', () => {
    const collection = readLines([
      header(),
      sourceLine('seats', 'ok'),
      sourceLine('members', 'partial'),
      recordLine('seat', seatRecord('KofiIto_nwind', 'octo-org', 'business')),
      recordLine('member', { login: 'NoSeat_nwind' }),
    ]);
    expect(deriveGitHub(collection, emptyStoreLike()).seats).toMatchObject({ memberCount: null, membersWithoutSeat: null });
  });
});

/** A store with no rows, for checks that do not need the usage report. */
function emptyStoreLike() {
  return {
    n: 0,
    minDay: 0,
    maxDay: 0,
    day: new Int32Array(0),
    user: new Int32Array(0),
    org: new Int32Array(0),
    gross: new Float64Array(0),
    discount: new Float64Array(0),
    net: new Float64Array(0),
    qty: new Float64Array(0),
    dicts: { user: { values: [''], index: new Map() }, org: { values: [''], index: new Map() } },
  } as unknown as Parameters<typeof deriveGitHub>[1];
}
