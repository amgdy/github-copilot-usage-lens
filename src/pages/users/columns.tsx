import { VendorIcon } from '../../components/icons';
import { ProgressBar, TaxBadge, cx, taxLookup, type Column } from '../../components/ui';
import { hasQuota, shortItem, signedUsd, withOthers } from '../../components/user/shared';
import { msg, t } from '../../i18n';
import type { UserProfile } from '../../lib/analytics/users';
import { inferVendor } from '../../lib/pricing/models';
import { fmtInt, fmtPct, fmtPctAuto } from '../../lib/utils/format';
import { autoColumns } from './autoColumns';
import { NO_BILLING, NO_MODELS, NO_TOKENS, dash, sum, usd, withReason, type ColumnContext } from './columnKit';
import { licenseColumns } from './licenseColumns';
import { tokenColumns } from './tokenColumns';

export type { ColumnContext } from './columnKit';

const MAX_TRAIT_BADGES = 3;

export type UsersView = 'general' | 'tokens' | 'auto' | 'license';

/** The views of the users table. `license` exists only while a license list is loaded. */
export const USERS_VIEWS: { value: UsersView; label: string; title: string }[] = [
  { value: 'general', label: msg('General'), title: msg('Usage, billing, activity and classes') },
  { value: 'tokens', label: msg('Tokens'), title: msg('Input, cache read, cache write and output tokens per user') },
  { value: 'auto', label: msg('Auto'), title: msg('Auto against hand-picked models per user') },
  { value: 'license', label: msg('License'), title: msg('The seat of each user in the license list') },
];

/** Columns a view shows first, in this order. Every other column of the table stays in the Columns menu. */
const VIEW_FIRST: Record<Exclude<UsersView, 'general'>, string[]> = {
  tokens: ['user', 'gross', 'tokenInput', 'tokenCacheRead', 'tokenCacheWrite', 'tokenOutput', 'tokenTotal', 'cacheHit', 'costInput', 'costCacheRead', 'costCacheWrite', 'costOutput', 'tokenCoverage'],
  auto: ['user', 'plan', 'gross', 'autoShare', 'autoDiscount', 'autoOriginal', 'handPicked', 'autoMissed', 'autoUse'],
  license: ['user', 'gross', 'seatStatus', 'seatPlan', 'lastActivity', 'daysSinceActivity', 'lastSurface', 'daysSinceLast'],
};

export const VIEW_SORT: Record<UsersView, { key: string; dir: 'asc' | 'desc' }> = {
  general: { key: 'gross', dir: 'desc' },
  tokens: { key: 'tokenTotal', dir: 'desc' },
  auto: { key: 'autoMissed', dir: 'desc' },
  license: { key: 'gross', dir: 'desc' },
};

export interface UserColumns {
  /** Every column of every view, each once. This is what the full CSV download uses. */
  all: Column<UserProfile>[];
  byView: Record<UsersView, Column<UserProfile>[]>;
  /** The License view and its columns exist (a license list is loaded). */
  hasLicense: boolean;
}

export function buildColumns(context: ColumnContext): UserColumns {
  const hasLicense = context.hasLicense === true;
  const general = generalColumns(context);
  const tokens = tokenColumns(context);
  const auto = autoColumns(context);
  const license = hasLicense ? licenseColumns() : [];
  const all = [...general, ...tokens, ...auto, ...license];
  const byKey = new Map(all.map((column) => [column.key, column]));
  const extra: Record<Exclude<UsersView, 'general'>, Column<UserProfile>[]> = { tokens, auto, license };
  const forView = (view: Exclude<UsersView, 'general'>): Column<UserProfile>[] => {
    const first = VIEW_FIRST[view];
    const head = first.flatMap((columnKey) => {
      const column = byKey.get(columnKey);
      return column ? [{ ...column, hidden: false }] : [];
    });
    const pool = [...general, ...extra[view]];
    const rest = pool.filter((column) => !first.includes(column.key)).map((column) => ({ ...column, hidden: true }));
    return [...head, ...rest];
  };
  return {
    all,
    byView: { general, tokens: forView('tokens'), auto: forView('auto'), license: hasLicense ? forView('license') : general },
    hasLicense,
  };
}

function generalColumns({ taxonomy, trendReliable, coverage }: ColumnContext): Column<UserProfile>[] {
  const personas = taxLookup(taxonomy.personas);
  const tiers = taxLookup(taxonomy.tiers);
  const engagement = taxLookup(taxonomy.engagement);
  const profiles = taxLookup(taxonomy.profiles);
  const pareto = taxLookup(taxonomy.pareto);
  const traits = taxLookup(taxonomy.traits);
  const change = (user: UserProfile): number => (trendReliable ? user.recent - user.prior : Number.NaN);
  const billingKnown = coverage.billing;
  const noBilling = withReason(NO_BILLING);
  const noModels = withReason(NO_MODELS);
  const noTokens = withReason(NO_TOKENS);
  const noBillingText = t(NO_BILLING);
  const noModelsText = t(NO_MODELS);
  const noTokensText = t(NO_TOKENS);

  return [
    {
      key: 'rank',
      header: t('Rank'),
      hint: t('Position by usage among all users in the date range'),
      calc: 'user-share',
      value: (user) => user.rank,
      render: (user) => fmtInt(user.rank),
      align: 'end',
    },
    {
      key: 'user',
      header: t('User'),
      value: (user) => user.name,
      render: (user) => (
        <span className="block max-w-[14rem] truncate font-medium" title={user.name}>
          {user.name}
        </span>
      ),
    },
    {
      key: 'persona',
      header: t('Persona'),
      hint: t('The kind of user, from how often and how much they use GitHub Copilot'),
      calc: 'persona-groups',
      value: (user) => personas[user.persona].label,
      render: (user) => <TaxBadge item={personas[user.persona]} />,
    },
    {
      key: 'tier',
      header: t('Usage tier'),
      hint: t('Usage compared with the included credits of the seat'),
      calc: 'spend-tiers',
      value: (user) => tiers[user.tier].label,
      render: (user) => <TaxBadge item={shortItem(tiers[user.tier])} />,
    },
    {
      key: 'engagement',
      header: t('Engagement'),
      hint: t('How often the user is active: the share of workdays with use'),
      calc: 'engagement-levels',
      value: (user) => engagement[user.engagement].label,
      render: (user) => <TaxBadge item={engagement[user.engagement]} />,
      hidden: true,
    },
    {
      key: 'profile',
      header: t('Usage profile'),
      hint: coverage.models ? t('Which kind of model the user mostly uses: Efficient, Balanced or Frontier-heavy') : noModelsText,
      calc: 'usage-profiles',
      value: (user) => (coverage.models ? profiles[user.profile].label : ''),
      render: (user) => (coverage.models ? <TaxBadge item={profiles[user.profile]} /> : noModels),
      hidden: true,
    },
    {
      key: 'pareto',
      header: t('Pareto class'),
      hint: t(
        'A: the users who make the first part of all usage. B: the next part. C: the long tail. Based on all users in the date range, not on the persona, tier or Auto use filters.',
      ),
      calc: 'pareto-classes',
      value: (user) => pareto[user.pareto].label,
      render: (user) => <TaxBadge item={pareto[user.pareto]} />,
      hidden: true,
    },
    {
      key: 'plan',
      header: t('Plan'),
      hint: t('The seat of the user, from the included credits in the file'),
      calc: 'user-credits-used',
      value: (user) => (hasQuota(user) ? user.plan : ''),
      render: (user) => (hasQuota(user) ? user.plan : dash),
      hidden: true,
    },
    {
      key: 'org',
      header: t('Organization'),
      value: (user) => withOthers(user.org, user.orgMixed),
      render: (user) => (user.org ? withOthers(user.org, user.orgMixed) : dash),
      hidden: true,
    },
    {
      key: 'costCenter',
      header: t('Cost center'),
      value: (user) => withOthers(user.costCenter, user.costCenterMixed),
      render: (user) => (user.costCenter ? withOthers(user.costCenter, user.costCenterMixed) : dash),
      hidden: true,
    },
    {
      key: 'gross',
      strong: true,
      header: t('Usage'),
      hint: t('Usage in the date range, before included credits'),
      calc: 'usage',
      value: (user) => user.gross,
      render: (user) => usd(user.gross),
      align: 'end',
      total: (rows) => usd(sum(rows, (user) => user.gross)),
    },
    {
      key: 'share',
      header: t('Share of usage'),
      hint: t('Share of the usage of all users in the date range'),
      calc: 'user-share',
      value: (user) => user.share,
      render: (user) => fmtPct(user.share, 1),
      align: 'end',
      total: (rows) => fmtPct(sum(rows, (user) => user.share), 1),
    },
    {
      key: 'net',
      header: t('Billed'),
      hint: billingKnown
        ? t('Billed on top of seats, as the file states it. The included credits are pooled, so a user can be billed while below their own credits.')
        : noBillingText,
      calc: 'billed',
      value: (user) => (billingKnown ? user.net : Number.NaN),
      render: (user) => (billingKnown ? usd(user.net) : noBilling),
      align: 'end',
      total: (rows) => (billingKnown ? usd(sum(rows, (user) => user.net)) : '–'),
    },
    {
      key: 'discount',
      header: t('Covered'),
      hint: billingKnown ? t('Usage covered by included credits') : noBillingText,
      calc: 'covered',
      value: (user) => (billingKnown ? user.discount : Number.NaN),
      render: (user) => (billingKnown ? usd(user.discount) : noBilling),
      align: 'end',
      total: (rows) => (billingKnown ? usd(sum(rows, (user) => user.discount)) : '–'),
      hidden: true,
    },
    {
      key: 'utilization',
      header: t('Included credits used'),
      hint: t('Usage as a share of the included credits of the seat. Above 100% means the user drew from the shared pool.'),
      calc: 'user-credits-used',
      value: (user) => (hasQuota(user) ? user.utilization : Number.NaN),
      render: (user) =>
        hasQuota(user) ? (
          <div className="flex items-center justify-end gap-2">
            <ProgressBar value={user.utilization} height={6} className="hidden w-14 sm:block" label={t('Included credits used')} />
            <span className="w-14 text-end">{fmtPctAuto(user.utilization)}</span>
          </div>
        ) : (
          dash
        ),
      align: 'end',
    },
    {
      key: 'balance',
      header: t('Balance'),
      hint: t('Included credits minus usage. Negative means the user drew from the shared pool.'),
      calc: 'user-credits-used',
      value: (user) => (hasQuota(user) ? user.balance : Number.NaN),
      render: (user) => (hasQuota(user) ? <span className={cx(user.balance < 0 && 'text-bad')}>{usd(user.balance)}</span> : dash),
      align: 'end',
      hidden: true,
    },
    {
      key: 'activeDays',
      header: t('Active days'),
      hint: t('Days with real use in the date range'),
      calc: 'user-active-days',
      value: (user) => user.activeDays,
      render: (user) => fmtInt(user.activeDays),
      align: 'end',
    },
    {
      key: 'activeRate',
      header: t('Active rate'),
      hint: t('Share of workdays with use since the user started'),
      calc: 'user-active-rate',
      value: (user) => user.activeRate,
      render: (user) => fmtPct(user.activeRate, 0),
      align: 'end',
      hidden: true,
    },
    {
      key: 'daysSinceLast',
      header: t('Days since last use'),
      hint: t('Days between the last day with use and the end of the date range'),
      calc: 'user-days-since-last',
      value: (user) => user.daysSinceLast,
      render: (user) => fmtInt(user.daysSinceLast),
      align: 'end',
      hidden: true,
    },
    {
      key: 'costPerActiveDay',
      header: t('Cost per active day'),
      hint: t('Usage divided by active days'),
      calc: 'user-cost-per-active-day',
      value: (user) => user.costPerActiveDay,
      render: (user) => (Number.isFinite(user.costPerActiveDay) ? usd(user.costPerActiveDay) : dash),
      align: 'end',
      hidden: true,
    },
    {
      key: 'autoShare',
      header: t('Auto share of usage'),
      hint: coverage.models ? t('Share of usage on Auto model selection') : noModelsText,
      calc: 'auto-share',
      value: (user) => (coverage.models ? user.autoShare : Number.NaN),
      render: (user) => (coverage.models ? fmtPct(user.autoShare, 0) : noModels),
      align: 'end',
      hidden: true,
    },
    {
      key: 'cacheHit',
      header: t('Cache hit rate'),
      hint: coverage.tokens ? t('Share of prompt tokens read from the cache, where text the model has seen before costs less') : noTokensText,
      calc: 'cache-hit',
      value: (user) => (coverage.tokens ? user.cacheHit : Number.NaN),
      render: (user) => (!coverage.tokens ? noTokens : Number.isFinite(user.cacheHit) ? fmtPct(user.cacheHit, 0) : dash),
      align: 'end',
      hidden: true,
    },
    {
      key: 'topModel',
      header: t('Top model'),
      hint: coverage.models ? t('The model with the most usage for this user') : noModelsText,
      calc: 'user-model-mix',
      value: (user) => user.topModel,
      render: (user) =>
        user.topModel ? (
          <span className="flex max-w-[14rem] items-center gap-1.5" title={t('{model}: {share} of usage', { model: user.topModel, share: fmtPct(user.topModelShare, 0) })}>
            <VendorIcon vendor={inferVendor(user.topModel)} size={12} className="shrink-0 text-fg-muted" />
            <span className="truncate">{user.topModel}</span>
          </span>
        ) : coverage.models ? (
          dash
        ) : (
          noModels
        ),
      hidden: true,
    },
    {
      key: 'change',
      header: t('7-day change'),
      hint: t('Usage in the last 7 days minus the 7 days before. Needs a range of at least 14 days.'),
      calc: ['user-change', 'week-over-week'],
      value: change,
      render: (user) => {
        const changeAmount = change(user);
        if (!Number.isFinite(changeAmount)) return dash;
        const values = { recent: usd(user.recent), prior: usd(user.prior) };
        const title = Number.isFinite(user.trend)
          ? t('{recent} in the last 7 days, {prior} in the 7 days before ({change})', { ...values, change: `${user.trend >= 0 ? '+' : '−'}${fmtPct(Math.abs(user.trend), 0)}` })
          : t('{recent} in the last 7 days, {prior} in the 7 days before', values);
        return (
          <span className={cx(Math.abs(changeAmount) < 0.005 && 'text-fg-muted')} title={title}>
            {signedUsd(changeAmount)}
          </span>
        );
      },
      align: 'end',
    },
    {
      key: 'potential',
      header: t('Potential savings'),
      hint: t('Usage that could be avoided with the levers in this report. An estimate.'),
      calc: 'user-potential',
      value: (user) => user.potential,
      render: (user) => usd(user.potential),
      align: 'end',
      total: (rows) => usd(sum(rows, (user) => user.potential)),
    },
    {
      key: 'traits',
      header: t('Traits'),
      hint: t('Habits worth a look. Hover a badge to see what it means.'),
      calc: 'user-traits',
      value: (user) => user.traits.map((id) => traits[id].label).join(', '),
      render: (user) =>
        user.traits.length === 0 ? (
          dash
        ) : (
          <div className="flex items-center gap-1">
            {user.traits.slice(0, MAX_TRAIT_BADGES).map((id) => (
              <TaxBadge key={id} item={traits[id]} />
            ))}
            {user.traits.length > MAX_TRAIT_BADGES ? (
              <span className="text-xs text-fg-muted" title={user.traits.slice(MAX_TRAIT_BADGES).map((id) => traits[id].label).join(', ')}>
                +{user.traits.length - MAX_TRAIT_BADGES}
              </span>
            ) : null}
          </div>
        ),
      sortable: false,
    },
  ];
}

/** Every column of the table, for the full CSV download. */
export function userTableCsv(columns: Column<UserProfile>[], rows: UserProfile[]): { headers: string[]; rows: unknown[][] } {
  const cols = columns.filter((column) => !column.noCsv);
  return {
    headers: cols.map((column) => column.csvHeader ?? (typeof column.header === 'string' ? column.header : column.key)),
    rows: rows.map((user) => cols.map((column) => column.value(user) ?? '')),
  };
}
