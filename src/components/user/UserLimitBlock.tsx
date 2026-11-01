import { type ReactNode, useMemo } from 'react';
import { T, msg, t } from '../../i18n';
import { collectionMonth, sourceComplete, userTarget, type UserCostCenter, type UserTarget } from '../../lib/collection';
import { fmtDay, monthStartDay, parseIsoDay } from '../../lib/utils/date';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { levelTone, limitKindLabel } from '../../pages/budgets/levels';
import { budgetName, collectedDay, monthName } from '../../pages/githubText';
import { useAnalysis } from '../../state/analysis';
import { EChart, useChartColors, type EChartsOption } from '../charts/EChart';
import { GRID, usdCompact } from '../charts/helpers';
import { Badge, ProgressBar } from '../ui';
import { DrawerSection } from './DrawerSection';

const USED = msg('Usage so far');
const PROJECTED = msg('Projected');
const SHOWN_BY_GITHUB = msg('Shown by GitHub');

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border-muted py-1.5 last:border-b-0">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="num text-end text-xs font-medium text-fg">{children}</dd>
    </div>
  );
}

/** How the app found the cost center of the user. */
function costCenterText(costCenter: UserCostCenter): string {
  const through = costCenter.through ?? '';
  if (costCenter.source === 'budget') return t('{name}, as GitHub listed it', { name: costCenter.name });
  if (costCenter.source === 'user') return t('{name}, assigned to the user', { name: costCenter.name });
  if (costCenter.source === 'team') return t('{name}, through the team {team}', { name: costCenter.name, team: through });
  if (costCenter.source === 'organization') return t('{name}, through the organization {organization}', { name: costCenter.name, organization: through });
  return t('{name}, from the usage report', { name: costCenter.name });
}

function targetOption(target: UserTarget, monthStart: number, colors: ReturnType<typeof useChartColors>): EChartsOption {
  const { limit, used, lastDay, monthDays, dailyRate } = target;
  const labels = Array.from({ length: monthDays }, (_, dayIndex) => fmtInt(dayIndex + 1));
  const paceDay = target.usedFrom === 'github' ? Math.max(1, target.collectedDay - 1) : lastDay;
  const usage = labels.map((_, dayIndex) => (dayIndex < target.cumulative.length ? target.cumulative[dayIndex] : null));
  const projected = labels.map((_, dayIndex) => (used === null || dayIndex + 1 < paceDay ? null : used + dailyRate * (dayIndex + 1 - paceDay)));
  const top = Math.max(limit.amount, target.projected ?? 0, used ?? 0, ...target.cumulative) * 1.08;
  const usageName = t(USED);
  const projectedName = t(PROJECTED);
  const markPoints = [
    ...(target.usedFrom === 'github' && used !== null
      ? [{ coord: [paceDay - 1, used], itemStyle: { color: colors.accent }, label: { show: true, position: 'left', distance: 6, color: colors.textMuted, backgroundColor: colors.surface, padding: [2, 4], fontSize: 11, formatter: t(SHOWN_BY_GITHUB) } }]
      : []),
    ...(limit.amount > 0 && target.runOutDay !== null && (target.share ?? 0) < 1
      ? [
          {
            coord: [target.runOutDay - 1, limit.amount],
            itemStyle: { color: colors.bad },
            label: {
              show: true,
              position: 'top',
              // Near an edge of the month, the text grows toward the middle so it is not cut off.
              align: target.runOutDay > (monthDays * 2) / 3 ? 'right' : target.runOutDay < monthDays / 3 ? 'left' : 'center',
              color: colors.text,
              fontSize: 11,
              formatter: t('Reaches the limit {date}', { date: fmtDay(monthStart + target.runOutDay - 1) }),
            },
          },
        ]
      : []),
  ];
  return {
    grid: { ...GRID, top: 32, bottom: 4 },
    legend: { top: 0, data: [usageName, projectedName] },
    tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => (value === null || value === undefined ? '–' : fmtUSD(Number(value))) },
    xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { hideOverlap: true } },
    yAxis: { type: 'value', min: 0, max: top > 0 ? Math.ceil(top) : undefined, axisLabel: { formatter: (value: number) => usdCompact(value) } },
    series: [
      {
        name: usageName,
        type: 'line',
        data: usage,
        color: colors.accent,
        showSymbol: false,
        areaStyle: { opacity: 0.25 },
        markLine: {
          symbol: 'none',
          silent: true,
          animation: false,
          label: { formatter: t('Limit {amount}', { amount: fmtUSD(limit.amount, 0) }), position: 'insideStartTop', color: colors.textMuted, fontSize: 11 },
          lineStyle: { type: 'dashed', width: 1.5, color: colors.bad },
          data: [{ yAxis: limit.amount }],
        },
        markPoint: markPoints.length > 0 ? { symbol: 'circle', symbolSize: 9, silent: true, animation: false, z: 6, data: markPoints } : undefined,
      },
      { name: projectedName, type: 'line', data: projected, color: colors.info, showSymbol: false, lineStyle: { type: 'dashed', width: 2 } },
    ],
  } as EChartsOption;
}

/**
 * The limit GitHub holds a user to for AI credits, set as the user's target for the month: a budget of their own,
 * the limit of their cost center or the limit for each user. Shown only when a GitHub data file with budgets is loaded.
 */
export function UserLimitBlock({ login, name }: { login: string; name: string }) {
  const { github, store } = useAnalysis();
  const colors = useChartColors();
  const collection = github?.collection ?? null;
  const budgetsRead = collection !== null && sourceComplete(collection.sources, 'budgets');
  const target = useMemo(() => (collection !== null && budgetsRead ? userTarget(collection, store, login) : null), [collection, budgetsRead, store, login]);
  const monthStart = collection !== null ? monthStartDay(collectionMonth(collection)) : 0;
  const option = useMemo(() => (target !== null && target.used !== null ? targetOption(target, monthStart, colors) : null), [target, monthStart, colors]);
  if (collection === null || !budgetsRead) return null;

  const month = monthName(collection.header.day.slice(0, 7));
  if (target === null) {
    return (
      <DrawerSection title={t('AI credit limit')} calc="user-limit">
        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-fg-muted">
          {t('This file cannot identify the user limit that applies. Check the limit and cost center assignment in GitHub.')}
        </p>
      </DrawerSection>
    );
  }

  const { limit, used, share, level } = target;
  const reached = limit.amount === 0 || (share !== null && share >= 1);
  const left = used === null ? null : Math.max(0, limit.amount - used);
  const reachesOn = reached ? t('Already reached') : target.runOutDay !== null ? fmtDay(monthStart + target.runOutDay - 1, true) : t('Not this month');
  const basis =
    target.usedFrom === 'github'
      ? t('Amount used as GitHub showed it on {day}. It counts all usage, included credits too.', { day: collectedDay(collection.header) })
      : target.usedFrom === 'report'
        ? t('GitHub did not list this user, so the amount used is the usage in the report this month, included credits too.')
        : t('The report has no usage for this month, and GitHub did not list this user.');

  return (
    <DrawerSection
      title={t('AI credit limit')}
      calc="user-limit"
      aside={<Badge tone={level !== null ? levelTone(level) : 'neutral'}>{limitKindLabel(limit.kind)}</Badge>}
      description={t('In {month}, GitHub holds this user to this limit, the most specific one that applies. When usage reaches it, GitHub stops their AI credits until the next month. The filters do not change it.', { month })}
    >
      <div className="rounded-lg border border-border-muted bg-surface-2 px-3 py-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="num font-display text-lg font-semibold">
            {used === null ? '–' : fmtUSD(used)}{' '}
            <span className="text-sm font-normal text-fg-muted">
              <T text="of {limit}" values={{ limit: <span className="text-lg font-semibold text-fg">{fmtUSD(limit.amount)}</span> }} />
            </span>
          </p>
          <span className="num text-xs text-fg-muted">{share === null ? '–' : t('{share} used', { share: fmtPct(share, 0) })}</span>
        </div>
        <ProgressBar
          value={share ?? 0}
          ghost={target.projected !== null && limit.amount > 0 ? target.projected / limit.amount : undefined}
          tone={level !== null ? levelTone(level) : 'neutral'}
          className="mt-2"
          label={t('Share of the limit used')}
        />
        <dl className="mt-2">
          <Row label={t('Set by')}>{budgetName(limit.budget)}</Row>
          {limit.costCenter ? <Row label={t('Cost center')}>{costCenterText(limit.costCenter)}</Row> : null}
          {limit.budget.expiresAt ? <Row label={t('Ends')}>{fmtDay(parseIsoDay(limit.budget.expiresAt), true)}</Row> : null}
          <Row label={t('Left this month')}>{left === null ? '–' : fmtUSD(left)}</Row>
          <Row label={t('Projected for the month')}>{target.projected === null ? '–' : fmtUSD(target.projected)}</Row>
          <Row label={t('Reaches the limit')}>{reachesOn}</Row>
          {limit.replaces.map((replaced) => (
            <Row key={replaced.budget.id} label={t('Replaces')}>
              {t('{kind}: {amount}', { kind: limitKindLabel(replaced.kind), amount: fmtUSD(replaced.amount) })}
            </Row>
          ))}
        </dl>
      </div>
      {option ? (
        <div className="rounded-lg border border-border bg-surface px-1 py-2">
          <EChart option={option} height={180} label={t('Usage of {name} against the limit', { name })} exportName="github-copilot-user-limit" />
        </div>
      ) : null}
      <p className="text-xs text-fg-subtle">{basis}</p>
    </DrawerSection>
  );
}
