import { useMemo } from 'react';
import { VendorIcon } from '../../components/icons';
import { Badge, Card, DataTable, ProgressBar, type Column } from '../../components/ui';
import { t } from '../../i18n';
import { fmtInt, fmtNum, fmtPct, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { drill } from '../../state/router';
import { useApp } from '../../state/store';
import type { ModelRow } from './data';
import { PriceSource, TierBadge, VendorName, fmtCount, fmtCredits, fmtRate, tierLabel, vendorLabel } from './parts';

const sum = (rows: ModelRow[], pick: (model: ModelRow) => number): number => rows.reduce((total, model) => total + pick(model), 0);

export function ModelTable({ rows }: { rows: ModelRow[] }) {
  const { store } = useAnalysis();
  const selectUser = useApp((state) => state.selectUser);
  const hasTokens = store.hasTokens;
  const hasTopUser = rows.some((model) => model.topUser !== null);

  const columns = useMemo(() => {
    const lead: Column<ModelRow>[] = [
      {
        key: 'model',
        header: t('Model'),
        value: (model) => model.label,
        render: (model) => (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <VendorIcon vendor={model.vendor} size={14} className="shrink-0 text-fg-muted" />
            <span className="font-medium">{model.label}</span>
            {!model.priced ? (
              <Badge tone="warn" title={t('This model has no price on the price card or in Settings, so it cannot be compared. Set a tier and a price in Settings.')}>
                {t('No price')}
              </Badge>
            ) : null}
            {model.autoShare >= 0.999 ? (
              <Badge tone="info" title={t('Auto picked this model for at least 99.9% of its usage.')}>
                {t('Auto only')}
              </Badge>
            ) : null}
          </span>
        ),
      },
      {
        key: 'vendor',
        header: t('Vendor'),
        value: (model) => vendorLabel(model.vendor),
        render: (model) => <VendorName vendor={model.vendor} className="whitespace-nowrap" />,
        calc: 'model-vendor',
      },
      {
        key: 'tier',
        header: t('Tier'),
        value: (model) => tierLabel(model.tier),
        render: (model) => <TierBadge tier={model.tier} />,
        hint: t('Powerful, Versatile or Lightweight. Powerful models have the highest token prices.'),
        calc: 'model-tier',
      },
      {
        key: 'users',
        header: t('Users'),
        align: 'end',
        value: (model) => model.users,
        render: (model) => fmtInt(model.users),
        hint: t('People with usage on this model. Usage not tied to a person is not counted.'),
        calc: 'model-users',
      },
      {
        key: 'requests',
        header: t('Requests'),
        align: 'end',
        value: (model) => model.requests,
        render: (model) => fmtInt(model.requests),
        hint: t('Usage lines in the report. One line is not always one prompt.'),
        calc: 'model-requests',
        total: (models) => fmtInt(sum(models, (model) => model.requests)),
      },
      {
        key: 'credits',
        header: t('Credits'),
        align: 'end',
        value: (model) => model.credits,
        render: (model) => fmtCredits(model.credits),
        hint: t('AI credits used. One credit is worth $0.01.'),
        calc: 'ai-credit',
        total: (models) => fmtCredits(sum(models, (model) => model.credits)),
      },
      {
        key: 'gross',
        strong: true,
        header: t('Usage'),
        align: 'end',
        value: (model) => model.gross,
        render: (model) => fmtUSD(model.gross),
        hint: t('The amount charged in the report. Rows that went through Auto are after the Auto discount.'),
        calc: 'usage',
        total: (models) => fmtUSD(sum(models, (model) => model.gross)),
      },
      {
        key: 'share',
        header: t('Share of usage'),
        align: 'end',
        value: (model) => model.share,
        render: (model) => (
          <span className="inline-flex items-center justify-end gap-2">
            <span className="w-12">
              <ProgressBar value={model.share} height={6} label={t('Share of usage on {model}', { model: model.label })} />
            </span>
            <span className="w-12 text-end">{fmtPct(model.share)}</span>
          </span>
        ),
        hint: t('Share of all usage in this scope.'),
        calc: 'model-share',
        total: (models) => fmtPct(sum(models, (model) => model.share)),
      },
      {
        key: 'net',
        header: t('Billed'),
        align: 'end',
        value: (model) => model.net,
        render: (model) => fmtUSD(model.net),
        hint: t('Amount billed on top of seats, after included credits.'),
        calc: 'billed',
        total: (models) => fmtUSD(sum(models, (model) => model.net)),
      },
      {
        key: 'cpr',
        header: t('Credits per request'),
        align: 'end',
        value: (model) => model.creditsPerRequest,
        render: (model) => fmtNum(model.creditsPerRequest, 2),
        hint: t('Average credits per usage line. Higher means heavier requests or a more expensive model.'),
        calc: 'model-credits-per-request',
      },
    ];
    const tokens: Column<ModelRow>[] = hasTokens
      ? [
          {
            key: 'input',
            header: t('Input tokens'),
            align: 'end',
            value: (model) => model.input,
            render: (model) => fmtCount(model.input),
            hint: t('Prompt tokens that were not read from the cache.'),
            calc: 'tokens-input',
            total: (models) => fmtCount(sum(models, (model) => model.input)),
          },
          {
            key: 'output',
            header: t('Output tokens'),
            align: 'end',
            value: (model) => model.output,
            render: (model) => fmtCount(model.output),
            hint: t('Tokens the model wrote back.'),
            calc: 'tokens-output',
            total: (models) => fmtCount(sum(models, (model) => model.output)),
          },
          {
            key: 'cacheRead',
            header: t('Cache read tokens'),
            align: 'end',
            value: (model) => model.cacheRead,
            render: (model) => fmtCount(model.cacheRead),
            hint: t('Text the model has seen before and reads again from the cache at a lower price.'),
            calc: 'tokens-cache-read',
            total: (models) => fmtCount(sum(models, (model) => model.cacheRead)),
          },
          {
            key: 'cacheWrite',
            header: t('Cache write tokens'),
            align: 'end',
            value: (model) => model.cacheWrite,
            render: (model) => fmtCount(model.cacheWrite),
            hint: t('Text saved to the cache so later requests can read it at a lower price. Some models charge extra to save it.'),
            calc: 'tokens-cache-write',
            total: (models) => fmtCount(sum(models, (model) => model.cacheWrite)),
          },
          {
            key: 'cache',
            header: t('Cache hit rate'),
            align: 'end',
            value: (model) => model.cacheHit,
            render: (model) => fmtPct(model.cacheHit, 0),
            hint: t('Share of prompt tokens read from the cache. Cache reads cost far less than new input.'),
            calc: 'cache-hit',
          },
        ]
      : [];
    const tail: Column<ModelRow>[] = [
      {
        key: 'priceIn',
        header: t('Input price / 1M'),
        align: 'end',
        value: (model) => model.priceIn,
        render: (model) => fmtRate(model.priceIn),
        hint: t('Price per 1 million input tokens on the price card. A dash means the model has no price.'),
        calc: 'model-list-price',
      },
      {
        key: 'priceOut',
        header: t('Output price / 1M'),
        align: 'end',
        value: (model) => model.priceOut,
        render: (model) => fmtRate(model.priceOut),
        hint: t('Price per 1 million output tokens on the price card. A dash means the model has no price.'),
        calc: 'model-list-price',
      },
      {
        key: 'auto',
        header: t('Auto share'),
        align: 'end',
        value: (model) => model.autoShare,
        render: (model) => fmtPct(model.autoShare, 0),
        hint: t('Share of the usage on this model where Auto picked it.'),
        calc: 'model-auto-share',
      },
      {
        key: 'cheaper',
        header: t('Cheaper option'),
        value: (model) => model.cheaper?.target ?? null,
        render: (model) => (model.cheaper ? <span className="whitespace-nowrap">{model.cheaper.target}</span> : <span className="text-fg-subtle">–</span>),
        hint: t('A mid-tier model from the same vendor. Only shown for Powerful models with token data.'),
        calc: 'model-cheaper-option',
      },
      {
        key: 'ratio',
        header: t('Cost on cheaper option'),
        align: 'end',
        value: (model) => model.cheaper?.ratio ?? null,
        render: (model) => (model.cheaper ? fmtPct(model.cheaper.ratio, 0) : '–'),
        hint: t("Cost of the same tokens on the cheaper option, as a share of today's cost. 40% means 60% less."),
        calc: 'model-cheaper-cost',
      },
    ];
    const topUser: Column<ModelRow>[] = hasTopUser
      ? [
          {
            key: 'topUser',
            header: t('Top user'),
            hidden: true,
            value: (model) => model.topUser?.name ?? null,
            render: (model) =>
              model.topUser ? (
                <button
                  type="button"
                  className="whitespace-nowrap text-start hover:text-accent hover:underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (model.topUser) selectUser(model.topUser.id);
                  }}
                >
                  {model.topUser.name} <span className="num text-fg-muted">{fmtPct(model.topUser.share, 0)}</span>
                </button>
              ) : (
                '–'
              ),
            hint: t('The person with the most usage on this model, and their share of it.'),
            calc: 'model-top-user',
          },
        ]
      : [];
    return [...lead, ...tokens, ...tail, ...topUser];
  }, [hasTokens, hasTopUser, selectUser]);

  return (
    <Card
      title={t('All models')}
      subtitle={t('Click a row to filter the whole page by that model. Use Columns to show or hide details.')}
      calc="model-table"
      footer={
        <div className="space-y-1">
          {hasTokens ? null : (
            <p>
              {t(
                'This report has no token columns. The token counts and the cache hit rate are not shown, and the cheaper option shows dashes. They need input and output tokens for each request.',
              )}
            </p>
          )}
          <PriceSource />
        </div>
      }
    >
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(model) => model.id}
        defaultSort={{ key: 'gross', dir: 'desc' }}
        searchable
        searchPlaceholder={t('Search models…')}
        exportName="github-copilot-models"
        onRowClick={(model) => drill({ models: [model.value] }, { merge: true })}
        emptyText={t('No models match your search.')}
      />
    </Card>
  );
}
