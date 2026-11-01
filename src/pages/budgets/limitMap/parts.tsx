import type { ReactNode } from 'react';
import { BriefcaseBusiness, Building2, CircleDashed, CircleQuestionMark, Globe, UserRound, type LucideIcon } from 'lucide-react';
import { cx, type Tone } from '../../../components/ui';
import { msg, t, tp } from '../../../i18n';
import { budgetLevel, roomOf, shareOnDay, type BudgetLevel, type BudgetRow, type LimitBoard, type LimitLane, type LimitTop, type UserLimitKind } from '../../../lib/collection';
import { fmtInt, fmtPct, fmtUSD } from '../../../lib/utils/format';
import { levelTone } from '../levels';

export const LEVELS: BudgetLevel[] = ['low', 'half', 'near', 'used-up'];
export type UserKind = UserLimitKind | 'none';
export const USER_KINDS: UserKind[] = ['own', 'cost-center', 'everyone', 'none'];
/** Selecting a usage level or a limit type fades the other users. */
export type Highlight = { by: 'level'; value: BudgetLevel } | { by: 'kind'; value: UserKind };

export const TILE_FILL: Record<Tone, string> = {
  neutral: 'bg-fg-subtle/55', good: 'bg-good/65', warn: 'bg-warn/75', bad: 'bg-bad', info: 'bg-info/65', accent: 'bg-accent/65',
};
/** The frame turns orange near its limit and red when used up. */
export const FRAME_BORDER: Record<BudgetLevel, string> = { low: 'border-fg-muted', half: 'border-fg-muted', near: 'border-warn', 'used-up': 'border-bad' };

const KIND_LABELS: Record<UserKind, string> = {
  own: msg('Individual limit'), 'cost-center': msg('Cost center default'), everyone: msg('Universal default'), none: msg('No user limit found'),
};
export const kindLabel = (kind: UserKind): string => t(KIND_LABELS[kind]);

export const KIND_ABOUT: Record<UserKind, string> = {
  own: msg('An individual limit replaces cost center and universal user limits. Shared spending controls still apply.'),
  'cost-center': msg('Each person has this amount, not a share of one group budget. Individual limits take priority.'),
  everyone: msg('The universal default applies when no individual or cost center user limit takes priority.'),
  none: msg('No user limit was found in the file. This does not prove that usage is unlimited.'),
};

/** One icon per place a limit is set, so a limit type looks the same in the legend, the map and the details. */
export const KIND_ICONS: Record<UserKind, LucideIcon> = { own: UserRound, 'cost-center': BriefcaseBusiness, everyone: Globe, none: CircleDashed };
export const topIcon = (top: LimitTop): LucideIcon => (top.scope === 'enterprise' ? Globe : Building2);

export function laneIcon(lane: LimitLane, top: LimitTop): LucideIcon {
  if (lane.kind === 'cost_center') return BriefcaseBusiness;
  if (lane.kind === 'organization') return Building2;
  if (lane.kind === 'top') return topIcon(top);
  return CircleQuestionMark;
}

/** Text with the icon of its limit type in front. The icon follows the text size and sits on the first line. The text names the type, so the icon is hidden. */
export function WithIcon({ Icon, children, className }: { Icon: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex min-w-0 items-start gap-1', className)}>
      <span className="flex h-[1lh] shrink-0 items-center">
        <Icon className="size-[1.15em]" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0">{children}</span>
    </span>
  );
}

export const topLabel = (top: LimitTop): string => (top.scope === 'enterprise' ? t('Enterprise limit') : t('Organization limit'));

export function laneEyebrow(lane: LimitLane): string {
  if (lane.kind === 'cost_center') return t('Cost center');
  if (lane.kind === 'organization') return t('Organization');
  if (lane.kind === 'top') return t('Other users');
  return t('Check in GitHub');
}

export function laneTitle(lane: LimitLane, top: LimitTop): string {
  if (lane.kind === 'cost_center' || lane.kind === 'organization') return lane.name;
  if (lane.kind === 'top') return top.scope === 'enterprise' ? t('Only the enterprise limit') : t('Only the organization limit');
  return t('Spending limit not clear');
}

export function laneAbout(lane: LimitLane, top: LimitTop): string {
  if (lane.kind === 'cost_center') {
    return lane.countedByTop
      ? t('Billed usage of its members checks this limit and, by default, the enterprise limit. Members are assigned directly, through a team or through an organization.')
      : t('GitHub bills the usage of its members to this cost center of the enterprise, so the organization limit does not count it.');
  }
  if (lane.kind === 'organization') return t('Billed usage of users not in a cost center, whose seat this organization pays for. It can only set a lower limit than the enterprise.');
  if (lane.kind === 'top') {
    return top.scope === 'enterprise'
      ? t('These users are not in a cost center, and their seat organization has no spending limit. Only the enterprise limit holds their billed usage.')
      : t('Only the organization limit holds their billed usage.');
  }
  return t('These users have seats in several organizations, or no seat in the file. GitHub picks one organization each billing cycle, so the file cannot say which limit it checks.');
}

/** Amounts under 100 USD keep cents. */
export const money = (amount: number): string => fmtUSD(amount, Math.abs(amount) >= 100 ? 0 : 2);
export const roomText = (room: number | null): string => (room === null ? t('Not known') : room <= 0 ? t('None left') : money(room));
export const usersText = (count: number): string => tp(count, '1 user', '{n} users', { n: fmtInt(count) });
export const levelOfShare = (share: number): BudgetLevel | null => (Number.isFinite(share) ? budgetLevel(share) : null);
export const limitName = (row: BudgetRow): string => (row.budget.aiCredits ? t('AI credits') : t('All of GitHub Copilot'));

export function sharesOn(board: LimitBoard, day: number | null): Float32Array {
  const shares = new Float32Array(board.users.length);
  board.users.forEach((user, userIndex) => {
    // Zero is an immediate stop, drawn full but never labeled as a percentage.
    shares[userIndex] = user.limit === 0 ? 1 : (day === null ? user.share : shareOnDay(board, userIndex, day)) ?? Number.NaN;
  });
  return shares;
}

/** A bar of the share used. `wall` marks where a broader limit is reached first. Decorative: the text beside it says the same. */
export function Gauge({ share, level, wall, height = 'h-1.5' }: { share: number | null; level: BudgetLevel | null; wall?: number | null; height?: string }) {
  const tone = level !== null ? levelTone(level) : 'neutral';
  return (
    <span className={cx('relative block w-full overflow-hidden rounded-xs bg-surface-3', height)} aria-hidden>
      <span className={cx('absolute inset-y-0 start-0', TILE_FILL[tone])} style={{ width: `${Math.min(1, Math.max(0, share ?? 0)) * 100}%` }} />
      {wall !== undefined && wall !== null && wall < 1 ? <span className="absolute inset-y-0 w-0.5 bg-fg" style={{ insetInlineStart: `${Math.max(0, wall) * 100}%` }} /> : null}
    </span>
  );
}

/** One spending limit: what it counts, the amount, how full it is and the room left. */
export function SpendingLimit({ row }: { row: BudgetRow }) {
  const room = roomOf(row);
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
        <span className="text-fg-muted">{limitName(row)}</span>
        <span className="num font-medium">{fmtUSD(row.budget.amount, 0)}</span>
      </div>
      <Gauge share={row.share} level={row.level} />
      <div className="flex flex-wrap items-baseline justify-between gap-1 text-[11px] text-fg-subtle">
        <span className="num">{row.share === null ? t('Amount used not known') : `${t('{share} used', { share: fmtPct(row.share, 0) })} · ${t('{amount} left', { amount: roomText(room) })}`}</span>
        <span>{row.budget.stopsUsage ? t('Stops usage') : t('Alerts only')}</span>
      </div>
    </div>
  );
}

export function Fact({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
      <span className="text-fg-muted">{label}</span>
      <span className="num min-w-0 break-words text-end font-medium">{children}</span>
    </div>
  );
}

export function Heading({ eyebrow, title, Icon }: { eyebrow: string; title: string; Icon?: LucideIcon }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow text-fg-subtle">{Icon ? <WithIcon Icon={Icon}>{eyebrow}</WithIcon> : eyebrow}</p>
      <p className="break-words font-display text-base font-semibold">{title}</p>
    </div>
  );
}
