import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';
import { RecommendationCard } from '../src/components/RecommendationCard';
import type { Analysis } from '../src/lib/analytics/analyze';
import { emptyFilters, type Filters } from '../src/lib/analytics/filters';
import { DEFAULT_LEVERS } from '../src/lib/analytics/levers';
import type { Settings } from '../src/lib/analytics/settings';
import {
  buildHeadline,
  buildRecommendations,
  DOCS,
  recDocId,
  recValue,
  SEVERITY_ORDER,
  type RecContext,
  type Recommendation,
  type Severity,
} from '../src/lib/analytics/recommendations';
import { cashSaving, monthInputs } from '../src/lib/analytics/simulator';
import { userTips } from '../src/lib/analytics/tips';
import { ENGAGEMENT_IDS, LIFECYCLE_IDS, PARETO_IDS, PERSONA_IDS, PROFILE_IDS, TIER_IDS, TRAIT_IDS, type UserProfile } from '../src/lib/analytics/users';
import { metricDoc } from '../src/lib/metrics/registry';
import { PlaybookTab } from '../src/pages/recommendations/PlaybookTab';
import { sortRecs } from '../src/pages/recommendations/recFilters';
import { DEFAULT_SEAT_FLAGS, LEVER_DOC, SEAT_DOC, cashHiddenReason, poolUnknownReason } from '../src/pages/recommendations/scenario';
import { SeatsTab } from '../src/pages/recommendations/SeatsTab';
import { SimulatorTab } from '../src/pages/recommendations/SimulatorTab';
import { AnalysisProvider } from '../src/state/analysis';
import { CATEGORIES } from '../src/lib/types';
import { analyzeFixtures, FIXTURE_A, FIXTURE_B, readFixture } from './fixtures';
import {
  analysisTexts,
  analyzeCsv,
  analyzeDemo,
  BAD_TEXT,
  dayNum,
  groupSum,
  isAutoRow,
  makeCsv,
  naiveRows,
  numOf,
  pipelineOf,
  sum,
  type NaiveRow,
  type Pipeline,
  type RowSpec,
} from './helpers';
import { agreementCsv, longRow, septemberDate, SEP_WEEKDAYS, SEPTEMBER, spread, terra } from './scenarios';
import { END, budgetRecord, creditLine, header, readLines, recordLine, sourceLine, type Line } from './collectionLines';

const CASES = [
  'fixture A',
  'fixture B',
  'A + B',
  'demo',
  'demo last 20 days',
  'demo one model',
  'demo one org',
  'demo runaway segment',
  'demo with roster and budget',
  'A with $100 budget',
] as const;
type CaseName = (typeof CASES)[number];

const PIPELINES = {} as Record<CaseName, Pipeline>;
let demoCsv = '';

beforeAll(async () => {
  PIPELINES['fixture A'] = await analyzeFixtures([FIXTURE_A]);
  PIPELINES['fixture B'] = await analyzeFixtures([FIXTURE_B]);
  PIPELINES['A + B'] = await analyzeFixtures([FIXTURE_A, FIXTURE_B]);
  const demo = await analyzeDemo();
  demoCsv = demo.demo.csv;
  PIPELINES.demo = demo;
  const { store } = demo;
  PIPELINES['demo last 20 days'] = pipelineOf(store, { filters: { dateFrom: store.maxDay - 19 } });
  PIPELINES['demo one model'] = pipelineOf(store, { filters: { models: ['GPT-6 Astra'] } });
  PIPELINES['demo one org'] = pipelineOf(store, { filters: { orgs: ['northwind-data'] } });
  PIPELINES['demo runaway segment'] = pipelineOf(store, { filters: { tiers: ['runaway'] } });
  PIPELINES['demo with roster and budget'] = pipelineOf(store, {
    settings: { budgetMonthlyBilled: 120, roster: [{ user: 'seat-without-usage', plan: 'Enterprise' }] },
  });
  PIPELINES['A with $100 budget'] = await analyzeFixtures([FIXTURE_A], { settings: { budgetMonthlyBilled: 100 } });
});

const SEVERITIES = Object.keys(SEVERITY_ORDER) as Severity[];
const THEMES = ['cost', 'pool', 'efficiency', 'adoption', 'governance', 'data'];
const AUDIENCES = ['management', 'admin', 'user'];
const CONFIDENCES = ['high', 'medium', 'low'];
const PAGES = ['overview', 'spend', 'users', 'segments', 'models', 'efficiency', 'organization', 'patterns', 'recommendations', 'data', 'settings'];
const POOL_RECS = ['pool-exhaustion', 'pool-underuse', 'idle-seats', 'downgrade', 'healthy'];
const DISCLAIMER = 'The report covers AI-credit usage only. Code completions and next edit suggestions are not included.';

const VALID_VALUES: Record<string, readonly string[]> = {
  segments: PERSONA_IDS,
  tiers: TIER_IDS,
  engagement: [...ENGAGEMENT_IDS, ...LIFECYCLE_IDS],
  profiles: PROFILE_IDS,
  traits: TRAIT_IDS,
  paretoClasses: PARETO_IDS,
  categories: CATEGORIES,
  selection: ['all', 'auto', 'manual'],
  billing: ['all', 'covered', 'billed'],
  attribution: ['all', 'attributed', 'unattributed'],
};

const ids = (analysis: Analysis): string[] => analysis.recs.map((recommendation) => recommendation.id);
const findRecommendation = (analysis: Analysis, id: string): Recommendation => {
  const recommendation = analysis.recs.find((candidate) => candidate.id === id);
  if (!recommendation) throw new Error(`no "${id}" recommendation; got ${ids(analysis).join(', ')}`);
  return recommendation;
};
const formatUsd = (amount: number): string => `$${Math.round(amount).toLocaleString('en-US')}`;
const plural = (count: number, one: string): string => `${count} ${count === 1 ? one : `${one}s`}`;

const ctxOf = (pipeline: Pipeline, over: Partial<RecContext> = {}): RecContext => {
  const analysis = pipeline.analysis;
  return {
    store: pipeline.store,
    models: pipeline.models,
    agg: analysis.agg,
    mask: analysis.mask,
    users: analysis.users,
    pool: analysis.pool,
    seats: analysis.seats,
    levers: analysis.levers,
    anomalies: analysis.anomalies,
    trend: analysis.trend,
    settings: pipeline.settings,
    narrowed: analysis.narrowed,
    coverage: analysis.coverage,
    auto: analysis.auto,
    ...over,
  };
};

/** Expected title of the count-based recommendations, written without the library's pluralize/verb helpers. */
const COUNT_TITLES: Record<string, (count: number) => string> = {
  runaway: (count) => `${plural(count, 'user')} used at least 3× their included credits`,
  lapsed: (count) => `${plural(count, 'user')} stopped using AI credits`,
  'new-users': (count) => `${plural(count, 'new user')} started in the last 14 days`,
  champions: (count) => `${plural(count, 'champion')} ${count === 1 ? 'uses' : 'use'} GitHub Copilot often and heavily`,
  spiky: (count) => `${plural(count, 'user')} ${count === 1 ? 'concentrates' : 'concentrate'} their usage on a single day`,
  'multi-org': (count) => `${plural(count, 'user')} ${count === 1 ? 'bills' : 'bill'} to more than one organization`,
  'cost-center-coverage': (count) => `${plural(count, 'user')} ${count === 1 ? 'is' : 'are'} not assigned to a cost center`,
  downgrade: (count) => `${plural(count, 'Enterprise user')} never needed more than the Business allotment`,
};

describe.each(CASES)('recommendation invariants: %s', (name) => {
  const pipe = (): Pipeline => PIPELINES[name];
  const analysisOf = (): Analysis => PIPELINES[name].analysis;

  it('has unique ids and exactly one data-notes entry', () => {
    const recommendations = analysisOf().recs;
    expect(recommendations.length).toBeGreaterThan(0);
    expect(new Set(recommendations.map((recommendation) => recommendation.id)).size).toBe(recommendations.length);
    expect(recommendations.filter((recommendation) => recommendation.id === 'data-notes')).toHaveLength(1);
  });

  it('every recommendation is complete and uses the allowed vocabularies', () => {
    for (const recommendation of analysisOf().recs) {
      expect(recommendation.id, 'id').toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(recommendation.title.trim(), `${recommendation.id} title`).not.toBe('');
      expect(recommendation.summary.trim(), `${recommendation.id} summary`).not.toBe('');
      if (recommendation.id !== 'data-notes') expect(recommendation.actions.length, `${recommendation.id} actions`).toBeGreaterThan(0);
      for (const line of [...recommendation.evidence, ...recommendation.actions]) expect(line.trim(), `${recommendation.id} line`).not.toBe('');
      expect(SEVERITIES, `${recommendation.id} severity`).toContain(recommendation.severity);
      expect(THEMES, `${recommendation.id} theme`).toContain(recommendation.theme);
      expect(recommendation.audience.length, `${recommendation.id} audience`).toBeGreaterThan(0);
      for (const audience of recommendation.audience) expect(AUDIENCES, `${recommendation.id} audience`).toContain(audience);
      expect(CONFIDENCES, `${recommendation.id} confidence`).toContain(recommendation.confidence);
      expect(typeof recommendation.cashLowerBound, `${recommendation.id} cashLowerBound`).toBe('boolean');
    }
  });

  it('impact and cash are finite and non-negative, and cash never exceeds impact', () => {
    for (const recommendation of analysisOf().recs) {
      expect(Number.isFinite(recommendation.impactUsd), `${recommendation.id} impact`).toBe(true);
      expect(Number.isFinite(recommendation.cashUsd), `${recommendation.id} cash`).toBe(true);
      expect(recommendation.impactUsd, `${recommendation.id} impact`).toBeGreaterThanOrEqual(0);
      expect(recommendation.cashUsd, `${recommendation.id} cash`).toBeGreaterThanOrEqual(0);
      expect(recommendation.cashUsd, `${recommendation.id} cash vs impact`).toBeLessThanOrEqual(recommendation.impactUsd + 1e-6);
      expect(Number.isInteger(recommendation.affectedCount) && recommendation.affectedCount >= 0, `${recommendation.id} affectedCount`).toBe(true);
    }
  });

  it('is sorted by monthly value, largest first, then by severity', () => {
    const recommendations = analysisOf().recs;
    for (let i = 1; i < recommendations.length; i++) {
      const prev = recommendations[i - 1];
      const next = recommendations[i];
      expect(recValue(prev), `${prev.id} before ${next.id}`).toBeGreaterThanOrEqual(recValue(next));
      if (recValue(prev) === recValue(next)) expect(SEVERITY_ORDER[prev.severity], `${prev.id} before ${next.id}`).toBeLessThanOrEqual(SEVERITY_ORDER[next.severity]);
    }
    expect(sortRecs(recommendations, 'value').map((recommendation) => recommendation.id)).toEqual(recommendations.map((recommendation) => recommendation.id));
  });

  it('never shows NaN, undefined, Infinity or [object] to the user', () => {
    for (const text of analysisTexts(analysisOf())) expect(text).not.toMatch(BAD_TEXT);
  });

  it('has a headline that agrees with the severities', () => {
    const analysis = analysisOf();
    const severities = analysis.recs.map((recommendation) => recommendation.severity);
    const urgent = severities.filter((severity) => severity === 'critical' || severity === 'high').length;
    const watch = severities.filter((severity) => severity === 'medium').length;
    const net = analysis.agg.totals.net;
    const headline = analysis.headline;
    if (urgent > 0) {
      expect(headline.status).toBe('action');
      const actions = `${urgent} high-priority action${urgent === 1 ? '' : 's'}`;
      expect(headline.title).toBe(net > 0.005 ? `${formatUsd(net)} billed overage and ${actions}` : actions);
    } else if (watch > 0) {
      expect(headline.status).toBe('watch');
      expect(headline.title).toBe(`No urgent issues, ${watch} item${watch === 1 ? '' : 's'} worth a look`);
    } else {
      expect(headline.status).toBe('healthy');
      expect(headline.title).toBe('Usage looks healthy');
    }
    const userCount = analysis.users.profiles.length;
    const poolPart = !analysis.narrowed && !analysis.pool.capacityExceeded ? 'Pool utilization \\d+% · ' : '';
    expect(headline.detail).toMatch(new RegExp(`^${poolPart}Auto \\d+% of usage · ${userCount} active users?$`));
    expect(headline.detail.endsWith(userCount === 1 ? '1 active user' : `${userCount} active users`)).toBe(true);
  });

  it('lists affected users that exist in the analysed scope', () => {
    const analysis = analysisOf();
    for (const recommendation of analysis.recs) {
      expect(recommendation.affected.length, `${recommendation.id} affected`).toBeLessThanOrEqual(12);
      expect(new Set(recommendation.affected.map((affectedUser) => affectedUser.id)).size, `${recommendation.id} affected ids`).toBe(recommendation.affected.length);
      for (const affectedUser of recommendation.affected) {
        const profile = analysis.users.byId.get(affectedUser.id);
        expect(profile, `${recommendation.id}: affected user ${affectedUser.name}`).toBeDefined();
        expect(profile!.name).toBe(affectedUser.name);
      }
    }
  });

  it('links only to official GitHub Copilot documentation', () => {
    const known = new Set(Object.values(DOCS).map((link) => `${link.label}|${link.url}`));
    for (const recommendation of analysisOf().recs) {
      for (const link of recommendation.docs ?? []) {
        expect(link.url, `${recommendation.id} docs`).toMatch(/^https:\/\/docs\.github\.com\/en\/copilot\//);
        expect(known.has(`${link.label}|${link.url}`), `${recommendation.id}: ${link.label}`).toBe(true);
      }
    }
  });

  it('data-notes is informational, has no actions and carries the AI-credit disclaimer', () => {
    const dataNotes = findRecommendation(analysisOf(), 'data-notes');
    expect(dataNotes.severity).toBe('info');
    expect(dataNotes.theme).toBe('data');
    expect(dataNotes.actions).toEqual([]);
    expect(dataNotes.evidence).toContain(DISCLAIMER);
    expect(dataNotes.jump?.page).toBe('data');
  });

  it('jump targets are valid pages and valid filter patches', () => {
    const empty = emptyFilters() as unknown as Record<string, unknown>;
    for (const recommendation of analysisOf().recs) {
      if (!recommendation.jump) continue;
      expect(PAGES, `${recommendation.id} page`).toContain(recommendation.jump.page);
      expect(recommendation.jump.label.trim(), `${recommendation.id} jump label`).not.toBe('');
      for (const [filterKey, filterValue] of Object.entries(recommendation.jump.filters ?? {})) {
        expect(Object.keys(empty), `${recommendation.id}: unknown filter "${filterKey}"`).toContain(filterKey);
        const base = empty[filterKey];
        const allowed = VALID_VALUES[filterKey];
        if (Array.isArray(base)) {
          expect(Array.isArray(filterValue), `${recommendation.id}.${filterKey}`).toBe(true);
          expect((filterValue as unknown[]).length, `${recommendation.id}.${filterKey}`).toBeGreaterThan(0);
          if (allowed) for (const option of filterValue as string[]) expect(allowed, `${recommendation.id}.${filterKey}`).toContain(option);
        } else if (base === null) {
          expect(typeof filterValue, `${recommendation.id}.${filterKey}`).toBe('number');
          expect(Number.isFinite(filterValue as number), `${recommendation.id}.${filterKey}`).toBe(true);
        } else {
          expect(typeof filterValue, `${recommendation.id}.${filterKey}`).toBe(typeof base);
          if (allowed) expect(allowed, `${recommendation.id}.${filterKey}`).toContain(filterValue as string);
        }
      }
    }
  });

  it('every jump filter patch can be analysed and still finds rows', () => {
    for (const recommendation of analysisOf().recs) {
      if (!recommendation.jump?.filters) continue;
      const filteredAnalysis = pipe().run({ ...emptyFilters(), ...recommendation.jump.filters });
      expect(filteredAnalysis.agg.totals.rows, `${recommendation.id}: "${recommendation.jump.label}" finds nothing`).toBeGreaterThan(0);
    }
  });

  it('count-based titles agree with the number of users and use the right verb form', () => {
    for (const recommendation of analysisOf().recs) {
      const expected = COUNT_TITLES[recommendation.id];
      if (expected) expect(recommendation.title, recommendation.id).toBe(expected(recommendation.affectedCount));
    }
  });

  it('can be rebuilt from the analysis context and is deterministic', () => {
    const pipeline = pipe();
    const analysis = analysisOf();
    const recommendations = buildRecommendations(ctxOf(pipeline));
    expect(recommendations).toEqual(analysis.recs);
    expect(buildHeadline(ctxOf(pipeline), recommendations)).toEqual(analysis.headline);
    expect(pipeline.run().recs).toEqual(analysis.recs);
  });

  it('marks cash as a lower bound exactly when the scope is narrowed or has no pool months', () => {
    const analysis = analysisOf();
    const poolWhole = !analysis.narrowed && monthInputs(analysis.pool).length > 0;
    for (const recommendation of analysis.recs) expect(recommendation.cashLowerBound, recommendation.id).toBe(!poolWhole);
  });
});

describe('pool-used fixture: a drained pool and one runaway user', () => {
  const analysis = (): Analysis => PIPELINES['fixture A'].analysis;

  it('contains the rules that apply and none that do not', () => {
    const severityById = Object.fromEntries(analysis().recs.map((recommendation) => [recommendation.id, recommendation.severity]));
    expect(severityById).toMatchObject({
      overage: 'high',
      'pool-exhaustion': 'high',
      runaway: 'high',
      'model-rightsizing': 'medium',
      'new-users': 'positive',
      'data-notes': 'info',
    });
    for (const id of ['trend-up', 'trend-down', 'pool-underuse', 'idle-seats', 'downgrade', 'healthy', 'budgets', 'unattributed', 'multi-org']) {
      expect(ids(analysis()), id).not.toContain(id);
    }
  });

  it('describes the billed overage from independent numbers', () => {
    const rows = naiveRows(readFixture(FIXTURE_A));
    const columnTotal = (name: string, who?: string): number => sum(rows.filter((row) => !who || row.username === who).map((row) => numOf(row, name)));
    const [gross, covered, billed] = [columnTotal('gross_amount'), columnTotal('discount_amount'), columnTotal('net_amount')];
    const overage = findRecommendation(analysis(), 'overage');
    expect(overage.title).toBe(`${formatUsd(billed)} was billed beyond included credits`);
    expect(overage.summary).toMatch(new RegExp(`^${Math.round((100 * billed) / gross)}% of usage was billed as overage`));
    expect(overage.evidence[0]).toBe(`Usage ${formatUsd(gross)}: ${formatUsd(covered)} covered by the pool, ${formatUsd(billed)} billed.`);
    expect(overage.evidence[1]).toBe(`alex-dev: ${formatUsd(columnTotal('net_amount', 'alex-dev'))} billed (100% of all overage), ${Math.round((100 * columnTotal('gross_amount', 'alex-dev')) / 39)}% of their own allotment.`);
    expect(overage.impactUsd).toBe(0);
    expect(overage.cashUsd).toBe(0);
  });

  it('counts the users with a billed amount from the raw CSV, largest first', () => {
    const rows = naiveRows(readFixture(FIXTURE_A));
    const billed = [...groupSum(rows, (row) => row.username, (row) => numOf(row, 'net_amount')).entries()].filter(([, netAmount]) => netAmount > 0).sort((first, second) => second[1] - first[1]);
    const overage = findRecommendation(analysis(), 'overage');
    expect(overage.affectedCount).toBe(billed.length);
    expect(overage.affected.map((affectedUser) => affectedUser.name)).toEqual(billed.map(([username]) => username));
  });

  it('dates the pool exhaustion and projects the overage with an ordered range', () => {
    const poolExhaustion = findRecommendation(analysis(), 'pool-exhaustion');
    expect(poolExhaustion.title).toBe('The shared pool runs out before month end');
    expect(poolExhaustion.evidence).toContain('Oct 2026: pool used up on Oct 3 (day 3 of 31).');
    const line = poolExhaustion.evidence.find((evidenceLine) => evidenceLine.includes('projected billed overage'))!;
    const match = /^Oct 2026: projected billed overage \$([\d,]+) \(range \$([\d,]+) to \$([\d,]+)\)\.$/.exec(line);
    expect(match, line).not.toBeNull();
    const [mid, low, high] = [match![1], match![2], match![3]].map((amountText) => Number(amountText.replace(/,/g, '')));
    expect(mid).toBe(158);
    expect(low).toBeLessThanOrEqual(mid);
    expect(high).toBeGreaterThanOrEqual(mid);
    expect(poolExhaustion.impactUsd).toBe(0);
  });

  it('flags the runaway user and the new user', () => {
    const run = findRecommendation(analysis(), 'runaway');
    expect(run.title).toBe('1 user used at least 3× their included credits');
    expect(run.affected.map((affectedUser) => affectedUser.name)).toEqual(['alex-dev']);
    expect(run.cashUsd).toBeGreaterThan(0);
    const fresh = findRecommendation(analysis(), 'new-users');
    expect(fresh.title).toBe('1 new user started in the last 14 days');
    expect(fresh.affected.map((affectedUser) => affectedUser.name)).toEqual(['sam-lee']);
  });

  it('puts the powerful-model share and the headline in plain numbers', () => {
    const totals = analysis().agg.totals;
    const share = totals.tierGross[CATEGORIES.indexOf('Powerful')] / totals.gross;
    expect(findRecommendation(analysis(), 'model-rightsizing').title).toBe(`${Math.round(share * 100)}% of usage runs on Powerful models`);
    expect(analysis().headline).toMatchObject({ status: 'action', title: '$93 billed overage and 3 high-priority actions' });
    expect(analysis().headline.detail).toMatch(/^Pool utilization 100% · Auto \d+% of usage · 2 active users$/);
  });

  it('notes that the included credits are a lower bound', () => {
    expect(findRecommendation(analysis(), 'data-notes').evidence[0]).toMatch(/^The current estimate only includes users in this report\./);
  });
});

describe('partial-export fixture: everything covered by a pool larger than the visible seat', () => {
  const analysis = (): Analysis => PIPELINES['fixture B'].analysis;

  it('has an unknown pool size and therefore no pool statements', () => {
    expect(analysis().pool.capacityExceeded).toBe(true);
    expect(analysis().pool.utilization).toBeNaN();
    for (const id of [...POOL_RECS, 'overage', 'budgets', 'trend-up']) expect(ids(analysis()), id).not.toContain(id);
    for (const text of analysisTexts(analysis())) expect(text).not.toMatch(/Pool utilization|NaN|undefined|Infinity/);
  });

  it('recommends the efficiency rules that apply', () => {
    const severityById = Object.fromEntries(analysis().recs.map((recommendation) => [recommendation.id, recommendation.severity]));
    expect(severityById).toMatchObject({
      runaway: 'medium',
      'model-rightsizing': 'medium',
      'auto-adoption': 'medium',
      'long-context': 'medium',
      anomalies: 'medium',
      context: 'low',
      spiky: 'low',
      'trend-down': 'info',
      'data-notes': 'info',
    });
  });

  it('values every saving at zero cash, because nothing is billed', () => {
    for (const recommendation of analysis().recs) expect(recommendation.cashUsd, recommendation.id).toBeLessThan(0.01);
    expect(analysis().agg.totals.net).toBe(0);
  });

  it('quotes the long-context surcharge, the Auto share and the spikes', () => {
    const totals = analysis().agg.totals;
    expect(findRecommendation(analysis(), 'long-context').title).toBe(`Long-context surcharges cost at least ${formatUsd(totals.longPremium)}`);
    expect(findRecommendation(analysis(), 'long-context').evidence[0]).toBe('4 requests were billed at the long-context rate.');
    expect(findRecommendation(analysis(), 'long-context').evidence[1]).toMatch(/^Mostly on GPT-6 Astra \(\$123\)/);
    expect(findRecommendation(analysis(), 'auto-adoption').title).toBe('Only 0% of usage goes through Auto model selection');
    expect(findRecommendation(analysis(), 'anomalies').title).toBe('3 days with unusually high usage');
    expect(findRecommendation(analysis(), 'anomalies').summary).toBe('The biggest, Oct 16, 2026, reached 25× a typical day.');
    expect(findRecommendation(analysis(), 'trend-down').title).toBe('Usage dropped 54% week over week');
  });

  it('has a watch headline without a pool part, and explains why the pool is hidden', () => {
    const covered = sum(naiveRows(readFixture(FIXTURE_B)).map((row) => numOf(row, 'discount_amount')));
    expect(analysis().headline).toEqual({ status: 'watch', title: 'No urgent issues, 5 items worth a look', detail: 'Auto 0% of usage · 1 active user' });
    expect(findRecommendation(analysis(), 'data-notes').evidence[0]).toMatch(new RegExp(`^The pool covered \\${formatUsd(covered)}, more than the \\$39 that the seats in this file fund\\.`));
  });
});

describe('both fixtures (two billing entities in one scope)', () => {
  const analysis = (): Analysis => PIPELINES['A + B'].analysis;

  it('reports the real billed overage and hides the pool size', () => {
    const rows = [...naiveRows(readFixture(FIXTURE_A)), ...naiveRows(readFixture(FIXTURE_B))];
    const billed = sum(rows.map((row) => numOf(row, 'net_amount')));
    const covered = sum(rows.map((row) => numOf(row, 'discount_amount')));
    expect(analysis().pool.capacityExceeded).toBe(true);
    expect(findRecommendation(analysis(), 'overage').title).toBe(`${formatUsd(billed)} was billed beyond included credits`);
    expect(findRecommendation(analysis(), 'overage').severity).toBe('medium');
    for (const id of ['pool-underuse', 'idle-seats', 'downgrade', 'healthy']) expect(ids(analysis()), id).not.toContain(id);
    expect(analysis().headline.detail).not.toMatch(/Pool utilization/);
    expect(findRecommendation(analysis(), 'data-notes').evidence[0]).toMatch(new RegExp(`^The pool covered \\${formatUsd(covered)}, more than the \\$97 that the seats in this file fund\\.`));
  });

  it('still recommends what does not depend on the pool size', () => {
    expect(ids(analysis())).toEqual(expect.arrayContaining(['runaway', 'model-rightsizing', 'long-context', 'anomalies', 'group-balance']));
  });
});

describe('demo dataset: the designed story', () => {
  const analysis = (): Analysis => PIPELINES.demo.analysis;
  /** The parts of the story that only show in one month or in the small organization. */
  const story = {} as Record<'august' | 'september' | 'october' | 'labs', Analysis>;

  beforeAll(() => {
    const monthOf = (from: string, to: string): Analysis => PIPELINES.demo.run({ ...emptyFilters(), dateFrom: dayNum(from), dateTo: dayNum(to) });
    story.august = monthOf('2026-08-01', '2026-08-31');
    story.september = monthOf('2026-09-01', '2026-09-30');
    story.october = monthOf('2026-10-01', '2026-10-31');
    story.labs = PIPELINES.demo.run({ ...emptyFilters(), orgs: ['northwind-labs'] });
  });

  it('contains every rule the demo is built to show', () => {
    expect(ids(analysis())).toEqual(
      expect.arrayContaining([
        'runaway',
        'overage',
        'pool-exhaustion',
        'budgets',
        'trend-up',
        'idle-seats',
        'downgrade',
        'cost-center-coverage',
        'unattributed',
        'model-rightsizing',
        'auto-adoption',
        'long-context',
        'multi-org',
        'lapsed',
        'new-users',
        'champions',
        'spiky',
        'anomalies',
        'cache',
        'context',
        'data-notes',
      ]),
    );
    for (const id of ['healthy', 'pool-underuse', 'trend-down', 'concentration', 'group-balance', 'data-coverage']) expect(ids(analysis()), id).not.toContain(id);
  });

  it('shows the rest of the story through the month and organization filters', () => {
    expect(story.august.pool.billed).toBe(0);
    expect(ids(story.august)).toEqual(expect.arrayContaining(['pool-underuse', 'group-balance']));
    expect(ids(story.august)).not.toContain('overage');
    expect(story.september.pool.billed).toBeCloseTo(analysis().pool.billed, 6);
    expect(ids(story.september)).toEqual(expect.arrayContaining(['overage', 'pool-exhaustion', 'trend-down']));
    expect(story.october.pool.billed).toBe(0);
    expect(ids(story.october)).toContain('healthy');
    expect(ids(story.october)).not.toContain('pool-exhaustion');
    expect(story.october.recs.filter((recommendation) => recommendation.severity === 'critical' || recommendation.severity === 'high').map((recommendation) => recommendation.id)).toEqual([]);
    expect(ids(story.labs)).toContain('concentration');
    const shown = new Set([analysis(), ...Object.values(story)].flatMap(ids));
    // The rules that need the GitHub data file, and the rule about missing columns, need other files.
    expect(RULE_IDS.filter((id) => !shown.has(id))).toEqual(['budget-no-stop', 'budget-stop-ahead', 'user-budget-reached', 'report-gap', 'seat-auto-assign', 'data-coverage']);
  });

  it('assigns the expected severities', () => {
    const severityById = Object.fromEntries(analysis().recs.map((recommendation) => [recommendation.id, recommendation.severity]));
    expect(severityById).toMatchObject({
      runaway: 'high',
      overage: 'high',
      'pool-exhaustion': 'high',
      budgets: 'high',
      'trend-up': 'high',
      'model-rightsizing': 'medium',
      'auto-adoption': 'medium',
      'long-context': 'medium',
      downgrade: 'medium',
      'idle-seats': 'medium',
      'cost-center-coverage': 'low',
      unattributed: 'low',
      'multi-org': 'low',
      lapsed: 'low',
      spiky: 'low',
      anomalies: 'low',
      context: 'low',
      cache: 'low',
      'data-notes': 'info',
      'new-users': 'positive',
      champions: 'positive',
    });
    expect(analysis().headline).toMatchObject({ status: 'action', title: '$523 billed overage and 5 high-priority actions' });
    expect(findRecommendation(story.august, 'pool-underuse').severity).toBe('low');
    expect(findRecommendation(story.september, 'trend-down').severity).toBe('info');
    expect(findRecommendation(story.october, 'healthy').severity).toBe('positive');
    expect(findRecommendation(story.labs, 'concentration').severity).toBe('high');
  });

  it('counts the cost-center gap from the raw CSV', () => {
    const centers = new Map<string, Set<string>>();
    for (const row of naiveRows(demoCsv)) {
      if (!row.username) continue;
      const set = centers.get(row.username) ?? new Set<string>();
      set.add(row.cost_center_name);
      centers.set(row.username, set);
    }
    const without = [...centers.values()].filter((costCenters) => [...costCenters].every((costCenter) => costCenter === '')).length;
    expect(without).toBeGreaterThan(0);
    expect(findRecommendation(analysis(), 'cost-center-coverage').affectedCount).toBe(without);
  });

  it('derives the Auto share from the raw CSV', () => {
    const rows = naiveRows(demoCsv);
    const gross = sum(rows.map((row) => numOf(row, 'gross_amount')));
    const auto = sum(rows.filter(isAutoRow).map((row) => numOf(row, 'gross_amount')));
    expect(findRecommendation(analysis(), 'auto-adoption').title).toBe(`Only ${Math.round((auto / gross) * 100)}% of usage goes through Auto model selection`);
  });

  it('values the usage savings with the pool-covers-first rule', () => {
    const months = monthInputs(analysis().pool);
    const avgGross = sum(months.map((month) => month.gross)) / months.length;
    const gross = analysis().agg.totals.gross;
    const fraction = (id: string): number => Math.min(1, analysis().levers.steps.find((step) => step.id === id)!.savings / gross);
    for (const [recId, lever] of [
      ['runaway', 'capRunaway'],
      ['model-rightsizing', 'modelShift'],
      ['auto-adoption', 'autoAdoption'],
    ] as const) {
      const recommendation = findRecommendation(analysis(), recId);
      expect(recommendation.impactUsd, `${recId} impact`).toBeCloseTo(avgGross * fraction(lever), 6);
      expect(recommendation.cashUsd, `${recId} cash`).toBeCloseTo(cashSaving(months, fraction(lever), 0) / months.length, 6);
      expect(recommendation.cashLowerBound).toBe(false);
    }
  });

  it('values the seat actions with the slack of the pool', () => {
    const months = monthInputs(analysis().pool);
    const idle = findRecommendation(analysis(), 'idle-seats');
    const seats = analysis().seats;
    expect(idle.impactUsd).toBeCloseTo(seats.idleValue + seats.unusedValue, 9);
    expect(idle.cashUsd).toBeCloseTo(cashSaving(months, 0, seats.idleValue + seats.unusedValue) / months.length, 6);
    expect(idle.affectedCount).toBe(seats.idle.length + seats.unused.length);
    const down = findRecommendation(analysis(), 'downgrade');
    expect(down.title).toBe('14 Enterprise users never needed more than the Business allotment');
    expect(down.impactUsd).toBeCloseTo(seats.downgrade.length * 20, 9);
    expect(down.cashUsd).toBeCloseTo(cashSaving(months, 0, seats.downgradeValue) / months.length, 6);
    // September used its whole pool, so only the spare credits of August and October turn into cash
    for (const recommendation of [idle, down]) {
      expect(recommendation.cashUsd, recommendation.id).toBeGreaterThan(0);
      expect(recommendation.cashUsd, recommendation.id).toBeLessThan(recommendation.impactUsd);
    }
  });

  it('chooses the idle-seats title from how much cash the removal frees', () => {
    const idle = findRecommendation(analysis(), 'idle-seats');
    expect(idle.cashUsd / idle.impactUsd).toBeGreaterThanOrEqual(0.5);
    expect(idle.title).toBe('Reclaim 15 idle seats to save about $270/month');
    // In September alone the pool ran out, so removing the seats frees no cash
    const septemberIdle = findRecommendation(story.september, 'idle-seats');
    expect(septemberIdle.cashUsd).toBeLessThan(0.5);
    expect(septemberIdle.title).toBe('16 idle seats currently fund the pool for heavier users');
  });

  it('flags the budget gap only while no budget is configured', () => {
    expect(findRecommendation(analysis(), 'budgets').jump?.page).toBe('settings');
    expect(ids(PIPELINES['demo with roster and budget'].analysis)).not.toContain('budgets');
  });

  it('treats a budget of zero like no budget, in the pool and in the recommendations', () => {
    const store = PIPELINES.demo.store;
    const zero = pipelineOf(store, { settings: { budgetMonthlyBilled: 0 } }).analysis;
    expect(zero.pool.budget).toBeNull();
    expect(ids(zero)).toContain('budgets');
    const set = pipelineOf(store, { settings: { budgetMonthlyBilled: 100 } }).analysis;
    expect(set.pool.budget).not.toBeNull();
    expect(ids(set)).not.toContain('budgets');
  });

  it('sends each count-based recommendation to a link that selects exactly those users', () => {
    const pick = (id: string): number => {
      const recommendation = findRecommendation(analysis(), id);
      const filteredAnalysis = PIPELINES.demo.run({ ...emptyFilters(), ...recommendation.jump!.filters });
      expect(filteredAnalysis.segmentFiltered, id).toBe(true);
      return filteredAnalysis.users.profiles.length;
    };
    expect(pick('runaway')).toBe(findRecommendation(analysis(), 'runaway').affectedCount);
    expect(pick('lapsed')).toBe(findRecommendation(analysis(), 'lapsed').affectedCount);
    expect(pick('new-users')).toBe(findRecommendation(analysis(), 'new-users').affectedCount);
    expect(pick('champions')).toBe(findRecommendation(analysis(), 'champions').affectedCount);
    expect(pick('spiky')).toBe(findRecommendation(analysis(), 'spiky').affectedCount);
    expect(pick('cost-center-coverage')).toBe(findRecommendation(analysis(), 'cost-center-coverage').affectedCount);
  });

  it('lets the idle-seats link select exactly the idle seats', () => {
    const idleSeats = findRecommendation(analysis(), 'idle-seats');
    const filteredAnalysis = PIPELINES.demo.run({ ...emptyFilters(), ...idleSeats.jump!.filters });
    expect(filteredAnalysis.users.profiles.map((profile) => profile.id).sort()).toEqual(analysis().seats.idle.map((seat) => seat.id).sort());
  });

  it('lets the other links reproduce the numbers in the recommendation', () => {
    const totals = analysis().agg.totals;
    const manual = PIPELINES.demo.run({ ...emptyFilters(), ...findRecommendation(analysis(), 'auto-adoption').jump!.filters });
    expect(manual.agg.totals.gross).toBeCloseTo(totals.gross - totals.autoGross, 6);
    const powerful = PIPELINES.demo.run({ ...emptyFilters(), ...findRecommendation(analysis(), 'model-rightsizing').jump!.filters });
    expect(powerful.agg.totals.gross).toBeCloseTo(totals.tierGross[CATEGORIES.indexOf('Powerful')], 6);
    const day = PIPELINES.demo.run({ ...emptyFilters(), ...findRecommendation(analysis(), 'anomalies').jump!.filters });
    expect(day.agg.totals.gross).toBeCloseTo(analysis().anomalies[0].gross, 6);
  });
});

describe('budget handling', () => {
  it('escalates the overage and the pool exhaustion when the projected bill breaks the budget', () => {
    const analysis = PIPELINES['A with $100 budget'].analysis;
    expect(findRecommendation(analysis, 'overage').severity).toBe('critical');
    expect(findRecommendation(analysis, 'pool-exhaustion').severity).toBe('critical');
    expect(ids(analysis)).not.toContain('budgets');
    const line = findRecommendation(analysis, 'pool-exhaustion').evidence.find((evidenceLine) => evidenceLine.startsWith('Budget'))!;
    expect(line).toMatch(/^Budget \$100 for .+: 93% used so far, 158% projected, limit reached around Oct 22\.$/);
    expect(analysis.headline.status).toBe('action');
    expect(analysis.recs.filter((recommendation) => recommendation.severity === 'critical').map((recommendation) => recommendation.id)).toEqual(expect.arrayContaining(['overage', 'pool-exhaustion']));
    expect(recValue(analysis.recs[0])).toBe(Math.max(...analysis.recs.map(recValue)));
  });

  it('keeps the severities when the budget is large enough for the projected bill', () => {
    const analysis = pipelineOf(PIPELINES['fixture A'].store, { settings: { budgetMonthlyBilled: 200 } }).analysis;
    expect(findRecommendation(analysis, 'overage').severity).toBe('high');
    expect(findRecommendation(analysis, 'pool-exhaustion').severity).toBe('high');
    const line = findRecommendation(analysis, 'pool-exhaustion').evidence.find((evidenceLine) => evidenceLine.startsWith('Budget'))!;
    expect(line).toMatch(/^Budget \$200 for .+: 47% used so far, 79% projected\.$/);
  });

  it('mentions a budget only when one is configured', () => {
    const none = findRecommendation(PIPELINES['fixture A'].analysis, 'pool-exhaustion').evidence;
    expect(none.some((evidenceLine) => evidenceLine.startsWith('Budget'))).toBe(false);
  });
});

describe('rules that need the GitHub data file', () => {
  // FIXTURE_A is the organization contoso in October 2026 up to the 20th: $93 billed so far, and a $100 budget is projected at 158%.
  const contosoHeader = (extra: Line = {}): Line =>
    header({ scope: 'organization', enterprise: null, organizations: ['contoso'], months: ['2026-10'], startedAt: '2026-10-20T18:00:00Z', ...extra });
  const contosoLine = (kind: string, record: Line, extra: Line = {}): Line => recordLine(kind, record, { scope: 'organization', target: 'contoso', ...extra });
  const orgBudget = (extra: Line): Line =>
    contosoLine('budget', budgetRecord('org-budget', { budget_scope: 'organization', budget_entity_name: 'contoso', budget_amount: 100, consumed_amount: 93, ...extra }));
  const withGitHub = (lines: Line[], options: { filters?: Partial<Filters>; settings?: Partial<Settings>; head?: Line } = {}): Analysis =>
    pipelineOf(PIPELINES['fixture A'].store, { filters: options.filters, settings: options.settings, collection: readLines([options.head ?? contosoHeader(), ...lines, END]) }).analysis;
  const AS_OF = 'As of Oct 20, 2026, when the GitHub data was collected.';

  it('warns when the budget of the organization only sends alerts and the bill is going past it', () => {
    const analysis = withGitHub([orgBudget({ prevent_further_usage: false })]);
    expect(analysis.budgetSource).toBe('github');
    const recommendation = findRecommendation(analysis, 'budget-no-stop');
    expect(recommendation.severity).toBe('high');
    expect(recommendation.title).toBe('The $100 budget only sends alerts, so the bill can go past it');
    expect(recommendation.evidence).toEqual([
      `GitHub shows $93 of the $100 budget used (93%). ${AS_OF}`,
      expect.stringMatching(/^Budget \$100 for .+: 93% used so far, 158% projected, limit reached around Oct 22\.$/),
      'Budget alerts are on: GitHub sends an email at 75%, 90% and 100% of the budget.',
    ]);
    expect(recommendation.jump?.page).toBe('spend');
    // The GitHub budget is the monthly budget now, so the advice to set one up is gone.
    expect(ids(analysis)).not.toContain('budget-stop-ahead');
    expect(ids(analysis)).not.toContain('budgets');
  });

  it('warns that people get blocked when the budget stops usage and runs out', () => {
    const analysis = withGitHub([orgBudget({ prevent_further_usage: true })]);
    const recommendation = findRecommendation(analysis, 'budget-stop-ahead');
    expect(recommendation.severity).toBe('high');
    expect(recommendation.title).toBe('Usage that costs AI credits stops when the $100 budget runs out');
    expect(ids(analysis)).not.toContain('budget-no-stop');
  });

  it('uses only the GitHub figures when Settings holds another budget', () => {
    const analysis = withGitHub([orgBudget({ prevent_further_usage: false, budget_alerting: { will_alert: false } })], { settings: { budgetMonthlyBilled: 500 } });
    expect(analysis.budgetSource).toBe('settings');
    const recommendation = findRecommendation(analysis, 'budget-no-stop');
    // 93% used at GitHub is close to the limit, but nothing says it runs out.
    expect(recommendation.severity).toBe('medium');
    expect(recommendation.evidence).toEqual([`GitHub shows $93 of the $100 budget used (93%). ${AS_OF}`, 'Budget alerts are off, so nobody is told when the budget runs out.']);
    expect(recommendation.actions).toContain('Turn on budget alerts so the right people hear about it early.');
  });

  it('stays quiet about a budget with room left and in a filtered view', () => {
    expect(ids(withGitHub([orgBudget({ prevent_further_usage: false, budget_amount: 1000 })]))).not.toContain('budget-no-stop');
    expect(ids(withGitHub([orgBudget({ prevent_further_usage: false })], { filters: { users: ['alex-dev'] } }))).not.toContain('budget-no-stop');
    expect(ids(withGitHub([orgBudget({ prevent_further_usage: true })], { filters: { users: ['alex-dev'] } }))).not.toContain('budget-stop-ahead');
  });

  it('lists the users who reached their budget, in the report or not', () => {
    const lines = [
      contosoLine('budget', budgetRecord('alex-only', { budget_scope: 'user', budget_entity_name: 'alex-dev', user: 'alex-dev', budget_amount: 50, consumed_amount: 60 })),
      contosoLine('budget', budgetRecord('everyone', { budget_scope: 'multi_user_customer', budget_entity_name: 'contoso', budget_amount: 20 })),
      contosoLine('budget-user', { user: 'kai-not-in-report', consumed_amount: 20, target_amount: 20 }, { parent: 'everyone' }),
      contosoLine('budget-user', { user: 'sam-lee', consumed_amount: 5, target_amount: 20 }, { parent: 'everyone' }),
    ];
    const recommendation = findRecommendation(withGitHub(lines), 'user-budget-reached');
    expect(recommendation.title).toBe('2 users reached their budget and cannot use AI credits');
    expect(recommendation.severity).toBe('medium');
    expect(recommendation.evidence).toEqual(['alex-dev: $60.00 used of a $50.00 budget.', 'kai-not-in-report: $20.00 used of a $20.00 budget.', AS_OF]);
    expect(recommendation.affectedCount).toBe(2);
    expect(recommendation.affected.map((user) => user.name)).toEqual(['alex-dev']);
    expect(recommendation.jump).toEqual({ page: 'users', label: 'Show these users', filters: { users: ['alex-dev'] } });
    // A filtered view keeps only the users in it.
    expect(findRecommendation(withGitHub(lines, { filters: { users: ['alex-dev'] } }), 'user-budget-reached').affectedCount).toBe(1);
    expect(ids(withGitHub(lines, { filters: { users: ['sam-lee'] } }))).not.toContain('user-budget-reached');
  });

  it('points the budget advice at the budgets GitHub already has', () => {
    // The demo has enough user-months for the budget advice; fixture A has too few.
    const everyone = recordLine('budget', budgetRecord('everyone', { budget_scope: 'multi_user_customer', budget_amount: 20 }));
    const analysis = pipelineOf(PIPELINES.demo.store, { collection: readLines([header(), everyone, END]) }).analysis;
    expect(analysis.budgetSource).toBeNull();
    const pointer = 'The GitHub data file lists 1 budget for GitHub Copilot. Check it on the Budgets page before you add more.';
    expect(findRecommendation(analysis, 'budgets').evidence).toContain(pointer);
    expect(findRecommendation(PIPELINES.demo.analysis, 'budgets').evidence).not.toContain(pointer);
  });

  it('flags organizations that give a seat to every member when seats sit unused', () => {
    const seatSummary = (extra: Line = {}): Line =>
      contosoLine('seat-summary', {
        seat_management_setting: 'assign_all',
        plan_type: 'business',
        seat_breakdown: { total: 40, active_this_cycle: 30, inactive_this_cycle: 10, added_this_cycle: 0, pending_invitation: 0, pending_cancellation: 0 },
        ...extra,
      });
    const recommendation = findRecommendation(withGitHub([seatSummary()]), 'seat-auto-assign');
    expect(recommendation.title).toBe('1 organization gives a seat to every member, used or not');
    expect(recommendation.severity).toBe('medium');
    expect(recommendation.evidence).toEqual(['contoso: 10 of 40 seats had no GitHub Copilot activity this billing cycle.', AS_OF]);
    expect(recommendation.impactUsd).toBe(0);
    expect(recommendation.jump?.page).toBe('organization');
    // Early in the billing cycle most seats have had no activity yet, and seats given to chosen members are a choice already made.
    expect(ids(withGitHub([seatSummary()], { head: contosoHeader({ startedAt: '2026-10-05T08:00:00Z' }) }))).not.toContain('seat-auto-assign');
    expect(ids(withGitHub([seatSummary({ seat_management_setting: 'assign_selected' })]))).not.toContain('seat-auto-assign');
  });

  describe('a usage report that does not match GitHub billing', () => {
    let september: Pipeline;
    beforeAll(async () => {
      // All of September 2026: $10 a day, covered by included credits, in the organizations acme and globex.
      september = await analyzeCsv(makeCsv(SEPTEMBER.map((date, index) => ({ date, user: `user-${index % 3}`, gross: 10, discount: 10, net: 0, org: index % 2 === 0 ? 'acme' : 'globex' }))));
    });
    const gapOf = (gross: number, net: number, head: Line = header({ months: ['2026-09'] })): Analysis =>
      pipelineOf(september.store, { collection: readLines([head, sourceLine('ai-credit-usage', 'ok', { month: '2026-09' }), creditLine('2026-09', gross, gross - net, net), END]) }).analysis;

    it('says when the report has less than GitHub billing', () => {
      const recommendation = findRecommendation(gapOf(400, 100), 'report-gap');
      expect(recommendation.severity).toBe('medium');
      expect(recommendation.theme).toBe('data');
      expect(recommendation.evidence).toEqual(['Sep 2026: usage $300 in the report and $400 at GitHub; billed $0 and $100.']);
      expect(recommendation.actions[0]).toBe('Download the usage report again for the whole month and load all its files together.');
    });

    it('says less when the report only has more, and nothing when they match', () => {
      const recommendation = findRecommendation(gapOf(200, 0), 'report-gap');
      expect(recommendation.severity).toBe('low');
      expect(recommendation.actions).toEqual(['Check that the usage report and the GitHub data file cover the same enterprise or organizations.']);
      expect(ids(gapOf(300, 0))).not.toContain('report-gap');
    });

    it('compares an organization file with the rows of its organizations only', () => {
      const acmeHeader = header({ scope: 'organization', enterprise: null, organizations: ['acme'], months: ['2026-09'] });
      // acme has the 15 days with an even index: $150 of the $300.
      expect(ids(gapOf(150, 0, acmeHeader))).not.toContain('report-gap');
      const recommendation = findRecommendation(gapOf(300, 0, acmeHeader), 'report-gap');
      expect(recommendation.evidence).toEqual([
        'Sep 2026: usage $150 in the report and $300 at GitHub; billed $0 and $0.',
        'Only the report rows of acme are compared, the organizations in the GitHub data file.',
      ]);
    });
  });
});

describe('narrowed scopes drop organization-wide statements', () => {
  const firstNamed = (pipeline: Pipeline, dimension: 'user' | 'costCenter'): string => pipeline.store.dicts[dimension].values.find((value) => value !== '')!;
  const NARROWING: { name: string; filters: (pipeline: Pipeline) => Partial<Filters> }[] = [
    { name: 'models', filters: () => ({ models: ['GPT-6 Astra'] }) },
    { name: 'orgs', filters: () => ({ orgs: ['northwind-data'] }) },
    { name: 'users', filters: (pipeline) => ({ users: [firstNamed(pipeline, 'user')] }) },
    { name: 'products', filters: () => ({ products: ['copilot'] }) },
    { name: 'costCenters', filters: (pipeline) => ({ costCenters: [firstNamed(pipeline, 'costCenter')] }) },
    { name: 'plans', filters: () => ({ plans: ['Enterprise'] }) },
    { name: 'categories', filters: () => ({ categories: ['Powerful'] }) },
    { name: 'selection', filters: () => ({ selection: 'manual' }) },
    { name: 'billing', filters: () => ({ billing: 'billed' }) },
    { name: 'attribution', filters: () => ({ attribution: 'attributed' }) },
    { name: 'weekdays', filters: () => ({ weekdays: [0, 1, 2, 3, 4] }) },
    { name: 'tiers', filters: () => ({ tiers: ['power', 'runaway'] }) },
    { name: 'segments', filters: () => ({ segments: ['champion'] }) },
    { name: 'traits', filters: () => ({ traits: ['spiky'] }) },
    { name: 'paretoClasses', filters: () => ({ paretoClasses: ['A'] }) },
    { name: 'minUserSpend', filters: () => ({ minUserSpend: 20 }) },
  ];

  it.each(NARROWING)('$name: no pool, seat or healthy statements and cash is a lower bound', ({ filters }) => {
    const pipeline = pipelineOf(PIPELINES.demo.store, { filters: filters(PIPELINES.demo) });
    const analysis = pipeline.analysis;
    expect(analysis.narrowed).toBe(true);
    expect(analysis.agg.totals.rows).toBeGreaterThan(0);
    for (const id of POOL_RECS) expect(ids(analysis), id).not.toContain(id);
    for (const recommendation of analysis.recs) expect(recommendation.cashLowerBound, recommendation.id).toBe(true);
    const notes = findRecommendation(analysis, 'data-notes').evidence.join(' ');
    expect(notes).not.toMatch(/The pool covered|Included credits only count/);
    expect(analysis.headline.detail).not.toMatch(/Pool utilization/);
    for (const text of analysisTexts(analysis)) expect(text).not.toMatch(BAD_TEXT);
  });

  it('a date-only filter keeps the organization-wide statements', () => {
    const analysis = PIPELINES['demo last 20 days'].analysis;
    expect(analysis.narrowed).toBe(false);
    expect(ids(analysis)).toContain('data-notes');
    expect(analysis.headline.detail).toMatch(/^Pool utilization/);
  });

  it('forcing narrowed on an unfiltered context removes the pool and seat rules', () => {
    const base = buildRecommendations(ctxOf(PIPELINES.demo));
    const forced = buildRecommendations(ctxOf(PIPELINES.demo, { narrowed: true }));
    expect(base.map((recommendation) => recommendation.id)).toEqual(expect.arrayContaining(['pool-exhaustion', 'idle-seats', 'downgrade']));
    for (const id of POOL_RECS) expect(forced.map((recommendation) => recommendation.id), id).not.toContain(id);
  });

  it('values a narrowed scope per month from what was already billed in that scope', () => {
    const analysis = PIPELINES['demo one model'].analysis;
    const totals = analysis.agg.totals;
    const perMonth = 30.4375 / analysis.agg.range.length;
    for (const recommendation of analysis.recs) expect(recommendation.cashUsd, recommendation.id).toBeLessThanOrEqual(totals.net * perMonth + 1e-6);
  });
});

describe('empty scopes', () => {
  const EMPTY: { name: string; filters: (pipeline: Pipeline) => Partial<Filters> }[] = [
    { name: 'a user that does not exist', filters: () => ({ users: ['nobody-here'] }) },
    { name: 'contradicting filters', filters: () => ({ models: ['GPT-6 Astra'], products: ['code_quality'] }) },
    { name: 'a minimum row amount above every row', filters: () => ({ minRow: 1e9 }) },
    { name: 'a text search without a match', filters: () => ({ search: 'zzz-no-such-text' }) },
  ];

  it.each(EMPTY)('$name: no recommendations and a clear headline', ({ filters }) => {
    const analysis = pipelineOf(PIPELINES.demo.store, { filters: filters(PIPELINES.demo) }).analysis;
    expect(analysis.agg.totals.rows).toBe(0);
    expect(analysis.recs).toEqual([]);
    expect(analysis.headline).toEqual({ status: 'watch', title: 'No rows match the current filters', detail: 'Widen the date range or clear some filters.' });
    for (const text of analysisTexts(analysis)) expect(text).not.toMatch(BAD_TEXT);
  });

  it('buildRecommendations returns nothing for an empty aggregate', () => {
    const pipeline = pipelineOf(PIPELINES.demo.store, { filters: { users: ['nobody-here'] } });
    expect(buildRecommendations(ctxOf(pipeline))).toEqual([]);
  });
});

// Links that select users ----------------------------------------------------------------------------------------------------

describe('links that select users', () => {
  const WHOLE_SCOPE: CaseName[] = ['fixture A', 'fixture B', 'A + B', 'demo', 'demo with roster and budget', 'A with $100 budget'];
  // `concentration` counts the whole Pareto class A but lists only its top three.
  const COUNTED_BY_LINK = ['runaway', 'concentration', 'cache', 'cost-center-coverage', 'lapsed', 'new-users', 'champions', 'spiky', 'long-context'];
  const LISTS_THE_SAME_USERS = COUNTED_BY_LINK.filter((id) => id !== 'concentration');
  const USER_FILTER_KEYS = ['segments', 'tiers', 'engagement', 'profiles', 'traits', 'paretoClasses'];
  const follow = (pipeline: Pipeline, recommendation: Recommendation): Analysis => pipeline.run({ ...emptyFilters(), ...recommendation.jump!.filters });

  const checkLinks = (name: string, pipeline: Pipeline): number => {
    let checked = 0;
    for (const recommendation of pipeline.analysis.recs) {
      if (!COUNTED_BY_LINK.includes(recommendation.id) || !recommendation.jump?.filters) continue;
      const where = `${name}: ${recommendation.id} "${recommendation.jump.label}"`;
      expect(Object.keys(recommendation.jump.filters).some((filterKey) => USER_FILTER_KEYS.includes(filterKey)), where).toBe(true);
      const filteredAnalysis = follow(pipeline, recommendation);
      expect(filteredAnalysis.segmentFiltered, where).toBe(true);
      expect(filteredAnalysis.users.profiles.length, where).toBe(recommendation.affectedCount);
      if (LISTS_THE_SAME_USERS.includes(recommendation.id)) {
        const selected = new Set(filteredAnalysis.users.profiles.map((profile) => profile.name));
        for (const affectedUser of recommendation.affected) expect(selected.has(affectedUser.name), `${where}: ${affectedUser.name}`).toBe(true);
        if (recommendation.affectedCount <= 12) expect(recommendation.affected.length, where).toBe(recommendation.affectedCount);
      }
      checked++;
    }
    return checked;
  };

  it.each(WHOLE_SCOPE)('%s: every link that filters users selects exactly the users the recommendation counted', (name) => {
    expect(checkLinks(name, PIPELINES[name])).toBeGreaterThan(0);
  });

  it('holds for synthetic data with several users per behaviour', async () => {
    for (const usersPerBehavior of [1, 2, 3]) expect(checkLinks(`agreement ${usersPerBehavior}`, await analyzeCsv(agreementCsv(usersPerBehavior)))).toBeGreaterThanOrEqual(6);
  });

  describe('lapsed and new users are matched by flag, whatever their persona', () => {
    /** First/last day per user from the raw rows and the documented rules (lapsed after 7 quiet days, new within 14 days of the first row). */
    const lifecycle = (rows: NaiveRow[], lapsedDays = 7, newUserDays = 14): { fresh: string[]; lapsed: string[] } => {
      const days = rows.map((row) => dayNum(row.date));
      const minDay = Math.min(...days);
      const maxDay = Math.max(...days);
      const first = new Map<string, number>();
      const last = new Map<string, number>();
      for (const row of rows) {
        if (!row.username) continue;
        const day = dayNum(row.date);
        first.set(row.username, Math.min(first.get(row.username) ?? Infinity, day));
        last.set(row.username, Math.max(last.get(row.username) ?? -Infinity, day));
      }
      const fresh: string[] = [];
      const lapsed: string[] = [];
      for (const [user, firstDay] of first) {
        if (maxDay - firstDay + 1 <= newUserDays && firstDay - minDay >= newUserDays) fresh.push(user);
        else if (maxDay - last.get(user)! >= lapsedDays) lapsed.push(user);
      }
      return { fresh: fresh.sort(), lapsed: lapsed.sort() };
    };
    const names = (analysis: Analysis): string[] => analysis.users.profiles.map((profile) => profile.name).sort();

    it('the links filter on the lifecycle flags', () => {
      expect(findRecommendation(PIPELINES.demo.analysis, 'lapsed').jump?.filters).toEqual({ engagement: ['lapsed'] });
      for (const name of ['fixture A', 'demo'] as const) {
        expect(findRecommendation(PIPELINES[name].analysis, 'new-users').jump?.filters, name).toEqual({ engagement: ['new'] });
      }
    });

    it('pool-used fixture: only sam-lee is new, nobody has lapsed, and the link finds the new user', () => {
      const pipeline = PIPELINES['fixture A'];
      const oracle = lifecycle(naiveRows(readFixture(FIXTURE_A)));
      expect(oracle).toEqual({ fresh: ['sam-lee'], lapsed: [] });
      expect(ids(pipeline.analysis)).not.toContain('lapsed');
      const fresh = findRecommendation(pipeline.analysis, 'new-users');
      expect(fresh.affected.map((affectedUser) => affectedUser.name)).toEqual(['sam-lee']);
      expect(names(follow(pipeline, fresh))).toEqual(['sam-lee']);
    });

    it('a user who has lapsed and is also past three times their allotment is counted and found', async () => {
      const rows: RowSpec[] = SEP_WEEKDAYS.map((date) => terra({ date, user: 'veteran', gross: 1, costCenter: 'eng' }));
      for (const dayOfMonth of [1, 2, 3]) rows.push(terra({ date: septemberDate(dayOfMonth), user: 'gone-runaway', gross: 30, costCenter: 'eng' }));
      const pipeline = await analyzeCsv(makeCsv(rows, { pool: true }));
      const gone = pipeline.analysis.users.profiles.find((profile) => profile.name === 'gone-runaway')!;
      expect([gone.lapsed, gone.persona]).toEqual([true, 'runaway']);
      const lapsed = findRecommendation(pipeline.analysis, 'lapsed');
      expect(lapsed.affected.map((affectedUser) => affectedUser.name)).toEqual(['gone-runaway']);
      expect(lapsed.jump?.filters).toEqual({ engagement: ['lapsed'] });
      expect(names(follow(pipeline, lapsed))).toEqual(['gone-runaway']);
      expect(findRecommendation(pipeline.analysis, 'runaway').affected.map((affectedUser) => affectedUser.name)).toEqual(['gone-runaway']);
    });

    it('the demo: both links select the users that the rules find in the raw rows', () => {
      const pipeline = PIPELINES.demo;
      const oracle = lifecycle(naiveRows(demoCsv));
      expect(oracle.lapsed.length).toBeGreaterThan(0);
      expect(oracle.fresh.length).toBeGreaterThan(0);
      const lapsed = findRecommendation(pipeline.analysis, 'lapsed');
      const fresh = findRecommendation(pipeline.analysis, 'new-users');
      expect(lapsed.affectedCount).toBe(oracle.lapsed.length);
      expect(fresh.affectedCount).toBe(oracle.fresh.length);
      expect(names(follow(pipeline, lapsed))).toEqual(oracle.lapsed);
      expect(names(follow(pipeline, fresh))).toEqual(oracle.fresh);
    });

    it('a user who is new and also past three times their allotment is counted and found', async () => {
      const rows: RowSpec[] = SEP_WEEKDAYS.map((date) => terra({ date, user: 'veteran', gross: 1, costCenter: 'eng' }));
      for (const dayOfMonth of [24, 25, 28]) rows.push(terra({ date: septemberDate(dayOfMonth), user: 'fast-newbie', gross: 30, costCenter: 'eng' }));
      const pipeline = await analyzeCsv(makeCsv(rows, { pool: true }));
      const fast = pipeline.analysis.users.profiles.find((profile) => profile.name === 'fast-newbie')!;
      expect([fast.isNew, fast.persona]).toEqual([true, 'runaway']);
      const fresh = findRecommendation(pipeline.analysis, 'new-users');
      expect(fresh.affected.map((affectedUser) => affectedUser.name)).toEqual(['fast-newbie']);
      expect(fresh.jump?.filters).toEqual({ engagement: ['new'] });
      expect(names(follow(pipeline, fresh))).toEqual(['fast-newbie']);
      expect(findRecommendation(pipeline.analysis, 'runaway').affected.map((affectedUser) => affectedUser.name)).toEqual(['fast-newbie']);
    });
  });

  describe('long-context', () => {
    const lcNames = (analysis: Analysis): string[] => analysis.users.profiles.map((profile) => profile.name).sort();

    it.each(['fixture B', 'A + B'] as const)('%s: the one user with long-context rows holds the trait, and the link selects exactly them', (name) => {
      const pipeline = PIPELINES[name];
      const longContext = findRecommendation(pipeline.analysis, 'long-context');
      const user = pipeline.analysis.users.profiles.find((profile) => profile.name === 'pat-ops')!;
      expect(user.longShare).toBeGreaterThanOrEqual(pipeline.settings.longContextShare);
      expect(user.traits).toContain('longContext');
      expect(longContext.affectedCount).toBe(1);
      expect(longContext.affected.map((affectedUser) => affectedUser.name)).toEqual(['pat-ops']);
      expect(lcNames(follow(pipeline, longContext))).toEqual(['pat-ops']);
      expect(longContext.evidence).toContain('Most affected users: pat-ops.');
    });

    it('when nobody reaches the trait threshold, the link has no filters while the evidence still names the most affected user', async () => {
      const costCenterFields = { costCenter: 'eng' };
      const rows: RowSpec[] = [
        ...spread('light', 30, SEP_WEEKDAYS.slice(-15), costCenterFields),
        longRow(SEP_WEEKDAYS[2], 'light', costCenterFields),
        ...spread('none', 20, SEP_WEEKDAYS.slice(-10), costCenterFields),
      ];
      const pipeline = await analyzeCsv(makeCsv(rows, { pool: true }));
      const longContext = findRecommendation(pipeline.analysis, 'long-context');
      expect(pipeline.analysis.users.profiles.some((profile) => profile.traits.includes('longContext'))).toBe(false);
      const user = pipeline.analysis.users.profiles.find((profile) => profile.name === 'light')!;
      expect(user.longShare).toBeGreaterThan(0);
      expect(user.longShare).toBeLessThan(pipeline.settings.longContextShare);
      expect(longContext.affectedCount).toBe(0);
      expect(longContext.affected).toEqual([]);
      expect(longContext.jump).toEqual({ page: 'efficiency', label: 'Open Efficiency' });
      expect(longContext.evidence).toContain('Most affected users: light.');
    });

    it('with a trait holder the link selects exactly the holders, while the evidence also lists users below the trait threshold', async () => {
      const costCenterFields = { costCenter: 'eng' };
      const rows: RowSpec[] = [
        ...spread('heavy', 15, SEP_WEEKDAYS.slice(-15), costCenterFields),
        longRow(SEP_WEEKDAYS[0], 'heavy', costCenterFields),
        longRow(SEP_WEEKDAYS[1], 'heavy', costCenterFields),
        ...spread('light', 30, SEP_WEEKDAYS.slice(-15), costCenterFields),
        longRow(SEP_WEEKDAYS[2], 'light', costCenterFields),
        ...spread('none', 20, SEP_WEEKDAYS.slice(-10), costCenterFields),
      ];
      const pipeline = await analyzeCsv(makeCsv(rows, { pool: true }));
      const by = new Map(pipeline.analysis.users.profiles.map((profile) => [profile.name, profile]));
      expect(by.get('heavy')!.longShare).toBeCloseTo(6 / 27, 6);
      expect(by.get('light')!.longShare).toBeCloseTo(3 / 36, 6);
      expect(by.get('none')!.longShare).toBe(0);
      const longContext = findRecommendation(pipeline.analysis, 'long-context');
      expect(longContext.title).toBe('Long-context surcharges cost at least $9');
      expect(longContext.evidence).toContain('Most affected users: heavy, light.');
      expect(longContext.affectedCount).toBe(1);
      expect(longContext.affected.map((affectedUser) => affectedUser.name)).toEqual(['heavy']);
      expect(longContext.jump).toEqual({ page: 'efficiency', label: 'Show long-context users', filters: { traits: ['longContext'] } });
      expect(lcNames(follow(pipeline, longContext))).toEqual(['heavy']);
    });
  });
});

describe('buildHeadline', () => {
  const craft = (severity: Severity): Recommendation => ({ ...PIPELINES.demo.analysis.recs[0], severity });

  it('turns critical or high recommendations into an action headline with the billed overage', () => {
    const context = ctxOf(PIPELINES.demo);
    expect(buildHeadline(context, [craft('critical')])).toMatchObject({ status: 'action', title: '$523 billed overage and 1 high-priority action' });
    expect(buildHeadline(context, [craft('high'), craft('critical'), craft('medium')])).toMatchObject({
      status: 'action',
      title: '$523 billed overage and 2 high-priority actions',
    });
  });

  it('leaves out the overage when nothing was billed', () => {
    expect(buildHeadline(ctxOf(PIPELINES['fixture B']), [craft('high')]).title).toBe('1 high-priority action');
  });

  it('is a watch headline for medium items only and healthy otherwise', () => {
    const context = ctxOf(PIPELINES.demo);
    expect(buildHeadline(context, [craft('medium')])).toMatchObject({ status: 'watch', title: 'No urgent issues, 1 item worth a look' });
    expect(buildHeadline(context, [craft('medium'), craft('medium'), craft('low')])).toMatchObject({ status: 'watch', title: 'No urgent issues, 2 items worth a look' });
    expect(buildHeadline(context, [craft('low'), craft('info'), craft('positive')])).toMatchObject({ status: 'healthy', title: 'Usage looks healthy' });
    expect(buildHeadline(context, [])).toMatchObject({ status: 'healthy', title: 'Usage looks healthy' });
  });

  it('shows the pool utilization only for an organization-wide scope with a known pool', () => {
    expect(buildHeadline(ctxOf(PIPELINES.demo), []).detail).toMatch(/^Pool utilization \d+% · Auto 24% of usage · 140 active users$/);
    expect(buildHeadline(ctxOf(PIPELINES.demo, { narrowed: true }), []).detail).toBe('Auto 24% of usage · 140 active users');
    expect(buildHeadline(ctxOf(PIPELINES['fixture B']), []).detail).toBe('Auto 0% of usage · 1 active user');
  });

  it('is described, part by part and in the same order, by the status banner doc', () => {
    const second = metricDoc('headline-status')?.steps?.at(-1) ?? '';
    const at = [/pool utilization/i, /share of usage that went through Auto/i, /number of active users/i].map((pattern) => second.search(pattern));
    expect(at.every((position) => position >= 0), second).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });
});

// How each number is calculated ----------------------------------------------------------------------------------------

const RULES_SOURCE = readFileSync(join(import.meta.dirname, '../src/lib/analytics/recommendations.ts'), 'utf8');
const RULE_IDS = [...RULES_SOURCE.matchAll(/^\s+id: '([a-z]+(?:-[a-z]+)*)',$/gm)].map((match) => match[1]);

const escapeHtml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const calcLabel = (...ids: string[]): string => `How this is calculated: ${ids.map((id) => escapeHtml(metricDoc(id)?.title ?? `missing ${id}`)).join(', ')}`;
const labelsIn = (html: string): string[] => [...html.matchAll(/aria-label="(How this is calculated: [^"]*)"/g)].map((match) => match[1]);
const renderIn = (pipeline: Pipeline, element: ReactElement): string =>
  renderToStaticMarkup(
    createElement(AnalysisProvider, {
      dataset: { store: pipeline.store, prep: pipeline.prep, label: 'synthetic.csv', loadedAt: 0 },
      children: element,
    }),
  );

describe('calculation docs', () => {
  let poolUnknown: Pipeline;
  let noBilling: Pipeline;

  beforeAll(async () => {
    // Covered usage above what the seats of the file fund: the pool size is unknown, but the billed split is there.
    poolUnknown = await analyzeCsv(makeCsv([terra({ date: septemberDate(10), user: 'a', gross: 30, discount: 30 }), terra({ date: septemberDate(20), user: 'a', gross: 5, discount: 5 })]));
    noBilling = await analyzeCsv(makeCsv([terra({ date: septemberDate(10), user: 'a', gross: 30 }), terra({ date: septemberDate(20), user: 'a', gross: 5 })], { columns: ['date', 'username', 'gross_amount', 'model'] }));
  });

  it('finds every rule of the engine in its source', () => {
    expect(RULE_IDS.length).toBeGreaterThanOrEqual(32);
    expect(new Set(RULE_IDS).size).toBe(RULE_IDS.length);
  });

  it('has one doc for every rule, named after it', () => {
    for (const id of RULE_IDS) {
      expect(recDocId(id), id).toBe(`rec-${id}`);
      const ruleDoc = metricDoc(recDocId(id));
      expect(ruleDoc, `no doc for the rule "${id}"`).toBeDefined();
      expect(ruleDoc?.area, id).toBe('Recommendations');
    }
  });

  it.each(CASES)('every recommendation of %s carries the doc of its rule', (name) => {
    for (const recommendation of PIPELINES[name].analysis.recs) {
      expect(recommendation.calc, recommendation.id).toBe(recDocId(recommendation.id));
      expect(metricDoc(recommendation.calc ?? ''), recommendation.id).toBeDefined();
    }
  });

  it('points the seat actions and the simulator levers at existing docs', () => {
    expect(Object.keys(SEAT_DOC).sort()).toEqual(['downgrade', 'reclaimIdle', 'reclaimUnused']);
    expect(Object.keys(LEVER_DOC).sort()).toEqual(['autoAdoption', 'cacheDiscipline', 'capRunaway', 'contextHygiene', 'longContext', 'modelShift']);
    for (const id of [...Object.values(SEAT_DOC), ...Object.values(LEVER_DOC)]) expect(metricDoc(id), id).toBeDefined();
  });

  it('opens the doc of its rule from every card, and the confidence doc from an open card', () => {
    for (const recommendation of PIPELINES.demo.analysis.recs) {
      const closed = labelsIn(renderToStaticMarkup(createElement(RecommendationCard, { rec: recommendation })));
      expect(closed, recommendation.id).toEqual([calcLabel(recDocId(recommendation.id))]);
    }
    const first = PIPELINES.demo.analysis.recs[0];
    const open = labelsIn(renderToStaticMarkup(createElement(RecommendationCard, { rec: first, defaultOpen: true })));
    expect(open).toEqual([calcLabel(recDocId(first.id)), calcLabel('rec-confidence')]);
  });

  it('explains the figures of the seat economics and the three seat lists', () => {
    const labels = labelsIn(renderIn(PIPELINES.demo, createElement(SeatsTab)));
    for (const id of ['rec-seats-in-report', 'rec-seat-value', 'rec-pool-share-used', 'rec-pool-unused', 'rec-seat-lists-value']) {
      expect(labels, id).toContain(calcLabel(id));
    }
    for (const id of Object.values(SEAT_DOC)) expect(labels.some((label) => label.includes(escapeHtml(metricDoc(id)!.title))), id).toBe(true);
  });

  it.each([
    ['a known pool', () => PIPELINES.demo, ['rec-sim-reduction', 'rec-sim-cash-month', 'rec-sim-cash-year', 'rec-sim-cost', 'rec-sim-unused', 'rec-sim-seat-value']],
    ['an unknown pool size', () => poolUnknown, ['rec-sim-reduction', 'rec-sim-cash-month', 'rec-sim-cash-year', 'rec-sim-billed', 'rec-sim-usage-after']],
    ['a file without the billed split', () => noBilling, ['rec-sim-reduction', 'rec-sim-usage-after']],
  ])('explains every result of the simulator for %s', (_name, pipe, expected) => {
    const pipeline = pipe();
    const html = renderIn(pipeline, createElement(SimulatorTab, { levers: DEFAULT_LEVERS, onLevers: () => undefined, seatFlags: DEFAULT_SEAT_FLAGS, onSeatFlags: () => undefined }));
    const labels = labelsIn(html);
    for (const id of expected) expect(labels, id).toContain(calcLabel(id));
    expect(html).not.toMatch(BAD_TEXT);
  });

  it('puts the three result sets under the right conditions', () => {
    expect(cashHiddenReason(PIPELINES.demo.analysis)).toBeNull();
    expect(poolUnknownReason(PIPELINES.demo.analysis)).toBeNull();
    expect(cashHiddenReason(poolUnknown.analysis)).toBeNull();
    expect(poolUnknownReason(poolUnknown.analysis)).not.toBeNull();
    expect(cashHiddenReason(noBilling.analysis)).not.toBeNull();
  });

  it('explains the presets, each lever, each seat switch, the waterfall and the month table', () => {
    const html = renderIn(
      PIPELINES.demo,
      createElement(SimulatorTab, { levers: DEFAULT_LEVERS, onLevers: () => undefined, seatFlags: DEFAULT_SEAT_FLAGS, onSeatFlags: () => undefined }),
    );
    const labels = labelsIn(html);
    for (const id of ['rec-sim-presets', 'rec-sim-waterfall', 'rec-sim-months']) expect(labels, id).toContain(calcLabel(id));
    for (const id of Object.values(LEVER_DOC)) expect(labels, id).toContain(calcLabel(id, 'rec-sim-levers'));
    for (const id of Object.values(SEAT_DOC)) expect(labels, id).toContain(calcLabel(id));
  });

  it('explains the saving of every playbook item', () => {
    const html = renderIn(PIPELINES.demo, createElement(PlaybookTab));
    expect(labelsIn(html)).toContain(calcLabel('rec-playbook-saving'));
    expect(html).not.toMatch(BAD_TEXT);
  });
});

// Personal tips -------------------------------------------------------------------------------------------------------------

describe('personal tips: the largest saving comes first, equal savings go by severity', () => {
  const TIP_RANK = { high: 0, medium: 1, low: 2, positive: 3 } as const;
  const ZERO_BY = { modelShift: 0, autoAdoption: 0, cacheDiscipline: 0, contextHygiene: 0, longContext: 0, capRunaway: 0 };
  /** A user with nothing to say; each test switches on the traits it needs. */
  const neutral = (over: Partial<UserProfile> = {}, by: Partial<UserProfile['potentialBy']> = {}): UserProfile => ({
    ...PIPELINES.demo.analysis.population.profiles[0],
    gross: 10,
    utilization: 0.7,
    tier: 'core',
    persona: 'steady',
    profile: 'balanced',
    isNew: false,
    lapsed: false,
    traits: [],
    powerfulShare: 0,
    autoShare: 1,
    cacheHit: 0.9,
    ...over,
    potentialBy: { ...ZERO_BY, ...by },
  });
  const tipIds = (profile: UserProfile, limit = 100): string[] => userTips(profile, PIPELINES.demo.settings, limit).map((tip) => tip.id);

  it('shows a $0.49 a month tip before a $0.10 a month tip, although the smaller one has the higher severity', () => {
    const profile = neutral({ traits: ['lowCache'] }, { cacheDiscipline: 0.1, contextHygiene: 0.49 });
    const tips = userTips(profile, PIPELINES.demo.settings);
    expect(tips.map((tip) => [tip.id, tip.severity, tip.savingsUsd])).toEqual([
      ['context', 'low', 0.49],
      ['cache', 'medium', 0.1],
    ]);
  });

  it('puts tips with the same saving in severity order, and keeps the written order for equal severities', () => {
    const profile = neutral({ tier: 'runaway', isNew: true, traits: ['spiky', 'multiModel', 'noCostCenter'] });
    const tips = userTips(profile, PIPELINES.demo.settings, 100);
    expect(tips.every((tip) => tip.savingsUsd === 0)).toBe(true);
    expect(tips.map((tip) => tip.id)).toEqual(['runaway', 'spiky', 'multi-model', 'cost-center', 'new']);
    expect(tips.map((tip) => tip.severity)).toEqual(['high', 'low', 'low', 'low', 'positive']);
  });

  it('values a tip by its saving only: a high severity tip that saves nothing follows the ones that save something', () => {
    const profile = neutral({ tier: 'runaway', traits: ['lowAuto', 'lowCache'], autoShare: 0, cacheHit: 0.1 }, { autoAdoption: 0.2, cacheDiscipline: 0.6 });
    expect(tipIds(profile)).toEqual(['cache', 'auto', 'runaway']);
  });

  it('keeps the biggest saving when the list is cut', () => {
    const profile = neutral(
      { tier: 'runaway', powerfulShare: 0.9, profile: 'frontier', traits: ['lowAuto', 'lowCache', 'longContext'], autoShare: 0, cacheHit: 0.1, longShare: 0.3 },
      { modelShift: 2, autoAdoption: 1, cacheDiscipline: 0.5, contextHygiene: 0.4, longContext: 0.3, capRunaway: 3 },
    );
    expect(tipIds(profile)).toEqual(['runaway', 'model', 'auto', 'cache', 'context', 'long-context']);
    expect(tipIds(profile, 1)).toEqual(['runaway']);
    expect(tipIds(profile, 3)).toEqual(['runaway', 'model', 'auto']);
  });

  it('holds for every user of the demo: saving never goes up from one tip to the next, and ties follow severity', () => {
    for (const profile of PIPELINES.demo.analysis.population.profiles) {
      const all = userTips(profile, PIPELINES.demo.settings, 100);
      expect(userTips(profile, PIPELINES.demo.settings)).toEqual(all.slice(0, 6));
      for (let i = 1; i < all.length; i++) {
        const prev = all[i - 1];
        const next = all[i];
        const ok = prev.savingsUsd > next.savingsUsd || (prev.savingsUsd === next.savingsUsd && TIP_RANK[prev.severity] <= TIP_RANK[next.severity]);
        expect(ok, `${profile.name}: ${prev.id} ($${prev.savingsUsd}) before ${next.id} ($${next.savingsUsd})`).toBe(true);
      }
    }
  });
});
