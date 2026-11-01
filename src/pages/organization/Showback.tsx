import { useMemo, useState, type ReactNode } from 'react';
import { Callout, Card, DataTable, DocLinks, EmptyState, Select, cx, type Column } from '../../components/ui';
import { msg, t, tp } from '../../i18n';
import { fmtDay } from '../../lib/utils/date';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { buildShowback, pickShowbackDim, type ShowbackDim, type ShowbackMethod, type ShowbackRow } from './allocation';
import { GroupName, ShareCell } from './bits';

const METHODS: { value: ShowbackMethod; label: string; how: string }[] = [
  {
    value: 'billed',
    label: msg('As billed in the report'),
    how: msg(
      'Each group carries the overage that the report assigns to its own rows. The included credits are pooled across all users, so a group that uses them late in the month can carry more than its share.',
    ),
  },
  {
    value: 'usage',
    label: msg('By share of usage'),
    how: msg(
      'The total overage is split by each group’s share of all usage. Because the credits are pooled, this does not depend on when in the month a group used them.',
    ),
  },
  {
    value: 'seats',
    label: msg('Seats plus overage by usage'),
    how: msg(
      'Each group pays for the seats of its users, plus its share of the overage by usage. A seat costs as much as its included credits. The result is the whole bill for the people in this report.',
    ),
  },
];

/** The texts that name the grouping, one full sentence per grouping. */
const TEXTS: Record<ShowbackDim, { header: string; subtitle: string; unassigned: string; search: string; split: string; splitOther: string }> = {
  costCenter: {
    header: msg('Cost center'),
    subtitle: msg('Allocation by cost center for {from} to {to}'),
    unassigned: msg('Unassigned collects usage and people without a cost center. It cannot be charged back until they are assigned.'),
    search: msg('Search cost centers…'),
    split: msg('1 user appears in more than one cost center. Their seat is counted in the first one.'),
    splitOther: msg('{n} users appear in more than one cost center. Their seat is counted in the first one.'),
  },
  org: {
    header: msg('Organization'),
    subtitle: msg('Allocation by organization for {from} to {to}'),
    unassigned: msg('Unassigned collects usage and people without an organization. It cannot be charged back until they are assigned.'),
    search: msg('Search organizations…'),
    split: msg('1 user appears in more than one organization. Their seat is counted in the first one.'),
    splitOther: msg('{n} users appear in more than one organization. Their seat is counted in the first one.'),
  },
};

const DASH = <span className="text-fg-subtle">–</span>;

/** Splits the bill between cost centers (or organizations) with a method the reader picks. */
export function Showback() {
  const { analysis, store } = useAnalysis();
  const { agg: aggregates, users, narrowed, range, coverage } = analysis;
  const billing = coverage.billing;
  const dimension = pickShowbackDim(aggregates);
  const [method, setMethod] = useState<ShowbackMethod>('seats');
  // Seat costs need every user of the report, so the method is only on offer without filters.
  const effective: ShowbackMethod = method === 'seats' && narrowed ? 'billed' : method;
  const offered = narrowed ? METHODS.filter((methodOption) => methodOption.value !== 'seats') : METHODS;

  const data = useMemo(() => (dimension ? buildShowback(store, aggregates, users, dimension, effective) : null), [store, aggregates, users, dimension, effective]);

  const columns = useMemo<Column<ShowbackRow>[]>(() => {
    if (!data) return [];
    const showSeats = effective === 'seats';
    const sum = (rows: ShowbackRow[], getValue: (row: ShowbackRow) => number) => rows.reduce((total, row) => total + getValue(row), 0);
    const maxShare = data.rows.reduce((largest, row) => (Number.isFinite(row.shareOfTotal) ? Math.max(largest, row.shareOfTotal) : largest), 0);
    const cols: Column<ShowbackRow>[] = [
      {
        key: 'group',
        header: t(TEXTS[dimension ?? 'org'].header),
        value: (row) => row.name,
        render: (row) => <GroupName name={row.name} blank={row.unassigned} />,
        total: (rows) => (rows.length === data.rows.length ? t('Total') : t('Total of {n} matching', { n: fmtInt(rows.length) })),
      },
      {
        key: 'users',
        header: t('Users'),
        hint: t('People whose first cost center (or organization) in the report is this group. Each person is counted once.'),
        calc: 'showback-users',
        align: 'end',
        value: (row) => row.users,
        render: (row) => fmtInt(row.users),
        total: (rows) => fmtInt(sum(rows, (row) => row.users)),
      },
      {
        key: 'usage',
        header: t('Usage'),
        hint: t('Value of all AI credits used on the rows of this group (1 credit = $0.01)'),
        calc: 'usage',
        align: 'end',
        value: (row) => row.gross,
        render: (row) => fmtUSD(row.gross),
        total: (rows) => fmtUSD(sum(rows, (row) => row.gross)),
      },
      {
        key: 'share',
        header: t('Share'),
        hint: t('Share of all usage'),
        calc: 'org-share',
        align: 'end',
        value: (row) => row.share,
        render: (row) => fmtPct(row.share, 1),
        total: (rows) => fmtPct(sum(rows, (row) => row.share), 1),
      },
    ];
    if (showSeats) {
      cols.push({
        key: 'seat',
        header: t('Seat cost'),
        hint: t('Included credits of the group’s users, in USD. A seat costs as much as its included credits.'),
        calc: 'showback-seat-cost',
        align: 'end',
        value: (row) => row.seat,
        render: (row) => fmtUSD(row.seat),
        total: (rows) => fmtUSD(sum(rows, (row) => row.seat)),
      });
    }
    cols.push(
      {
        key: 'overage',
        header: t('Overage allocation'),
        hint: effective === 'billed' ? t('Overage on the rows of this group, as the report has it') : t('Total overage times the group’s share of usage'),
        calc: 'showback-overage',
        align: 'end',
        value: (row) => (billing ? row.overage : null),
        render: (row) => (billing ? fmtUSD(row.overage) : DASH),
        total: (rows) => (billing ? fmtUSD(sum(rows, (row) => row.overage)) : DASH),
      },
      {
        key: 'total',
        strong: true,
        header: t('Total allocation'),
        hint: showSeats ? t('Seat cost plus overage allocation') : t('Overage allocation'),
        calc: 'showback-total',
        align: 'end',
        value: (row) => row.total,
        render: (row) => fmtUSD(row.total),
        total: (rows) => fmtUSD(sum(rows, (row) => row.total)),
      },
      {
        key: 'shareOfTotal',
        header: t('Share of total'),
        hint: t('Part of the total allocation that this group carries'),
        calc: 'showback-share-of-total',
        align: 'end',
        value: (row) => (Number.isFinite(row.shareOfTotal) ? row.shareOfTotal : null),
        render: (row) => (Number.isFinite(row.shareOfTotal) ? <ShareCell frac={row.shareOfTotal} max={maxShare} text={fmtPct(row.shareOfTotal, 1)} /> : DASH),
        total: (rows) => {
          const part = sum(rows, (row) => (Number.isFinite(row.shareOfTotal) ? row.shareOfTotal : 0));
          return part > 0 ? fmtPct(part, 1) : DASH;
        },
      },
    );
    return cols;
  }, [data, dimension, effective, billing]);

  if (!dimension || !data) {
    return (
      <Card title={t('Showback and chargeback')} subtitle={t('Split the bill between teams')} calc="showback">
        <EmptyState
          title={t('No cost centers or organizations in this report')}
          description={t('Showback needs a cost center or an organization on the usage rows. Without one, usage cannot be split between teams.')}
        />
        <DocLinks topic="costCenters" title={t('Learn more')} className="mt-3" />
      </Card>
    );
  }

  const text = TEXTS[dimension];
  const notes: ReactNode[] = [];
  if (dimension === 'org') notes.push(t('This report has no cost centers, so the allocation uses organizations.'));
  if (data.rows.some((row) => row.unassigned)) notes.push(t(text.unassigned));
  if (effective === 'seats') {
    notes.push(t('Seat cost counts whole months in which a person has usage in the selected period. People without usage in it are not included.'));
    if (data.splitUsers > 0) notes.push(tp(data.splitUsers, t(text.split), text.splitOther, { n: fmtInt(data.splitUsers) }));
  }
  if (!billing) {
    notes.push(
      effective === 'seats'
        ? t('This file does not say what was billed, so the overage cannot be allocated. Only the seat cost is allocated.')
        : t('This file does not say what was billed, so the overage cannot be allocated. There is nothing to allocate.'),
    );
  } else if (effective !== 'seats' && aggregates.totals.net <= 0.005) {
    notes.push(t('Nothing was billed on top of seats in this period, so this method has nothing to allocate.'));
  }
  if (narrowed) notes.push(t('Filters are active. The seat-based method is hidden because seat costs need the full user list.'));

  return (
    <Card
      title={t('Showback and chargeback')}
      subtitle={t(text.subtitle, { from: fmtDay(range.start, true), to: fmtDay(range.end, true) })}
      calc="showback"
      actions={
        <Select aria-label={t('Allocation method')} value={effective} onChange={setMethod} options={offered.map((methodOption) => ({ value: methodOption.value, label: t(methodOption.label) }))} />
      }
    >
      <div className="space-y-3">
        <DataTable
          key={effective}
          rows={data.rows}
          columns={columns}
          rowKey={(row) => row.id}
          defaultSort={{ key: 'total', dir: 'desc' }}
          pageSize={25}
          searchable={data.rows.length > 25}
          searchPlaceholder={t(text.search)}
          exportName="github-copilot-showback"
          emptyText={t('Nothing to allocate.')}
        />
        {notes.length > 0 ? (
          <ul className="space-y-1 text-xs text-fg-muted">
            {notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        ) : null}
        <Callout title={t('How the methods work')}>
          <ul className="mt-1 space-y-1">
            {offered.map((methodOption) => (
              <li key={methodOption.value}>
                <span className={cx('font-medium', methodOption.value === effective ? 'text-fg' : 'text-fg-muted')}>{t(methodOption.label)}.</span> {t(methodOption.how)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-fg">{t('These amounts are an estimate for internal showback and chargeback. Invoices come from GitHub billing.')}</p>
        </Callout>
        <DocLinks topic="costCenters" title={t('Learn more')} />
      </div>
    </Card>
  );
}
