import { TaxBadge, type Column } from '../../components/ui';
import { t } from '../../i18n';
import type { PersonaId, TaxonomyItem } from '../../lib/analytics/taxonomy';
import { isoDate } from '../../lib/utils/date';
import { fmtPct, fmtUSD } from '../../lib/utils/format';
import { useApp } from '../../state/store';
import { BUSINESS_ALLOTMENT, type SeatRow } from './seatData';

type Personas = Record<PersonaId, TaxonomyItem<PersonaId>>;

/** User name that opens the user drawer. Roster seats that never appear (id -1) have no drawer, so they stay plain text. */
function UserLink({ id, name }: { id: number; name: string }) {
  const base = 'block max-w-[28ch] truncate text-start';
  if (id < 0) {
    return (
      <span className={base} title={name}>
        {name}
      </span>
    );
  }
  return (
    <button type="button" className={`${base} text-accent hover:underline`} title={t('Open {name}', { name })} onClick={() => useApp.getState().selectUser(id)}>
      {name}
    </button>
  );
}

const sumValue = (rows: SeatRow[]): string => fmtUSD(rows.reduce((total, seat) => total + seat.value, 0), 0);

const userColumn = (): Column<SeatRow> => ({ key: 'user', header: t('User'), value: (seat) => seat.name, render: (seat) => <UserLink id={seat.id} name={seat.name} /> });

const planColumn = (): Column<SeatRow> => ({ key: 'plan', header: t('Plan'), value: (seat) => seat.plan });

const usageColumn = (): Column<SeatRow> => ({
  key: 'usage',
  header: t('Usage'),
  hint: t('Usage in the selected dates'),
  calc: 'usage',
  align: 'end',
  value: (seat) => seat.gross,
  render: (seat) => fmtUSD(seat.gross, 2),
  csvHeader: t('Usage (USD)'),
});

const valueColumn = (header: string, csvHeader: string, hint: string, calc: string): Column<SeatRow> => ({
  key: 'value',
  strong: true,
  header,
  hint,
  calc,
  align: 'end',
  value: (seat) => seat.value,
  render: (seat) => fmtUSD(seat.value, 0),
  total: sumValue,
  csvHeader,
});

export function idleColumns(personas: Personas): Column<SeatRow>[] {
  return [
    userColumn(),
    planColumn(),
    usageColumn(),
    {
      key: 'used',
      header: t('Included credits used'),
      hint: t("Usage as a share of the user's own included credits"),
      calc: 'user-credits-used',
      align: 'end',
      value: (seat) => seat.utilization,
      render: (seat) => fmtPct(seat.utilization, 1),
    },
    {
      key: 'last',
      header: t('Last active'),
      hint: t('Last day with usage in the loaded files. Completions are not in the report.'),
      calc: 'rec-seat-last-active',
      value: (seat) => (seat.profile ? isoDate(seat.profile.lastDay) : null),
    },
    {
      key: 'since',
      header: t('Days since last use'),
      hint: t('Days between the last usage and the end of the selected dates'),
      calc: 'user-days-since-last',
      align: 'end',
      value: (seat) => seat.profile?.daysSinceLast ?? null,
    },
    {
      key: 'persona',
      header: t('Persona'),
      calc: 'persona-groups',
      value: (seat) => (seat.profile ? (personas[seat.profile.persona]?.label ?? '') : ''),
      render: (seat) => (seat.profile ? <TaxBadge item={personas[seat.profile.persona]} /> : '–'),
    },
    valueColumn(t('Seat value'), t('Seat value (USD)'), t('Seat price per month'), 'seat-idle'),
  ];
}

export function downgradeColumns(): Column<SeatRow>[] {
  return [
    userColumn(),
    usageColumn(),
    {
      key: 'peak',
      header: t('Busiest month'),
      hint: t('Highest usage in any single month'),
      calc: 'rec-seat-busiest-month',
      align: 'end',
      value: (seat) => seat.profile?.peakMonthGross ?? null,
      render: (seat) => (seat.profile ? fmtUSD(seat.profile.peakMonthGross, 2) : '–'),
      csvHeader: t('Busiest month (USD)'),
    },
    {
      key: 'share',
      header: t('Share of Business allotment'),
      hint: t('Busiest month as a share of the {allotment} of included credits in a Business seat', { allotment: fmtUSD(BUSINESS_ALLOTMENT, 0) }),
      calc: 'rec-seat-business-share',
      align: 'end',
      value: (seat) => (seat.profile ? seat.profile.peakMonthGross / BUSINESS_ALLOTMENT : null),
      render: (seat) => (seat.profile ? fmtPct(seat.profile.peakMonthGross / BUSINESS_ALLOTMENT, 0) : '–'),
    },
    valueColumn(t('Saving'), t('Saving (USD)'), t('Enterprise price minus Business price, per month'), 'seat-downgrade'),
  ];
}

export function unusedColumns(): Column<SeatRow>[] {
  return [userColumn(), planColumn(), valueColumn(t('Seat value'), t('Seat value (USD)'), t('Seat price per month'), 'seat-unused')];
}
