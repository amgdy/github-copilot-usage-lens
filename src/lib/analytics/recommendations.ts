import { msg, t, tp } from '../../i18n/core.ts';
import { monthOfKey, type GitHubData } from '../collection/derive';
import type { DataStore } from '../types';
import { CATEGORIES, labelOf } from '../types';
import type { ModelTable } from '../pricing/models';
import { fmtDay, monthLabel, parseIsoDay } from '../utils/date';
import { fmtInt, fmtMultiple, fmtPct, fmtPctAuto, fmtUSD, pluralize } from '../utils/format';
import type { Aggregates } from './aggregate';
import type { AnomalyDay, Trend } from './anomalies';
import { quantile } from './anomalies';
import type { AutoSummary } from './autoDiscount';
import { coverageIssues, type DataCoverage } from './coverage';
import type { Filters } from './filters';
import type { BudgetSource } from './githubBudget';
import { DEFAULT_LEVERS, type LeverResult, type LeverStep } from './levers';
import type { BudgetStatus, PoolSummary } from './pool';
import { BLANK_ID } from './prepare';
import type { SeatPlan } from './seats';
import { budgetOf, type Settings } from './settings';
import { cashSaving, monthInputs } from './simulator';
import type { UserProfile, UserSet } from './users';

export type PageId =
  | 'overview'
  | 'spend'
  | 'users'
  | 'segments'
  | 'models'
  | 'efficiency'
  | 'organization'
  | 'patterns'
  | 'recommendations'
  | 'data'
  | 'settings'
  | 'methodology'
  | 'budgets';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'positive';
export type RecTheme = 'cost' | 'pool' | 'efficiency' | 'adoption' | 'governance' | 'data';
export type Audience = 'management' | 'admin' | 'user';
export type Confidence = 'high' | 'medium' | 'low';

export const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4, positive: 5 };

/** The monthly figure shown on a card: cash when there is some, otherwise the usage avoided. Never NaN. */
export function recValue(recommendation: Pick<Recommendation, 'cashUsd' | 'impactUsd'>): number {
  const monthlyValue = recommendation.cashUsd > 0.5 ? recommendation.cashUsd : recommendation.impactUsd > 0.5 ? recommendation.impactUsd : 0;
  return Number.isFinite(monthlyValue) ? monthlyValue : 0;
}

export interface DocLink {
  label: string;
  url: string;
}

const DOCS_BASE_URL = 'https://docs.github.com/en/copilot';
export const DOCS = {
  pricing: { label: msg('Models and pricing'), url: `${DOCS_BASE_URL}/reference/copilot-billing/models-and-pricing` },
  optimize: { label: msg('Optimizing your AI usage'), url: `${DOCS_BASE_URL}/tutorials/optimize-ai-usage` },
  optimizeChat: { label: msg('Optimizing chat usage'), url: `${DOCS_BASE_URL}/tutorials/optimize-chat-usage` },
  budgets: { label: msg('Budgets for usage-based billing'), url: `${DOCS_BASE_URL}/concepts/billing-and-usage/organizations-and-enterprises/budgets` },
  budgetTuning: { label: msg('Optimizing your budget configuration'), url: `${DOCS_BASE_URL}/tutorials/budgets/optimizing-your-budget-configuration` },
  budgetStart: { label: msg('Getting started with budget controls'), url: `${DOCS_BASE_URL}/tutorials/budgets/getting-started-with-budget-controls` },
  auto: { label: msg('About GitHub Copilot auto model selection'), url: `${DOCS_BASE_URL}/concepts/models/auto-model-selection` },
  sessionLimit: { label: msg('Setting an AI credit session limit in GitHub Copilot CLI'), url: `${DOCS_BASE_URL}/how-tos/copilot-cli/use-copilot-cli/set-session-limit` },
  context: { label: msg('Managing context for GitHub Copilot'), url: `${DOCS_BASE_URL}/concepts/prompting-and-context/context-management` },
  prompting: { label: msg('Prompt engineering for GitHub Copilot'), url: `${DOCS_BASE_URL}/concepts/prompting-and-context/prompt-engineering` },
  comparison: { label: msg('AI model comparison'), url: `${DOCS_BASE_URL}/reference/ai-models/model-comparison` },
  licenseUsage: { label: msg('Viewing license usage'), url: `${DOCS_BASE_URL}/how-tos/administer-copilot/manage-for-enterprise/manage-access/view-license-usage` },
  seats: { label: msg('Seats and billing cycles'), url: `${DOCS_BASE_URL}/concepts/billing-and-usage/organizations-and-enterprises/seats-and-billing-cycles` },
  monitor: { label: msg('Monitoring AI usage'), url: `${DOCS_BASE_URL}/how-tos/manage-and-track-spending/monitor-ai-usage` },
  usageMetrics: { label: msg('GitHub Copilot usage metrics'), url: `${DOCS_BASE_URL}/concepts/billing-and-usage/copilot-usage-metrics` },
  grantAccess: {
    label: msg('Granting access to GitHub Copilot for members of your organization'),
    url: `${DOCS_BASE_URL}/how-tos/administer-copilot/manage-for-organization/manage-access/grant-access`,
  },
} satisfies Record<string, DocLink>;

export interface RecJump {
  page: PageId;
  label: string;
  filters?: Partial<Filters>;
}

export interface Recommendation {
  id: string;
  theme: RecTheme;
  audience: Audience[];
  severity: Severity;
  title: string;
  summary: string;
  evidence: string[];
  actions: string[];
  /** Usage avoided per month (USD, 1 credit = $0.01). For `impactKind: 'seats'` it is the monthly value of the seats instead. */
  impactUsd: number;
  /** What `impactUsd` measures: usage that would not be consumed, or the monthly value of seats. */
  impactKind: 'usage' | 'seats';
  /** Cash saved per month once the pool-covers-first rule is applied (USD). */
  cashUsd: number;
  /** True when the scope is narrowed by filters: the pool cannot be split, so `cashUsd` is only the part already billed in this scope. */
  cashLowerBound: boolean;
  confidence: Confidence;
  caveat?: string;
  affected: { id: number; name: string }[];
  affectedCount: number;
  docs?: DocLink[];
  jump?: RecJump;
  /** Id of the metric doc that explains how this recommendation is worked out. `add` sets it for every rule. */
  calc?: string;
}

/** The metric doc of a recommendation rule: "rec-" plus the rule id. */
export const recDocId = (ruleId: string): string => `rec-${ruleId}`;

export interface RecContext {
  store: DataStore;
  models: ModelTable;
  agg: Aggregates;
  mask: Uint8Array | null;
  users: UserSet;
  pool: PoolSummary;
  seats: SeatPlan;
  levers: LeverResult;
  anomalies: AnomalyDay[];
  trend: Trend;
  settings: Settings;
  /** A row or segment filter narrows the scope, so organization-wide pool and seat statements do not apply. */
  narrowed: boolean;
  /** Which optional columns the loaded files carry. */
  coverage: DataCoverage;
  /** Auto model selection in this scope: the discount received and the discount hand-picked usage misses. */
  auto: AutoSummary;
  /** What the GitHub data file of the collector scripts adds. Missing or null when none is loaded, and always for the sample report. */
  github?: GitHubData | null;
  /** Where the monthly budget in `settings` comes from: Settings, the GitHub data file, or nowhere. */
  budgetSource?: BudgetSource;
}

export interface Headline {
  status: 'action' | 'watch' | 'healthy';
  title: string;
  detail: string;
}

type RecInput = Pick<Recommendation, 'id' | 'theme' | 'audience' | 'severity' | 'title' | 'summary' | 'actions'> &
  Partial<Omit<Recommendation, 'id' | 'theme' | 'audience' | 'severity' | 'title' | 'summary' | 'actions'>>;

const MONTH_DAYS = 30.4375;
const ceil5 = (amount: number): number => Math.max(5, Math.ceil(amount / 5) * 5);
const brief = (people: { name: string }[], limit = 5): string => {
  const names = people.slice(0, limit).map((person) => person.name).join(t(', '));
  return people.length > limit ? t('{names} and {n} more', { names, n: fmtInt(people.length - limit) }) : names;
};
const who = (profiles: UserProfile[], limit = 12): { id: number; name: string }[] => profiles.slice(0, limit).map((user) => ({ id: user.id, name: user.name }));

/** One evidence line on the monthly budget: how much of it the latest month used, and where it is heading. */
function budgetLine(budget: BudgetStatus): string {
  const values = {
    budget: fmtUSD(budget.monthlyBudget, 0),
    month: budget.month,
    burn: fmtPct(budget.burn, 0),
    projected: budget.projectedBurn !== null ? fmtPct(budget.projectedBurn, 0) : '',
    day: budget.hitDate !== null ? fmtDay(budget.hitDate) : '',
  };
  if (budget.projectedBurn !== null) {
    return budget.hitDate !== null
      ? t('Budget {budget} for {month}: {burn} used so far, {projected} projected, limit reached around {day}.', values)
      : t('Budget {budget} for {month}: {burn} used so far, {projected} projected.', values);
  }
  return budget.hitDate !== null ? t('Budget {budget} for {month}: {burn} used so far, limit reached around {day}.', values) : t('Budget {budget} for {month}: {burn} used so far.', values);
}

export function buildRecommendations(context: RecContext): Recommendation[] {
  const { store, agg: aggregates, users, pool, seats, levers, settings, narrowed } = context;
  const totals = aggregates.totals;
  const out: Recommendation[] = [];
  if (totals.rows === 0 || totals.gross <= 0) return out;

  const profiles = users.profiles;
  const scopeDays = Math.max(1, aggregates.range.length);
  const baseConf: Confidence = scopeDays >= 21 ? 'high' : scopeDays >= 10 ? 'medium' : 'low';
  const perMonth = MONTH_DAYS / scopeDays;
  const months = narrowed ? [] : monthInputs(pool);
  const nMonths = months.length;
  const avgGross = nMonths ? months.reduce((total, month) => total + month.gross, 0) / nMonths : 0;
  const poolWhole = !narrowed && nMonths > 0;

  const add = (input: RecInput): void => {
    const recommendation: Recommendation = {
      evidence: [],
      impactUsd: 0,
      impactKind: 'usage',
      cashUsd: 0,
      cashLowerBound: !poolWhole,
      confidence: baseConf,
      affected: [],
      affectedCount: input.affected?.length ?? 0,
      calc: recDocId(input.id),
      ...input,
    };
    // An efficiency gain that frees no cash today (the pool already covers the usage) is worth doing but is not urgent.
    if (recommendation.theme === 'efficiency' && poolWhole && recommendation.cashUsd <= 0.005 && SEVERITY_ORDER[recommendation.severity] < SEVERITY_ORDER.medium) recommendation.severity = 'medium';
    out.push(recommendation);
  };
  const step = (id: LeverStep['id']): number => levers.steps.find((leverStep) => leverStep.id === id)?.savings ?? 0;
  const fractionOf = (usd: number): number => Math.min(1, usd / totals.gross);

  /** Monthly usage avoided and monthly cash saved when usage drops by `fraction`. */
  const reduce = (fraction: number): { impact: number; cash: number } => {
    if (!(fraction > 0)) return { impact: 0, cash: 0 };
    if (!poolWhole) {
      const impact = totals.gross * fraction * perMonth;
      return { impact, cash: Math.min(impact, totals.net * perMonth) };
    }
    return { impact: avgGross * fraction, cash: cashSaving(months, fraction, 0) / nMonths };
  };

  // Projected pool use over the months in scope (current month extrapolated).
  const capacityTotal = months.reduce((total, month) => total + month.capacity, 0);
  const usedTotal = months.reduce((total, month) => total + Math.min(month.capacity, month.gross), 0);
  const poolUse = capacityTotal > 0 ? usedTotal / capacityTotal : 0;

  // 1. Billed overage ------------------------------------------------------
  if (totals.net > 0.005) {
    const top = profiles.filter((user) => user.net > 0).sort((a, b) => b.net - a.net).slice(0, 3);
    const share = totals.net / totals.gross;
    const overBudget = pool.budget?.projectedBilled != null && pool.budget.projectedBilled > pool.budget.monthlyBudget;
    add({
      id: 'overage',
      theme: 'cost',
      audience: ['management', 'admin'],
      severity: overBudget ? 'critical' : share >= 0.25 || totals.net >= 100 ? 'high' : 'medium',
      title: t('{amount} was billed beyond included credits', { amount: fmtUSD(totals.net, 0) }),
      summary: t('{share} of usage was billed as overage because the pooled credits ran out.', { share: fmtPct(share, 0) }),
      evidence: [
        t('Usage {usage}: {covered} covered by the pool, {billed} billed.', { usage: fmtUSD(totals.gross, 0), covered: fmtUSD(totals.discount, 0), billed: fmtUSD(totals.net, 0) }),
        ...top.map((user) =>
          t('{name}: {billed} billed ({share} of all overage), {own} of their own allotment.', {
            name: user.name,
            billed: fmtUSD(user.net, 0),
            share: fmtPct(user.net / totals.net, 0),
            own: fmtPctAuto(user.utilization),
          }),
        ),
      ],
      actions: [
        t('Start with the usage levers below: they reduce usage without removing tools from anyone.'),
        t('Add a user-level budget so no single user can drain the pool or run up overage (hard stop at the limit).'),
        t('Overage costs the same $0.01 per credit as included credits, so adding seats does not make credits cheaper. It only pays off when the new seats get used.'),
      ],
      affected: who(top),
      affectedCount: profiles.filter((user) => user.net > 0).length,
      docs: [DOCS.budgets, DOCS.optimize],
      jump: { page: 'spend', label: t('Open Usage and pool') },
    });
  }

  // 2. Pool exhaustion and projected overage ------------------------------
  if (poolWhole) {
    const lines: string[] = [];
    let projNet = 0;
    for (const month of pool.months) {
      if (month.exhaustedOn !== null) {
        lines.push(t('{month}: pool used up on {day} (day {n} of {total}).', { month: month.label, day: fmtDay(month.exhaustedOn), n: month.exhaustedOn - month.monthStart + 1, total: month.daysInMonth }));
      }
      const projection = month.projection;
      if (projection) {
        if (month.exhaustedOn === null && projection.exhaustionDate !== null) lines.push(t('{month}: on the current pace the pool runs out around {day}.', { month: month.label, day: fmtDay(projection.exhaustionDate) }));
        if (projection.projNet > 0.005) {
          projNet += projection.projNet;
          lines.push(t('{month}: projected billed overage {amount} (range {low} to {high}).', { month: month.label, amount: fmtUSD(projection.projNet, 0), low: fmtUSD(projection.projNetLow, 0), high: fmtUSD(projection.projNetHigh, 0) }));
        }
      }
    }
    const budget = pool.budget;
    if (budget) lines.push(budgetLine(budget));
    if (lines.length) {
      const budgetHit = budget?.projectedBurn != null && budget.projectedBurn >= 1;
      add({
        id: 'pool-exhaustion',
        theme: 'pool',
        audience: ['management', 'admin'],
        severity: budgetHit ? 'critical' : totals.net > 0.005 || projNet > 0 ? 'high' : 'medium',
        title: pool.monthsExhausted > 0 ? t('The shared pool runs out before month end') : t('The shared pool is on track to run out'),
        summary: t('Included credits are pooled across all seats and reset on the 1st (UTC); unused credits do not carry over.'),
        evidence: lines,
        actions: [
          t('Configure an enterprise or organization budget with alerts (for example at 75% and 90%) so exhaustion is visible early.'),
          t('Decide deliberately: allow metered overage with a cap, or block at the limit. Maximum bill = seat fees + the budget.'),
          t('Apply the usage levers below to push the exhaustion date later.'),
        ],
        impactUsd: 0,
        docs: [DOCS.budgets, DOCS.budgetStart],
        jump: { page: 'spend', label: t('Open pool timeline') },
      });
    }
  }

  // 3. Pool under-use --------------------------------------------------------
  if (poolWhole && !pool.capacityExceeded && capacityTotal > 0 && poolUse < 0.6) {
    const waste = (capacityTotal - usedTotal) / nMonths;
    const lower = pool.capacityIsLowerBound;
    add({
      id: 'pool-underuse',
      theme: 'pool',
      audience: ['management', 'admin'],
      severity: poolUse < 0.3 ? 'medium' : 'low',
      title: lower ? t('Included credits are at most {share} used', { share: fmtPct(poolUse, 0) }) : t('Only {share} of the included credits are used', { share: fmtPct(poolUse, 0) }),
      summary: t('About {amount} of seat value per month goes unused.', { amount: fmtUSD(waste, 0) }),
      evidence: [
        t('Included credits {credits}/month, projected usage {usage}/month.', { credits: fmtUSD(capacityTotal / nMonths, 0), usage: fmtUSD(usedTotal / nMonths, 0) }),
        lower
          ? t('Only users in this report fund the current estimate. Add a complete license list in Settings for a better estimate; past months may still differ.')
          : t('The estimate includes your license list and extra seats. It may not match the seats assigned in past months.'),
      ],
      actions: [t('Reclaim or reassign idle seats (see the seat recommendations).'), t('Roll out to the teams that have licenses but little usage, for example with short training sessions.')],
      confidence: lower ? 'low' : baseConf,
      docs: [DOCS.seats, DOCS.licenseUsage],
      jump: { page: 'spend', label: t('Open Usage and pool') },
    });
  }

  // 4. Idle seats ------------------------------------------------------------
  const idleCount = seats.idle.length + seats.unused.length;
  const idleValue = seats.idleValue + seats.unusedValue;
  if (poolWhole && !pool.capacityExceeded && idleCount > 0 && idleValue > 0) {
    const cash = cashSaving(months, 0, idleValue) / nMonths;
    const ratio = cash / idleValue;
    const title =
      ratio >= 0.5
        ? t('Reclaim {seats} to save about {amount}/month', { seats: pluralize(idleCount, 'idle seat'), amount: fmtUSD(cash, 0) })
        : cash > 0.5
          ? t('{seats}, but only {amount}/month is recoverable', { seats: pluralize(idleCount, 'idle seat'), amount: fmtUSD(cash, 0) })
          : tp(idleCount, '{n} idle seat currently funds the pool for heavier users', '{n} idle seats currently fund the pool for heavier users', { n: fmtInt(idleCount) });
    add({
      id: 'idle-seats',
      theme: 'pool',
      audience: ['management', 'admin'],
      severity: ratio >= 0.5 && cash >= 50 ? 'medium' : 'low',
      title,
      summary:
        cash > 0.5
          ? t('Seats are worth {value}/month. Removing them shrinks the pool, so only the unused part of the pool ({cash}) turns into cash.', { value: fmtUSD(idleValue, 0), cash: fmtUSD(cash, 0) })
          : t('Removing these seats would not lower the bill while the pool is fully used: heavy users would simply pay for those credits as overage. Reassign the seats to people who will use them.'),
      evidence: [
        ...(seats.idle.length
          ? [
              t('{users} in the report with minimal use and little activity (seat value {value}/month): {names}.', {
                users: pluralize(seats.idle.length, 'user'),
                value: fmtUSD(seats.idleValue, 0),
                names: brief(seats.idle.map((seat) => ({ name: seat.name }))),
              }),
            ]
          : []),
        ...(seats.unused.length
          ? [
              tp(seats.unused.length, '{n} roster seat never appears in the report ({value}/month): {names}.', '{n} roster seats never appear in the report ({value}/month): {names}.', {
                n: fmtInt(seats.unused.length),
                value: fmtUSD(seats.unusedValue, 0),
                names: brief(seats.unused.map((seat) => ({ name: seat.name }))),
              }),
            ]
          : []),
        ...(context.settings.roster.some((seat) => seat.source === 'api' || seat.source === 'activity' || seat.lastActivityAt !== undefined || seat.pendingCancellation)
          ? [t('Only dated activity from the license list is used here. Recently active seats and seats pending cancellation are excluded. Seats without a recent activity date are not counted as idle. Check the Licenses page for the recorded activity dates.')]
          : []),
      ],
      actions: [
        t('Check the license usage view or usage metrics for completions and chat activity before removing a seat.'),
        t('Ask the owners whether they still need access; reassign or reclaim the seats.'),
        t('Revisit at the next billing cycle: seat removals apply from the start of the next cycle.'),
      ],
      impactUsd: idleValue,
      impactKind: 'seats',
      cashUsd: cash,
      confidence: scopeDays >= 21 ? 'medium' : 'low',
      caveat: t('This report covers AI-credit usage only. Code completions and next edit suggestions are not billed in credits and do not appear, so "idle in this report" is not the same as "idle seat".'),
      affected: who(profiles.filter((user) => seats.idle.some((seat) => seat.id === user.id))),
      affectedCount: idleCount,
      docs: [DOCS.licenseUsage, DOCS.seats],
      jump: { page: 'users', label: t('Show low-activity users'), filters: { tiers: ['minimal'], segments: ['dormant', 'lapsed'] } },
    });
  }

  // 5. Enterprise to Business downgrade ----------------------------------------
  if (poolWhole && !pool.capacityExceeded && seats.downgrade.length > 0) {
    const cash = cashSaving(months, 0, seats.downgradeValue) / nMonths;
    add({
      id: 'downgrade',
      theme: 'pool',
      audience: ['management', 'admin'],
      severity: cash >= 40 ? 'medium' : 'low',
      title: tp(seats.downgrade.length, '{n} Enterprise user never needed more than the Business allotment', '{n} Enterprise users never needed more than the Business allotment', {
        n: fmtInt(seats.downgrade.length),
      }),
      summary: t('Switching them to Business saves $20 per seat per month ({total} in total) when they do not use Enterprise-only features.', { total: fmtUSD(seats.downgradeValue, 0) }),
      evidence: [
        t('Peak monthly usage stayed at or below 80% of the $19 Business allotment: {names}.', { names: brief(seats.downgrade) }),
        t('Cash impact after pool slack: {amount}/month (the smaller pool is only a saving when it was not fully used).', { amount: fmtUSD(cash, 0) }),
      ],
      actions: [t('Confirm none of these users depend on Enterprise-only capabilities.'), t('Downgrade at the start of a billing cycle; decreases apply from the next cycle.')],
      impactUsd: seats.downgradeValue,
      impactKind: 'seats',
      cashUsd: cash,
      confidence: scopeDays >= 21 ? 'medium' : 'low',
      affected: who(profiles.filter((user) => seats.downgrade.some((seat) => seat.id === user.id))),
      affectedCount: seats.downgrade.length,
      docs: [DOCS.seats],
      jump: { page: 'users', label: t('Open Users') },
    });
  }

  // 6. Usage concentration ---------------------------------------------------
  if (profiles.length >= 5) {
    const topUserShare = profiles[0].share;
    const topThreeShare = profiles.slice(0, 3).reduce((total, user) => total + user.share, 0);
    const aUsers = users.groups.pareto.A.users;
    if (topUserShare >= 0.25 || topThreeShare >= 0.5) {
      add({
        id: 'concentration',
        theme: 'governance',
        audience: ['management'],
        severity: topUserShare >= 0.4 ? 'high' : 'medium',
        title: t('{share} of usage comes from three users', { share: fmtPct(topThreeShare, 0) }),
        summary: t('{a} of {n} users ({share}) generate at least {threshold} of attributed usage.', {
          a: aUsers,
          n: profiles.length,
          share: fmtPct(aUsers / profiles.length, 0),
          threshold: fmtPct(settings.pareto.a, 0),
        }),
        evidence: [
          t('Top user {name}: {share} of attributed usage ({amount}).', { name: profiles[0].name, share: fmtPct(topUserShare, 0), amount: fmtUSD(profiles[0].gross, 0) }),
          t('Top three: {names} = {share}.', { names: brief(profiles.slice(0, 3), 3), share: fmtPct(topThreeShare, 0) }),
        ],
        actions: [
          t('Review how the heaviest users work: long agent sessions, large contexts and Powerful models drive most cost.'),
          t('Give them targeted coaching and a per-user limit rather than a blanket restriction. They are often your most productive users.'),
        ],
        affected: who(profiles.slice(0, 3)),
        affectedCount: aUsers,
        docs: [DOCS.optimize, DOCS.budgets],
        jump: { page: 'users', label: t('Show Pareto class A'), filters: { paretoClasses: ['A'] } },
      });
    }
  }

  // 7. Runaway users -----------------------------------------------------------
  const runaway = profiles.filter((user) => user.tier === 'runaway');
  if (runaway.length > 0) {
    const { impact, cash } = reduce(fractionOf(step('capRunaway')));
    const taken = runaway.reduce((total, user) => total + Math.max(0, -user.balance), 0);
    const aboveCap = runaway.reduce((total, user) => total + Math.max(0, user.gross - DEFAULT_LEVERS.capUtil * user.allotment), 0);
    add({
      id: 'runaway',
      theme: 'cost',
      audience: ['management', 'admin', 'user'],
      severity: totals.net > 0.005 ? 'high' : 'medium',
      title: tp(runaway.length, '{n} user used at least {multiple}× their included credits', '{n} users used at least {multiple}× their included credits', {
        n: fmtInt(runaway.length),
        multiple: Math.round(settings.tiers.power * 10) / 10,
      }),
      summary: t('They drew {amount} from the shared pool beyond their own allotment.', { amount: fmtUSD(taken, 0) }),
      evidence: [
        ...runaway.slice(0, 5).map((user) =>
          t('{name}: {usage} = {own} of allotment; top model {model}; Auto {auto}.', {
            name: user.name,
            usage: fmtUSD(user.gross, 0),
            own: fmtPctAuto(user.utilization),
            model: user.topModel || t('n/a'),
            auto: fmtPct(user.autoShare, 0),
          }),
        ),
        t('Usage above {cap}× allotment: {above}. The plan assumes {share} of it can be avoided ({saving} over this period).', {
          cap: DEFAULT_LEVERS.capUtil,
          above: fmtUSD(aboveCap, 0),
          share: fmtPct(DEFAULT_LEVERS.capRunaway, 0),
          saving: fmtUSD(step('capRunaway'), 0),
        }),
      ],
      actions: [
        t('Set an individual user-level budget with an expiry date for legitimate heavy work, and a universal budget for everyone else.'),
        t('Use AI credit session limits in GitHub Copilot CLI so one task cannot consume an unbounded amount.'),
        t('Check for automation or agent loops on the days with the highest usage (see Patterns).'),
      ],
      impactUsd: impact,
      cashUsd: cash,
      affected: who(runaway),
      affectedCount: runaway.length,
      docs: [DOCS.budgets, DOCS.sessionLimit],
      jump: { page: 'users', label: t('Show runaway users'), filters: { tiers: ['runaway'] } },
    });
  }

  // 8. Model right-sizing ------------------------------------------------------
  const powerfulShare = totals.tierGross[CATEGORIES.indexOf('Powerful')] / totals.gross;
  if (step('modelShift') > 0 && powerfulShare >= 0.2) {
    const { impact, cash } = reduce(fractionOf(step('modelShift')));
    const rows = levers.shiftRows.filter((shiftRow) => shiftRow.ratio < 1).slice(0, 3);
    add({
      id: 'model-rightsizing',
      theme: 'efficiency',
      audience: ['management', 'user'],
      severity: powerfulShare >= 0.7 ? 'high' : powerfulShare >= 0.4 ? 'medium' : 'low',
      title: t('{share} of usage runs on Powerful models', { share: fmtPct(powerfulShare, 0) }),
      summary: t('Reasoning models are best for architecture and hard debugging. Routine edits, refactors and docs work well on mid-tier models at a fraction of the price.'),
      evidence: [
        ...rows.map((shiftRow) =>
          t('{model} → {target}: {usage} of usage; the same tokens cost {ratio} as much on {target} (price card rates).', {
            model: shiftRow.model,
            target: shiftRow.target,
            usage: fmtUSD(shiftRow.gross, 0),
            ratio: fmtPct(shiftRow.ratio, 0),
          }),
        ),
        t('Moving {share} of Powerful-tier usage to mid-tier models would reduce usage by about {amount} per month ({cash} as cash).', {
          share: fmtPct(DEFAULT_LEVERS.modelShift, 0),
          amount: fmtUSD(impact, 0),
          cash: fmtUSD(cash, 0),
        }),
      ],
      actions: [
        t('Plan with a strong reasoning model, then implement with a mid-tier model in a fresh session.'),
        t('Use lighter models for formatting, docs and small well-scoped changes, and for subagents.'),
        t('Keep the default reasoning level; raise it only for harder tasks.'),
      ],
      impactUsd: impact,
      cashUsd: cash,
      caveat: t('Assumes {share} of Powerful-tier work can move to a mid-tier model without quality loss. Savings use price card ratios for the same token mix.', { share: fmtPct(DEFAULT_LEVERS.modelShift, 0) }),
      affected: who([...profiles].filter((user) => user.profile === 'frontier')),
      affectedCount: profiles.filter((user) => user.profile === 'frontier').length,
      docs: [DOCS.comparison, DOCS.pricing, DOCS.optimize],
      jump: { page: 'models', label: t('Open Models'), filters: { categories: ['Powerful'] } },
    });
  }

  // 9. Auto model selection ----------------------------------------------------
  const auto = context.auto;
  if (step('autoAdoption') > 0 && auto.share < 0.7) {
    const { impact, cash } = reduce(fractionOf(step('autoAdoption')));
    const lowAuto = profiles.filter((user) => user.traits.includes('lowAuto'));
    // A rate counts as seen only when at least one plan has Auto usage that could be priced from token counts.
    const seen = auto.plans.some((plan) => plan.source === 'measured' && plan.rate > 0);
    const measured = auto.plans.filter((plan) => plan.source === 'measured');
    const assumed = t('{rate} (assumed, from Settings)', { rate: fmtPct(auto.assumedRate, 0) });
    const rateNote = measured.length
      ? t('Plan rates: {rates}. Plans without measured Auto usage use {assumed}.', {
          rates: measured.map((plan) => t('{plan} {rate} (measured)', { plan: plan.label, rate: fmtPct(plan.rate, 0) })).join(t(', ')),
          assumed,
        })
      : t('No plan has measured Auto usage, so every plan uses {assumed}.', { assumed });
    add({
      id: 'auto-adoption',
      theme: 'efficiency',
      audience: ['management', 'user'],
      severity: impact >= 0.03 * avgGross && poolWhole ? 'medium' : 'low',
      title: t('Only {share} of usage goes through Auto model selection', { share: fmtPct(auto.share, 0) }),
      summary: seen
        ? t('Auto usage in this report received a discount of {rate} off its original price. {share} of it was priced from token counts.', {
            rate: fmtPct(auto.rate, 0),
            share: fmtPct(auto.measuredShare, 0),
          })
        : t('This report has no measured Auto discount, so the estimate uses the assumed rate of {rate} from Settings.', { rate: fmtPct(auto.assumedRate, 0) }),
      evidence: [
        t('Hand-picked usage: {direct} of {total}.', { direct: fmtUSD(auto.direct, 0), total: fmtUSD(auto.total, 0) }),
        lowAuto.length
          ? t('{users} used Auto for less than {share} of their usage: {names}.', { users: pluralize(lowAuto.length, 'user'), share: fmtPct(settings.lowAuto, 0), names: brief(lowAuto) })
          : t('No user used Auto for less than {share} of their usage.', { share: fmtPct(settings.lowAuto, 0) }),
        t('If {share} of the hand-picked usage went through Auto, usage would drop by about {amount} per month.', { share: fmtPct(DEFAULT_LEVERS.autoAdoption, 0), amount: fmtUSD(impact, 0) }),
      ],
      actions: [
        t('Make Auto the default model in GitHub Copilot Chat, GitHub Copilot CLI and the cloud agent.'),
        t('Pin a specific model only when the task needs it, and keep it for the whole session.'),
      ],
      impactUsd: impact,
      cashUsd: cash,
      caveat: t("The estimate applies the Auto discount rate of each user's plan to hand-picked usage. {rateNote} Auto may route a task to a different model than the one picked by hand.", { rateNote }),
      affected: who(lowAuto),
      affectedCount: lowAuto.length,
      docs: [DOCS.auto, DOCS.optimize],
      jump: { page: 'models', label: t('Show manual selection'), filters: { selection: 'manual' } },
    });
  }

  // 10. Cache reuse --------------------------------------------------------------
  const promptTokens = totals.input + totals.cacheRead + totals.cacheWrite;
  const estTotal = totals.est.input + totals.est.cacheRead + totals.est.cacheWrite + totals.est.output;
  if (store.hasTokens && promptTokens > 0 && estTotal > 0 && step('cacheDiscipline') > 0) {
    const hit = totals.cacheRead / promptTokens;
    const lowCache = profiles.filter((user) => user.traits.includes('lowCache'));
    if (hit < 0.8 || lowCache.length > 0) {
      const { impact, cash } = reduce(fractionOf(step('cacheDiscipline')));
      add({
        id: 'cache',
        theme: 'efficiency',
        audience: ['management', 'user'],
        severity: hit >= 0.8 ? 'low' : step('cacheDiscipline') >= 0.02 * totals.gross ? 'medium' : 'low',
        title:
          hit < 0.8
            ? t('Only {share} of prompt tokens are cache hits', { share: fmtPct(hit, 0) })
            : tp(lowCache.length, '{n} user reuses the prompt cache poorly', '{n} users reuse the prompt cache poorly', { n: fmtInt(lowCache.length) }),
        summary: t('Cached tokens cost about 10% of normal input. Every cache miss re-sends the whole context at full price.'),
        evidence: [
          t('Overall cache hit rate is {share} of prompt tokens.', { share: fmtPct(hit, 0) }),
          t('Cache writes cost {writes} of priced usage; cache reads {reads}.', { writes: fmtPct(totals.est.cacheWrite / estTotal, 0), reads: fmtPct(totals.est.cacheRead / estTotal, 0) }),
          lowCache.length
            ? tp(lowCache.length, '{n} user is below {threshold} cache hit: {names}.', '{n} users are below {threshold} cache hit: {names}.', {
                n: fmtInt(lowCache.length),
                threshold: fmtPct(settings.lowCacheHit, 0),
                names: brief(lowCache),
              })
            : t('No individual user is below the cache-hit threshold.'),
          t('Turning {share} of cache writes into reads would reduce usage by about {amount} per month.', { share: fmtPct(DEFAULT_LEVERS.cacheDiscipline, 0), amount: fmtUSD(impact, 0) }),
        ],
        actions: [
          t("Don't switch models mid-session; the next request rebuilds the cache from scratch."),
          t('Start a new session, or /compact in GitHub Copilot CLI, instead of resuming an old thread: caches expire after 1 hour (most models) or 24 hours (OpenAI).'),
          t("Don't change reasoning effort, context size or enabled tools and MCP servers during a session."),
        ],
        impactUsd: impact,
        cashUsd: cash,
        affected: who(lowCache),
        affectedCount: lowCache.length,
        docs: [DOCS.optimize, DOCS.pricing],
        jump: { page: 'efficiency', label: t('Open Efficiency'), filters: lowCache.length ? { traits: ['lowCache'] } : undefined },
      });
    }
  }

  // 11. Context hygiene ------------------------------------------------------------
  if (store.hasTokens && estTotal > 0 && step('contextHygiene') > 0) {
    const inputSide = (totals.est.input + totals.est.cacheRead + totals.est.cacheWrite) / estTotal;
    if (inputSide >= 0.5) {
      const { impact, cash } = reduce(fractionOf(step('contextHygiene')));
      add({
        id: 'context',
        theme: 'efficiency',
        audience: ['user', 'management'],
        severity: 'low',
        title: t('{share} of priced usage is prompt context', { share: fmtPct(inputSide, 0) }),
        summary: t('Open tabs, attached files, tool definitions and long conversation history are sent with every request.'),
        evidence: [t('Trimming input-side tokens by {share} would reduce usage by about {amount} per month.', { share: fmtPct(DEFAULT_LEVERS.contextHygiene, 0), amount: fmtUSD(impact, 0) })],
        actions: [
          t('Start a new conversation when you switch problems (/new or a new chat).'),
          t('Use /compact to shrink a long GitHub Copilot CLI session you want to keep, and /context to check usage.'),
          t('Keep AGENTS.md or .github/copilot-instructions.md current so agents read fewer files to orient themselves.'),
          t('Enable only the MCP toolsets the task needs.'),
        ],
        impactUsd: impact,
        cashUsd: cash,
        docs: [DOCS.context, DOCS.optimize],
        jump: { page: 'efficiency', label: t('Open Efficiency') },
      });
    }
  }

  // 12. Long-context surcharge -------------------------------------------------------
  if (totals.longPremium > 0.005 && step('longContext') > 0) {
    const { impact, cash } = reduce(fractionOf(step('longContext')));
    const longContextUsers = profiles
      .filter((user) => user.longShare > 0)
      .sort((a, b) => b.longShare * b.gross - a.longShare * a.gross);
    // The link and the affected list both use the long-context trait, so they always select the same users.
    const heavy = longContextUsers.filter((user) => user.traits.includes('longContext'));
    const modelNames = store.dicts.model.values;
    const topModels = [...Array(modelNames.length).keys()]
      .filter((modelId) => aggregates.modelExtra.longPremium[modelId] > 0)
      .sort((a, b) => aggregates.modelExtra.longPremium[b] - aggregates.modelExtra.longPremium[a])
      .slice(0, 3);
    const share = totals.longPremium / totals.gross;
    add({
      id: 'long-context',
      theme: 'efficiency',
      audience: ['management', 'user'],
      severity: share >= 0.05 ? 'medium' : 'low',
      title: t('Long-context surcharges cost at least {amount}', { amount: fmtUSD(totals.longPremium, 0) }),
      summary: t("{share} of usage is the surcharge on requests whose prompts crossed a model's long-context threshold.", { share: fmtPct(share, 1) }),
      evidence: [
        tp(totals.longPremiumRows, '{n} request was billed at the long-context rate.', '{n} requests were billed at the long-context rate.', { n: fmtInt(totals.longPremiumRows) }),
        topModels.length
          ? t('Mostly on {models}.', { models: topModels.map((modelId) => `${modelNames[modelId]} (${fmtUSD(aggregates.modelExtra.longPremium[modelId], 0)})`).join(t(', ')) })
          : '',
        longContextUsers.length ? t('Most affected users: {names}.', { names: brief(longContextUsers, 4) }) : '',
      ].filter(Boolean),
      actions: [
        t('Split work into smaller tasks or summarize earlier steps instead of carrying the whole history.'),
        t('Narrow the file scope and avoid attaching large directories or logs.'),
        t('Pick a model without a long-context tier when the task does not need a huge window.'),
      ],
      impactUsd: impact,
      cashUsd: cash,
      caveat: t('The premium is a conservative lower bound estimated from token counts and price card rates.'),
      affected: who(heavy),
      affectedCount: heavy.length,
      docs: [DOCS.pricing, DOCS.context],
      jump: heavy.length
        ? { page: 'efficiency', label: t('Show long-context users'), filters: { traits: ['longContext'] } }
        : { page: 'efficiency', label: t('Open Efficiency') },
    });
  }

  // 13. Budgets and guardrails -----------------------------------------------------------
  {
    const monthCount = aggregates.nMonths;
    const scale = new Float64Array(monthCount).fill(1);
    for (const month of pool.months) if (month.projection && month.projection.mtdGross > 0) scale[month.slot] = Math.min(8, month.projection.projGross / month.projection.mtdGross);
    const userMonthUsage: number[] = [];
    const userMonthGross = aggregates.userMonthGross;
    const userCount = store.dicts.user.values.length;
    for (let userId = 1; userId < userCount; userId++) for (let k = 0; k < monthCount; k++) if (userMonthGross[userId * monthCount + k] > 0) userMonthUsage.push(userMonthGross[userId * monthCount + k] * scale[k]);
    userMonthUsage.sort((a, b) => a - b);
    const poolRisk = poolWhole && (pool.monthsExhausted > 0 || pool.months.some((month) => month.projection && month.projection.projNet > 0.005));
    const risky = totals.net > 0.005 || runaway.length > 0 || poolRisk;
    if (userMonthUsage.length >= 5 && risky && budgetOf(settings) === null) {
      const cap = ceil5(quantile(userMonthUsage, 0.9));
      const above = userMonthUsage.filter((usage) => usage > cap).length;
      const excess = userMonthUsage.reduce((total, usage) => total + Math.max(0, usage - cap), 0);
      const monthlyNet = pool.months.length ? pool.months.reduce((total, month) => total + (month.projection ? month.projection.projNet : month.net), 0) / pool.months.length : 0;
      const entBudget = monthlyNet > 0.5 ? ceil5(monthlyNet * 1.25) : 100;
      add({
        id: 'budgets',
        theme: 'governance',
        audience: ['management', 'admin'],
        severity: totals.net > 0.005 ? 'high' : 'medium',
        title: t('Put budgets in place before the next overage'),
        summary: t('User-level budgets protect the shared pool; enterprise, organization and cost-center budgets cap what you pay once the pool is empty.'),
        evidence: [
          t('A per-user monthly limit near the 90th percentile of monthly usage (about {cap}) would have touched {above} of {total} user-months and held back {excess} of usage.', {
            cap: fmtUSD(cap, 0),
            above: fmtInt(above),
            total: fmtInt(userMonthUsage.length),
            excess: fmtUSD(excess, 0),
          }),
          monthlyNet > 0.5
            ? t('A metered-overage budget of about {budget} per month covers the projected overage with 25% headroom. Your maximum bill = seat fees + that budget.', { budget: fmtUSD(entBudget, 0) })
            : t('No overage so far, so an enterprise budget can start small (for example {budget}) and act as an early warning. Your maximum bill = seat fees + that budget.', { budget: fmtUSD(entBudget, 0) }),
          ...(context.github && context.github.copilotBudgets.length > 0
            ? [
                tp(
                  context.github.copilotBudgets.length,
                  'The GitHub data file lists {n} budget for GitHub Copilot. Check it on the Budgets page before you add more.',
                  'The GitHub data file lists {n} budgets for GitHub Copilot. Check them on the Budgets page before you add more.',
                  { n: fmtInt(context.github.copilotBudgets.length) },
                ),
              ]
            : []),
        ],
        actions: [
          t('Create a universal user-level budget for fair access to the pool. It is a hard stop on pool and metered usage combined.'),
          t('Add individual or cost-center user-level budgets (with expiry) for teams that legitimately need more.'),
          t('Set an enterprise budget with alerts for the overage phase, and use cost-center included-usage controls to keep each team within the credits its licenses fund.'),
        ],
        caveat: t('The suggested figures are starting points based on the loaded data. Review with team leads before enforcing a hard stop.'),
        docs: [DOCS.budgets, DOCS.budgetTuning, DOCS.budgetStart],
        jump: { page: 'settings', label: t('Enter your budget in Settings') },
      });
    }
  }

  // 14. Attribution -------------------------------------------------------------------------
  if (users.hasCostCenters) {
    const noCostCenter = users.groups.trait.noCostCenter;
    if (noCostCenter.users > 0) {
      const names = profiles.filter((user) => user.traits.includes('noCostCenter'));
      add({
        id: 'cost-center-coverage',
        theme: 'governance',
        audience: ['admin', 'management'],
        severity: noCostCenter.gross / totals.gross >= 0.2 ? 'medium' : 'low',
        title: tp(noCostCenter.users, '{n} user is not assigned to a cost center', '{n} users are not assigned to a cost center', { n: fmtInt(noCostCenter.users) }),
        summary: t('{amount} ({share} of usage) cannot be charged back or budgeted by team.', { amount: fmtUSD(noCostCenter.gross, 0), share: fmtPct(noCostCenter.gross / totals.gross, 0) }),
        evidence: [t('Without a cost center: {names}.', { names: brief(names) })],
        actions: [
          t('Assign every licensed user to a cost center (directly, through an organization or an enterprise team).'),
          t('Then use cost-center budgets and included-usage controls to keep each team within its own credits.'),
        ],
        affected: who(names),
        affectedCount: noCostCenter.users,
        docs: [DOCS.budgets],
        jump: { page: 'organization', label: t('Show unassigned users'), filters: { traits: ['noCostCenter'] } },
      });
    }
  }
  if (totals.unattributedGross >= 1 && totals.unattributedGross / totals.gross >= 0.01) {
    const byProduct = new Map<number, number>();
    const byRepo = new Map<number, number>();
    for (let i = 0; i < store.n; i++) {
      if (context.mask !== null && context.mask[i] === 0) continue;
      if (store.user[i] !== BLANK_ID) continue;
      byProduct.set(store.product[i], (byProduct.get(store.product[i]) ?? 0) + store.gross[i]);
      byRepo.set(store.repo[i], (byRepo.get(store.repo[i]) ?? 0) + store.gross[i]);
    }
    const top = (grossById: Map<number, number>, dimension: 'product' | 'repo') =>
      [...grossById.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, gross]) => `${labelOf(dimension, store.dicts[dimension].values[id])} (${fmtUSD(gross, 0)})`)
        .join(t(', '));
    add({
      id: 'unattributed',
      theme: 'governance',
      audience: ['admin', 'management'],
      severity: totals.unattributedGross / totals.gross >= 0.15 ? 'medium' : 'low',
      title: t('{amount} is not tied to a user', { amount: fmtUSD(totals.unattributedGross, 0) }),
      summary: t('Repository-level products (such as code quality and security scanning) bill credits without a username, so per-user budgets cannot control them.'),
      evidence: [t('Products: {list}.', { list: top(byProduct, 'product') }), t('Repositories: {list}.', { list: top(byRepo, 'repo') })],
      actions: [t('Review whether those features are needed on every repository.'), t('Track them by repository or cost center and budget them separately from user activity.')],
      docs: [DOCS.budgets, DOCS.monitor],
      jump: { page: 'spend', label: t('Show unattributed usage'), filters: { attribution: 'unattributed' } },
    });
  }
  const mixed = profiles.filter((user) => user.orgMixed);
  if (mixed.length > 0) {
    add({
      id: 'multi-org',
      theme: 'governance',
      audience: ['admin'],
      severity: 'low',
      title: tp(mixed.length, '{n} user bills to more than one organization', '{n} users bill to more than one organization', { n: fmtInt(mixed.length) }),
      summary: t('If these users hold licenses from several organizations, GitHub picks one organization per cycle to bill the seat, so organization budgets apply unpredictably.'),
      evidence: [t('Users: {names}.', { names: brief(mixed) })],
      actions: [t('Give each user a single license source, or use cost-center budgets with direct user assignment.')],
      affected: who(mixed),
      affectedCount: mixed.length,
      docs: [DOCS.budgets],
    });
  }

  // 15. Adoption ----------------------------------------------------------------------------
  if (users.trendReliable) {
    const lapsed = profiles.filter((user) => user.lapsed);
    if (lapsed.length > 0) {
      add({
        id: 'lapsed',
        theme: 'adoption',
        audience: ['management', 'admin'],
        severity: 'low',
        title: t('{users} stopped using AI credits', { users: pluralize(lapsed.length, 'user') }),
        summary: t('No usage for at least {days}, after earlier activity.', { days: pluralize(settings.lapsedDays, 'day') }),
        evidence: [
          t('Together they generated {amount} of usage earlier in the period: {names}.', { amount: fmtUSD(lapsed.reduce((total, user) => total + user.gross, 0), 0), names: brief(lapsed) }),
        ],
        actions: [
          t('Ask what stopped them: blockers, a budget hard stop, or a change of tasks.'),
          t('Offer a short working session on agent mode or the CLI, or reclaim the seat if it is no longer needed.'),
        ],
        affected: who(lapsed),
        affectedCount: lapsed.length,
        docs: [DOCS.licenseUsage],
        jump: { page: 'segments', label: t('Show lapsed users'), filters: { engagement: ['lapsed'] } },
      });
    }
    const fresh = profiles.filter((user) => user.isNew);
    if (fresh.length > 0) {
      add({
        id: 'new-users',
        theme: 'adoption',
        audience: ['management', 'admin'],
        severity: 'positive',
        title: t('{users} started in the last {days}', { users: pluralize(fresh.length, 'new user'), days: pluralize(settings.newUserDays, 'day') }),
        summary: t('They have generated {amount} of usage so far.', { amount: fmtUSD(fresh.reduce((total, user) => total + user.gross, 0), 0) }),
        evidence: [t('New users: {names}.', { names: brief(fresh) })],
        actions: [t('Share the playbook early: Auto by default, one model per session, fresh threads per task.')],
        affected: who(fresh),
        affectedCount: fresh.length,
        docs: [DOCS.optimize],
        jump: { page: 'segments', label: t('Show new users'), filters: { engagement: ['new'] } },
      });
    }
  }
  const champions = profiles.filter((user) => user.persona === 'champion');
  if (champions.length > 0) {
    const championGross = champions.reduce((total, user) => total + user.gross, 0);
    add({
      id: 'champions',
      theme: 'adoption',
      audience: ['management'],
      severity: 'positive',
      title: tp(champions.length, '{n} champion uses GitHub Copilot often and heavily', '{n} champions use GitHub Copilot often and heavily', { n: fmtInt(champions.length) }),
      summary: t('They account for {share} of attributed usage.', { share: fmtPct(championGross / Math.max(1e-9, users.totals.gross), 0) }),
      evidence: [t('Champions: {names}.', { names: brief(champions) })],
      actions: [
        t('Ask them to share workflows, prompts and custom instructions with their teams.'),
        t('Check their model mix and cache hit rate: their habits are the template for everyone else.'),
      ],
      affected: who(champions),
      affectedCount: champions.length,
      jump: { page: 'segments', label: t('Show champions'), filters: { segments: ['champion'] } },
    });
  }
  const spiky = profiles.filter((user) => user.traits.includes('spiky'));
  if (spiky.length > 0) {
    add({
      id: 'spiky',
      theme: 'cost',
      audience: ['user', 'admin'],
      severity: 'low',
      title: tp(spiky.length, '{n} user concentrates their usage on a single day', '{n} users concentrate their usage on a single day', { n: fmtInt(spiky.length) }),
      summary: t("At least {share} of each user's usage happened on one day.", { share: fmtPct(settings.spikeShare, 0) }),
      evidence: spiky.slice(0, 4).map((user) => t('{name}: {share} of {amount} on {day}.', { name: user.name, share: fmtPct(user.peakShare, 0), amount: fmtUSD(user.gross, 0), day: fmtDay(user.peakDayIdx) })),
      actions: [t('Look at what ran on those days: a long agent session, a migration or a loop.'), t('Use AI credit session limits for open-ended agent tasks.')],
      affected: who(spiky),
      affectedCount: spiky.length,
      docs: [DOCS.sessionLimit],
      jump: { page: 'users', label: t('Show spiky users'), filters: { traits: ['spiky'] } },
    });
  }

  // 16. Trend and anomalies ----------------------------------------------------------------------
  // A change only matters when the weeks involved carry a meaningful share of the total.
  const trendMaterial = Math.max(context.trend.recent, context.trend.prior) >= Math.max(5, 0.05 * totals.gross);
  if (context.trend.reliable && Number.isFinite(context.trend.change) && trendMaterial) {
    const change = context.trend.change;
    const accel = profiles.filter((user) => user.traits.includes('accelerating')).sort((a, b) => b.recent - b.prior - (a.recent - a.prior));
    if (change >= 0.5) {
      add({
        id: 'trend-up',
        theme: 'cost',
        audience: ['management', 'admin'],
        severity: change >= 1 || totals.net > 0.005 ? 'high' : 'medium',
        title: change >= 2 ? t('Usage is accelerating: {multiple} the week before', { multiple: fmtMultiple(1 + change) }) : t('Usage is accelerating: +{share} week over week', { share: fmtPct(change, 0) }),
        summary: t('If this pace continues, the pool runs out sooner than the monthly average suggests.'),
        evidence: [
          t('Last 7 days {recent} vs {prior} in the 7 days before.', { recent: fmtUSD(context.trend.recent, 0), prior: fmtUSD(context.trend.prior, 0) }),
          accel.length ? t('Fastest growth: {list}.', { list: accel.slice(0, 3).map((user) => `${user.name} (${fmtUSD(user.prior, 0)} → ${fmtUSD(user.recent, 0)})`).join(t(', ')) }) : '',
        ].filter(Boolean),
        actions: [t('Find out what changed: a new rollout, a new model or an automation.'), t('Put alerts on the pool before it is exhausted.')],
        affected: who(accel),
        affectedCount: accel.length,
        docs: [DOCS.monitor],
        jump: { page: 'patterns', label: t('Open Patterns') },
      });
    } else if (change <= -0.4) {
      add({
        id: 'trend-down',
        theme: 'adoption',
        audience: ['management'],
        severity: 'info',
        title: t('Usage dropped {share} week over week', { share: fmtPct(-change, 0) }),
        summary: t('A sharp fall can mean a holiday, a freeze, or users blocked by a budget limit.'),
        evidence: [t('Last 7 days {recent} vs {prior} in the 7 days before.', { recent: fmtUSD(context.trend.recent, 0), prior: fmtUSD(context.trend.prior, 0) })],
        actions: [t('Check that user-level budgets are not blocking people unintentionally.')],
        jump: { page: 'patterns', label: t('Open Patterns') },
      });
    }
  }
  if (context.anomalies.length > 0) {
    const top = context.anomalies[0];
    const nameOf = (id: number) => labelOf('user', store.dicts.user.values[id]);
    add({
      id: 'anomalies',
      theme: 'cost',
      audience: ['admin'],
      severity: top.gross >= 0.1 * totals.gross ? 'medium' : 'low',
      title: t('{days} with unusually high usage', { days: pluralize(context.anomalies.length, 'day') }),
      summary: t('The biggest, {day}, reached {multiple} a typical day.', { day: fmtDay(top.day, true), multiple: fmtMultiple(top.multiple) }),
      evidence: context.anomalies.slice(0, 4).map((anomaly) => {
        const topUser = anomaly.topUsers[0];
        const modelName = anomaly.topModels[0] ? store.dicts.model.values[anomaly.topModels[0].id] : '';
        const values = {
          day: fmtDay(anomaly.day, true),
          amount: fmtUSD(anomaly.gross, 0),
          multiple: fmtMultiple(anomaly.multiple),
          user: topUser ? nameOf(topUser.id) : '',
          userAmount: topUser ? fmtUSD(topUser.gross, 0) : '',
          model: modelName,
        };
        if (topUser && modelName) return t('{day}: {amount} ({multiple} typical), mostly {user} ({userAmount}) on {model}.', values);
        if (topUser) return t('{day}: {amount} ({multiple} typical), mostly {user} ({userAmount}).', values);
        if (modelName) return t('{day}: {amount} ({multiple} typical) on {model}.', values);
        return t('{day}: {amount} ({multiple} typical).', values);
      }),
      actions: [
        t('Open those days in Patterns and look at who and which model drove them.'),
        t('Use session limits and budgets so a single runaway task cannot cost this much again.'),
      ],
      docs: [DOCS.sessionLimit, DOCS.budgets],
      jump: { page: 'patterns', label: t('Open Patterns'), filters: { dateFrom: top.day, dateTo: top.day } },
    });
  }

  // 17. Organization and cost-center balance ------------------------------------------------------------
  {
    const lines: string[] = [];
    let flagged = 0;
    const groupBy = (key: 'org' | 'costCenter') => {
      const statsByGroup = new Map<string, { users: number; gross: number; allot: number }>();
      for (const user of profiles) {
        const groupName = (key === 'org' ? user.org : user.costCenter) || '';
        if (!groupName) continue;
        const stats = statsByGroup.get(groupName) ?? { users: 0, gross: 0, allot: 0 };
        stats.users++;
        stats.gross += user.gross;
        stats.allot += user.allotment;
        statsByGroup.set(groupName, stats);
      }
      if (statsByGroup.size < 2) return;
      const rows = [...statsByGroup.entries()].map(([name, stats]) => ({ name, ...stats, use: stats.allot > 0 ? stats.gross / stats.allot : 0 }));
      const over = rows.filter((group) => group.use >= 1.5 && group.gross - group.allot >= 20 && group.users >= 2).sort((a, b) => b.gross - b.allot - (a.gross - a.allot));
      const under = rows.filter((group) => group.use < 0.25 && group.users >= 3).sort((a, b) => a.use - b.use);
      for (const group of over.slice(0, 3)) {
        flagged++;
        const values = { name: group.name, share: fmtPctAuto(group.use), usage: fmtUSD(group.gross, 0), funded: fmtUSD(group.allot, 0), drawn: fmtUSD(group.gross - group.allot, 0) };
        lines.push(
          key === 'org'
            ? t('Organization {name} used {share} of the credits its licenses fund ({usage} vs {funded}); it draws {drawn} from the pool.', values)
            : t('Cost center {name} used {share} of the credits its licenses fund ({usage} vs {funded}); it draws {drawn} from the pool.', values),
        );
      }
      for (const group of under.slice(0, 2)) {
        flagged++;
        const values = { name: group.name, share: fmtPctAuto(group.use), users: pluralize(group.users, 'user') };
        lines.push(key === 'org' ? t('Organization {name} used only {share} of its licensed credits ({users}).', values) : t('Cost center {name} used only {share} of its licensed credits ({users}).', values));
      }
    };
    groupBy('org');
    groupBy('costCenter');
    if (flagged > 0) {
      add({
        id: 'group-balance',
        theme: 'governance',
        audience: ['management', 'admin'],
        severity: 'low',
        title: t('Some teams lend credits to the pool while others draw heavily from it'),
        summary: t('Pooling hides the difference. Teams that draw far more than their licenses fund may need a budget or a different seat mix.'),
        evidence: lines,
        actions: [
          t('Use cost-center included-usage controls to cap each team at the credits its licenses fund, choosing block or paid overage when it is reached.'),
          t('Move under-using teams to coaching or fewer seats.'),
        ],
        docs: [DOCS.budgets],
        jump: { page: 'organization', label: t('Open Organization') },
      });
    }
  }

  // 18. Budgets, seats and billing from the GitHub data file ------------------------------------------------------------
  const github = context.github ?? null;
  if (github !== null) {
    const collectedOn = t('As of {day}, when the GitHub data was collected.', { day: fmtDay(parseIsoDay(github.collection.header.day), true) });
    const githubBudget = github.budget;

    if (githubBudget !== null && !narrowed) {
      const amount = fmtUSD(githubBudget.amount, 0);
      // The report's view of the same budget, only when the analysis compares with the same amount in the month the data was collected.
      const sameMonth = pool.latest !== null && pool.latest.month === monthOfKey(github.collection.header.day.slice(0, 7));
      const reportBudget = sameMonth && pool.budget !== null && Math.abs(pool.budget.monthlyBudget - githubBudget.amount) < 0.005 ? pool.budget : null;
      const consumedShare = githubBudget.consumed !== null && githubBudget.amount > 0 ? githubBudget.consumed / githubBudget.amount : null;
      const reached = (consumedShare ?? 0) >= 1 || (reportBudget?.burn ?? 0) >= 1;
      const projectedOver = (reportBudget?.projectedBurn ?? 0) >= 1 || (reportBudget !== null && reportBudget.hitDate !== null);
      const near = (consumedShare ?? 0) >= 0.8 || (reportBudget?.burn ?? 0) >= 0.8;
      const evidence: string[] = [];
      if (githubBudget.consumed !== null && consumedShare !== null) {
        evidence.push(t('GitHub shows {consumed} of the {amount} budget used ({share}).', { consumed: fmtUSD(githubBudget.consumed, 0), amount, share: fmtPct(consumedShare, 0) }) + ' ' + collectedOn);
      }
      if (reportBudget !== null) evidence.push(budgetLine(reportBudget));

      if (!githubBudget.stopsUsage && (reached || projectedOver || near)) {
        add({
          id: 'budget-no-stop',
          theme: 'governance',
          audience: ['management', 'admin'],
          severity: reached || projectedOver ? 'high' : 'medium',
          title: t('The {amount} budget only sends alerts, so the bill can go past it', { amount }),
          summary: t('This budget does not stop usage. GitHub keeps billing after the limit and only sends alerts. Decide whether that is what you want.'),
          evidence: [
            ...evidence,
            githubBudget.willAlert ? t('Budget alerts are on: GitHub sends an email at 75%, 90% and 100% of the budget.') : t('Budget alerts are off, so nobody is told when the budget runs out.'),
          ],
          actions: [
            t('To cap the bill, edit the budget and select "Stop usage when budget limit is reached".'),
            t('To keep everyone working, raise the budget to what you expect to pay, so its alerts still mean something.'),
            githubBudget.willAlert ? t('Check that the right people get the budget alerts.') : t('Turn on budget alerts so the right people hear about it early.'),
          ],
          confidence: 'high',
          docs: [DOCS.budgets, DOCS.budgetTuning],
          jump: { page: 'spend', label: t('Open Usage and pool') },
        });
      }

      if (githubBudget.stopsUsage && (reached || projectedOver)) {
        add({
          id: 'budget-stop-ahead',
          theme: 'governance',
          audience: ['management', 'admin'],
          severity: 'high',
          title: t('Usage that costs AI credits stops when the {amount} budget runs out', { amount }),
          summary: t('This budget stops usage. Once it runs out, GitHub blocks usage that costs AI credits until the next billing cycle or until the budget is raised.'),
          evidence,
          actions: [
            t('Decide before the limit is reached: raise the budget so the work can go on, or keep the stop and tell people when usage comes back.'),
            t('Apply the usage levers below to make the budget last longer.'),
          ],
          confidence: 'high',
          docs: [DOCS.budgets, DOCS.budgetTuning],
          jump: { page: 'spend', label: t('Open Usage and pool') },
        });
      }
    }

    // In a filtered view only the users in it count.
    const profileByLogin = new Map(profiles.map((user) => [user.name.toLowerCase(), user]));
    const atLimit = github.usersAtLimit.filter((user) => !narrowed || profileByLogin.has(user.login.toLowerCase()));
    if (atLimit.length > 0) {
      const inReport = atLimit.map((user) => profileByLogin.get(user.login.toLowerCase())).filter((user): user is UserProfile => user !== undefined);
      const shown = atLimit.slice(0, 5);
      add({
        id: 'user-budget-reached',
        theme: 'governance',
        audience: ['admin', 'management'],
        severity: 'medium',
        title: tp(atLimit.length, '{n} user reached their budget and cannot use AI credits', '{n} users reached their budget and cannot use AI credits', { n: fmtInt(atLimit.length) }),
        summary: t('Budgets for users always stop usage. These people cannot use features that cost AI credits until the next billing cycle or until their budget is raised.'),
        evidence: [
          ...shown.map((user) => t('{name}: {consumed} used of a {limit} budget.', { name: user.login, consumed: fmtUSD(user.consumed), limit: fmtUSD(user.limit) })),
          ...(atLimit.length > shown.length
            ? [tp(atLimit.length - shown.length, '{n} more user also reached their budget.', '{n} more users also reached their budget.', { n: fmtInt(atLimit.length - shown.length) })]
            : []),
          collectedOn,
        ],
        actions: [
          t('Ask each person whether the work needs more. If it does, give them their own budget, with an end date for a short need.'),
          t('If many people reach the same budget, raise it for everyone or for their cost center.'),
          t('Share the usage levers below with people who reach their budget early in the month.'),
        ],
        confidence: 'high',
        affected: who(inReport),
        affectedCount: atLimit.length,
        docs: [DOCS.budgets, DOCS.budgetTuning],
        jump: inReport.length > 0 ? { page: 'users', label: t('Show these users'), filters: { users: inReport.map((user) => user.name) } } : { page: 'budgets', label: t('Open the Budgets page') },
      });
    }

    const gaps = github.months.filter((check) => check.status === 'lower' || check.status === 'higher');
    if (gaps.length > 0) {
      const lower = gaps.some((check) => check.status === 'lower');
      add({
        id: 'report-gap',
        theme: 'data',
        audience: ['admin'],
        severity: lower ? 'medium' : 'low',
        title: t('The usage report does not match GitHub billing'),
        summary: t('In some months the usage report and GitHub billing do not agree, so figures from the report may be off. GitHub billing is what you pay.'),
        evidence: [
          ...gaps.map((check) =>
            t('{month}: usage {reportUsage} in the report and {githubUsage} at GitHub; billed {reportBilled} and {githubBilled}.', {
              month: monthLabel(monthOfKey(check.month)),
              reportUsage: fmtUSD(check.report.gross, 0),
              githubUsage: fmtUSD(check.github?.gross ?? 0, 0),
              reportBilled: fmtUSD(check.report.net, 0),
              githubBilled: fmtUSD(check.github?.net ?? 0, 0),
            }),
          ),
          ...(github.checkedOrgs.length > 0 ? [t('Only the report rows of {orgs} are compared, the organizations in the GitHub data file.', { orgs: github.checkedOrgs.join(t(', ')) })] : []),
        ],
        actions: [
          ...(lower ? [t('Download the usage report again for the whole month and load all its files together.')] : []),
          t('Check that the usage report and the GitHub data file cover the same enterprise or organizations.'),
        ],
        confidence: 'high',
        jump: { page: 'data', label: t('Open Data') },
      });
    }

    // GitHub counts activity of any kind, code completions too, but early in the billing cycle most seats have none yet.
    const cycleDay = Number(github.collection.header.day.slice(8, 10));
    const autoOrgs = cycleDay >= 15 ? (github.seats?.orgs ?? []).filter((summary) => summary.management === 'assign_all' && (summary.inactiveThisCycle ?? 0) > 0) : [];
    if (autoOrgs.length > 0) {
      const inactive = autoOrgs.reduce((total, summary) => total + (summary.inactiveThisCycle ?? 0), 0);
      const seatTotal = autoOrgs.reduce((total, summary) => total + (summary.total ?? 0), 0);
      add({
        id: 'seat-auto-assign',
        theme: 'governance',
        audience: ['admin', 'management'],
        severity: inactive >= 5 && seatTotal > 0 && inactive / seatTotal >= 0.2 ? 'medium' : 'low',
        title: tp(autoOrgs.length, '{n} organization gives a seat to every member, used or not', '{n} organizations give a seat to every member, used or not', { n: fmtInt(autoOrgs.length) }),
        summary: t('Each member of these organizations gets a paid seat, and billing starts when the seat is given, not at first use. Giving seats only to chosen members or teams keeps them for people who use them.'),
        evidence: [
          ...autoOrgs.map((summary) =>
            t('{org}: {inactive} of {total} seats had no GitHub Copilot activity this billing cycle.', { org: summary.org, inactive: fmtInt(summary.inactiveThisCycle ?? 0), total: fmtInt(summary.total ?? 0) }),
          ),
          collectedOn,
        ],
        actions: [
          t('In the GitHub Copilot settings of the organization, give access to selected members or teams instead of all members.'),
          t('Ask the owners of the inactive seats whether they still need access.'),
          t('Revisit at the next billing cycle: seat removals apply from the start of the next cycle.'),
        ],
        confidence: 'high',
        docs: [DOCS.grantAccess, DOCS.seats],
        jump: { page: 'organization', label: t('Open Organization') },
      });
    }
  }

  // 19. Healthy ----------------------------------------------------------------------------------------------
  if (poolWhole && !pool.capacityExceeded && totals.net <= 0.005 && poolUse >= 0.6 && out.every((recommendation) => SEVERITY_ORDER[recommendation.severity] > 1)) {
    add({
      id: 'healthy',
      theme: 'pool',
      audience: ['management'],
      severity: 'positive',
      title: t('The pool is well used and fully covered'),
      summary: t('Utilization is about {share} with no billed overage.', { share: fmtPct(Math.min(1, poolUse), 0) }),
      evidence: [t('Usage {usage} against {credits} of included credits.', { usage: fmtUSD(totals.gross, 0), credits: fmtUSD(capacityTotal, 0) })],
      actions: [t('Keep monitoring the trend and set alerts so a change shows up early.')],
      ...(pool.capacityIsLowerBound
        ? { caveat: t('Only users in this report fund the current estimate. Add a complete license list in Settings for a better estimate; past months may still differ.') }
        : {}),
      impactUsd: 0,
      docs: [DOCS.monitor],
    });
  }

  // 20. Missing columns --------------------------------------------------------------------------------------------
  {
    const issues = coverageIssues(context.coverage, users.fallbackQuotaCredits).filter((issue) => issue.severity === 'warn');
    if (issues.length > 0) {
      add({
        id: 'data-coverage',
        theme: 'data',
        audience: ['admin'],
        severity: 'medium',
        title: issues.length === 1 ? issues[0].title : t('The file is missing columns the analysis relies on'),
        summary: t('Some figures are hidden or assumed because of what the file does not contain.'),
        evidence: issues.map((issue) => `${issue.title}. ${issue.detail}`),
        actions: [t('Export the AI usage report again from GitHub and load the complete file.')],
        confidence: 'high',
        jump: { page: 'data', label: t('Open Data') },
      });
    }
  }

  // 21. Data notes -------------------------------------------------------------------------------------------------
  {
    const notes: string[] = [];
    if (!narrowed && pool.capacityExceeded) {
      notes.push(
        context.coverage.billing && context.coverage.quota
          ? t(
              'The pool covered {covered}, more than the {capacity} that the seats in this file fund. Other seats share the pool (a partial export, or files from different billing entities), so pool size, utilization and seat recommendations are not shown. Add your seat roster or extra seats in Settings to complete the picture.',
              { covered: fmtUSD(pool.covered, 0), capacity: fmtUSD(pool.capacity, 0) },
            )
          : t('The size of the pool is unknown (see the missing columns below), so pool size, utilization and seat recommendations are not shown.'),
      );
    } else if (!narrowed && pool.capacityIsLowerBound) {
      notes.push(t('The current estimate only includes users in this report. Add a complete license list in Settings to improve included-credit and seat-activity estimates.'));
    }
    if (scopeDays < 14) notes.push(tp(scopeDays, 'Only {n} day of data: projections and trends are indicative.', 'Only {n} days of data: projections and trends are indicative.', { n: fmtInt(scopeDays) }));
    if (store.hasTokens && totals.unpricedGross > 0.005) {
      // Usage with no price card estimate is on models without a price, or on lines without a model name or token counts.
      const names = store.dicts.model.values;
      let noPrice = 0;
      for (let id = 0; id < names.length; id++) if (names[id] !== '' && context.models.priced[id] === 0) noPrice += aggregates.model.gross[id];
      const noEstimate = Math.max(0, totals.unpricedGross - noPrice);
      if (noPrice > 0.005) notes.push(t('{amount} is on models that are not in the built-in price card. What-if savings exclude them; add overrides in Settings.', { amount: fmtUSD(noPrice, 0) }));
      if (noEstimate > 0.005) notes.push(t('{amount} is on usage lines without token counts or a model name, so price card estimates and what-if savings exclude it.', { amount: fmtUSD(noEstimate, 0) }));
    }
    for (const issue of coverageIssues(context.coverage, users.fallbackQuotaCredits)) notes.push(`${issue.title}. ${issue.detail}`);
    notes.push(t('The report covers AI-credit usage only. Code completions and next edit suggestions are not included.'));
    const duplicateCount = store.files.reduce((total, file) => total + file.duplicatesDropped, 0);
    const bad = store.files.reduce((total, file) => total + file.badDateRows + file.badNumberCells + file.negativeRows + file.balanceMismatchRows, 0);
    if (duplicateCount > 0) notes.push(tp(duplicateCount, '{n} duplicate row was dropped while merging files.', '{n} duplicate rows were dropped while merging files.', { n: fmtInt(duplicateCount) }));
    if (bad > 0) notes.push(t('{count} failed validation (see Data).', { count: pluralize(bad, 'row or cell', 'rows or cells') }));
    add({
      id: 'data-notes',
      theme: 'data',
      audience: ['admin'],
      severity: 'info',
      title: t('How to read these numbers'),
      summary: t('Estimates are only as complete as the loaded files.'),
      evidence: notes,
      actions: [],
      confidence: 'high',
      jump: { page: 'data', label: t('Open Data') },
    });
  }

  // Largest monthly value first; equal values (most findings that save nothing) go by severity, then keep the order they were found in.
  out.sort((a, b) => recValue(b) - recValue(a) || SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  return out;
}

export function buildHeadline(context: RecContext, recommendations: Recommendation[]): Headline {
  const totals = context.agg.totals;
  if (!context.coverage.billing) {
    return {
      status: 'watch',
      title: t('This file does not say what was billed'),
      detail: t('Overage, pool and seat findings need the discount_amount, net_amount and total_monthly_quota columns.'),
    };
  }
  const urgent = recommendations.filter((recommendation) => recommendation.severity === 'critical' || recommendation.severity === 'high').length;
  const watch = recommendations.filter((recommendation) => recommendation.severity === 'medium').length;
  const utilization = context.narrowed || context.pool.capacityExceeded ? null : context.pool.utilization;
  const detail = [
    utilization !== null && Number.isFinite(utilization) ? t('Pool utilization {share}', { share: fmtPct(Math.min(1, utilization), 0) }) : null,
    context.coverage.models ? t('Auto {share} of usage', { share: fmtPct(context.auto.share, 0) }) : null,
    pluralize(context.users.profiles.length, 'active user'),
  ]
    .filter(Boolean)
    .join(' · ');
  if (urgent > 0) {
    return {
      status: 'action',
      title: totals.net > 0.005 ? t('{amount} billed overage and {actions}', { amount: fmtUSD(totals.net, 0), actions: pluralize(urgent, 'high-priority action') }) : pluralize(urgent, 'high-priority action'),
      detail,
    };
  }
  if (watch > 0) return { status: 'watch', title: t('No urgent issues, {items} worth a look', { items: pluralize(watch, 'item') }), detail };
  return { status: 'healthy', title: t('Usage looks healthy'), detail };
}
