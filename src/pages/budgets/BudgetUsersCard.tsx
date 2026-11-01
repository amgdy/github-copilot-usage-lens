import { useMemo } from 'react';
import { Badge, Card, DataTable, ProgressBar, type Column } from '../../components/ui';
import { t } from '../../i18n';
import { BUDGET_LEVELS, NEAR_SHARE, type BudgetOverview, type BudgetUserRow, type Collection } from '../../lib/collection';
import type { DataStore } from '../../lib/types';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { drill } from '../../state/router';
import { budgetName } from '../githubText';
import { levelLabel, levelTone, limitKindLabel, reportNames } from './levels';

/** Users held to a budget: how many are at each level, and who is closest to the limit. */
export function BudgetUsersCard({ overview, collection, store }: { overview: BudgetOverview; collection: Collection; store: DataStore }) {
  const budgetNames = useMemo(() => new Map(collection.budgets.map((budget) => [budget.id, budgetName(budget)])), [collection]);
  const columns = useMemo<Column<BudgetUserRow>[]>(
    () => [
      { key: 'login', header: t('User'), value: (row) => row.login, render: (row) => <span className="font-medium">{row.login}</span> },
      { key: 'kind', header: t('Limit type'), value: (row) => limitKindLabel(row.kind) },
      { key: 'budget', header: t('Budget'), value: (row) => budgetNames.get(row.budgetId) ?? '–' },
      { key: 'used', header: t('Used'), align: 'end', value: (row) => row.consumed, render: (row) => fmtUSD(row.consumed) },
      { key: 'limit', header: t('Limit'), align: 'end', value: (row) => row.limit, render: (row) => <span className="font-semibold text-fg">{fmtUSD(row.limit)}</span> },
      {
        key: 'share',
        header: t('Share used'),
        value: (row) => row.share,
        render: (row) => (
          <div className="flex min-w-28 items-center gap-2">
            <ProgressBar value={row.share} tone={levelTone(row.level)} height={6} className="flex-1" label={t('Share of the budget used')} />
            <span className="num w-12 text-end text-xs">{fmtPct(row.share, 0)}</span>
          </div>
        ),
      },
      { key: 'level', header: t('Level'), value: (row) => levelLabel(row.level), render: (row) => <Badge tone={levelTone(row.level)}>{levelLabel(row.level)}</Badge> },
    ],
    [budgetNames],
  );
  const inReport = useMemo(
    () =>
      reportNames(
        overview.users.filter((row) => row.level === 'near' || row.level === 'used-up').map((row) => row.login),
        store.dicts.user.values,
      ),
    [overview, store],
  );

  return (
    <Card
      title={t('Users and their budgets')}
      calc="budget-users"
      subtitle={t('Each user is held to one limit: a budget of their own, the limit of their cost center, or the limit for each user, in that order. When a user reaches the limit, GitHub stops their AI credits until the next month.')}
      actions={
        inReport.length > 0 ? (
          <button type="button" className="btn btn-sm" onClick={() => drill({ users: inReport }, { page: 'users' })}>
            {t('Show users at {share} or more', { share: fmtPct(NEAR_SHARE, 0) })}
          </button>
        ) : null
      }
    >
      <div className="space-y-3">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BUDGET_LEVELS.map((level) => (
            <div key={level} className="min-w-0 rounded-md border border-border px-3 py-2">
              <dt>
                <Badge tone={levelTone(level)}>{levelLabel(level)}</Badge>
              </dt>
              <dd className="num font-display mt-1 text-xl font-semibold">{fmtInt(overview.userLevels[level])}</dd>
            </div>
          ))}
        </dl>
        <DataTable
          rows={overview.users}
          columns={columns}
          rowKey={(row) => row.login}
          defaultSort={{ key: 'share', dir: 'desc' }}
          pageSize={10}
          searchable={overview.users.length > 10}
          exportName="github-copilot-budget-users"
          dense
        />
      </div>
    </Card>
  );
}
