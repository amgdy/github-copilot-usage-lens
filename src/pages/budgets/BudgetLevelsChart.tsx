import { useMemo } from 'react';
import { useChartColors, type EChartsOption } from '../../components/charts/EChart';
import { rankBarOption } from '../../components/charts/helpers';
import type { ChartColors } from '../../components/charts/theme';
import { ChartCard } from '../../components/ui';
import { t, tp } from '../../i18n';
import type { BudgetLevel, BudgetOverview } from '../../lib/collection';
import type { DataStore } from '../../lib/types';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { budgetDrill, budgetLabel } from './levels';

const MAX_BARS = 30;

function levelColor(colors: ChartColors, level: BudgetLevel): string {
  if (level === 'used-up') return colors.bad;
  if (level === 'near') return colors.warn;
  if (level === 'half') return colors.accent;
  return colors.good;
}

/** One bar per budget: the share of it used, fullest first, with a line at 100%. */
export function BudgetLevelsChart({ overview, store }: { overview: BudgetOverview; store: DataStore }) {
  const colors = useChartColors();
  const rows = useMemo(() => overview.budgets.filter((row) => row.share !== null && row.level !== null).slice(0, MAX_BARS), [overview]);
  const hidden = overview.budgets.filter((row) => row.share !== null).length - rows.length;
  const option = useMemo<EChartsOption>(() => {
    const items = rows.map((row) => ({
      name: budgetLabel(row.budget),
      value: row.share as number,
      color: levelColor(colors, row.level as BudgetLevel),
      note: t('{used} of {amount}', { used: fmtUSD(row.budget.consumed ?? 0), amount: fmtUSD(row.budget.amount) }),
    }));
    const highest = items.reduce((maxShare, item) => Math.max(maxShare, item.value), 0);
    const base = rankBarOption(colors, { items, format: (share) => fmtPct(share, 0), max: Math.max(1.15, highest * 1.1), labelWidth: 180 });
    const series = (base.series as Record<string, unknown>[]).map((layer) => ({
      ...layer,
      markLine: {
        symbol: 'none',
        silent: true,
        animation: false,
        label: { formatter: fmtPct(1, 0), color: colors.textMuted, fontSize: 11 },
        lineStyle: { type: 'dashed', color: colors.bad, width: 1 },
        data: [{ xAxis: 1 }],
      },
    }));
    return { ...base, series } as EChartsOption;
  }, [rows, colors]);

  return (
    <ChartCard
      title={t('How full each budget is')}
      calc="budget-levels"
      subtitle={t('Share of each budget used on the day the data was collected. Budgets for single users are in the users section below.')}
      option={option}
      height={Math.max(160, rows.length * 28 + 24)}
      empty={rows.length === 0 ? t('No budget with an amount used') : undefined}
      footer={hidden > 0 ? tp(hidden, '{n} more budget is in the table below.', '{n} more budgets are in the table below.', { n: fmtInt(hidden) }) : undefined}
      onClick={(click) => {
        const row = rows[click.dataIndex];
        if (row) budgetDrill(row.budget, store)?.();
      }}
    />
  );
}
