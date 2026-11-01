import { useCallback, useMemo, useRef, useState } from 'react';
import { NoRows } from '../components/NoRows';
import { t } from '../i18n';
import { PageHeader, Section } from '../components/ui';
import { fmtDay } from '../lib/utils/date';
import { pluralize } from '../lib/utils/format';
import { useAnalysis } from '../state/analysis';
import { NarrowedNotice } from './shared';
import { BillDrivers } from './spend/BillDrivers';
import { BillingExplainer } from './spend/BillingExplainer';
import { BudgetCard } from './spend/BudgetCard';
import { GitHubBilling } from './spend/GitHubBilling';
import { buildMonthRows } from './spend/helpers';
import { MonthTable } from './spend/MonthTable';
import { OverageUsers } from './spend/OverageUsers';
import { PoolMonthCard } from './spend/PoolMonthCard';
import { SkuTable } from './spend/SkuTable';
import { SpendKpis } from './spend/SpendKpis';
import { UsageOverTime } from './spend/UsageOverTime';

export default function SpendPage() {
  const { analysis, store } = useAnalysis();
  const { range, agg: aggregates, pool, narrowed } = analysis;
  const [picked, setPicked] = useState<string | null>(null);
  const poolRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => buildMonthRows(aggregates, store, pool, narrowed), [aggregates, store, pool, narrowed]);
  const selected = rows.find((row) => row.m.key === picked)?.m.key ?? rows[rows.length - 1]?.m.key ?? null;

  // Picking a month in the table shows its curve above, so bring the chart into view when it is off screen.
  const showMonth = useCallback((key: string) => {
    setPicked(key);
    const poolElement = poolRef.current;
    if (!poolElement) return;
    const top = poolElement.getBoundingClientRect().top;
    if (top >= 0 && top <= window.innerHeight * 0.6) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    poolElement.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const intro = t('How much was used, what was billed on top of seats, what drives it, and whether the included credits will last.');

  if (aggregates.totals.rows === 0) {
    return (
      <>
        <PageHeader title={t('Usage and pool')} description={intro} />
        <NoRows />
      </>
    );
  }

  const period = t('{from} to {to}', { from: fmtDay(range.start, true), to: fmtDay(range.end, true) });

  return (
    <>
      <PageHeader title={t('Usage and pool')} description={`${intro} ${period} · ${pluralize(range.length, 'day')}`} />
      <div className="space-y-4">
        <NarrowedNotice />
        <SpendKpis />
        <UsageOverTime />
        <div ref={poolRef} className="scroll-mt-16">
          <PoolMonthCard rows={rows} selected={selected} onSelect={setPicked} />
        </div>
        <MonthTable rows={rows} selected={selected} onSelect={showMonth} />
        <Section title={t('What drives the bill')} description={t('Where the usage comes from, and who causes the amount billed on top of seats.')}>
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <BillDrivers />
            <OverageUsers />
          </div>
        </Section>
        <SkuTable />
        <BudgetCard />
        <GitHubBilling />
        <BillingExplainer />
      </div>
    </>
  );
}
