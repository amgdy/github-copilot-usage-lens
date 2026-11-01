import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge, Card, DataTable, TaxBadge, cx, type Column } from '../../components/ui';
import { t } from '../../i18n';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { showGroup } from './actions';
import { share, type GroupRow, type LensData } from './lenses';

const DASH = '–';
const money = (amount: number): string => (Number.isFinite(amount) ? fmtUSD(amount, 0) : DASH);
const cents = (amount: number): number => Math.round(amount * 100) / 100;
const percent = (fraction: number): number => Math.round(fraction * 1000) / 10;

function signedMoney(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded > 0 ? '+' : rounded < 0 ? '−' : ''}${fmtUSD(Math.abs(amount), 0)}`;
}

function groupNote(row: GroupRow, engagement: boolean): string | null {
  if (row.unavailable) return row.unavailable;
  if (row.users === 0) return t('No users');
  if (engagement && row.overlay) return t('A flag: these users are also in an activity level');
  return null;
}

function BalanceCell({ value }: { value: number }) {
  if (!Number.isFinite(value)) return <>{DASH}</>;
  return <span className={cx('num', Math.round(value) > 0 && 'text-good', Math.round(value) < 0 && 'text-warn')}>{signedMoney(value)}</span>;
}

interface Props {
  data: LensData;
  perMonth: number;
  /** Included credits are only meaningful when the report says which seats the users have. */
  showCredits: boolean;
  /** Pool balance needs all users in view, so it is hidden while filters are on. */
  showPool: boolean;
  /** The file has a billing split. Without it the billed amounts are unknown, not zero. */
  billingKnown: boolean;
}

export function GroupTable({ data, perMonth, showCredits, showPool, billingKnown }: Props) {
  const { lens, total, everyone } = data;
  const engagement = lens.id === 'engagement';

  const columns = useMemo((): Column<GroupRow>[] => {
    const cols: Column<GroupRow>[] = [
      {
        key: 'group',
        header: t('Group'),
        csvHeader: t(lens.label),
        calc: lens.calc,
        value: (row) => row.item.label,
        render: (row) => {
          const note = groupNote(row, engagement);
          return (
            <div className="max-w-64 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <TaxBadge item={row.item} />
                {row.active ? (
                  <Badge tone="accent" title={t('This group is selected in the filters')}>
                    {t('In filter')}
                  </Badge>
                ) : null}
              </div>
              {note ? <div className="mt-0.5 whitespace-normal text-xs text-fg-subtle">{note}</div> : null}
            </div>
          );
        },
        total: lens.id === 'trait' ? t('Users with a trait') : t('All users'),
      },
      {
        key: 'users',
        header: t('Users'),
        align: 'end',
        value: (row) => row.users,
        render: (row) => fmtInt(row.users),
        total: fmtInt(total.users),
        hint: t('Number of users in the group.'),
        calc: 'group-users',
      },
      {
        key: 'userShare',
        header: t('% of users'),
        align: 'end',
        value: (row) => percent(row.userShare),
        render: (row) => fmtPct(row.userShare, 1),
        total: fmtPct(share(total.users, everyone.users), 0),
        csvHeader: t('Share of users (%)'),
        hint: t('Share of all users that are in this group.'),
        calc: 'group-user-share',
      },
      {
        key: 'gross',
        strong: true,
        header: t('Usage'),
        align: 'end',
        value: (row) => cents(row.gross),
        render: (row) => money(row.gross),
        total: money(total.gross),
        csvHeader: t('Usage (USD)'),
        hint: t('Usage before included credits are taken off.'),
        calc: 'usage',
      },
      {
        key: 'usageShare',
        header: t('% of usage'),
        align: 'end',
        value: (row) => percent(row.usageShare),
        render: (row) => fmtPct(row.usageShare, 1),
        total: fmtPct(share(total.gross, everyone.gross), 0),
        csvHeader: t('Share of usage (%)'),
        hint: t('Share of all usage that comes from this group.'),
        calc: 'group-usage-share',
      },
      {
        key: 'net',
        header: t('Billed'),
        align: 'end',
        value: (row) => (billingKnown ? cents(row.net) : null),
        render: (row) => (billingKnown ? money(row.net) : DASH),
        total: billingKnown ? money(total.net) : DASH,
        csvHeader: t('Billed on top of seats (USD)'),
        hint: billingKnown ? t('Billed on top of seats: usage that included credits did not cover.') : t('This file has no billing split, so the billed amount is not known.'),
        calc: 'billed',
      },
      {
        key: 'perUser',
        header: t('Per user, per month'),
        align: 'end',
        value: (row) => (Number.isFinite(row.perUserMonth) ? cents(row.perUserMonth) : null),
        render: (row) => money(row.perUserMonth),
        total: money(total.users > 0 ? (total.gross / total.users) * perMonth : Number.NaN),
        csvHeader: t('Per user, per month (USD)'),
        hint: t('Average usage per user, scaled to a 30.4375-day month.'),
        calc: 'group-per-user-month',
      },
    ];
    if (showCredits) {
      cols.push({
        key: 'allotment',
        header: t('Included credits'),
        align: 'end',
        value: (row) => cents(row.allotment),
        render: (row) => money(row.allotment),
        total: money(total.allotment),
        csvHeader: t('Included credits (USD)'),
        hint: t('Included credits that come with the seats of these users in the period, in dollars.'),
        calc: 'group-included-credits',
      });
      if (showPool) {
        cols.push({
          key: 'balance',
          header: t('Pool balance'),
          align: 'end',
          value: (row) => (row.users > 0 ? cents(row.balance) : null),
          render: (row) => (row.users > 0 ? <BalanceCell value={row.balance} /> : DASH),
          total: <BalanceCell value={total.allotment - total.gross} />,
          csvHeader: t('Pool balance (USD)'),
          hint: t('Included credits minus usage. Positive: the group left credits in the shared pool. Negative: the group used more than its own credits and drew on the pool.'),
          calc: 'group-pool-balance',
        });
      }
    }
    cols.push(
      {
        key: 'potential',
        header: t('Potential savings'),
        align: 'end',
        value: (row) => cents(row.potential),
        render: (row) => money(row.potential),
        total: money(total.potential),
        csvHeader: t('Potential savings (USD)'),
        hint: t('Estimated reduction in usage if the default recommendations were followed. This is not cash.'),
        calc: 'group-potential-savings',
      },
      {
        key: 'action',
        header: t('What to do'),
        value: (row) => row.item.action,
        render: (row) => <div className="w-64 whitespace-normal text-xs text-fg-muted">{row.item.action}</div>,
      },
      {
        key: 'show',
        header: <span className="sr-only">{t('Show users')}</span>,
        align: 'end',
        sortable: false,
        noCsv: true,
        value: () => null,
        render: (row) => (
          <button
            type="button"
            className="btn btn-sm whitespace-nowrap"
            disabled={row.users === 0}
            aria-label={t('Show users: {group}', { group: row.item.label })}
            onClick={(event) => {
              event.stopPropagation();
              showGroup(lens, row.id);
            }}
          >
            {t('Show users')} <ArrowRight size={12} className="rtl:-scale-x-100" aria-hidden />
          </button>
        ),
      },
    );
    return cols;
  }, [lens, engagement, total, everyone, perMonth, showCredits, showPool, billingKnown]);

  return (
    <Card title={t('Group statistics')} subtitle={t('Select a row to list the users of that group.')} calc="group-statistics" footer={lens.overlayNote ? t(lens.overlayNote) : null}>
      <DataTable
        key={lens.id}
        rows={data.rows}
        columns={columns}
        rowKey={(row) => row.id}
        defaultSort={{ key: 'gross', dir: 'desc' }}
        pageSize={25}
        exportName={`github-copilot-segments-${lens.id}`}
        onRowClick={(row) => (row.users > 0 ? showGroup(lens, row.id) : undefined)}
        rowClassName={(row) => (row.active ? 'bg-accent-soft hover:bg-accent-soft' : row.users === 0 ? 'opacity-60' : undefined)}
        emptyText={t('No groups to show.')}
      />
    </Card>
  );
}
