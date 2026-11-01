import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyLocale } from '../src/i18n/core';
import { budgetMap, budgetOverview, deriveGitHub, limitBoard } from '../src/lib/collection';
import { buildStore } from '../src/lib/csv/ingest';
import { UserLimitBlock } from '../src/components/user/UserLimitBlock';
import { limitKindLabel } from '../src/pages/budgets/levels';
import { BudgetPaceCard } from '../src/pages/budgets/BudgetPaceCard';
import BudgetsPage from '../src/pages/BudgetsPage';
import { Board } from '../src/pages/budgets/limitMap/Board';
import { GitHubDataCard } from '../src/pages/data/GitHubDataCard';
import { GitHubBilling } from '../src/pages/spend/GitHubBilling';
import { sourceName } from '../src/pages/githubText';
import { END, budgetRecord, header, readLines, recordLine, seatRecord, sourceLine } from './collectionLines';
import { makeCsv } from './helpers';

const state = vi.hoisted(() => ({
  analysis: {} as Record<string, unknown>,
  option: {} as { xAxis?: { data: string[] }; series?: { markPoint?: { data: { coord: number[] }[] }; data: (number | null)[] }[] },
}));

vi.mock('../src/state/analysis', () => ({ useAnalysis: () => state.analysis }));
vi.mock('../src/pages/budgets/limitMap/LimitMapCard', () => ({ LimitMapCard: () => 'Limit map test marker' }));
vi.mock('../src/state/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/state/store')>();
  return {
    ...actual,
    useApp: <Value>(selector: (store: ReturnType<typeof actual.useApp.getState>) => Value) =>
      selector({ ...actual.useApp.getState(), collection: state.analysis.collection as ReturnType<typeof actual.useApp.getState>['collection'] }),
  };
});
vi.mock('../src/components/charts/EChart', () => ({
  useChartColors: () => ({ accent: '#0969da', bad: '#cf222e', info: '#0969da', text: '#1f2328', textMuted: '#59636e', surface: '#ffffff' }),
  EChart: ({ option }: { option: typeof state.option }) => {
    state.option = option;
    return null;
  },
}));

afterEach(() => {
  applyLocale('en', {});
  state.option = {};
});

async function setup(amount: number | null, status = 'ok', usageMonth = '2026-10') {
  const store = await buildStore([{ name: 'usage.csv', data: makeCsv([{ date: `${usageMonth}-02`, user: 'mona', gross: 10, discount: 10, net: 0 }]) }]);
  const collection = readLines([
    header({ months: ['2026-10'], startedAt: '2026-10-11T08:00:00Z' }),
    ...(amount === null ? [] : [recordLine('budget', budgetRecord('own', { budget_scope: 'user', budget_entity_name: 'mona', user: 'mona', budget_amount: amount, consumed_amount: 0 }))]),
    sourceLine('budgets', status),
    END,
  ]);
  state.analysis = { github: deriveGitHub(collection, store), collection, store, dataset: { sample: false }, analysis: { budgetSource: 'settings' } };
  return { collection, store };
}

describe('budget UI', () => {
  it('uses the current limit names and a readable usage report source name', () => {
    expect(['own', 'cost-center', 'universal'].map((kind) => limitKindLabel(kind as Parameters<typeof limitKindLabel>[0]))).toEqual([
      'Individual limit', 'Cost center default', 'Universal default',
    ]);
    expect(sourceName('usage-report')).toBe('AI usage report');
  });

  it('anchors a GitHub snapshot and projection to the last completed day and localizes labels', async () => {
    await setup(100);
    applyLocale('ar', {});
    renderToStaticMarkup(createElement(UserLimitBlock, { login: 'mona', name: 'Mona' }));
    expect(state.option.xAxis?.data.slice(0, 3)).toEqual(['١', '٢', '٣']);
    expect(state.option.series?.[0].markPoint?.data[0].coord).toEqual([9, 0]);
    expect(state.option.series?.[1].data[9]).toBe(0);
  });

  it('shows the GitHub snapshot even when the report covers another month', async () => {
    await setup(100, 'ok', '2026-09');
    renderToStaticMarkup(createElement(UserLimitBlock, { login: 'mona', name: 'Mona' }));
    expect(state.option.series?.[0].markPoint?.data[0].coord).toEqual([9, 0]);
    expect(state.option.series?.[1].data[9]).toBe(0);
  });

  it('localizes the budget pace chart day labels too', async () => {
    const { collection, store } = await setup(100);
    collection.budgets.push({ ...collection.budgets[0], id: 'enterprise', scope: 'enterprise', user: undefined, entity: 'octocorp' });
    applyLocale('ar', {});
    renderToStaticMarkup(createElement(BudgetPaceCard, { collection, store, overview: budgetOverview(collection, store) }));
    expect(state.option.xAxis?.data.slice(0, 3)).toEqual(['١', '٢', '٣']);
  });

  it('calls a zero limit reached even with zero usage', async () => {
    await setup(0);
    expect(renderToStaticMarkup(createElement(UserLimitBlock, { login: 'mona', name: 'Mona' }))).toContain('Already reached');
  });

  it('does not claim that an unidentified limit means unlimited usage', async () => {
    await setup(null);
    const html = renderToStaticMarkup(createElement(UserLimitBlock, { login: 'mona', name: 'Mona' }));
    expect(html).toContain('This file cannot identify the user limit that applies.');
    expect(html).not.toContain('GitHub has no limit');
  });

  it('distinguishes budgets that could not be read from no budgets', async () => {
    await setup(null, 'failed');
    const html = renderToStaticMarkup(createElement(GitHubBilling));
    expect(html).toContain('The budgets could not be read in full. The Data page says why.');
    expect(html).not.toContain('The file has no budget for GitHub Copilot.');
  });

  it('does not call missing failed budgets unbounded on the Budgets page', async () => {
    await setup(null, 'failed');
    const html = renderToStaticMarkup(createElement(BudgetsPage));
    expect(html).toContain('The budgets could not be read in full. The Data page says why.');
    expect(html).not.toContain('Nothing limits the amount billed on top of seats.');
  });

  it('withholds the map for a file covering several organizations', async () => {
    const { collection, store } = await setup(100);
    expect(renderToStaticMarkup(createElement(BudgetsPage))).toContain('Limit map test marker');
    collection.header.scope = 'organization';
    collection.header.organizations = ['octo-apps', 'octo-data'];
    state.analysis = { ...state.analysis, github: deriveGitHub(collection, store) };
    expect(renderToStaticMarkup(createElement(BudgetsPage))).not.toContain('Limit map test marker');
  });

  it('does not call alert-only budgets absent when there is no stopping gauge', async () => {
    const { collection, store } = await setup(100);
    collection.budgets.push({ ...collection.budgets[0], id: 'alert', scope: 'enterprise', user: undefined, entity: 'octocorp', stopsUsage: false });
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.top.wall).toBeNull();
    const html = renderToStaticMarkup(createElement(Board, {
      board, shares: new Float32Array(board.users.length), day: null, target: { kind: 'all' }, focus: null, highlight: null,
      openLanes: new Set<number>(), onOpenLane: () => {}, choose: () => {},
    }));
    expect(html).toContain('Only alert budgets are set here. They do not stop usage.');
    expect(html).not.toContain('No spending limit is set here.');
  });

  it('fills capacity strips from the smallest stopping budget, not an alert or a larger binding budget', async () => {
    const { collection } = await setup(100);
    const store = await buildStore([{ name: 'usage.csv', data: makeCsv([{ date: '2026-10-02', user: 'mona', costCenter: 'Mobile', gross: 10, discount: 10, net: 0 }]) }]);
    collection.budgets.push(
      { ...collection.budgets[0], id: 'mobile-stop', scope: 'cost_center', user: undefined, entity: 'Mobile', amount: 100, consumed: 20, stopsUsage: true },
      { ...collection.budgets[0], id: 'mobile-alert', scope: 'cost_center', user: undefined, entity: 'Mobile', amount: 10, consumed: 9, stopsUsage: false },
      { ...collection.budgets[0], id: 'mobile-tight', scope: 'cost_center', user: undefined, entity: 'Mobile', amount: 500, consumed: 490, stopsUsage: true },
    );
    const board = limitBoard(collection, store, budgetMap(collection, store));
    expect(board.lanes.find((lane) => lane.name === 'Mobile')?.gauge?.budget.id).toBe('mobile-tight');
    const html = renderToStaticMarkup(createElement(Board, {
      board, shares: new Float32Array(board.users.length), day: null, target: { kind: 'all' }, focus: null, highlight: null,
      openLanes: new Set<number>(), onOpenLane: () => {}, choose: () => {},
    }));
    expect(html).toMatch(/data-tip="Mobile\s\$100, 20% used"/);
  });

  it('mentions seats added only when the file actually contains seats', async () => {
    const { collection, store } = await setup(100);
    expect(renderToStaticMarkup(createElement(GitHubDataCard))).not.toContain('Its seats were added to your license list.');
    collection.seats.push(readLines([header(), recordLine('seat', seatRecord('mona', 'octo-apps', 'business')), END]).seats[0]);
    state.analysis = { ...state.analysis, github: deriveGitHub(collection, store) };
    expect(renderToStaticMarkup(createElement(GitHubDataCard))).toContain('Its seats were added to your license list.');
  });
});
