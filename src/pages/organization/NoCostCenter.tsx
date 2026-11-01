import { useMemo } from 'react';
import { Callout, Card, DataTable, DocLinks, TaxBadge, taxLookup, type Column } from '../../components/ui';
import { t, tp } from '../../i18n';
import type { UserProfile } from '../../lib/analytics/users';
import { fmtPct, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { drill } from '../../state/router';
import { useApp } from '../../state/store';
import { namedCount } from './dimensions';

/** Active users that no cost center covers, or a hint on cost centers when the report has none. */
export function NoCostCenter() {
  const { analysis, taxonomy } = useAnalysis();
  const { users, agg: aggregates, narrowed, coverage } = analysis;
  const selectUser = useApp((state) => state.selectUser);
  const personas = useMemo(() => taxLookup(taxonomy.personas), [taxonomy]);
  const missing = useMemo(() => (users.hasCostCenters ? users.profiles.filter((user) => user.costCenter === '') : []), [users]);
  const totalGross = aggregates.totals.gross;
  const billing = coverage.billing;

  const columns = useMemo<Column<UserProfile>[]>(() => {
    const cols: Column<UserProfile>[] = [
      {
        key: 'user',
        header: t('User'),
        value: (user) => user.name,
        render: (user) => (
          <span className="block max-w-[28ch] truncate" title={user.name}>
            {user.name}
          </span>
        ),
      },
      { key: 'persona', header: t('Persona'), calc: 'persona-groups', value: (user) => personas[user.persona]?.label ?? '', render: (user) => <TaxBadge item={personas[user.persona]} /> },
      { key: 'usage', header: t('Usage'), calc: 'usage', align: 'end', strong: true, value: (user) => user.gross, render: (user) => fmtUSD(user.gross) },
      {
        key: 'share',
        header: t('Share of usage'),
        calc: 'org-no-cost-center',
        align: 'end',
        value: (user) => (totalGross > 0 ? user.gross / totalGross : null),
        render: (user) => (totalGross > 0 ? fmtPct(user.gross / totalGross, 1) : '–'),
      },
    ];
    if (billing) {
      cols.push({ key: 'billed', header: t('Billed'), hint: t('Billed on top of seats'), calc: 'billed', align: 'end', value: (user) => user.net, render: (user) => fmtUSD(user.net) });
    }
    return cols;
  }, [personas, totalGross, billing]);

  if (!users.hasCostCenters) {
    if (namedCount(aggregates, 'costCenter') > 0) return null;
    return (
      <Callout title={narrowed ? t('No cost centers in these rows') : t('No cost centers in this report')}>
        {t(
          'A cost center groups organizations, repositories or users for billing. With cost centers, the bill can be split by team and charged back instead of staying in one pool. Without them, usage can only be split by organization, repository or product.',
        )}
        <DocLinks topic="costCenters" title={t('Learn more')} compact className="mt-2" />
      </Callout>
    );
  }

  if (missing.length === 0) return null;

  const gross = missing.reduce((total, user) => total + user.gross, 0);
  const users$ = tp(missing.length, '1 active user', '{n} active users');

  return (
    <Card
      title={t('Users without a cost center')}
      subtitle={
        totalGross > 0
          ? t('{users} · {usd} of usage ({pct})', { users: users$, usd: fmtUSD(gross), pct: fmtPct(gross / totalGross, 1) })
          : t('{users} · {usd} of usage', { users: users$, usd: fmtUSD(gross) })
      }
      calc="org-no-cost-center"
      actions={
        <button type="button" className="btn btn-sm" onClick={() => drill({ traits: ['noCostCenter'] }, { page: 'users', merge: true })}>
          {t('Show users')}
        </button>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-fg-muted">
          {t(
            'Usage that no cost center covers cannot be charged back. In the allocation above it stays in the Unassigned row. Assign these users to a cost center and load a new report to move it to the right team.',
          )}
        </p>
        <DataTable
          rows={missing}
          columns={columns}
          rowKey={(user) => user.id}
          defaultSort={{ key: 'usage', dir: 'desc' }}
          pageSize={10}
          dense
          fixedColumns
          searchable={missing.length > 10}
          searchPlaceholder={t('Search users…')}
          exportName="github-copilot-users-without-cost-center"
          onRowClick={(user) => selectUser(user.id)}
        />
        <DocLinks topic="costCenters" title={t('Learn more')} compact />
      </div>
    </Card>
  );
}
