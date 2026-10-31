import { useMemo, useState } from 'react';
import { useChartColors, type EChartsOption } from '../../components/charts/EChart';
import { GRID, usdCompact } from '../../components/charts/helpers';
import { ChartCard, Select } from '../../components/ui';
import { msg, t } from '../../i18n';
import { budgetPace, collectionMonth, PACE_DAYS, type BudgetOverview, type BudgetPace, type Collection } from '../../lib/collection';
import type { DataStore } from '../../lib/types';
import { fmtDay, monthStartDay } from '../../lib/utils/date';
import { fmtUSD } from '../../lib/utils/format';
import { niceMax } from '../spend/helpers';
import { budgetLabel } from './levels';

const USED = msg('Used so far');
const PROJECTED = msg('Projected');

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="num mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

function paceOption(pace: BudgetPace, amount: number, monthStart: number, colors: ReturnType<typeof useChartColors>): EChartsOption {
  const labels = Array.from({ length: pace.monthDays }, (_, dayIndex) => String(dayIndex + 1));
  const used: (number | null)[] = labels.map((_, dayIndex) => {
    if (pace.basis === 'report') return dayIndex < pace.cumulative.length ? pace.cumulative[dayIndex] : null;
    return dayIndex === pace.lastDay - 1 ? pace.used : null;
  });
  const projected: (number | null)[] = labels.map((_, dayIndex) => {
    const day = dayIndex + 1;
    return day < pace.lastDay ? null : pace.used + pace.dailyRate * (day - pace.lastDay);
  });
  const top = niceMax(Math.max(amount, pace.projected, pace.used) * 1.05);
  const usedName = t(USED);
  const projectedName = t(PROJECTED);
  const runOutMark =
    pace.runOutDay !== null
      ? {
          symbol: 'circle',
          symbolSize: 10,
          silent: true,
          animation: false,
          data: [
            {
              coord: [pace.runOutDay - 1, amount],
              itemStyle: { color: colors.bad },
              label: { show: true, position: 'top', color: colors.text, fontSize: 12, formatter: t('Runs out {date}', { date: fmtDay(monthStart + pace.runOutDay - 1) }) },
            },
          ],
        }
      : undefined;
  return {
    grid: { ...GRID, top: 36, bottom: 8 },
    legend: { top: 0, data: [usedName, projectedName] },
    tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => (value === null || value === undefined ? '–' : fmtUSD(Number(value))) },
    xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { hideOverlap: true } },
    yAxis: { type: 'value', min: 0, max: top > 0 ? top : undefined, axisLabel: { formatter: (value: number) => usdCompact(value) } },
    series: [
      {
        name: usedName,
        type: 'line',
        data: used,
        color: colors.accent,
        showSymbol: pace.basis === 'github',
        symbolSize: 8,
        areaStyle: { opacity: 0.25 },
        markLine: {
          symbol: 'none',
          silent: true,
          animation: false,
          label: { formatter: t('Budget {amount}', { amount: fmtUSD(amount, 0) }), position: 'insideStartTop', color: colors.textMuted, fontSize: 12 },
          lineStyle: { type: 'dashed', width: 1.5, color: colors.bad },
          data: [{ yAxis: amount }],
        },
        markPoint: runOutMark,
      },
      { name: projectedName, type: 'line', data: projected, color: colors.info, showSymbol: false, lineStyle: { type: 'dashed', width: 2 } },
    ],
  } as EChartsOption;
}

/** How one budget fills up during the month the data was collected, and when it runs out at the current pace. */
export function BudgetPaceCard({ overview, collection, store }: { overview: BudgetOverview; collection: Collection; store: DataStore }) {
  const colors = useChartColors();
  const choices = overview.budgets.filter((row) => row.budget.amount > 0);
  const firstChoice = overview.projectedOut[0]?.budget.id ?? choices.find((row) => row.level !== 'used-up')?.budget.id ?? choices[0]?.budget.id ?? '';
  const [picked, setPicked] = useState(firstChoice);
  const selected = choices.find((row) => row.budget.id === picked) ?? choices[0];
  const pace = useMemo(() => (selected ? budgetPace(collection, store, selected.budget, overview.billed) : null), [collection, store, selected, overview.billed]);
  const monthStart = monthStartDay(collectionMonth(collection));
  const option = useMemo(() => (pace && selected ? paceOption(pace, selected.budget.amount, monthStart, colors) : {}), [pace, selected, monthStart, colors]);

  const picker =
    choices.length > 1 ? (
      <Select
        value={selected?.budget.id ?? ''}
        onChange={setPicked}
        options={choices.map((row) => ({ value: row.budget.id, label: budgetLabel(row.budget) }))}
        aria-label={t('Budget')}
      />
    ) : null;

  const basisText =
    pace?.basis === 'report'
      ? t('Billed amounts from the usage report for what this budget covers. The projection uses the average billed per day over the last {n} days.', { n: PACE_DAYS })
      : t('The usage report cannot show this budget day by day, so the amount GitHub showed is spread evenly over the days so far.');

  return (
    <ChartCard
      title={t('Month pace')}
      calc="budget-pace"
      subtitle={selected ? t('How {budget} fills up this month, and when it runs out at the current pace.', { budget: budgetLabel(selected.budget) }) : undefined}
      actions={picker}
      option={option}
      height={300}
      empty={pace === null ? t('No budget with an amount used') : undefined}
      footer={
        pace && selected ? (
          <div className="space-y-2">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Fact label={t('Used so far')} value={fmtUSD(pace.used)} />
              <Fact label={t('Budget')} value={fmtUSD(selected.budget.amount)} />
              <Fact label={t('Projected for the month')} value={fmtUSD(pace.projected)} />
              <Fact
                label={t('Runs out')}
                value={pace.usedUp ? t('Already used up') : pace.runOutDay !== null ? fmtDay(monthStart + pace.runOutDay - 1, true) : t('Not this month')}
              />
            </dl>
            <p className="text-xs text-fg-subtle">{basisText}</p>
          </div>
        ) : undefined
      }
    />
  );
}
