import { t } from '../../i18n/core.ts';
import type { GitHubData } from '../collection/derive';
import type { ModelTable } from '../pricing/models';
import type { DataStore } from '../types';
import { aggregate, quickTotals, type Aggregates, type QuickTotals } from './aggregate';
import { findAnomalyDays, weekOverWeek, type AnomalyDay, type Trend } from './anomalies';
import { buildAutoRates, summarizeAuto, type AutoRates, type AutoSummary } from './autoDiscount';
import { dataCoverage, type DataCoverage } from './coverage';
import { activeBaseFilterCount, andMasks, buildMask, hasPostFilters, type Filters } from './filters';
import { withGitHubBudget, type BudgetSource } from './githubBudget';
import { buildLicenseReport, lastUsageDays, type LicenseReport } from '../licenses/insights';
import { DEFAULT_LEVERS, computeLevers, type LeverContext, type LeverResult } from './levers';
import { buildPool, type PoolSummary } from './pool';
import type { Prepared } from './prepare';
import { buildHeadline, buildRecommendations, type Headline, type Recommendation } from './recommendations';
import { planSeats, type SeatPlan } from './seats';
import type { Settings } from './settings';
import { allotmentArray, runScenario, type Scenario } from './simulator';
import { allowedUsers, buildProfiles, summarizeProfiles, type UserSet } from './users';

export interface AnalysisInput {
  store: DataStore;
  prep: Prepared;
  models: ModelTable;
  filters: Filters;
  settings: Settings;
  /** What the GitHub data file of the collector scripts adds. Leave it out for the sample report. */
  github?: GitHubData | null;
}

export interface PreviousPeriod {
  from: number;
  to: number;
  totals: QuickTotals;
}

export interface Analysis {
  range: { start: number; end: number; length: number };
  /** Any row filter (other than the date range) or segment filter is active, so organization-wide statements do not apply. */
  narrowed: boolean;
  /** A segment filter (tier, persona, traits, …) is active. */
  segmentFiltered: boolean;
  /** Which optional report columns the loaded files carry (billing split, seat sizes, models, tokens). */
  coverage: DataCoverage;
  /** Row mask from the row filters only. Drives facet counts. */
  baseMask: Uint8Array | null;
  /** Final row mask: row filters and segment filters. */
  mask: Uint8Array | null;
  /** Aggregates for the final scope. */
  agg: Aggregates;
  /** Auto model selection in the final scope: the discount received, the original price and the discount hand-picked usage misses. */
  auto: AutoSummary;
  /** The Auto discount rate of each plan, measured on every user of the row-filtered scope. All Auto estimates of this analysis use it. */
  autoRates: AutoRates;
  /** Every user of the row-filtered scope, labelled against that whole population (segment sizes stay stable while filtering). */
  population: UserSet;
  /** Users that pass the segment filters. The same object as `population` when no segment filter is set. */
  users: UserSet;
  pool: PoolSummary;
  seats: SeatPlan;
  /**
   * The imported license roster set against the report: seats and plans, who has a seat but no usage, who has usage but no seat,
   * and which seats look reclaimable. Null when no seat roster is loaded. Segment filters do not change it.
   */
  licenses: LicenseReport | null;
  levers: LeverResult;
  /** Default levers plus all seat actions: the combined, non-overlapping plan. */
  plan: Scenario;
  anomalies: AnomalyDay[];
  trend: Trend;
  /** Totals of the equally long period before the range. Null when the data does not cover it fully. */
  previous: PreviousPeriod | null;
  recs: Recommendation[];
  headline: Headline;
  /** Where the monthly budget of `pool.budget` comes from: Settings, the GitHub data file, or nowhere. */
  budgetSource: BudgetSource;
  /** Wall-clock time of this analysis in milliseconds. */
  ms: number;
}

export function analyze(input: AnalysisInput): Analysis {
  const { store, prep: prepared, models, filters: filters } = input;
  const github = input.github ?? null;
  const { settings, budgetSource } = withGitHubBudget(input.settings, github);
  const startMs = performance.now();
  const nUsers = store.dicts.user.values.length;
  const start = Math.max(filters.dateFrom ?? store.minDay, store.minDay);
  const end = Math.min(filters.dateTo ?? store.maxDay, store.maxDay);
  const range = { start, end };
  const dateFilter = filters.dateFrom !== null || filters.dateTo !== null;
  const segmentFiltered = hasPostFilters(filters);
  const rowFiltered = activeBaseFilterCount(filters) - (dateFilter ? 1 : 0) > 0;
  const narrowed = rowFiltered || segmentFiltered;
  const aggOpts = { activeThreshold: settings.activeThreshold };
  const coverage = dataCoverage(store);

  const baseMask = buildMask(store, prepared, models, filters);
  const baseAgg = aggregate(store, prepared, models, baseMask, range, aggOpts);
  const population = buildProfiles(store, prepared, models, baseAgg, settings);

  let mask = baseMask;
  let aggregates = baseAgg;
  let users = population;
  let allowed: Uint8Array | null = null;
  if (segmentFiltered) {
    allowed = allowedUsers(population, filters, nUsers);
    mask = andMasks(baseMask, allowed, store.user);
    aggregates = aggregate(store, prepared, models, mask, range, aggOpts);
    const visible = population.profiles.filter((profile) => allowed![profile.id] === 1);
    users = { ...population, profiles: visible, ...summarizeProfiles(visible) };
  }

  const pool = buildPool(store, prepared, aggregates, settings, range, !narrowed);
  // Seat actions need the real pool size: not for a filtered view, and not when the pool size is unknown (partial export, no seat sizes).
  const seatScope = !narrowed && !pool.capacityExceeded;
  // Unused roster seats are an organization-wide fact: they cannot be attributed to a filtered scope.
  const seats = planSeats(seatScope ? users : { ...users, inactive: [] }, settings);
  const licenses = buildLicenseReport(
    population,
    settings,
    store,
    rowFiltered,
    settings.roster.length > 0 ? lastUsageDays(store, prepared) : undefined,
  );
  const autoRates = buildAutoRates(baseAgg, settings.autoDiscount);
  const leverContext: LeverContext = { agg: aggregates, models, settings, autoRates };
  const levers = computeLevers(leverContext, DEFAULT_LEVERS, allotmentArray(users, nUsers));
  const anomalies = findAnomalyDays(store, mask, aggregates);
  const trend = weekOverWeek(aggregates);
  const plan = runScenario(leverContext, pool, users, seats, {
    levers: DEFAULT_LEVERS,
    reclaimIdle: seatScope,
    downgrade: seatScope,
    reclaimUnused: seatScope,
  });

  const length = end - start + 1;
  let previous: PreviousPeriod | null = null;
  if (length > 0 && start - length >= store.minDay) {
    const noDate = buildMask(store, prepared, models, { ...filters, dateFrom: null, dateTo: null });
    const prevMask = allowed ? andMasks(noDate, allowed, store.user) : noDate;
    previous = { from: start - length, to: start - 1, totals: quickTotals(store, prevMask, start - length, start - 1) };
  }

  const auto = summarizeAuto(aggregates, settings, coverage.models, autoRates);
  const recommendationContext = { store, models, agg: aggregates, mask, users, pool, seats, levers, anomalies, trend, settings, narrowed, coverage, auto, github, budgetSource };
  const recommendations = aggregates.totals.rows > 0 ? buildRecommendations(recommendationContext) : [];
  const headline: Headline =
    aggregates.totals.rows > 0
      ? buildHeadline(recommendationContext, recommendations)
      : { status: 'watch', title: t('No rows match the current filters'), detail: t('Widen the date range or clear some filters.') };

  return {
    range: aggregates.range,
    narrowed,
    segmentFiltered,
    coverage,
    baseMask,
    mask,
    agg: aggregates,
    auto,
    autoRates,
    population,
    users,
    pool,
    seats,
    licenses,
    levers,
    plan,
    anomalies,
    trend,
    previous,
    recs: recommendations,
    headline,
    budgetSource,
    ms: performance.now() - startMs,
  };
}
