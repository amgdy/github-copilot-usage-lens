import { useMemo } from 'react';
import { FeatureIcon } from '../../components/icons';
import { Card, DataTable, type Column } from '../../components/ui';
import { t } from '../../i18n';
import { modelAutoDiscount } from '../../lib/analytics/autoDiscount';
import type { Vendor } from '../../lib/pricing/card';
import { fmtPct, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { drill } from '../../state/router';
import type { ModelRow } from './data';
import { PriceSource, VendorName } from './parts';

interface AutoModelRow {
  id: number;
  value: string;
  label: string;
  vendor: Vendor;
  billed: number;
  share: number;
  measuredBilled: number;
  measuredList: number;
  discount: number;
  /** NaN when nothing could be measured for the model. */
  rate: number;
}

const sum = (rows: AutoModelRow[], pick: (row: AutoModelRow) => number): number => rows.reduce((total, row) => total + pick(row), 0);
const measured = (row: AutoModelRow): boolean => Number.isFinite(row.rate);

const buildColumns = (): Column<AutoModelRow>[] => [
  {
    key: 'model',
    header: t('Model'),
    value: (row) => row.label,
    render: (row) => (
      <VendorName vendor={row.vendor} className="font-medium whitespace-nowrap">
        {row.label}
      </VendorName>
    ),
  },
  {
    key: 'billed',
    strong: true,
    header: t('Auto usage'),
    align: 'end',
    value: (row) => row.billed,
    render: (row) => fmtUSD(row.billed),
    hint: t('Usage that went through Auto and landed on this model, as charged in the report. This is after the Auto discount.'),
    calc: 'model-auto-usage',
    total: (rows) => fmtUSD(sum(rows, (row) => row.billed)),
  },
  {
    key: 'share',
    header: t('Auto share'),
    align: 'end',
    value: (row) => row.share,
    render: (row) => fmtPct(row.share, 0),
    hint: t('Share of the usage of this model that went through Auto.'),
    calc: 'model-auto-share',
  },
  {
    key: 'measured',
    header: t('Measured usage'),
    align: 'end',
    value: (row) => row.measuredBilled,
    render: (row) => fmtUSD(row.measuredBilled),
    hint: t('The part of the Auto usage that could be priced from token counts and the price card.'),
    calc: 'model-auto-measured',
    total: (rows) => fmtUSD(sum(rows, (row) => row.measuredBilled)),
  },
  {
    key: 'original',
    header: t('Original price (measured)'),
    align: 'end',
    value: (row) => row.measuredList,
    render: (row) => fmtUSD(row.measuredList),
    hint: t('What the measured usage would have cost at the price card, without the Auto discount.'),
    calc: 'model-auto-measured-original',
    total: (rows) => fmtUSD(sum(rows, (row) => row.measuredList)),
  },
  {
    key: 'discount',
    header: t('Discount'),
    align: 'end',
    value: (row) => (measured(row) ? row.discount : null),
    render: (row) => (measured(row) ? fmtUSD(row.discount) : '–'),
    hint: t('Original price minus measured usage. A dash means nothing could be measured for this model.'),
    calc: 'model-auto-model-discount',
    total: (rows) => fmtUSD(sum(rows, (row) => (measured(row) ? row.discount : 0))),
  },
  {
    key: 'rate',
    header: t('Discount rate'),
    align: 'end',
    value: (row) => (measured(row) ? row.rate : null),
    render: (row) => (measured(row) ? fmtPct(row.rate, 1) : '–'),
    hint: t('Discount divided by the original price of the measured usage. A dash means nothing could be measured for this model.'),
    calc: 'model-auto-model-rate',
    total: (rows) => {
      const original = sum(rows, (row) => row.measuredList);
      return original > 0 ? fmtPct(sum(rows, (row) => (measured(row) ? row.discount : 0)) / original, 1) : '–';
    },
  },
];

/** The measured Auto discount of each model that Auto picked. Nothing here is estimated. */
export function AutoByModel({ rows }: { rows: ModelRow[] }) {
  const { analysis } = useAnalysis();
  const extra = analysis.agg.modelExtra;
  const columns = useMemo(() => buildColumns(), []);

  const list = useMemo(
    () =>
      rows
        .filter((model) => model.autoGross > 0)
        .map((model): AutoModelRow => {
          const autoDiscount = modelAutoDiscount(extra, model.id);
          return {
            id: model.id,
            value: model.value,
            label: model.label,
            vendor: model.vendor,
            billed: model.autoGross,
            share: model.autoShare,
            measuredBilled: autoDiscount.measuredBilled,
            measuredList: autoDiscount.measuredList,
            discount: autoDiscount.discount,
            rate: autoDiscount.rate,
          };
        }),
    [rows, extra],
  );

  if (list.length === 0) return null;

  return (
    <Card
      title={
        <>
          <FeatureIcon feature="auto" size={16} className="shrink-0 text-fg-muted" />
          {t('Auto discount by model')}
        </>
      }
      subtitle={t(
        'Each model that Auto picked, with its Auto usage set against the same tokens at the original price. Click a row to filter the whole page by that model.',
      )}
      calc="model-auto-by-model"
      footer={
        <div className="space-y-0.5">
          <p>
            {t(
              'Only usage that could be measured from token counts is compared. Nothing here is estimated, so the discounts can add up to less than Auto discount received.',
            )}
          </p>
          <p>
            {t(
              'A dash means nothing was measured, for example because the model has no price on the price card or its rows have no token counts. This table follows the selected rows, including segment filters.',
            )}
          </p>
          <PriceSource />
        </div>
      }
    >
      <DataTable
        rows={list}
        columns={columns}
        rowKey={(row) => row.id}
        defaultSort={{ key: 'billed', dir: 'desc' }}
        pageSize={10}
        dense
        fixedColumns
        exportName="github-copilot-auto-by-model"
        onRowClick={(row) => drill({ models: [row.value] }, { merge: true })}
      />
    </Card>
  );
}
