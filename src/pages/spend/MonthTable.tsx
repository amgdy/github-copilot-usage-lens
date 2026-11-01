import { useMemo } from 'react';
import { Card, DataTable, type Column } from '../../components/ui';
import { T, t, tp } from '../../i18n';
import { fmtDay, isoDate, monthLabel } from '../../lib/utils/date';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { navigate } from '../../state/router';
import { fmtTokens, gapMonths, type MonthRow, type MonthTokens } from './helpers';

const cents = (amount: number): number | null => (Number.isFinite(amount) ? Math.round(amount * 100) / 100 : null);
const sum = (rows: MonthRow[], getValue: (row: MonthRow) => number): number => rows.reduce((total, row) => total + getValue(row), 0);

const promptOf = (tokens: MonthTokens): number => tokens.input + tokens.cacheRead + tokens.cacheWrite;
const hitRateOf = (tokens: MonthTokens): number => (promptOf(tokens) > 0 ? tokens.cacheRead / promptOf(tokens) : Number.NaN);
const tokensOf = (rows: MonthRow[]): MonthTokens => ({
  input: sum(rows, (row) => row.tokens.input),
  cacheRead: sum(rows, (row) => row.tokens.cacheRead),
  cacheWrite: sum(rows, (row) => row.tokens.cacheWrite),
  output: sum(rows, (row) => row.tokens.output),
});

type TokenColumn = Pick<Column<MonthRow>, 'key' | 'header' | 'csvHeader' | 'hint' | 'calc'>;

/** The token columns start hidden, and show a dash when the file has no token columns. Cache read and write sit next to the hit rate. */
function tokenColumns(hasTokens: boolean): Column<MonthRow>[] {
  const count = (column: TokenColumn, readValue: (tokens: MonthTokens) => number): Column<MonthRow> => ({
    ...column,
    align: 'end',
    hidden: true,
    value: (row) => (hasTokens ? readValue(row.tokens) : null),
    render: (row) => (hasTokens ? fmtTokens(readValue(row.tokens)) : '–'),
    total: (tableRows) => (hasTokens ? fmtTokens(readValue(tokensOf(tableRows))) : '–'),
  });
  return [
    count(
      {
        key: 'tokensIn',
        header: t('Input tokens'),
        csvHeader: t('Input tokens'),
        hint: t('Tokens of new text sent to the model, not read from the cache.'),
        calc: 'tokens-input',
      },
      (tokens) => tokens.input,
    ),
    count({ key: 'tokensOut', header: t('Output tokens'), csvHeader: t('Output tokens'), hint: t('Tokens the model wrote back.'), calc: 'tokens-output' }, (tokens) => tokens.output),
    count(
      {
        key: 'tokensCr',
        header: t('Cache read tokens'),
        csvHeader: t('Cache read tokens'),
        hint: t('Text the model has seen before and reads again from its cache, at a lower price than new input.'),
        calc: 'tokens-cache-read',
      },
      (tokens) => tokens.cacheRead,
    ),
    count(
      {
        key: 'tokensCw',
        header: t('Cache write tokens'),
        csvHeader: t('Cache write tokens'),
        hint: t('Text the model saves in its cache so that later requests can read it again.'),
        calc: 'tokens-cache-write',
      },
      (tokens) => tokens.cacheWrite,
    ),
    {
      key: 'cacheHit',
      header: t('Cache hit rate'),
      align: 'end',
      hint: t('Cache read tokens as a share of all prompt tokens (input, cache read and cache write).'),
      calc: 'cache-hit',
      hidden: true,
      csvHeader: t('Cache hit rate (%)'),
      value: (row) => (hasTokens && promptOf(row.tokens) > 0 ? Math.round(hitRateOf(row.tokens) * 1000) / 10 : null),
      render: (row) => (hasTokens ? fmtPct(hitRateOf(row.tokens), 0) : '–'),
      total: (tableRows) => (hasTokens ? fmtPct(hitRateOf(tokensOf(tableRows)), 0) : '–'),
    },
    count(
      {
        key: 'tokensAll',
        header: t('Total tokens'),
        csvHeader: t('Total tokens'),
        hint: t('Input, output, cache read and cache write tokens together.'),
        calc: 'tokens-total',
      },
      (tokens) => promptOf(tokens) + tokens.output,
    ),
  ];
}

interface MonthTableProps {
  rows: MonthRow[];
  selected: string | null;
  onSelect: (key: string) => void;
}

function ranOutCell(row: MonthRow): string | null {
  const { m: month } = row;
  if (month.exhaustedOn !== null) return fmtDay(month.exhaustedOn, true);
  if (!row.known) return null;
  if (month.complete) return t('Lasted');
  return month.projection?.exhaustionDate != null ? t('Expected {date}', { date: fmtDay(month.projection.exhaustionDate) }) : t('Not yet');
}

export function MonthTable({ rows, selected, onSelect }: MonthTableProps) {
  const { analysis } = useAnalysis();
  const { narrowed, pool, agg: aggregates, coverage } = analysis;
  const billing = coverage.billing;
  const hasTokens = coverage.tokens;
  const showPool = !narrowed && rows.some((row) => row.known);
  const star = pool.capacityIsLowerBound ? '*' : '';
  const users = aggregates.totals.users;
  const gaps = useMemo(() => gapMonths(pool.months), [pool.months]);

  const columns = useMemo(() => {
    const cols: Column<MonthRow>[] = [
      {
        key: 'month',
        header: t('Month'),
        value: (row) => row.m.key,
        csvHeader: t('Month'),
        render: (row) => (
          <span className="whitespace-nowrap font-medium">
            {row.m.label}
            {!row.m.complete ? (
              <span className="ms-1.5 text-[11px] font-normal text-fg-subtle">{t('so far')}</span>
            ) : row.partial ? (
              <span className="ms-1.5 text-[11px] font-normal text-fg-subtle">{t('partial')}</span>
            ) : null}
          </span>
        ),
      },
      {
        key: 'usage',
        strong: true,
        header: t('Usage'),
        align: 'end',
        hint: t('Value of the AI credits used.'),
        calc: 'usage',
        csvHeader: t('Usage (USD)'),
        value: (row) => cents(row.m.gross),
        render: (row) => fmtUSD(row.m.gross),
        total: (tableRows) => fmtUSD(sum(tableRows, (row) => row.m.gross)),
      },
    ];
    if (billing) {
      cols.push(
        {
          key: 'covered',
          header: t('Covered'),
          align: 'end',
          hint: t('Usage paid for by the included credits.'),
          calc: 'covered',
          csvHeader: t('Covered by included credits (USD)'),
          value: (row) => cents(row.m.discount),
          render: (row) => fmtUSD(row.m.discount),
          total: (tableRows) => fmtUSD(sum(tableRows, (row) => row.m.discount)),
        },
        {
          key: 'billed',
          header: t('Billed'),
          align: 'end',
          hint: t('Usage beyond the included credits, billed on top of seats.'),
          calc: 'billed',
          csvHeader: t('Billed on top of seats (USD)'),
          value: (row) => cents(row.m.net),
          render: (row) => <span className={row.m.net > 0.005 ? 'font-medium text-warn' : undefined}>{fmtUSD(row.m.net)}</span>,
          total: (tableRows) => fmtUSD(sum(tableRows, (row) => row.m.net)),
        },
      );
    }
    if (showPool) {
      cols.push(
        {
          key: 'capacity',
          header: t('Pool size'),
          align: 'end',
          hint: t('Credits included with all seats, at $0.01 each. A month whose pool size is not known shows a dash.'),
          calc: 'pool-size',
          csvHeader: t('Pool size (USD)'),
          value: (row) => (row.known ? cents(row.m.capacity) : null),
          render: (row) => (row.known ? `${fmtUSD(row.m.capacity, 0)}${star}` : '–'),
          total: (tableRows) => (tableRows.length && tableRows.every((row) => row.known) ? `${fmtUSD(sum(tableRows, (row) => row.m.capacity), 0)}${star}` : ''),
        },
        {
          key: 'used',
          header: t('Included credits used'),
          align: 'end',
          hint: t('Covered usage divided by the pool size.'),
          calc: 'pool-utilization',
          csvHeader: t('Included credits used (%)'),
          value: (row) => (row.known ? Math.round(row.m.utilization * 1000) / 10 : null),
          render: (row) => (row.known ? fmtPct(row.m.utilization, 0) : '–'),
          total: (tableRows) => (tableRows.length && tableRows.every((row) => row.known) ? fmtPct(sum(tableRows, (row) => row.m.discount) / sum(tableRows, (row) => row.m.capacity), 0) : ''),
        },
      );
    }
    if (!narrowed && billing) {
      cols.push({
        key: 'ranOut',
        header: t('Ran out on'),
        align: 'end',
        hint: t('The first day with usage billed on top of seats. An expected date is a projection.'),
        calc: ['pool-exhausted', 'projection'],
        csvHeader: t('Ran out on'),
        value: (row) => (row.m.exhaustedOn !== null ? isoDate(row.m.exhaustedOn) : null),
        render: (row) => ranOutCell(row) ?? '–',
        total: (tableRows) => t('{count} of {total}', { count: fmtInt(tableRows.filter((row) => row.m.exhaustedOn !== null).length), total: fmtInt(tableRows.length) }),
      });
    }
    if (showPool) {
      cols.push({
        key: 'left',
        header: t('Included credits left'),
        align: 'end',
        hint: t('Included credits not used yet. Unused credits do not roll over to the next month.'),
        calc: 'pool-headroom',
        csvHeader: t('Included credits left (USD)'),
        value: (row) => (row.known ? cents(row.m.headroom) : null),
        render: (row) => (row.known ? fmtUSD(row.m.headroom, 0) : '–'),
      });
    }
    cols.push(
      {
        key: 'users',
        header: t('Active users'),
        align: 'end',
        hint: t('Named users with usage above $0 in the month.'),
        calc: 'active-users-per-month',
        csvHeader: t('Active users'),
        value: (row) => row.activeUsers,
        render: (row) => fmtInt(row.activeUsers),
        total: () => fmtInt(users),
      },
      {
        key: 'perUser',
        header: t('Usage per user'),
        align: 'end',
        hint: t('Usage of the named users divided by the active users.'),
        calc: 'spend-month-usage-per-user',
        csvHeader: t('Usage per active user (USD)'),
        value: (row) => cents(row.perActiveUser),
        render: (row) => fmtUSD(row.perActiveUser),
      },
    );
    if (showPool) {
      cols.push({
        key: 'cost',
        header: t('Monthly cost'),
        align: 'end',
        hint: t('Seats plus overage: the larger of the pool size and the usage. A seat costs as much as the credits it includes.'),
        calc: 'monthly-cost',
        csvHeader: t('Monthly cost (USD)'),
        value: (row) => cents(row.cost),
        render: (row) => fmtUSD(row.cost, 0),
        total: (tableRows) => (tableRows.length && tableRows.every((row) => row.known) ? fmtUSD(sum(tableRows, (row) => row.cost), 0) : ''),
      });
    }
    cols.push({
      key: 'projected',
      header: t('Projected usage'),
      align: 'end',
      hint: t('For a month in progress: usage at the end of the month if the current pace holds.'),
      calc: 'projection',
      csvHeader: t('Projected usage (USD)'),
      value: (row) => (row.m.projection ? cents(row.m.projection.projGross) : null),
      render: (row) => {
        const projection = row.m.projection;
        return projection ? (
          <span title={t('Likely {low} to {high}', { low: fmtUSD(projection.projGrossLow, 0), high: fmtUSD(projection.projGrossHigh, 0) })}>{fmtUSD(projection.projGross, 0)}</span>
        ) : (
          '–'
        );
      },
    });
    cols.push(...tokenColumns(hasTokens));
    return cols;
  }, [showPool, narrowed, billing, hasTokens, star, users]);

  const gapList = gaps.map(monthLabel).join(', ');

  return (
    <Card title={t('Usage and pool by month')} subtitle={t('Click a month to see its daily curve above.')} calc="spend-month-table">
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(row) => row.m.key}
        defaultSort={{ key: 'month', dir: 'desc' }}
        exportName="github-copilot-usage-by-month"
        selectedKey={selected}
        onRowClick={(row) => onSelect(row.m.key)}
        emptyText={t('No billing month in the selected period')}
      />
      {(showPool && pool.capacityIsLowerBound) || gaps.length > 0 ? (
        <div className="mt-2 space-y-1 text-[11px] text-fg-subtle">
          {showPool && pool.capacityIsLowerBound ? (
            <p>
              <T
                text="* Counts only the seats that appear in the report. {link} for the real pool size."
                values={{
                  link: (
                    <button type="button" className="text-accent hover:underline" onClick={() => navigate('settings')}>
                      {t('Add your roster in Settings')}
                    </button>
                  ),
                }}
              />
            </p>
          ) : null}
          {gaps.length > 0 ? (
            <p>
              {tp(
                gaps.length,
                'No usage rows for {months}, so that month is not listed.',
                'No usage rows for {months}, so those months are not listed.',
                { months: gapList },
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
