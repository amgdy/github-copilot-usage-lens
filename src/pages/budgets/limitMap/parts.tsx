import type { ReactNode } from 'react';
import { ProgressBar, cx, type Tone } from '../../../components/ui';
import { msg, t, tp } from '../../../i18n';
import { HALF_SHARE, NEAR_SHARE, budgetLevel, shareOnDay, type BudgetLevel, type BudgetRow, type LimitBoard, type LimitGroup, type PlaceScope } from '../../../lib/collection';
import { fmtInt, fmtPct, fmtUSD } from '../../../lib/utils/format';
import { levelTone, limitKindLabel } from '../levels';

export const LEVELS: BudgetLevel[] = ['low', 'half', 'near', 'used-up'];

/** A level of the share used, or users with no limit. */
export type Highlight = BudgetLevel | 'none';

/** The water in a glass: a light fill with a line on top, in the color of the level. */
export const WATER: Record<Tone, string> = {
  neutral: 'border-fg-subtle bg-fg-subtle/15',
  good: 'border-good bg-good/15',
  warn: 'border-warn bg-warn/15',
  bad: 'border-bad bg-bad/20',
  info: 'border-info bg-info/15',
  accent: 'border-accent bg-accent/15',
};

/** The fill of a small user glass: stronger than the water of a big glass, so it reads at a small size. */
export const TILE_FILL: Record<Tone, string> = {
  neutral: 'bg-fg-subtle/55',
  good: 'bg-good/65',
  warn: 'bg-warn/75',
  bad: 'bg-bad',
  info: 'bg-info/65',
  accent: 'bg-accent/65',
};

/** The lines of the drawing: darker than the lines of a panel, like ink on paper. */
export const INK = 'border-fg-subtle/70';

/** The order in which GitHub checks the limits for a request that uses AI credits. */
export const CHECK_ORDER = [
  msg('The limit of the user: their own budget, else their cost center limit, else the limit for each user.'),
  msg('Included credits pay for the usage while they last.'),
  msg('The spending limit of the cost center or organization, for the amount billed.'),
  msg('The spending limit of the enterprise, for the amount billed.'),
];

export const SCOPE_NAMES: Record<PlaceScope, string> = {
  enterprise: msg('Enterprise account'),
  organization: msg('Organization'),
  cost_center: msg('Cost center'),
  repository: msg('Repository'),
};

export const GROUP_ABOUT: Record<LimitGroup['kind'], string> = {
  own: msg('Users with a budget of their own. Their own budget is the only limit that holds them.'),
  'cost-center': msg('Users of this cost center. Its limit for each user holds them, unless they have a budget of their own.'),
  everyone: msg('Users without a budget of their own and outside the cost centers with a limit. The limit for each user holds them.'),
  none: msg('Users without a budget of their own and outside the cost centers with a limit. No limit holds them.'),
};

/** The kind of limit that holds a group, or "No limit". */
export const groupKindLabel = (kind: LimitGroup['kind']): string => (kind === 'none' ? t('No limit') : limitKindLabel(kind));

/** The name of a group: its cost center, or who is in it. */
export function groupTitle(group: LimitGroup): string {
  if (group.kind === 'cost-center') return group.name;
  if (group.kind === 'own') return t('Users with a budget of their own');
  if (group.kind === 'everyone') return t('All other users');
  return t('Users with no limit');
}

export const usersText = (count: number): string => tp(count, '1 user', '{n} users', { n: fmtInt(count) });

/** The level of a share, or null for users with no limit. */
export const levelOfShare = (share: number): BudgetLevel | null => (Number.isFinite(share) ? budgetLevel(share) : null);

/** The share of the limit each user had used: now (null) or by the end of a day of the month. NaN for users with no limit. */
export function sharesOn(board: LimitBoard, day: number | null): Float32Array {
  const shares = new Float32Array(board.users.length);
  board.users.forEach((user, userIndex) => {
    shares[userIndex] = (day === null ? user.share : shareOnDay(board, userIndex, day)) ?? Number.NaN;
  });
  return shares;
}

/** A glass filled from the bottom to the share used, with small marks at 50% and 80%. The caller places it (relative or absolute). */
export function Glass({ share, level, marks = false, className }: { share: number | null; level: BudgetLevel | null; marks?: boolean; className?: string }) {
  const fill = share === null ? 0 : Math.min(1, Math.max(0, share));
  return (
    <span className={cx('block overflow-hidden bg-surface', className)} aria-hidden>
      {fill > 0 ? (
        <span
          className={cx('absolute inset-x-0 bottom-0 border-t-2 transition-[height] duration-300 motion-reduce:transition-none', WATER[level !== null ? levelTone(level) : 'neutral'])}
          style={{ height: `${fill * 100}%` }}
        />
      ) : null}
      {marks
        ? [HALF_SHARE, NEAR_SHARE].map((mark) => <span key={mark} className="absolute start-0 h-px w-1.5 bg-fg-subtle/60" style={{ bottom: `${mark * 100}%` }} />)
        : null}
    </span>
  );
}

/** Above this share the reading sits just under the water line, inside the water; at or below it, just above the line. */
const READING_INSIDE = 0.6;

/** The share used, written at the water line of a pane so the line never crosses it. */
export function Reading({ share, size = 'sm' }: { share: number; size?: 'sm' | 'base' }) {
  const fill = Math.min(1, Math.max(0, share));
  const style = fill > READING_INSIDE ? { top: `calc(${(1 - fill) * 100}% + 3px)` } : { bottom: `calc(${fill * 100}% + 3px)` };
  return (
    <span className={cx('num absolute inset-x-0 text-center font-display font-semibold', size === 'base' ? 'text-base leading-6' : 'text-xs leading-4')} style={style}>
      {fmtPct(share, 0)}
    </span>
  );
}

/** The panes of a place: one glass for each spending limit, each filled to the share used. */
export function Panes({ rows, className, size = 'sm' }: { rows: BudgetRow[]; className?: string; size?: 'sm' | 'base' }) {
  return (
    <span className={cx('flex gap-[3px] border bg-surface p-[3px]', INK, className)}>
      {rows.map((row) => (
        <span key={row.budget.id} className={cx('relative min-w-0 flex-1 border', row.share === null ? 'border-dashed border-border' : 'border-border')}>
          <Glass share={row.share} level={row.level} marks className="absolute inset-0" />
          {row.share !== null ? <Reading share={row.share} size={size} /> : null}
        </span>
      ))}
    </span>
  );
}

export function SpendingLimit({ row }: { row: BudgetRow }) {
  const tone = row.level !== null ? levelTone(row.level) : 'neutral';
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="min-w-0 truncate text-fg-muted">{row.budget.aiCredits ? t('Spending limit') : t('Spending limit, all of GitHub Copilot')}</span>
        <span className="num font-medium">{fmtUSD(row.budget.amount, 0)}</span>
      </div>
      <ProgressBar value={row.share ?? 0} tone={tone} height={6} label={t('Share of the budget used')} />
      <div className="flex items-baseline justify-between gap-2 text-[11px] text-fg-subtle">
        <span className="num">{row.share === null ? t('Amount used not known') : t('{share} used', { share: fmtPct(row.share, 0) })}</span>
        <span>{row.budget.stopsUsage ? t('Stops usage') : t('Alerts only')}</span>
      </div>
    </div>
  );
}

export function Fact({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="shrink-0 text-fg-muted">{label}</span>
      <span className="num min-w-0 truncate text-end font-medium">{children}</span>
    </div>
  );
}

export function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow text-fg-subtle">{eyebrow}</p>
      <p className="truncate font-display text-base font-semibold" title={title}>
        {title}
      </p>
    </div>
  );
}

/** A step of the order GitHub checks, as a small square number. */
export function Step({ step, active = false }: { step: number; active?: boolean }) {
  return (
    <span
      className={cx(
        'num inline-flex size-5 shrink-0 items-center justify-center rounded-[3px] border text-[11px] font-semibold',
        active ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface-2 text-fg',
      )}
      aria-hidden
    >
      {fmtInt(step)}
    </span>
  );
}
