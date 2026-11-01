import { useMemo } from 'react';
import { Kpi, KpiGrid } from '../../components/ui';
import { t, tp } from '../../i18n';
import { NEAR_SHARE, type BudgetOverview, type GitHubData } from '../../lib/collection';
import { fmtInt, fmtPct } from '../../lib/utils/format';
import type { DataStore } from '../../lib/types';
import { drill } from '../../state/router';
import { reportNames } from './levels';

/** The headline counts of the Budgets page. */
export function BudgetKpis({ overview, github, store }: { overview: BudgetOverview; github: GitHubData; store: DataStore }) {
  const stopped = useMemo(() => github.usersAtLimit.map((user) => user.login), [github]);
  const stoppedInReport = useMemo(() => reportNames(stopped, store.dicts.user.values), [stopped, store]);
  const nearUsers = overview.userLevels.near;
  const runOut = overview.projectedOut.length;
  const measured = overview.budgets.filter((row) => row.share !== null).length;
  return (
    <KpiGrid>
      <Kpi
        label={t('Budgets for GitHub Copilot')}
        value={fmtInt(overview.total)}
        sub={t('{stopping} stop usage, {alerting} only alert', { stopping: fmtInt(overview.stopping), alerting: fmtInt(overview.alerting) })}
        calc="budget-count"
      />
      <Kpi
        label={t('Budgets used up')}
        value={fmtInt(overview.usedUp)}
        sub={tp(measured, 'of {n} budget with an amount used', 'of {n} budgets with an amount used', { n: fmtInt(measured) })}
        tone={overview.usedUp > 0 ? 'bad' : 'good'}
        calc="budget-used-up"
      />
      <Kpi label={t('Budgets near the limit')} value={fmtInt(overview.near)} sub={t('{share} or more used', { share: fmtPct(NEAR_SHARE, 0) })} tone={overview.near > 0 ? 'warn' : 'good'} calc="budget-near" />
      <Kpi
        label={t('Expected to run out')}
        value={fmtInt(runOut)}
        sub={t('Budgets that reach their amount before the month ends at the current pace')}
        tone={runOut > 0 ? 'warn' : 'good'}
        calc="budget-run-out"
      />
      <Kpi
        label={t('Users stopped by a budget')}
        value={fmtInt(stopped.length)}
        sub={t('Cannot use AI credits until the next month')}
        tone={stopped.length > 0 ? 'bad' : 'good'}
        calc="budget-users-stopped"
        onClick={stoppedInReport.length > 0 ? () => drill({ users: stoppedInReport }, { page: 'users' }) : undefined}
      />
      <Kpi label={t('Users near their limit')} value={fmtInt(nearUsers)} sub={t('{share} or more of their budget used', { share: fmtPct(NEAR_SHARE, 0) })} tone={nearUsers > 0 ? 'warn' : 'good'} calc="budget-users-near" />
    </KpiGrid>
  );
}
