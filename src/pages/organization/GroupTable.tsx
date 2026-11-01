import { useMemo, useState } from 'react';
import { ListFilter } from 'lucide-react';
import { Card, DataTable, Segmented, cx, type CalcRef, type Column, type SegmentedOption } from '../../components/ui';
import { msg, t } from '../../i18n';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { usePerMonth } from '../shared';
import { GroupName, NO_BILLING_NOTE, NO_TOKENS_NOTE, ShareCell, filterToGroup, fmtTokens, signedPct } from './bits';
import type { DimSpec } from './dimensions';
import { cacheHitRate, perUserMonth, totalTokens, trendChange, type Group, type TokenCounts } from './groups';

const DASH = <span className="text-fg-subtle">–</span>;

type View = 'usage' | 'tokens';

const VIEWS: { value: View; label: string; title: string }[] = [
  { value: 'usage', label: msg('Usage'), title: msg('Usage, billed amounts, users and trend') },
  { value: 'tokens', label: msg('Tokens'), title: msg('Input, cache read, cache write and output tokens') },
];

/** Columns that need the billing split of the file. */
const BILLING_COLUMNS = new Set(['billed', 'covered', 'billedShare']);

function Trend({ g: group, reliable }: { g: Group; reliable: boolean }) {
  if (!reliable) return DASH;
  const change = trendChange(group);
  if (change === null) return group.recent > 0 ? <span className="text-fg-muted">{t('new')}</span> : DASH;
  return <span className={cx(change > 0.25 && 'text-warn')}>{signedPct(change)}</span>;
}

/** Every group with its usage, bill, users and trend. A click on a row selects the group; the Filter button narrows the report. */
export function GroupTable({
  spec,
  groups,
  reliable,
  selected,
  onSelect,
}: {
  spec: DimSpec;
  groups: Group[];
  /** The period has two full weeks, so the trend can be shown. */
  reliable: boolean;
  selected: number | null;
  onSelect: (id: number | null) => void;
}) {
  const { analysis } = useAnalysis();
  const perMonth = usePerMonth();
  const totals = analysis.agg.totals;
  const { billing, tokens } = analysis.coverage;
  const [picked, setPicked] = useState<View>('usage');
  const view: View = tokens ? picked : 'usage';

  const columns = useMemo<Column<Group>[]>(() => {
    const maxShare = groups.reduce((largest, row) => Math.max(largest, row.share), 0);
    const sum = (rows: Group[], pick: (row: Group) => number) => rows.reduce((total, row) => total + pick(row), 0);
    const everything = (rows: Group[]) => rows.length === groups.length;
    const sumTokens = (rows: Group[]): TokenCounts => ({
      input: sum(rows, (row) => row.input),
      cacheRead: sum(rows, (row) => row.cacheRead),
      cacheWrite: sum(rows, (row) => row.cacheWrite),
      output: sum(rows, (row) => row.output),
    });

    const group: Column<Group> = {
      key: 'group',
      header: t(spec.label),
      value: (row) => row.name,
      render: (row) => <GroupName name={row.name} blank={row.blank} />,
      total: (rows) => (everything(rows) ? t('Total') : t('Total of {n} matching', { n: fmtInt(rows.length) })),
    };
    const usage: Column<Group> = {
      key: 'usage',
      strong: true,
      header: t('Usage'),
      hint: t('Value of all AI credits used (1 credit = $0.01), including usage covered by included credits'),
      calc: 'usage',
      align: 'end',
      value: (row) => row.gross,
      render: (row) => fmtUSD(row.gross),
      total: (rows) => fmtUSD(sum(rows, (row) => row.gross)),
    };
    const filter: Column<Group> = {
      key: 'filter',
      header: <span className="sr-only">{t('Filter')}</span>,
      csvHeader: t('Filter'),
      noCsv: true,
      sortable: false,
      align: 'end',
      value: () => null,
      render: (row) => (
        <button
          type="button"
          className="btn btn-sm"
          title={t('Filter the whole report to {name}', { name: row.name })}
          onClick={(event) => {
            event.stopPropagation();
            filterToGroup(row);
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <ListFilter size={12} /> {t('Filter')}
        </button>
      ),
    };
    const tokenColumn = (base: { key: string; header: string; hint: string; calc: CalcRef }, pick: (tokenCounts: TokenCounts) => number): Column<Group> => ({
      ...base,
      align: 'end',
      value: (row) => pick(row),
      render: (row) => fmtTokens(pick(row)),
      total: (rows) => fmtTokens(sum(rows, pick)),
    });
    const hitRate = (tokenCounts: TokenCounts) => {
      const rate = cacheHitRate(tokenCounts);
      return Number.isFinite(rate) ? rate : null;
    };

    if (view === 'tokens') {
      return [
        group,
        usage,
        tokenColumn(
          { key: 'input', header: t('Input tokens'), hint: t('Tokens of fresh text sent to the model, not read from the cache'), calc: 'tokens-input' },
          (tokenCounts) => tokenCounts.input,
        ),
        tokenColumn(
          {
            key: 'cacheRead',
            header: t('Cache read tokens'),
            hint: t('Tokens served from the model cache, which are priced lower than fresh input'),
            calc: 'tokens-cache-read',
          },
          (tokenCounts) => tokenCounts.cacheRead,
        ),
        tokenColumn(
          {
            key: 'cacheWrite',
            header: t('Cache write tokens'),
            hint: t('Tokens written to the model cache so that later requests can reuse them'),
            calc: 'tokens-cache-write',
          },
          (tokenCounts) => tokenCounts.cacheWrite,
        ),
        tokenColumn({ key: 'output', header: t('Output tokens'), hint: t('Tokens the model wrote back'), calc: 'tokens-output' }, (tokenCounts) => tokenCounts.output),
        tokenColumn(
          { key: 'totalTokens', header: t('Total tokens'), hint: t('Input, cache read, cache write and output tokens together'), calc: 'tokens-total' },
          totalTokens,
        ),
        {
          key: 'cacheHit',
          header: t('Cache hit rate'),
          hint: t('Cache read tokens as a share of all prompt tokens (input, cache read and cache write)'),
          calc: 'cache-hit',
          align: 'end',
          value: (row) => hitRate(row),
          render: (row) => {
            const rate = hitRate(row);
            return rate === null ? DASH : fmtPct(rate, 1);
          },
          total: (rows) => {
            const rate = hitRate(sumTokens(rows));
            return rate === null ? DASH : fmtPct(rate, 1);
          },
        },
        filter,
      ];
    }

    const usageView: Column<Group>[] = [
      group,
      usage,
      {
        key: 'share',
        header: t('Share'),
        hint: t('Share of all usage in this view'),
        calc: 'org-share',
        align: 'end',
        value: (row) => row.share,
        render: (row) => <ShareCell frac={row.share} max={maxShare} text={fmtPct(row.share, 1)} />,
        total: (rows) => fmtPct(sum(rows, (row) => row.share), 1),
      },
      {
        key: 'billed',
        header: t('Billed'),
        hint: t('Billed on top of seats, as the report assigns it to this group'),
        calc: 'billed',
        align: 'end',
        value: (row) => row.net,
        render: (row) => fmtUSD(row.net),
        total: (rows) => fmtUSD(sum(rows, (row) => row.net)),
      },
      {
        key: 'covered',
        header: t('Covered'),
        hint: t('Usage covered by included credits'),
        calc: 'covered',
        align: 'end',
        value: (row) => row.discount,
        render: (row) => fmtUSD(row.discount),
        total: (rows) => fmtUSD(sum(rows, (row) => row.discount)),
      },
      {
        key: 'users',
        header: t('Users'),
        hint: t('People with usage in the group. A person who appears in several groups is counted in each of them.'),
        calc: 'org-users',
        align: 'end',
        hidden: !groups.some((row) => row.users > 0),
        value: (row) => row.users,
        render: (row) => fmtInt(row.users),
        total: (rows) => (everything(rows) ? fmtInt(totals.users) : DASH),
      },
      {
        key: 'perUser',
        header: t('Usage per user / month'),
        hint: t('Usage divided by users, in a 30.4-day month'),
        calc: 'org-per-user-month',
        align: 'end',
        value: (row) => {
          const perUser = perUserMonth(row, perMonth);
          return Number.isFinite(perUser) ? perUser : null;
        },
        render: (row) => {
          const perUser = perUserMonth(row, perMonth);
          return Number.isFinite(perUser) ? fmtUSD(perUser) : DASH;
        },
        total: (rows) => (everything(rows) && totals.users > 0 ? fmtUSD((totals.gross * perMonth) / totals.users) : DASH),
      },
      {
        key: 'trend',
        header: t('Trend'),
        hint: t('Usage of the last 7 days of the period against the 7 days before. It needs a period of at least 14 days.'),
        calc: 'org-trend',
        align: 'end',
        value: (row) => (reliable ? trendChange(row) : null),
        render: (row) => <Trend g={row} reliable={reliable} />,
      },
      {
        key: 'billedShare',
        header: t('Billed share'),
        hint: t('Part of the group’s own usage that is billed on top of seats'),
        calc: 'org-billed-share',
        align: 'end',
        hidden: true,
        value: (row) => (row.gross > 0 ? row.net / row.gross : null),
        render: (row) => (row.gross > 0 ? fmtPct(row.net / row.gross, 1) : DASH),
      },
      filter,
    ];
    return usageView.filter((column) => billing || !BILLING_COLUMNS.has(column.key));
  }, [spec, groups, reliable, perMonth, totals, view, billing]);

  const noTokenCounts = view === 'tokens' && groups.every((group) => totalTokens(group) === 0);
  const notes = [
    !tokens ? t(NO_TOKENS_NOTE) : null,
    noTokenCounts ? t('The rows in this view have no token counts, so every token column is 0.') : null,
    !billing ? t(NO_BILLING_NOTE) : null,
  ].filter((note): note is string => note !== null);
  const viewOptions: SegmentedOption<View>[] = VIEWS.map((option) => ({ value: option.value, label: t(option.label), title: t(option.title) }));

  return (
    <Card
      title={t(spec.all)}
      subtitle={t('Click a row to see what the group is made of. The Filter button narrows the whole report to it.')}
      calc={[spec.id === 'team' ? 'org-team-groups' : 'org-groups', ...(view === 'tokens' ? ['org-group-tokens'] : [])]}
      actions={tokens ? <Segmented size="sm" label={t('Columns shown')} value={view} onChange={setPicked} options={viewOptions} /> : undefined}
      footer={notes.length ? notes.map((note) => <p key={note}>{note}</p>) : undefined}
    >
      <DataTable
        key={view}
        rows={groups}
        columns={columns}
        rowKey={(group) => group.id}
        defaultSort={{ key: 'usage', dir: 'desc' }}
        pageSize={25}
        searchable
        searchPlaceholder={t('Search groups…')}
        exportName={`github-copilot-organization-${spec.id}${view === 'tokens' ? '-tokens' : ''}`}
        selectedKey={selected}
        onRowClick={(group) => onSelect(group.id === selected ? null : group.id)}
        emptyText={t('No groups match.')}
      />
    </Card>
  );
}
