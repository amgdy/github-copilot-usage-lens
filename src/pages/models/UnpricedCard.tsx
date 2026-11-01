import { useMemo } from 'react';
import { Callout, Card, DataTable, type Column } from '../../components/ui';
import { t, T } from '../../i18n';
import { BLANK_LABELS } from '../../lib/types';
import { fmtInt, fmtPct, fmtUSD, pluralize } from '../../lib/utils/format';
import { drill, navigate } from '../../state/router';
import type { ModelRow } from './data';
import { TierBadge, VendorName, tierLabel } from './parts';

const buildColumns = (): Column<ModelRow>[] => [
  {
    key: 'model',
    header: t('Model'),
    value: (model) => model.label,
    render: (model) => (
      <VendorName vendor={model.vendor} className="font-medium whitespace-nowrap">
        {model.label}
      </VendorName>
    ),
  },
  {
    key: 'tier',
    header: t('Tier'),
    value: (model) => tierLabel(model.tier),
    render: (model) => <TierBadge tier={model.tier} />,
    hint: t('A model without a price counts as Unknown until you give it a tier in Settings.'),
    calc: 'model-tier',
  },
  {
    key: 'gross',
    strong: true,
    header: t('Usage'),
    align: 'end',
    value: (model) => model.gross,
    render: (model) => fmtUSD(model.gross),
    hint: t('The amount charged in the report for this model.'),
    calc: 'usage',
    total: (models) => fmtUSD(models.reduce((total, model) => total + model.gross, 0)),
  },
  {
    key: 'share',
    header: t('Share of usage'),
    align: 'end',
    value: (model) => model.share,
    render: (model) => fmtPct(model.share),
    calc: 'model-share',
    total: (models) => fmtPct(models.reduce((total, model) => total + model.share, 0)),
  },
  {
    key: 'requests',
    header: t('Requests'),
    align: 'end',
    value: (model) => model.requests,
    render: (model) => fmtInt(model.requests),
    hint: t('Usage lines in the report.'),
    calc: 'model-requests',
    total: (models) => fmtInt(models.reduce((total, model) => total + model.requests, 0)),
  },
  { key: 'users', header: t('Users'), align: 'end', value: (model) => model.users, render: (model) => fmtInt(model.users), calc: 'model-users' },
];

export function UnpricedCard({ rows }: { rows: ModelRow[] }) {
  const unpriced = useMemo(() => rows.filter((model) => !model.priced), [rows]);
  const columns = useMemo(() => buildColumns(), []);
  if (unpriced.length === 0) return null;

  const gross = unpriced.reduce((total, model) => total + model.gross, 0);
  const share = unpriced.reduce((total, model) => total + model.share, 0);
  const noName = unpriced.some((model) => model.value === '');

  return (
    <Card
      title={t('Models without a price')}
      subtitle={t('These models are not on the price card, and Settings has no price for them.')}
      calc="model-unpriced"
    >
      <div className="space-y-3">
        <Callout
          tone="warn"
          title={t('{amount} of usage ({pct}) is on {models} without a price', {
            amount: fmtUSD(gross),
            pct: fmtPct(share),
            models: pluralize(unpriced.length, 'model'),
          })}
          action={
            <button type="button" className="btn btn-sm" onClick={() => navigate('settings')}>
              {t('Open Settings')}
            </button>
          }
        >
          {t(
            'Set a tier and a price for each one under Model pricing and tiers in Settings. Until then their usage still counts in every total. But it cannot be compared with cheaper models or checked for cache and long-prompt costs.',
          )}
        </Callout>
        <DataTable
          rows={unpriced}
          columns={columns}
          rowKey={(model) => model.id}
          defaultSort={{ key: 'gross', dir: 'desc' }}
          pageSize={10}
          dense
          fixedColumns
          exportName="github-copilot-models-without-price"
          onRowClick={(model) => drill({ models: [model.value] }, { merge: true })}
        />
        {noName ? (
          <p className="text-xs text-fg-muted">
            <T
              text="{label} means the report had no model name on those lines, so there is nothing to price."
              values={{ label: t(BLANK_LABELS.model) }}
            />
          </p>
        ) : null}
      </div>
    </Card>
  );
}
