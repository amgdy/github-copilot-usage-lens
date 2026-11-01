import { useMemo } from 'react';
import { ProductIcon } from '../../components/icons';
import { Card, DataTable, type Column } from '../../components/ui';
import { t } from '../../i18n';
import { labelOf } from '../../lib/types';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { drill } from '../../state/router';
import { buildSkuRows, type SkuRow } from './helpers';

const cents = (amount: number): number | null => (Number.isFinite(amount) ? Math.round(amount * 100) / 100 : null);
const sum = (rows: SkuRow[], getValue: (row: SkuRow) => number): number => rows.reduce((total, row) => total + getValue(row), 0);

export function SkuTable() {
  const { analysis, store } = useAnalysis();
  const { agg: aggregates, mask, range, coverage } = analysis;
  const billing = coverage.billing;
  const rows = useMemo(() => buildSkuRows(store, mask, range, aggregates), [store, mask, range, aggregates]);
  const users = aggregates.totals.users;

  const columns = useMemo<Column<SkuRow>[]>(() => {
    const cols: Column<SkuRow>[] = [
      {
        key: 'sku',
        header: t('SKU'),
        value: (row) => row.sku,
        render: (row) => (
          <span className="inline-flex items-center gap-1.5 font-medium">
            {row.productIds[0] ? <ProductIcon product={row.productIds[0]} size={13} className="shrink-0 text-fg-muted" /> : null}
            {row.sku}
          </span>
        ),
      },
      {
        key: 'product',
        header: t('Product'),
        value: (row) => row.products,
        render: (row) =>
          row.productIds.length ? (
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {row.productIds.map((productId) => (
                <span key={productId} className="inline-flex items-center gap-1">
                  <ProductIcon product={productId} size={12} className="shrink-0 text-fg-muted" />
                  {labelOf('product', productId)}
                </span>
              ))}
            </span>
          ) : (
            '–'
          ),
        hint: t('The product or products that bill under this SKU.'),
      },
      {
        key: 'credits',
        header: t('AI credits'),
        align: 'end',
        hint: t('AI credits used.'),
        calc: 'ai-credit',
        value: (row) => Math.round(row.credits),
        render: (row) => fmtInt(row.credits),
        total: (tableRows) => fmtInt(sum(tableRows, (row) => row.credits)),
      },
      {
        key: 'usage',
        strong: true,
        header: t('Usage'),
        align: 'end',
        hint: t('Value of the AI credits used.'),
        calc: 'usage',
        csvHeader: t('Usage (USD)'),
        value: (row) => cents(row.gross),
        render: (row) => fmtUSD(row.gross),
        total: (tableRows) => fmtUSD(sum(tableRows, (row) => row.gross)),
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
          value: (row) => cents(row.covered),
          render: (row) => fmtUSD(row.covered),
          total: (tableRows) => fmtUSD(sum(tableRows, (row) => row.covered)),
        },
        {
          key: 'billed',
          header: t('Billed'),
          align: 'end',
          hint: t('Usage beyond the included credits, billed on top of seats.'),
          calc: 'billed',
          csvHeader: t('Billed on top of seats (USD)'),
          value: (row) => cents(row.billed),
          render: (row) => <span className={row.billed > 0.005 ? 'font-medium text-warn' : undefined}>{fmtUSD(row.billed)}</span>,
          total: (tableRows) => fmtUSD(sum(tableRows, (row) => row.billed)),
        },
      );
    }
    cols.push(
      {
        key: 'share',
        header: t('Share of usage'),
        align: 'end',
        hint: t('Usage of the SKU divided by the usage of all SKUs.'),
        calc: 'usage-by-sku',
        csvHeader: t('Share of usage (%)'),
        value: (row) => Math.round(row.share * 1000) / 10,
        render: (row) => fmtPct(row.share, 1),
      },
      {
        key: 'users',
        header: t('Users'),
        align: 'end',
        hint: t('People with at least one row under this SKU. Rows without a username are not counted.'),
        calc: 'usage-by-sku',
        value: (row) => row.users,
        render: (row) => (row.users > 0 ? fmtInt(row.users) : '–'),
        total: () => fmtInt(users),
      },
    );
    return cols;
  }, [users, billing]);

  return (
    <Card title={t('Usage by SKU')} subtitle={t('Click a row to keep only that SKU.')} calc="usage-by-sku">
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id}
        defaultSort={{ key: 'usage', dir: 'desc' }}
        pageSize={10}
        searchable
        searchPlaceholder={t('Search SKUs…')}
        exportName="github-copilot-usage-by-sku"
        onRowClick={(row) => drill({ skus: [store.dicts.sku.values[row.id]] }, { merge: true })}
        emptyText={t('No usage in this period')}
      />
    </Card>
  );
}
