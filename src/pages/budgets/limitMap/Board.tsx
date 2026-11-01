import { memo, type KeyboardEvent } from 'react';
import { cx } from '../../../components/ui';
import { t } from '../../../i18n';
import { usedOnDay, type LimitBoard, type LimitFocus, type LimitLane, type LimitTarget, type LimitTop } from '../../../lib/collection';
import { fmtInt, fmtPct } from '../../../lib/utils/format';
import { levelTone } from '../levels';
import { FRAME_BORDER, Gauge, KIND_ICONS, TILE_FILL, WithIcon, kindLabel, laneEyebrow, laneIcon, laneTitle, levelOfShare, limitName, money, roomText, topIcon, topLabel, usersText, type Highlight } from './parts';

/** Squares drawn per lane before "Show all". */
export const SQUARES_SHOWN = 120;
const SELECTED_ROW = 'bg-accent-soft';
const SELECTED_SQUARE = 'ring-2 ring-accent ring-offset-1 ring-offset-surface';
const SQUARE_BORDER = { own: 'border-2 border-fg', 'cost-center': 'border border-fg-subtle/70', everyone: 'border border-fg-subtle/70', none: 'border border-dashed border-fg-subtle' } as const;

export function userTip(board: LimitBoard, userIndex: number, day: number | null): string {
  const user = board.users[userIndex];
  const used = money(usedOnDay(board, userIndex, day));
  const amount = user.limit === null ? used : t('{used} of {limit}', { used, limit: money(user.limit) });
  return `${user.login}\n${amount}\n${kindLabel(user.kind)}`;
}

/** Arrow keys move through the squares as a grid; up and down jump a row. Right to left mirrors the sides. */
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  const squares = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-square]')];
  const current = squares.findIndex((square) => square === document.activeElement);
  if (current < 0) return;
  event.preventDefault();
  const rightToLeft = getComputedStyle(event.currentTarget).direction === 'rtl';
  const firstRow = squares[0].offsetTop;
  const columns = Math.max(1, squares.findIndex((square) => square.offsetTop !== firstRow) === -1 ? squares.length : squares.findIndex((square) => square.offsetTop !== firstRow));
  let next = current;
  if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = squares.length - 1;
  else if (event.key === 'ArrowDown') next += columns;
  else if (event.key === 'ArrowUp') next -= columns;
  else if (event.key === 'ArrowRight') next += rightToLeft ? -1 : 1;
  else next += rightToLeft ? 1 : -1;
  squares[Math.max(0, Math.min(squares.length - 1, next))]?.focus();
}

/** "$12.40 of $40.00 · 31% · Stops usage" for the limit a lane or the frame reaches first. */
function LimitLine({ lane }: { lane: Pick<LimitLane, 'gauge'> }) {
  const row = lane.gauge;
  if (row === null) return null;
  return (
    <span className="num flex flex-wrap items-baseline justify-between gap-x-2 text-[11px] text-fg-muted">
      <span>{row.budget.consumed === null ? `${money(row.budget.amount)} · ${t('Amount used not known')}` : t('{used} of {limit}', { used: money(row.budget.consumed), limit: money(row.budget.amount) })}</span>
      <span>
        {row.share !== null ? `${fmtPct(row.share, 0)} · ` : ''}
        {row.budget.stopsUsage ? t('Stops usage') : t('Alerts only')}
      </span>
    </span>
  );
}

function TopHeader({ board, selected, choose }: { board: LimitBoard; selected: boolean; choose: (target: LimitTarget) => void }) {
  const { top } = board;
  const others = top.limits.filter((row) => row !== top.wall);
  return (
    <button
      type="button"
      data-anchor="top"
      aria-pressed={selected}
      className={cx('grid w-full gap-x-6 gap-y-2 px-3 pb-3 pt-4 text-start hover:bg-surface-2 sm:grid-cols-[minmax(0,1fr)_auto]', selected && SELECTED_ROW)}
      onClick={() => choose({ kind: 'top' })}
    >
      <span className="block min-w-0 space-y-1.5">
        <span className="block break-words font-display text-lg font-semibold leading-tight">{top.name}</span>
        {top.wall !== null ? (
          <>
            <span className="block text-[11px] text-fg-subtle">{limitName(top.wall)}</span>
            <Gauge share={top.wall.share} level={top.wall.level} height="h-2" />
            <LimitLine lane={{ gauge: top.wall }} />
          </>
        ) : (
          <span className="block text-xs text-fg-muted">{top.limits.length > 0 ? t('Only alert budgets are set here. They do not stop usage.') : top.known ? t('No spending limit is set here.') : t('The file has no full budget list, so this limit is not known.')}</span>
        )}
        {others.length > 0 ? (
          <span className="num block text-[11px] text-fg-subtle">
            {t('Also')}: {others.map((row) => `${limitName(row)} ${money(row.budget.amount)}${row.share !== null ? `, ${fmtPct(row.share, 0)}` : ''}`).join(' · ')}
          </span>
        ) : null}
      </span>
      <span className="block sm:text-end">
        <span className="eyebrow block text-fg-subtle">{t('Room left')}</span>
        <span className="num block font-display text-2xl font-semibold leading-tight">{top.wall === null ? (top.limits.length > 0 ? t('Alerts only') : top.known ? t('No limit') : t('Not known')) : roomText(top.room)}</span>
        {board.everyone !== null ? (
          <span className="num block text-[11px] text-fg-muted">
            <WithIcon Icon={KIND_ICONS.everyone}>{t('Each person: {amount}', { amount: money(board.everyone.amount) })} · {kindLabel('everyone')}</WithIcon>
          </span>
        ) : null}
      </span>
    </button>
  );
}

/** The limits inside laid end to end against the outer limit. Past the wall, they cannot all be used in full. */
function InsideStrip({ top, lanes }: { top: LimitTop; lanes: LimitLane[] }) {
  const parts = lanes.filter((lane) => lane.countedByTop && lane.capacity !== null && lane.capacity > 0 && lane.limits.length > 0);
  if (parts.length === 0) return null;
  const scale = Math.max(top.inside, top.capacity ?? 0);
  const wall = top.capacity !== null && scale > 0 ? top.capacity / scale : null;
  const over = top.insideShare !== null && top.insideShare > 1;
  return (
    <div className="space-y-1.5 border-t border-border-muted px-3 py-2.5">
      <div className="relative py-1">
        <div className="flex h-3 gap-px overflow-hidden rounded-xs bg-surface-3" aria-hidden>
          {parts.map((lane) => {
            // The smallest stopping limit sets the width, so the fill, color and share come from it too.
            const row = lane.limits.find((limit) => limit.budget.stopsUsage && limit.budget.amount === lane.capacity);
            if (row === undefined) return null;
            const capacity = lane.capacity ?? 0;
            const used = row.budget.consumed ?? 0;
            const fill = Math.min(1, Math.max(0, used / capacity));
            const tone = row.level ? levelTone(row.level) : 'neutral';
            const share = row.share;
            return (
              <span key={`${lane.kind}|${lane.name}`} className="relative block h-full bg-fg-subtle/20" style={{ flexGrow: capacity, flexBasis: 0 }} data-tip={`${lane.name}\n${money(capacity)}${share !== null ? `, ${t('{share} used', { share: fmtPct(share, 0) })}` : ''}`}>
                <span className={cx('absolute inset-y-0 start-0', TILE_FILL[tone])} style={{ width: `${fill * 100}%` }} />
              </span>
            );
          })}
          {wall !== null && wall > 0 && top.inside < scale ? <span className="block h-full" style={{ flexGrow: scale - top.inside, flexBasis: 0 }} /> : null}
        </div>
        {wall !== null && over ? <span className="absolute inset-y-1 end-0 bg-warn/25" style={{ insetInlineStart: `${wall * 100}%` }} aria-hidden /> : null}
        {wall !== null ? <span className="absolute inset-y-0 w-0.5 bg-fg" style={{ insetInlineStart: `calc(${wall * 100}% - 1px)` }} aria-hidden /> : null}
      </div>
      <p className="num text-[11px] text-fg-muted">
        {top.insideShare !== null
          ? t('Limits inside add up to {amount}: {share} of the limit around them.', { amount: money(top.inside), share: fmtPct(top.insideShare, 0) })
          : t('Limits inside add up to {amount}.', { amount: money(top.inside) })}{' '}
        {over ? t('They cannot all be used in full. The limit around them is reached first.') : null}
      </p>
    </div>
  );
}

interface LaneProps {
  board: LimitBoard;
  laneIndex: number;
  lane: LimitLane;
  shares: Float32Array;
  day: number | null;
  target: LimitTarget;
  focus: LimitFocus | null;
  highlight: Highlight | null;
  open: boolean;
  onOpen: (laneIndex: number, open: boolean) => void;
  choose: (target: LimitTarget) => void;
}

function Lane({ board, laneIndex, lane, shares, day, target, focus, highlight, open, onOpen, choose }: LaneProps) {
  const { top } = board;
  const title = laneTitle(lane, top);
  const selected = target.kind === 'lane' && target.index === laneIndex;
  const selectedUser = target.kind === 'user' ? target.index : -1;
  const members = open ? lane.members : lane.members.slice(0, SQUARES_SHOWN);
  // A search can reveal one hidden user without drawing every square of a large lane.
  if (!open && selectedUser >= 0 && lane.members.indexOf(selectedUser) >= SQUARES_SHOWN) members[SQUARES_SHOWN - 1] = selectedUser;
  const tabStop = Math.max(0, members.indexOf(selectedUser));
  const usedUp = lane.members.filter((userIndex) => levelOfShare(shares[userIndex]) === 'used-up').length;
  const own = lane.gauge;
  const wall = lane.reachedFirst === 'top' && own !== null && own.budget.consumed !== null && top.room !== null && own.budget.amount > 0 ? (own.budget.consumed + top.room) / own.budget.amount : null;
  return (
    <section data-anchor={`lane-${laneIndex}`} aria-label={title} className={cx('grid gap-x-5 gap-y-2 px-3 py-2.5 md:grid-cols-[15rem_minmax(0,1fr)]', selected && SELECTED_ROW)}>
      <button type="button" aria-pressed={selected} className="block min-h-11 w-full min-w-0 space-y-1 rounded-md text-start hover:bg-surface-2" onClick={() => choose({ kind: 'lane', index: laneIndex })}>
        <span className="eyebrow block text-fg-subtle"><WithIcon Icon={laneIcon(lane, top)}>{laneEyebrow(lane)}</WithIcon></span>
        <span className="block break-words text-sm font-semibold leading-snug">{title}</span>
        {own !== null ? (
          <>
            <Gauge share={own.share} level={own.level} wall={wall} />
            <LimitLine lane={lane} />
          </>
        ) : lane.kind !== 'top' ? (
          <span className="block text-[11px] text-fg-muted">
            {lane.limits.length > 0 ? t('Only alert budgets are set here. They do not stop usage.') : lane.kind === 'unclear' ? t('GitHub picks one seat organization each billing cycle.') : lane.countedByTop ? t('No spending limit of its own') : t('Its spending limit is set in the enterprise and is not in this file.')}
          </span>
        ) : null}
        {lane.kind !== 'unclear' && (lane.countedByTop || own !== null) ? (
          <span className="num block text-[11px] text-fg-muted">
            {own === null ? t('Room left in the limit around it: {amount}', { amount: roomText(lane.room) }) : `${t('Room left')}: ${roomText(lane.room)}`}
            {own !== null && lane.reachedFirst === 'top' ? ` (${t('the limit around it is reached first')})` : ''}
          </span>
        ) : null}
        {lane.perUser !== null ? (
          <span className="num block text-[11px] text-fg-subtle">
            <WithIcon Icon={KIND_ICONS[lane.perUser.kind]}>
              {t('Each person: {amount}', { amount: money(lane.perUser.budget.amount) })} · {kindLabel(lane.perUser.kind)}
              {lane.poolCapped ? ` · ${t('Own included credits only')}` : ''}
            </WithIcon>
          </span>
        ) : null}
      </button>
      <div className="min-w-0 space-y-1.5">
        <p className="num text-[11px] text-fg-muted">
          {lane.members.length === 0 ? t('No users this month') : usersText(lane.members.length)}
          {usedUp > 0 ? ` · ${t('{n} reached their user limit', { n: usedUp })}` : ''}
        </p>
        {members.length > 0 ? (
          <div role="group" aria-label={t('Users of {group}', { group: title })} className="flex flex-wrap gap-2" onKeyDown={moveFocus}>
            {members.map((userIndex, position) => {
              const user = board.users[userIndex];
              const share = shares[userIndex];
              const level = levelOfShare(share);
              const dimmed =
                (focus !== null && !focus.users.has(userIndex)) ||
                (highlight !== null && (highlight.by === 'level' ? level !== highlight.value : user.kind !== highlight.value));
              const tip = userTip(board, userIndex, day);
              return (
                <button
                  key={userIndex}
                  type="button"
                  data-square
                  data-anchor={`user-${userIndex}`}
                  data-tip={tip}
                  aria-label={tip.replaceAll('\n', ', ')}
                  aria-pressed={userIndex === selectedUser}
                  tabIndex={position === tabStop ? 0 : -1}
                  className={cx('relative size-4 shrink-0 overflow-hidden rounded-[2px] bg-surface-3', SQUARE_BORDER[user.kind], dimmed && 'opacity-25', userIndex === selectedUser && SELECTED_SQUARE)}
                  onClick={() => choose({ kind: 'user', index: userIndex })}
                >
                  {level !== null ? <span className={cx('absolute inset-x-0 bottom-0', TILE_FILL[levelTone(level)])} style={{ height: `${Math.min(1, Math.max(0, share)) * 100}%` }} aria-hidden /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
        {lane.members.length > SQUARES_SHOWN ? (
          <button type="button" className="btn btn-sm" aria-expanded={open} onClick={() => onOpen(laneIndex, !open)}>
            {open ? t('Show fewer') : t('Show all {n}', { n: fmtInt(lane.members.length) })}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export interface BoardProps {
  board: LimitBoard;
  shares: Float32Array;
  day: number | null;
  target: LimitTarget;
  focus: LimitFocus | null;
  highlight: Highlight | null;
  openLanes: ReadonlySet<number>;
  onOpenLane: (laneIndex: number, open: boolean) => void;
  choose: (target: LimitTarget) => void;
}

/** The outer limit is a frame around everything. Each row inside is the spending limit those people's billed usage checks. */
export const Board = memo(function Board({ board, shares, day, target, focus, highlight, openLanes, onOpenLane, choose }: BoardProps) {
  const { top } = board;
  const border = top.wall === null ? 'border-dashed border-border' : FRAME_BORDER[top.wall.level ?? 'low'];
  const lanesWhere = (countedByTop: boolean) =>
    board.lanes.flatMap((lane, laneIndex) =>
      lane.countedByTop === countedByTop
        ? [
            <Lane
              key={`${lane.kind}|${lane.name}`}
              board={board}
              laneIndex={laneIndex}
              lane={lane}
              shares={shares}
              day={day}
              target={target}
              focus={focus}
              highlight={highlight}
              open={openLanes.has(laneIndex)}
              onOpen={onOpenLane}
              choose={choose}
            />,
          ]
        : [],
    );
  const inside = lanesWhere(true);
  const outside = lanesWhere(false);
  return (
    <>
      <div className={cx('relative mt-2.5 rounded-lg border-2', border)}>
        <span className="eyebrow absolute -top-2.5 start-3 bg-surface px-1.5 text-fg-muted"><WithIcon Icon={topIcon(top)}>{topLabel(top)}</WithIcon></span>
        <TopHeader board={board} selected={target.kind === 'top'} choose={choose} />
        <InsideStrip top={top} lanes={board.lanes} />
        <div className="divide-y divide-border-muted border-t border-border-muted">
          {inside}
          {inside.length === 0 ? <p className="px-3 py-2.5 text-xs text-fg-muted">{t('No users here.')}</p> : null}
        </div>
      </div>
      {outside.length > 0 ? (
        <div className="relative mt-5 rounded-lg border-2 border-dashed border-border">
          <span className="eyebrow absolute -top-2.5 start-3 bg-surface px-1.5 text-fg-muted">{t('Outside the organization limit')}</span>
          <p className="px-3 pb-2 pt-4 text-[11px] text-fg-muted">{t('GitHub bills the usage of these users to cost centers of the enterprise, so the organization limit does not count it.')}</p>
          <div className="divide-y divide-border-muted border-t border-border-muted">{outside}</div>
        </div>
      ) : null}
    </>
  );
});
