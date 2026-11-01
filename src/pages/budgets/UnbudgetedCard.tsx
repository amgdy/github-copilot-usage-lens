import { useMemo } from 'react';
import { Card, DataTable, type Column } from '../../components/ui';
import { t } from '../../i18n';
import type { BudgetOverview, UnbudgetedScope } from '../../lib/collection';
import { dataCoverage } from '../../lib/analytics/coverage';
import type { DataStore } from '../../lib/types';
import { fmtUSD } from '../../lib/utils/format';
import { drill } from '../../state/router';
import { monthName } from '../githubText';
import { reportNames } from './levels';

const scopeLabel = (scope: UnbudgetedScope['scope']): string => (scope === 'organization' ? t('Organization') : t('Cost center'));

/** Organizations and cost centers with billed usage this month and no budget of their own. */
export function UnbudgetedCard({ overview, store }: { overview: BudgetOverview; store: DataStore }) {
  const columns = useMemo<Column<UnbudgetedScope>[]>(
    () => [
      { key: 'name', header: t('Name'), value: (row) => row.name, render: (row) => <span className="font-medium">{row.name}</span> },
      { key: 'scope', header: t('Type'), value: (row) => scopeLabel(row.scope) },
      { key: 'billed', header: t('Billed'), align: 'end', value: (row) => row.billed, render: (row) => fmtUSD(row.billed) },
    ],
    [],
  );
  const rows = overview.unbudgeted;
  const open = (row: UnbudgetedScope) => {
    const names = reportNames([row.name], row.scope === 'organization' ? store.dicts.org.values : store.dicts.costCenter.values);
    if (names.length > 0) drill(row.scope === 'organization' ? { orgs: names } : { costCenters: names }, { page: 'organization' });
  };
  return (
    <Card
      title={t('Billed usage with no budget')}
      calc="budget-unbudgeted"
      subtitle={t('Organizations and cost centers billed in {month} that have no budget of their own.', { month: monthName(overview.month) })}
    >
      {rows === null ? (
        <p className="text-sm text-fg-muted">{!dataCoverage(store).billing ? t('This file has no billing split, so the billed amount is not known.') : t('The budgets were not read in full, so this list cannot be made.')}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-fg-muted">{t('Every organization and cost center with billed usage has a budget.')}</p>
      ) : (
        <div className="space-y-2">
          {overview.enterpriseBudget ? <p className="text-xs text-fg-subtle">{t('The budget for the whole enterprise still covers this usage.')}</p> : null}
          <DataTable rows={rows} columns={columns} rowKey={(row) => `${row.scope}:${row.name}`} defaultSort={{ key: 'billed', dir: 'desc' }} onRowClick={open} exportName="github-copilot-billed-without-budget" dense />
        </div>
      )}
    </Card>
  );
}
