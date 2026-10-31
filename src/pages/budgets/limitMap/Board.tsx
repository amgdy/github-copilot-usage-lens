import { memo, type KeyboardEvent } from 'react';
import { cx } from '../../../components/ui';
import { msg, t, tp } from '../../../i18n';
import { usedOnDay, type LimitBoard, type LimitFocus, type LimitGroup, type LimitPlace, type LimitTarget, type PlaceScope } from '../../../lib/collection';
import { fmtInt, fmtPct, fmtUSD } from '../../../lib/utils/format';
import { levelTone } from '../levels';
import { INK, Panes, SCOPE_NAMES, Step, TILE_FILL, groupKindLabel, groupTitle, levelOfShare, usersText, type Highlight } from './parts';

/** Places shown before "Show all". */
export const PLACES_SHOWN = 12;
/** User glasses shown in a group before "Show all". */
export const TILES_SHOWN = 300;

const PLACE_ROWS: { scope: Exclude<PlaceScope, 'enterprise'>; label: string }[] = [
  { scope: 'cost_center', label: msg('Cost centers') },
  { scope: 'organization', label: msg('Organizations') },
  { scope: 'repository', label: msg('Repositories') },
];

const SELECTED = 'ring-2 ring-accent ring-offset-2 ring-offset-surface';
const DIMMED = 'opacity-35';

/** The text of a place for its label and tooltip: its name, then how full its fullest limit is. */
export function placeTip(place: LimitPlace): string {
  const amount = fmtUSD(place.gauge.budget.amount, 0);
  const detail = place.gauge.share === null ? amount : t('{share} of {amount}', { share: fmtPct(place.gauge.share, 0), amount });
  return `${place.name}\n${detail}`;
}

/** The text of a user for its label and tooltip: the login, then the amount used of their limit. */
export function userTip(board: LimitBoard, userIndex: number, day: number | null): string {
  const user = board.users[userIndex];
  const used = fmtUSD(usedOnDay(board, userIndex, day), 2);
  return `${user.login}\n${user.limit !== null ? t('{used} of {limit}', { used, limit: fmtUSD(user.limit, 0) }) : t('{used}, no limit', { used })}`;
}

const labelOf = (tip: string): string => tip.replace('\n', ', ');

/** A step of the order GitHub checks, with what it is. */
function TierLabel({ step, text, active }: { step: number; text: string; active: boolean }) {
  return (
    <p className="mb-2 flex items-center gap-2">
      <Step step={step} active={active} />
      <span className={cx('eyebrow', active ? 'text-accent' : 'text-fg-subtle')}>{text}</span>
    </p>
  );
}

/** The line between two steps. While a selection is shown, its dashes flow up, the way GitHub checks the limits. */
function Spine({ height, active }: { height: string; active: boolean }) {
  if (!active) return <div className={cx('mx-auto w-px border-s', height, INK)} aria-hidden />;
  return (
    <svg className={cx('mx-auto block w-1 overflow-visible', height)} aria-hidden>
      <line x1="50%" y1="100%" x2="50%" y2="0" className="anim-path-flow stroke-accent" strokeWidth={2} strokeLinecap="round" strokeDasharray="6 5" />
    </svg>
  );
}

/** The step that holds a group or glass in the selection, at its top corner. The top has its own row, so it needs none. */
function HeldMark({ step }: { step: number }) {
  return (
    <span className="pointer-events-none absolute -start-2 -top-2 z-10" aria-hidden>
      <Step step={step} active />
    </span>
  );
}

/** Moves the focus between the user glasses of a group with the arrow keys, Home and End. */
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  const tiles = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-tile]')];
  const current = tiles.indexOf(document.activeElement as HTMLButtonElement);
  if (current < 0) return;
  event.preventDefault();
  const rightToLeft = getComputedStyle(event.currentTarget).direction === 'rtl';
  let next = current;
  if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = tiles.length - 1;
  else if (event.key === 'ArrowRight') next = current + (rightToLeft ? -1 : 1);
  else if (event.key === 'ArrowLeft') next = current + (rightToLeft ? 1 : -1);
  else {
    // Up and down go to the nearest glass in the row above or below.
    const from = tiles[current].getBoundingClientRect();
    const down = event.key === 'ArrowDown';
    let bestScore = Number.POSITIVE_INFINITY;
    tiles.forEach((tile, position) => {
      const rect = tile.getBoundingClientRect();
      const rowGap = down ? rect.top - from.top : from.top - rect.top;
      if (rowGap < 2) return;
      const score = rowGap * 1000 + Math.abs(rect.left - from.left);
      if (score < bestScore) {
        bestScore = score;
        next = position;
      }
    });
  }
  tiles[Math.max(0, Math.min(tiles.length - 1, next))]?.focus();
}

interface GroupProps {
  board: LimitBoard;
  groupIndex: number;
  group: LimitGroup;
  shares: Float32Array;
  day: number | null;
  target: LimitTarget;
  focus: LimitFocus | null;
  highlight: Highlight | null;
  open: boolean;
  onOpen: (groupIndex: number, open: boolean) => void;
  choose: (target: LimitTarget) => void;
}

function GroupPanel({ board, groupIndex, group, shares, day, target, focus, highlight, open, onOpen, choose }: GroupProps) {
  const selectedUser = target.kind === 'user' ? target.index : -1;
  const selectedAt = selectedUser >= 0 ? group.members.indexOf(selectedUser) : -1;
  const showAll = open || selectedAt >= TILES_SHOWN;
  const members = showAll ? group.members : group.members.slice(0, TILES_SHOWN);
  const selected = target.kind === 'group' && target.index === groupIndex;
  const held = focus !== null && focus.groups.has(groupIndex);
  const dimmed = focus !== null && !held;
  const tabStop = Math.max(0, selectedAt);
  const amount = group.perUser !== null ? t('{amount} each', { amount: fmtUSD(group.perUser.amount, 0) }) : null;
  return (
    <section
      data-anchor={`group-${groupIndex}`}
      className={cx(
        'relative min-w-0 rounded-md border bg-surface p-2.5 transition-opacity',
        group.kind === 'none' ? 'border-dashed border-warn/70' : 'border-border',
        selected && SELECTED,
      )}
      style={{ flexGrow: Math.max(1, Math.sqrt(group.members.length)), flexBasis: '13rem' }}
      aria-label={groupTitle(group)}
    >
      {held ? <HeldMark step={1} /> : null}
      <button type="button" className={cx('block w-full min-w-0 text-start transition-opacity', dimmed && DIMMED)} aria-pressed={selected} onClick={() => choose({ kind: 'group', index: groupIndex })}>
        <span className="eyebrow block text-fg-subtle">{groupKindLabel(group.kind)}</span>
        <span className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-semibold" title={groupTitle(group)}>
            {groupTitle(group)}
          </span>
          {amount ? <span className="num shrink-0 text-xs font-medium">{amount}</span> : null}
        </span>
      </button>
      <div role="group" aria-label={t('Users of {group}', { group: groupTitle(group) })} className="mt-2 flex flex-wrap gap-[3px]" onKeyDown={moveFocus}>
        {members.map((userIndex, position) => {
          const share = shares[userIndex];
          const level = levelOfShare(share);
          const fill = level === null ? 0 : Math.min(1, Math.max(0, share));
          const isSelected = userIndex === selectedUser;
          const tileDimmed = (focus !== null && !focus.users.has(userIndex)) || (highlight !== null && (level ?? 'none') !== highlight);
          const tip = userTip(board, userIndex, day);
          return (
            <button
              key={userIndex}
              type="button"
              data-tile
              data-anchor={`user-${userIndex}`}
              data-tip={tip}
              aria-label={labelOf(tip)}
              aria-pressed={isSelected}
              tabIndex={position === tabStop ? 0 : -1}
              className={cx(
                'relative h-[18px] w-3 shrink-0 overflow-hidden border bg-surface transition-opacity focus-visible:z-10',
                level === null ? 'border-dashed border-fg-subtle/60' : level === 'used-up' ? 'border-bad' : 'border-fg-subtle/60',
                tileDimmed && 'opacity-25',
                isSelected && cx('z-10', SELECTED),
              )}
              onClick={() => choose({ kind: 'user', index: userIndex })}
            >
              {fill > 0 && level !== null ? (
                <span className={cx('absolute inset-x-0 bottom-0 transition-[height] duration-300 motion-reduce:transition-none', TILE_FILL[levelTone(level)])} style={{ height: `${fill * 100}%` }} />
              ) : null}
            </button>
          );
        })}
      </div>
      {group.members.length > TILES_SHOWN && selectedAt < TILES_SHOWN ? (
        <button type="button" className="btn btn-sm mt-2" onClick={() => onOpen(groupIndex, !open)}>
          {open ? t('Show fewer') : t('Show all {n}', { n: fmtInt(group.members.length) })}
        </button>
      ) : null}
      <p className={cx('num mt-2 text-[11px] transition-opacity', group.usedUp > 0 ? 'text-bad' : 'text-fg-subtle', dimmed && DIMMED)}>
        {group.kind === 'none'
          ? usersText(group.members.length)
          : tp(group.members.length, '1 user, {usedUp} used up', '{n} users, {usedUp} used up', { n: fmtInt(group.members.length), usedUp: fmtInt(group.usedUp) })}
      </p>
    </section>
  );
}

interface PlaceProps {
  place: LimitPlace;
  placeIndex: number;
  target: LimitTarget;
  focus: LimitFocus | null;
  highlight: Highlight | null;
  choose: (target: LimitTarget) => void;
}

function PlaceGlass({ place, placeIndex, target, focus, highlight, choose }: PlaceProps) {
  const selected = target.kind === 'place' && target.index === placeIndex;
  const held = focus !== null && focus.places.has(placeIndex);
  const dimmed = (focus !== null && !held) || (highlight !== null && (place.gauge.level ?? 'none') !== highlight);
  const tip = placeTip(place);
  return (
    <button
      type="button"
      data-anchor={`place-${placeIndex}`}
      data-tip={tip}
      aria-label={`${t(SCOPE_NAMES[place.scope])}: ${labelOf(tip)}`}
      aria-pressed={selected}
      className={cx('relative flex w-28 flex-col items-stretch rounded-[4px] bg-surface px-1 pb-3 pt-1 text-center transition-opacity hover:bg-surface-2', dimmed && DIMMED, selected && SELECTED)}
      onClick={() => choose({ kind: 'place', index: placeIndex })}
    >
      {held ? <HeldMark step={3} /> : null}
      <Panes rows={place.limits} className="h-20" />
      <span className="mt-1.5 line-clamp-2 break-words text-xs font-semibold">{place.name}</span>
      <span className="num text-[11px] text-fg-muted">{place.limits.map((row) => fmtUSD(row.budget.amount, 0)).join(' · ')}</span>
    </button>
  );
}

export interface BoardProps {
  board: LimitBoard;
  shares: Float32Array;
  day: number | null;
  target: LimitTarget;
  focus: LimitFocus | null;
  highlight: Highlight | null;
  allPlaces: boolean;
  onAllPlaces: (all: boolean) => void;
  openGroups: ReadonlySet<number>;
  onOpenGroup: (groupIndex: number, open: boolean) => void;
  choose: (target: LimitTarget) => void;
}

/**
 * The limits as a pyramid, read from the bottom up in the order GitHub checks them: each user in the group of the
 * limit that holds them, then the included credits, then the spending limits of cost centers, organizations and
 * repositories, and the spending limit of the enterprise at the top.
 */
export const Board = memo(function Board({ board, shares, day, target, focus, highlight, allPlaces, onAllPlaces, openGroups, onOpenGroup, choose }: BoardProps) {
  const top = board.top >= 0 ? board.places[board.top] : null;
  const topLabel = board.topScope === 'enterprise' ? t('Enterprise account') : t('Organization');
  const topSelected = target.kind === 'place' && target.index === board.top;
  const topDimmed = top !== null && highlight !== null && (top.gauge.level ?? 'none') !== highlight;
  // The selection is traced up the map; the top holds everyone, so selecting it lights only its own step.
  const tracing = focus !== null || topSelected;
  const topHeld = topSelected || (focus !== null && focus.places.has(board.top));

  const lower = board.places.flatMap((place, placeIndex) => (place.top ? [] : [placeIndex]));
  const lowerHeld = focus !== null && lower.some((placeIndex) => focus.places.has(placeIndex));
  const hiddenInFocus = focus !== null && lower.slice(PLACES_SHOWN).some((placeIndex) => focus.places.has(placeIndex));
  const shownPlaces = allPlaces || hiddenInFocus ? lower : lower.slice(0, PLACES_SHOWN);
  const rows = PLACE_ROWS.map((row) => ({ ...row, places: shownPlaces.filter((placeIndex) => board.places[placeIndex].scope === row.scope) })).filter((row) => row.places.length > 0);

  return (
    <div className="space-y-0">
      <div className="mx-auto w-full max-w-sm">
        <TierLabel step={4} text={board.topScope === 'enterprise' ? t('Spending limit of the enterprise') : t('Spending limit of the organization')} active={topHeld} />
        {top !== null ? (
          <button
            type="button"
            data-anchor="top"
            data-tip={placeTip(top)}
            aria-label={`${topLabel}: ${labelOf(placeTip(top))}`}
            aria-pressed={topSelected}
            className={cx('block w-full rounded-[4px] border bg-surface p-3 text-center transition-opacity hover:bg-surface-2', INK, topDimmed && DIMMED, topSelected && SELECTED)}
            onClick={() => choose({ kind: 'place', index: board.top })}
          >
            <span className="eyebrow block text-fg-subtle">{topLabel}</span>
            <span className="block truncate font-display text-base font-semibold">{board.topName || topLabel}</span>
            <Panes rows={top.limits} className="mt-2 h-24" size="base" />
            <span className="mt-1.5 flex justify-center gap-4 text-[11px] text-fg-muted">
              {top.limits.map((row) => (
                <span key={row.budget.id} className="num">
                  {fmtUSD(row.budget.amount, 0)} · {row.budget.stopsUsage ? t('Stops usage') : t('Alerts only')}
                </span>
              ))}
            </span>
          </button>
        ) : (
          <div data-anchor="top" className="rounded-[4px] border border-dashed border-warn/70 bg-surface p-3 text-center">
            <span className="eyebrow block text-fg-subtle">{topLabel}</span>
            <span className="block truncate font-display text-base font-semibold">{board.topName || topLabel}</span>
            <p className="mt-1 text-xs text-warn">{t('No spending limit at the top. Nothing caps the amount billed for all users.')}</p>
          </div>
        )}
      </div>

      <Spine height="h-8" active={tracing} />

      <div className="mx-auto w-full max-w-3xl">
        <TierLabel step={3} text={t('Spending limits of cost centers, organizations and repositories')} active={lowerHeld} />
        {rows.length > 0 ? (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.scope}>
                <p className="mb-1 text-center text-[11px] font-medium text-fg-subtle">{t(row.label)}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {row.places.map((placeIndex) => (
                    <PlaceGlass key={placeIndex} place={board.places[placeIndex]} placeIndex={placeIndex} target={target} focus={focus} highlight={highlight} choose={choose} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-fg-muted">{t('No limits for cost centers, organizations or repositories.')}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {board.costCentersWithoutLimit > 0 ? (
            <p className="text-center text-xs text-fg-muted">
              {tp(board.costCentersWithoutLimit, '1 cost center has no limit of its own.', '{n} cost centers have no limit of their own.', { n: fmtInt(board.costCentersWithoutLimit) })}
            </p>
          ) : null}
          {lower.length > PLACES_SHOWN && !hiddenInFocus ? (
            <button type="button" className="btn btn-sm" onClick={() => onAllPlaces(!allPlaces)}>
              {allPlaces ? t('Show fewer') : t('Show all {n}', { n: fmtInt(lower.length) })}
            </button>
          ) : null}
        </div>
      </div>

      <Spine height="h-6" active={tracing} />

      <div data-anchor="credits" className="border-y border-dashed border-info/60 px-3 py-2 text-center">
        <p className="inline-flex max-w-full flex-col items-center bg-surface px-2">
          <span className="flex items-center gap-2">
            <Step step={2} active={tracing} />
            <span className="eyebrow text-info">{t('Included credits')}</span>
          </span>
          <span className="mt-0.5 text-xs text-fg-muted">{t('Included credits pay first. The spending limits above count only the amount billed.')}</span>
        </p>
      </div>

      <Spine height="h-6" active={tracing} />

      <div>
        <TierLabel step={1} text={t('Limit of each user')} active={focus !== null && focus.groups.size > 0} />
        {board.groups.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {board.groups.map((group, groupIndex) => (
              <GroupPanel
                key={`${group.kind}|${group.name}`}
                board={board}
                groupIndex={groupIndex}
                group={group}
                shares={shares}
                day={day}
                target={target}
                focus={focus}
                highlight={highlight}
                open={openGroups.has(groupIndex)}
                onOpen={onOpenGroup}
                choose={choose}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-fg-muted">{t('No users with usage this month or listed by GitHub.')}</p>
        )}
      </div>
    </div>
  );
});
